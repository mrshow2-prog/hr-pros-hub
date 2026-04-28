Five small fixes across data, components, and the Career footer.

## 1. H1 duplication on Career page

`src/components/career/WebCvShowcase.tsx` renders three sample CV templates inside the Career page, each starting with an `<h1>` for "Sarah Mahmoud". The Career hero is the legitimate single H1.

- Change all three `<h1>` tags in `WebCvShowcase.tsx` (lines 38, 109, 240) to `<h2>` — keep classes/styling identical so visual output is unchanged.
- Verify Career hero `<h1>` (line 391) remains the only H1 on the page.

## 2. Copyright year — make dynamic

Only one `© 2025` exists in the codebase (Career footer, line 419 in `src/pages/Career.tsx`). Replace the static string with:

```
© {new Date().getFullYear()} People Studio — Bishoy Mesiha Advisory. Dubai, UAE.
```

(Index and Tools footers don't carry a year — leave them untouched.)

## 3. Growing SMEs — annual, not quarterly

`src/data/business.ts` line 54 — replace "quarterly quota enforcement" with "annual quota enforcement".

## 4. Multi-Entity Owners — better examples

`src/data/business.ts` line 60 — replace "barber shop, restaurant, travel agency, and supermarket" with "restaurant group, retail chain, property and hospitality portfolio".

## 5. Remove Referral Partners audience card

`src/data/business.ts` lines 68–73 — delete the Referral Partners object from `AUDIENCE_SEGMENTS`. No other places consume this entry, so removal is safe and the section's grid will reflow naturally.

## Files

- Edited: `src/components/career/WebCvShowcase.tsx`
- Edited: `src/pages/Career.tsx`
- Edited: `src/data/business.ts`
