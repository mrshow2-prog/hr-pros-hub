import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { getTemplateConfig } from "@/lib/cvTemplateConfig";
import {
  INK, SUBINK, MUTED, HAIRLINE,
  PdfProps, PhotoImg, RunningHeaderAndFooter,
  isHidden, periodOf, visibleBullets,
} from "./shared";

/* ===== Compact: matches preview screenshot
 * - Header: name + title (left) + contact info (right)
 * - Body: two columns (left ~1.6fr Summary + Experience + Education,
 *   right ~1fr Skills + Languages)
 * - Right (skills/languages) is rendered as a 'fixed' absolutely-positioned
 *   panel that only appears on page 1, so pages 2+ don't show an empty column.
 * - The left flowing content reserves the right-column width via paddingRight
 *   so its line lengths stay consistent across pages.
 * ============================================================== */

const COL_GAP = 22;
const SIDE_WIDTH = 175;
const PAGE_PAD_X = 40;
const PAGE_PAD_TOP = 44;
const HEADER_HEIGHT_APPROX = 92; // name+title+contact header

export default function PdfCompact({ cv, photoDataUrl }: PdfProps) {
  const cfg = getTemplateConfig("compact");
  const s = StyleSheet.create({
    page: {
      fontFamily: cfg.bodyFont, fontSize: 10, color: INK, lineHeight: 1.5,
      paddingTop: PAGE_PAD_TOP, paddingBottom: 48,
      paddingLeft: PAGE_PAD_X, paddingRight: PAGE_PAD_X,
    },

    /* ---- header ---- */
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 18,
      paddingBottom: 12,
      borderBottomWidth: 1.4,
      borderBottomColor: INK,
      gap: 16,
    },
    headerLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
    name: { fontFamily: cfg.headingFont, fontSize: 24, color: INK, lineHeight: 1.1 },
    jobTitle: { fontSize: 12, color: cfg.primaryColor, marginTop: 4 },
    contactBlock: { alignItems: "flex-end", maxWidth: 200 },
    contactRow: { fontSize: 8.8, color: MUTED, lineHeight: 1.55, textAlign: "right" },

    /* ---- main / sidebar columns ----
     * Reserve sidebar column width with paddingRight so the main content
     * column has a stable width even after the sidebar disappears.
     */
    mainWrap: { paddingRight: SIDE_WIDTH + COL_GAP },

    sidebar: {
      position: "absolute",
      top: PAGE_PAD_TOP + HEADER_HEIGHT_APPROX,
      right: PAGE_PAD_X,
      width: SIDE_WIDTH,
    },
    sideSectionTitle: {
      fontFamily: cfg.headingFont, fontSize: 11, color: INK,
      textTransform: "uppercase", letterSpacing: 0.9,
      marginBottom: 6, paddingBottom: 3,
      borderBottomWidth: 0.8, borderBottomColor: cfg.primaryColor,
    },
    sideSection: { marginBottom: 14 },
    sideRow: { flexDirection: "row", marginBottom: 3 },
    sideDot: { width: 9, fontSize: 9.5, color: cfg.primaryColor },
    sideText: { flex: 1, fontSize: 9.4, color: SUBINK, lineHeight: 1.45 },
    sideLangName: { fontFamily: cfg.headingFont, fontSize: 9.4, color: INK },
    sideLangLevel: { fontSize: 8.8, color: MUTED },

    /* ---- main ---- */
    section: { marginBottom: 14 },
    sTitle: {
      fontFamily: cfg.headingFont, fontSize: 11.5, color: INK,
      textTransform: "uppercase", letterSpacing: 0.9,
      marginBottom: 7, paddingBottom: 3,
      borderBottomWidth: 0.8, borderBottomColor: cfg.primaryColor,
    },
    summary: { fontSize: 10, color: SUBINK, lineHeight: 1.6 },
    expItem: { marginBottom: 10 },
    expRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    role: { fontFamily: cfg.headingFont, fontSize: 11, color: INK },
    company: { fontSize: 10, color: cfg.primaryColor, marginBottom: 3 },
    period: { fontSize: 8.8, color: MUTED },
    bullet: { flexDirection: "row", marginBottom: 2 },
    glyph: { width: 10, fontSize: 10, color: cfg.primaryColor },
    bText: { flex: 1, fontSize: 9.7, color: SUBINK, lineHeight: 1.55 },
    eduItem: { marginBottom: 6 },
    eduRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  });

  const showPhoto = !!photoDataUrl && cfg.photoStyle !== "none";

  const Sidebar = (
    <View>
      {!isHidden(cv, "skills") && cv.skills.length > 0 && (
        <View style={s.sideSection}>
          <Text style={s.sideSectionTitle}>Skills</Text>
          {cv.skills.map((sk) => (
            <View key={sk} style={s.sideRow}>
              <Text style={s.sideDot}>•</Text>
              <Text style={s.sideText}>{sk}</Text>
            </View>
          ))}
        </View>
      )}

      {!isHidden(cv, "languages") && cv.languages.length > 0 && (
        <View style={s.sideSection}>
          <Text style={s.sideSectionTitle}>Languages</Text>
          {cv.languages.map((l) => (
            <View key={l.id} style={{ marginBottom: 3 }}>
              <Text style={s.sideLangName}>{l.name}</Text>
              {l.level?.trim() && <Text style={s.sideLangLevel}>{l.level.trim()}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Document author={cv.contact.name || "CV"}>
      <Page size="A4" style={s.page} wrap>
        <RunningHeaderAndFooter cv={cv} cfg={cfg} />

        {/* Page-1-only sidebar (skills + languages on the right) */}
        <View
          fixed
          style={s.sidebar}
          render={({ pageNumber }) => (pageNumber === 1 ? Sidebar : null)}
        />

        {/* Header */}
        {!isHidden(cv, "contact") && (
          <View style={s.header} wrap={false}>
            <View style={s.headerLeft}>
              {showPhoto && <PhotoImg url={photoDataUrl!} size={72} shape="square" />}
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{cv.contact.name || "Your name"}</Text>
                {cv.contact.jobTitle && <Text style={s.jobTitle}>{cv.contact.jobTitle}</Text>}
              </View>
            </View>
            <View style={s.contactBlock}>
              {cv.contact.location && <Text style={s.contactRow}>{cv.contact.location}</Text>}
              {cv.contact.phone && <Text style={s.contactRow}>{cv.contact.phone}</Text>}
              {cv.contact.email && <Text style={s.contactRow}>{cv.contact.email}</Text>}
              {cv.contact.linkedinUrl && <Text style={s.contactRow}>{cv.contact.linkedinUrl}</Text>}
            </View>
          </View>
        )}

        {/* Main column: reserve right-side sidebar width across all pages
            so wrapping stays consistent. Pages 2+ have empty white margin on
            the right — not an empty visible column. */}
        <View style={s.mainWrap}>
          {!isHidden(cv, "summary") && cv.summary && (
            <View style={s.section} wrap={false}>
              <Text style={s.sTitle}>Summary</Text>
              <Text style={s.summary}>{cv.summary}</Text>
            </View>
          )}

          {!isHidden(cv, "experience") && cv.experience.length > 0 && (
            <View style={s.section}>
              <Text style={s.sTitle}>Work Experience</Text>
              {cv.experience.map((exp) => (
                <View key={exp.id} style={s.expItem} wrap minPresenceAhead={40}>
                  <View style={s.expRow}>
                    <Text style={s.role}>{exp.role || ""}</Text>
                    {periodOf(exp) && <Text style={s.period}>{periodOf(exp)}</Text>}
                  </View>
                  {(exp.company || exp.location) && (
                    <Text style={s.company}>{[exp.company, exp.location].filter(Boolean).join(" · ")}</Text>
                  )}
                  {visibleBullets(exp).map((b) => (
                    <View key={b.id} style={s.bullet} wrap={false}>
                      <Text style={s.glyph}>•</Text>
                      <Text style={s.bText}>{b.rewrite || b.original}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {!isHidden(cv, "education") && cv.education.length > 0 && (
            <View style={s.section} wrap>
              <Text style={s.sTitle}>Education</Text>
              {cv.education.map((ed) => (
                <View key={ed.id} style={s.eduItem} wrap={false}>
                  <View style={s.eduRow}>
                    <Text style={{ fontFamily: cfg.headingFont, fontSize: 10.5, color: INK }}>{ed.qualification}</Text>
                    {ed.period && <Text style={s.period}>{ed.period}</Text>}
                  </View>
                  {ed.institution && <Text style={{ fontSize: 10, color: cfg.primaryColor }}>{ed.institution}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
