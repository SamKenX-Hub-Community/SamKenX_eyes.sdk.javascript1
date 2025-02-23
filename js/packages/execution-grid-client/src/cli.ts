#!/usr/bin/env node

import type {ECClientSettings} from './types'
import yargs from 'yargs'
import {makeECClient} from './client'
import {makeTunnelManagerServer} from './tunnels/manager-server'

yargs
  .command<ECClientSettings>({
    command: '*',
    builder: yargs => {
      return <any>yargs
        .example([
          ['ec-client', 'Run EG client server on random port'],
          ['ec-client --port 8080', 'Run EG client server on port 8080'],
        ])
        .options({
          port: {
            description: 'run server on a specific port.',
            alias: 'p',
            type: 'number',
          },
          tunnelUrl: {
            description: 'run server with specific eg tunnel url.',
            alias: 'egTunnelUrl',
            type: 'string',
          },
          'proxy.url': {
            description: 'run server with specific proxy url.',
            alias: 'proxyUrl',
            type: 'string',
          },
          'proxy.username': {
            description: 'run server with specific proxy url username.',
            type: 'string',
          },
          'proxy.password': {
            description: 'run server with specific proxy url password.',
            type: 'string',
          },
          'capabilities.serverUrl': {
            description: 'run server with specific default eyes server url.',
            alias: 'eyesServerUrl',
            type: 'string',
          },
          'capabilities.apiKey': {
            description: 'run server with specific default api key.',
            alias: 'apiKey',
            type: 'string',
          },
          'capabilities.timeout': {
            description: 'run server with specific default eg timeout.',
            alias: ['egTimeout', 'timeout'],
            type: 'number',
          },
          'capabilities.inactivityTimeout': {
            description: 'run server with specific default eg inactivity timeout.',
            alias: ['egInactivityTimeout', 'inactivityTimeout'],
            type: 'number',
          },
        })
    },
    handler: async settings => {
      const client = await makeECClient({settings})
      /* eslint-disable-next-line */
      console.log(client.url)
    },
  })
  .command({
    command: 'tunnel-manager',
    builder: yargs =>
      yargs
        .example([
          [
            'tunnel-manager --config {"path": "/tmp/tunnel-manager.sock"}',
            'Run tunnel manager on path /tmp/tunnel-manager.sock (for unix)',
          ],
          [
            'tunnel-manager --config {"path": "\\\\.\\pipe\\tunnel-manager"}',
            'Run tunnel manager on path \\\\.\\pipe\\tunnel-manager (for windows)',
          ],
        ])
        .options({
          config: {
            description: 'json string with config',
            type: 'string',
            coerce: JSON.parse,
          },
        }),
    handler: async ({config}) => {
      await makeTunnelManagerServer(config)
    },
  })
  .wrap(yargs.terminalWidth()).argv
