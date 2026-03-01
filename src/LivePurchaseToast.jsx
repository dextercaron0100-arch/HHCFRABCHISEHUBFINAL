import { useEffect, useMemo, useRef, useState } from 'react'
import './live-purchase-toast.css'

const purchases = [
  { name: 'Maria', product: 'Premium Franchise Package', location: 'Quezon City' },
  { name: 'John', product: 'Starter Franchise Package', location: 'Makati' },
  { name: 'Ana', product: 'Business Consultation', location: 'Cebu' },
  { name: 'Carlo', product: 'Franchise Kit', location: 'Davao' },
  { name: 'Liza', product: 'Growth Package', location: 'Taguig' },
  { name: 'Paolo', product: 'Site Visit Consultation', location: 'Pasig' },
  { name: 'Jessa', product: 'Starter Package', location: 'Manila' },
  { name: 'Mark', product: 'Expansion Planning Call', location: 'Antipolo' },
]

const INITIAL_DELAY_MS = 30000
const SHOW_INTERVAL_MS = 30000
const DISPLAY_DURATION_MS = 4200
const RESUME_HIDE_MS = 2200

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getTimeAgo() {
  const mins = rand(1, 29)
  return `${mins} min${mins > 1 ? 's' : ''} ago`
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function positionClass(position) {
  switch (position) {
    case 'bottom-right':
      return 'toast-pos-bottom-right'
    case 'top-left':
      return 'toast-pos-top-left'
    case 'top-right':
      return 'toast-pos-top-right'
    case 'bottom-left':
    default:
      return 'toast-pos-bottom-left'
  }
}

function LivePurchaseToast({ position = 'bottom-left', compact = false, mobileFullWidth = true }) {
  const [visible, setVisible] = useState(false)
  const [idx, setIdx] = useState(0)
  const [timeAgo, setTimeAgo] = useState(getTimeAgo())
  const [hovered, setHovered] = useState(false)

  const hideTimer = useRef(null)
  const nextTimer = useRef(null)
  const startTimer = useRef(null)

  const current = useMemo(() => purchases[idx % purchases.length], [idx])

  useEffect(() => {
    let stopped = false

    const clearTimers = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
      if (nextTimer.current) clearTimeout(nextTimer.current)
      if (startTimer.current) clearTimeout(startTimer.current)
    }

    const scheduleCycle = (delay = SHOW_INTERVAL_MS) => {
      if (stopped) return
      nextTimer.current = setTimeout(() => {
        if (stopped) return
        setIdx((prev) => (prev + 1) % purchases.length)
        setTimeAgo(getTimeAgo())
        setVisible(true)

        hideTimer.current = setTimeout(() => {
          setVisible(false)
          scheduleCycle(SHOW_INTERVAL_MS)
        }, DISPLAY_DURATION_MS)
      }, delay)
    }

    startTimer.current = setTimeout(() => {
      if (stopped) return
      setTimeAgo(getTimeAgo())
      setVisible(true)
      hideTimer.current = setTimeout(() => {
        setVisible(false)
        scheduleCycle(SHOW_INTERVAL_MS)
      }, DISPLAY_DURATION_MS)
    }, INITIAL_DELAY_MS)

    return () => {
      stopped = true
      clearTimers()
    }
  }, [])

  useEffect(() => {
    if (!visible || !hovered) return

    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }, [hovered, visible])

  useEffect(() => {
    if (!visible || hovered) return

    if (!hideTimer.current) {
      hideTimer.current = setTimeout(() => {
        setVisible(false)
      }, RESUME_HIDE_MS)
    }
  }, [hovered, visible])

  if (!current) return null

  const hiddenClass = position.includes('top') ? 'is-hidden-top' : 'is-hidden-bottom'

  return (
    <div
      aria-live="polite"
      className={[
        'live-purchase-toast',
        positionClass(position),
        compact ? 'compact' : '',
        mobileFullWidth ? 'mobile-full' : '',
        visible ? 'is-visible' : hiddenClass,
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="live-purchase-toast-inner">
        <div className="live-purchase-toast-row">
          <div className="live-purchase-toast-avatar">
            {initials(current.name)}
            <span className="live-purchase-toast-check" aria-hidden="true">
              ✓
            </span>
          </div>

          <div className="live-purchase-toast-copy">
            <p className="live-purchase-toast-title">
              <span>{current.name}</span> just purchased
            </p>
            <p className="live-purchase-toast-product">{current.product}</p>
            <p className="live-purchase-toast-meta">
              {current.location} • {timeAgo}
            </p>
          </div>

          <div className="live-purchase-toast-badge">Live</div>
        </div>

        <div className="live-purchase-toast-progress">
          <div
            key={`${idx}-${timeAgo}`}
            className={[
              'live-purchase-toast-progress-fill',
              visible && !hovered ? 'animate' : 'static',
            ].join(' ')}
          />
        </div>
      </div>
    </div>
  )
}

export default LivePurchaseToast
