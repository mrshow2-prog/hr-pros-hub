import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { GeneratedCV, TemplateId, CVExperience } from "@/contexts/CVBuilderContext";
import { getTemplateConfig, type TemplateConfig } from "@/lib/cvTemplateConfig";

interface Props {
  cv: GeneratedCV;
  template: TemplateId;
  photoDataUrl: string | null;
}

/* ---------- layout constants ---------- */
const PAGE_PAD_X = 36;
const PAGE_PAD_TOP = 40;
const PAGE_PAD_BOTTOM = 50;
const SIDEBAR_WIDTH = 180;
const SIDEBAR_GUTTER = 22;
const HEADER_HEIGHT = 110; // reserved area for the page-1 header strip

const MUTED = "#6b7280";
const INK = "#1f2937";
const SUBINK = "#374151";
const HAIRLINE = "#e5e7eb";

/* ---------- styles ---------- */
function makeStyles(cfg: TemplateConfig) {
  const isSidebar = cfg.layoutStyle === "sidebar";
  const headingTransform = cfg.headingUppercase ? ("uppercase" as const) : ("none" as const);
  const headingLetter = cfg.headingUppercase ? 1.1 : 0;

  return StyleSheet.create({
    page: {
      paddingTop: PAGE_PAD_TOP,
      paddingBottom: PAGE_PAD_BOTTOM,
      paddingHorizontal: PAGE_PAD_X,
      fontFamily: cfg.bodyFont,
      fontSize: 10,
      color: INK,
      lineHeight: 1.45,
    },
    /* page-1 header strip */
    headerStrip: {
      flexDirection: cfg.photoPosition === "top-right" ? "row-reverse" : "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 18,
      paddingBottom: 14,
      borderBottomWidth: 1.5,
      borderBottomColor: cfg.primaryColor,
    },
    photoCircle: {
      width: 84,
      height: 84,
      borderRadius: 999,
      objectFit: "cover",
    },
    photoSquare: {
      width: 84,
      height: 84,
      borderRadius: 4,
      objectFit: "cover",
    },
    name: {
      fontFamily: cfg.headingFont,
      fontSize: 24,
      color: INK,
      letterSpacing: cfg.headingUppercase ? 0.5 : -0.3,
      marginBottom: 2,
    },
    jobTitle: {
      fontFamily: cfg.bodyFont,
      fontSize: 13,
      color: cfg.primaryColor,
      marginBottom: 6,
    },
    contactLine: { fontSize: 9, color: MUTED, lineHeight: 1.5 },

    /* sidebar */
    sidebar: {
      position: "absolute",
      top: PAGE_PAD_TOP + HEADER_HEIGHT + 4,
      left: PAGE_PAD_X,
      width: SIDEBAR_WIDTH,
      paddingRight: 12,
      borderRightWidth: isSidebar ? 0.75 : 0,
      borderRightColor: HAIRLINE,
    },
    sidebarPhoto: {
      width: 110,
      height: 110,
      borderRadius: cfg.photoStyle === "circle" ? 999 : 6,
      objectFit: "cover",
      marginBottom: 12,
      alignSelf: "flex-start",
    },

    /* main column */
    mainPage1: isSidebar
      ? { marginLeft: SIDEBAR_WIDTH + SIDEBAR_GUTTER }
      : {},
    mainCont: {},

    /* sections */
    section: { marginBottom: 14 },
    sectionTitle: {
      fontFamily: cfg.headingFont,
      fontSize: 11,
      color: cfg.primaryColor,
      textTransform: headingTransform,
      letterSpacing: headingLetter,
      marginBottom: 6,
    },
    sectionUnderline: {
      borderBottomWidth: 1,
      borderBottomColor: cfg.primaryColor,
      paddingBottom: 4,
      marginBottom: 7,
    },
    sectionBar: {
      borderLeftWidth: 3,
      borderLeftColor: cfg.primaryColor,
      paddingLeft: 8,
      marginBottom: 7,
    },

    /* experience */
    expItem: { marginBottom: 11 },
    expHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 1,
    },
    role: {
      fontFamily: cfg.headingFont,
      fontSize: 11.5,
      color: INK,
    },
    period: { fontSize: 9, color: MUTED },
    company: {
      fontSize: 10,
      color: cfg.primaryColor,
      marginBottom: 4,
    },
    bulletRow: { flexDirection: "row", marginBottom: 2.5, paddingRight: 4 },
    bulletGlyph: {
      width: 10,
      fontSize: 10,
      color: cfg.primaryColor,
      lineHeight: 1.45,
    },
    bulletText: { flex: 1, fontSize: 10, color: SUBINK, lineHeight: 1.5 },

    /* summary */
    summary: { fontSize: 10.5, color: SUBINK, lineHeight: 1.55 },

    /* sidebar list */
    sideItem: { fontSize: 9.5, color: SUBINK, marginBottom: 3, lineHeight: 1.45 },
    sideMuted: { color: MUTED, fontSize: 9 },

    /* education */
    eduItem: { marginBottom: 7 },
    eduTitle: { fontFamily: cfg.headingFont, fontSize: 10.5, color: INK },
    eduSub: { fontSize: 9.5, color: cfg.primaryColor },
    eduPeriod: { fontSize: 9, color: MUTED },

    /* running header (page 2+) */
    runningHeader: {
      position: "absolute",
      top: 20,
      left: PAGE_PAD_X,
      right: PAGE_PAD_X,
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 0.5,
      borderBottomColor: HAIRLINE,
      paddingBottom: 4,
    },
    runningHeaderName: {
      fontFamily: cfg.headingFont,
      fontSize: 9.5,
      color: cfg.primaryColor,
      textTransform: headingTransform,
      letterSpacing: headingLetter,
    },
    runningHeaderPage: { fontSize: 9, color: MUTED },
  });
}

/* ---------- helpers ---------- */
function SectionTitle({
  title,
  cfg,
  styles,
}: {
  title: string;
  cfg: TemplateConfig;
  styles: ReturnType<typeof makeStyles>;
}) {
  if (cfg.sectionDividerStyle === "underline") {
    return (
      <View style={styles.sectionUnderline}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    );
  }
  if (cfg.sectionDividerStyle === "bar") {
    return (
      <View style={styles.sectionBar}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    );
  }
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function renderRole(
  exp: CVExperience,
  styles: ReturnType<typeof makeStyles>,
) {
  const bullets = exp.bullets.filter(
    (b) => b.status !== "reverted" && (b.rewrite || b.original),
  );
  const period =
    [exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period || "";
  return (
    <View key={exp.id} style={styles.expItem} wrap minPresenceAhead={40}>
      <View style={styles.expHeader}>
        <Text style={styles.role}>{exp.role || ""}</Text>
        {period ? <Text style={styles.period}>{period}</Text> : null}
      </View>
      {(exp.company || exp.location) && (
        <Text style={styles.company}>
          {[exp.company, exp.location].filter(Boolean).join(" · ")}
        </Text>
      )}
      {bullets.map((b) => (
        <View key={b.id} style={styles.bulletRow} wrap={false}>
          <Text style={styles.bulletGlyph}>•</Text>
          <Text style={styles.bulletText}>{b.rewrite || b.original}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Split experience into a "page 1 chunk" that comfortably fits next to the
 * sidebar, and the rest that flows on subsequent pages. Heuristic: include
 * roles until we've used ~12 bullet-equivalents OR 2 roles, whichever first.
 */
function splitExperience(exps: CVExperience[]): {
  pageOne: CVExperience[];
  rest: CVExperience[];
} {
  let bulletsUsed = 0;
  let i = 0;
  for (; i < exps.length; i++) {
    const b = exps[i].bullets.filter(
      (x) => x.status !== "reverted" && (x.rewrite || x.original),
    ).length;
    // header row counts ~2 bullet-equivalents
    if (i > 0 && (bulletsUsed + b + 2 > 12 || i >= 2)) break;
    bulletsUsed += b + 2;
  }
  return { pageOne: exps.slice(0, Math.max(1, i)), rest: exps.slice(Math.max(1, i)) };
}

/* ---------- main component ---------- */
export default function CVPdfDocument({ cv, template, photoDataUrl }: Props) {
  const cfg = getTemplateConfig(template);
  const styles = makeStyles(cfg);
  const hidden = new Set(cv.hiddenSections);
  const isSidebar = cfg.layoutStyle === "sidebar";

  const contactItems = [
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    cv.contact.linkedinUrl,
  ].filter(Boolean) as string[];

  const experience = cv.experience ?? [];
  const { pageOne: expPage1, rest: expRest } = splitExperience(experience);

  const showLanguageLevel = (lvl: string | undefined) =>
    lvl && lvl.trim().length > 0 ? ` (${lvl})` : "";

  /* ----- sidebar blocks ----- */
  const SidebarPhoto = () =>
    photoDataUrl && cfg.photoStyle !== "none" ? (
      // eslint-disable-next-line jsx-a11y/alt-text
      <Image src={photoDataUrl} style={styles.sidebarPhoto} />
    ) : null;

  const SidebarContact = () =>
    !hidden.has("contact") && contactItems.length > 0 ? (
      <View style={styles.section}>
        <SectionTitle title="Contact" cfg={cfg} styles={styles} />
        {contactItems.map((c) => (
          <Text key={c} style={styles.sideItem}>
            {c}
          </Text>
        ))}
      </View>
    ) : null;

  const SidebarSkills = () =>
    !hidden.has("skills") && cv.skills.length > 0 ? (
      <View style={styles.section}>
        <SectionTitle title="Skills" cfg={cfg} styles={styles} />
        {cv.skills.map((s) => (
          <Text key={s} style={styles.sideItem}>
            • {s}
          </Text>
        ))}
      </View>
    ) : null;

  const SidebarLanguages = () =>
    !hidden.has("languages") && cv.languages.length > 0 ? (
      <View style={styles.section}>
        <SectionTitle title="Languages" cfg={cfg} styles={styles} />
        {cv.languages.map((l) => (
          <Text key={l.id} style={styles.sideItem}>
            <Text style={{ color: INK }}>{l.name}</Text>
            <Text style={styles.sideMuted}>{showLanguageLevel(l.level)}</Text>
          </Text>
        ))}
      </View>
    ) : null;

  /* ----- main content blocks ----- */
  const SummaryBlock = () =>
    !hidden.has("summary") && cv.summary ? (
      <View style={styles.section}>
        <SectionTitle title="Professional Summary" cfg={cfg} styles={styles} />
        <Text style={styles.summary}>{cv.summary}</Text>
      </View>
    ) : null;

  const EducationBlock = () =>
    !hidden.has("education") && cv.education.length > 0 ? (
      <View style={styles.section} wrap>
        <SectionTitle title="Education" cfg={cfg} styles={styles} />
        {cv.education.map((ed) => (
          <View key={ed.id} style={styles.eduItem} wrap={false}>
            <View style={styles.expHeader}>
              <Text style={styles.eduTitle}>{ed.qualification}</Text>
              {ed.period ? <Text style={styles.eduPeriod}>{ed.period}</Text> : null}
            </View>
            {ed.institution ? <Text style={styles.eduSub}>{ed.institution}</Text> : null}
          </View>
        ))}
      </View>
    ) : null;

  /* ---------- single-column layout (no sidebar) ---------- */
  if (!isSidebar) {
    return (
      <Document>
        <Page size="A4" style={styles.page} wrap>
          {/* Page-2+ running header */}
          <View
            fixed
            style={styles.runningHeader}
            render={({ pageNumber }) =>
              pageNumber > 1 ? (
                <>
                  <Text style={styles.runningHeaderName}>{cv.contact.name || ""}</Text>
                  <Text style={styles.runningHeaderPage}>Page {pageNumber}</Text>
                </>
              ) : null
            }
          />

          {!hidden.has("contact") && (
            <View style={styles.headerStrip}>
              {photoDataUrl && cfg.photoStyle !== "none" && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image
                  src={photoDataUrl}
                  style={cfg.photoStyle === "circle" ? styles.photoCircle : styles.photoSquare}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{cv.contact.name || "Your name"}</Text>
                {cv.contact.jobTitle && (
                  <Text style={styles.jobTitle}>{cv.contact.jobTitle}</Text>
                )}
                <Text style={styles.contactLine}>{contactItems.join("  ·  ")}</Text>
              </View>
            </View>
          )}

          <SummaryBlock />

          {!hidden.has("experience") && experience.length > 0 && (
            <View style={styles.section} wrap>
              <SectionTitle title="Work Experience" cfg={cfg} styles={styles} />
              {experience.map((exp) => renderRole(exp, styles))}
            </View>
          )}

          <EducationBlock />

          {!hidden.has("skills") && cv.skills.length > 0 && (
            <View style={styles.section} wrap>
              <SectionTitle title="Skills" cfg={cfg} styles={styles} />
              <Text style={styles.summary}>{cv.skills.join("  ·  ")}</Text>
            </View>
          )}

          {!hidden.has("languages") && cv.languages.length > 0 && (
            <View style={styles.section} wrap={false}>
              <SectionTitle title="Languages" cfg={cfg} styles={styles} />
              <Text style={styles.summary}>
                {cv.languages
                  .map((l) => `${l.name}${showLanguageLevel(l.level)}`)
                  .join("  ·  ")}
              </Text>
            </View>
          )}
        </Page>
      </Document>
    );
  }

  /* ---------- sidebar layout ---------- */
  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        {/* Header strip across full width */}
        {!hidden.has("contact") && (
          <View style={styles.headerStrip}>
            {photoDataUrl && cfg.photoStyle !== "none" && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image
                src={photoDataUrl}
                style={cfg.photoStyle === "circle" ? styles.photoCircle : styles.photoSquare}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{cv.contact.name || "Your name"}</Text>
              {cv.contact.jobTitle && (
                <Text style={styles.jobTitle}>{cv.contact.jobTitle}</Text>
              )}
              <Text style={styles.contactLine}>{contactItems.join("  ·  ")}</Text>
            </View>
          </View>
        )}

        {/* Sidebar (page 1 only — absolute positioned) */}
        <View style={styles.sidebar}>
          <SidebarSkills />
          <SidebarLanguages />
        </View>

        {/* Main column on page 1 */}
        <View style={styles.mainPage1}>
          <SummaryBlock />
          {!hidden.has("experience") && expPage1.length > 0 && (
            <View style={styles.section}>
              <SectionTitle title="Work Experience" cfg={cfg} styles={styles} />
              {expPage1.map((exp) => renderRole(exp, styles))}
            </View>
          )}
        </View>
      </Page>

      {/* Page 2+ (single column, full width) */}
      {(expRest.length > 0 || (!hidden.has("education") && cv.education.length > 0)) && (
        <Page size="A4" style={styles.page} wrap>
          <View
            fixed
            style={styles.runningHeader}
            render={({ pageNumber }) => (
              <>
                <Text style={styles.runningHeaderName}>{cv.contact.name || ""}</Text>
                <Text style={styles.runningHeaderPage}>Page {pageNumber}</Text>
              </>
            )}
          />
          <View style={{ marginTop: 14 }}>
            {expRest.length > 0 && (
              <View style={styles.section} wrap>
                <SectionTitle title="Experience (continued)" cfg={cfg} styles={styles} />
                {expRest.map((exp) => renderRole(exp, styles))}
              </View>
            )}
            <EducationBlock />
          </View>
        </Page>
      )}
    </Document>
  );
}
