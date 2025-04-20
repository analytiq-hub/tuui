interface Window {
  electronAPI: {
    proxyApiRequest: (url: string, options: any) => Promise<any>;
    // Add other electron API methods here
  }
}
