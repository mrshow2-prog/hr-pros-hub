## Goal
Accept profile photos of any size from the user's device and automatically compress them client-side to under 1MB before uploading, so phone-camera shots don't get rejected.

## Approach
Add a small client-side compression step in `StepUpload.tsx`'s `handlePhoto` flow. No new dependencies — use the browser's native `Image` + `<canvas>` + `canvas.toBlob()` APIs (works on all modern mobile browsers, including iOS Safari).

### Steps
1. Remove the hard 2MB pre-upload rejection. Instead, set a generous absolute ceiling (e.g. 20MB) just to guard against absurd inputs.
2. Add a helper `compressImage(file, { maxBytes: 1_000_000, maxDimension: 1600 })` that:
   - Loads the file into an `HTMLImageElement` via `URL.createObjectURL`.
   - Draws it to a canvas, scaling longest edge down to `maxDimension` (preserves aspect ratio; only downsizes, never upsizes).
   - Exports as JPEG via `canvas.toBlob(..., 'image/jpeg', quality)`.
   - Iteratively lowers quality (0.85 → 0.75 → 0.65 → 0.55 → 0.45) until the blob is ≤ 1MB. If still too big, also halves dimensions and retries.
   - Returns a new `File` with `.jpg` extension and `image/jpeg` type.
3. In `handlePhoto`:
   - Show "Compressing…" state while it runs.
   - Always convert PNG/JPEG inputs through the compressor (PNGs become JPEGs — fine for headshots; if user really wants PNG transparency, that's not a use case for a profile photo).
   - Upload the compressed file with the sanitized name (extension forced to `.jpg`).
4. Update the helper text from "max 2MB" to something like "Any size — we'll optimize it for you."
5. Keep JPG/PNG as the accepted input types. HEIC from iPhone is still not decodable by canvas — leave the existing rejection but improve the error message to suggest re-saving as JPG (iOS shares photos as JPEG by default when uploading via the file picker, so this is rarely hit).

### Files to change
- `src/components/cv-builder/StepUpload.tsx` — add `compressImage` helper, rewire `handlePhoto`, update validation + copy.

### Out of scope
- Compressing the CV PDFs/DOCX (different problem, different tradeoffs).
- HEIC → JPEG conversion (would need an extra library like `heic2any`; can revisit if users hit it).
