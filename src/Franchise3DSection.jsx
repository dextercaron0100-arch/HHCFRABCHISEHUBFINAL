import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  Store,
  User,
  Wallet,
  X,
} from 'lucide-react'
import './franchise3d.css'

const CATEGORY_DESCRIPTIONS = {
  Retail: 'Retail concepts with strong unit economics and clear playbooks to scale.',
  'Health & Wellness':
    'Service and product models built around retention, memberships, and recurring demand.',
  Food: 'High-velocity concepts designed for strong throughput, value positioning, and repeat visits.',
}

const DATA = {
  Retail: [
    {
      id: 'bigstop',
      name: 'Bigstop',
      tag: 'Top Pick',
      title: 'Neighborhood essentials',
      description:
        'Bigstop is the newest lifestyle convenience store in the Philippines, offering multiple businesses under one roof. The "6 in 1 Package" is designed to maximize your earning potential in one compact store - it includes local goods and Korean products, quickbites, Herrera Pharmacy, DIY Ramyun Station, Payment center bills and ATM Services. A complete lifestyle hub for your community.',
      href: 'bigstop',
      cta: 'Get Started',
      logo: 'bigstop shape.png',
      logoVariant: 'wide',
      gradient: 'linear-gradient(170deg, #0d3f99 0%, #1f60bf 42%, #cc2b52 76%, #f1bb2e 100%)',
      stats: ['Daily-demand products', 'Compact footprint', 'Community utility'],
    },
  ],
  'Health & Wellness': [
    {
      id: 'herrera',
      name: 'Herrera Pharmacy',
      tag: 'Trusted Format',
      title: 'Trusted community pharmacy',
      description:
        'Affordable medicines, branded and generic, with personalized healthcare support for every Filipino family. Herrera Pharmacy is your trusted community pharmacy franchise offering quality healthcare access to communities nationwide.',
      href: 'herrera-pharmacy',
      cta: 'Get Started',
      logo: 'Copy of hp final logo vertical.png',
      logoVariant: 'tall',
      gradient: 'linear-gradient(170deg, #0f3b5d 0%, #16739b 45%, #0da868 70%, #d9e53d 100%)',
      stats: ['Healthcare essentials', 'Community trust', 'Operational simplicity'],
    },
  ],
  Food: [
    {
      id: 'boss-siomai',
      name: 'Boss Siomai',
      tag: 'Most Popular',
      title: 'Best-selling siomai concept',
      description:
        'Boss Siomai is known for serving delicious, affordable, and high-quality siomai loved by many Filipinos. What started as a simple food stall concept has become a trusted negosyo opportunity for aspiring entrepreneurs.',
      href: 'boss-siomai',
      cta: 'Get Started',
      logo: 'Copy of BOSS SIOMAI2 horizontal.png',
      logoVariant: 'wide',
      gradient: 'linear-gradient(170deg, #0d3f99 0%, #2b5fd5 42%, #c23474 72%, #f1bb2e 100%)',
      stats: ['High foot traffic', 'Repeat customers', 'Strong brand recall'],
      details: {
        investment: [
          ['Franchise Fee', 'PHP 250,000'],
          ['Total Package', 'PHP 1,750,000'],
          ['Contract Term', '5 years'],
          ['Royalty Fee', '10% net income'],
        ],
        services: ['Food Stall Operations', 'Marketing Support', 'Centralized Supply', 'Training & Launch'],
      },
    },
    {
      id: 'boss-chickn',
      name: 'Boss Chickn',
      tag: 'Crowd Favorite',
      title: 'Crispy crowd favorite',
      description:
        'Savor the crispy, juicy goodness of Boss Chicken - a Filipino favorite that delivers bold flavors in every bite. Perfect for entrepreneurs looking to bring a crowd-pleasing chicken concept to their community.',
      href: 'boss-chickn',
      cta: 'Get Started',
      logo: 'Copy of BOSS CHICKN LANDSCAPE LOGO.png',
      logoVariant: 'wide',
      gradient: 'linear-gradient(170deg, #8f1119 0%, #e02a1f 54%, #f2b22d 100%)',
      stats: ['Crispy specialty', 'Affordable menu', 'Fast service flow'],
      details: {
        investment: [
          ['Franchise Fee', 'PHP 280,000'],
          ['Total Package', 'PHP 1,900,000'],
          ['Contract Term', '5 years'],
          ['Royalty Fee', '10% net income'],
        ],
        services: ['Chicken Menu Line', 'Supply Chain Access', 'Store Setup Support', 'Crew Training'],
      },
    },
    {
      id: 'noodle-king',
      name: 'Noodle King',
      tag: 'High Demand',
      title: 'Bold Asian-inspired bowls',
      description:
        "Noodle King brings bold Asian-inspired dishes that satisfy every appetite. With its strong customer appeal and affordable setup, Noodle King is a smart choice for aspiring entrepreneurs who want a food business that's both in-demand and rewarding.",
      href: 'noodle-king',
      cta: 'Get Started',
      logo: 'Copy of noodle king logo.png',
      logoVariant: 'wide',
      gradient: 'linear-gradient(170deg, #2a0f12 0%, #8a1217 54%, #f3aa26 100%)',
      stats: ['Comfort food demand', 'Affordable setup', 'Broad customer appeal'],
      details: {
        investment: [
          ['Franchise Fee', 'PHP 300,000'],
          ['Total Package', 'PHP 2,100,000'],
          ['Contract Term', '5 years'],
          ['Royalty Fee', '10% net income'],
        ],
        services: ['Bowl Station Setup', 'Recipe & Prep Training', 'Marketing Materials', 'Operational Manual'],
      },
    },
    {
      id: 'burger-2go',
      name: 'Burger 2 Go',
      tag: 'Value Picks',
      title: 'Value-driven favorites',
      description:
        'Buy 1 Take 1 burgers, footlong hotdogs, chicken sandwiches and more. Premium taste at affordable prices - Burger 2 Go is the perfect franchise for high-traffic areas where customers want great value and delicious food on the go.',
      href: 'burger2go',
      cta: 'Get Started',
      logo: 'Burger2Go_Official Logo.png',
      logoVariant: 'wide',
      gradient: 'linear-gradient(170deg, #6a1c20 0%, #c7471f 52%, #f29d1f 100%)',
      stats: ['Value menu', 'Fast prep', 'Traffic-ready concept'],
      details: {
        investment: [
          ['Franchise Fee', 'PHP 260,000'],
          ['Total Package', 'PHP 1,850,000'],
          ['Contract Term', '5 years'],
          ['Royalty Fee', '10% net income'],
        ],
        services: ['Burger & Hotdog Line', 'Launch Assistance', 'Inventory Planning', 'Product Training'],
      },
    },
    {
      id: 'boss-fries',
      name: 'Boss Fries',
      tag: 'Snack Favorite',
      title: 'Crispy, craveable fries',
      description:
        'Indulge in the irresistible goodness of Boss Fries made to satisfy every craving. Freshly cooked, golden, and extra crispy on the outside, soft and fluffy on the inside. Coated with rich and flavorful seasonings - every bite delivers a burst of sarap that hits just right.',
      href: 'boss-fries',
      cta: 'Get Started',
      logo: 'Copy of boss fries mascot.png',
      logoVariant: 'wide',
      gradient: 'linear-gradient(170deg, #efc12e 0%, #d59d1c 52%, #b47613 100%)',
      stats: ['Crave-driven snacks', 'Easy workflow', 'Flavor-forward menu'],
      details: {
        investment: [
          ['Franchise Fee', 'PHP 230,000'],
          ['Total Package', 'PHP 1,650,000'],
          ['Contract Term', '5 years'],
          ['Royalty Fee', '10% net income'],
        ],
        services: ['Fries Station', 'Flavor Program', 'Brand Marketing', 'Store Support'],
      },
    },
  ],
}

const NEXT_STEPS = [
  {
    title: 'Choose a category',
    description: 'Pick Retail, Wellness, or Food based on your business goals.',
  },
  {
    title: 'Review requirements',
    description: 'Check investment, location fit, and daily operations workflow.',
  },
  {
    title: 'Launch with support',
    description: 'Get onboarding, training, setup, and opening guidance from our team.',
  },
]

const FRANCHISE_REVIEWS = [
  {
    id: 1,
    name: 'Mark Dela Cruz',
    role: 'Franchise Owner',
    location: 'Quezon City',
    rating: 5,
    date: 'Jan 2026',
    businessAge: 'Operating for 1 year',
    quote:
      'The onboarding process was smooth and professional. The support team helped us launch on schedule, and our first 3 months exceeded our sales target.',
    metrics: [
      { label: 'Launch Time', value: '21 days' },
      { label: 'Sales Growth', value: '+38%' },
      { label: 'Branches', value: '1' },
    ],
  },
  {
    id: 2,
    name: 'Ana Reyes',
    role: 'Multi-Branch Franchisee',
    location: 'Pasig City',
    rating: 5,
    date: 'Dec 2025',
    businessAge: 'Operating for 2 years',
    quote:
      'What impressed me most is the consistency of operations. From supplier coordination to marketing support, the team is highly responsive and professional.',
    metrics: [
      { label: 'Branches', value: '2' },
      { label: 'ROI Window', value: '11 mos' },
      { label: 'Support', value: 'Excellent' },
    ],
  },
  {
    id: 3,
    name: 'Jasper Lim',
    role: 'Franchise Partner',
    location: 'Cebu City',
    rating: 5,
    date: 'Nov 2025',
    businessAge: 'Operating for 10 months',
    quote:
      "This franchise model is beginner-friendly but still strong enough for experienced operators. Training is practical, and SOPs are easy for staff to follow.",
    metrics: [
      { label: 'Training', value: 'Hands-on' },
      { label: 'Ramp-Up', value: '2 weeks' },
      { label: 'Traffic', value: 'High' },
    ],
  },
  {
    id: 4,
    name: 'Rhea Santos',
    role: 'Branch Operator',
    location: 'Makati City',
    rating: 4,
    date: 'Oct 2025',
    businessAge: 'Operating for 8 months',
    quote:
      'The system and branding are strong. There were minor adjustments during opening month, but the support team resolved them quickly and clearly.',
    metrics: [
      { label: 'Support', value: 'Very Good' },
      { label: 'Resolution', value: '<24 hrs' },
      { label: 'Retention', value: 'Strong' },
    ],
  },
  {
    id: 5,
    name: 'Paolo Mendoza',
    role: 'Investor-Franchisee',
    location: 'Davao City',
    rating: 5,
    date: 'Sep 2025',
    businessAge: 'Operating for 1.5 years',
    quote:
      'I compared multiple franchise options before choosing this one. The real value is in the systems, brand support, and realistic projections.',
    metrics: [
      { label: 'ROI Progress', value: 'On Track' },
      { label: 'Marketing', value: 'Consistent' },
      { label: 'Ops Ease', value: 'High' },
    ],
  },
  {
    id: 6,
    name: 'Christine Lopez',
    role: 'First-Time Business Owner',
    location: 'Taguig City',
    rating: 5,
    date: 'Aug 2025',
    businessAge: 'Operating for 7 months',
    quote:
      'As a first-time owner, I needed guidance. The training gave me confidence, and the launch checklist helped us avoid costly mistakes.',
    metrics: [
      { label: 'Training', value: 'Complete' },
      { label: 'Launch Readiness', value: 'High' },
      { label: 'Feedback', value: 'Positive' },
    ],
  },
  {
    id: 7,
    name: 'Renzo Villanueva',
    role: 'Franchisee',
    location: 'Baguio City',
    rating: 4,
    date: 'Jul 2025',
    businessAge: 'Operating for 1 year',
    quote:
      'Seasonal traffic affects sales in our area, but the marketing team helped us run local promos that improved conversions.',
    metrics: [
      { label: 'Conversion', value: '+22%' },
      { label: 'Comms', value: 'Fast' },
      { label: 'Promos', value: 'Helpful' },
    ],
  },
  {
    id: 8,
    name: 'Leah Garcia',
    role: 'Area Franchise Partner',
    location: 'Iloilo City',
    rating: 5,
    date: 'Jun 2025',
    businessAge: 'Operating for 2.3 years',
    quote:
      'The franchise keeps improving support systems over time. Reporting is cleaner now, and training updates are useful.',
    metrics: [
      { label: 'Branches', value: '3' },
      { label: 'Updates', value: 'Regular' },
      { label: 'Retention', value: 'Strong' },
    ],
  },
  {
    id: 9,
    name: 'John Paulo Rivera',
    role: 'Store Franchisee',
    location: 'Caloocan City',
    rating: 5,
    date: 'May 2025',
    businessAge: 'Operating for 9 months',
    quote:
      'Our grand opening was well coordinated, and the branding materials looked premium. The operating model is clear and scalable for expansion.',
    metrics: [
      { label: 'Opening', value: 'Successful' },
      { label: 'Branding', value: 'Premium' },
      { label: 'Expansion', value: 'Planned' },
    ],
  },
  {
    id: 10,
    name: 'Maricel Torres',
    role: 'Franchise Owner',
    location: 'Cagayan de Oro',
    rating: 5,
    date: 'Apr 2025',
    businessAge: 'Operating for 1 year',
    quote:
      'The franchise package is professionally delivered from orientation to operations. The team sets realistic expectations and provides tools that improve performance.',
    metrics: [
      { label: 'Orientation', value: 'Clear' },
      { label: 'Toolkit', value: 'Complete' },
      { label: 'Recommend', value: 'Yes' },
    ],
  },
]

function safeModulo(index, length) {
  if (!length) return 0
  return ((index % length) + length) % length
}

function useCurrentCard(activeTab, slideIndex) {
  return useMemo(() => {
    const list = DATA[activeTab] || []
    if (!list.length) return null
    return list[safeModulo(slideIndex, list.length)]
  }, [activeTab, slideIndex])
}

function TiltCard({ children, className = '' }) {
  const shellRef = useRef(null)
  const glowRef = useRef(null)
  const frameRef = useRef(0)
  const latestStateRef = useRef({ x: 0, y: 0, glowX: 50, glowY: 50, opacity: 0.24, active: false })
  const coarsePointerRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined

    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const syncPointerMode = (event) => {
      coarsePointerRef.current = event.matches
      if (event.matches) {
        latestStateRef.current = { x: 0, y: 0, glowX: 50, glowY: 50, opacity: 0.24, active: false }
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current)
          frameRef.current = 0
        }

        if (shellRef.current) {
          shellRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)'
          shellRef.current.classList.remove('is-interacting')
        }
        if (glowRef.current) {
          glowRef.current.style.opacity = '0.24'
          glowRef.current.style.background =
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.08) 24%, rgba(255,255,255,0) 58%)'
        }
      }
    }

    syncPointerMode(mediaQuery)

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncPointerMode)
      return () => mediaQuery.removeEventListener('change', syncPointerMode)
    }

    mediaQuery.addListener(syncPointerMode)
    return () => mediaQuery.removeListener(syncPointerMode)
  }, [])

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  const flushTilt = () => {
    frameRef.current = 0
    const shell = shellRef.current
    const glow = glowRef.current
    const state = latestStateRef.current
    if (!shell || !glow) return

    shell.style.transform = `rotateX(${state.x}deg) rotateY(${state.y}deg) translateZ(0)`
    shell.classList.toggle('is-interacting', state.active)
    glow.style.opacity = String(state.opacity)
    glow.style.background = `radial-gradient(circle at ${state.glowX}% ${state.glowY}%, rgba(255,255,255,${state.opacity}) 0%, rgba(255,255,255,0.08) 24%, rgba(255,255,255,0) 58%)`
  }

  const queueTilt = (nextState) => {
    latestStateRef.current = nextState
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(flushTilt)
  }

  const handleMove = (event) => {
    if (coarsePointerRef.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height

    queueTilt({
      x: (0.5 - py) * 8,
      y: (px - 0.5) * 11,
      glowX: px * 100,
      glowY: py * 100,
      opacity: 0.42,
      active: true,
    })
  }

  const handleLeave = () => {
    queueTilt({ x: 0, y: 0, glowX: 50, glowY: 50, opacity: 0.24, active: false })
  }

  return (
    <div className="fr3d-perspective" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div
        ref={shellRef}
        style={{ transformStyle: 'preserve-3d' }}
        className={`fr3d-card-shell ${className}`}
      >
        <div
          ref={glowRef}
          className="fr3d-card-pointer-glow"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.08) 24%, rgba(255,255,255,0) 58%)',
          }}
        />
        <div className="fr3d-card-top-light" />
        {children}
      </div>
    </div>
  )
}

export default function Franchise3DSection() {
  const categories = Object.keys(DATA)
  const [activeTab, setActiveTab] = useState(categories[0])
  const [slideIndex, setSlideIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const currentCard = useCurrentCard(activeTab, slideIndex)
  const currentList = useMemo(() => DATA[activeTab] || [], [activeTab])
  const hasManyCards = currentList.length > 1
  const isFoodTab = activeTab === 'Food'
  const [applyModalCard, setApplyModalCard] = useState(null)
  const [applyForm, setApplyForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    message: '',
  })
  const [applyStatus, setApplyStatus] = useState({ sending: false, message: '', error: false })
  const loopedReviews = useMemo(() => [...FRANCHISE_REVIEWS, ...FRANCHISE_REVIEWS], [])
  const averageRating = useMemo(() => {
    const total = FRANCHISE_REVIEWS.reduce((sum, item) => sum + item.rating, 0)
    return (total / FRANCHISE_REVIEWS.length).toFixed(1)
  }, [])
  const fiveStarPercent = useMemo(() => {
    const fiveStars = FRANCHISE_REVIEWS.filter((item) => item.rating === 5).length
    return Math.round((fiveStars / FRANCHISE_REVIEWS.length) * 100)
  }, [])

  const visibleFoodCards = useMemo(() => {
    if (!isFoodTab) return []
    return currentList
  }, [currentList, isFoodTab])

  const next = () => {
    if (!hasManyCards) return
    setDirection(1)
    setSlideIndex((value) => safeModulo(value + 1, currentList.length))
  }

  const prev = () => {
    if (!hasManyCards) return
    setDirection(-1)
    setSlideIndex((value) => safeModulo(value - 1, currentList.length))
  }

  const onChangeTab = (tab) => {
    setActiveTab(tab)
    setSlideIndex(0)
    setDirection(1)
  }

  useEffect(() => {
    if (!applyModalCard) return undefined

    document.body.classList.add('modal-open')
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setApplyModalCard(null)
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [applyModalCard])

  const openApplyModal = (card) => {
    setApplyModalCard(card)
    setApplyForm({
      name: '',
      email: '',
      phone: '',
      location: '',
      experience: '',
      message: '',
    })
    setApplyStatus({ sending: false, message: '', error: false })
  }

  const handleApplyChange = (event) => {
    const { name, value } = event.target
    setApplyForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplySubmit = async (event) => {
    event.preventDefault()
    if (!applyModalCard) return

    if (!applyForm.name.trim() || !applyForm.phone.trim()) {
      setApplyStatus({ sending: false, message: 'Full name and phone number are required.', error: true })
      return
    }

    setApplyStatus({ sending: true, message: '', error: false })

    const endpoint = import.meta.env.VITE_INQUIRY_API_URL || '/api/inquiry'
    const message = applyForm.message.trim()

    const payload = {
      name: applyForm.name.trim(),
      phone: applyForm.phone.trim(),
      email: applyForm.email.trim(),
      comment: message || `Franchise application request for ${applyModalCard.name}.`,
      message,
      franchise_interest: applyModalCard.name,
      location: applyForm.location.trim(),
      experience: applyForm.experience.trim(),
      source: 'Franchise Application Form',
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application.')
      }

      const leadInfo = data.leadId ? ` Reference: ${data.leadId}.` : ''
      const autoReplyInfo = data.autoReplySent
        ? ' A confirmation email was sent to your email address.'
        : ''
      setApplyStatus({
        sending: false,
        message: `Application submitted successfully.${leadInfo}${autoReplyInfo}`,
        error: false,
      })
      setApplyForm({
        name: '',
        email: '',
        phone: '',
        location: '',
        experience: '',
        message: '',
      })
    } catch (error) {
      setApplyStatus({
        sending: false,
        message: error.message || 'Failed to submit application.',
        error: true,
      })
    }
  }

  if (!currentCard) return null

  return (
    <section className="section fr3d-section" id="franchises">
      <div className="fr3d-ambient" data-scroll-parallax="0.12" aria-hidden="true" />
      <div className="container fr3d-wrap">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="fr3d-header"
        >
          <p className="fr3d-kicker">Franchise Opportunities</p>
          <h2 className="fr3d-title">Build a business that fits your goals</h2>
          <p className="fr3d-copy">
            HHC Franchise Hub proudly offers a range of various business franchise concepts designed to provide
            strong income potential while giving you the flexibility to manage your business your own way.
          </p>
          <p className="fr3d-copy">
            Each opportunity is thoughtfully evaluated to ensure quality, profitability, and growth potential. By
            partnering with HHC Franchise Hub you gain access to a strong support system and a community focused on
            helping you succeed.
          </p>
          <p className="fr3d-copy">Take the first step toward building a business that works for your goals and your future.</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="fr3d-tabs-wrap"
        >
          <div className="fr3d-tabs" role="tablist" aria-label="Franchise categories">
            {categories.map((tab) => {
              const active = tab === activeTab
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`fr3d-tab ${active ? 'active' : ''}`}
                  onClick={() => onChangeTab(tab)}
                >
                  {tab}
                </button>
              )
            })}
          </div>
          <p className="fr3d-tab-description">{CATEGORY_DESCRIPTIONS[activeTab]}</p>
        </motion.div>

        <div className={`fr3d-carousel-block ${isFoodTab ? 'fr3d-carousel-food' : ''}`}>
          {!isFoodTab && hasManyCards ? (
            <>
              <button
                type="button"
                className="fr3d-nav fr3d-nav-left"
                onClick={prev}
                aria-label="Previous franchise"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="fr3d-nav fr3d-nav-right"
                onClick={next}
                aria-label="Next franchise"
              >
                <ChevronRight size={20} />
              </button>
            </>
          ) : null}

          {isFoodTab ? (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key="food-all-cards"
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -18 : 18 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="fr3d-food-viewport"
              >
                <div className={`fr3d-food-track fr3d-food-cols-${visibleFoodCards.length}`}>
                  {visibleFoodCards.map((foodCard) => (
                    <article
                      key={`${foodCard.id}-${slideIndex}`}
                      className="fr3d-food-card"
                      style={{ background: foodCard.gradient }}
                    >
                      <div className={`fr3d-food-logo ${foodCard.logoVariant ? `fr3d-food-logo-${foodCard.logoVariant}` : ''}`}>
                        <img src={foodCard.logo} alt={`${foodCard.name} logo`} loading="lazy" />
                      </div>
                      <p className="fr3d-food-description">{foodCard.description}</p>
                      <button type="button" className="fr3d-food-link" onClick={() => openApplyModal(foodCard)}>
                        Learn More &amp; Apply
                      </button>
                    </article>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${activeTab}-${currentCard.id}`}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 24 : -24, scale: 0.985 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction > 0 ? -20 : 20, scale: 0.99 }}
                transition={{ duration: 0.34, ease: 'easeOut' }}
              >
                <TiltCard>
                  <article className="fr3d-card" style={{ background: currentCard.gradient }}>
                    <div className="fr3d-card-soft-orb fr3d-orb-a" />
                    <div className="fr3d-card-soft-orb fr3d-orb-b" />

                    <div className="fr3d-card-content">
                      <div className="fr3d-brand-chip">
                        <Sparkles size={14} />
                        <span>{currentCard.name}</span>
                      </div>

                      <div className={`fr3d-logo-box ${currentCard.logoVariant ? `fr3d-logo-${currentCard.logoVariant}` : ''}`}>
                        <img src={currentCard.logo} alt={`${currentCard.name} logo`} loading="lazy" />
                      </div>

                      {currentCard.tag ? <span className="fr3d-card-tag">{currentCard.tag}</span> : null}

                      <h3 className="fr3d-card-title">{currentCard.title}</h3>
                      <p className="fr3d-card-description">{currentCard.description}</p>

                      <div className="fr3d-stats">
                        {currentCard.stats.map((stat) => (
                          <span key={stat} className="fr3d-stat-pill">
                            {stat}
                          </span>
                        ))}
                      </div>

                      <div className="fr3d-actions">
                        <a href={currentCard.href} className="fr3d-btn fr3d-btn-primary">
                          {currentCard.cta} <span aria-hidden="true">-&gt;</span>
                        </a>
                        <a href={currentCard.href} className="fr3d-btn fr3d-btn-secondary">
                          View Details
                        </a>
                      </div>
                    </div>
                  </article>
                </TiltCard>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <motion.article
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="fr3d-next"
        >
          <div className="fr3d-next-grid">
            <motion.div
              className="fr3d-next-main"
              initial={{ opacity: 0, x: -22 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
            >
              <p className="fr3d-next-kicker">Next Step</p>
              <h3>Talk to a franchise advisor</h3>
              <p>
                Get the full investment range, site requirements, and timeline for the category you picked. No pressure,
                just clarity.
              </p>
              <div className="fr3d-next-actions">
                <a href="#contact-email" className="fr3d-next-btn fr3d-next-btn-primary">
                  <Phone size={16} />
                  <span>Request a Call</span>
                </a>
                <a href="branches" className="fr3d-next-btn fr3d-next-btn-secondary">
                  <Store size={16} />
                  <span>View Branches</span>
                </a>
              </div>
              <p className="fr3d-next-note">Typical response time: within 24-48 hours.</p>
            </motion.div>

            <motion.ol
              className="fr3d-steps"
              initial={{ opacity: 0, x: 22 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.42, ease: 'easeOut', delay: 0.04 }}
            >
              {NEXT_STEPS.map((step, index) => (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.28, delay: 0.08 + index * 0.08 }}
                >
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.description}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
          <div className="fr3d-next-bar" aria-hidden="true" />
        </motion.article>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="fr-reviews"
        >
          <div className="fr-reviews-head">
            <div>
              <p className="fr-reviews-kicker">Franchise Success Reviews</p>
              <h3>What Franchise Partners Are Saying</h3>
            </div>
            <div className="fr-reviews-badges">
              <span>{averageRating}/5 average rating</span>
              <span>{fiveStarPercent}% five-star reviews</span>
            </div>
          </div>

          <div className="fr-reviews-marquee-shell">
            <div className="fr-reviews-track" style={{ animationDuration: '52s' }}>
              {loopedReviews.map((review, idx) => (
                <article className="fr-review-card" key={`${review.id}-${idx}`}>
                  <div className="fr-review-card-top">
                    <div className="fr-review-avatar">
                      {review.name
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join('')}
                    </div>
                    <div>
                      <h4>{review.name}</h4>
                      <p>
                        {review.role} • {review.location}
                      </p>
                      <p>{review.businessAge}</p>
                    </div>
                  </div>

                  <div className="fr-review-stars">
                    <StarRow rating={review.rating} />
                    <span>
                      {review.rating}.0 / 5 • {review.date}
                    </span>
                  </div>

                  <blockquote>{review.quote}</blockquote>

                  <div className="fr-review-metrics">
                    {review.metrics.map((metric) => (
                      <span key={`${review.id}-${metric.label}`}>
                        <strong>{metric.value}</strong> {metric.label}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      <AnimatePresence>
        {applyModalCard ? (
          <motion.div
            className="fr3d-apply-v2-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setApplyModalCard(null)}
          >
            <motion.div
              className="fr3d-apply-v2-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`${applyModalCard.name} application form`}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="fr3d-apply-v2-head">
                <div className="fr3d-apply-v2-head-copy">
                  <span className="fr3d-apply-v2-pill">
                    <Sparkles size={14} />
                    Franchise Application
                  </span>
                  <h3>{applyModalCard.name} Franchise Details</h3>
                  <p>Review investment details and submit your application inquiry.</p>
                </div>

                <button
                  type="button"
                  className="fr3d-apply-v2-close"
                  aria-label="Close application form"
                  onClick={() => setApplyModalCard(null)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="fr3d-apply-v2-body">
                <div className="fr3d-apply-v2-summary-grid">
                  <section className="fr3d-apply-v2-summary-card">
                    <header>
                      <span className="fr3d-apply-v2-icon fr3d-apply-v2-icon-amber">
                        <Wallet size={15} />
                      </span>
                      <div>
                        <h4>Investment Details</h4>
                        <p>Estimated costs and agreement terms</p>
                      </div>
                    </header>

                    <dl className="fr3d-apply-v2-investment">
                      {(applyModalCard.details?.investment || [
                        ['Franchise Fee', 'Contact us'],
                        ['Total Package', 'Contact us'],
                        ['Contract Term', 'Contact us'],
                        ['Royalty Fee', 'Contact us'],
                      ]).map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>

                  <section className="fr3d-apply-v2-summary-card">
                    <header>
                      <span className="fr3d-apply-v2-icon fr3d-apply-v2-icon-blue">
                        <BriefcaseBusiness size={15} />
                      </span>
                      <div>
                        <h4>Complete Service Line</h4>
                        <p>Support included in the franchise package</p>
                      </div>
                    </header>

                    <ul className="fr3d-apply-v2-services">
                      {(applyModalCard.details?.services || [
                        'Operations Support',
                        'Training Program',
                        'Launch Assistance',
                      ]).map((service) => (
                        <li key={service}>
                          <span aria-hidden="true" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section className="fr3d-apply-v2-form-card">
                  <div className="fr3d-apply-v2-form-head">
                    <div>
                      <h4>Franchise Application Form</h4>
                      <p>Please complete your contact and business details.</p>
                    </div>
                    <span>Step 1 of 1</span>
                  </div>

                  <form className="fr3d-apply-v2-form" onSubmit={handleApplySubmit}>
                    <div className="fr3d-apply-v2-grid">
                      <ModalField
                        label="Full Name"
                        name="name"
                        value={applyForm.name}
                        onChange={handleApplyChange}
                        icon={User}
                        placeholder="Enter your full name"
                        required
                      />
                      <ModalField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={applyForm.email}
                        onChange={handleApplyChange}
                        icon={Mail}
                        placeholder="Enter your email"
                      />
                      <ModalField
                        label="Phone Number"
                        name="phone"
                        value={applyForm.phone}
                        onChange={handleApplyChange}
                        icon={Phone}
                        placeholder="Enter your phone number"
                        required
                      />
                      <ModalField
                        label="Preferred Location"
                        name="location"
                        value={applyForm.location}
                        onChange={handleApplyChange}
                        icon={MapPin}
                        placeholder="City/Province"
                      />
                    </div>

                    <label className="fr3d-apply-v2-field">
                      <span>Business Experience</span>
                      <div className="fr3d-apply-v2-select-wrap">
                        <select name="experience" value={applyForm.experience} onChange={handleApplyChange}>
                          <option value="">Select your experience level</option>
                          <option value="Beginner / No prior business">Beginner / No prior business</option>
                          <option value="Some business experience">Some business experience</option>
                          <option value="Experienced entrepreneur">Experienced entrepreneur</option>
                        </select>
                        <ChevronDown size={16} />
                      </div>
                    </label>

                    <label className="fr3d-apply-v2-field">
                      <span>Message / Questions</span>
                      <textarea
                        name="message"
                        value={applyForm.message}
                        onChange={handleApplyChange}
                        rows={5}
                        placeholder="Tell us about your franchise goals, target area, and questions..."
                      />
                    </label>

                    <div className="fr3d-apply-v2-actions">
                      <p>
                        We&apos;ll contact you within <strong>1-2 business days</strong>.
                      </p>
                      <button type="submit" className="fr3d-apply-v2-submit" disabled={applyStatus.sending}>
                        <Send size={15} />
                        {applyStatus.sending ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>

                    {applyStatus.message ? (
                      <p className={`fr3d-apply-v2-status ${applyStatus.error ? 'error' : 'success'}`}>
                        {applyStatus.message}
                      </p>
                    ) : null}
                  </form>
                </section>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function ModalField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = 'text',
  required = false,
}) {
  return (
    <label className="fr3d-apply-v2-field">
      <span>{label}</span>
      <div className="fr3d-apply-v2-input-wrap">
        {Icon ? <Icon size={15} /> : null}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      </div>
    </label>
  )
}

function StarRow({ rating }) {
  return (
    <span className="fr-review-stars-row" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < rating ? 'filled' : 'empty'}>
          ★
        </span>
      ))}
    </span>
  )
}
