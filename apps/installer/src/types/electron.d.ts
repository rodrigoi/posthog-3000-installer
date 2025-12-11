// Electron API type definitions

export interface DVDDrive {
  path: string
  name: string
  isOptical: boolean
}

export interface DVDCheckResult {
  success: boolean
  drives: DVDDrive[]
  error?: string
}

export interface FileCheckResult {
  exists: boolean
  drivePath?: string
  filePath?: string
  error?: string
}

export interface LauncherInstallResult {
  success: boolean
  error?: string
  launcherPath?: string
}

export interface PKGInstallResult {
  success: boolean
  error?: string
  message?: string
}

export interface ElectronAPI {
  platform: NodeJS.Platform
  version: string

  // DVD Detection methods
  detectDVDDrives: () => Promise<DVDCheckResult>
  getAllVolumes: () => Promise<DVDCheckResult>
  checkDVDFile: (drivePath: string, fileName: string) => Promise<FileCheckResult>

  // Launcher installation
  copyLauncherToTemp: () => Promise<{success: boolean, error?: string, message?: string}>
  installLauncher: () => Promise<LauncherInstallResult>

  // PKG installation
  installPKG: () => Promise<PKGInstallResult>

  // Check for missing DVDs
  getMissingDVDs: () => Promise<{missing: number[], total: number}>

  // Copy tar parts from current disc
  copyTarPartsFromDisc: () => Promise<{success: boolean, partsCopied: number, error?: string}>

  // Launch PostHog Launcher app
  launchPostHog: () => Promise<{success: boolean, error?: string}>

  // Quit the installer app
  quitApp: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
