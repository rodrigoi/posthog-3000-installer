# PostHog 3000 Apps Monorepo

> A pnpm workspace monorepo containing multiple Electron applications for PostHog

## Structure

- **apps/installer** - PostHog 3000 Installer (Windows 98 aesthetic)
- **apps/launcher** - PostHog 3000 Launcher (System tray app)
- **packages/** - Shared packages (if needed)

## Quick Start

```bash
# Install all dependencies
pnpm install

# Run installer app
pnpm dev:installer
# or
pnpm dev

# Build installer
pnpm build:installer
```

## Development

### Install Dependencies
```bash
pnpm install
```

### Run Apps
```bash
# Run installer app
pnpm dev:installer
# or
pnpm --filter installer dev

# Run launcher app
pnpm dev:launcher
# or
pnpm --filter launcher dev
```

### Build Apps
```bash
# Build installer
pnpm build:installer
# or specific platform
pnpm build:installer:mac
pnpm build:installer:win
pnpm build:installer:linux

# Build launcher
pnpm build:launcher
# or specific platform
pnpm build:launcher:mac
pnpm build:launcher:win
pnpm build:launcher:linux
```

### Run Commands Across All Apps
```bash
pnpm -r typecheck    # Type check all packages
pnpm -r build        # Build all packages
```

## Apps

### PostHog 3000 Installer

A nostalgic Windows 98 InstallShield installer experience with PostHog branding.

**Location:** `apps/installer/`

**Features:**
- Classic Windows 98 InstallShield aesthetic using [98.css](https://github.com/jdan/98.css)
- Wizard-style installation flow with 7 screens
- PostHog-themed components and configuration
- Fake installation progress with retro file names
- Cross-platform (macOS, Windows, Linux)
- Easter eggs and nostalgic touches

**Installation Screens:**
1. **Welcome** - PostHog 3000 Setup Wizard
2. **License Agreement** - MIT license acceptance
3. **Directory Selection** - Choose installation path
4. **Component Selection** - Select PostHog features
5. **Configuration** - Project settings and API key
6. **Installation Progress** - Watch fake files install
7. **Finish** - Complete with launch options

**Tech Stack:**
- Electron + TypeScript
- 98.css for Windows 98 aesthetic
- Vite for building
- electron-builder for packaging

### PostHog 3000 Launcher

A system tray application that runs in the background with Windows 98 styling.

**Location:** `apps/launcher/`

**Features:**
- Lives in system tray/toolbar
- Context menu with Quit option
- About dialog with Windows 98 aesthetic
- Minimal footprint - no main window
- Cross-platform (macOS, Windows, Linux)

**How it works:**
- Runs silently in the system tray
- Right-click (or click on macOS) to show menu
- "About PostHog 3000..." shows version info
- "Quit" exits the application
- About dialog styled with 98.css matching the installer

**Tech Stack:**
- Electron + TypeScript
- System Tray API
- 98.css for About dialog
- Vite for building

## Adding a New App

1. Create `apps/new-app/` directory
2. Add `package.json` with unique name
3. Copy Electron structure from `apps/installer`
4. Add scripts to root `package.json`:
   ```json
   {
     "scripts": {
       "dev:new-app": "pnpm --filter new-app dev",
       "build:new-app": "pnpm --filter new-app build"
     }
   }
   ```

## Monorepo Commands

### Workspace Filtering
```bash
# Run command in specific app
pnpm --filter installer dev
pnpm --filter app-2 build

# Run command in all packages
pnpm -r build
pnpm -r typecheck
```

### Managing Dependencies
```bash
# Add dependency to specific app
pnpm --filter installer add some-package

# Add dev dependency to root
pnpm add -D -w some-dev-tool

# Install all dependencies
pnpm install
```

## Project Structure

```
posthog-3000-installer/          # Root (monorepo)
├── apps/
│   ├── installer/               # PostHog 3000 Installer
│   │   ├── src/
│   │   │   ├── main/           # Electron main process
│   │   │   ├── preload/        # Preload scripts
│   │   │   ├── renderer/       # Renderer process (UI)
│   │   │   └── types/          # TypeScript types
│   │   ├── electron.vite.config.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   └── tsconfig.web.json
│   └── launcher/               # PostHog 3000 Launcher
│       ├── src/
│       │   ├── main/           # System tray management
│       │   ├── preload/        # Preload scripts
│       │   └── renderer/       # About dialog
│       ├── electron.vite.config.js
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       └── tsconfig.web.json
├── packages/                    # Shared packages (optional)
├── pnpm-workspace.yaml         # Workspace configuration
├── package.json                # Root package.json
├── tsconfig.json               # Base TypeScript config
└── README.md
```

## Building for Distribution

### macOS
```bash
pnpm build:installer:mac
```
Produces a DMG file in `apps/installer/dist/`

### Windows
```bash
pnpm build:installer:win
```
Produces an NSIS installer in `apps/installer/dist/`

### Linux
```bash
pnpm build:installer:linux
```
Produces an AppImage in `apps/installer/dist/`

## TypeScript Configuration

The monorepo uses a shared base TypeScript configuration:

- **Root `tsconfig.json`** - Base config with common compiler options
- **`apps/installer/tsconfig.node.json`** - Main/preload processes (Node environment)
- **`apps/installer/tsconfig.web.json`** - Renderer process (DOM environment)

Each app extends the root configuration and adds its own specific settings.

## Credits & Inspiration

- [98.css](https://github.com/jdan/98.css) by [@jdan](https://github.com/jdan) - The amazing CSS library
- InstallShield and Inno Setup - Classic installer tools
- PostHog - The best analytics platform for engineers
- Windows 98 - Peak aesthetic computing

## License

MIT License - See LICENSE file for details

---

**Made with 💾 and ✨ by the PostHog community**

*"Installing software has never been this nostalgic!"*
