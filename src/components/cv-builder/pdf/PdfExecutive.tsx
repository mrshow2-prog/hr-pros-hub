import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { getTemplateConfig } from "@/lib/cvTemplateConfig";
import {
  INK, SUBINK, MUTED,
  PdfProps, PhotoImg, RunningHeaderAndFooter,
  contactItems, isHidden, periodOf, visibleBullets,
} from "./shared";

export default function PdfExecutive({ cv, photoDataUrl }: PdfProps) {
  const cfg = getTemplateConfig("executive");
  const s = StyleSheet.create({
    page: {
      fontFamily: cfg.bodyFont, fontSize: 10.5, color: INK, lineHeight: 1.55,
      paddingTop: 50, paddingBottom: 50, paddingHorizontal: 56,
    },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 26, gap: 22 },
    headerText: { flex: 1 },
    name: { fontFamily: cfg.headingFont, fontSize: 32, color: INK, letterSpacing: -0.4 },
    jobTitle: { fontSize: 13, color: cfg.primaryColor, marginTop: 4 },
    contactLine: { fontSize: 9, color: MUTED, marginTop: 10 },
    section: { marginBottom: 16 },
    sTitle: {
      fontFamily: cfg.headingFont, fontSize: 13, color: INK,
      textTransform: "uppercase", letterSpacing: 1.2,
      marginBottom: 8, paddingBottom: 4,
      borderBottomWidth: 1, borderBottomColor: cfg.primaryColor,
    },
    summaryQuote: {
      fontSize: 10.5, color: SUBINK, lineHeight: 1.7, paddingLeft: 12,
      borderLeftWidth: 2, borderLeftColor: cfg.primaryColor,
    },
    expItem: { marginBottom: 13 },
    expRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    role: { fontFamily: cfg.headingFont, fontSize: 12, color: INK },
    company: { fontSize: 10.5, color: cfg.primaryColor, marginBottom: 4 },
    period: { fontSize: 9, color: MUTED },
    bullet: { flexDirection: "row", marginBottom: 3 },
    glyph: { width: 12, fontSize: 10, color: cfg.primaryColor },
    bText: { flex: 1, fontSize: 10, color: SUBINK, lineHeight: 1.6 },
    skillsGrid: { flexDirection: "row", flexWrap: "wrap" },
    skillCell: { width: "50%", fontSize: 10, color: SUBINK, marginBottom: 4, paddingRight: 8 },
    eduItem: { marginBottom: 8 },
    eduRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  });

  const contacts = contactItems(cv);
  const showPhoto = !!photoDataUrl && cfg.photoStyle !== "none";

  return (
    <Document author={cv.contact.name || "CV"}>
      <Page size="A4" style={s.page} wrap>
        <RunningHeaderAndFooter cv={cv} cfg={cfg} />

        {!isHidden(cv, "contact") && (
          <View style={s.header} wrap={false}>
            {cfg.photoPosition === "top-left" && showPhoto && (
              <PhotoImg url={photoDataUrl!} size={90} shape="circle" />
            )}
            <View style={s.headerText}>
              <Text style={s.name}>{cv.contact.name || "Your name"}</Text>
              {cv.contact.jobTitle && <Text style={s.jobTitle}>{cv.contact.jobTitle}</Text>}
              {contacts.length > 0 && <Text style={s.contactLine}>{contacts.join("   ·   ")}</Text>}
            </View>
            {cfg.photoPosition === "top-right" && showPhoto && (
              <PhotoImg url={photoDataUrl!} size={90} shape="circle" />
            )}
          </View>
        )}

        {!isHidden(cv, "summary") && cv.summary && (
          <View style={s.section} wrap={false}>
            <Text style={s.sTitle}>Executive Summary</Text>
            <Text style={s.summaryQuote}>{cv.summary}</Text>
          </View>
        )}

        {!isHidden(cv, "experience") && cv.experience.length > 0 && (
          <View style={s.section}>
            <Text style={s.sTitle}>Professional Experience</Text>
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
                    <Text style={s.glyph}>▸</Text>
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
                  <Text style={{ fontFamily: cfg.headingFont, fontSize: 11, color: INK }}>{ed.qualification}</Text>
                  {ed.period && <Text style={s.period}>{ed.period}</Text>}
                </View>
                {ed.institution && <Text style={{ fontSize: 10.5, color: cfg.primaryColor }}>{ed.institution}</Text>}
              </View>
            ))}
          </View>
        )}

        {!isHidden(cv, "skills") && cv.skills.length > 0 && (
          <View style={s.section} wrap>
            <Text style={s.sTitle}>Core Competencies</Text>
            <View style={s.skillsGrid}>
              {cv.skills.map((sk) => (
                <Text key={sk} style={s.skillCell} wrap={false}>{sk}</Text>
              ))}
            </View>
          </View>
        )}

        {!isHidden(cv, "languages") && cv.languages.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.sTitle}>Languages</Text>
            <Text style={{ fontSize: 10.5, color: SUBINK }}>
              {cv.languages.map((l) => (l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name)).join("   ·   ")}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
