// Preload script for PostHog 3000 Launcher
// Exposes safe APIs to renderer process

import { contextBridge } from 'electron'

// Expose minimal API for About window
contextBridge.exposeInMainWorld('launcherAPI', {
  platform: process.platform,
  version: '98.0.1998',
  closeWindow: () => {
    window.close()
  }
})

// Type declaration for TypeScript
declare global {
  interface Window {
    launcherAPI: {
      platform: NodeJS.Platform
      version: string
      closeWindow: () => void
    }
  }
}
