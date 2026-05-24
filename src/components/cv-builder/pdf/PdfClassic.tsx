import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { getTemplateConfig } from "@/lib/cvTemplateConfig";
import {
  INK, SUBINK, MUTED,
  PdfProps, PhotoImg, RunningHeaderAndFooter,
  contactItems, isHidden, periodOf, visibleBullets,
} from "./shared";

export default function PdfClassic({ cv, photoDataUrl }: PdfProps) {
  const cfg = getTemplateConfig("classic");
  const s = StyleSheet.create({
    page: {
      fontFamily: cfg.bodyFont, fontSize: 10, color: INK, lineHeight: 1.5,
      paddingTop: 44, paddingBottom: 48, paddingHorizontal: 48,
    },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 18, paddingBottom: 14, borderBottomWidth: 1.4, borderBottomColor: INK, gap: 18 },
    name: { fontFamily: cfg.headingFont, fontSize: 28, color: INK },
    jobTitle: { fontSize: 12, color: cfg.primaryColor, marginTop: 4 },
    contactLine: { fontSize: 9, color: MUTED, marginTop: 8 },
    section: { marginBottom: 13 },
    sTitle: {
      fontFamily: cfg.headingFont, fontSize: 11.5, color: INK,
      textTransform: "uppercase", letterSpacing: 0.8,
      marginBottom: 6, paddingBottom: 4,
      borderBottomWidth: 0.8, borderBottomColor: "#9ca3af",
    },
    summary: { fontSize: 10, color: SUBINK, lineHeight: 1.6 },
    expItem: { marginBottom: 10 },
    expRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    role: { fontFamily: cfg.headingFont, fontSize: 11.5, color: INK },
    company: { fontSize: 10, color: cfg.primaryColor, marginBottom: 3 },
    period: { fontSize: 8.8, color: MUTED },
    bullet: { flexDirection: "row", marginBottom: 2 },
    glyph: { width: 10, fontSize: 10, color: cfg.primaryColor },
    bText: { flex: 1, fontSize: 9.8, color: SUBINK, lineHeight: 1.55 },
    skillsGrid: { flexDirection: "row", flexWrap: "wrap" },
    skillCell: { width: "50%", flexDirection: "row", marginBottom: 3, paddingRight: 8 },
    eduItem: { marginBottom: 6 },
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
            {showPhoto && <PhotoImg url={photoDataUrl!} size={80} shape="circle" />}
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{cv.contact.name || "Your name"}</Text>
              {cv.contact.jobTitle && <Text style={s.jobTitle}>{cv.contact.jobTitle}</Text>}
              {contacts.length > 0 && <Text style={s.contactLine}>{contacts.join("   ·   ")}</Text>}
            </View>
          </View>
        )}

        {!isHidden(cv, "summary") && cv.summary && (
          <View style={s.section} wrap={false}>
            <Text style={s.sTitle}>Professional Summary</Text>
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

        {!isHidden(cv, "skills") && cv.skills.length > 0 && (
          <View style={s.section} wrap>
            <Text style={s.sTitle}>Skills & Competencies</Text>
            <View style={s.skillsGrid}>
              {cv.skills.map((sk) => (
                <View key={sk} style={s.skillCell} wrap={false}>
                  <Text style={s.glyph}>•</Text>
                  <Text style={s.bText}>{sk}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {!isHidden(cv, "languages") && cv.languages.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.sTitle}>Languages</Text>
            <Text style={s.summary}>
              {cv.languages.map((l) => (l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name)).join(" · ")}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
