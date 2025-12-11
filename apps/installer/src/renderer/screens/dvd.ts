import type { Screen, InstallerState } from "../../types"
import type { DVDDrive } from "../../types/electron"

export const dvdScreen: Screen = {
  render(state: InstallerState): HTMLElement {
    const screen = document.createElement("div")
    screen.className = "screen dvd-screen"

    const { dvdState } = state
    const statusMessage = getStatusMessage(dvdState)
    const statusClass = getStatusClass(dvdState)

    screen.innerHTML = `
      <div class="welcome-title">Insert Installation DVD</div>

      <p class="welcome-text">
        Please insert the <strong>PostHog 3000 Installation DVD</strong> into your optical drive.
        The installer will verify the disc contains the required installation files.
      </p>

      <fieldset style="margin-top: 20px; padding: 15px;">
        <legend>DVD Drive Selection</legend>

        <div style="margin-bottom: 10px;">
          <label for="drive-select">Select Drive:</label>
          <select id="drive-select" style="width: 100%; margin-top: 5px; padding: 4px;">
            <option value="">-- Select a drive --</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button id="refresh-drives-btn" style="flex: 1;">Refresh Drives</button>
          <button id="check-dvd-btn" style="flex: 1;" ${
            !dvdState.selectedDrive ? "disabled" : ""
          }>
            Check DVD
          </button>
        </div>
      </fieldset>

      <fieldset style="margin-top: 20px; padding: 15px;">
        <legend>Verification Status</legend>
        <div id="status-container" class="${statusClass}" style="min-height: 60px; padding: 10px; background: #fff; border: 1px inset;">
          ${statusMessage}
        </div>
      </fieldset>
    `

    return screen
  },

  setupListeners(state, updateNav, _goNext): void {
    const driveSelect = document.getElementById(
      "drive-select"
    ) as HTMLSelectElement
    const refreshBtn = document.getElementById(
      "refresh-drives-btn"
    ) as HTMLButtonElement
    const checkBtn = document.getElementById(
      "check-dvd-btn"
    ) as HTMLButtonElement
    const statusContainer = document.getElementById("status-container")!

    // Load drives on screen load
    loadDrives(driveSelect, state, statusContainer)

    // Refresh drives button
    refreshBtn.addEventListener("click", async () => {
      refreshBtn.disabled = true
      refreshBtn.textContent = "Scanning..."
      await loadDrives(driveSelect, state, statusContainer)
      refreshBtn.disabled = false
      refreshBtn.textContent = "Refresh Drives"
      updateNav()
    })

    // Drive selection change
    driveSelect.addEventListener("change", () => {
      const selectedOption = driveSelect.options[driveSelect.selectedIndex]
      if (selectedOption && selectedOption.value) {
        state.dvdState.selectedDrive = selectedOption.value
        state.dvdState.driveName = selectedOption.text
        state.dvdState.fileVerified = false
        state.dvdState.error = null
        checkBtn.disabled = false
      } else {
        state.dvdState.selectedDrive = null
        state.dvdState.driveName = null
        checkBtn.disabled = true
      }
      updateStatus(statusContainer, state.dvdState)
      updateNav()
    })

    // Check DVD button
    checkBtn.addEventListener("click", async () => {
      if (!state.dvdState.selectedDrive) return

      state.dvdState.checking = true
      state.dvdState.error = null
      state.dvdState.fileVerified = false
      updateStatus(statusContainer, state.dvdState)
      checkBtn.disabled = true
      checkBtn.textContent = "Checking..."

      try {
        if (!window.electronAPI) {
          throw new Error("Electron API not available")
        }

        const result = await window.electronAPI.checkDVDFile(
          state.dvdState.selectedDrive,
          "posthog_dvd.png"
        )

        state.dvdState.checking = false

        if (result.exists) {
          state.dvdState.fileVerified = true
          state.dvdState.error = null
        } else {
          state.dvdState.fileVerified = false
          state.dvdState.error =
            'File "posthog_dvd.png" not found on the selected drive. Please insert a valid PostHog installation DVD.'
        }
      } catch (error) {
        state.dvdState.checking = false
        state.dvdState.fileVerified = false
        state.dvdState.error = `Error checking DVD: ${error}`
      }

      checkBtn.disabled = false
      checkBtn.textContent = "Check DVD"
      updateStatus(statusContainer, state.dvdState)
      updateNav()
    })
  },

  canProceed(state: InstallerState): boolean {
    return state.dvdState.fileVerified
  },
}

async function loadDrives(
  select: HTMLSelectElement,
  state: InstallerState,
  statusContainer: HTMLElement
): Promise<void> {
  select.innerHTML = '<option value="">-- Scanning drives... --</option>'

  if (!window.electronAPI) {
    select.innerHTML =
      '<option value="">-- Electron API not available --</option>'
    return
  }

  try {
    // First try to detect optical drives specifically
    let result = await window.electronAPI.detectDVDDrives()

    // If no optical drives found, fall back to all volumes
    if (result.success && result.drives.length === 0) {
      result = await window.electronAPI.getAllVolumes()
    }

    if (!result.success) {
      select.innerHTML = `<option value="">-- Error: ${result.error} --</option>`
      return
    }

    select.innerHTML = '<option value="">-- Select a drive --</option>'

    for (const drive of result.drives) {
      const option = document.createElement("option")
      option.value = drive.path
      option.text = `${drive.name} (${drive.path})${
        drive.isOptical ? " [Optical]" : ""
      }`
      select.appendChild(option)
    }

    // Re-select previously selected drive if still available
    if (state.dvdState.selectedDrive) {
      const driveStillExists = result.drives.some(
        (d: DVDDrive) => d.path === state.dvdState.selectedDrive
      )
      if (driveStillExists) {
        select.value = state.dvdState.selectedDrive
      } else {
        // Drive was removed
        state.dvdState.selectedDrive = null
        state.dvdState.driveName = null
        state.dvdState.fileVerified = false
        updateStatus(statusContainer, state.dvdState)
      }
    }
  } catch (error) {
    select.innerHTML = `<option value="">-- Error scanning: ${error} --</option>`
  }
}

function getStatusMessage(dvdState: InstallerState["dvdState"]): string {
  if (dvdState.checking) {
    return `
      <div style="text-align: center;">
        <div>Checking DVD...</div>
        <div style="margin-top: 10px; font-size: 20px;">&#8987;</div>
      </div>
    `
  }

  if (dvdState.fileVerified) {
    return `
      <div style="color: #006400;">
        <strong>&#10004; DVD Verified Successfully!</strong>
        <div style="margin-top: 5px; font-size: 11px;">
          Drive: ${dvdState.driveName || dvdState.selectedDrive}<br>
          File "posthog_dvd.png" found on disc.
        </div>
        <div style="margin-top: 10px;">Click <strong>Next</strong> to continue installation.</div>
      </div>
    `
  }

  if (dvdState.error) {
    return `
      <div style="color: #8B0000;">
        <strong>&#10008; Verification Failed</strong>
        <div style="margin-top: 5px; font-size: 11px;">${dvdState.error}</div>
      </div>
    `
  }

  if (dvdState.selectedDrive) {
    return `
      <div>
        Drive selected: <strong>${
          dvdState.driveName || dvdState.selectedDrive
        }</strong><br>
        <div style="margin-top: 10px;">Click <strong>Check DVD</strong> to verify the installation disc.</div>
      </div>
    `
  }

  return `
    <div style="color: #666;">
      No drive selected.<br>
      Please select a drive from the dropdown above and click <strong>Check DVD</strong>.
    </div>
  `
}

function getStatusClass(dvdState: InstallerState["dvdState"]): string {
  if (dvdState.fileVerified) return "status-success"
  if (dvdState.error) return "status-error"
  return "status-pending"
}

function updateStatus(
  container: HTMLElement,
  dvdState: InstallerState["dvdState"]
): void {
  container.innerHTML = getStatusMessage(dvdState)
  container.className = getStatusClass(dvdState)
}
