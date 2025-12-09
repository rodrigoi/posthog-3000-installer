// Finish screen

import type { Screen, InstallerState } from '../../types'

export const finishScreen: Screen = {
  render(state: InstallerState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'screen finish-screen'
    screen.innerHTML = `
      <div class="finish-icon">🏁</div>

      <div class="finish-message">
        Completing the PostHog 3000 Setup Wizard
      </div>

      <p>
        Setup has finished installing PostHog 3000 on your computer.
        The application may be launched by selecting the installed shortcuts.
      </p>

      <p>
        Click <strong>Finish</strong> to exit Setup.
      </p>

      <div class="finish-options">
        <label>
          <input type="checkbox" id="launch-posthog" checked>
          Launch PostHog 3000 now
        </label>
        <label>
          <input type="checkbox" id="view-readme">
          View the README file
        </label>
      </div>

      <fieldset style="margin-top: 30px; padding: 10px;">
        <legend>Installation Summary</legend>
        <div style="font-size: 11px; line-height: 1.6;">
          <div><strong>Installation Path:</strong> ${state.installPath}</div>
          <div><strong>Components Installed:</strong> ${state.selectedComponents.length}</div>
          <div><strong>Project Name:</strong> ${state.configData.projectName || 'Not configured'}</div>
          <div><strong>Instance Type:</strong> ${state.configData.instanceType === 'cloud' ? 'PostHog Cloud' : 'Self-Hosted'}</div>
        </div>
      </fieldset>

      <p style="margin-top: 20px; font-size: 10px; color: #808080;">
        Thank you for installing PostHog 3000! For support, documentation, and updates,
        visit <strong>posthog.com</strong>
      </p>

      <p style="margin-top: 10px; font-size: 9px; color: #808080; text-align: center;">
        © 1998 PostHog Corp. All rights reserved.<br>
        PostHog 3000 is a trademark of PostHog Corp.<br>
        Windows is a trademark of Microsoft Corporation.
      </p>
    `
    return screen
  },

  setupListeners(state: InstallerState): void {
    // No special listeners needed, but we could track checkbox states if we wanted
    const launchCheckbox = document.getElementById('launch-posthog') as HTMLInputElement
    const readmeCheckbox = document.getElementById('view-readme') as HTMLInputElement

    // These don't actually do anything in this demo, but could trigger actions
    launchCheckbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement
      console.log('Launch PostHog:', target.checked)
    })

    readmeCheckbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement
      console.log('View README:', target.checked)
    })
  },

  canProceed(state: InstallerState): boolean {
    return true
  },

  onNext(state: InstallerState): void {
    // This will close the app via the Finish button
    const launchCheckbox = document.getElementById('launch-posthog') as HTMLInputElement | null
    const readmeCheckbox = document.getElementById('view-readme') as HTMLInputElement | null

    if (launchCheckbox?.checked || readmeCheckbox?.checked) {
      // In a real app, we'd launch PostHog or open the README
      console.log('Would launch PostHog or open README here')
    }
  }
}
