import type { Screen } from "../../types"

export const finishScreen: Screen = {
  render(): HTMLElement {
    const screen = document.createElement("div")
    screen.className = "screen finish-screen"
    screen.innerHTML = `
      <div class="finish-icon">🏁</div>

      <div class="finish-message">
        Completing the PostHog 3000 Demo Setup Wizard
      </div>

      <p>
        Setup has finished installing the PostHog 3000 Demo on your computer.
        The application may be launched by selecting the installed shortcuts.
      </p>

      <p>
        Click <strong>Finish</strong> to exit Setup.
      </p>

      <div class="finish-options">
        <div class="field-row">
          <input type="checkbox" id="launch-posthog" checked>
          <label for="launch-posthog">Launch PostHog 3000 Demo now</label>
        </div>
        <div class="field-row">
          <input type="checkbox" id="view-readme">
          <label for="view-readme">View the README file</label>
        </div>
      </div>

      <p style="margin-top: 30px; font-size: 10px; color: #808080;">
        Thank you for installing the PostHog 3000 Demo! For support, documentation, and updates,
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

  setupListeners(): void {
    // No special listeners needed, but we could track checkbox states if we wanted
    const launchCheckbox = document.getElementById(
      "launch-posthog"
    ) as HTMLInputElement
    const readmeCheckbox = document.getElementById(
      "view-readme"
    ) as HTMLInputElement

    // These don't actually do anything in this demo, but could trigger actions
    launchCheckbox.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement
      console.log("Launch PostHog:", target.checked)
    })

    readmeCheckbox.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement
      console.log("View README:", target.checked)
    })
  },

  canProceed(): boolean {
    return true
  },

  onNext(): void {
    // This will close the app via the Finish button
    const launchCheckbox = document.getElementById(
      "launch-posthog"
    ) as HTMLInputElement | null
    const readmeCheckbox = document.getElementById(
      "view-readme"
    ) as HTMLInputElement | null

    if (launchCheckbox?.checked || readmeCheckbox?.checked) {
      // In a real app, we'd launch PostHog or open the README
      console.log("Would launch PostHog or open README here")
    }
  },
}
