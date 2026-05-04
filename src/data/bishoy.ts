// Service categories for Bishoy Mesiha's 360° HR Leader profile.
// Tag lists are factual capability labels; headings and descriptions are
// written in-house for the people·STUDIO profile.

export type BishoySection = {
  slug: string;
  label: string;       // short orbit-node label
  heading: string;     // panel heading
  tagline: string;     // 1-line panel subhead
  body: string;        // 1-2 short paragraphs
  bullets: string[];   // service tags
  ringColor: string;   // CSS color for ring + glow
  iconKey: IconKey;
};

export type IconKey =
  | "compass"
  | "refresh"
  | "target"
  | "scales"
  | "diamond"
  | "robot"
  | "shield"
  | "cap";

export const BISHOY_SECTIONS: BishoySection[] = [
  {
    slug: "hr-strategy",
    label: "HR Strategy",
    heading: "HR Strategy",
    tagline: "People strategy that earns its seat at the table.",
    body: "I work with founders, CEOs and EXCOM teams to turn business ambition into a workable People plan — operating model, workforce architecture, employer brand. The output is never a deck; it is a year of decisions you can actually execute.",
    bullets: [
      "People & Culture Strategy Design",
      "Annual People Plan Ownership",
      "CEO & EXCOM Advisory",
      "Commercial HR Advisory",
      "Workforce Planning & Headcount Budgets",
      "Succession Architecture",
      "Employer Branding & EVP Strategy",
      "M&A People Due Diligence",
      "Post-Merger Integration",
      "Greenfield Market Launch",
      "Power BI Strategic Dashboards",
    ],
    ringColor: "#F59E0B",
    iconKey: "compass",
  },
  {
    slug: "od-change",
    label: "OD & Change",
    heading: "OD & Change",
    tagline: "Change people can actually follow.",
    body: "Re-designing organisations, integrating teams after acquisitions, opening new markets — the technical work is the easy part. I lead change with the rigour to make it stick and the empathy to keep good people through it.",
    bullets: [
      "Organisational Design & Restructuring",
      "Change Management Strategy",
      "Culture Transformation",
      "Post-Merger Integration Planning",
      "Greenfield Market Launch",
      "D&I Strategy Design",
      "Employee Experience Journey Mapping",
      "Engagement Survey Design & Action Planning",
      "Wellbeing Programme Design",
      "Internal Communications Strategy",
    ],
    ringColor: "#3B82F6",
    iconKey: "refresh",
  },
  {
    slug: "hr-consultancy",
    label: "HR Consultancy",
    heading: "HR Consultancy",
    tagline: "Fractional senior HR thinking, on the projects that matter.",
    body: "Advisory engagements for founders and leadership teams who need a senior HR head for a specific problem — strategy reset, job architecture, AI-enabled operating model, ER framework. A practitioner's precision with a consultant's perspective.",
    bullets: [
      "HR Strategy Consulting",
      "Organisational Design Advisory",
      "Job Architecture & Grading",
      "Compensation Benchmarking",
      "Employee Handbook Design",
      "HR Policy Frameworks",
      "Talent Management Framework Design",
      "L&D Strategy & Curriculum Design",
      "Culture & Engagement Diagnostics",
      "AI-Enabled Workflow Design",
      "ER Advisory & Investigation Frameworks",
      "HRIS Selection & Optimisation",
    ],
    ringColor: "#EC4899",
    iconKey: "target",
  },
  {
    slug: "employee-relations",
    label: "Employee Relations",
    heading: "Employee Relations",
    tagline: "Where fairness meets precision.",
    body: "Complex ER work across UAE, KSA and the wider GCC — investigations, restructurings, sensitive welfare cases, manager coaching. Decisions that hold up legally, commercially, and on the day after.",
    bullets: [
      "Complex ER Case Management",
      "Multi-Jurisdiction Investigations",
      "Disciplinary & Grievance Processes",
      "PIPs & PDPs",
      "Duty-of-Care Crisis Management",
      "Mass Restructuring Consultation",
      "Sensitive Welfare Cases",
      "UAE & GCC Labour Law",
      "KSA / Egypt Labour Law",
      "MOHRE Compliance",
      "Manager ER Coaching",
      "ER Framework Design",
    ],
    ringColor: "#F97316",
    iconKey: "scales",
  },
  {
    slug: "total-rewards",
    label: "Total Rewards",
    heading: "Total Rewards",
    tagline: "Compensation that competes — and retains.",
    body: "End-to-end Total Rewards: from grading and salary structure to executive packages, incentive schemes, benefits and pay equity. Built on benchmark data, defended with analytics, designed to keep your best people.",
    bullets: [
      "Compensation Framework Design",
      "Salary Grid & Banding",
      "Executive Package Preparation",
      "Market Benchmarking",
      "Bonus & Incentive Scheme Design",
      "Annual Merit Review",
      "Variable Pay Structures",
      "Benefits Policy & Administration",
      "Pay Equity Analysis",
      "Total Rewards Strategy",
      "HR Budget Ownership",
      "Power BI Rewards Analytics",
    ],
    ringColor: "#06B6D4",
    iconKey: "diamond",
  },
  {
    slug: "hr-digital-transform",
    label: "HR Digital Transform.",
    heading: "HR Digital Transformation",
    tagline: "The human side of the machine.",
    body: "Designing AI-enabled HR operating models, automating the work that slows people down, and making sure the technology serves the team rather than the other way round. HRIS implementations, custom AI agents, predictive people analytics.",
    bullets: [
      "Custom AI Agent Development",
      "AI-Powered HR Workflows",
      "Intelligent Onboarding Automation",
      "Predictive Attrition Modeling",
      "Prompt Engineering for HR",
      "End-to-End HR Process Automation",
      "HRIS Implementation (Workday, SAP SF, Oracle HCM, Taleo)",
      "Power BI People Dashboards",
      "Digital Governance Design",
      "HR Tech Stack Assessment",
      "Digital Offboarding Design",
    ],
    ringColor: "#22D3EE",
    iconKey: "robot",
  },
  {
    slug: "hr-compliance",
    label: "HR Compliance",
    heading: "HR Compliance",
    tagline: "Zero gaps. Zero surprises.",
    body: "Multi-jurisdiction labour law and governance across UAE, KSA, Qatar, Kuwait, Bahrain, Jordan and Egypt. Audit-ready policies, harmonised handbooks, and the operational discipline that keeps inspections boring.",
    bullets: [
      "UAE Mainland & Freezone Labour Law",
      "KSA Labour Law",
      "Qatar, Kuwait, Bahrain, Jordan, Egypt",
      "MOHRE & Government Compliance",
      "Emiratisation & Saudization Strategy",
      "Visa & Immigration Governance",
      "Policy Harmonisation",
      "Multi-Jurisdiction Audit Readiness",
      "Employee Handbook Design",
      "Regulatory Risk Mitigation",
      "UAE & KSA Labour Law Certified (2023)",
    ],
    ringColor: "#EF4444",
    iconKey: "shield",
  },
  {
    slug: "learning-development",
    label: "Learning & Dev.",
    heading: "Learning & Development",
    tagline: "Capability that sticks.",
    body: "Annual L&D strategy grounded in real training-needs analysis, leadership programmes that change behaviour, and measurement honest enough to show ROI. Delivered in Arabic and English, in person and digital.",
    bullets: [
      "Annual L&D Strategy Design",
      "Training Needs Analysis (TNA)",
      "Leadership Development Programmes",
      "Competency Framework Design",
      "Career Ladder Architecture",
      "Individual Development Plans (IDPs)",
      "Learning Measurement & ROI",
      "Digital & AI-Enabled Learning",
      "Manager Development",
      "Facilitation (Arabic & English)",
      "LinkedIn Learning",
      "SAP SuccessFactors LMS",
    ],
    ringColor: "#A78BFA",
    iconKey: "cap",
  },
];
