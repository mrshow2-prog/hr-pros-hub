import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { getTemplateConfig, type TemplateConfig } from "@/lib/cvTemplateConfig";
import type { TemplateId } from "@/contexts/CVBuilderContext";

interface Props {
  cv: GeneratedCV;
  template: TemplateId;
  photoDataUrl: string | null;
}

const PAGE_PADDING = 36;
const SIDEBAR_WIDTH = 170;

function makeStyles(cfg: TemplateConfig) {
  const heading = (size: number) => ({
    fontFamily: cfg.headingFont,
    fontSize: size,
    color: cfg.primaryColor,
    textTransform: cfg.headingUppercase ? ("uppercase" as const) : ("none" as const),
    letterSpacing: cfg.headingUppercase ? 1 : 0,
  });
  return StyleSheet.create({
    page: {
      paddingTop: PAGE_PADDING,
      paddingBottom: PAGE_PADDING + 20,
      paddingHorizontal: PAGE_PADDING,
      fontFamily: cfg.bodyFont,
      fontSize: 10,
      color: "#1f2937",
      lineHeight: 1.45,
    },
    headerRow: {
      flexDirection: cfg.photoPosition === "top-right" ? "row-reverse" : "row",
      alignItems: "center",
      marginBottom: 14,
    },
    photo: {
      width: 80,
      height: 80,
      objectFit: "cover",
      borderRadius: cfg.photoStyle === "circle" ? 999 : 4,
      marginRight: cfg.photoPosition === "top-right" ? 0 : 14,
      marginLeft: cfg.photoPosition === "top-right" ? 14 : 0,
    },
    name: { ...heading(22), marginBottom: 2 },
    jobTitle: { fontSize: 12, color: cfg.primaryColor, marginBottom: 4 },
    contactLine: { fontSize: 9, color: "#4b5563" },
    body: { flexDirection: "row", gap: 16 },
    sidebar: { width: SIDEBAR_WIDTH },
    main: { flex: 1 },
    section: { marginBottom: 12 },
    sectionTitle: { ...heading(11), marginBottom: 6 },
    sectionUnderline: {
      borderBottomWidth: 1,
      borderBottomColor: cfg.primaryColor,
      paddingBottom: 3,
      marginBottom: 6,
    },
    sectionBar: {
      borderLeftWidth: 3,
      borderLeftColor: cfg.primaryColor,
      paddingLeft: 6,
      marginBottom: 6,
    },
    role: { fontFamily: cfg.headingFont, fontSize: 11, color: "#111827" },
    company: { fontSize: 10, color: cfg.primaryColor, marginBottom: 3 },
    period: { fontSize: 9, color: "#6b7280" },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    bullet: { flexDirection: "row", marginBottom: 2 },
    bulletDot: { width: 8, fontSize: 10, color: cfg.primaryColor },
    bulletText: { flex: 1, fontSize: 10 },
    expItem: { marginBottom: 10 },
    skillItem: { fontSize: 9.5, marginBottom: 3 },
    runningHeader: {
      position: "absolute",
      top: 18,
      left: PAGE_PADDING,
      right: PAGE_PADDING,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 9,
      color: "#9ca3af",
      borderBottomWidth: 0.5,
      borderBottomColor: "#e5e7eb",
      paddingBottom: 4,
    },
  });
}

function SectionHeader({
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

export default function CVPdfDocument({ cv, template, photoDataUrl }: Props) {
  const cfg = getTemplateConfig(template);
  const styles = makeStyles(cfg);
  const hidden = new Set(cv.hiddenSections);

  const contactItems = [
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    cv.contact.linkedinUrl,
  ].filter(Boolean);

  const experience = cv.experience ?? [];
  const firstPageRoles = experience.slice(0, 2);
  const restRoles = experience.slice(2);

  const renderRole = (exp: typeof experience[number]) => (
    <View key={exp.id} style={styles.expItem} wrap={false}>
      <View style={styles.rowBetween}>
        <Text style={styles.role}>{exp.role}</Text>
        <Text style={styles.period}>
          {[exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period || ""}
        </Text>
      </View>
      <Text style={styles.company}>
        {[exp.company, exp.location].filter(Boolean).join(" · ")}
      </Text>
      {exp.bullets
        .filter((b) => b.status !== "reverted" && (b.rewrite || b.original))
        .map((b) => (
          <View key={b.id} style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{b.rewrite || b.original}</Text>
          </View>
        ))}
    </View>
  );

  const SkillsBlock = () =>
    !hidden.has("skills") && cv.skills.length > 0 ? (
      <View style={styles.section}>
        <SectionHeader title="Skills" cfg={cfg} styles={styles} />
        {cv.skills.map((s) => (
          <Text key={s} style={styles.skillItem}>
            • {s}
          </Text>
        ))}
      </View>
    ) : null;

  const LanguagesBlock = () =>
    !hidden.has("languages") && cv.languages.length > 0 ? (
      <View style={styles.section}>
        <SectionHeader title="Languages" cfg={cfg} styles={styles} />
        {cv.languages.map((l) => (
          <Text key={l.id} style={styles.skillItem}>
            {l.name} <Text style={{ color: "#6b7280" }}>({l.level})</Text>
          </Text>
        ))}
      </View>
    ) : null;

  const ContactBlock = () => (
    <View style={styles.section}>
      <SectionHeader title="Contact" cfg={cfg} styles={styles} />
      {contactItems.map((c) => (
        <Text key={c} style={styles.skillItem}>
          {c}
        </Text>
      ))}
    </View>
  );

  const useSidebar = cfg.layoutStyle === "sidebar";

  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        {!hidden.has("contact") && (
          <View style={styles.headerRow}>
            {photoDataUrl && cfg.photoStyle !== "none" && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={photoDataUrl} style={styles.photo} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{cv.contact.name || "Your name"}</Text>
              {cv.contact.jobTitle && (
                <Text style={styles.jobTitle}>{cv.contact.jobTitle}</Text>
              )}
              {!useSidebar && (
                <Text style={styles.contactLine}>{contactItems.join("  ·  ")}</Text>
              )}
            </View>
          </View>
        )}

        {useSidebar ? (
          <View style={styles.body}>
            <View style={styles.sidebar}>
              <ContactBlock />
              <SkillsBlock />
              <LanguagesBlock />
            </View>
            <View style={styles.main}>
              {!hidden.has("summary") && cv.summary && (
                <View style={styles.section}>
                  <SectionHeader title="Professional Summary" cfg={cfg} styles={styles} />
                  <Text>{cv.summary}</Text>
                </View>
              )}
              {!hidden.has("experience") && firstPageRoles.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Experience" cfg={cfg} styles={styles} />
                  {firstPageRoles.map(renderRole)}
                </View>
              )}
            </View>
          </View>
        ) : (
          <View>
            {!hidden.has("summary") && cv.summary && (
              <View style={styles.section}>
                <SectionHeader title="Professional Summary" cfg={cfg} styles={styles} />
                <Text>{cv.summary}</Text>
              </View>
            )}
            {!hidden.has("experience") && firstPageRoles.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Experience" cfg={cfg} styles={styles} />
                {firstPageRoles.map(renderRole)}
              </View>
            )}
          </View>
        )}
      </Page>

      {/* Page 2+ : single-column overflow */}
      {(restRoles.length > 0 ||
        (!hidden.has("education") && cv.education.length > 0) ||
        (!useSidebar ? false : false)) && (
        <Page size="A4" style={styles.page}>
          <View
            style={styles.runningHeader}
            fixed
            render={({ pageNumber }) => (
              <>
                <Text>{cv.contact.name}</Text>
                <Text>Page {pageNumber}</Text>
              </>
            )}
          />
          <View style={{ marginTop: 18 }}>
            {restRoles.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Experience (continued)" cfg={cfg} styles={styles} />
                {restRoles.map(renderRole)}
              </View>
            )}
            {!hidden.has("education") && cv.education.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Education" cfg={cfg} styles={styles} />
                {cv.education.map((ed) => (
                  <View key={ed.id} style={styles.expItem} wrap={false}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.role}>{ed.qualification}</Text>
                      <Text style={styles.period}>{ed.period}</Text>
                    </View>
                    <Text style={styles.company}>{ed.institution}</Text>
                  </View>
                ))}
              </View>
            )}
            {/* If single-column layout, append skills/languages at the end */}
            {!useSidebar && (
              <>
                <SkillsBlock />
                <LanguagesBlock />
              </>
            )}
          </View>
        </Page>
      )}
    </Document>
  );
}
