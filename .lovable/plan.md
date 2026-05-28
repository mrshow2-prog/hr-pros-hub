## Goal

Make the Skills-First template feel more "skills-focused" by adding visual emphasis to the Core Competencies section, and add subtle separators between all top-level sections so the page reads as a structured document.

Scope: `src/components/cv-builder/templates/TemplateSkillsFirst.tsx` only. No PDF export, no other templates, no data/logic changes.

## Changes

### 1. Bullet icons for Core Competencies

Currently each competency cluster renders as a plain line: `Title: item, item, item`.

Replace with a small visual treatment:
- Each cluster gets a leading accent icon (lucide `Sparkles` or `Target` — accent-colored, ~14px) followed by the cluster title in semibold ink.
- Items render as accent-tinted pills (same style currently used for Skills) on the following line, so the cluster reads as a labeled group rather than a comma list.
- Increase the section's vertical rhythm slightly so it feels like the visual anchor of the template.

This keeps the existing `competencyClusters` data shape untouched.

### 2. Section separators

Add a thin horizontal divider between every visible top-level section (Summary, Skills, Experience, Education, Competencies, Languages, Achievements, Certifications, Custom).

- Use the same hairline style already used between Experience entries (`divide-y divide-clay`), but a touch darker — `border-ink/20` — so it reads clearly without competing with content.
- Implemented by wrapping each rendered section in a container and applying a top border to every section after the first, rather than editing every individual section block.
- The header already has its own bottom border; the first section after it should not double-up.

## Technical notes

- File touched: `src/components/cv-builder/templates/TemplateSkillsFirst.tsx`.
- Pills reuse the existing inline style (`color-mix` with `--accent`) so the active palette continues to drive the color.
- No changes to `CVRenderer`, shared helpers, section visibility, or PDF export — the user explicitly said the Skills template; PDF/other templates are out of scope.
