import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import homeContent from './home-content.html?raw'
import './cookie-consent.css'

const COOKIE_CONSENT_KEY = 'hhf_cookie_consent_v1'
const LEGACY_SCRIPT_IDLE_TIMEOUT_MS = 1200
const FRANCHISE_SECTION_IDLE_TIMEOUT_MS = 2200
const TOAST_IDLE_TIMEOUT_MS = 1800

function scheduleIdleWork(callback, timeout) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  if ('requestIdleCallback' in window) {
    const idleId = window.requestIdleCallback(callback, { timeout })
    return () => window.cancelIdleCallback?.(idleId)
  }

  const timeoutId = window.setTimeout(callback, Math.min(timeout, 700))
  return () => window.clearTimeout(timeoutId)
}

function FranchiseSectionFallback() {
  const placeholderCardStyle = {
    minHeight: '230px',
    borderRadius: '24px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.92) 100%)',
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
  }

  return (
    <section
      className="section"
      id="franchises"
      aria-busy="true"
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 45%, #f8fafc 100%)',
      }}
    >
      <div
        style={{
          width: 'min(1120px, calc(100% - 2.5rem))',
          margin: '0 auto',
          color: '#0f172a',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#475569',
          }}
        >
          Franchise Opportunities
        </p>
        <h2
          style={{
            margin: '0.8rem 0 0.6rem',
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.9rem, 4vw, 3rem)',
            lineHeight: 1.08,
          }}
        >
          Loading interactive franchise showcase...
        </h2>
        <p
          style={{
            margin: '0 auto',
            maxWidth: '44rem',
            color: '#475569',
            lineHeight: 1.7,
          }}
        >
          Preparing the 3D cards, reviews, and application flow.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginTop: '1.75rem',
          }}
        >
          <div style={placeholderCardStyle} />
          <div style={placeholderCardStyle} />
          <div style={placeholderCardStyle} />
        </div>
      </div>
    </section>
  )
}

function DeferredFranchiseSection() {
  const hostRef = useRef(null)
  const [SectionComponent, setSectionComponent] = useState(null)

  useEffect(() => {
    let cancelled = false
    let hasStartedLoading = false
    let observer

    const loadSection = () => {
      if (cancelled || hasStartedLoading) return
      hasStartedLoading = true

      import('./Franchise3DSection.jsx')
        .then(({ default: Component }) => {
          if (cancelled) return
          setSectionComponent(() => Component)
        })
        .catch(() => {
          hasStartedLoading = false
        })
    }

    if (hostRef.current && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const isVisible = entries.some((entry) => entry.isIntersecting)
          if (!isVisible) return
          loadSection()
          observer.disconnect()
        },
        { rootMargin: '360px 0px' }
      )
      observer.observe(hostRef.current)
    }

    const cancelIdleLoad = scheduleIdleWork(loadSection, FRANCHISE_SECTION_IDLE_TIMEOUT_MS)

    return () => {
      cancelled = true
      observer?.disconnect()
      cancelIdleLoad()
    }
  }, [])

  if (SectionComponent) {
    return <SectionComponent />
  }

  return (
    <div ref={hostRef}>
      <FranchiseSectionFallback />
    </div>
  )
}

function App() {
  const franchiseRootRef = useRef(null)
  const [showCookieConsent, setShowCookieConsent] = useState(false)
  const [LivePurchaseToastComponent, setLivePurchaseToastComponent] = useState(null)

  useEffect(() => {
    document.body.classList.add('home-page')

    const yearSpan = document.getElementById('yearSpan')
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear()
    }

    let componentCancelled = false
    const cancelLegacyScriptLoad = scheduleIdleWork(() => {
      let legacyScript = document.querySelector('script[data-hhf-script="legacy"]')
      if (legacyScript) return

      legacyScript = document.createElement('script')
      legacyScript.src = '/script.js'
      legacyScript.async = true
      legacyScript.dataset.hhfScript = 'legacy'
      document.body.appendChild(legacyScript)
    }, LEGACY_SCRIPT_IDLE_TIMEOUT_MS)

    const cancelToastLoad = scheduleIdleWork(() => {
      import('./LivePurchaseToast.jsx')
        .then(({ default: Component }) => {
          if (componentCancelled) return
          setLivePurchaseToastComponent(() => Component)
        })
        .catch(() => {})
    }, TOAST_IDLE_TIMEOUT_MS)

    const franchiseHost = document.getElementById('franchise3d-host')
    if (franchiseHost && !franchiseRootRef.current) {
      franchiseRootRef.current = createRoot(franchiseHost)
      franchiseRootRef.current.render(<DeferredFranchiseSection />)
    }

    const normalizeHomeUrl = () => {
      const nextUrl = window.location.pathname + window.location.search
      if (window.location.hash) {
        window.history.replaceState(null, '', nextUrl)
      }
      return nextUrl
    }

    const handleHomeLinkClick = (event) => {
      const homeLink = event.target.closest('[data-home-link="true"]')
      if (!homeLink) return

      const targetUrl = new URL(homeLink.href, window.location.origin)
      const isSameHomepage =
        targetUrl.origin === window.location.origin &&
        targetUrl.pathname === window.location.pathname &&
        (!targetUrl.hash || targetUrl.hash === '#hero')

      if (!isSameHomepage) return

      event.preventDefault()
      normalizeHomeUrl()
      document.getElementById('navLinks')?.classList.remove('open')
      document.getElementById('navToggle')?.classList.remove('open')
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }

    const scrollToHashTarget = () => {
      const hash = window.location.hash
      if (!hash || hash === '#') return

      if (hash === '#hero') {
        normalizeHomeUrl()
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        return
      }

      const targetId = decodeURIComponent(hash.slice(1))
      if (!targetId) return

      let attempts = 0
      const maxAttempts = 30

      const tryScroll = () => {
        const target = document.getElementById(targetId)
        if (target) {
          target.scrollIntoView({ block: 'start' })
          return
        }

        attempts += 1
        if (attempts < maxAttempts) {
          window.setTimeout(tryScroll, 80)
        }
      }

      window.requestAnimationFrame(() => {
        window.setTimeout(tryScroll, 0)
      })
    }

    const onHashChange = () => {
      scrollToHashTarget()
    }

    window.addEventListener('hashchange', onHashChange)
    document.addEventListener('click', handleHomeLinkClick)
    scrollToHashTarget()

    try {
      const storedConsent = window.localStorage.getItem(COOKIE_CONSENT_KEY)
      setShowCookieConsent(storedConsent !== 'accepted')
    } catch {
      setShowCookieConsent(true)
    }

    return () => {
      componentCancelled = true
      cancelLegacyScriptLoad()
      cancelToastLoad()
      window.removeEventListener('hashchange', onHashChange)
      document.removeEventListener('click', handleHomeLinkClick)

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
      {LivePurchaseToastComponent ? <LivePurchaseToastComponent position="bottom-left" mobileFullWidth /> : null}

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
