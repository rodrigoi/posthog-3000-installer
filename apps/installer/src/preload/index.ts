import { contextBridge } from 'electron'
import type { ElectronAPI } from '../types/electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  // Add any IPC methods here if needed in the future
  // For now, this app is pure UI with no need for main process communication
  platform: process.platform,
  version: '98.0.1998'
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
