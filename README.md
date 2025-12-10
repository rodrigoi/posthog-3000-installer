# PostHog 3000 Apps

> A pnpm workspace monorepo containing Electron apps with Windows 98 aesthetic

## Apps

| App           | Description                                  | Location          |
| ------------- | -------------------------------------------- | ----------------- |
| **Installer** | Classic InstallShield-style wizard installer | `apps/installer/` |
| **Launcher**  | System tray app that runs in the background  | `apps/launcher/`  |

### Installer

A nostalgic Windows 98 InstallShield experience with PostHog branding.

- Wizard-style flow: Welcome → License → Directory → Components → Config → Progress → Finish
- Fake installation progress with retro file names
- Easter eggs and nostalgic touches

### Launcher

A minimal system tray application.

- Lives in system tray/toolbar
- Right-click menu with About dialog and Quit
- About dialog styled with 98.css

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v8+)

### Setup

```bash
# Clone the repo
git clone https://github.com/PostHog/posthog-3000-installer.git
cd posthog-3000-installer

# Install dependencies
pnpm install
```

### Running Locally

```bash
# Run the installer app (with hot reload)
pnpm dev:installer

# Run the launcher app (with hot reload)
pnpm dev:launcher
```

The apps run in development mode with Vite's hot module replacement. Changes to renderer code will hot reload; changes to main process code will restart Electron.

### Building

```bash
# Build for current platform
pnpm build:installer
pnpm build:launcher

# Build for specific platform
pnpm build:installer:mac
pnpm build:installer:win
pnpm build:installer:linux
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
│           ├── main/       # System tray management
│           ├── preload/    # Preload scripts
│           └── renderer/   # About dialog
├── packages/               # Shared packages (if needed)
├── pnpm-workspace.yaml
└── package.json
```

## Tech Stack

- **Electron** + TypeScript
- **98.css** for Windows 98 aesthetic
- **Vite** for building
- **electron-builder** for packaging

## Workspace Commands

```bash
# Run command in specific app
pnpm --filter installer <command>
pnpm --filter launcher <command>

# Run command in all packages
pnpm -r typecheck
pnpm -r build

# Add dependency to specific app
pnpm --filter installer add some-package

# Add dev dependency to root
pnpm add -D -w some-dev-tool
```

## Adding a New App

1. Create `apps/new-app/` directory
2. Add `package.json` with unique name
3. Copy Electron structure from existing app
4. Add scripts to root `package.json`

## Credits

- [98.css](https://github.com/jdan/98.css) by [@jdan](https://github.com/jdan)
- InstallShield and Inno Setup for inspiration
- Windows 98 - Peak aesthetic computing

## License

MIT License - See LICENSE file

---

**Made with 💾 and 🧉 by the PostHog team in Buenos Aires 🇦🇷**
