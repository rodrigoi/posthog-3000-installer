// Electron API type definitions

export interface ElectronAPI {
  platform: NodeJS.Platform
  version: string
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
