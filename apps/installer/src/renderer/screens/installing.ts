import { advanceFromInstalling } from "../main"
import type { Screen, InstallerState } from "../../types"

const FAKE_FILES: string[] = [
  "posthog-core.dll",
  "analytics-engine.exe",
  "event-processor.sys",
  "session-replay.ocx",
  "replay-player.dll",
  "feature-flags.exe",
  "flag-evaluator.dll",
  "hedgehog-icon.ico",
  "posthog3000-demo.exe",
  "readme.txt",
  "license.txt",
]

const INSTALL_PATH = "C:\\Program Files\\PostHog3000"

export const installingScreen: Screen = {
  render(): HTMLElement {
    const screen = document.createElement("div")
    screen.className = "screen installing-screen"
    screen.innerHTML = `
      <h2>Installing PostHog 3000 Demo</h2>

      <p>Please wait while Setup installs the PostHog 3000 Demo on your computer.</p>

      <div class="progress-container">
        <div class="progress-label">Installation Progress:</div>
        <progress id="install-progress" max="100" value="0"></progress>
      </div>

      <div class="file-list" id="file-list">
        <div style="color: #808080;">Preparing installation...</div>
      </div>

      <div class="status-text" id="status-text">
        Initializing setup routines...
      </div>
    `
    return screen
  },

  setupListeners(state: InstallerState, _updateNav: () => void): void {
    // Start the fake installation process
    setTimeout(() => {
      startFakeInstallation(state)
    }, 500)
  },

  canProceed(state: InstallerState): boolean {
    return state.installComplete
  },
}

async function startFakeInstallation(state: InstallerState): Promise<void> {
  const progressBar = document.getElementById('install-progress') as HTMLProgressElement
  const fileList = document.getElementById('file-list')!
  const statusText = document.getElementById('status-text')!

  fileList.innerHTML = ''

  // Helper to add log message
  const addLogMessage = (message: string, color: string = '#000000') => {
    const logItem = document.createElement('div')
    logItem.className = 'file-item'
    logItem.style.color = color
    logItem.textContent = message
    fileList.appendChild(logItem)
    fileList.scrollTop = fileList.scrollHeight
  }

  try {
    // Step 1: Check for multi-DVD installation
    progressBar.value = 5
    statusText.textContent = 'Checking for installation media...'
    addLogMessage('Checking DVD configuration...')

    const dvdInfo = await window.electronAPI?.getMissingDVDs()

    if (dvdInfo && dvdInfo.total > 1) {
      addLogMessage(`Multi-DVD installation detected (${dvdInfo.total} discs)`, '#0000FF')

      // Sequential disc processing
      for (let discNum = 1; discNum <= dvdInfo.total; discNum++) {
        statusText.textContent = `Processing Disc ${discNum} of ${dvdInfo.total}...`
        addLogMessage(`\n=== Disc ${discNum} of ${dvdInfo.total} ===`, '#0000FF')

        // Check if this disc is currently mounted
        const currentInfo = await window.electronAPI?.getMissingDVDs()
        const isDiscMounted = currentInfo && !currentInfo.missing.includes(discNum)

        if (!isDiscMounted) {
          // Prompt user to insert disc
          addLogMessage(`Please insert Disc ${discNum}`, '#FF8800')

          const confirmed = confirm(`Please insert PostHog 3000 Installation Disc ${discNum} of ${dvdInfo.total}\n\nClick OK when ready.`)
          if (!confirmed) {
            throw new Error('Installation cancelled by user')
          }

          // Wait a moment for disc to mount
          await new Promise(resolve => setTimeout(resolve, 2000))

          // Verify disc is now mounted
          const verifyInfo = await window.electronAPI?.getMissingDVDs()
          if (verifyInfo && verifyInfo.missing.includes(discNum)) {
            throw new Error(`Disc ${discNum} not detected. Please ensure it is properly inserted.`)
          }

          addLogMessage(`Disc ${discNum} detected ✓`, '#008000')
        } else {
          addLogMessage(`Disc ${discNum} already mounted ✓`, '#008000')
        }

        // Copy launcher from Disc 1 (before it gets ejected)
        if (discNum === 1 && window.electronAPI?.copyLauncherToTemp) {
          addLogMessage('Copying launcher to temp directory...')
          const launcherCopyResult = await window.electronAPI.copyLauncherToTemp()

          if (launcherCopyResult.success) {
            addLogMessage('Launcher copied to temp ✓', '#008000')
          } else {
            addLogMessage(`Warning: ${launcherCopyResult.error}`, '#FF8800')
          }
        }

        // Copy tar parts from this disc
        if (window.electronAPI?.copyTarPartsFromDisc) {
          addLogMessage(`Copying files from Disc ${discNum}...`)
          const copyResult = await window.electronAPI.copyTarPartsFromDisc()

          if (!copyResult.success) {
            throw new Error(copyResult.error || 'Failed to copy files from disc')
          }

          if (copyResult.partsCopied > 0) {
            addLogMessage(`Copied ${copyResult.partsCopied} file(s) from Disc ${discNum} ✓`, '#008000')
          } else {
            addLogMessage(`No new files on Disc ${discNum}`, '#808080')
          }
        }

        // Update progress
        const discProgress = 10 + Math.floor((discNum / dvdInfo.total) * 10)
        progressBar.value = discProgress
      }

      addLogMessage('\nAll discs processed ✓', '#008000')
    } else if (dvdInfo && dvdInfo.total === 1) {
      addLogMessage('Single disc installation')

      // Copy launcher to temp
      if (window.electronAPI?.copyLauncherToTemp) {
        addLogMessage('Copying launcher to temp directory...')
        const launcherCopyResult = await window.electronAPI.copyLauncherToTemp()

        if (launcherCopyResult.success) {
          addLogMessage('Launcher copied to temp ✓', '#008000')
        } else {
          addLogMessage(`Warning: ${launcherCopyResult.error}`, '#FF8800')
        }
      }

      // Copy tar parts from single disc
      if (window.electronAPI?.copyTarPartsFromDisc) {
        const copyResult = await window.electronAPI.copyTarPartsFromDisc()
        if (copyResult.partsCopied > 0) {
          addLogMessage(`Copied ${copyResult.partsCopied} file(s) ✓`, '#008000')
        }
      }
    } else {
      addLogMessage('No DVD installation detected')
    }

    // Step 2: Install PostHogStack.pkg
    progressBar.value = 20
    statusText.textContent = 'Installing PostHogStack...'
    addLogMessage('Starting PostHogStack installation...')

    if (window.electronAPI?.installPKG) {
      addLogMessage('This will prompt for administrator password...', '#0000FF')
      const pkgResult = await window.electronAPI.installPKG()

      if (pkgResult.success) {
        addLogMessage('PostHogStack installed successfully ✓', '#008000')
      } else {
        throw new Error(pkgResult.error || 'PKG installation failed')
      }
    } else {
      addLogMessage('Skipping PKG installation (API not available)', '#808080')
    }

    // Step 3: Install Launcher
    progressBar.value = 60
    statusText.textContent = 'Installing Launcher...'
    addLogMessage('Installing PostHog 3000 Launcher...')

    if (window.electronAPI?.installLauncher) {
      const launcherResult = await window.electronAPI.installLauncher()

      if (launcherResult.success) {
        addLogMessage(`Launcher installed to ${launcherResult.launcherPath} ✓`, '#008000')
      } else {
        // Non-fatal error
        addLogMessage(`Warning: ${launcherResult.error}`, '#FF8800')
      }
    } else {
      addLogMessage('Skipping Launcher installation (API not available)', '#808080')
    }

    // Step 4: Fake remaining installation for aesthetics
    progressBar.value = 80
    statusText.textContent = 'Finalizing installation...'

    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 300))
      addLogMessage(`${INSTALL_PATH}\\${FAKE_FILES[i]}`)
    }

    // Complete
    progressBar.value = 100
    statusText.textContent = 'Installation complete!'

    const completeItem = document.createElement('div')
    completeItem.className = 'file-item'
    completeItem.style.color = '#008000'
    completeItem.style.fontWeight = 'bold'
    completeItem.textContent = 'Setup completed successfully.'
    fileList.appendChild(completeItem)
    fileList.scrollTop = fileList.scrollHeight

    state.installComplete = true

    // Auto-advance
    setTimeout(() => {
      advanceFromInstalling()
    }, 1500)

  } catch (error) {
    progressBar.value = 0
    statusText.textContent = 'Installation failed'
    addLogMessage(`Error: ${error}`, '#FF0000')
    addLogMessage('Please check the logs and try again.', '#FF0000')

    // Don't auto-advance on error
    state.installComplete = false
  }
}
