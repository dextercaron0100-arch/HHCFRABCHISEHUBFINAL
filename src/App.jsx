import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import homeContent from './home-content.html?raw'
import Franchise3DSection from './Franchise3DSection.jsx'
import LivePurchaseToast from './LivePurchaseToast.jsx'
import './cookie-consent.css'

const COOKIE_CONSENT_KEY = 'hhf_cookie_consent_v1'

function App() {
  const franchiseRootRef = useRef(null)
  const [showCookieConsent, setShowCookieConsent] = useState(false)

  useEffect(() => {
    document.body.classList.add('home-page')

    const yearSpan = document.getElementById('yearSpan')
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear()
    }

    let legacyScript = document.querySelector('script[data-hhf-script="legacy"]')
    if (!legacyScript) {
      legacyScript = document.createElement('script')
      legacyScript.src = '/script.js'
      legacyScript.defer = true
      legacyScript.dataset.hhfScript = 'legacy'
      document.body.appendChild(legacyScript)
    }

    const franchiseHost = document.getElementById('franchise3d-host')
    if (franchiseHost && !franchiseRootRef.current) {
      franchiseRootRef.current = createRoot(franchiseHost)
      franchiseRootRef.current.render(<Franchise3DSection />)
    }

    try {
      const storedConsent = window.localStorage.getItem(COOKIE_CONSENT_KEY)
      setShowCookieConsent(storedConsent !== 'accepted')
    } catch {
      setShowCookieConsent(true)
    }

    return () => {
      if (franchiseRootRef.current) {
        franchiseRootRef.current.unmount()
        franchiseRootRef.current = null
      }
      document.body.classList.remove('home-page')
    }
  }, [])

  const handleAcceptCookies = () => {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    } catch {
      // Ignore storage errors and just close the notice.
    }
    setShowCookieConsent(false)
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: homeContent }} />
      <LivePurchaseToast position="bottom-left" mobileFullWidth />

      {showCookieConsent ? (
        <aside className="cookie-consent-wrap" aria-live="polite" aria-label="Cookie notice">
          <div className="cookie-consent-card">
            <div className="cookie-consent-content">
              <span className="cookie-consent-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="46" width="65" aria-hidden="true">
                  <path
                    stroke="#000"
                    fill="#EAB789"
                    d="M49.157 15.69L44.58.655l-12.422 1.96L21.044.654l-8.499 2.615-6.538 5.23-4.576 9.153v11.114l4.576 8.5 7.846 5.23 10.46 1.96 7.845-2.614 9.153 2.615 11.768-2.615 7.846-7.846 1.96-5.884.655-7.191-7.846-1.308-6.537-3.922z"
                  />
                  <path
                    fill="#9C6750"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M32.286 3.749c-6.94 3.65-11.69 11.053-11.69 19.591 0 8.137 4.313 15.242 10.724 19.052a20.513 20.513 0 01-8.723 1.937c-11.598 0-21-9.626-21-21.5 0-11.875 9.402-21.5 21-21.5 3.495 0 6.79.874 9.689 2.42z"
                  />
                  <path
                    fill="#634647"
                    d="M64.472 20.305a.954.954 0 00-1.172-.824 4.508 4.508 0 01-3.958-.934.953.953 0 00-1.076-.11c-.46.252-.977.383-1.502.382a3.154 3.154 0 01-2.97-2.11.954.954 0 00-.833-.634 4.54 4.54 0 01-4.205-4.507c.002-.23.022-.46.06-.687a.952.952 0 00-.213-.767 3.497 3.497 0 01-.614-3.5.953.953 0 00-.382-1.138 3.522 3.522 0 01-1.5-3.992.951.951 0 00-.762-1.227A22.611 22.611 0 0032.3 2.16 22.41 22.41 0 0022.657.001a22.654 22.654 0 109.648 43.15 22.644 22.644 0 0032.167-22.847zM22.657 43.4a20.746 20.746 0 110-41.493c2.566-.004 5.11.473 7.501 1.407a22.64 22.64 0 00.003 38.682 20.6 20.6 0 01-7.504 1.404zm19.286 0a20.746 20.746 0 112.131-41.384 5.417 5.417 0 001.918 4.635 5.346 5.346 0 00-.133 1.182A5.441 5.441 0 0046.879 11a5.804 5.804 0 00-.028.568 6.456 6.456 0 005.38 6.345 5.053 5.053 0 006.378 2.472 6.412 6.412 0 004.05 1.12 20.768 20.768 0 01-20.716 21.897z"
                  />
                </svg>
              </span>

              <h5 className="cookie-consent-title">Your privacy is important to us</h5>
              <p className="cookie-consent-text">
                This page uses cookies to measure and improve our site, support campaigns, and personalize content.
                For more details, please review our{' '}
                <a className="cookie-consent-link" href="#">
                  Privacy Policy
                </a>
                .
              </p>

              <button className="cookie-consent-options" type="button">
                More Options
              </button>

              <button className="cookie-consent-accept" type="button" onClick={handleAcceptCookies}>
                Accept
              </button>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  )
}

export default App
