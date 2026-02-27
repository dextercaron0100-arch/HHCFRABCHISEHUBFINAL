import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Store,
  Truck,
  ShieldCheck,
  MapPinned,
  Wallet,
  BadgeDollarSign,
  Handshake,
  Clock3,
  TrendingUp,
  Package,
  Sparkles,
  Building2,
  Users,
} from "lucide-react";

const cartIncome = {
  pcsPerCartPerDay: 300,
  servingsFrom300Pcs: 75,
  pricePerServing: 45,
  grossPerCartPerDay: 3375,
  estimatedDailyExpensePerCart: 2400,
  cleanProfitPerCartPerDay: 975,
  operatingDaysPerMonth: 26,
  carts: 3,
};

const monthlyNetIncome =
  cartIncome.cleanProfitPerCartPerDay *
  cartIncome.operatingDaysPerMonth *
  cartIncome.carts;

const largeDistribution = [
  { product: "Pork", retail: 185, moqPacks: 4, total: 740 },
  { product: "Chicken", retail: 185, moqPacks: 4, total: 740 },
  { product: "Cheesy Inferno", retail: 190, moqPacks: 4, total: 760 },
  { product: "Beefy", retail: 195, moqPacks: 4, total: 780 },
  { product: "Tokyo Bites", retail: 210, moqPacks: 4, total: 840 },
];

const jumboDistribution = [
  { product: "Pork", retail: 195, moqPacks: 4, total: 780 },
  { product: "Chicken", retail: 195, moqPacks: 4, total: 780 },
  { product: "Cheesy Inferno", retail: 200, moqPacks: 4, total: 800 },
  { product: "Beefy", retail: 205, moqPacks: 4, total: 820 },
  { product: "Tokyo Bites", retail: 220, moqPacks: 4, total: 880 },
];

const sum = (arr) => arr.reduce((acc, item) => acc + item.total, 0);

const formatPHP = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

const Section = ({ id, eyebrow, title, subtitle, children }) => (
  <section id={id} className="relative overflow-hidden py-16 sm:py-20">
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-8 h-24 bg-gradient-to-r from-transparent via-blue-400/12 to-transparent blur-2xl"
      animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.35, 0.8, 0.35] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -left-8 bottom-10 h-24 w-24 rounded-full bg-red-300/15 blur-2xl"
      animate={{ y: [0, -10, 0], x: [0, 8, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {(eyebrow || title || subtitle) && (
        <div className="mb-8 sm:mb-10">
          {eyebrow && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-red-600 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
            </div>
          )}
          {title && (
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  </section>
);

const StatCard = ({ icon: Icon, label, value, hint }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8, scale: 1.02, rotateX: 6, rotateY: -6 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ type: "spring", stiffness: 220, damping: 18 }}
    style={{ perspective: 1200, transformStyle: "preserve-3d" }}
    className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur transition duration-300 hover:border-red-200 hover:shadow-xl"
  >
    <motion.div
      whileHover={{ rotate: [0, -6, 6, 0] }}
      transition={{ duration: 0.5 }}
      style={{ transform: "translateZ(22px)" }}
      className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-red-500 text-white shadow-lg"
    >
      <Icon className="h-5 w-5" />
    </motion.div>
    <p style={{ transform: "translateZ(14px)" }} className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p style={{ transform: "translateZ(18px)" }} className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{value}</p>
    {hint && <p className="mt-2 text-sm text-slate-600">{hint}</p>}
  </motion.div>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
    {children}
  </span>
);

const Checklist = ({ items }) => (
  <div className="grid gap-3">
    {items.map((item) => (
      <motion.div
        key={item}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.25 }}
        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        <p className="text-sm leading-5 text-slate-700">{item}</p>
      </motion.div>
    ))}
  </div>
);

const DistributionTable = ({ title, meta, rows, footerCapital, footerProfit }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ type: "spring", stiffness: 220, damping: 20 }}
    style={{ perspective: 1200, transformStyle: "preserve-3d" }}
    className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur transition duration-300 hover:border-blue-200 hover:shadow-xl sm:p-6"
  >
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-black text-slate-900 sm:text-xl">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{meta}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Pill>MOQ: 20 packs</Pill>
        <Pill>5 flavors × 4 packs</Pill>
      </div>
    </div>

    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Retail Price</th>
              <th className="px-4 py-3 font-semibold">MOQ Packs</th>
              <th className="px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.product} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-800">{r.product}</td>
                <td className="px-4 py-3 text-slate-700">{formatPHP(r.retail)}</td>
                <td className="px-4 py-3 text-slate-700">{r.moqPacks} packs</td>
                <td className="px-4 py-3 font-bold text-slate-900">{formatPHP(r.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 bg-slate-50">
            <tr>
              <td className="px-4 py-3 font-semibold text-slate-700" colSpan={3}>
                Sample reseller total
              </td>
              <td className="px-4 py-3 text-base font-black text-slate-900">{formatPHP(sum(rows))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Your Capital</p>
        <p className="mt-1 text-lg font-black text-blue-900">{footerCapital}</p>
      </div>
      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Sample Clean Profit</p>
        <p className="mt-1 text-lg font-black text-red-900">{footerProfit}</p>
      </div>
    </div>
  </motion.div>
);

export default function BossSiomaiMasterFranchisePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#f8fafc] to-[#eef2ff] text-slate-900">
      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(249,115,22,0.20),transparent_42%),radial-gradient(circle_at_85%_18%,rgba(99,102,241,0.20),transparent_46%),radial-gradient(circle_at_55%_92%,rgba(236,72,153,0.12),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(248,250,252,0.75))]" />

        <motion.div
          aria-hidden
          animate={{ x: [0, 20, 0], y: [0, 14, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-orange-400/25 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -24, 0], y: [0, -10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, 18, 0], y: [0, -16, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-pink-400/15 blur-3xl"
        />

        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            aria-hidden
            className="absolute h-2 w-2 rounded-full bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.95)]"
            style={{
              left: `${8 + i * 9}%`,
              top: `${10 + ((i * 11) % 70)}%`,
            }}
            animate={{ opacity: [0.15, 0.9, 0.15], y: [0, -10, 0], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 2.8 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Section navigation">
            {[
              ["Overview", "#overview"],
              ["Rights", "#rights"],
              ["Cart Income", "#cart-income"],
              ["Distribution", "#distribution"],
              ["Package", "#package"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent"
          animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.95, 1, 0.95] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-16 top-8 h-40 w-40 rounded-full border border-red-300/40 bg-red-200/10 blur-2xl"
          animate={{ y: [0, 18, 0], x: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
              <BadgeDollarSign className="h-4 w-4" /> Investment & Revenue Model
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Master Franchise
              <span className="block bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">
                for Boss Siomai 🚀
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              A modern, responsive presentation page that organizes your franchise information into a clean sales-ready UI: investment overview, territorial rights, cart earning potential, distribution margins, and package inclusions.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Pill>Responsive Layout</Pill>
              <Pill>Sales-Presentation Ready</Pill>
              <Pill>Mobile Friendly</Pill>
              <Pill>Easy to Customize</Pill>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#overview"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-3 text-sm font-semibold text-white shadow transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                View Investment Overview
              </a>
              <a
                href="#cart-income"
                className="inline-flex items-center justify-center rounded-xl border border-white/80 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              >
                See Income Samples
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98, rotateY: -6 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0], rotateY: [-2, 2, -2] }}
            whileHover={{ y: -8, rotateY: -6, rotateX: 4, scale: 1.01 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="relative"
            style={{ perspective: 1400 }}
          >
            <div className="relative rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl backdrop-blur-xl sm:p-6" style={{ transformStyle: "preserve-3d" }}>
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-20 rounded-b-full bg-gradient-to-r from-orange-300/25 via-pink-300/20 to-indigo-300/25 blur-2xl"
                animate={{ opacity: [0.35, 0.8, 0.35], y: [0, 6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">Quick Snapshot</h2>
                <span className="rounded-full bg-gradient-to-r from-blue-600 to-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Master Franchise
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Package Cost</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{formatPHP(2000000)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contract Term</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">5 Years</p>
                  <p className="text-sm text-red-600">Renewable</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated Monthly Net (3 Carts / 26 Days)</p>
                  <p className="mt-1 text-2xl font-black text-red-600">{formatPHP(monthlyNetIncome)}</p>
                  <p className="text-sm text-slate-600">Based on your sample computation: {formatPHP(cartIncome.cleanProfitPerCartPerDay)} clean profit per cart/day.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                {[
                  "Exclusive rights within city/municipality",
                  "Authority to recruit and manage sub-franchise networks",
                  "Operate branches and support sub-franchisees",
                  "Multiple revenue streams (cart + distribution)",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-red-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Section
        id="overview"
        eyebrow="Investment Overview"
        title="Master Franchise Investment Summary"
        subtitle="Structured from your slides into a cleaner web format for easier viewing on desktop, tablet, and mobile."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Wallet} label="Master Franchise Package Cost" value={formatPHP(2000000)} hint="Initial package cost shown in your presentation" />
          <StatCard icon={Clock3} label="Contract Term" value="5 Years" hint="Renewable term" />
          <StatCard icon={MapPinned} label="Territorial Coverage" value="Exclusive City / Municipality" hint="Protected operational territory" />
          <StatCard icon={Users} label="Sub-Franchise Authority" value="Recruit + Manage Network" hint="Build and supervise reseller / sub-franchise structure" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur transition duration-300 hover:shadow-lg sm:p-6">
            <h3 className="text-xl font-black text-slate-900">Territorial Benefits Included</h3>
            <p className="mt-2 text-sm text-slate-600">
              The slides emphasize territorial exclusivity and network-building rights. This section presents those rights as conversion-friendly benefit cards.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: "Exclusive Operational Territory", desc: "Exclusive city/municipality coverage for operating Boss Siomai branches." },
                { icon: Handshake, title: "Recruitment Authority", desc: "Authority to recruit and develop sub-franchisees under your assigned territory." },
                { icon: Building2, title: "Branch Operations", desc: "Operate company-owned / assigned branches in your covered area." },
                { icon: TrendingUp, title: "Multiple Revenue Streams", desc: "Earn from cart operations, distribution, and sub-franchise network activity." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-blue-600 text-white shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-gradient-to-br from-red-50/90 via-white/90 to-blue-50/90 p-5 shadow-sm backdrop-blur transition duration-300 hover:shadow-lg sm:p-6">
            <h3 className="text-xl font-black text-slate-900">Master Franchise Means You Can:</h3>
            <div className="mt-4">
              <Checklist
                items={[
                  "Operate Boss Siomai branches in your assigned area",
                  "Recruit and develop sub-franchisees",
                  "Supply products and provide operational guidance to sub-franchisees",
                  "Earn from multiple revenue streams",
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="rights"
        eyebrow="Franchise Rights & Exclusivity"
        title="Rights, Contract, and Priority Access"
        subtitle="Responsive cards replacing the dense slide layout while keeping the same message and sales intent."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [MapPinned, "Exclusive City/Municipality Territory", "Protected area for operations and expansion."],
            [Clock3, "5-Year Renewable Contract", "Longer runway for growth with renewal option."],
            [Users, "Develop & Manage Sub-Franchise Network", "Scale through local recruitment and support."],
            [Sparkles, "Priority Access to New Systems & Updates", "Early operational improvements and system updates."],
          ].map(([Icon, title, desc]) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.015, rotateX: 5, rotateY: -5 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              style={{ perspective: 1200, transformStyle: "preserve-3d" }}
              className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur transition duration-300 hover:border-red-200 hover:shadow-xl"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        id="cart-income"
        eyebrow="Revenue Stream 1"
        title="How You Earn Through Carts"
        subtitle="Sample computation from your slide, restyled into readable metrics and a calculation flow."
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur transition duration-300 hover:shadow-lg sm:p-6">
            <h3 className="text-xl font-black text-slate-900">Daily Sales Sample (Per Cart)</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <StatCard icon={Package} label="Siomai Per Cart / Day" value={`${cartIncome.pcsPerCartPerDay} pcs`} hint="Sample slide assumption" />
              <StatCard icon={Store} label="Servings From 300 pcs" value={`${cartIncome.servingsFrom300Pcs} servings`} hint="4 pcs per serving" />
              <StatCard icon={BadgeDollarSign} label="Price Per Serving" value={formatPHP(cartIncome.pricePerServing)} hint="Based on sample slide" />
              <StatCard icon={TrendingUp} label="Gross Per Cart / Day" value={formatPHP(cartIncome.grossPerCartPerDay)} hint="75 servings × ₱45" />
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated Daily Expense</p>
                <p className="mt-1 text-xl font-black text-slate-900">{formatPHP(cartIncome.estimatedDailyExpensePerCart)}</p>
                <p className="text-xs text-slate-500">Includes sample ingredients, packaging, labor, and ops noted in slide.</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Clean Profit / Cart / Day</p>
                <p className="mt-1 text-xl font-black text-red-600">{formatPHP(cartIncome.cleanProfitPerCartPerDay)}</p>
                <p className="text-xs text-slate-500">₱3,375 gross − ₱2,400 expense</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Monthly Net (3 Carts)</p>
                <p className="mt-1 text-xl font-black text-blue-700">{formatPHP(monthlyNetIncome)}</p>
                <p className="text-xs text-slate-500">{cartIncome.cleanProfitPerCartPerDay} × {cartIncome.operatingDaysPerMonth} days × 3 carts</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg sm:p-6">
            <h3 className="text-xl font-black">Sample Monthly Computation</h3>
            <p className="mt-2 text-sm text-slate-300">Based on your slide’s daily sales basis and 26 operating days.</p>

            <div className="mt-5 space-y-3">
              {[
                [`Cart 1`, `${formatPHP(cartIncome.cleanProfitPerCartPerDay)} × ${cartIncome.operatingDaysPerMonth} days = ${formatPHP(cartIncome.cleanProfitPerCartPerDay * cartIncome.operatingDaysPerMonth)}`],
                [`Cart 2`, `${formatPHP(cartIncome.cleanProfitPerCartPerDay)} × ${cartIncome.operatingDaysPerMonth} days = ${formatPHP(cartIncome.cleanProfitPerCartPerDay * cartIncome.operatingDaysPerMonth)}`],
                [`Cart 3`, `${formatPHP(cartIncome.cleanProfitPerCartPerDay)} × ${cartIncome.operatingDaysPerMonth} days = ${formatPHP(cartIncome.cleanProfitPerCartPerDay * cartIncome.operatingDaysPerMonth)}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-200">Estimated Monthly Net Income</p>
              <p className="mt-1 text-2xl font-black text-red-300">{formatPHP(monthlyNetIncome)} / month</p>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              Note: These are sample computations from your provided material and may vary depending on pricing, actual sales volume, operating costs, and location performance.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="distribution"
        eyebrow="Revenue Stream 2"
        title="How You Earn Through Distribution"
        subtitle="Converted from your slide tables into responsive pricing blocks with clear totals and margins."
      >
        <div className="grid gap-6">
          <DistributionTable
            title="Large Size (25 pcs / pack)"
            meta="Reseller’s minimum order is 20 packs. Your capital shown in slide: ₱2,780."
            rows={largeDistribution}
            footerCapital="₱2,780"
            footerProfit="₱1,080 per reseller (sample)"
          />

          <DistributionTable
            title="Jumbo Size (16 pcs / pack)"
            meta="Reseller’s minimum order is 20 packs. Your capital shown in slide: ₱2,960."
            rows={jumboDistribution}
            footerCapital="₱2,960"
            footerProfit="₱1,100 per reseller (sample)"
          />
        </div>
      </Section>

      <Section
        id="package"
        eyebrow="Package Inclusions Overview"
        title="What’s Included in the Master Franchise Package"
        subtitle="A cleaner layout for the package inclusion details shown in your slides."
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur transition duration-300 hover:shadow-lg sm:p-6">
            <h3 className="text-xl font-black text-slate-900">Package Components</h3>
            <div className="mt-5 space-y-3">
              {[
                {
                  title: "Franchise Rights & Exclusivity",
                  value: "Exclusive Territory",
                  icon: ShieldCheck,
                  tone: "red",
                },
                {
                  title: "Food Cart Package",
                  value: "₱1,000,000 worth",
                  icon: Store,
                  tone: "blue",
                },
                {
                  title: "Products & Supplies",
                  value: "₱500,000 worth",
                  icon: Package,
                  tone: "amber",
                },
                {
                  title: "Products & Supplies / Additional Allocation",
                  value: "₱500,000 worth",
                  icon: Truck,
                  tone: "emerald",
                },
              ].map(({ title, value, icon: Icon, tone }) => {
                const toneMap = {
                  red: "bg-red-50 text-red-700 ring-red-100",
                  blue: "bg-blue-50 text-blue-700 ring-blue-100",
                  amber: "bg-amber-50 text-amber-700 ring-amber-100",
                  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
                };
                return (
                  <div key={title} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ring-1 ${toneMap[tone]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">{title}</p>
                      <p className="text-sm text-slate-600">{value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-red-50 to-blue-50 p-5 shadow-sm sm:p-6">
            <h3 className="text-xl font-black text-slate-900">Best Use of This Webpage</h3>
            <p className="mt-2 text-sm text-slate-600">
              This format is ideal for sales discussions, investor walkthroughs, franchise presentations, and mobile sharing. It reduces clutter from image-heavy slides and improves readability.
            </p>
            <div className="mt-5 grid gap-3">
              <Checklist
                items={[
                  "Present franchise value proposition in a more professional UI",
                  "Show cart and distribution earning models in one page",
                  "Use on phones/tablets during client or investor meetings",
                  "Convert later into live website with inquiry form / CTA buttons",
                ]}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next Upgrade Suggestions</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li>• Add an inquiry/contact form and WhatsApp/Facebook Messenger CTA</li>
                <li>• Add downloadable PDF proposal button</li>
                <li>• Add franchise FAQ and territory availability map</li>
                <li>• Add ROI calculator with editable assumptions</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <footer className="relative overflow-hidden border-t border-white/70 bg-white/80 backdrop-blur">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/80 to-transparent"
          animate={{ opacity: [0.2, 1, 0.2], scaleX: [0.92, 1, 0.92] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black text-slate-900">Boss Siomai Master Franchise Page</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="#overview" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Top</a>
            <a href="#cart-income" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Income</a>
            <a href="#distribution" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Distribution</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
