// PostHog 3000 Launcher - Main Process
// System tray app with Windows 98 aesthetic

import { spawn, ChildProcess } from "node:child_process"
import { join } from "node:path"
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  shell,
  Tray,
} from "electron"

const POSTHOG_URL = "http://localhost:8010"
const MAX_LOG_ENTRIES = 1000
const HEALTH_CHECK_INTERVAL = 5000 // Check every 5 seconds

let tray: Tray | null = null
let aboutWindow: BrowserWindow | null = null
let logsWindow: BrowserWindow | null = null

// PostHog stack process management
let stackProcess: ChildProcess | null = null
let stackState: "stopped" | "starting" | "running" | "stopping" = "stopped"
let healthCheckInterval: NodeJS.Timeout | null = null

// Log storage
interface LogEntry {
  timestamp: Date
  type: "stdout" | "stderr" | "system"
  message: string
}

let logs: LogEntry[] = []
let lastError: string | null = null

function addLog(type: LogEntry["type"], message: string): void {
  const entry: LogEntry = {
    timestamp: new Date(),
    type,
    message: message.trim(),
  }
  logs.push(entry)

  // Keep only the last MAX_LOG_ENTRIES
  if (logs.length > MAX_LOG_ENTRIES) {
    logs = logs.slice(-MAX_LOG_ENTRIES)
  }

  // Track last error
  if (type === "stderr" && message.trim()) {
    lastError = message.trim().split("\n")[0].substring(0, 50)
    updateTrayMenu()
  }

  // Send to logs window if open
  if (logsWindow && !logsWindow.isDestroyed()) {
    logsWindow.webContents.send("log-entry", entry)
  }
}

function clearLogs(): void {
  logs = []
  lastError = null
  updateTrayMenu()
}

// IPC handlers for logs
ipcMain.handle("get-logs", () => {
  return logs.map((log) => ({
    ...log,
    timestamp: log.timestamp.toISOString(),
  }))
})

ipcMain.handle("clear-logs", () => {
  clearLogs()
  return true
})

ipcMain.handle("get-stack-state", () => {
  return stackState
})

// Check if PostHog is actually responding
async function checkPostHogHealth(): Promise<boolean> {
  try {
    const response = await fetch(POSTHOG_URL, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
    })
    return response.ok
  } catch {
    return false
  }
}

// Start periodic health checks
function startHealthCheck(): void {
  if (healthCheckInterval) return

  healthCheckInterval = setInterval(async () => {
    const isHealthy = await checkPostHogHealth()

    if (isHealthy && stackState !== "running") {
      stackState = "running"
      updateTrayMenu()
      addLog("system", "PostHog is now responding")
    } else if (!isHealthy && stackState === "running") {
      stackState = "stopped"
      updateTrayMenu()
      addLog("system", "PostHog stopped responding")
    }
  }, HEALTH_CHECK_INTERVAL)
}

// Stop periodic health checks
function stopHealthCheck(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
    healthCheckInterval = null
  }
}

// Update the tray menu based on current state
function updateTrayMenu(): void {
  if (!tray) return

  const statusLabel = {
    stopped: "⚫ PostHog: Stopped",
    starting: "🟡 PostHog: Starting...",
    running: `🟢 PostHog: Running`,
    stopping: "🟡 PostHog: Stopping...",
  }[stackState]

  const menuItems: Electron.MenuItemConstructorOptions[] = [
    {
      label: "PostHog 3000 Demo",
      enabled: false,
    },
    {
      type: "separator",
    },
    {
      label: statusLabel,
      enabled: false,
    },
  ]

  // Show URL when running
  if (stackState === "running") {
    menuItems.push({
      label: `    → ${POSTHOG_URL}`,
      enabled: false,
    })
  }

  // Show last error if exists
  if (lastError) {
    menuItems.push({
      label: `⚠️ ${lastError}...`,
      enabled: false,
    })
  }

  menuItems.push(
    { type: "separator" },
    {
      label: "Open in Browser",
      enabled: stackState === "running",
      click: () => shell.openExternal(POSTHOG_URL),
    },
    {
      label: "Start PostHog",
      enabled: stackState === "stopped",
      click: startPostHog,
    },
    {
      label: "Stop PostHog",
      enabled: stackState === "running",
      click: stopPostHog,
    },
    {
      label: "Restart PostHog",
      enabled: stackState === "running",
      click: restartPostHog,
    },
    { type: "separator" },
    {
      label: `View Logs${logs.length > 0 ? ` (${logs.length})` : ""}`,
      click: showLogsWindow,
    },
    {
      label: "About PostHog 3000 Demo...",
      click: showAboutWindow,
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        // Stop PostHog before quitting if running
        if (stackProcess && stackState === "running") {
          stopPostHog().then(() => app.quit())
        } else {
          app.quit()
        }
      },
    }
  )

  const contextMenu = Menu.buildFromTemplate(menuItems)
  tray.setContextMenu(contextMenu)

  // Update tooltip with state
  const tooltipState = {
    stopped: "PostHog 3000 Demo - Stopped",
    starting: "PostHog 3000 Demo - Starting...",
    running: `PostHog 3000 Demo - Running\n${POSTHOG_URL}`,
    stopping: "PostHog 3000 Demo - Stopping...",
  }[stackState]
  tray.setToolTip(tooltipState)
}

// Start PostHog stack
function startPostHog(): void {
  if (stackProcess || stackState !== "stopped") {
    addLog("system", "PostHog is already running or in transition")
    return
  }

  addLog("system", "Starting PostHog stack...")
  lastError = null
  stackState = "starting"
  updateTrayMenu()

  // Spawn posthog-stack up
  // Use full path in case PATH is not set correctly
  const posthogStackPath = "/usr/local/bin/posthog-stack"

  // Set up proper PATH that includes common locations for docker, etc.
  const env = {
    ...process.env,
    PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:" + (process.env.PATH || "")
  }

  stackProcess = spawn(posthogStackPath, ["up"], {
    shell: true,
    stdio: "pipe",
    detached: false,
    env: env,
  })

  stackProcess.stdout?.on("data", (data: Buffer) => {
    const output = data.toString()
    addLog("stdout", output)
  })

  stackProcess.stderr?.on("data", (data: Buffer) => {
    addLog("stderr", data.toString())
  })

  stackProcess.on("spawn", () => {
    addLog("system", "Process spawned successfully")
    // Start health checks to detect when PostHog is actually ready
    startHealthCheck()
  })

  stackProcess.on("error", (err) => {
    addLog("stderr", `Failed to start PostHog: ${err.message}`)
    stackState = "stopped"
    stackProcess = null
    updateTrayMenu()
  })

  stackProcess.on("exit", (code) => {
    addLog("system", `PostHog process exited with code ${code}`)
    stackState = "stopped"
    stackProcess = null
    updateTrayMenu()
  })
}

// Stop PostHog stack
async function stopPostHog(): Promise<void> {
  if (stackState !== "running") {
    addLog("system", "PostHog is not running")
    return
  }

  addLog("system", "Stopping PostHog stack...")
  stackState = "stopping"
  updateTrayMenu()

  // Stop health checks
  stopHealthCheck()

  // Run posthog-stack down to properly stop
  return new Promise((resolve) => {
    const posthogStackPath = "/usr/local/bin/posthog-stack"

    // Set up proper PATH that includes common locations for docker, etc.
    const env = {
      ...process.env,
      PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:" + (process.env.PATH || "")
    }

    const downProcess = spawn(posthogStackPath, ["down"], {
      shell: true,
      stdio: "pipe",
      env: env,
    })

    downProcess.stdout?.on("data", (data: Buffer) => {
      addLog("stdout", data.toString())
    })

    downProcess.stderr?.on("data", (data: Buffer) => {
      addLog("stderr", data.toString())
    })

    downProcess.on("exit", () => {
      // Also kill the main process if still running
      if (stackProcess) {
        stackProcess.kill("SIGTERM")
        stackProcess = null
      }
      addLog("system", "PostHog stopped")
      stackState = "stopped"
      updateTrayMenu()
      resolve()
    })

    downProcess.on("error", (err) => {
      addLog("stderr", `Error stopping: ${err.message}`)
      // Force kill if down command fails
      if (stackProcess) {
        stackProcess.kill("SIGKILL")
        stackProcess = null
      }
      stackState = "stopped"
      updateTrayMenu()
      resolve()
    })

    // Timeout fallback
    setTimeout(() => {
      if (stackState === "stopping") {
        if (stackProcess) {
          stackProcess.kill("SIGKILL")
          stackProcess = null
        }
        addLog("system", "Force stopped (timeout)")
        stackState = "stopped"
        updateTrayMenu()
        resolve()
      }
    }, 10000)
  })
}

// Restart PostHog stack
async function restartPostHog(): Promise<void> {
  addLog("system", "Restarting PostHog...")
  await stopPostHog()
  // Small delay before starting again
  setTimeout(() => {
    startPostHog()
  }, 1000)
}

// Create system tray icon and menu
function createTray(): void {
  // Create a simple icon (you can replace this with an actual icon file)
  const icon = nativeImage.createEmpty()

  // Try to load icon from resources, fallback to empty icon
  try {
    // In packaged app, use process.resourcesPath
    // In development, use relative path from source
    const iconPath = app.isPackaged
      ? join(process.resourcesPath, "icon_16x16.png")
      : join(__dirname, "../../resources/icon_16x16.png")

    console.log("Loading tray icon from:", iconPath)
    const loadedIcon = nativeImage.createFromPath(iconPath)

    if (!loadedIcon.isEmpty()) {
      const resizedIcon = loadedIcon.resize({ width: 22, height: 22 })
      // Mark as template image on macOS for proper menu bar rendering
      resizedIcon.setTemplateImage(true)
      tray = new Tray(resizedIcon)
      console.log("Tray icon loaded successfully")
    } else {
      // Fallback: create a simple colored icon so it's visible
      console.warn("Could not load icon from:", iconPath)
      tray = new Tray(icon)
    }
  } catch (err) {
    console.error("Error loading tray icon:", err)
    tray = new Tray(icon)
  }

  // Set initial menu
  updateTrayMenu()

  // On macOS, clicking the tray icon should show the menu
  tray.on("click", () => {
    tray?.popUpContextMenu()
  })
}

// Show logs window
function showLogsWindow(): void {
  // Don't create multiple logs windows
  if (logsWindow && !logsWindow.isDestroyed()) {
    logsWindow.focus()
    return
  }

  logsWindow = new BrowserWindow({
    width: 600,
    height: 450,
    resizable: true,
    frame: false,
    backgroundColor: "#c0c0c0",
    title: "PostHog Logs",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Load the logs page
  if (process.env.NODE_ENV === "development") {
    logsWindow.loadURL("http://localhost:5173/logs.html")
  } else {
    logsWindow.loadFile(join(__dirname, "../../dist/logs.html"))
  }

  logsWindow.on("closed", () => {
    logsWindow = null
  })
}

// Create About window with 98.css styling
function showAboutWindow(): void {
  // Don't create multiple about windows
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.focus()
    return
  }

  aboutWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    frame: false, // Make window frameless (chromeless)
    backgroundColor: "#c0c0c0",
    title: "About PostHog 3000",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Load the about page
  if (process.env.NODE_ENV === "development") {
    aboutWindow.loadURL("http://localhost:5173")
  } else {
    aboutWindow.loadFile(join(__dirname, "../../dist/index.html"))
  }

  aboutWindow.on("closed", () => {
    aboutWindow = null
  })
}

// Configure app as accessory (menu bar only) before ready event
if (process.platform === "darwin") {
  app.dock.hide()
}

// App lifecycle
app.whenReady().then(async () => {
  createTray()

  // Check if PostHog is already running
  addLog("system", "Launcher started - checking if PostHog is already running...")
  const isAlreadyRunning = await checkPostHogHealth()

  if (isAlreadyRunning) {
    addLog("system", "PostHog is already running")
    stackState = "running"
    updateTrayMenu()
    startHealthCheck()
  } else {
    // Auto-start PostHog on launch
    addLog("system", "Auto-starting PostHog...")
    setTimeout(() => {
      startPostHog()
    }, 1000) // Small delay to ensure tray is ready
  }
})

// Prevent app from quitting when all windows are closed (keep running in tray)
app.on("window-all-closed", () => {
  // For launcher, we want to keep running even when windows are closed
  // The only way to quit is through the tray menu
})

// Clean up before quit
app.on("before-quit", async () => {
  // Stop PostHog if running
  if (stackProcess && stackState === "running") {
    await stopPostHog()
  }

  if (tray) {
    tray.destroy()
    tray = null
  }
})

// macOS: Re-create tray if needed
app.on("activate", () => {
  if (!tray) {
    createTray()
  }
})
