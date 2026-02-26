import { useEffect } from 'react'
import homeContent from './home-content.html?raw'

function App() {
  useEffect(() => {
    const yearSpan = document.getElementById('yearSpan')
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear()
    }

    const contactForm = document.getElementById('contactForm')
    const contactStatus = document.getElementById('contactStatus')
    const contactSubmit = document.getElementById('contactSubmit')

    const handleSubmit = async (event) => {
      event.preventDefault()

      if (contactSubmit) {
        contactSubmit.disabled = true
        contactSubmit.textContent = 'Sending...'
      }

      const formData = new FormData(contactForm)

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          throw new Error('Network error')
        }

        if (contactStatus) {
          contactStatus.style.display = 'block'
          contactStatus.style.color = '#22c55e'
          contactStatus.textContent = 'Thanks! Your message was sent successfully.'
        }

        contactForm.reset()
      } catch {
        if (contactStatus) {
          contactStatus.style.display = 'block'
          contactStatus.style.color = '#f97316'
          contactStatus.textContent =
            'Something went wrong. Please email info@hhcfranchisehub.com.'
        }
      } finally {
        if (contactSubmit) {
          contactSubmit.disabled = false
          contactSubmit.textContent = 'Send message'
        }
      }
    }

    if (contactForm) {
      contactForm.addEventListener('submit', handleSubmit)
    }

    let legacyScript = document.querySelector('script[data-hhf-script="legacy"]')
    if (!legacyScript) {
      legacyScript = document.createElement('script')
      legacyScript.src = '/script.js'
      legacyScript.defer = true
      legacyScript.dataset.hhfScript = 'legacy'
      document.body.appendChild(legacyScript)
    }

    return () => {
      if (contactForm) {
        contactForm.removeEventListener('submit', handleSubmit)
      }
    }
  }, [])

  return (
    <div dangerouslySetInnerHTML={{ __html: homeContent }} />
  )
}

export default App
