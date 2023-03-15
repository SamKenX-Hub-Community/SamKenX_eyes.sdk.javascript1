import type {ECCapabilities, ECClient, ECClientSettings} from './types'
import {type AddressInfo} from 'net'
import {type AbortSignal} from 'abort-controller'
import {createServer, type IncomingMessage, type ServerResponse} from 'http'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeQueue, type Queue} from './queue'
import {makeTunnelManager, type Tunnel} from './tunnels/manager'
import {makeTunnelManagerClient} from './tunnels/manager-client'
import {makeReqProxy} from './req-proxy'
import * as utils from '@applitools/utils'

const RETRY_BACKOFF = [
  ...Array(5).fill(2000), // 5 tries with delay 2s (total 10s)
  ...Array(4).fill(5000), // 4 tries with delay 5s (total 20s)
  10000, // all next tries with delay 10s
]

const RETRY_ERROR_CODES = ['CONCURRENCY_LIMIT_REACHED', 'NO_AVAILABLE_DRIVER_POD']

interface Session {
  credentials: {
    eyesServerUrl: string
    apiKey: string
  }
  tunnels?: Tunnel[]
  metadata?: any[]
}

export async function makeServer({settings, logger}: {settings: ECClientSettings; logger?: Logger}): Promise<ECClient> {
  const serverLogger = logger ? logger.extend({label: 'ec-client'}) : makeLogger({label: 'ec-client', colors: true})

  const req = makeReqProxy({
    targetUrl: settings.serverUrl,
    proxy: settings.proxy,
    retry: {
      validate: async ({response, error}) => {
        if (error) return !utils.types.instanceOf(error, 'AbortError')
        if (response) return response.status >= 500 && !utils.types.has(await response.clone().json(), 'value')
        return false
      },
      limit: 10,
      timeout: 5000,
    },
  })

  const tunnelManager = settings.tunnel?.serverUrl
    ? await makeTunnelManager({settings: settings.tunnel, logger: serverLogger})
    : await makeTunnelManagerClient({settings: settings.tunnel})

  const sessions = new Map<string, Session>()
  const queues = new Map<string, Queue>()

  const server = createServer(async (request, response) => {
    const url = request.url as string
    const requestLogger = serverLogger.extend({
      tags: {request: `[${request.method}] ${request.url}`, requestId: utils.general.guid()},
    })

    try {
      if (request.method === 'POST' && /^\/session\/?$/.test(url)) {
        return await createSession({request, response, logger: requestLogger})
      } else if (request.method === 'DELETE' && /^\/session\/[^\/]+\/?$/.test(url)) {
        return await deleteSession({request, response, logger: requestLogger})
      } else if (request.method === 'POST' && /^\/session\/[^\/]+\/element\/?$/.test(url)) {
        requestLogger.log('Inspecting element lookup request to collect self-healing metadata')
        const proxyResponse = await req(url, {io: {request, response, handle: false}, logger: requestLogger})
        const responseBody = await proxyResponse.json()
        if (responseBody?.appliCustomData?.selfHealing?.successfulSelector) {
          requestLogger.log('Self-healed locators detected', responseBody.appliCustomData.selfHealing)
          const session = sessions.get(getSessionId(url))!
          session.metadata ??= []
          session.metadata.push(responseBody.appliCustomData.selfHealing)
        } else {
          requestLogger.log('No self-healing metadata found')
        }
        response
          .writeHead(proxyResponse.status, Object.fromEntries(proxyResponse.headers.entries()))
          .end(JSON.stringify(responseBody))
      } else if (request.method === 'GET' && /^\/session\/[^\/]+\/applitools\/metadata?$/.test(url)) {
        const session = sessions.get(getSessionId(url))!
        requestLogger.log('Session metadata requested, returning', session.metadata)
        response.writeHead(200).end(JSON.stringify({value: session.metadata ?? []}))
        session.metadata = []
      } else {
        requestLogger.log('Passthrough request')
        return await req(url, {io: {request, response}, logger: requestLogger})
      }
    } catch (err: any) {
      requestLogger.error(`Error during processing request:`, err)
      if (!response.writableEnded) {
        response
          .writeHead(500)
          .end(JSON.stringify({value: {error: 'internal proxy server error', message: err.message, stacktrace: ''}}))
      }
    } finally {
      requestLogger.log(`Request was responded with status ${response.statusCode}`)
    }
  })

  server.listen({port: settings.port ?? 0, hostname: 'localhost'})

  return new Promise<ECClient>((resolve, reject) => {
    server.on('listening', () => {
      const address = server.address() as AddressInfo
      serverLogger.log(`Proxy server has started on port ${address.port}`)
      resolve({
        url: `http://localhost:${address.port}`,
        port: address.port,
        unref: () => server.unref(),
        close: () => server.close(),
      })
    })
    server.on('error', async (err: Error) => {
      serverLogger.fatal('Error starting proxy server', err)
      reject(err)
    })
  })

  async function createSession({
    request,
    response,
    logger,
  }: {
    request: IncomingMessage
    response: ServerResponse
    logger: Logger
  }): Promise<void> {
    const requestBody = await utils.streams.toJSON(request)

    logger.log(`Request was intercepted with body:`, requestBody)

    const capabilities: Record<string, any> = requestBody.capabilities?.alwaysMatch ?? requestBody.desiredCapabilities

    const options = {
      ...settings.capabilities,
      ...capabilities?.['applitools:options'],
      ...(capabilities &&
        Object.entries(capabilities).reduce((capabilities, [key, value]) => {
          if (key.startsWith('applitools:')) {
            capabilities[key.replace(/^applitools:/, '') as keyof ECCapabilities] = value
          }
          return capabilities
        }, {} as ECCapabilities)),
    }

    const session = {
      credentials: {eyesServerUrl: options.eyesServerUrl, apiKey: options.apiKey},
    } as Session
    if (options.tunnel) {
      session.tunnels = await tunnelManager.acquire(session.credentials)
      session.tunnels.forEach((tunnel, index) => {
        options[`x-tunnel-id-${index}`] = tunnel.tunnelId
      })
    }

    const applitoolsCapabilities = Object.fromEntries(
      Object.entries(options).map(([key, value]) => [`applitools:${key}`, value]),
    )

    if (requestBody.capabilities) {
      requestBody.capabilities.alwaysMatch = {...requestBody.capabilities?.alwaysMatch, ...applitoolsCapabilities}
    }
    if (requestBody.desiredCapabilities) {
      requestBody.desiredCapabilities = {...requestBody.desiredCapabilities, ...applitoolsCapabilities}
    }

    logger.log('Request body has modified:', requestBody)

    const queueKey = JSON.stringify(session.credentials)
    let queue = queues.get(queueKey)!
    if (!queue) {
      queue = makeQueue({logger: logger.extend({tags: {queue: queueKey}})})
      queues.set(queueKey, queue)
    }

    request.socket.on('close', () => queue.cancel(task))

    await queue.run(task)

    async function task(signal: AbortSignal, attempt = 1): Promise<void> {
      // do not start the task if it is already aborted
      if (signal.aborted) return

      const proxyResponse = await req(request.url as string, {
        body: requestBody,
        io: {request, response, handle: false},
        // TODO uncomment when we can throw different abort reasons for task cancelation and timeout abortion
        // signal,
        logger,
      })

      const responseBody = await proxyResponse.json()

      logger.log(`Response was intercepted with body:`, responseBody)

      if (RETRY_ERROR_CODES.includes(responseBody.value?.data?.appliErrorCode)) {
        queue.cork()
        // after query is corked the task might be aborted
        if (signal.aborted) return
        await utils.general.sleep(RETRY_BACKOFF[Math.min(attempt, RETRY_BACKOFF.length - 1)])
        logger.log(
          `Attempt (${attempt}) to create session was failed with applitools status code:`,
          responseBody.value.data.appliErrorCode,
        )
        return task(signal, attempt + 1)
      } else {
        queue.uncork()
        if (responseBody.value) {
          sessions.set(responseBody.value.sessionId, session)
          responseBody.value.capabilities ??= {}
          responseBody.value.capabilities['applitools:isECClient'] = true
          if (proxyResponse.headers.has('content-length')) {
            proxyResponse.headers.set('content-length', Buffer.byteLength(JSON.stringify(responseBody)).toString())
          }
        }
        response
          .writeHead(proxyResponse.status, Object.fromEntries(proxyResponse.headers.entries()))
          .end(JSON.stringify(responseBody))
        return
      }
    }
  }

  async function deleteSession({
    request,
    response,
    logger,
  }: {
    request: IncomingMessage
    response: ServerResponse
    logger: Logger
  }): Promise<void> {
    const url = request.url as string
    const sessionId = getSessionId(url)
    logger.log(`Request was intercepted with sessionId:`, sessionId)

    await req(url, {io: {request, response}, logger})

    const session = sessions.get(sessionId)!
    if (session.tunnels) {
      await tunnelManager.release(session.tunnels)
      logger.log(
        `Tunnels with id ${session.tunnels.map(
          tunnel => tunnel.tunnelId,
        )} was released for session with id ${sessionId}`,
      )
    }
    sessions.delete(sessionId)
  }
}

function getSessionId(requestUrl: string): string {
  return requestUrl?.split('/')[2] ?? ''
}
