The previews look "cropped from the top" because `ScaledPreview` renders the scaled CV page flush against the top edge of the cropped frame — there's zero whitespace above the header, so the photo and name kiss the border.

### Fix

In `src/components/cv-builder/templates/shared.tsx`, update `ScaledPreview` so the scaled content sits a few pixels below the top edge instead of flush against it:

- Add a small top inset (e.g. `paddingTop: 12px`) to the inner scaled wrapper, and increase the crop `cropHeight` by the same amount so the visible content area stays the same.
- Keep the horizontal centering and overflow clipping as-is.

This single change fixes the cropped-top look everywhere `ScaledPreview` is used:
- Landing page `TemplateGallery` cards
- Landing page `HeroCvPreview`
- In-builder `StepTemplate` selector thumbnails
- Any other template thumbnails that use `ScaledPreview`

No template internals or page layouts change — just the framing of the scaled preview.