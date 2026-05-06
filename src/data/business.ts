// Business page data
export const SERVICE_PILLS = [
  "Emiratisation",
  "Saudization",
  "Talent Mapping",
  "HR Setup",
  "Org Design",
  "Retainers",
  "C&B",
  "HR Audit",
  "Policies",
];

export const CAREER_PILLS = [
  "CV Design",
  "LinkedIn",
  "Coaching",
  "Branding",
  "Career Pivot",
];

export const MARQUEE_SERVICES = [
  "Emiratisation Readiness",
  "HR Foundation Pack",
  "HR Health Audit",
  "Organisation Design",
  "Compensation & Benefits",
  "Fractional HR Director",
  "Policy Writing",
  "Employment Contracts",
  "Onboarding Frameworks",
  "Performance Management",
  "Job Architecture",
  "Salary Benchmarking",
  "Nafis Subsidies",
  "HR Retainers",
];

export const HERO_STATS = [
  { value: "AED 3M+", label: "Documented savings delivered" },
  { value: "16 yrs", label: "Executive HR experience" },
  { value: "40+", label: "founder hours spent on HR every month" },
];

export const AUDIENCE_SEGMENTS = [
  {
    tag: "Startups & New Businesses",
    icon: "🏗",
    headline: "You're hiring fast and figuring out HR as you go.",
    body: "Offer letters written in WhatsApp. Policies copy-pasted from somewhere. No one who actually owns it. Every exit, dispute, or MOHRE visit is a six-figure risk you didn't price in.",
    footer: "0–20 employees",
  },
  {
    tag: "Growing SMEs",
    icon: "⚡",
    headline: "You've outgrown the way you've been doing HR.",
    body: "Emiratisation fines are AED 108k per unfilled quota. Performance issues are festering. Your managers don't know how to handle people problems — and neither does anyone else.",
    footer: "20–150 employees",
  },
  {
    tag: "New Market Entrants",
    icon: "✈",
    headline: "Opening in UAE or KSA? The rules aren't obvious.",
    body: "Mainland vs freezone. WPS. Visa quotas. GOSI. Getting it wrong costs months and hundreds of thousands to unwind. I've done this across 11 markets — I get it right on day one.",
    footer: "GCC expansion",
  },
  {
    tag: "Founder-Led & PE-Backed",
    icon: "📈",
    headline: "Raising, scaling, or heading toward exit?",
    body: "Investors and acquirers look at your people file before your P&L. Contracts, compliance, org structure, comp bands — if they're not clean, due diligence will find it. I close the gaps first.",
    footer: "Pre-raise / pre-exit",
  },
  {
    tag: "Multi-Entity Owners",
    icon: "🏢",
    headline: "Five businesses, five HR setups, zero consistency.",
    body: "F&B group, retail chain, hospitality portfolio — when compliance, payroll, and culture all run separately, they all drift separately. One framework across everything changes that.",
    footer: "Group structures",
  },
  {
    tag: "Lean Teams Building for Growth",
    icon: "🧭",
    headline: "Small team, big ambitions — but your HR can't scale with you yet.",
    body: "No job architecture. Roles that grew organically and now overlap. Onboarding that lives in someone's head. I design the structure, automate the admin, and build the people infrastructure that lets a team of 15 operate like a team of 50.",
    footer: "HR automation · Org design · Job architecture",
  },
];

export const DIAGNOSTIC_QUESTIONS = [
  { id: "q1", text: "Do all your employees have UAE-compliant employment contracts in place?", weight: 1.5, risk: "Non-compliant contracts expose you to tribunal claims and MOL inspections.", service: "HR Foundation Pack" },
  { id: "q2", text: "If you have 20+ employees in a targeted sector, do you know your Emiratisation quota and whether you're meeting it?", weight: 2, risk: "Emiratisation non-compliance: AED 108,000 per unfilled position, per quarter.", service: "Emiratisation Readiness Pack" },
  { id: "q3", text: "Do you have a written performance management process that managers actually follow?", weight: 1, risk: "No performance process = no defensible basis for terminations. Wrongful dismissal risk.", service: "HR Foundation Pack" },
  { id: "q4", text: "Is there a structured onboarding process for every new hire?", weight: 1, risk: "Poor onboarding drives early attrition — typically within the first 90 days.", service: "HR Foundation Pack" },
  { id: "q5", text: "Are your hiring decisions made using structured criteria rather than gut feel?", weight: 1, risk: "Unstructured hiring leads to bad hires, discrimination exposure, and cultural damage.", service: "HR Health Audit" },
  { id: "q6", text: "Do you have documented HR policies (leave, disciplinary, code of conduct, data protection)?", weight: 1.5, risk: "Undocumented policies make disciplinary action legally indefensible.", service: "HR Foundation Pack" },
];

export const FREE_TOOLS = [
  { icon: "📋", name: "HR Health Diagnostic", desc: "24-question diagnostic across 6 HR dimensions. Get your maturity score instantly." },
  { icon: "🇦🇪", name: "Emiratisation Calculator", desc: "Know your exact quota, shortfall, and quarterly fine exposure in seconds." },
  { icon: "📄", name: "AI Policy Generator", desc: "Generate a UAE-compliant HR policy document for any policy type, any sector." },
  { icon: "💼", name: "AI JD Builder", desc: "Build market-calibrated job descriptions for any role across the GCC." },
];

export const SERVICES = [
  {
    tag: "Compliance",
    name: "Emiratisation Readiness Pack",
    price: "AED 3,500",
    priceNote: "flat fee",
    desc: "Your 2026 Emiratisation exposure could reach AED 200k+ per gap. This package ensures you are legally and operationally ready to meet MOHRE requirements without the last-minute panic.",
    deliverables: ["Quota & gap analysis", "Nafis subsidy walkthrough", "Emirati-ready contract review", "GPSSA pension system guide", "90-day compliance roadmap", "2-day delivery"],
  },
  {
    tag: "Audit",
    name: "HR Health & Liability Audit",
    price: "AED 4,500",
    priceNote: "flat fee",
    desc: "A single undefended labor claim or WPS violation can cost between AED 50,000 and AED 150,000. We find the leaks before they become liabilities.",
    deliverables: ["6-dimension health scorecard", "Financial risk & exposure register", "Prioritized fix-it action plan", "30-minute executive briefing", "Delivery: 4 business days"],
  },
  {
    tag: "HR Foundation",
    name: "GCC Labor Law-Compliant Pack",
    price: "AED 7,500",
    priceNote: "flat fee",
    desc: "Without documented policies, every people decision is a negotiation. This builds the legal infrastructure your business needs to scale safely across the GCC.",
    deliverables: ["3 labor law-compliant contracts", "10 core HR policies", "Culture-aligned employee handbook", "Onboarding & offboarding frameworks", "Delivery: 7 business days"],
  },
  {
    tag: "Design",
    name: "Organisation Architecture",
    price: "From AED 10,000",
    priceNote: "based on size & scope",
    desc: "The wrong structure leads to duplicated effort and quietly burned payroll. We design the clarity your business needs to move from a founder-led to a process-led organization.",
    deliverables: ["Structural optimization recommendation", "Target Operating Model (TOM)", "Job architecture & grading", "Accountability-based role profiles", "Delivery: 10 business days"],
  },
  {
    tag: "Total Reward",
    name: "C&B & Retention Framework",
    price: "From AED 9,000",
    priceNote: "based on size & scope",
    desc: "Guesswork in salary leads to overpaying average performers and losing your best ones. We build a structured pay framework that balances market competitiveness with your bottom line.",
    deliverables: ["GCC market salary benchmarking", "Structured salary band design", "Internal pay equity analysis", "Performance-linked incentive design", "Delivery: 14 business days"],
  },
  {
    tag: "Systems",
    name: "Odoo & HRIS Quick-Start",
    price: "From AED 5,000",
    priceNote: "consultation & configuration",
    desc: "Stop managing your workforce on spreadsheets. We guide you to the ideal HRIS for your unique needs — whether that's a cost-effective Quick-Start using Odoo's free version or a fully tailored enterprise solution — to digitize your operations instantly.",
    deliverables: ["System scoping & vendor selection", "Odoo Quick-Start (Free/Standard version)", "Custom configuration for specialized HRIS", "WPS-ready payroll & data setup", "Delivery: 5 business days"],
  },
  {
    tag: "Automation",
    name: "HR Workflow & Admin Automations",
    price: "From AED 5,000",
    priceNote: "based on scope",
    desc: "Most HR teams lose 40% of their week to manual follow-ups. We build the digital glue that connects your systems and handles the repetitive tasks.",
    deliverables: ["Manual process & bottleneck audit", "Custom approval & request workflows", "Visa & document renewal auto-alerts", "Automated document generation", "Delivery: 7 business days"],
  },
  {
    tag: "Outsourcing",
    name: "Payroll & WPS Managed Service",
    price: "From AED 120",
    priceNote: "per employee/month (+AED 5,000 one-time setup)",
    desc: "Focus on your business while we handle the technical complexities of GCC payroll. We act as your Back Office, ensuring every employee is paid accurately and on time via WPS.",
    deliverables: ["One-time data & gratuity cleanup", "Monthly SIF & payroll processing", "WPS compliance & block monitoring", "Leave & EOSB liability tracking", "Monthly HR & financial reporting"],
  },
  {
    tag: "Embedded",
    name: "Fractional HR Director & BOT",
    price: "From AED 18,000",
    priceNote: "per month",
    desc: "A qualified HR Director in the UAE costs AED 35k–50k/month — plus visa, benefits, and notice period risk. The Fractional HR Director gives you the same seniority, embedded in your leadership team, at a fraction of the cost. The BOT model means you exit the engagement with a fully built in-house HR function.",
    deliverables: ["Senior HR leadership at a fraction of full-time cost", "Full HR function ownership & board-level reporting", "Build-Operate-Transfer (BOT) model for in-house teams", "Strategic scaling & culture development", "Monthly retainer"],
  },
];

export const RETAINER_TIERS = [
  {
    name: "Starter",
    price: "AED 4,500",
    per: "per month",
    size: "1–20 employees",
    featured: false,
    features: ["Monthly HR check-in (2hrs)", "Email support within 24hrs", "Contract & policy review", "Emiratisation monitoring", "1 HR project per quarter"],
  },
  {
    name: "Growth",
    price: "AED 7,500",
    per: "per month",
    size: "20–60 employees",
    featured: true,
    features: ["Weekly HR check-in (4hrs/month)", "Priority WhatsApp support", "Emiratisation compliance management", "Quarterly policy & contract review", "2 HR projects per quarter", "Performance management support"],
  },
  {
    name: "Scale",
    price: "AED 12,000",
    per: "per month",
    size: "60–150 employees",
    featured: false,
    features: ["Dedicated HR advisory (8hrs/month)", "Same-day response guarantee", "Full Emiratisation management", "Monthly HR reporting", "3 HR projects per quarter", "Recruitment support", "L&D planning"],
  },
  {
    name: "Fractional",
    price: "From AED 18,000",
    per: "per month",
    size: "100+ employees",
    featured: false,
    bestValue: true,
    features: ["Embedded 2–3 days/week on-site", "Full HR Director responsibilities", "Build-Operate-Transfer model", "Board-level HR strategy", "Unlimited projects", "Team building support"],
  },
];

export const SECTORS = [
  "Financial Services", "Insurance", "Retail", "Healthcare", "IT & Technology",
  "Real Estate", "Construction", "Education", "Hospitality & Tourism",
  "Media & Advertising", "Telecommunications", "Manufacturing", "Logistics", "Professional Services",
];

export const SECTOR_RATES: Record<string, number> = {
  "Financial Services": 0.10, "Insurance": 0.10, "Retail": 0.05, "Healthcare": 0.05,
  "IT & Technology": 0.04, "Real Estate": 0.05, "Construction": 0.02, "Education": 0.05,
  "Hospitality & Tourism": 0.02, "Media & Advertising": 0.04, "Telecommunications": 0.08,
  "Manufacturing": 0.02, "Logistics": 0.02, "Professional Services": 0.05,
};

export const ABOUT_CREDENTIALS = [
  { n: "MBA", s: "Human Resources" },
  { n: "PHRi", s: "HRCI Certified" },
  { n: "16 Years", s: "Executive HR Leadership" },
  { n: "11 Markets", s: "MENAT Region" },
  { n: "Bilingual", s: "Arabic & English" },
  { n: "🏆 Campaign ME", s: "Best Talent Team 2025" },
];
