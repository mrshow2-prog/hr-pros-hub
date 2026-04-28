// Business page data
export const SERVICE_PILLS = [
  "Emiratisation",
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
  { value: "11", label: "MENAT markets served" },
];

export const AUDIENCE_SEGMENTS = [
  {
    tag: "Startups & New Business",
    icon: "🏗",
    headline: "Never had HR? You need it before you hire number 10.",
    body: "Non-compliant contracts, verbal agreements, and zero policies are liabilities — not just gaps. We set you up right the first time.",
  },
  {
    tag: "Growing SMEs (20–150 staff)",
    icon: "⚡",
    headline: "Emiratisation has expanded to you. The fines are real.",
    body: "Companies with 20+ employees in targeted sectors are now subject to annual quota enforcement. Most are operating blind.",
  },
  {
    tag: "Multi-Entity Owners",
    icon: "🏢",
    headline: "One HR partner for all your businesses.",
    body: "Whether you run a restaurant group, retail chain, property and hospitality portfolio — you need one consistent HR framework.",
  },
  {
    tag: "New Market Entrants",
    icon: "✈",
    headline: "Opening a UAE office? Don't guess the rules.",
    body: "UAE employment law, WPS, Emiratisation, and free zone vs mainland structures are complex. We handle the HR setup.",
  },
  {
    tag: "HR Professionals",
    icon: "🎯",
    headline: "Looking for career support?",
    body: "CV rewrite, LinkedIn optimisation, interview prep, coaching — visit Career Studio, built specifically for HR and people professionals.",
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
    desc: "Know exactly where you stand — and what to do next.",
    deliverables: ["Quota calculation for your business", "Gap analysis", "Nafis subsidy walkthrough", "90-day compliance plan", "2-day delivery"],
  },
  {
    tag: "Foundation",
    name: "HR Foundation Pack",
    price: "AED 7,500",
    priceNote: "flat fee",
    desc: "Everything a growing business needs to operate compliantly from day one.",
    deliverables: ["3 UAE-compliant contract templates", "10 core HR policies", "Employee handbook", "Onboarding & offboarding frameworks", "5-day delivery"],
  },
  {
    tag: "Audit",
    name: "HR Health Audit",
    price: "AED 4,500",
    priceNote: "flat fee",
    desc: "A full diagnostic of your current HR function across six dimensions.",
    deliverables: ["6-dimension health scorecard", "Risk register with AED exposure", "Prioritised action plan", "Executive briefing (30 min)"],
  },
  {
    tag: "Design",
    name: "Organisation Design",
    price: "AED 12,000–22,000",
    priceNote: "based on scope",
    desc: "Structural clarity for growth-stage and scaling businesses.",
    deliverables: ["Structural options & recommendation", "Target operating model", "Job architecture & grading", "Role profiles"],
  },
  {
    tag: "Reward",
    name: "C&B Framework",
    price: "AED 9,500–16,000",
    priceNote: "based on scope",
    desc: "Pay people fairly, competitively, and consistently.",
    deliverables: ["GCC market salary benchmarking", "Salary band design", "Pay equity analysis", "Bonus & incentive framework"],
  },
  {
    tag: "Embedded",
    name: "Fractional HR Director / BOT",
    price: "AED 18,000–25,000",
    priceNote: "per month",
    desc: "Senior HR leadership without the full-time hire. Embedded 2–3 days/week.",
    deliverables: ["Full HR ownership", "Build-Operate-Transfer", "Team building", "Board-level reporting"],
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
    price: "AED 18,000–25,000",
    per: "per month",
    size: "Any size",
    featured: false,
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
