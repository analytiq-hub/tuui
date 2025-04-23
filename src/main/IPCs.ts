import { ipcMain, shell, IpcMainEvent, dialog } from 'electron'
import Constants from './utils/Constants'
import { Client, capabilitySchemas } from './mcp/types'
import { readFileSync, writeFileSync } from 'fs'

import { manageRequests } from './mcp/client'
import { initClient } from './mcp/init'

// Track registered handler names for cleanup
const registeredHandlers = new Set<string>()

/*
 * IPC Communications
 * */
export default class IPCs {
  static initialize(): void {
    // Get application version
    ipcMain.handle('msgRequestGetVersion', () => {
      return Constants.APP_VERSION
    })

    // Open url via web browser
    ipcMain.on('msgOpenExternalLink', async (event: IpcMainEvent, url: string) => {
      await shell.openExternal(url)
    })

    // Open file
    ipcMain.handle('msgOpenFile', async (event: IpcMainEvent, filter: string) => {
      const filters = []
      if (filter === 'text') {
        filters.push({ name: 'Text', extensions: ['txt', 'json'] })
      } else if (filter === 'zip') {
        filters.push({ name: 'Zip', extensions: ['zip'] })
      }
      const dialogResult = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters
      })
      return dialogResult
    })

    // Get config file content
    ipcMain.handle('getConfigFile', () => {
      try {
        const configContent = readFileSync(Constants.ASSETS_PATH.config, 'utf8')
        return configContent
      } catch (error) {
        console.error('Error reading config file:', error)
        return null
      }
    })

    // Update config file content
    ipcMain.handle('updateConfigFile', (event, content) => {
      try {
        writeFileSync(Constants.ASSETS_PATH.config, content, 'utf8')
        return { success: true }
      } catch (error) {
        console.error('Error updating config file:', error)
        return { success: false, error: String(error) }
      }
    })

    // Update config file content and reload MCP servers
    ipcMain.handle('reloadMcpServers', async () => {
      try {
        // Remove existing handlers
        clearRegisteredHandlers()

        // Reinitialize MCP clients
        const clients = await initClient()

        // Re-register IPC handlers for the new clients
        const features = clients.map(({ name, client, capabilities }) => {
          console.log('Reloaded capabilities:', name, '\n', capabilities)
          return registerIpcHandlers(name, client, capabilities)
        })

        // Update the exposed API
        IPCs.initializeMCP(features)

        return { success: true }
      } catch (error) {
        console.error('Error reloading MCP servers:', error)
        return { success: false, error: String(error) }
      }
    })
  }

  static initializeMCP(features): void {
    // Clear previous handler if it exists
    if (registeredHandlers.has('list-clients')) {
      ipcMain.removeHandler('list-clients')
      registeredHandlers.delete('list-clients')
    }

    ipcMain.handle('list-clients', () => {
      return features
    })
    registeredHandlers.add('list-clients')
  }
}

// Helper function to clear all registered handlers
function clearRegisteredHandlers() {
  for (const handlerName of registeredHandlers) {
    console.log(`Removing handler: ${handlerName}`)
    ipcMain.removeHandler(handlerName)
  }
  registeredHandlers.clear()
}

export function registerIpcHandlers(
  name: string,
  client: Client,
  capabilities: Record<string, any> | undefined
) {
  const feature: { [key: string]: any } = { name }

  const registerHandler = (method: string, schema: any) => {
    const eventName = `${name}-${method}`
    console.log(`IPC Main ${eventName}`)

    // Remove existing handler if it exists
    if (registeredHandlers.has(eventName)) {
      ipcMain.removeHandler(eventName)
      registeredHandlers.delete(eventName)
    }

    ipcMain.handle(eventName, async (event, params) => {
      return await manageRequests(client, `${method}`, schema, params)
    })

    // Track this handler
    registeredHandlers.add(eventName)

    return eventName
  }

  for (const [type, actions] of Object.entries(capabilitySchemas)) {
    if (capabilities?.[type]) {
      feature[type] = {}
      for (const [action, schema] of Object.entries(actions)) {
        feature[type][action] = registerHandler(`${type}/${action}`, schema)
      }
    }
  }

  return feature
}
