# PostHog 3000 Installer - Retro Windows 98 Installer App

> A nostalgic journey back to 1998, now with 256 colors and 100% more hedgehogs!

## Overview

A cross-platform Electron application that recreates the nostalgic Windows 98 InstallShield installer experience. This is a pure visual/aesthetic experience with no actual installation functionality - just the look, feel, and joy of classic installers with PostHog branding.

## Features

- Classic Windows 98 InstallShield aesthetic using [98.css](https://github.com/jdan/98.css)
- Wizard-style installation flow with 7 screens
- PostHog-themed components and configuration
- Fake installation progress with retro file names
- Cross-platform (macOS, Windows, Linux)
- Easter eggs and nostalgic touches

## Tech Stack

### Core
- **Electron**: Cross-platform desktop app framework
- **98.css**: CSS library for Windows 98 aesthetic
- **Vanilla JavaScript**: Simple state machine, no framework bloat
- **Vite**: Modern build tool with excellent Electron support

### Build & Package
- **electron-vite**: Vite integration for Electron
- **electron-builder**: Package and distribute for all platforms

## Project Structure

```
posthog-3000-installer/
├── package.json
├── electron.vite.config.js
├── src/
│   ├── main/               # Electron main process
│   │   └── index.js        # Main process entry, window creation
│   ├── preload/            # Preload scripts
│   │   └── index.js        # Expose safe IPC to renderer
│   └── renderer/           # Electron renderer process (UI)
│       ├── index.html      # Main HTML entry
│       ├── main.js         # Renderer JS logic
│       ├── styles.css      # Custom styles (complement 98.css)
│       ├── screens/        # Individual installer screens
│       │   ├── welcome.js
│       │   ├── license.js
│       │   ├── directory.js
│       │   ├── components.js      # PostHog feature selection
│       │   ├── configuration.js   # PostHog-specific config
│       │   ├── installing.js
│       │   └── finish.js
│       └── assets/
│           ├── posthog-logo.png
│           ├── sidebar.png        # Retro sidebar graphic
│           └── sounds/            # Optional: classic Windows sounds
│               ├── start.wav
│               ├── complete.wav
│               └── click.wav
├── resources/              # App icons and build resources
│   └── icon.png
└── README.md
```

## Installation Screens

### 1. Welcome Screen
Welcome to the PostHog 3000 Setup Wizard! Features the PostHog logo and classic installer welcome message.

### 2. License Agreement
PostHog's MIT license in a scrollable text area. Must accept to continue (classic installer behavior!).

### 3. Directory Selection
Choose your fake installation directory. Defaults to `C:\Program Files\PostHog3000` for authenticity.

### 4. Component Selection
Select which PostHog features to "install":
- Analytics & Product Analytics (Required)
- Session Replay
- Feature Flags
- A/B Testing
- Data Pipeline
- Notebooks

### 5. Configuration
PostHog-specific settings:
- Project Name
- Instance URL (Cloud / Self-hosted)
- API Key

### 6. Installation Progress
Watch as fake files get installed:
```
Extracting: posthog-analytics.dll
Copying: session-replay.exe
Registering: feature-flags.ocx
Creating shortcuts...
```

### 7. Finish
Installation complete! Options to "Launch PostHog 3000 now" or "View README".

## Development Workflow

### Setup
```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm dev
```

### Building
```bash
# Build for current platform
pnpm build

# Package for all platforms
pnpm build:all
```

### Project Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build production version
- `pnpm preview` - Preview production build
- `pnpm build:mac` - Build for macOS
- `pnpm build:win` - Build for Windows
- `pnpm build:linux` - Build for Linux

## Key Technical Decisions

### Why Vanilla JS?
- Installer UI is a simple state machine
- No need for React/Vue overhead
- Keeps bundle size minimal
- Matches the retro spirit (JS in 1998 was vanilla!)
- 98.css works perfectly with plain HTML

### Why Vite?
- Faster development experience than Webpack
- Simpler configuration
- electron-vite provides excellent DX
- Modern tooling for a retro aesthetic

### Window Configuration
The Electron window is configured to feel like a classic installer:
- Fixed 800x600 size (no resizing!)
- Windows 98 gray background (#c0c0c0)
- Standard OS frame (cross-platform compatibility)
- Context isolation for security

### State Management
Simple state object managing the wizard flow:

```javascript
const state = {
  currentScreen: 0,
  licenseAccepted: false,
  installPath: 'C:\\Program Files\\PostHog3000',
  selectedComponents: ['analytics'],
  configData: {},
  canGoNext: false,
  canGoBack: false
}
```

## Styling Details

### Color Palette
- Window gray: `#c0c0c0`
- Highlight blue: `#000080`
- Text: `#000000`
- Disabled text: `#808080`

### Fonts
Classic Windows system fonts with fallbacks:
- MS Sans Serif (approximated)
- Tahoma
- Arial
- Sans-serif

### 98.css Components Used
- `.window` - Main window container
- `.title-bar` - Window title bar
- `.window-body` - Content area
- `button` - Beveled buttons
- `input`, `textarea` - Form controls
- `.tree-view` - File lists
- Progress bars

## Easter Eggs

- Click PostHog logo 10 times for special surprise
- About dialog: "PostHog 3000 v98.0.1998"
- Retro file extensions (.dll, .exe, .ocx)
- Intentionally slow progress bar (authentic experience!)
- Product tagline: "The Engineer's Analytics Platform - Now In Glorious 256 Colors!"

## Building for Distribution

### macOS
```bash
pnpm build:mac
```
Produces a DMG file in `dist/`

### Windows
```bash
pnpm build:win
```
Produces an NSIS installer in `dist/` (yes, an installer installer!)

### Linux
```bash
pnpm build:linux
```
Produces an AppImage in `dist/`

## Credits & Inspiration

- [98.css](https://github.com/jdan/98.css) by [@jdan](https://github.com/jdan) - The amazing CSS library that makes this possible
- Inno Setup and InstallShield - The classic installer tools we all remember
- PostHog - The best analytics platform for engineers
- Windows 98 - Peak aesthetic computing

## License

MIT License - See LICENSE file for details

## Contributing

This is a fun, nostalgic project! Contributions welcome:
- More screen variations
- Additional easter eggs
- Sound effects
- Classic Windows error dialogs
- More retro PostHog branding

---

**Made with 💾 and ✨ by the PostHog community**

*"Installing software has never been this nostalgic!"*
