/**
 * Function-area keyword dictionaries for the ATS engine.
 *
 * Curated terms that real ATS keyword filters look for. Kept intentionally
 * compact — 30-50 per area — so keyword coverage % is meaningful rather than
 * a sea of synonyms. Add more areas as the product grows.
 */

export const GENERIC_KEYWORDS = [
  "leadership", "stakeholder", "cross-functional", "strategy", "kpi",
  "execution", "ownership", "communication", "collaboration",
];

export const FUNCTION_KEYWORDS: Record<string, string[]> = {
  hr: [
    "talent acquisition", "recruitment", "onboarding", "retention",
    "performance management", "employee engagement", "employee relations",
    "compensation", "benefits", "hris", "workday", "successfactors",
    "labour law", "compliance", "policy", "diversity", "inclusion",
    "learning", "development", "succession planning", "headcount",
    "payroll", "workforce planning", "mohre", "emiratisation", "wps",
    "competency framework", "training", "coaching", "okrs",
  ],
  "human resources": [
    "talent acquisition", "recruitment", "onboarding", "retention",
    "performance management", "employee engagement", "employee relations",
    "compensation", "benefits", "hris", "workday", "successfactors",
    "labour law", "compliance", "diversity", "inclusion", "learning",
    "development", "succession planning", "headcount", "payroll",
    "workforce planning", "competency framework", "training", "coaching",
  ],
  sales: [
    "pipeline", "quota", "revenue", "arr", "mrr", "upsell", "cross-sell",
    "negotiation", "closing", "prospecting", "discovery", "demo",
    "salesforce", "hubspot", "crm", "account management", "key accounts",
    "enterprise", "smb", "saas", "consultative selling", "forecasting",
    "territory", "win rate", "deal size", "channel", "partnerships",
  ],
  engineering: [
    "typescript", "javascript", "python", "react", "node", "api", "rest",
    "graphql", "microservices", "aws", "gcp", "azure", "docker",
    "kubernetes", "ci/cd", "terraform", "postgres", "sql", "redis",
    "kafka", "observability", "system design", "code review", "agile",
    "scrum", "performance", "scalability", "testing", "monitoring",
  ],
  finance: [
    "fp&a", "budgeting", "forecasting", "variance analysis", "ifrs", "gaap",
    "audit", "controls", "treasury", "cash flow", "working capital",
    "modeling", "valuation", "due diligence", "consolidation", "tax",
    "vat", "reconciliation", "month-end", "year-end", "sap", "oracle",
    "netsuite", "kpi", "p&l", "balance sheet",
  ],
  marketing: [
    "brand", "campaign", "demand generation", "content", "seo", "sem",
    "ppc", "lifecycle", "crm", "hubspot", "marketo", "analytics", "ga4",
    "attribution", "conversion", "funnel", "positioning", "messaging",
    "go-to-market", "launch", "social", "events", "partnerships", "pr",
    "growth", "retention", "acquisition", "roas",
  ],
  operations: [
    "process improvement", "lean", "six sigma", "kaizen", "supply chain",
    "logistics", "procurement", "vendor management", "sla", "kpi",
    "operations excellence", "automation", "workflow", "erp", "sap",
    "oracle", "cost reduction", "capacity planning", "demand planning",
    "warehouse", "fulfillment", "quality", "compliance", "audit",
  ],
  product: [
    "roadmap", "discovery", "user research", "user testing", "metrics",
    "north star", "okrs", "prd", "specs", "agile", "scrum", "sprint",
    "backlog", "prioritization", "rice", "moscow", "a/b testing",
    "experimentation", "analytics", "amplitude", "mixpanel", "figma",
    "stakeholder management", "go-to-market", "launch",
  ],
};
