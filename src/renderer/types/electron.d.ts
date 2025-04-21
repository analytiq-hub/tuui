interface Window {
  electronAPI: {
    proxyApiRequest: (url: string, options: any) => Promise<any>;
    // Add other electron API methods here
  }
  configFileApi: {
    getConfig: () => Promise<string>;
    updateConfig: (_config: string) => Promise<{ success: boolean; error?: string }>;
    reloadMcpServers: () => Promise<{ success: boolean; error?: string }>;
  }
}
