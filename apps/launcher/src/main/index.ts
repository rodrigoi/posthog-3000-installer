// PostHog 3000 Launcher - Main Process
// System tray app with Windows 98 aesthetic

import { join } from "node:path";
import {
  app,
  BrowserWindow,
  type Event,
  Menu,
  nativeImage,
  Tray,
} from "electron";

let tray: Tray | null = null;
let aboutWindow: BrowserWindow | null = null;

// Create system tray icon and menu
function createTray(): void {
  // Create a simple icon (you can replace this with an actual icon file)
  const icon = nativeImage.createEmpty();

  // Try to load icon from resources, fallback to empty icon
  try {
    const iconPath = join(__dirname, "../../resources/icon.png");
    const loadedIcon = nativeImage.createFromPath(iconPath);
    if (!loadedIcon.isEmpty()) {
      tray = new Tray(loadedIcon.resize({ width: 16, height: 16 }));
    } else {
      tray = new Tray(icon);
    }
  } catch {
    tray = new Tray(icon);
  }

  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "PostHog 3000 Launcher",
      enabled: false,
    },
    {
      type: "separator",
    },
    {
      label: "About PostHog 3000...",
      click: showAboutWindow,
    },
    {
      type: "separator",
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip("PostHog 3000 Launcher");
  tray.setContextMenu(contextMenu);

  // On macOS, clicking the tray icon should show the menu
  tray.on("click", () => {
    tray?.popUpContextMenu();
  });
}

// Create About window with 98.css styling
function showAboutWindow(): void {
  // Don't create multiple about windows
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    maximizable: false,
    minimizable: false,
    backgroundColor: "#c0c0c0",
    title: "About PostHog 3000",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    // Remove menu bar
    autoHideMenuBar: true,
  });

  // Load the about page
  if (process.env.NODE_ENV === "development") {
    aboutWindow.loadURL("http://localhost:5173");
  } else {
    aboutWindow.loadFile(join(__dirname, "../../dist/index.html"));
  }

  aboutWindow.on("closed", () => {
    aboutWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createTray();
});

// Prevent app from quitting when all windows are closed (keep running in tray)
app.on("window-all-closed", () => {
  // e.preventDefault();
});

// Clean up before quit
app.on("before-quit", () => {
  if (tray) {
    tray.destroy();
    tray = null;
  }
});

// Quit when all windows are closed (except on macOS where apps stay in menu bar)
app.on("window-all-closed", () => {
  // For launcher, we want to keep running even when windows are closed
  // The only way to quit is through the tray menu
});

// macOS: Re-create tray if needed
app.on("activate", () => {
  if (!tray) {
    createTray();
  }
});
