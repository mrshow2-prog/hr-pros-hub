import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type {
  GeneratedCV,
  TemplateId,
  CVExperience,
} from "@/contexts/CVBuilderContext";
import { getTemplateConfig, type TemplateConfig } from "@/lib/cvTemplateConfig";

interface Props {
  cv: GeneratedCV;
  template: TemplateId;
  photoDataUrl: string | null;
}

/* ===================== layout constants ===================== */
const PAGE_PAD = 0; // we paint the band ourselves
const BODY_PAD_X = 32;
const BODY_PAD_TOP = 24;
const BODY_PAD_BOTTOM = 44;

const SIDEBAR_WIDTH = 195;
const GUTTER = 22;

const INK = "#111827";
const SUBINK = "#374151";
const MUTED = "#6b7280";
const HAIRLINE = "#e5e7eb";
const SIDEBAR_BG = "#f7f4ef";

/* ===================== styles ===================== */
function makeStyles(cfg: TemplateConfig) {
  const headingTransform = cfg.headingUppercase ? ("uppercase" as const) : ("none" as const);
  const headingLetter = cfg.headingUppercase ? 0.8 : 0;

  return StyleSheet.create({
    page: {
      fontFamily: cfg.bodyFont,
      fontSize: 10,
      color: INK,
      lineHeight: 1.45,
      paddingTop: 0,
      paddingBottom: BODY_PAD_BOTTOM,
      paddingLeft: SIDEBAR_WIDTH + GUTTER,
      paddingRight: BODY_PAD_X,
    },

    /* ---------- header band (page 1) ---------- */
    headerBand: {
      backgroundColor: cfg.primaryColor,
      marginLeft: -(GUTTER),
      marginRight: -BODY_PAD_X,
      paddingHorizontal: BODY_PAD_X,
      paddingTop: 26,
      paddingBottom: 22,
      marginBottom: BODY_PAD_TOP,
      color: "#ffffff",
      flexDirection: "row",
      alignItems: "center",
    },
    headerText: {
      flex: 1,
      paddingRight: 14,
    },
    name: {
      fontFamily: cfg.headingFont,
      fontSize: 26,
      color: "#ffffff",
      letterSpacing: cfg.headingUppercase ? 0.4 : 0,
      textTransform: headingTransform,
      lineHeight: 1.15,
    },
    jobTitle: {
      fontFamily: cfg.bodyFont,
      fontSize: 11.5,
      color: "#ffffff",
      opacity: 0.92,
      marginTop: 6,
    },
    contactLine: {
      fontFamily: cfg.bodyFont,
      fontSize: 9,
      color: "#ffffff",
      opacity: 0.88,
      marginTop: 10,
      lineHeight: 1.55,
    },
    photoCircle: {
      width: 78,
      height: 78,
      borderRadius: 999,
      objectFit: "cover",
      borderWidth: 2,
      borderColor: "#ffffff",
    },
    photoSquare: {
      width: 78,
      height: 78,
      borderRadius: 3,
      objectFit: "cover",
      borderWidth: 2,
      borderColor: "#ffffff",
    },

    /* ---------- two-column body (page 1) ---------- */
    /* Sidebar is page-1-only (fixed). Main column flows naturally
       across pages with a left margin reserved on page 1 only. */
    sidebar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: SIDEBAR_WIDTH,
      backgroundColor: SIDEBAR_BG,
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 24,
    },
    mainColPage1: {
      marginLeft: SIDEBAR_WIDTH + GUTTER,
      paddingTop: BODY_PAD_TOP,
      paddingRight: BODY_PAD_X,
      paddingBottom: BODY_PAD_BOTTOM,
    },
    mainColCont: {
      paddingTop: 10,
      paddingHorizontal: BODY_PAD_X,
      paddingBottom: BODY_PAD_BOTTOM,
    },

    /* ---------- continuation pages ---------- */
    contPage: {
      paddingTop: 50,
      paddingBottom: 44,
      paddingHorizontal: BODY_PAD_X,
    },
    runningHeader: {
      position: "absolute",
      top: 18,
      left: BODY_PAD_X,
      right: BODY_PAD_X,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      borderBottomWidth: 0.6,
      borderBottomColor: HAIRLINE,
      paddingBottom: 6,
    },
    runningHeaderName: {
      fontFamily: cfg.headingFont,
      fontSize: 9.5,
      color: cfg.primaryColor,
      letterSpacing: cfg.headingUppercase ? 0.8 : 0,
      textTransform: headingTransform,
    },
    runningHeaderPage: { fontSize: 8.5, color: MUTED },
    pageFooter: {
      position: "absolute",
      bottom: 16,
      left: BODY_PAD_X,
      right: BODY_PAD_X,
      textAlign: "center",
      color: MUTED,
      fontSize: 7.5,
      letterSpacing: 0.4,
    },

    /* ---------- sections ---------- */
    section: { marginBottom: 14 },
    sectionTitleMain: {
      fontFamily: cfg.headingFont,
      fontSize: 11,
      color: cfg.primaryColor,
      textTransform: headingTransform,
      letterSpacing: headingLetter,
      marginBottom: 6,
      paddingBottom: 4,
      borderBottomWidth: cfg.sectionDividerStyle === "underline" ? 1 : 0,
      borderBottomColor: cfg.primaryColor,
    },
    sectionTitleBar: {
      fontFamily: cfg.headingFont,
      fontSize: 11,
      color: cfg.primaryColor,
      textTransform: headingTransform,
      letterSpacing: headingLetter,
      marginBottom: 6,
      paddingLeft: 8,
      borderLeftWidth: 3,
      borderLeftColor: cfg.primaryColor,
    },
    sidebarSectionTitle: {
      fontFamily: cfg.headingFont,
      fontSize: 9.5,
      color: cfg.primaryColor,
      textTransform: "uppercase",
      letterSpacing: 1.1,
      marginBottom: 6,
      marginTop: 4,
      paddingBottom: 4,
      borderBottomWidth: 0.6,
      borderBottomColor: cfg.primaryColor,
    },

    /* ---------- experience ---------- */
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
    period: { fontSize: 8.5, color: MUTED },
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
    bulletText: { flex: 1, fontSize: 9.8, color: SUBINK, lineHeight: 1.5 },

    /* ---------- summary ---------- */
    summary: { fontSize: 10, color: SUBINK, lineHeight: 1.6 },

    /* ---------- sidebar items ---------- */
    sidePhotoCircle: {
      width: 92,
      height: 92,
      borderRadius: 999,
      objectFit: "cover",
      marginBottom: 14,
      alignSelf: "center",
    },
    sidePhotoSquare: {
      width: 96,
      height: 96,
      borderRadius: 4,
      objectFit: "cover",
      marginBottom: 14,
      alignSelf: "center",
    },
    sideContact: { fontSize: 9, color: SUBINK, marginBottom: 4, lineHeight: 1.5 },
    sideSkillRow: { flexDirection: "row", marginBottom: 3, alignItems: "flex-start" },
    sideSkillDot: { fontSize: 9, color: cfg.primaryColor, width: 9 },
    sideSkillText: { flex: 1, fontSize: 9, color: SUBINK, lineHeight: 1.45 },
    sideLangRow: {
      flexDirection: "row", justifyContent: "space-between",
      marginBottom: 3, fontSize: 9,
    },
    sideLangName: { color: INK, fontFamily: cfg.headingFont, fontSize: 9.2 },
    sideLangLevel: { color: MUTED, fontSize: 8.6 },

    /* ---------- education ---------- */
    eduItem: { marginBottom: 7 },
    eduTitle: { fontFamily: cfg.headingFont, fontSize: 10.5, color: INK },
    eduSub: { fontSize: 9.5, color: cfg.primaryColor },
    eduPeriod: { fontSize: 8.5, color: MUTED },
  });
}

/* ===================== helpers ===================== */
function MainSectionTitle({
  title, cfg, styles,
}: { title: string; cfg: TemplateConfig; styles: ReturnType<typeof makeStyles> }) {
  if (cfg.sectionDividerStyle === "bar") {
    return <Text style={styles.sectionTitleBar}>{title}</Text>;
  }
  return <Text style={styles.sectionTitleMain}>{title}</Text>;
}

function renderRole(exp: CVExperience, styles: ReturnType<typeof makeStyles>) {
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

/* ===================== main component ===================== */
export default function CVPdfDocument({ cv, template, photoDataUrl }: Props) {
  const cfg = getTemplateConfig(template);
  const styles = makeStyles(cfg);
  const hidden = new Set(cv.hiddenSections);

  const contactItems = [
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    cv.contact.linkedinUrl,
  ].filter(Boolean) as string[];

  const experience = cv.experience ?? [];

  const fmtLang = (lvl?: string) =>
    lvl && lvl.trim().length > 0 ? lvl.trim() : "";

  const showPhoto = !!photoDataUrl && cfg.photoStyle !== "none";

  /* ---------- Sidebar (page 1) ---------- */
  const Sidebar = (
    <View style={styles.sidebar}>
      {showPhoto && (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image
          src={photoDataUrl!}
          style={cfg.photoStyle === "circle" ? styles.sidePhotoCircle : styles.sidePhotoSquare}
        />
      )}

      {!hidden.has("contact") && contactItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sidebarSectionTitle}>Contact</Text>
          {contactItems.map((c) => (
            <Text key={c} style={styles.sideContact}>{c}</Text>
          ))}
        </View>
      )}

      {!hidden.has("skills") && cv.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sidebarSectionTitle}>Skills</Text>
          {cv.skills.map((s) => (
            <View key={s} style={styles.sideSkillRow}>
              <Text style={styles.sideSkillDot}>▪</Text>
              <Text style={styles.sideSkillText}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {!hidden.has("languages") && cv.languages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sidebarSectionTitle}>Languages</Text>
          {cv.languages.map((l) => {
            const lvl = fmtLang(l.level);
            return (
              <View key={l.id} style={styles.sideLangRow}>
                <Text style={styles.sideLangName}>{l.name}</Text>
                {lvl ? <Text style={styles.sideLangLevel}>{lvl}</Text> : null}
              </View>
            );
          })}
        </View>
      )}

      {!hidden.has("education") && cv.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sidebarSectionTitle}>Education</Text>
          {cv.education.map((ed) => (
            <View key={ed.id} style={{ marginBottom: 7 }}>
              <Text style={{ fontFamily: cfg.headingFont, fontSize: 9.5, color: INK }}>
                {ed.qualification}
              </Text>
              {ed.institution ? (
                <Text style={{ fontSize: 9, color: cfg.primaryColor, marginTop: 1 }}>
                  {ed.institution}
                </Text>
              ) : null}
              {ed.period ? (
                <Text style={{ fontSize: 8.5, color: MUTED, marginTop: 1 }}>{ed.period}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  /* ---------- Header band ---------- */
  const HeaderBand = !hidden.has("contact") && (
    <View style={styles.headerBand}>
      {cfg.photoPosition === "top-right" ? (
        <>
          <View style={styles.headerText}>
            <Text style={styles.name}>{cv.contact.name || "Your name"}</Text>
            {cv.contact.jobTitle && <Text style={styles.jobTitle}>{cv.contact.jobTitle}</Text>}
            <Text style={styles.contactLine}>{contactItems.join("   ·   ")}</Text>
          </View>
          {showPhoto && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image
              src={photoDataUrl!}
              style={cfg.photoStyle === "circle" ? styles.photoCircle : styles.photoSquare}
            />
          )}
        </>
      ) : (
        <>
          <View style={styles.headerText}>
            <Text style={styles.name}>{cv.contact.name || "Your name"}</Text>
            {cv.contact.jobTitle && <Text style={styles.jobTitle}>{cv.contact.jobTitle}</Text>}
            <Text style={styles.contactLine}>{contactItems.join("   ·   ")}</Text>
          </View>
        </>
      )}
    </View>
  );

  /* ---------- Main column (page 1 + continuation) ---------- */
  const MainContent = (
    <>
      {!hidden.has("summary") && cv.summary && (
        <View style={styles.section}>
          <MainSectionTitle title="Professional Summary" cfg={cfg} styles={styles} />
          <Text style={styles.summary}>{cv.summary}</Text>
        </View>
      )}

      {!hidden.has("experience") && experience.length > 0 && (
        <View style={styles.section} wrap>
          <MainSectionTitle title="Work Experience" cfg={cfg} styles={styles} />
          {experience.map((exp) => renderRole(exp, styles))}
        </View>
      )}
    </>
  );

  return (
    <Document
      author={cv.contact.name || "CV"}
      title={`${cv.contact.name || "CV"} — ${cv.contact.jobTitle || ""}`.trim()}
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Running header — only on page 2+ */}
        <View
          fixed
          render={({ pageNumber }) =>
            pageNumber > 1 ? (
              <View style={styles.runningHeader}>
                <Text style={styles.runningHeaderName}>{cv.contact.name || ""}</Text>
                <Text style={styles.runningHeaderPage}>Page {pageNumber}</Text>
              </View>
            ) : <View />
          }
        />

        {/* Page-1 header band (only on page 1; main column flows from here) */}
        {HeaderBand}

        {/* Sidebar — fixed to page 1 only */}
        <View
          fixed
          render={({ pageNumber }) => (pageNumber === 1 ? Sidebar : <View />)}
        />

        {/* Main column — page 1 leaves room for sidebar, continuation pages full width */}
        <View
          render={({ pageNumber }) => (
            <View style={pageNumber === 1 ? styles.mainColPage1 : styles.mainColCont}>
              {MainContent}
            </View>
          )}
        />


        {/* Footer page number on every page */}
        <Text
          fixed
          style={styles.pageFooter}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `${pageNumber} / ${totalPages}` : ""
          }
        />
      </Page>
    </Document>
  );
}
