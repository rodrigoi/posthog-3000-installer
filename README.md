# PostHog 3000 Demo

> Run PostHog locally on MacOS with a Windows 98 aesthetic

A retro-themed demo for running PostHog on your local machine. The stack runs inside a Docker-compose-like single executable managed by `posthog-stack`.

## Apps

| App           | Description                                  | Location          |
| ------------- | -------------------------------------------- | ----------------- |
| **Installer** | Windows 98 InstallShield-style wizard        | `apps/installer/` |
| **Launcher**  | System tray app to control the PostHog stack | `apps/launcher/`  |

### Installer

A nostalgic Windows 98 InstallShield experience that sets up everything you need:

- Installs `PostHogStack.pkg` (the local PostHog stack)
- Installs the Launcher app to `/Applications`
- Supports multi-DVD installation for large PKG files
- macOS only (for now)

### Launcher

A system tray app that manages the PostHog stack:

- Start/stop/restart PostHog with `posthog-stack up/down`
- View live logs
- Open PostHog in your browser at `http://localhost:8010`
- Windows 98-styled About and Logs dialogs

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v10+)

### Setup

```bash
pnpm install
```

### Running Locally

```bash
# Run the installer app (with hot reload)
pnpm dev:installer

# Run the launcher app (with hot reload)
pnpm dev:launcher
```

### Building

```bash
# Build all apps
pnpm build

# Or build individually
pnpm build:installer
pnpm build:launcher

# Build for macOS (only tested platform)
pnpm build:installer:mac
pnpm build:launcher:mac
```

Built apps are output to `apps/<app-name>/dist/`.

## Project Structure

```
posthog-3000-installer/
├── apps/
│   ├── installer/
│   │   └── src/
│   │       ├── main/       # Electron main process
│   │       ├── preload/    # Preload scripts
│   │       ├── renderer/   # UI (screens, styles)
│   │       └── types/      # TypeScript types
│   └── launcher/
│       └── src/
│           ├── main/       # System tray & stack management
│           ├── preload/    # Preload scripts
│           └── renderer/   # About & Logs dialogs
├── packages/               # Shared packages
├── pnpm-workspace.yaml
└── package.json
```

## Tech Stack

- **Electron** + TypeScript
- **98.css** for Windows 98 aesthetic
- **Vite** for building
- **electron-builder** for packaging

## Credits

- [98.css](https://github.com/jdan/98.css) by [@jdan](https://github.com/jdan)
- InstallShield and Inno Setup for inspiration
- Windows 98 - Peak aesthetic computing

## License

MIT License - See LICENSE file

---

**Made with 💾 and 🧉 by the PostHog team in Buenos Aires 🇦🇷**
