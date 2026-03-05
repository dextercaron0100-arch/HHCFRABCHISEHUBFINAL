import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Flag,
  Sparkles,
  Users,
  Store,
  Trophy,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  Rocket,
  BadgeCheck,
} from "lucide-react";

const milestones = [
  {
    year: "2016",
    title: "Brand Founded",
    description:
      "We started with a simple mission: deliver quality products and a memorable customer experience in every branch.",
    tag: "The Beginning",
    icon: Flag,
    image: "/HISTORY%20PNGS/history-20222.jpg",
    imageAlt: "Team starting the business journey",
    details: [
      "Defined our brand standards and service philosophy",
      "Tested our first operating workflow and supplier setup",
      "Built a loyal local customer base through consistency",
    ],
  },
  {
    year: "2018",
    title: "First Major Expansion",
    description:
      "Opened multiple branches across key locations, standardizing operations, training, and customer service processes.",
    tag: "Growth Phase",
    icon: Store,
    image: "/HISTORY%20PNGS/HISTORY.jpg",
    imageAlt: "Store expansion and branch operations",
    details: [
      "Rolled out branch setup checklist and launch timeline",
      "Introduced staff onboarding and skills certification",
      "Implemented visual merchandising and service scripts",
    ],
  },
  {
    year: "2020",
    title: "Operational Reinvention",
    description:
      "Strengthened systems, digitized workflows, and improved delivery performance to adapt to changing market demands.",
    tag: "Innovation",
    icon: Sparkles,
    image: "/HISTORY%20PNGS/c74647ef-5249-4f77-858f-650189b806b5.jpg",
    imageAlt: "Digital systems and operations dashboard",
    details: [
      "Digitized reports for sales, inventory, and staffing",
      "Improved turnaround time through process redesign",
      "Expanded customer touchpoints for online engagement",
    ],
  },
  {
    year: "2022",
    title: "Brand System Maturity",
    description:
      "Refined our playbooks, quality assurance, and performance monitoring to support scalable expansion with less risk.",
    tag: "Stability",
    icon: ShieldCheck,
    image: "/HISTORY%20PNGS/history-2025.jpg",
    imageAlt: "Business planning and systems documentation",
    details: [
      "Built stronger QA routines and audit scorecards",
      "Standardized procurement and branch support process",
      "Documented SOPs for daily and weekly operations",
    ],
  },
  {
    year: "2023",
    title: "Franchise Program Launch",
    description:
      "Introduced a structured franchise model with onboarding, support, and scalable business frameworks for partners.",
    tag: "Opportunity",
    icon: Users,
    image: "/HISTORY%20PNGS/480444760_967106848898396_4744848495251407778_n.jpg",
    imageAlt: "Franchise partners in a business meeting",
    details: [
      "Created partner onboarding journey and launch kit",
      "Established training, compliance, and field support",
      "Defined performance benchmarks for partner success",
    ],
  },
  {
    year: "2024",
    title: "Community & Customer Programs",
    description:
      "Expanded loyalty initiatives and community engagement efforts to deepen customer trust and strengthen local presence.",
    tag: "Customer Focus",
    icon: HeartHandshake,
    image: "/HISTORY%20PNGS/history-2022.jpg",
    imageAlt: "Community engagement and customer programs",
    details: [
      "Launched repeat-customer and loyalty activations",
      "Strengthened feedback loops and service recovery",
      "Partnered with local events and community groups",
    ],
  },
  {
    year: "2025",
    title: "Award-Winning Service",
    description:
      "Recognized for consistent service excellence, customer loyalty, and strong brand performance in local markets.",
    tag: "Recognition",
    icon: Trophy,
    image: "/HISTORY%20PNGS/BOD.png",
    imageAlt: "Team celebration and recognition award",
    details: [
      "Achieved service quality and customer satisfaction milestones",
      "Improved retention through stronger branch execution",
      "Expanded recognition through industry and community trust",
    ],
  },
  {
    year: "2026+",
    title: "Next Chapter: Smarter Growth",
    description:
      "We are focused on sustainable expansion, stronger partner support, and digital improvements that elevate the customer experience.",
    tag: "Future Roadmap",
    icon: Rocket,
    image: "/HISTORY%20PNGS/05bc3725-e68c-4dbf-b0c5-b42ca2d2feef%20-%20Copy.jpg",
    imageAlt: "Business roadmap and expansion planning",
    details: [
      "Prioritize high-potential locations and partner readiness",
      "Enhance digital reporting and operational visibility",
      "Invest in training systems for scalable quality execution",
    ],
  },
];

const stats = [
  { label: "Years Since Launch", value: "10+" },
  { label: "Franchise Brands", value: "7" },
  { label: "Core Business Categories", value: "3" },
  { label: "Expansion Focus", value: "Nationwide" },
];

const heroGallery = [
  {
    src: "/HISTORY%20PNGS/d09d6615-f108-4962-85cb-c57f3be72560%20-%20Copy.jpg",
    alt: "Herrera team seated in office lounge",
    className: "col-span-2 row-span-2",
  },
  {
    src: "/HISTORY%20PNGS/791af5e3-5de8-45cf-9c14-ebfd12465d75%20-%20Copy.jpg",
    alt: "Herrera executive portrait beside car",
    className: "col-span-1 row-span-1",
  },
  {
    src: "/HISTORY%20PNGS/31c4b705-9a00-4047-a8c2-17e5f701ec53%20-%20Copy.jpg",
    alt: "Herrera leadership team standing portrait",
    className: "col-span-1 row-span-1",
  },
];

const storyBlocks = [
  {
    title: "How we started",
    text: "Our journey began with a small team, a clear service vision, and a commitment to quality. Instead of growing too fast, we focused on building strong fundamentals that customers could consistently trust.",
  },
  {
    title: "How we scaled",
    text: "As demand grew, we invested in systems, training, and repeatable processes. This made expansion more reliable and helped us maintain brand standards across locations and teams.",
  },
  {
    title: "Where we are today",
    text: "Today, our brand combines strong operations, customer-centered service, and franchise-ready processes. We continue to improve with a long-term mindset focused on sustainable, measurable growth.",
  },
];

const pillars = [
  {
    icon: ShieldCheck,
    title: "Operational Discipline",
    description:
      "Clear SOPs, branch audits, and process controls that keep quality consistent as the business expands.",
    bullets: ["Documented workflows", "QA checkpoints", "Performance monitoring"],
  },
  {
    icon: HeartHandshake,
    title: "Customer Trust",
    description:
      "Service standards and feedback loops designed to create repeat visits and stronger brand loyalty.",
    bullets: ["Service consistency", "Feedback response", "Community presence"],
  },
  {
    icon: Users,
    title: "Partner Success",
    description:
      "Structured onboarding and continuous support to help franchise partners launch and operate confidently.",
    bullets: ["Training support", "Launch guidance", "Growth coaching"],
  },
  {
    icon: Sparkles,
    title: "Continuous Improvement",
    description:
      "We refine systems, tools, and team capabilities to adapt quickly and improve the customer experience.",
    bullets: ["Digital reporting", "Workflow updates", "Team development"],
  },
];

const achievementBadges = [
  "7 growing franchise brands",
  "Food, Retail, and Wellness portfolio",
  "Structured onboarding and training",
  "Operations and marketing support",
  "System-driven franchise growth",
  "Community-focused entrepreneurship",
];

const roadmap = [
  {
    phase: "Phase 1",
    title: "Strengthen Core Locations",
    text: "Increase consistency, improve reporting visibility, and optimize branch operations for stronger margins and service quality.",
  },
  {
    phase: "Phase 2",
    title: "Scale Partner Enablement",
    text: "Expand training resources, onboarding systems, and performance coaching to support franchise growth at scale.",
  },
  {
    phase: "Phase 3",
    title: "Digital Experience Upgrade",
    text: "Improve customer touchpoints and internal workflows using smarter tools, data, and service automation where appropriate.",
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ variant, className = "", children, ...props }) {
  const variantClass =
    variant === "outline"
      ? "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
      : "bg-white text-slate-900 hover:bg-slate-100";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="history-site-header">
      <div className="history-nav-wrap">
        <a
          href="/#hero"
          className="history-nav-brand"
          aria-label="HHC Franchise Hub Home"
          onClick={closeMobileMenu}
        >
          <img src="/logo.png" alt="HHC Franchise Hub" className="history-nav-logo" />
        </a>

        <ul className={`history-nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <li>
            <a href="/#hero" className="history-nav-link" onClick={closeMobileMenu}>
              Home
            </a>
          </li>
          <li>
            <a href="history" className="history-nav-link" onClick={closeMobileMenu}>
              History
            </a>
          </li>
          <li>
            <a href="/#franchises" className="history-nav-link" onClick={closeMobileMenu}>
              Franchises
            </a>
          </li>
          <li>
            <a href="branches" className="history-nav-link" onClick={closeMobileMenu}>Store Locations</a>
          </li>
          <li>
            <a href="faqs" className="history-nav-link" onClick={closeMobileMenu}>
              FAQs
            </a>
          </li>
          <li>
            <a href="/#contact-email" className="history-nav-link" onClick={closeMobileMenu}>
              Contact
            </a>
          </li>
        </ul>

        <div className="history-nav-cta">
          <a href="/#franchises" className="history-btn-outline" onClick={closeMobileMenu}>
            View Opportunities
          </a>
          <a href="/#contact-email" className="history-btn-primary" onClick={closeMobileMenu}>
            Franchise Now
            <span aria-hidden="true">-&gt;</span>
          </a>
          <button
            className={`history-nav-toggle ${mobileMenuOpen ? "open" : ""}`}
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

function TimelineItem({ item, index }) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="relative w-full"
    >
      <div className="w-full">
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="group overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.08))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_40px_rgba(2,6,23,0.38)] backdrop-blur-xl transition-all duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_20px_55px_rgba(2,6,23,0.45)]">
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[360px_1fr] xl:grid-cols-[420px_1fr]">
              <div className="relative h-56 overflow-hidden bg-slate-900/60 sm:h-64 md:h-full">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {item.year}
                </div>
              </div>

              <CardContent className="bg-[linear-gradient(180deg,rgba(2,6,23,0.72),rgba(2,6,23,0.58))] p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                      {item.tag}
                    </span>
                    <h3 className="mt-3 text-lg leading-tight font-semibold tracking-tight text-white sm:text-xl">
                      {item.title}
                    </h3>
                  </div>
                  <div className="shrink-0 rounded-xl border border-white/15 bg-white/10 p-2.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-transform group-hover:-translate-y-0.5">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <p className="text-sm leading-7 text-white/95 sm:text-base">
                  {item.description}
                </p>

                <ul className="mt-4 space-y-2">
                  {item.details?.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-sm leading-6 text-white/90"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-xs text-white/75 sm:text-sm">
                    Milestone • {item.year}
                  </div>
                  <button className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition-colors hover:text-slate-200">
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="absolute top-7 -left-2 z-10 sm:-left-2 lg:-left-4 xl:-left-5">
        <div className="relative">
          <div className="h-4 w-4 rounded-full bg-slate-900 shadow-lg ring-4 ring-white" />
          <div className="absolute inset-0 h-4 w-4 animate-ping rounded-full bg-slate-900 opacity-15" />
        </div>
      </div>
    </motion.div>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer footer-v2">
      <div className="footer-wrap">
        <div className="footer-top">
          <section className="brand-block" aria-label="Company info">
            <h3 className="brand-title">
              <span className="brand-mark" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="16"
                  height="16"
                >
                  <path d="M3 18h18" />
                  <path d="M5 18V9" />
                  <path d="M9 18V6" />
                  <path d="M13 18V11" />
                  <path d="M17 18V7" />
                  <path d="M21 18V13" />
                  <path d="M5 9c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-2 5-2" />
                </svg>
              </span>
              HHC Franchise Hub
            </h3>
            <p className="brand-desc">
              Building successful franchise businesses across the Philippines
              with proven systems and ongoing support.
            </p>
          </section>

          <section className="footer-col" aria-label="Our Brands">
            <h4>Our Brands</h4>
            <ul>
              <li>
                <a href="bigstop">BigStop</a>
              </li>
              <li>
                <a href="herrera-pharmacy">Herrera Pharmacy</a>
              </li>
              <li>
                <a href="boss-siomai">Boss Siomai</a>
              </li>
              <li>
                <a href="boss-chickn">Boss Chickn</a>
              </li>
              <li>
                <a href="boss-fries">Boss Fries</a>
              </li>
              <li>
                <a href="burger2go">Burger2Go</a>
              </li>
              <li>
                <a href="noodle-king">Noodle King</a>
              </li>
            </ul>
          </section>

          <section className="footer-col" aria-label="Services">
            <h4>Services</h4>
            <ul>
              <li>
                <a href="/#franchises">Franchise Opportunities</a>
              </li>
              <li>
                <a href="/#about">Business Training</a>
              </li>
              <li>
                <a href="branches">Location Assistance</a>
              </li>
              <li>
                <a href="/#contact-email">Marketing Support</a>
              </li>
            </ul>
          </section>

          <section className="footer-col" aria-label="Connect">
            <h4>Connect</h4>
            <ul>
              <li>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="footer-bottom">
          <nav className="footer-legal" aria-label="Legal links">
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Privacy Policy</a>
            <a href="faqs">FAQs</a>
          </nav>

          <p className="footer-copy">&copy; 2026 HHC Franchise Hub. All Rights Reserved.</p>

          <div className="footer-qr">
            <a
              href="https://callingcard.vercel.app/"
              className="footer-qr-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open digital calling card"
            >
              <img
                src="/callingcard-qr.png"
                alt="QR code to HHC calling card"
                className="footer-qr-img"
                loading="lazy"
                decoding="async"
              />
              <span>Scan for Calling Card</span>
            </a>
          </div>

          <div className="footer-socials" aria-label="Social media icons">
            <a
              href="https://api.whatsapp.com/send?phone=+639065032208"
              aria-label="WhatsApp"
              className="social-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.52 0 .2 5.32.2 11.86c0 2.09.55 4.14 1.6 5.95L0 24l6.37-1.67a11.84 11.84 0 0 0 5.69 1.45h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.15-3.41-8.44Zm-8.46 18.3h-.01a9.92 9.92 0 0 1-5.05-1.39l-.36-.21-3.78.99 1.01-3.69-.23-.38a9.9 9.9 0 0 1-1.52-5.24C2.12 6.39 6.59 1.92 12.06 1.92c2.65 0 5.15 1.03 7.02 2.9a9.86 9.86 0 0 1 2.91 7.03c0 5.47-4.46 9.93-9.93 9.93Zm5.45-7.44c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.78-1.47-1.75-1.65-2.04-.17-.3-.02-.45.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5 0 1.47 1.08 2.88 1.23 3.08.15.2 2.11 3.23 5.11 4.53.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.11.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/"
              aria-label="Facebook"
              className="social-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.54-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.5 0-1.97.94-1.97 1.9v2.28h3.35l-.54 3.49h-2.81V24C19.61 23.07 24 18.09 24 12.07Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/"
              aria-label="Instagram"
              className="social-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 1.8A3.96 3.96 0 0 0 3.8 7.75v8.5a3.96 3.96 0 0 0 3.95 3.95h8.5a3.96 3.96 0 0 0 3.95-3.95v-8.5a3.96 3.96 0 0 0-3.95-3.95h-8.5Zm8.95 1.35a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HistorySectionPreview() {
  return (
    <div className="history-page min-h-screen overflow-x-clip bg-[#020611]">
      <SiteHeader />
      <div className="history-page-shell">
        <div className="relative isolate px-3 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_24%,rgba(37,99,235,0.40),transparent_34%),radial-gradient(circle_at_52%_6%,rgba(59,130,246,0.16),transparent_42%),radial-gradient(circle_at_92%_18%,rgba(251,191,36,0.10),transparent_30%),radial-gradient(circle_at_50%_120%,rgba(29,78,216,0.18),transparent_46%),linear-gradient(180deg,#01040d_0%,#030a18_44%,#020612_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 0 0",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "120px 120px",
            backgroundPosition: "-1px -1px, -1px -1px",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.10] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,transparent_0%,transparent_42%,rgba(0,0,0,0.52)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/60 via-black/18 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/70 via-black/22 to-transparent" />
        </div>

        <section className="relative z-10 mx-auto w-full max-w-[1240px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,18,44,0.95),rgba(7,16,37,0.92))] shadow-[0_30px_90px_rgba(2,6,23,0.55)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="absolute top-10 right-0 h-44 w-44 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />
          </div>

          <div className="relative grid grid-cols-1 items-start gap-6 p-5 sm:gap-8 sm:p-7 lg:grid-cols-[1.05fr_.95fr] lg:gap-10 lg:p-9 xl:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                OUR JOURNEY
              </div>

              <h2 className="mt-4 text-2xl leading-tight font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                How HHC Franchise Hub grew into a trusted multi-brand network
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                From our early operations in 2016 to a growing franchise
                portfolio, HHC Franchise Hub has stayed focused on quality
                systems, partner support, and long-term business success for
                Filipino entrepreneurs.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="rounded-xl px-5">View Franchise Opportunities</Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                >
                  Explore Milestones
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {achievementBadges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 shadow-none"
                  >
                    <BadgeCheck className="mr-1.5 h-3.5 w-3.5 text-amber-300" />
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_rgba(2,6,23,0.25)] backdrop-blur-md sm:p-5"
                  >
                    <div className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {s.value}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-slate-300 sm:text-sm">
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_40px_rgba(2,6,23,0.25)] backdrop-blur-md">
                <div className="grid h-[340px] grid-cols-2 grid-rows-2 gap-3 sm:h-[400px]">
                  {heroGallery.map((img, i) => (
                    <motion.div
                      key={img.src}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.12 + i * 0.07 }}
                      className={`relative overflow-hidden rounded-2xl ${img.className}`}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-md sm:p-5">
                <div className="text-sm font-semibold text-white">
                  Built on real leadership and real milestones
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  These photos reflect the people behind HHC Franchise Hub and
                  our day-to-day commitment to operational excellence, partner
                  growth, and credible long-term expansion.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 lg:mt-14 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-6 lg:p-7">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              Brand Narrative
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              More than a timeline - this is a system built for long-term growth
            </h3>
            <div className="mt-4 space-y-4">
              {storyBlocks.map((block, i) => (
                <motion.div
                  key={block.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
                >
                  <div className="text-sm font-semibold text-white">
                    {block.title}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-200">
                    {block.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-6 lg:p-7">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              What We Prioritize
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">
              Core principles behind our progress
            </h3>
            <div className="mt-4 space-y-3">
              {pillars.slice(0, 2).map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {pillar.title}
                        </div>
                        <p className="mt-1 text-sm leading-7 text-slate-200">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_70px_rgba(2,6,23,0.38)] backdrop-blur-xl sm:mt-12 sm:p-6 lg:mt-14 lg:p-8">
          <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                Milestones with visual proof
              </h3>
              <p className="mt-1 text-sm text-slate-200">
                Use real photos from your brand history to strengthen
                credibility.
              </p>
            </div>
            <span className="hidden items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 sm:inline-flex">
              Timeline Gallery
            </span>
          </div>

          <div className="absolute top-20 bottom-8 left-6 hidden w-px bg-gradient-to-b from-transparent via-white/20 to-transparent lg:block xl:left-7" />
          <div className="absolute top-20 bottom-6 left-5 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent lg:hidden sm:left-6" />

          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            {milestones.map((item, index) => (
              <div
                key={`${item.year}-${item.title}`}
                className="relative pl-7 sm:pl-8 lg:pl-10 xl:pl-12"
              >
                <TimelineItem item={item} index={index} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_70px_rgba(2,6,23,0.38)] backdrop-blur-xl sm:mt-12 sm:p-6 lg:mt-14 lg:p-8">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-8">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                Looking Ahead
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Our next chapter is focused on smarter, sustainable expansion
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-200 sm:text-base">
                The future section helps visitors and potential partners
                understand where your brand is heading. It communicates ambition
                while reinforcing that growth will continue to be guided by
                process, support, and customer experience.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {pillars.slice(2).map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {pillar.title}
                          </div>
                          <p className="mt-1 text-sm leading-7 text-slate-200">
                            {pillar.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {roadmap.map((item, i) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_8px_24px_rgba(2,6,23,0.25)] backdrop-blur-md sm:p-5"
                >
                  <div className="text-xs font-semibold tracking-wide text-slate-300/80">
                    {item.phase}
                  </div>
                  <div className="mt-1 text-base font-semibold text-white">
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-200">
                    {item.text}
                  </p>
                </motion.div>
              ))}

              <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-4 backdrop-blur-md sm:p-5">
                <div className="text-sm font-semibold text-white">
                  Want this personalized to your real business history?
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  Replace sample dates, numbers, and images with your actual
                  milestones, branch launches, awards, and partner stories to make
                  this section fully brand-authentic.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button className="rounded-xl px-4">Customize Timeline</Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-white/20 bg-white/5 px-4 text-white hover:bg-white/10 hover:text-white"
                  >
                    Add Real Photos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>
        <SiteFooter />
      </div>
    </div>
  );
}
