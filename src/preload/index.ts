import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

// Whitelist of valid channels used for IPC communication (Send message from Renderer to Main)
const mainAvailChannels: string[] = [
  'msgRequestGetVersion', 
  'msgOpenExternalLink', 
  'msgOpenFile',
  'getConfigFile',
  'updateConfigFile'
]
const rendererAvailChannels: string[] = []

type AsyncFunction = (..._args: any[]) => Promise<any>

interface MCPAPI {
  [key: string]: {
    tools?: {
      list?: AsyncFunction
      call?: AsyncFunction
    }
    prompts?: {
      list?: AsyncFunction
      get?: AsyncFunction
    }
    resources?: {
      list?: AsyncFunction
      read?: AsyncFunction
    }
  }
}

interface CLIENT {
  name: string
  tools?: Record<string, string>
  prompts?: Record<string, string>
  resources?: Record<string, string>
}

contextBridge.exposeInMainWorld('mainApi', {
  send: (channel: string, ...data: any[]): void => {
    if (mainAvailChannels.includes(channel)) {
      ipcRenderer.send.apply(null, [channel, ...data])
      if (process.env.NODE_ENV === 'development') {
        console.log({ type: 'send', channel, request: data })
      }
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  on: (channel: string, listener: (_event: IpcRendererEvent, ..._args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.on(channel, listener)
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  once: (channel: string, listener: (_event: IpcRendererEvent, ..._args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.once(channel, listener)
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  off: (channel: string, listener: (_event: IpcRendererEvent, ..._args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.off(channel, listener)
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  invoke: async (channel: string, ...data: any[]): Promise<any> => {
    if (mainAvailChannels.includes(channel)) {
      const result = await ipcRenderer.invoke.apply(null, [channel, ...data])
      if (process.env.NODE_ENV === 'development') {
        console.log({ type: 'invoke', channel, request: data, result })
      }
      return result
    }

    throw new Error(`Unknown ipc channel name: ${channel}`)
  }
})

async function listClients(): Promise<CLIENT[]> {
  return await ipcRenderer.invoke('list-clients')
}

async function exposeAPIs() {
  const clients = await listClients()
  const api: MCPAPI = {}

  const createAPIMethods = (methods: Record<string, string>) => {
    const result: Record<string, (..._args: any) => Promise<any>> = {}
    Object.keys(methods).forEach((key) => {
      const methodName = methods[key]
      result[key] = (...args: any) => ipcRenderer.invoke(methodName, ...args)
    })
    return result
  }

  clients.forEach((client) => {
    const { name, tools, prompts, resources } = client
    api[name] = {}

    if (tools) {
      api[name].tools = createAPIMethods(tools)
    }
    if (prompts) {
      api[name].prompts = createAPIMethods(prompts)
    }
    if (resources) {
      api[name].resources = createAPIMethods(resources)
    }
  })

  contextBridge.exposeInMainWorld('mcpServers', api)
}

exposeAPIs()

contextBridge.exposeInMainWorld('configFileApi', {
  getConfig: async () => await ipcRenderer.invoke('getConfigFile'),
  updateConfig: async (content) => await ipcRenderer.invoke('updateConfigFile', content)
})
