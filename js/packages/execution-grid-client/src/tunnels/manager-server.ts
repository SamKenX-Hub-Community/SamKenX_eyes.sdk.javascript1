import {createServer, type Server} from 'net'
import {makeLogger} from '@applitools/logger'
import {makeSocket, type Socket} from '@applitools/socket'
import {makeTunnelManager, type TunnelManagerSettings} from './manager'
import {fork} from 'child_process'
import {promises as fs} from 'fs'
import * as path from 'path'
import * as os from 'os'

const LOG_DIRNAME = process.env.APPLITOOLS_LOG_DIR ?? path.resolve(os.tmpdir(), `applitools-tunnel-logs`)

export type TunnelManagerServerOptions = {
  settings?: TunnelManagerSettings
  idleTimeout?: number
  path: string
  unlink?: boolean
}

export async function makeTunnelManagerServer({
  settings,
  path,
  unlink,
  idleTimeout = 600000, // 10min
}: TunnelManagerServerOptions) {
  if (unlink) await fs.unlink(path)
  const server = await new Promise<Server>((resolve, reject) => {
    const server = createServer().listen({path})
    server.on('error', error => reject(error))
    server.on('listening', () => resolve(server))
  })
  const logger = makeLogger({
    handler: {type: 'rolling file', name: 'ec-tunnel-manager', dirname: LOG_DIRNAME},
    label: 'ec-tunnel-manager',
    level: 'info',
    colors: false,
  })
  logger.log('Server is started')
  const manager = await makeTunnelManager({settings, logger})

  process.send?.({name: 'started', payload: {path}}) // NOTE: this is a part of the js specific protocol

  let idle: NodeJS.Timeout | null
  let serverClosed = false
  if (idleTimeout) idle = setTimeout(() => server.close(), idleTimeout)

  server.on('close', () => {
    if (idle) clearTimeout(idle)
    serverClosed = true
  })

  const sockets = new Set<Socket>()
  server.on('connection', client => {
    const socket = makeSocket(client, {transport: 'ipc', logger})
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))

    if (idle) {
      clearTimeout(idle)
      idle = null
      socket.on('close', () => {
        sockets.delete(socket)
        if (sockets.size > 0 || serverClosed) return
        idle = setTimeout(() => server.close(), idleTimeout)
      })
    }

    socket.command('Tunnel.create', manager.create)
    socket.command('Tunnel.destroy', manager.destroy)
    socket.command('Tunnel.acquire', manager.acquire)
    socket.command('Tunnel.release', manager.release)
  })
}

export async function makeTunnelManagerServerProcess(options: TunnelManagerServerOptions) {
  return new Promise((resolve, reject) => {
    const server = fork(
      path.resolve(__dirname, '../../dist/cli.js'),
      [`tunnel-manager`, `--config=${JSON.stringify(options)}`],
      {
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        detached: true,
      },
    )

    const timeout = setTimeout(() => {
      reject(new Error(`Server didn't respond for 10s after being started`))
      server.kill()
    }, 5000)

    server.on('error', reject)
    server.once('message', ({name}: {name: string}) => {
      if (name === 'started') {
        resolve({cleanup: () => server.kill()})
        clearTimeout(timeout)
        server.channel!.unref()
      }
    })

    server.unref()
  })
}
