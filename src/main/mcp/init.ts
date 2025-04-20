import { Client } from './types'
import { Notification } from 'electron'
import { initializeClient } from './client'
import { readConfig, ensureConfigExists } from './config'
import Constants from '../utils/Constants'

interface ClientObj {
  name: string
  client: Client
  capabilities: Record<string, any> | undefined
}

export async function initClient(): Promise<ClientObj[]> {
  // First, ensure config file exists by copying from template if necessary
  ensureConfigExists(Constants.ASSETS_PATH.config, Constants.ASSETS_PATH.configTemplate)
  
  const config = readConfig(Constants.ASSETS_PATH.config)
  if (config) {
    console.log('Config loaded:', config)

    try {
      const clients = await Promise.all(
        Object.entries(config.mcpServers).map(async ([name, serverConfig]) => {
          console.log(`Initializing client for ${name} with config:`, serverConfig)

          const timer = 60 // 60 seconds

          const timeoutPromise = new Promise<Client>((resolve, reject) => {
            setTimeout(() => {
              reject(
                new Error(`Initialization of client for ${name} timed out after ${timer} seconds`)
              )
            }, timer * 1000)
          })

          const client = await Promise.race([initializeClient(name, serverConfig), timeoutPromise])

          console.log(`${name} initialized.`)
          const capabilities = client.getServerCapabilities()
          return { name, client, capabilities }
        })
      )

      console.log('All clients initialized.')

      // new Notification({
      //   title: 'MCP Servers are ready',
      //   body: 'All Clients initialized.',
      // }).show();

      return clients
    } catch (error) {
      console.error('Error during client initialization:', error?.message)

      new Notification({
        title: 'Client initialization failed',
        body: 'Cannot start with current config, ' + error?.message
      }).show()

      process.exit(1)
    }
  } else {
    console.log('NO clients initialized.')

    return []
  }
}
