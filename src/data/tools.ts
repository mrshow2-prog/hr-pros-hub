export type DiagnosticOption = {
  label: string;
  score: number;
  rating: "Critical gap" | "Needs work" | "Developing" | "Strong";
};

export type DiagnosticQuestion = {
  text: string;
  context: string;
  options: DiagnosticOption[];
  weight: number;
  risk: string;
  why: string;
};

export type DiagnosticDimension = {
  id: "legal" | "docs" | "talent" | "perf" | "comp" | "ops";
  label: string;
  colorClass: string;
  bgClass: string;
  intro: string;
  questions: DiagnosticQuestion[];
};

const optionSet = (labels: string[]): DiagnosticOption[] => [
  { label: labels[0], score: 0, rating: "Critical gap" },
  { label: labels[1], score: 1, rating: "Needs work" },
  { label: labels[2], score: 2, rating: "Developing" },
  { label: labels[3], score: 3, rating: "Strong" },
];

export const DIAGNOSTIC_DIMS: DiagnosticDimension[] = [
  {
    id: "legal",
    label: "Legal & Compliance",
    colorClass: "text-risk-red",
    bgClass: "bg-risk-red/10",
    intro: "Your most urgent dimension. UAE Labour Law, Emiratisation, MoHRE and WPS gaps can become fines, work permit blocks, or indefensible disputes.",
    questions: [
      {
        text: "Are all employment contracts signed, dated, and aligned with UAE Federal Decree-Law No. 33 of 2021?",
        context: "Pre-2021 or unsigned templates leave termination, notice, and EOSB terms exposed.",
        options: optionSet(["No signed contracts or old format", "Some contracts, not reviewed", "Mostly current, clauses not verified", "All current, signed, filed"]),
        weight: 1.5,
        risk: "Non-compliant employment contracts — terminations legally indefensible.",
        why: "Current UAE contracts should reflect the limited-duration framework and updated termination terms.",
      },
      {
        text: "Do you know your exact Emiratisation obligation for 2025 and are you meeting it?",
        context: "Companies with 50+ staff and targeted 20–49 staff companies are under active enforcement.",
        options: optionSet(["Not aware of any obligation", "Aware, not calculated", "Quota known, not fully compliant", "Quota calculated, compliant, Nafis tracked"]),
        weight: 2,
        risk: "Emiratisation non-compliance — material fine exposure in 2025.",
        why: "MoHRE enforcement can create fines, restrictions, and urgent hiring pressure.",
      },
      {
        text: "Are employees registered with MoHRE and paid through WPS on time every month?",
        context: "WPS errors can restrict new work permits quickly.",
        options: optionSet(["Some staff not registered or WPS inconsistent", "WPS used but late/errors occur", "Mostly correct, not fully audited", "Full registration and on-time WPS"]),
        weight: 1.5,
        risk: "WPS non-compliance — work permit suspension risk.",
        why: "Late or incorrect WPS records affect establishment status and hiring ability.",
      },
      {
        text: "Is end-of-service gratuity correctly accrued and tracked for every employee?",
        context: "EOSB errors usually surface at exit, when disputes are most expensive.",
        options: optionSet(["Calculated only at departure", "Tracked, formula uncertain", "Tracked but not formally reviewed", "Correctly calculated and reviewed"]),
        weight: 1,
        risk: "Gratuity calculation errors — unquantified financial liability.",
        why: "Monthly tracking prevents unexpected settlement costs and employee disputes.",
      },
    ],
  },
  {
    id: "docs",
    label: "HR Documentation",
    colorClass: "text-risk-blue",
    bgClass: "bg-risk-blue/10",
    intro: "Policies and documentation are your evidence when something goes wrong. Without them, good decisions become hard to defend.",
    questions: [
      { text: "Do you have a written disciplinary and grievance procedure managers follow consistently?", context: "MoHRE disputes quickly become documentation tests.", options: optionSet(["No written process", "Exists but not followed", "Mostly followed, weak acknowledgement", "Documented, acknowledged, consistently followed"]), weight: 2, risk: "No disciplinary procedure — any termination is legally challengeable.", why: "A written and consistently used process is the basis of defensible action." },
      { text: "Does every employee have signed acknowledgement of current HR policies on file?", context: "Acknowledgement is proof employees knew the rules.", options: optionSet(["No formal policies", "Policies exist, no signatures", "Most acknowledgements exist", "All current and acknowledged"]), weight: 1, risk: "No policy acknowledgement records — policies become difficult to enforce.", why: "Without signed acknowledgement, enforcement can fail even where the policy is reasonable." },
      { text: "When were contracts and HR policies last reviewed for UAE Labour Law compliance?", context: "Recent labour updates can make old wording obsolete.", options: optionSet(["Never or unknown", "More than 3 years ago", "1–3 years ago", "Within 12 months"]), weight: 1, risk: "Outdated HR policies — potentially invalid provisions.", why: "Documents written before recent UAE changes often contain outdated assumptions." },
      { text: "Do you have anti-harassment and workplace conduct policies with a confidential route for complaints?", context: "Without internal reporting, complaints often escalate externally first.", options: optionSet(["No policy", "Generic conduct only", "Policy exists, reporting weak", "Full policy and reporting process"]), weight: 1, risk: "No harassment reporting channel — complaints can escalate directly to MoHRE.", why: "A credible internal channel gives the company a chance to investigate properly." },
    ],
  },
  {
    id: "talent",
    label: "Talent & Recruitment",
    colorClass: "text-risk-purple",
    bgClass: "bg-risk-purple/10",
    intro: "Hiring mistakes, weak onboarding, and unmanaged attrition are expensive. Most SMEs feel the cost before they measure it.",
    questions: [
      { text: "Do you follow a documented hiring process from role approval to offer?", context: "Informal hiring creates salary inconsistency and weak selection quality.", options: optionSet(["No process", "Some structure, varies by manager", "Process exists, not fully documented", "Documented and consistently applied"]), weight: 1, risk: "No hiring process — pay inequity and inconsistency from day one.", why: "A structured process protects quality, fairness, and salary discipline." },
      { text: "Do you know your voluntary turnover rate and run structured exit interviews?", context: "Untracked attrition hides replacement cost and root causes.", options: optionSet(["No tracking", "Rough numbers only", "Tracked but exit data weak", "Tracked monthly with usable exit data"]), weight: 1, risk: "No turnover measurement — replacing people you did not need to lose.", why: "What is not measured rarely gets managed." },
      { text: "Do new joiners have a documented 30/60/90 day onboarding plan?", context: "The first-week experience heavily shapes retention.", options: optionSet(["No structured onboarding", "Informal introductions only", "Some structure, varies", "Full 30/60/90 onboarding"]), weight: 1, risk: "No structured onboarding — early attrition risk elevated.", why: "Clear onboarding shortens ramp-up time and reduces early exits." },
      { text: "Do you have current written job descriptions for every role?", context: "JDs underpin hiring, performance, pay and termination decisions.", options: optionSet(["No written JDs", "Some outdated or missing", "Most exist, not reviewed", "All current and reviewed annually"]), weight: 1, risk: "No written job descriptions — performance and pay decisions lack foundation.", why: "A clear JD defines expectations before there is a performance problem." },
    ],
  },
  {
    id: "perf",
    label: "Performance & Development",
    colorClass: "text-sienna",
    bgClass: "bg-sienna/10",
    intro: "Performance management is often skipped until someone needs to be exited, promoted, or retained. Then the missing paperwork matters.",
    questions: [
      { text: "Do employees have documented objectives or KPIs reviewed at least annually?", context: "Without objectives, pay and performance conversations become subjective.", options: optionSet(["No formal objectives", "Some manager-led objectives", "Process exists, inconsistent", "Objectives documented and reviewed"]), weight: 1.5, risk: "No objectives — compensation decisions feel political.", why: "Documented expectations connect effort, results, and reward." },
      { text: "Do you use a documented PIP/PDP before any underperformance decision?", context: "Underperformance exits need a clear paper trail.", options: optionSet(["No, handled informally", "Some notes, no process", "Template exists, inconsistent", "Formal process always followed"]), weight: 2, risk: "No PIP/PDP process — performance exits are legally fragile.", why: "A defensible exit requires expectations, warnings, targets, dates, and evidence." },
      { text: "Are increases and promotions made against documented criteria?", context: "Negotiation-led pay cycles drive inequity.", options: optionSet(["Entirely informal", "Some criteria, inconsistent", "Criteria exist, low transparency", "Clear documented criteria"]), weight: 1, risk: "Pay increases driven by negotiation — high performer retention risk.", why: "The loudest negotiator should not beat the strongest performer by default." },
      { text: "Is there a budget or structured plan for employee learning and development?", context: "Lack of growth is a common reason good people leave.", options: optionSet(["No plan or budget", "Ad hoc training", "Some budget, not tied to plans", "Dedicated budget and tracked plans"]), weight: 1, risk: "No L&D investment — growth-driven attrition risk.", why: "Visible development gives employees a reason to stay." },
    ],
  },
  {
    id: "comp",
    label: "Compensation & Benefits",
    colorClass: "text-risk-green",
    bgClass: "bg-risk-green/10",
    intro: "Pay chaos quietly damages trust. Salary structure, benchmarking, and communication prevent avoidable exits.",
    questions: [
      { text: "Are salaries structured in defined bands or set through individual negotiation?", context: "Ad hoc negotiation creates pay gaps quickly.", options: optionSet(["Entirely ad hoc", "Informal ranges only", "Rough guidelines", "Defined bands applied consistently"]), weight: 1.5, risk: "No salary structure — pay inequity is likely already present.", why: "Bands give founders control before compensation becomes emotional and inconsistent." },
      { text: "Do you know how packages compare to the UAE market for equivalent roles?", context: "Without benchmarks, you may overpay some roles and underpay critical ones.", options: optionSet(["No benchmarking", "Rough hiring sense only", "Benchmarked 2+ years ago", "Regular market benchmarking"]), weight: 1, risk: "No market benchmarking — overpaying or underpaying without knowing.", why: "Benchmarking turns salary decisions into commercial decisions." },
      { text: "Have you identified unexplained salary differences for similar roles?", context: "Unexplained gaps create legal, trust and retention risk.", options: optionSet(["Yes, significant unexplained gaps", "Probably, no formal review", "Some suspected gaps", "Regular pay equity reviews"]), weight: 1.5, risk: "Pay gaps with no rationale — legal and retention risk.", why: "Employees eventually discover gaps. The best ones often leave first." },
      { text: "Do employees receive a clear total rewards view of salary, allowances, benefits and bonus?", context: "Employees undervalue packages they cannot see clearly.", options: optionSet(["Base salary only", "Components listed, not valued", "Overview at hire only", "Annual total rewards statement"]), weight: 1, risk: "Total rewards not communicated — employees undervalue the package.", why: "A total rewards view improves retention without necessarily increasing cost." },
    ],
  },
  {
    id: "ops",
    label: "HR Operations & Systems",
    colorClass: "text-risk-amber",
    bgClass: "bg-risk-amber/10",
    intro: "Operational HR gaps compound quietly: leave records, payroll errors, scattered files, and inconsistent exits.",
    questions: [
      { text: "How do you track employee leave and annual leave accrual?", context: "Poor records can become a liability in inspection or dispute.", options: optionSet(["Informal spreadsheet/WhatsApp", "Spreadsheet, often outdated", "Shared system, manual accuracy", "HRIS with workflows and accruals"]), weight: 1, risk: "Unreliable leave tracking — liability if records are challenged.", why: "If records are weak, the employee claim often becomes hard to disprove." },
      { text: "Is payroll accurate, on time, and supported by written payslips?", context: "Late payments and weak payslips are common complaint triggers.", options: optionSet(["Late or recurring errors", "Mostly on time, weak payslips", "On time, itemisation inconsistent", "Always on time, detailed payslips"]), weight: 1.5, risk: "Payroll errors or late payment — work permit and dispute exposure.", why: "Payroll hygiene is basic operational credibility." },
      { text: "Are employee records complete, organised, and accessible?", context: "Disputes often require documents from years earlier.", options: optionSet(["Scattered or missing", "Most exist, hard to find", "Mostly complete, manual", "Complete, organised, audited"]), weight: 1, risk: "Incomplete employee records — defence collapses when documents are missing.", why: "Good records protect the company when memory and informal messages are not enough." },
      { text: "Do exits follow a consistent offboarding and final settlement process?", context: "Final settlement disputes are common and avoidable.", options: optionSet(["Ad hoc exits", "Loose checklist", "Process exists, settlement rushed", "Documented checklist and verified settlement"]), weight: 1, risk: "No offboarding process — EOSB disputes become more likely.", why: "A verified final settlement prevents the most common exit conflict." },
    ],
  },
];

export const TARGETED_SECTORS = [
  "Finance / Insurance",
  "Real Estate",
  "Information Technology",
  "Education",
  "Construction",
  "Healthcare",
  "Hospitality",
  "Travel / Tourism",
  "Retail / Wholesale",
  "Media / Communications",
  "Transport / Logistics",
  "Manufacturing",
  "Legal / Professional Services",
  "Other targeted sector",
];

export const POLICY_TYPES = [
  "Annual leave policy",
  "Sick leave policy",
  "Remote and flexible working policy",
  "Code of conduct",
  "Anti-harassment and workplace conduct policy",
  "Disciplinary procedure",
  "Grievance procedure",
  "Recruitment and hiring policy",
  "Performance management policy",
  "Confidentiality and data protection policy",
  "Exit and offboarding policy",
  "Expense and reimbursement policy",
];

export const BUSINESS_SECTORS = [
  "PR / Communications / Marketing",
  "Technology / SaaS",
  "Retail / E-commerce",
  "Hospitality",
  "Professional services / Consulting",
  "Healthcare",
  "Construction / Engineering",
  "Financial services",
  "Education",
  "Logistics / Transport",
  "Real estate",
  "Other",
];

export const GCC_LOCATIONS = ["Dubai, UAE", "Abu Dhabi, UAE", "Riyadh, KSA", "Jeddah, KSA", "Doha, Qatar", "Kuwait City", "Manama, Bahrain", "Amman, Jordan", "Cairo, Egypt"];
