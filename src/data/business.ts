// Business page data — bilingual.
// All user-facing strings are { en, ar }. Read with pick(value, lang) from "@/i18n/T".
// When adding new copy, ALWAYS add the matching `ar` translation in the same edit.

type B = { en: string; ar: string };

export const SERVICE_PILLS: B[] = [
  { en: "Emiratisation", ar: "التوطين" },
  { en: "Saudization", ar: "السعودة" },
  { en: "Talent Mapping", ar: "رسم خريطة الكفاءات" },
  { en: "HR Setup", ar: "تأسيس الموارد البشرية" },
  { en: "Org Design", ar: "تصميم المنظمة" },
  { en: "Retainers", ar: "العقود الشهرية" },
  { en: "C&B", ar: "التعويضات والمزايا" },
  { en: "HR Audit", ar: "تدقيق الموارد البشرية" },
  { en: "Policies", ar: "السياسات" },
];

export const CAREER_PILLS: B[] = [
  { en: "CV Design", ar: "تصميم السيرة الذاتية" },
  { en: "LinkedIn", ar: "لينكدإن" },
  { en: "Coaching", ar: "كوتشينغ" },
  { en: "Branding", ar: "العلامة الشخصية" },
  { en: "Career Pivot", ar: "التحول المهني" },
];

export const MARQUEE_SERVICES: B[] = [
  { en: "Emiratisation Readiness", ar: "جاهزية التوطين" },
  { en: "HR Foundation Pack", ar: "حزمة تأسيس الموارد البشرية" },
  { en: "HR Health Audit", ar: "تدقيق صحة الموارد البشرية" },
  { en: "Organisation Design", ar: "تصميم المنظمة" },
  { en: "Compensation & Benefits", ar: "التعويضات والمزايا" },
  { en: "Fractional HR Director", ar: "مدير موارد بشرية دوام جزئي" },
  { en: "Policy Writing", ar: "كتابة السياسات" },
  { en: "Employment Contracts", ar: "عقود العمل" },
  { en: "Onboarding Frameworks", ar: "أُطر التعريف الوظيفي" },
  { en: "Performance Management", ar: "إدارة الأداء" },
  { en: "Job Architecture", ar: "بنية الوظائف" },
  { en: "Salary Benchmarking", ar: "المقارنة المرجعية للرواتب" },
  { en: "Nafis Subsidies", ar: "دعم نافس" },
  { en: "HR Retainers", ar: "عقود الموارد البشرية الشهرية" },
];

export const HERO_STATS = [
  { value: { en: "AED 3M+", ar: "+3 مليون درهم" }, label: { en: "Documented savings delivered", ar: "وفورات موثّقة محققة" } },
  { value: { en: "16 yrs", ar: "16 سنة" }, label: { en: "Executive HR experience", ar: "خبرة تنفيذية في الموارد البشرية" } },
  { value: { en: "40+", ar: "+40" }, label: { en: "founder hours spent on HR every month", ar: "ساعة شهريًا يصرفها المؤسسون على شؤون الموارد البشرية" } },
];

export const AUDIENCE_SEGMENTS = [
  {
    tag: { en: "Startups & New Businesses", ar: "الشركات الناشئة والأعمال الجديدة" },
    icon: "🏗",
    headline: { en: "You're hiring fast and figuring out HR as you go.", ar: "أنت توظّف بسرعة وتتعامل مع الموارد البشرية على الطريق." },
    body: { en: "Offer letters written in WhatsApp. Policies copy-pasted from somewhere. No one who actually owns it. Every exit, dispute, or MOHRE visit is a six-figure risk you didn't price in.", ar: "خطابات عرض تُكتب على واتساب. سياسات منقولة من مصادر متفرقة. لا مالك حقيقي للملف. كل استقالة أو نزاع أو زيارة من وزارة الموارد البشرية تمثّل خطرًا بستة أرقام لم تحسب حسابه." },
    footer: { en: "0–20 employees", ar: "0–20 موظفًا" },
  },
  {
    tag: { en: "Growing SMEs", ar: "الشركات الصغيرة والمتوسطة المتنامية" },
    icon: "⚡",
    headline: { en: "You've outgrown the way you've been doing HR.", ar: "تجاوزت طريقتك الحالية في إدارة الموارد البشرية." },
    body: { en: "Emiratisation fines are AED 108k per unfilled quota. Performance issues are festering. Your managers don't know how to handle people problems — and neither does anyone else.", ar: "غرامات التوطين تبلغ 108 آلاف درهم عن كل حصة شاغرة. مشاكل الأداء تتفاقم. مدراؤك لا يعرفون كيف يتعاملون مع مشاكل الموظفين، ولا أحد غيرهم يعرف." },
    footer: { en: "20–150 employees", ar: "20–150 موظفًا" },
  },
  {
    tag: { en: "New Market Entrants", ar: "الداخلون الجدد إلى السوق" },
    icon: "✈",
    headline: { en: "Opening in UAE or KSA? The rules aren't obvious.", ar: "تفتتح في الإمارات أو السعودية؟ القواعد ليست بديهية." },
    body: { en: "Mainland vs freezone. WPS. Visa quotas. GOSI. Getting it wrong costs months and hundreds of thousands to unwind. I've done this across 11 markets — I get it right on day one.", ar: "البر الرئيسي مقابل المنطقة الحرة. نظام حماية الأجور. حصص التأشيرات. التأمينات. الخطأ يكلّفك شهورًا ومئات الآلاف لتصحيحه. أنجزت هذا في 11 سوقًا، وأُتقنه من اليوم الأول." },
    footer: { en: "GCC expansion", ar: "التوسّع في دول الخليج" },
  },
  {
    tag: { en: "Founder-Led & PE-Backed", ar: "شركات بقيادة المؤسسين ومدعومة بالاستثمار الخاص" },
    icon: "📈",
    headline: { en: "Raising, scaling, or heading toward exit?", ar: "تجمع تمويلًا، أو توسّع، أو تتجه إلى الخروج؟" },
    body: { en: "Investors and acquirers look at your people file before your P&L. Contracts, compliance, org structure, comp bands — if they're not clean, due diligence will find it. I close the gaps first.", ar: "المستثمرون والمستحوذون يطّلعون على ملف الموظفين قبل قائمة الأرباح والخسائر. العقود والامتثال والهيكل التنظيمي وشرائح الأجور — إن لم تكن نظيفة، فستكشفها العناية الواجبة. أنا أسدّ الثغرات أولاً." },
    footer: { en: "Pre-raise / pre-exit", ar: "ما قبل التمويل / ما قبل الخروج" },
  },
  {
    tag: { en: "Multi-Entity Owners", ar: "أصحاب الكيانات المتعددة" },
    icon: "🏢",
    headline: { en: "Five businesses, five HR setups, zero consistency.", ar: "خمس شركات، خمسة أنظمة موارد بشرية، صفر اتساق." },
    body: { en: "F&B group, retail chain, hospitality portfolio — when compliance, payroll, and culture all run separately, they all drift separately. One framework across everything changes that.", ar: "مجموعة أغذية ومشروبات، سلسلة تجزئة، محفظة ضيافة — حين يدار الامتثال والرواتب والثقافة بشكل منفصل، تنحرف جميعها بشكل منفصل. إطار واحد يجمعها يغيّر ذلك." },
    footer: { en: "Group structures", ar: "هياكل المجموعات" },
  },
  {
    tag: { en: "Lean Teams Building for Growth", ar: "فرق صغيرة تبني للنمو" },
    icon: "🧭",
    headline: { en: "Small team, big ambitions — but your HR can't scale with you yet.", ar: "فريق صغير وطموحات كبيرة — لكن مواردك البشرية لا تستطيع التوسّع معك بعد." },
    body: { en: "No job architecture. Roles that grew organically and now overlap. Onboarding that lives in someone's head. I design the structure, automate the admin, and build the people infrastructure that lets a team of 15 operate like a team of 50.", ar: "لا توجد بنية وظائف. أدوار نمت عشوائيًا وأصبحت متداخلة. تعريف وظيفي يعيش في رأس أحدهم. أصمّم الهيكل، وأتمتت الإدارة، وأبني بنية الموظفين التي تجعل فريقًا من 15 شخصًا يعمل كفريق من 50." },
    footer: { en: "HR automation · Org design · Job architecture", ar: "أتمتة الموارد البشرية · تصميم المنظمة · بنية الوظائف" },
  },
];

export const DIAGNOSTIC_QUESTIONS = [
  { id: "q1", text: { en: "Do all your employees have UAE-compliant employment contracts in place?", ar: "هل جميع موظفيك لديهم عقود عمل متوافقة مع قانون العمل الإماراتي؟" }, weight: 1.5, risk: { en: "Non-compliant contracts expose you to tribunal claims and MOL inspections.", ar: "العقود غير المتوافقة تعرّضك لدعاوى أمام المحاكم العمالية ولتفتيش وزارة العمل." }, service: { en: "HR Foundation Pack", ar: "حزمة تأسيس الموارد البشرية" } },
  { id: "q2", text: { en: "If you have 20+ employees in a targeted sector, do you know your Emiratisation quota and whether you're meeting it?", ar: "إذا كان لديك أكثر من 20 موظفًا في قطاع مستهدف، هل تعرف حصة التوطين الخاصة بك وما إذا كنت تحقّقها؟" }, weight: 2, risk: { en: "Emiratisation non-compliance: AED 108,000 per unfilled position, per quarter.", ar: "عدم الامتثال للتوطين: 108,000 درهم لكل وظيفة غير مشغولة لكل ربع سنة." }, service: { en: "Emiratisation Readiness Pack", ar: "حزمة جاهزية التوطين" } },
  { id: "q3", text: { en: "Do you have a written performance management process that managers actually follow?", ar: "هل لديك عملية مكتوبة لإدارة الأداء يلتزم بها المدراء فعلاً؟" }, weight: 1, risk: { en: "No performance process = no defensible basis for terminations. Wrongful dismissal risk.", ar: "بدون عملية أداء = لا أساس قانوني لإنهاء الخدمة. خطر الفصل التعسفي." }, service: { en: "HR Foundation Pack", ar: "حزمة تأسيس الموارد البشرية" } },
  { id: "q4", text: { en: "Is there a structured onboarding process for every new hire?", ar: "هل توجد عملية تعريف وظيفي منظّمة لكل موظف جديد؟" }, weight: 1, risk: { en: "Poor onboarding drives early attrition — typically within the first 90 days.", ar: "ضعف التعريف الوظيفي يدفع للاستقالة المبكرة — عادة خلال الـ 90 يومًا الأولى." }, service: { en: "HR Foundation Pack", ar: "حزمة تأسيس الموارد البشرية" } },
  { id: "q5", text: { en: "Are your hiring decisions made using structured criteria rather than gut feel?", ar: "هل تُتّخذ قرارات التوظيف لديك بناءً على معايير منظّمة لا على الحدس؟" }, weight: 1, risk: { en: "Unstructured hiring leads to bad hires, discrimination exposure, and cultural damage.", ar: "التوظيف غير المنظّم يقود إلى تعيينات سيئة وتعرّض للتمييز وإضرار بالثقافة." }, service: { en: "HR Health Audit", ar: "تدقيق صحة الموارد البشرية" } },
  { id: "q6", text: { en: "Do you have documented HR policies (leave, disciplinary, code of conduct, data protection)?", ar: "هل لديك سياسات موارد بشرية موثّقة (الإجازات، التأديب، مدوّنة السلوك، حماية البيانات)؟" }, weight: 1.5, risk: { en: "Undocumented policies make disciplinary action legally indefensible.", ar: "السياسات غير الموثّقة تجعل الإجراءات التأديبية غير قابلة للدفاع القانوني." }, service: { en: "HR Foundation Pack", ar: "حزمة تأسيس الموارد البشرية" } },
];

export const FREE_TOOLS = [
  { icon: "📋", name: { en: "HR Health Diagnostic", ar: "تشخيص صحة الموارد البشرية" }, desc: { en: "24-question diagnostic across 6 HR dimensions. Get your maturity score instantly.", ar: "تشخيص من 24 سؤالاً عبر 6 أبعاد للموارد البشرية. احصل على درجة نضجك فورًا." } },
  { icon: "🇦🇪", name: { en: "Emiratisation Calculator", ar: "حاسبة التوطين" }, desc: { en: "Know your exact quota, shortfall, and quarterly fine exposure in seconds.", ar: "اعرف حصتك بالضبط، والفجوة، والتعرّض للغرامات الربع سنوية في ثوانٍ." } },
  { icon: "📄", name: { en: "AI Policy Generator", ar: "مُولّد السياسات بالذكاء الاصطناعي" }, desc: { en: "Generate a UAE-compliant HR policy document for any policy type, any sector.", ar: "أنشئ وثيقة سياسة موارد بشرية متوافقة مع قانون الإمارات لأي نوع وأي قطاع." } },
  { icon: "💼", name: { en: "AI JD Builder", ar: "منشئ الوصف الوظيفي بالذكاء الاصطناعي" }, desc: { en: "Build market-calibrated job descriptions for any role across the GCC.", ar: "ابنِ أوصافًا وظيفية معايرة للسوق لأي دور في دول الخليج." } },
];

export const SERVICES = [
  {
    tag: { en: "Compliance", ar: "الامتثال" },
    name: { en: "Emiratisation Readiness Pack", ar: "حزمة جاهزية التوطين" },
    price: { en: "AED 3,500", ar: "3,500 درهم" },
    priceNote: { en: "flat fee", ar: "رسوم ثابتة" },
    desc: { en: "Your 2026 Emiratisation exposure could reach AED 200k+ per gap. This package ensures you are legally and operationally ready to meet MOHRE requirements without the last-minute panic.", ar: "قد يبلغ تعرّضك للتوطين عام 2026 أكثر من 200 ألف درهم لكل فجوة. هذه الحزمة تضمن جاهزيتك قانونيًا وتشغيليًا لمتطلبات وزارة الموارد البشرية دون ذعر اللحظة الأخيرة." },
    deliverables: [
      { en: "Quota & gap analysis", ar: "تحليل الحصص والفجوات" },
      { en: "Nafis subsidy walkthrough", ar: "شرح دعم نافس" },
      { en: "Emirati-ready contract review", ar: "مراجعة عقود جاهزة للمواطنين" },
      { en: "GPSSA pension system guide", ar: "دليل نظام التقاعد GPSSA" },
      { en: "90-day compliance roadmap", ar: "خارطة طريق امتثال لـ 90 يومًا" },
      { en: "2-day delivery", ar: "تسليم خلال يومين" },
    ],
  },
  {
    tag: { en: "Audit", ar: "التدقيق" },
    name: { en: "HR Health & Liability Audit", ar: "تدقيق صحة الموارد البشرية والمسؤولية" },
    price: { en: "AED 4,500", ar: "4,500 درهم" },
    priceNote: { en: "flat fee", ar: "رسوم ثابتة" },
    desc: { en: "A single undefended labor claim or WPS violation can cost between AED 50,000 and AED 150,000. We find the leaks before they become liabilities.", ar: "دعوى عمالية واحدة غير مدافع عنها أو مخالفة لنظام حماية الأجور قد تكلّف بين 50,000 و150,000 درهم. نكتشف التسريبات قبل أن تتحوّل إلى التزامات." },
    deliverables: [
      { en: "6-dimension health scorecard", ar: "بطاقة صحة من 6 أبعاد" },
      { en: "Financial risk & exposure register", ar: "سجل المخاطر المالية والتعرّض" },
      { en: "Prioritized fix-it action plan", ar: "خطة عمل تصحيحية مرتّبة بالأولوية" },
      { en: "30-minute executive briefing", ar: "إفادة تنفيذية مدّتها 30 دقيقة" },
      { en: "Delivery: 4 business days", ar: "التسليم: 4 أيام عمل" },
    ],
  },
  {
    tag: { en: "HR Foundation", ar: "تأسيس الموارد البشرية" },
    name: { en: "GCC Labor Law-Compliant Pack", ar: "حزمة متوافقة مع قانون العمل الخليجي" },
    price: { en: "AED 7,500", ar: "7,500 درهم" },
    priceNote: { en: "flat fee", ar: "رسوم ثابتة" },
    desc: { en: "Without documented policies, every people decision is a negotiation. This builds the legal infrastructure your business needs to scale safely across the GCC.", ar: "بدون سياسات موثّقة، يصبح كل قرار يخصّ الموظفين مفاوضة. هذه الحزمة تبني البنية القانونية التي يحتاجها عملك للتوسّع بأمان في دول الخليج." },
    deliverables: [
      { en: "3 labor law-compliant contracts", ar: "3 عقود متوافقة مع قانون العمل" },
      { en: "10 core HR policies", ar: "10 سياسات أساسية للموارد البشرية" },
      { en: "Culture-aligned employee handbook", ar: "دليل موظفين متوافق مع الثقافة" },
      { en: "Onboarding & offboarding frameworks", ar: "أُطر التعريف الوظيفي وإنهاء الخدمة" },
      { en: "Delivery: 7 business days", ar: "التسليم: 7 أيام عمل" },
    ],
  },
  {
    tag: { en: "Design", ar: "التصميم" },
    name: { en: "Organisation Architecture", ar: "بنية المنظمة" },
    price: { en: "From AED 10,000", ar: "ابتداءً من 10,000 درهم" },
    priceNote: { en: "based on size & scope", ar: "حسب الحجم والنطاق" },
    desc: { en: "The wrong structure leads to duplicated effort and quietly burned payroll. We design the clarity your business needs to move from a founder-led to a process-led organization.", ar: "الهيكل الخاطئ يؤدي إلى ازدواج الجهد وحرق صامت لميزانية الرواتب. نصمّم الوضوح الذي يحتاجه عملك للانتقال من شركة بقيادة المؤسس إلى شركة تقودها العمليات." },
    deliverables: [
      { en: "Structural optimization recommendation", ar: "توصية تحسين الهيكل" },
      { en: "Target Operating Model (TOM)", ar: "نموذج التشغيل المستهدف (TOM)" },
      { en: "Job architecture & grading", ar: "بنية الوظائف والتدرّج الوظيفي" },
      { en: "Accountability-based role profiles", ar: "ملفات أدوار قائمة على المساءلة" },
      { en: "Delivery: 10 business days", ar: "التسليم: 10 أيام عمل" },
    ],
  },
  {
    tag: { en: "Total Reward", ar: "إجمالي المكافآت" },
    name: { en: "C&B & Retention Framework", ar: "إطار التعويضات والمزايا والاستبقاء" },
    price: { en: "From AED 9,000", ar: "ابتداءً من 9,000 درهم" },
    priceNote: { en: "based on size & scope", ar: "حسب الحجم والنطاق" },
    desc: { en: "Guesswork in salary leads to overpaying average performers and losing your best ones. We build a structured pay framework that balances market competitiveness with your bottom line.", ar: "التخمين في الرواتب يقود إلى دفع زائد لأصحاب الأداء المتوسّط وفقدان الأفضل بينهم. نبني إطار أجور منظّم يوازن بين تنافسية السوق وصافي أرباحك." },
    deliverables: [
      { en: "GCC market salary benchmarking", ar: "مقارنة مرجعية لرواتب السوق الخليجي" },
      { en: "Structured salary band design", ar: "تصميم شرائح رواتب منظّمة" },
      { en: "Internal pay equity analysis", ar: "تحليل العدالة الداخلية للأجور" },
      { en: "Performance-linked incentive design", ar: "تصميم حوافز مرتبطة بالأداء" },
      { en: "Delivery: 14 business days", ar: "التسليم: 14 يوم عمل" },
    ],
  },
  {
    tag: { en: "Systems", ar: "الأنظمة" },
    name: { en: "Odoo & HRIS Quick-Start", ar: "بداية سريعة لـ Odoo وأنظمة HRIS" },
    price: { en: "From AED 5,000", ar: "ابتداءً من 5,000 درهم" },
    priceNote: { en: "consultation & configuration", ar: "استشارة وتهيئة" },
    desc: { en: "Stop managing your workforce on spreadsheets. We guide you to the ideal HRIS for your unique needs — whether that's a cost-effective Quick-Start using Odoo's free version or a fully tailored enterprise solution — to digitize your operations instantly.", ar: "توقّف عن إدارة موظفيك بجداول البيانات. نرشدك إلى نظام HRIS الأنسب لاحتياجاتك — سواء كانت بداية سريعة منخفضة التكلفة باستخدام النسخة المجانية من Odoo أو حلًا مؤسسيًا مفصّلاً بالكامل — لرقمنة عملياتك فورًا." },
    deliverables: [
      { en: "System scoping & vendor selection", ar: "تحديد نطاق النظام واختيار المورّد" },
      { en: "Odoo Quick-Start (Free/Standard version)", ar: "بداية سريعة لـ Odoo (نسخة مجانية/قياسية)" },
      { en: "Custom configuration for specialized HRIS", ar: "تهيئة مخصّصة لأنظمة HRIS متخصّصة" },
      { en: "WPS-ready payroll & data setup", ar: "إعداد رواتب وبيانات جاهزة لنظام حماية الأجور" },
      { en: "Delivery: 5 business days", ar: "التسليم: 5 أيام عمل" },
    ],
  },
  {
    tag: { en: "Automation", ar: "الأتمتة" },
    name: { en: "HR Workflow & Admin Automations", ar: "أتمتة سير عمل الموارد البشرية والإدارة" },
    price: { en: "From AED 5,000", ar: "ابتداءً من 5,000 درهم" },
    priceNote: { en: "based on scope", ar: "حسب النطاق" },
    desc: { en: "Most HR teams lose 40% of their week to manual follow-ups. We build the digital glue that connects your systems and handles the repetitive tasks.", ar: "تفقد معظم فرق الموارد البشرية 40% من أسبوعها في المتابعات اليدوية. نبني الرابط الرقمي الذي يصل أنظمتك ويتولّى المهام المتكرّرة." },
    deliverables: [
      { en: "Manual process & bottleneck audit", ar: "تدقيق العمليات اليدوية ونقاط الاختناق" },
      { en: "Custom approval & request workflows", ar: "سير عمل مخصّص للموافقات والطلبات" },
      { en: "Visa & document renewal auto-alerts", ar: "تنبيهات تلقائية لتجديد التأشيرات والوثائق" },
      { en: "Automated document generation", ar: "توليد وثائق آلي" },
      { en: "Delivery: 7 business days", ar: "التسليم: 7 أيام عمل" },
    ],
  },
  {
    tag: { en: "Outsourcing", ar: "التعهيد" },
    name: { en: "Payroll & WPS Managed Service", ar: "خدمة الرواتب ونظام حماية الأجور المُدارة" },
    price: { en: "From AED 120", ar: "ابتداءً من 120 درهم" },
    priceNote: { en: "per employee/month (+AED 5,000 one-time setup)", ar: "لكل موظف/شهر (+5,000 درهم تأسيس لمرة واحدة)" },
    desc: { en: "Focus on your business while we handle the technical complexities of GCC payroll. We act as your Back Office, ensuring every employee is paid accurately and on time via WPS.", ar: "ركّز على عملك بينما نتولى تعقيدات الرواتب في الخليج. نعمل كمكتبك الخلفي ونضمن أن يُدفع لكل موظف بدقة وفي وقته عبر نظام حماية الأجور." },
    deliverables: [
      { en: "One-time data & gratuity cleanup", ar: "تنظيف بيانات ومكافأة نهاية الخدمة لمرة واحدة" },
      { en: "Monthly SIF & payroll processing", ar: "معالجة ملف SIF والرواتب شهريًا" },
      { en: "WPS compliance & block monitoring", ar: "الامتثال لنظام حماية الأجور ومراقبة الحظر" },
      { en: "Leave & EOSB liability tracking", ar: "تتبّع التزامات الإجازات ومكافأة نهاية الخدمة" },
      { en: "Monthly HR & financial reporting", ar: "تقارير شهرية للموارد البشرية والمالية" },
    ],
  },
  {
    tag: { en: "Embedded", ar: "المدمج" },
    name: { en: "Fractional HR Director & BOT", ar: "مدير موارد بشرية دوام جزئي ونموذج BOT" },
    price: { en: "From AED 18,000", ar: "ابتداءً من 18,000 درهم" },
    priceNote: { en: "per month", ar: "شهريًا" },
    desc: { en: "A qualified HR Director in the UAE costs AED 35k–50k/month — plus visa, benefits, and notice period risk. The Fractional HR Director gives you the same seniority, embedded in your leadership team, at a fraction of the cost. The BOT model means you exit the engagement with a fully built in-house HR function.", ar: "مدير موارد بشرية مؤهّل في الإمارات يكلّف 35–50 ألف درهم شهريًا — إضافة إلى التأشيرة والمزايا ومخاطر فترة الإشعار. مدير الموارد البشرية بدوام جزئي يمنحك الخبرة نفسها، مدمجًا في فريق قيادتك، بجزء من التكلفة. ونموذج البناء-التشغيل-التحويل (BOT) يعني أن تخرج من التعاقد بقسم موارد بشرية داخلي مكتمل." },
    deliverables: [
      { en: "Senior HR leadership at a fraction of full-time cost", ar: "قيادة موارد بشرية رفيعة بجزء من تكلفة التفرّغ" },
      { en: "Full HR function ownership & board-level reporting", ar: "ملكية كاملة لوظيفة الموارد البشرية وتقارير على مستوى مجلس الإدارة" },
      { en: "Build-Operate-Transfer (BOT) model for in-house teams", ar: "نموذج البناء-التشغيل-التحويل (BOT) للفرق الداخلية" },
      { en: "Strategic scaling & culture development", ar: "توسّع استراتيجي وتطوير الثقافة" },
      { en: "Monthly retainer", ar: "عقد شهري" },
    ],
  },
];

export const RETAINER_TIERS = [
  {
    name: { en: "Starter", ar: "البداية" },
    price: { en: "AED 4,500", ar: "4,500 درهم" },
    per: { en: "per month", ar: "شهريًا" },
    size: { en: "1–20 employees", ar: "1–20 موظفًا" },
    featured: false,
    bestValue: false,
    features: [
      { en: "Monthly HR check-in (2hrs)", ar: "اجتماع شهري للموارد البشرية (ساعتان)" },
      { en: "Email support within 24hrs", ar: "دعم بالبريد الإلكتروني خلال 24 ساعة" },
      { en: "Contract & policy review", ar: "مراجعة العقود والسياسات" },
      { en: "Emiratisation monitoring", ar: "متابعة التوطين" },
      { en: "1 HR project per quarter", ar: "مشروع موارد بشرية واحد لكل ربع سنة" },
    ],
  },
  {
    name: { en: "Growth", ar: "النمو" },
    price: { en: "AED 7,500", ar: "7,500 درهم" },
    per: { en: "per month", ar: "شهريًا" },
    size: { en: "20–60 employees", ar: "20–60 موظفًا" },
    featured: true,
    bestValue: false,
    features: [
      { en: "Weekly HR check-in (4hrs/month)", ar: "اجتماع أسبوعي للموارد البشرية (4 ساعات/شهر)" },
      { en: "Priority WhatsApp support", ar: "دعم واتساب ذو أولوية" },
      { en: "Emiratisation compliance management", ar: "إدارة الامتثال للتوطين" },
      { en: "Quarterly policy & contract review", ar: "مراجعة ربع سنوية للسياسات والعقود" },
      { en: "2 HR projects per quarter", ar: "مشروعان للموارد البشرية لكل ربع سنة" },
      { en: "Performance management support", ar: "دعم إدارة الأداء" },
    ],
  },
  {
    name: { en: "Scale", ar: "التوسّع" },
    price: { en: "AED 12,000", ar: "12,000 درهم" },
    per: { en: "per month", ar: "شهريًا" },
    size: { en: "60–150 employees", ar: "60–150 موظفًا" },
    featured: false,
    bestValue: false,
    features: [
      { en: "Dedicated HR advisory (8hrs/month)", ar: "استشارة موارد بشرية مخصّصة (8 ساعات/شهر)" },
      { en: "Same-day response guarantee", ar: "ضمان الردّ في اليوم نفسه" },
      { en: "Full Emiratisation management", ar: "إدارة كاملة للتوطين" },
      { en: "Monthly HR reporting", ar: "تقارير موارد بشرية شهرية" },
      { en: "3 HR projects per quarter", ar: "ثلاثة مشاريع موارد بشرية لكل ربع سنة" },
      { en: "Recruitment support", ar: "دعم التوظيف" },
      { en: "L&D planning", ar: "تخطيط التعلّم والتطوير" },
    ],
  },
  {
    name: { en: "Fractional", ar: "دوام جزئي" },
    price: { en: "From AED 18,000", ar: "ابتداءً من 18,000 درهم" },
    per: { en: "per month", ar: "شهريًا" },
    size: { en: "100+ employees", ar: "+100 موظف" },
    featured: false,
    bestValue: true,
    features: [
      { en: "Embedded 2–3 days/week on-site", ar: "حضور ميداني 2–3 أيام أسبوعيًا" },
      { en: "Full HR Director responsibilities", ar: "كامل مسؤوليات مدير الموارد البشرية" },
      { en: "Build-Operate-Transfer model", ar: "نموذج البناء-التشغيل-التحويل" },
      { en: "Board-level HR strategy", ar: "استراتيجية موارد بشرية على مستوى مجلس الإدارة" },
      { en: "Unlimited projects", ar: "مشاريع غير محدودة" },
      { en: "Team building support", ar: "دعم بناء الفريق" },
    ],
  },
];

export const SECTORS: B[] = [
  { en: "Financial Services", ar: "الخدمات المالية" },
  { en: "Insurance", ar: "التأمين" },
  { en: "Retail", ar: "البيع بالتجزئة" },
  { en: "Healthcare", ar: "الرعاية الصحية" },
  { en: "IT & Technology", ar: "تقنية المعلومات والتكنولوجيا" },
  { en: "Real Estate", ar: "العقارات" },
  { en: "Construction", ar: "الإنشاءات" },
  { en: "Education", ar: "التعليم" },
  { en: "Hospitality & Tourism", ar: "الضيافة والسياحة" },
  { en: "Media & Advertising", ar: "الإعلام والإعلان" },
  { en: "Telecommunications", ar: "الاتصالات" },
  { en: "Manufacturing", ar: "التصنيع" },
  { en: "Logistics", ar: "الخدمات اللوجستية" },
  { en: "Professional Services", ar: "الخدمات المهنية" },
];

// Sector quota rates keyed by ENGLISH name (stable internal key).
export const SECTOR_RATES: Record<string, number> = {
  "Financial Services": 0.10, "Insurance": 0.10, "Retail": 0.05, "Healthcare": 0.05,
  "IT & Technology": 0.04, "Real Estate": 0.05, "Construction": 0.02, "Education": 0.05,
  "Hospitality & Tourism": 0.02, "Media & Advertising": 0.04, "Telecommunications": 0.08,
  "Manufacturing": 0.02, "Logistics": 0.02, "Professional Services": 0.05,
};

export const ABOUT_CREDENTIALS = [
  { n: { en: "MBA", ar: "ماجستير إدارة أعمال" }, s: { en: "Human Resources", ar: "موارد بشرية" } },
  { n: { en: "PHRi", ar: "PHRi" }, s: { en: "HRCI Certified", ar: "معتمد من HRCI" } },
  { n: { en: "16 Years", ar: "16 سنة" }, s: { en: "Executive HR Leadership", ar: "قيادة تنفيذية في الموارد البشرية" } },
  { n: { en: "11 Markets", ar: "11 سوقًا" }, s: { en: "MENAT Region", ar: "منطقة الشرق الأوسط وشمال أفريقيا وتركيا" } },
  { n: { en: "Bilingual", ar: "ثنائي اللغة" }, s: { en: "Arabic & English", ar: "العربية والإنجليزية" } },
  { n: { en: "🏆 Campaign ME", ar: "🏆 Campaign ME" }, s: { en: "Best Talent Team 2025", ar: "أفضل فريق موارد بشرية 2025" } },
];
