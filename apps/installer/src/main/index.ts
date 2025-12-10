import { app, BrowserWindow, ipcMain, nativeImage } from "electron"
import { join } from "path"
import { readdirSync, statSync, existsSync, readFileSync } from "fs"
import { execSync } from "child_process"

let mainWindow: BrowserWindow | null

function setDockIcon(): void {
  if (process.platform === "darwin" && app.dock) {
    // In development, icon is in resources folder
    // In production, it's in the app resources
    const iconPath = app.isPackaged
      ? join(process.resourcesPath, "icon.png")
      : join(__dirname, "../../resources/icon.png")

    if (existsSync(iconPath)) {
      const icon = nativeImage.createFromPath(iconPath)
      app.dock.setIcon(icon)
    }
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: true,
    frame: false, // Remove OS frame for fullscreen window look
    backgroundColor: "#c0c0c0", // Windows 98 gray
    title: "PostHog 3000 Setup",
    show: false, // Don't show until maximized
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Set to full screen (not macOS fullscreen mode, just covers entire screen)
  mainWindow.setSimpleFullScreen(true)
  mainWindow.show()

  // Load the index.html of the app
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173")
    mainWindow.webContents.openDevTools()
  } else {
    // In production, the renderer files are in the dist folder at the app root
    // The main process is in app.asar/dist-electron/main/
    // The renderer files are in app.asar/dist/
    const rendererPath = join(__dirname, "../../dist/index.html")
    mainWindow.loadFile(rendererPath)
    // Open DevTools in production builds too for debugging
    mainWindow.webContents.openDevTools()
  }

  // Prevent navigation away from app
  mainWindow.webContents.on("will-navigate", (event) => {
    event.preventDefault()
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  setDockIcon()
  createWindow()

  app.on("activate", () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// DVD Detection Types
interface DVDDrive {
  path: string
  name: string
  isOptical: boolean
}

interface DVDCheckResult {
  success: boolean
  drives: DVDDrive[]
  error?: string
}

interface FileCheckResult {
  exists: boolean
  drivePath?: string
  filePath?: string
  error?: string
}

// Detect optical drives on macOS
function detectOpticalDrives(): DVDDrive[] {
  const drives: DVDDrive[] = []

  try {
    // On macOS, mounted volumes are in /Volumes
    const volumesPath = "/Volumes"
    const volumes = readdirSync(volumesPath)

    for (const volume of volumes) {
      const volumePath = join(volumesPath, volume)

      try {
        // Use diskutil to check if it's an optical drive
        const diskutilOutput = execSync(
          `diskutil info "${volumePath}" 2>/dev/null || true`,
          {
            encoding: "utf-8",
            timeout: 5000,
          }
        )

        // Check if it's optical media (CD/DVD)
        const isOptical =
          diskutilOutput.includes("CD-ROM") ||
          diskutilOutput.includes("DVD") ||
          diskutilOutput.includes("Optical") ||
          diskutilOutput.includes("BD-ROM")

        // Also check protocol type for optical
        const protocolMatch = diskutilOutput.match(/Protocol:\s+(.+)/)
        const isOpticalProtocol =
          protocolMatch &&
          (protocolMatch[1].includes("Optical") ||
            protocolMatch[1].includes("ATAPI"))

        if (isOptical || isOpticalProtocol) {
          drives.push({
            path: volumePath,
            name: volume,
            isOptical: true,
          })
        }
      } catch {
        // If diskutil fails, just skip this volume
      }
    }

    // If no optical drives found via diskutil, check for any non-system volumes
    // that might be DVDs (fallback for testing)
    if (drives.length === 0) {
      for (const volume of volumes) {
        // Skip system volumes
        if (volume === "Macintosh HD" || volume.startsWith(".")) continue

        const volumePath = join(volumesPath, volume)
        try {
          const stat = statSync(volumePath)
          if (stat.isDirectory()) {
            // Check if it looks like a DVD (has typical DVD structure or our marker file)
            const hasPosthogFile = existsSync(
              join(volumePath, "posthog_dvd.png")
            )
            if (hasPosthogFile) {
              drives.push({
                path: volumePath,
                name: volume,
                isOptical: true, // Treat as optical if it has our marker
              })
            }
          }
        } catch {
          // Skip inaccessible volumes
        }
      }
    }
  } catch (error) {
    console.error("Error detecting optical drives:", error)
  }

  return drives
}

// Get all mounted volumes (for manual selection)
function getAllMountedVolumes(): DVDDrive[] {
  const drives: DVDDrive[] = []

  try {
    const volumesPath = "/Volumes"
    const volumes = readdirSync(volumesPath)

    for (const volume of volumes) {
      if (volume.startsWith(".")) continue // Skip hidden

      const volumePath = join(volumesPath, volume)
      try {
        const stat = statSync(volumePath)
        if (stat.isDirectory()) {
          drives.push({
            path: volumePath,
            name: volume,
            isOptical: false, // Will be determined by actual check
          })
        }
      } catch {
        // Skip inaccessible
      }
    }
  } catch (error) {
    console.error("Error listing volumes:", error)
  }

  return drives
}

// IPC Handlers for DVD detection
ipcMain.handle("detect-dvd-drives", async (): Promise<DVDCheckResult> => {
  try {
    if (process.platform === "darwin") {
      const drives = detectOpticalDrives()
      return { success: true, drives }
    } else {
      // For now, only macOS is supported
      return {
        success: false,
        drives: [],
        error: "Only Mac OS is supported",
      }
    }
  } catch (error) {
    return {
      success: false,
      drives: [],
      error: `Failed to detect drives: ${error}`,
    }
  }
})

ipcMain.handle("get-all-volumes", async (): Promise<DVDCheckResult> => {
  try {
    const drives = getAllMountedVolumes()
    return { success: true, drives }
  } catch (error) {
    return {
      success: false,
      drives: [],
      error: `Failed to list volumes: ${error}`,
    }
  }
})

ipcMain.handle(
  "check-dvd-file",
  async (
    _event,
    drivePath: string,
    fileName: string
  ): Promise<FileCheckResult> => {
    try {
      const filePath = join(drivePath, fileName)
      const exists = existsSync(filePath)

      return {
        exists,
        drivePath,
        filePath: exists ? filePath : undefined,
      }
    } catch (error) {
      return {
        exists: false,
        error: `Failed to check file: ${error}`,
      }
    }
  }
)

// Launcher Installation Types
interface LauncherInstallResult {
  success: boolean
  error?: string
  launcherPath?: string
}

// PKG Installation Types
interface PKGInstallResult {
  success: boolean
  error?: string
  message?: string
}

// Install launcher app
ipcMain.handle("install-launcher", async (): Promise<LauncherInstallResult> => {
  try {
    // Get the resources path - in development and production
    const resourcesPath =
      process.resourcesPath || join(__dirname, "../../../..")
    const launcherDmgDir = join(resourcesPath, "launcher")

    console.log("Looking for launcher DMG in:", launcherDmgDir)

    // Find the launcher DMG
    if (!existsSync(launcherDmgDir)) {
      return {
        success: false,
        error: "Launcher DMG directory not found",
      }
    }

    const dmgFiles = readdirSync(launcherDmgDir).filter((f) =>
      f.endsWith(".dmg")
    )

    if (dmgFiles.length === 0) {
      return {
        success: false,
        error: "Launcher DMG not found in resources",
      }
    }

    const launcherDmgPath = join(launcherDmgDir, dmgFiles[0])
    console.log("Found launcher DMG:", launcherDmgPath)

    // Mount the DMG
    const mountOutput = execSync(
      `hdiutil attach "${launcherDmgPath}" -nobrowse`,
      {
        encoding: "utf-8",
      }
    )

    // Extract mount point
    const mountPoint = mountOutput
      .split("\n")
      .filter((line) => line.includes("/Volumes/"))
      .map((line) => line.match(/\/Volumes\/.+/)?.[0])[0]

    if (!mountPoint) {
      return {
        success: false,
        error: "Failed to mount launcher DMG",
      }
    }

    console.log("Mounted at:", mountPoint)

    // Find the launcher app
    const mountedFiles = readdirSync(mountPoint)
    const launcherApp = mountedFiles.find((f) => f.endsWith(".app"))

    if (!launcherApp) {
      execSync(`hdiutil detach "${mountPoint}"`)
      return {
        success: false,
        error: "Launcher app not found in DMG",
      }
    }

    const sourcePath = join(mountPoint, launcherApp)
    const destPath = join("/Applications", launcherApp)

    console.log("Installing launcher from:", sourcePath)
    console.log("To:", destPath)

    // Copy the launcher to Applications
    // Use ditto to preserve all attributes and handle existing files
    execSync(`ditto "${sourcePath}" "${destPath}"`, {
      encoding: "utf-8",
    })

    // Unmount the DMG
    execSync(`hdiutil detach "${mountPoint}"`)

    console.log("Launcher installed successfully")

    return {
      success: true,
      launcherPath: destPath,
    }
  } catch (error) {
    console.error("Error installing launcher:", error)
    return {
      success: false,
      error: `Failed to install launcher: ${error}`,
    }
  }
})

// Copy tar parts from currently mounted DVD to temp directory
ipcMain.handle(
  "copy-tar-parts-from-disc",
  async (): Promise<{
    success: boolean
    partsCopied: number
    error?: string
  }> => {
    try {
      const tarParts = await findTarPartsOnDVDs()

      if (tarParts.length === 0) {
        return { success: true, partsCopied: 0 }
      }

      const tempDir = join(app.getPath("temp"), "posthog-install")
      if (!existsSync(tempDir)) {
        execSync(`mkdir -p "${tempDir}"`)
      }

      let copied = 0
      for (const part of tarParts) {
        const filename = part.split("/").pop()!
        const destPath = join(tempDir, filename)

        // Skip if already copied
        if (existsSync(destPath)) {
          console.log(`Already have ${filename}, skipping`)
          continue
        }

        console.log(`Copying ${filename} to temp...`)
        execSync(`cp "${part}" "${destPath}"`)
        copied++
      }

      console.log(`Copied ${copied} tar parts to ${tempDir}`)
      return { success: true, partsCopied: copied }
    } catch (error) {
      console.error("Error copying tar parts:", error)
      return {
        success: false,
        partsCopied: 0,
        error: `Failed to copy tar parts: ${error}`,
      }
    }
  }
)

// Install PostHogStack PKG from collected tar parts or bundled PKG
ipcMain.handle("install-pkg", async (): Promise<PKGInstallResult> => {
  try {
    let pkgPath: string
    const tempDir = join(app.getPath("temp"), "posthog-install")

    // Check if we have collected tar parts in temp directory
    if (existsSync(tempDir)) {
      const tempFiles = readdirSync(tempDir)
      const tarParts = tempFiles
        .filter((f) => f.startsWith("PostHogStack.tar."))
        .sort()

      if (tarParts.length > 0) {
        console.log(`Found ${tarParts.length} tar parts in temp directory`)

        const reassembledTar = join(tempDir, "PostHogStack.tar")
        const extractedPkg = join(tempDir, "PostHogStack.pkg")

        // Concatenate tar parts
        console.log("Reassembling tar parts…")
        const partPaths = tarParts.map((p) => join(tempDir, p))
        const catCmd = partPaths.map((p) => `"${p}"`).join(" ")
        execSync(`cat ${catCmd} > "${reassembledTar}"`, {
          encoding: "utf-8",
        })

        // Extract PKG from tar
        console.log("Extracting PKG from tar…")
        execSync(`cd "${tempDir}" && tar xf "${reassembledTar}"`, {
          encoding: "utf-8",
        })

        pkgPath = extractedPkg
      } else {
        // No tar parts, fall back to bundled
        const resourcesPath =
          process.resourcesPath || join(__dirname, "../../../..")
        pkgPath = join(resourcesPath, "PostHogStack.pkg")
      }
    } else {
      // No temp dir, fall back to bundled
      const resourcesPath =
        process.resourcesPath || join(__dirname, "../../../..")
      pkgPath = join(resourcesPath, "PostHogStack.pkg")
    }

    if (!existsSync(pkgPath)) {
      return {
        success: false,
        error: "PostHogStack.pkg not found",
      }
    }

    console.log("Installing PostHogStack.pkg from:", pkgPath)

    // Use AppleScript to run installer with admin privileges
    const appleScript = `
      do shell script "installer -pkg '${pkgPath}' -target /" with administrator privileges
    `

    try {
      execSync(`osascript -e '${appleScript.replace(/'/g, "'\\''")}'`, {
        encoding: "utf-8",
        stdio: "pipe",
      })

      console.log("PostHogStack.pkg installed successfully")

      return {
        success: true,
        message: "PostHogStack installed successfully",
      }
    } catch (installError: any) {
      // Check if user cancelled
      if (
        installError.message &&
        installError.message.includes("User canceled")
      ) {
        return {
          success: false,
          error: "Installation cancelled by user",
        }
      }

      console.error("PKG installation error:", installError)
      return {
        success: false,
        error: `Failed to install PKG: ${installError.message || installError}`,
      }
    }
  } catch (error) {
    console.error("Error installing PKG:", error)
    return {
      success: false,
      error: `Failed to install PostHogStack: ${error}`,
    }
  }
})

// Find tar parts on mounted DVD volumes
async function findTarPartsOnDVDs(): Promise<string[]> {
  try {
    const volumesPath = "/Volumes"
    const volumes = readdirSync(volumesPath)
    const tarParts: string[] = []

    for (const volume of volumes) {
      if (volume.startsWith(".")) continue

      const volumePath = join(volumesPath, volume)

      try {
        // Look for PostHogStack.tar.* files
        const files = readdirSync(volumePath)
        for (const file of files) {
          if (file.startsWith("PostHogStack.tar.")) {
            tarParts.push(join(volumePath, file))
          }
        }
      } catch {
        // Skip inaccessible volumes
      }
    }

    return tarParts.sort() // Ensure parts are in order
  } catch (error) {
    console.error("Error finding tar parts:", error)
    return []
  }
}

// Get missing DVD numbers based on tar parts and disc_info
ipcMain.handle(
  "get-missing-dvds",
  async (): Promise<{ missing: number[]; total: number }> => {
    try {
      const volumesPath = "/Volumes"
      const volumes = readdirSync(volumesPath)

      // Find all PostHog DVDs and their disc numbers
      const foundDiscs = new Set<number>()
      let totalDiscs = 0

      for (const volume of volumes) {
        if (volume.startsWith(".")) continue

        const volumePath = join(volumesPath, volume)
        const discInfoPath = join(volumePath, ".disc_info")

        if (existsSync(discInfoPath)) {
          try {
            const content = readFileSync(discInfoPath, "utf-8")

            // Get disc number
            const discMatch = content.match(/disc_number=(\d+)/)
            if (discMatch) {
              foundDiscs.add(parseInt(discMatch[1], 10))
            }

            // Get total discs
            const totalMatch = content.match(/total_discs=(\d+)/)
            if (totalMatch) {
              totalDiscs = Math.max(totalDiscs, parseInt(totalMatch[1], 10))
            }
          } catch (err) {
            console.error(`Error reading disc_info from ${volume}:`, err)
          }
        }
      }

      // If no disc info found, check if we have tar parts (fallback)
      if (totalDiscs === 0) {
        const tarParts = await findTarPartsOnDVDs()
        if (tarParts.length > 0) {
          // Estimate based on tar part suffixes
          const suffixes = new Set<string>()
          for (const part of tarParts) {
            const match = part.match(/PostHogStack\.tar\.([a-z]+)/)
            if (match) {
              suffixes.add(match[1])
            }
          }
          // Rough estimate: 2 parts per disc
          totalDiscs = Math.ceil(suffixes.size / 2) || 1
          foundDiscs.add(1) // Assume at least disc 1 is present
        }
      }

      // Calculate missing discs
      const missing: number[] = []
      for (let i = 1; i <= totalDiscs; i++) {
        if (!foundDiscs.has(i)) {
          missing.push(i)
        }
      }

      console.log(
        `DVD Check: Found discs ${Array.from(
          foundDiscs
        ).sort()}, Total: ${totalDiscs}, Missing: ${missing}`
      )

      return {
        missing,
        total: totalDiscs,
      }
    } catch (error) {
      console.error("Error checking missing DVDs:", error)
      return { missing: [], total: 0 }
    }
  }
)
