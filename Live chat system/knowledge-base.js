const WEBSITE_PROFILE = {
  businessName: "HHC Franchise Hub",
  websiteUrl: "https://www.hhcfranchisehub.com.ph",
  faqUrl: "https://www.hhcfranchisehub.com.ph/faqs",
  tagline: "Where Businesses Begin and Legacies Grow.",
  description:
    "HHC Franchise Hub is a strategic platform for the next generation of Filipino entrepreneurs, focused on building structured, scalable, and sustainable franchise systems.",
  mission:
    "The company builds strong operational foundations that support smart expansion and long-term success for Filipino entrepreneurs.",
  award: "2025 Legacy Icon Award",
  awardReason:
    "HHC Franchise Hub Solutions Corp. was recognized for business leadership and franchise innovation.",
  office: "Herrera Prestige Bldg., Madison South Subd., Brgy. Batino, Calamba City, Laguna",
  officeShort: "Herrera Prestige Building, Calamba City, Laguna",
  consultation: "Consultation available",
  hours: "Mon-Fri, 9:00 AM - 6:00 PM",
  emails: ["salesbigstop@gmail.com", "fhoperationsdept@gmail.com"],
  phones: ["0906 503 2208", "0956 654 9829", "+63 956 654 9829"],
  whatsapp: "+639065032208",
  responseTime: "within 24-48 hours",
  services: [
    "Franchise opportunities",
    "Business training",
    "Location assistance",
    "Marketing support",
    "Onboarding and launch support",
    "Operational guidance",
  ],
  brandsByCategory: {
    Retail: ["BigStop"],
    "Health & Wellness": ["Herrera Pharmacy"],
    Food: ["Boss Siomai", "Boss Chickn", "Boss Fries", "Burger 2 Go", "Noodle King"],
  },
};

const HISTORY_TIMELINE = [
  "2016: brand founded",
  "2018: first major expansion",
  "2020: operational reinvention and digitized workflows",
  "2022: stronger SOPs, QA, and performance monitoring",
  "2023: structured franchise program launch",
  "2024: community and customer programs expanded",
  "2025: award-winning service and recognition",
  "2026+: focus on smarter, sustainable growth",
];

const BRAND_CATALOG = {
  bigstop: {
    name: "BigStop",
    aliases: ["bigstop", "big stop"],
    category: "Retail",
    overview:
      "BigStop is a community-based convenience store franchise and a 6-in-1 lifestyle hub. It combines daily essentials, quick bites, Herrera Pharmacy, a DIY Ramyun Station, payment center services, and ATM services in one store.",
    highlights: [
      "6-in-1 business model",
      "Community-based convenience store",
      "Fast ROI target of 18-24 months",
      "Nationwide rollout",
    ],
    investment: {
      franchiseFee: "PHP 350,000",
      totalCapital: "up to PHP 3.5 million",
      royalty: "6% of net sales",
      contract: "5 years",
      floorArea: "100-150 sqm for the 3.5M package",
      notes:
        "Renovation and construction costs are not included in the total capital estimate.",
    },
    support: [
      "Use of the registered brand name and logo",
      "Store layout and design assistance",
      "Operations manual",
      "Owner and staff training",
      "Store opening support",
      "Marketing assistance",
      "Ongoing operational guidance",
      "Site evaluation and business registration guidance",
      "Nationwide logistics and product delivery",
    ],
    operations: [
      "Cloud-based POS system",
      "Real-time sales and inventory monitoring",
      "Licensed pharmacist required for Herrera Pharmacy inside BigStop",
      "BigStop assists with pharmacist license and FDA requirements",
    ],
    branches: ["Banlic", "Bataan", "Crossing", "Paciano", "Tuguegarao"],
    applicationPhone: "0906 503 2208",
  },
  herrera: {
    name: "Herrera Pharmacy",
    aliases: ["herrera", "herrera pharmacy", "pharmacy"],
    category: "Health & Wellness",
    overview:
      "Herrera Pharmacy is a community pharmacy franchise focused on affordable branded and generic medicines, personalized healthcare support, and compliant operations.",
    highlights: [
      "Trusted community pharmacy",
      "Branded and generic medicine mix",
      "Compliance-first workflows",
      "Customer-centered service",
    ],
    investment: {
      franchiseFee: "Contact for details",
      totalCapital: "Varies by location",
      contract: "5 years",
      notes: "A licensed pharmacist is required to operate the pharmacy.",
    },
    support: [
      "Guided setup from planning to launch",
      "Support for licensing and pharmacy standards",
      "Procurement and inventory guidance",
      "Operational support",
    ],
    operations: [
      "Licensed pharmacist required",
      "Compliance support for pharmacy standards",
      "BigStop assists with pharmacist license and FDA requirements when Herrera operates inside BigStop",
    ],
  },
  "boss-siomai": {
    name: "Boss Siomai",
    aliases: ["boss siomai", "siomai"],
    category: "Food",
    overview:
      "Boss Siomai is a best-selling siomai concept known for affordable, high-quality products and strong brand recall.",
    investment: {
      franchiseFee: "PHP 250,000",
      totalPackage: "PHP 1,750,000",
      contract: "5 years",
      royalty: "10% of net income",
    },
    packageOptions: [
      "Reseller Package - PHP 4,999",
      "Food Cart Package - PHP 39,999",
      "Bike Cart Package - PHP 65,000",
      "Kiosk Package - PHP 99,000",
      "Multiple Units / Expansion - PHP 100,000+",
    ],
    support: [
      "Food stall operations support",
      "Marketing support",
      "Centralized supply",
      "Training and launch support",
    ],
  },
  "boss-chickn": {
    name: "Boss Chickn",
    aliases: ["boss chickn", "boss chicken", "chickn"],
    category: "Food",
    overview:
      "Boss Chickn is a crispy chicken concept built for affordable, crowd-pleasing meals and fast service.",
    investment: {
      franchiseFee: "PHP 280,000",
      totalPackage: "PHP 1,900,000",
      contract: "5 years",
      royalty: "10% of net income",
    },
    support: [
      "Chicken menu line",
      "Supply chain access",
      "Store setup support",
      "Crew training",
    ],
  },
  "boss-fries": {
    name: "Boss Fries",
    aliases: ["boss fries", "fries"],
    category: "Food",
    overview:
      "Boss Fries is a snack concept focused on crispy fries, flavorful seasonings, and simple high-traffic operations.",
    investment: {
      franchiseFee: "PHP 230,000",
      totalPackage: "PHP 1,650,000",
      contract: "5 years",
      royalty: "10% of net income",
    },
    support: [
      "Fries station setup",
      "Flavor program",
      "Brand marketing",
      "Store support",
    ],
  },
  burger2go: {
    name: "Burger 2 Go",
    aliases: ["burger 2 go", "burger2go", "burger to go"],
    category: "Food",
    overview:
      "Burger 2 Go is a value-driven fast-food concept built around buy-1-take-1 burgers, footlongs, sandwiches, and fast prep for high-traffic areas.",
    investment: {
      franchiseFee: "PHP 260,000",
      totalPackage: "PHP 1,850,000",
      contract: "5 years",
      royalty: "10% of net income",
    },
    support: [
      "Burger and hotdog line setup",
      "Launch assistance",
      "Inventory planning",
      "Product training",
    ],
  },
  "noodle-king": {
    name: "Noodle King",
    aliases: ["noodle king", "noodles"],
    category: "Food",
    overview:
      "Noodle King offers bold Asian-inspired bowls with broad customer appeal and an affordable setup for food entrepreneurs.",
    investment: {
      franchiseFee: "PHP 300,000",
      totalPackage: "PHP 2,100,000",
      contract: "5 years",
      royalty: "10% of net income",
    },
    support: [
      "Bowl station setup",
      "Recipe and prep training",
      "Marketing materials",
      "Operational manual",
    ],
  },
};

module.exports = {
  BRAND_CATALOG,
  HISTORY_TIMELINE,
  WEBSITE_PROFILE,
};
