## Changes to Business page

### 1. Update third hero stat
In `src/data/business.ts`, replace the third entry in `HERO_STATS`:
- From: `{ value: "11", label: "MENAT markets served" }` (currently the third stat)
- To: `{ value: "40+", label: "founder hours spent on HR every month" }`

Note: the third stat in the data is currently "MENAT markets served", not the Emiratisation fine. I'll replace the third stat as requested.

### 2. Add "The Real Cost" strip
Create `src/components/business/BusinessRealCost.tsx` — a new section component:
- Eyebrow label: "THE REAL COST" (terracotta, uppercase, small)
- Headline: "One of these covers all the others." (serif, large)
- 4 cards in a grid: `grid-cols-2 lg:grid-cols-4`
- Each card uses dark surface styling (ink background, cream/paper text) consistent with `BookCallBanner` and other dark sections
- Cards:
  1. "AED 130k+" / "Average cost of one bad hire"
  2. "AED 80k+" / "Average MoHRE labour claim cost"
  3. "AED 200k+" / "Two-year Emiratisation gap exposure"
  4. "AED 90k" / "One full year of Growth Retainer"
- Muted footer line: "One engagement protects you from all three. Most clients recover the full annual fee in the first avoided incident."

Insert into `src/pages/Business.tsx` between `<BusinessServices />` and `<BusinessRetainers />`.

### Tokens used
Existing semantic tokens only: `bg-ink`, `text-cream`, `text-terracotta`, `font-serif`, `font-dm`, `text-ink/60` for muted line. No new colors.
