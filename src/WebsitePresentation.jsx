import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bot,
  Building2,
  ChartColumn,
  ChevronRight,
  CircleCheckBig,
  Compass,
  Database,
  LayoutPanelLeft,
  MapPinned,
  MessageSquareText,
  Network,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Store,
  Trophy,
  Users,
} from 'lucide-react'

const navItems = [
  ['cover', 'Cover'],
  ['purpose', 'Purpose'],
  ['sitemap', 'Site Map'],
  ['homepage', 'Homepage'],
  ['portfolio', 'Portfolio'],
  ['brand-pages', 'Brand Pages'],
  ['boss-siomai', 'Boss Siomai'],
  ['trust', 'Trust'],
  ['conversion', 'Conversion'],
  ['architecture', 'Architecture'],
  ['next-steps', 'Next Steps'],
]

const brandGroups = [
  {
    title: 'Retail',
    description: 'Convenience and daily-essentials formats built around community utility.',
    brands: [{ name: 'BigStop', logo: '/bigstop shape.png' }],
  },
  {
    title: 'Health & Wellness',
    description: 'Healthcare-driven retail designed around compliance, trust, and recurring need.',
    brands: [{ name: 'Herrera Pharmacy', logo: '/Copy%20of%20hp%20final%20logo%20vertical.png' }],
  },
  {
    title: 'Food',
    description: 'High-traffic, high-repeat concepts with different investment and setup formats.',
    brands: [
      { name: 'Boss Siomai', logo: '/Copy%20of%20BOSS%20SIOMAI2%20horizontal.png' },
      { name: 'Boss Chickn', logo: '/Copy%20of%20BOSS%20CHICKN%20LANDSCAPE%20LOGO.png' },
      { name: 'Boss Fries', logo: '/Copy%20of%20boss%20fries%20mascot.png' },
      { name: 'Burger2Go', logo: '/Burger2Go_Official%20Logo.png' },
      { name: 'Noodle King', logo: '/Copy%20of%20noodle%20king%20logo.png' },
    ],
  },
]

const staticSupportPages = [
  'History',
  "Founder's Corner",
  'Awards & Recognition',
  'Seals of Approval',
  'FAQs',
  'Store Locator',
]

const homepageMoments = [
  'Hero slider introduces the HHC brand and the franchise journey.',
  'Award spotlight promotes the 2025 Legacy Icon Award and credibility assets.',
  'Interactive 3D franchise section sorts brands into Retail, Health & Wellness, and Food.',
  'News, seals, and certificates reinforce trust before the inquiry section.',
  'A full contact area combines location map, business details, and lead form.',
]

const conversionLayers = [
  {
    title: 'Inquiry forms',
    copy: 'Homepage and Boss Siomai forms send structured leads into the backend and can trigger confirmation emails.',
    icon: MessageSquareText,
  },
  {
    title: 'Live chat',
    copy: 'An embeddable widget supports keyword, hybrid, or Anthropic-assisted replies and live-agent handoff.',
    icon: Bot,
  },
  {
    title: 'Sales proof',
    copy: 'Sample reviews, live purchase toast notifications, and award modules add social proof throughout the funnel.',
    icon: ChartColumn,
  },
  {
    title: 'Support CTAs',
    copy: 'Request-a-call, branch locator, and contact actions keep visitors moving toward a decision.',
    icon: PhoneCall,
  },
]

const architectureBlocks = [
  {
    title: 'Frontend',
    icon: LayoutPanelLeft,
    items: [
      'Vite + React entry points for the homepage, history page, and presentation pages.',
      'Static HTML brand pages and support pages served from public assets.',
      'Animated UI using Framer Motion, lazy-loaded sections, and reusable contact patterns.',
    ],
  },
  {
    title: 'Lead backend',
    icon: Database,
    items: [
      'Node/Express TypeScript service processes inquiry submissions.',
      'Supports SQLite locally and Neon/Postgres in deployment.',
      'Can send admin notifications and customer auto-replies through Resend or Gmail SMTP.',
    ],
  },
  {
    title: 'Chat backend',
    icon: Bot,
    items: [
      'Separate Node/Express + Socket.IO service powers live chat.',
      'Includes visitor widget, agent dashboard, bot modes, and API endpoints.',
      'Designed for Railway deployment with configurable allowed origins and dashboard hosts.',
    ],
  },
]

const routeGroups = [
  {
    title: 'Core Hub',
    routes: ['/', '/#franchises', '/#contact-email'],
  },
  {
    title: 'Brand Pages',
    routes: [
      '/bigstop',
      '/herrera-pharmacy',
      '/boss-siomai',
      '/boss-chickn',
      '/boss-fries',
      '/burger2go',
      '/noodle-king',
    ],
  },
  {
    title: 'Trust & Support',
    routes: ['/history', '/founder', '/awards', '/seals', '/faqs', '/branches'],
  },
]

const stats = [
  ['7', 'Franchise brands'],
  ['3', 'Core business categories'],
  ['18', 'Mapped store locations'],
  ['11', 'FAQ entries'],
  ['10', 'Sample partner reviews'],
  ['4.8/5', 'Average review score'],
]

const slideIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.45, ease: 'easeOut' },
}

function Slide({ id, eyebrow, title, children, accent = 'blue' }) {
  return (
    <motion.section
      id={id}
      className={`wp-slide wp-accent-${accent}`}
      {...slideIn}
    >
      <div className="wp-slide-inner">
        <div className="wp-slide-head">
          <span className="wp-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        {children}
      </div>
    </motion.section>
  )
}

function LogoPill({ name, logo }) {
  return (
    <div className="wp-logo-pill">
      <img src={logo} alt={`${name} logo`} loading="lazy" />
      <span>{name}</span>
    </div>
  )
}

export default function WebsitePresentation() {
  return (
    <div className="wp-deck">
      <aside className="wp-rail">
        <div className="wp-rail-card">
          <div className="wp-rail-brand">
            <img src="/logo.png" alt="HHC Franchise Hub logo" />
            <div>
              <p>HHC Franchise Hub</p>
              <span>Website Presentation</span>
            </div>
          </div>

          <nav className="wp-rail-nav" aria-label="Presentation slides">
            {navItems.map(([id, label], index) => (
              <a key={id} href={`#${id}`} className="wp-rail-link">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{label}</strong>
              </a>
            ))}
          </nav>

          <div className="wp-rail-note">
            <Sparkles size={16} />
            <p>Built from the actual routes, pages, forms, and services in this repository.</p>
          </div>
        </div>
      </aside>

      <main className="wp-main">
        <motion.section id="cover" className="wp-slide wp-cover" {...slideIn}>
          <div className="wp-slide-inner wp-cover-inner">
            <div className="wp-cover-copy">
              <span className="wp-eyebrow">Deck 01</span>
              <h1>HHC Franchise Hub Website Presentation</h1>
              <p className="wp-cover-lead">
                A multi-brand franchise website built to attract entrepreneurs, explain each business model, build trust,
                and convert interest into inquiries, chats, and partner conversations.
              </p>

              <div className="wp-cover-actions">
                <a href="#purpose" className="wp-btn wp-btn-primary">
                  Start Presentation <ArrowRight size={16} />
                </a>
                <a href="#architecture" className="wp-btn wp-btn-secondary">
                  Jump to System View
                </a>
              </div>

              <div className="wp-stat-grid">
                {stats.map(([value, label]) => (
                  <article key={label} className="wp-stat-card">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="wp-cover-visual">
              <div className="wp-orbit-card">
                <div className="wp-orbit-top">
                  <span>Brand network</span>
                  <span>Nationwide growth</span>
                </div>
                <div className="wp-logo-cloud">
                  <LogoPill name="BigStop" logo="/bigstop shape.png" />
                  <LogoPill name="Herrera Pharmacy" logo="/Copy%20of%20hp%20final%20logo%20vertical.png" />
                  <LogoPill name="Boss Siomai" logo="/Copy%20of%20BOSS%20SIOMAI2%20horizontal.png" />
                  <LogoPill name="Boss Chickn" logo="/Copy%20of%20BOSS%20CHICKN%20LANDSCAPE%20LOGO.png" />
                  <LogoPill name="Boss Fries" logo="/Copy%20of%20boss%20fries%20mascot.png" />
                  <LogoPill name="Burger2Go" logo="/Burger2Go_Official%20Logo.png" />
                  <LogoPill name="Noodle King" logo="/Copy%20of%20noodle%20king%20logo.png" />
                </div>
                <div className="wp-orbit-bottom">
                  <div>
                    <strong>Mission</strong>
                    <span>Structured, scalable, and sustainable franchise growth</span>
                  </div>
                  <div>
                    <strong>Outcome</strong>
                    <span>Discovery, credibility, qualification, and conversion in one ecosystem</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <Slide id="purpose" eyebrow="Deck 02" title="What the website is designed to do" accent="amber">
          <div className="wp-three-grid">
            <article className="wp-story-card">
              <Compass className="wp-story-icon" />
              <h3>Attract</h3>
              <p>
                The homepage introduces HHC as a serious franchise platform, then routes visitors into brand pages,
                story content, and support resources.
              </p>
            </article>
            <article className="wp-story-card">
              <ShieldCheck className="wp-story-icon" />
              <h3>Build trust</h3>
              <p>
                Awards, credentials, founder narrative, milestone history, FAQs, and branch location content reduce
                uncertainty before a visitor makes contact.
              </p>
            </article>
            <article className="wp-story-card">
              <Users className="wp-story-icon" />
              <h3>Convert</h3>
              <p>
                Inquiry forms, request-a-call CTAs, chat widget, purchase proof, and partner reviews move traffic into
                qualified lead conversations.
              </p>
            </article>
          </div>

          <div className="wp-band-card">
            <div>
              <span className="wp-chip">Primary audience</span>
              <h3>Aspiring franchisees, investors, and local operators</h3>
            </div>
            <p>
              The site balances brand storytelling with operational detail, making it useful both as a public website and
              as a sales-support tool during franchise presentations.
            </p>
          </div>
        </Slide>

        <Slide id="sitemap" eyebrow="Deck 03" title="Full website structure" accent="emerald">
          <div className="wp-route-grid">
            {routeGroups.map((group) => (
              <article key={group.title} className="wp-route-card">
                <h3>{group.title}</h3>
                <div className="wp-route-list">
                  {group.routes.map((route) => (
                    <span key={route}>{route}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="wp-support-grid">
            <article className="wp-panel-card">
              <h3>Trust stack</h3>
              <div className="wp-inline-pills">
                {staticSupportPages.map((page) => (
                  <span key={page}>{page}</span>
                ))}
              </div>
            </article>
            <article className="wp-panel-card">
              <h3>Navigation logic</h3>
              <p>
                The website uses one main hub and several dedicated brand microsites, allowing each concept to have its
                own sales pitch while still staying inside the HHC umbrella.
              </p>
            </article>
          </div>
        </Slide>

        <Slide id="homepage" eyebrow="Deck 04" title="Homepage experience and first impression" accent="rose">
          <div className="wp-home-grid">
            <article className="wp-panel-card wp-home-large">
              <h3>The homepage acts as a command center</h3>
              <ul className="wp-check-list">
                {homepageMoments.map((item) => (
                  <li key={item}>
                    <CircleCheckBig size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="wp-panel-card">
              <h3>Message hierarchy</h3>
              <p>
                Vision first, credibility second, franchise portfolio third, and direct contact fourth. This is a strong
                sequence for visitors who are still evaluating trust and fit.
              </p>
            </article>

            <article className="wp-panel-card">
              <h3>Built-in persuasion tools</h3>
              <p>
                Cookie consent, live purchase toast, animated cards, reviews, and multiple CTA zones add urgency and proof
                without requiring the visitor to leave the page.
              </p>
            </article>
          </div>
        </Slide>

        <Slide id="portfolio" eyebrow="Deck 05" title="Franchise portfolio presentation" accent="blue">
          <div className="wp-brand-grid">
            {brandGroups.map((group) => (
              <article key={group.title} className="wp-brand-card">
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                <div className="wp-brand-logo-list">
                  {group.brands.map((brand) => (
                    <LogoPill key={brand.name} name={brand.name} logo={brand.logo} />
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="wp-band-card">
            <div>
              <span className="wp-chip">Interactive proof</span>
              <h3>The 3D franchise section does more than list brands</h3>
            </div>
            <p>
              It introduces category tabs, highlights each concept, opens application detail modals, and displays 10
              sample partner reviews with a 4.8/5 average score and 80% five-star rating.
            </p>
          </div>
        </Slide>

        <Slide id="brand-pages" eyebrow="Deck 06" title="Dedicated brand pages deepen the sales conversation" accent="gold">
          <div className="wp-case-grid">
            <article className="wp-case-card">
              <div className="wp-case-head">
                <LogoPill name="BigStop" logo="/bigstop shape.png" />
                <span className="wp-chip">Flagship retail page</span>
              </div>
              <ul className="wp-bullet-list">
                <li>Positions BigStop as a 6-in-1 convenience hub.</li>
                <li>Explains why the model wins and what makes it expandable.</li>
                <li>Shows package breakdown around the PHP 3.5M offer and PHP 350K franchise fee.</li>
                <li>Includes branch visuals, franchise info inputs, and contact conversion blocks.</li>
              </ul>
            </article>

            <article className="wp-case-card">
              <div className="wp-case-head">
                <LogoPill name="Herrera Pharmacy" logo="/Copy%20of%20hp%20final%20logo%20vertical.png" />
                <span className="wp-chip">Health-focused page</span>
              </div>
              <ul className="wp-bullet-list">
                <li>Leans on trust, accessibility, compliance, and community healthcare value.</li>
                <li>Frames the pharmacy as a dependable neighborhood concept.</li>
                <li>Uses a simpler investment explanation with contact-based follow-up.</li>
                <li>Ends with a direct planning CTA and inquiry form for qualified prospects.</li>
              </ul>
            </article>
          </div>
        </Slide>

        <Slide id="boss-siomai" eyebrow="Deck 07" title="Boss Siomai has its own mini-ecosystem inside the website" accent="red">
          <div className="wp-boss-grid">
            <article className="wp-panel-card">
              <h3>Frontline package selling page</h3>
              <div className="wp-inline-pills">
                <span>Reseller - PHP 4,999</span>
                <span>Food Cart - PHP 39,999</span>
                <span>Bike Cart - PHP 65,000</span>
                <span>Kiosk - PHP 99,000</span>
              </div>
              <p>
                The static Boss Siomai page is built to compare entry-level package formats, show posters, and collect
                application details.
              </p>
            </article>

            <article className="wp-panel-card">
              <h3>Master franchise presentation page</h3>
              <div className="wp-inline-pills">
                <span>PHP 2,000,000 package</span>
                <span>5-year renewable term</span>
                <span>PHP 76,050 sample monthly net</span>
              </div>
              <p>
                A separate React page reframes the opportunity as an investor-ready sales deck, covering territorial
                rights, cart income, distribution margins, and package inclusions.
              </p>
            </article>

            <article className="wp-panel-card wp-boss-visual">
              <img
                src="/BOSS%20SIOAMI%20SECTION/Boss%20Siomai%20Food%20Cart%20%28OPEN%20FOR%20FRANCHISE%29.jpg"
                alt="Boss Siomai presentation poster"
                loading="lazy"
              />
            </article>
          </div>
        </Slide>

        <Slide id="trust" eyebrow="Deck 08" title="Trust, story, and support content strengthen credibility" accent="violet">
          <div className="wp-trust-grid">
            <article className="wp-story-card">
              <Building2 className="wp-story-icon" />
              <h3>History page</h3>
              <p>
                Presents milestones from 2016 through 2026+, supported by images, narrative blocks, and growth stats.
              </p>
            </article>
            <article className="wp-story-card">
              <Users className="wp-story-icon" />
              <h3>Founder's Corner</h3>
              <p>
                Adds leadership philosophy, story, and future direction through a cinematic founder-led page.
              </p>
            </article>
            <article className="wp-story-card">
              <Trophy className="wp-story-icon" />
              <h3>Awards and seals</h3>
              <p>
                The 2025 Legacy Icon Award and compliance credentials turn trust into something visually provable.
              </p>
            </article>
            <article className="wp-story-card">
              <MapPinned className="wp-story-icon" />
              <h3>FAQs and store locator</h3>
              <p>
                An 11-item FAQ and a locator with 18 mapped stores answer practical questions and reinforce operational reality.
              </p>
            </article>
          </div>
        </Slide>

        <Slide id="conversion" eyebrow="Deck 09" title="Conversion systems turn interest into leads" accent="teal">
          <div className="wp-conversion-grid">
            {conversionLayers.map(({ title, copy, icon: Icon }) => (
              <article key={title} className="wp-conversion-card">
                <Icon className="wp-story-icon" />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>

          <div className="wp-flow-card">
            <h3>Lead flow in one line</h3>
            <div className="wp-flow-line">
              <span>Visitor</span>
              <ChevronRight size={18} />
              <span>CTA / Form / Chat</span>
              <ChevronRight size={18} />
              <span>API proxy</span>
              <ChevronRight size={18} />
              <span>Backend + email + storage</span>
              <ChevronRight size={18} />
              <span>Sales follow-up</span>
            </div>
          </div>
        </Slide>

        <Slide id="architecture" eyebrow="Deck 10" title="Technical architecture behind the website" accent="slate">
          <div className="wp-architecture-grid">
            {architectureBlocks.map(({ title, icon: Icon, items }) => (
              <article key={title} className="wp-architecture-card">
                <div className="wp-case-head">
                  <Icon className="wp-story-icon" />
                  <h3>{title}</h3>
                </div>
                <ul className="wp-bullet-list">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="wp-band-card">
            <div>
              <span className="wp-chip">Deployment pattern</span>
              <h3>Frontend on Vercel, lead backend and chat service deployable separately</h3>
            </div>
            <p>
              The project already supports a Vercel proxy for inquiries, a dedicated backend for lead tracking, and a
              separate live chat service that can run on Railway with its own widget and agent dashboard.
            </p>
          </div>
        </Slide>

        <Slide id="next-steps" eyebrow="Deck 11" title="Recommended next phase for the website" accent="orange">
          <div className="wp-next-grid">
            <article className="wp-panel-card">
              <h3>What is already strong</h3>
              <ul className="wp-check-list">
                <li>
                  <Network size={18} />
                  <span>Clear multi-brand structure with room for each concept to sell itself.</span>
                </li>
                <li>
                  <ShieldCheck size={18} />
                  <span>Good trust-building layer through history, awards, seals, branches, and FAQs.</span>
                </li>
                <li>
                  <Store size={18} />
                  <span>Brand pages are not placeholders; they contain meaningful franchise detail.</span>
                </li>
              </ul>
            </article>

            <article className="wp-panel-card">
              <h3>Best upgrades from here</h3>
              <ul className="wp-bullet-list">
                <li>Unify visual standards across static HTML brand pages and React-powered pages.</li>
                <li>Connect inquiries, chat sessions, and status updates into one admin CRM view.</li>
                <li>Add persistent analytics for top-performing brands, routes, and CTA sources.</li>
                <li>Harden production chat auth and replace default agent credentials before launch.</li>
              </ul>
            </article>
          </div>

          <div className="wp-closing-card">
            <p className="wp-eyebrow">Closing statement</p>
            <h3>
              This website is not just a brochure. It is a franchise acquisition platform that combines brand storytelling,
              operational proof, and lead capture across the full HHC portfolio.
            </h3>
          </div>
        </Slide>
      </main>
    </div>
  )
}
