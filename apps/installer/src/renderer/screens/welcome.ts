// Welcome screen

import type { Screen, InstallerState } from '../../types'

export const welcomeScreen: Screen = {
  render(state: InstallerState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'screen welcome-screen'
    screen.innerHTML = `
      <div class="welcome-title">Welcome to the PostHog 3000 Setup Wizard</div>

      <p class="welcome-text">
        This wizard will guide you through the installation of <strong>PostHog 3000</strong>,
        the premier analytics platform for engineers who appreciate classic software design.
      </p>

      <p class="welcome-text">
        PostHog 3000 provides product analytics, session replay, feature flags, A/B testing,
        and more - all with the timeless elegance of 1998 software aesthetics.
      </p>

      <p class="welcome-text">
        It is recommended that you close all other applications before continuing.
        This will make it possible to update relevant system files without having to
        reboot your computer.
      </p>

      <p class="welcome-text">
        Click <strong>Next</strong> to continue, or <strong>Cancel</strong> to exit Setup.
      </p>

      <fieldset style="margin-top: 30px; padding: 10px;">
        <legend>System Information</legend>
        <div style="font-size: 11px;">
          <div>Platform: ${window.electronAPI?.platform || 'web'}</div>
          <div>Version: ${window.electronAPI?.version || '98.0.1998'}</div>
          <div>Free Disk Space: 420 MB (estimated)</div>
        </div>
      </fieldset>
    `
    return screen
  },

  canProceed(state: InstallerState): boolean {
    return true
  }
}
