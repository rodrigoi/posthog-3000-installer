// About window main script
import '98.css'
import './styles.css'

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

function init(): void {
  const okBtn = document.getElementById('ok-btn')
  const closeBtn = document.getElementById('close-btn')

  // Close window when OK is clicked
  okBtn?.addEventListener('click', () => {
    window.close()
  })

  // Close window when X button is clicked
  closeBtn?.addEventListener('click', () => {
    window.close()
  })
}
