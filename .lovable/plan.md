I’ll adjust only the Bold/Riyadh PDF template sidebar layout.

Plan:
1. Reduce the Bold sidebar’s internal right padding while keeping the left padding stable, so all sidebar sections get a wider text column.
2. Replace the current symmetric `PADX * 2` width calculations with explicit left/right padding constants for headings, divider lines, skills, education, languages, certifications, and contact rows.
3. For contact rows, increase the text width after the icon and make the email/LinkedIn height calculation match the rendered width so wrapped lines no longer overlap the next row.
4. Keep the main CV body positioning unchanged so this only affects the left sidebar of the Bold template.
5. Validate by checking the changed layout code and, if possible, preview/export the PDF to confirm long email and LinkedIn text wraps cleanly.