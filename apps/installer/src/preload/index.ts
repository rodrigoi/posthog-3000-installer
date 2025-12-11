import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI, DVDCheckResult, FileCheckResult, LauncherInstallResult, PKGInstallResult } from '../types/electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  platform: process.platform,
  version: '98.0.1998',

  // DVD Detection methods
  detectDVDDrives: (): Promise<DVDCheckResult> => {
    return ipcRenderer.invoke('detect-dvd-drives')
  },

  getAllVolumes: (): Promise<DVDCheckResult> => {
    return ipcRenderer.invoke('get-all-volumes')
  },

  checkDVDFile: (drivePath: string, fileName: string): Promise<FileCheckResult> => {
    return ipcRenderer.invoke('check-dvd-file', drivePath, fileName)
  },

  // Launcher installation
  copyLauncherToTemp: (): Promise<{success: boolean, error?: string, message?: string}> => {
    return ipcRenderer.invoke('copy-launcher-to-temp')
  },

  installLauncher: (): Promise<LauncherInstallResult> => {
    return ipcRenderer.invoke('install-launcher')
  },

  // PKG installation
  installPKG: (): Promise<PKGInstallResult> => {
    return ipcRenderer.invoke('install-pkg')
  },

  // Check for missing DVDs
  getMissingDVDs: (): Promise<{missing: number[], total: number}> => {
    return ipcRenderer.invoke('get-missing-dvds')
  },

  // Copy tar parts from current disc
  copyTarPartsFromDisc: (): Promise<{success: boolean, partsCopied: number, error?: string}> => {
    return ipcRenderer.invoke('copy-tar-parts-from-disc')
  },

  // Launch PostHog Launcher app
  launchPostHog: (): Promise<{success: boolean, error?: string}> => {
    return ipcRenderer.invoke('launch-posthog')
  },

  // Quit the installer app
  quitApp: (): Promise<void> => {
    return ipcRenderer.invoke('quit-app')
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
