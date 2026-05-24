import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { getTemplateConfig } from "@/lib/cvTemplateConfig";
import {
  INK, SUBINK, MUTED,
  PdfProps, PhotoImg, RunningHeaderAndFooter,
  isHidden, periodOf, visibleBullets,
} from "./shared";

/* ===== Compact PDF — mirrors compact DOCX layout =====
 * Header: name+title (left) + contact stack (right), divider underneath.
 * Body row (page 1 starts in two real inline columns):
 *   LEFT  ≈ 62% : Summary (and later Experience starts here)
 *   RIGHT ≈ 38% : Skills + Languages
 * Then Experience overflow + Education flow full-width.
 * ===================================================== */

const SIDE_RATIO_LEFT = 0.62;

export default function PdfCompact({ cv, photoDataUrl }: PdfProps) {
  const cfg = getTemplateConfig("compact");
  const s = StyleSheet.create({
    page: {
      fontFamily: cfg.bodyFont, fontSize: 10, color: INK, lineHeight: 1.5,
      paddingTop: 44, paddingBottom: 48, paddingLeft: 40, paddingRight: 40,
    },

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
    contactBlock: { alignItems: "flex-end", maxWidth: 210 },
    contactRow: { fontSize: 8.8, color: MUTED, lineHeight: 1.55, textAlign: "right" },

    /* Two-column inline row (no fixed, no absolute) */
    twoCol: { flexDirection: "row", marginBottom: 14, gap: 22 },
    colLeft: { width: `${SIDE_RATIO_LEFT * 100}%` },
    colRight: { flex: 1 },

    section: { marginBottom: 14 },
    sTitle: {
      fontFamily: cfg.headingFont, fontSize: 11.5, color: INK,
      textTransform: "uppercase", letterSpacing: 0.9,
      marginBottom: 7, paddingBottom: 3,
      borderBottomWidth: 0.8, borderBottomColor: cfg.primaryColor,
    },
    sTitleSm: {
      fontFamily: cfg.headingFont, fontSize: 11, color: INK,
      textTransform: "uppercase", letterSpacing: 0.9,
      marginBottom: 6, paddingBottom: 3,
      borderBottomWidth: 0.8, borderBottomColor: cfg.primaryColor,
    },
    summary: { fontSize: 10, color: SUBINK, lineHeight: 1.6 },

    /* sidebar (right column) */
    sideRow: { flexDirection: "row", marginBottom: 3 },
    sideDot: { width: 9, fontSize: 9.5, color: cfg.primaryColor },
    sideText: { flex: 1, fontSize: 9.4, color: SUBINK, lineHeight: 1.45 },
    langItem: { marginBottom: 4 },
    langName: { fontFamily: cfg.headingFont, fontSize: 9.6, color: INK },
    langLevel: { fontSize: 8.8, color: MUTED },

    /* experience / education (full-width) */
    expItem: { marginBottom: 11 },
    expRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    role: { fontFamily: cfg.headingFont, fontSize: 11, color: INK },
    company: { fontSize: 10, color: cfg.primaryColor, marginBottom: 3 },
    period: { fontSize: 8.8, color: MUTED },
    bullet: { flexDirection: "row", marginBottom: 2.5, paddingRight: 4 },
    glyph: { width: 10, fontSize: 10, color: cfg.primaryColor },
    bText: { flex: 1, fontSize: 9.7, color: SUBINK, lineHeight: 1.55 },
    eduItem: { marginBottom: 6 },
    eduRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    eduTitle: { fontFamily: cfg.headingFont, fontSize: 10.5, color: INK },
    eduInst: { fontSize: 10, color: cfg.primaryColor },
  });

  const showPhoto = !!photoDataUrl && cfg.photoStyle !== "none";

  return (
    <Document author={cv.contact.name || "CV"}>
      <Page size="A4" style={s.page} wrap>
        <RunningHeaderAndFooter cv={cv} cfg={cfg} />

        {/* ----- HEADER ----- */}
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

        {/* ----- TWO-COLUMN ROW (Summary | Skills + Languages) -----
            Rendered inline so the right column actually contains its
            children. wrap={false} keeps the block on one page; if it
            doesn't fit it moves whole — Experience below handles overflow. */}
        <View style={s.twoCol} wrap={false}>
          <View style={s.colLeft}>
            {!isHidden(cv, "summary") && cv.summary && (
              <View style={s.section}>
                <Text style={s.sTitle}>Summary</Text>
                <Text style={s.summary}>{cv.summary}</Text>
              </View>
            )}
          </View>

          <View style={s.colRight}>
            {!isHidden(cv, "skills") && cv.skills.length > 0 && (
              <View style={s.section}>
                <Text style={s.sTitleSm}>Skills</Text>
                {cv.skills.map((sk) => (
                  <View key={sk} style={s.sideRow} wrap={false}>
                    <Text style={s.sideDot}>•</Text>
                    <Text style={s.sideText}>{sk}</Text>
                  </View>
                ))}
              </View>
            )}

            {!isHidden(cv, "languages") && cv.languages.length > 0 && (
              <View style={s.section}>
                <Text style={s.sTitleSm}>Languages</Text>
                {cv.languages.map((l) => (
                  <View key={l.id} style={s.langItem} wrap={false}>
                    <Text style={s.langName}>{l.name}</Text>
                    {l.level?.trim() && <Text style={s.langLevel}>{l.level.trim()}</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ----- FULL-WIDTH: Work Experience ----- */}
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
                  <Text style={s.company}>
                    {[exp.company, exp.location].filter(Boolean).join(" · ")}
                  </Text>
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

        {/* ----- FULL-WIDTH: Education ----- */}
        {!isHidden(cv, "education") && cv.education.length > 0 && (
          <View style={s.section} wrap>
            <Text style={s.sTitle}>Education</Text>
            {cv.education.map((ed) => (
              <View key={ed.id} style={s.eduItem} wrap={false}>
                <View style={s.eduRow}>
                  <Text style={s.eduTitle}>{ed.qualification}</Text>
                  {ed.period && <Text style={s.period}>{ed.period}</Text>}
                </View>
                {ed.institution && <Text style={s.eduInst}>{ed.institution}</Text>}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
