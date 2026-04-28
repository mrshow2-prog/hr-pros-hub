# Drag-and-drop CV upload — Career page

Add a drag-and-drop zone to two file inputs on `src/pages/Career.tsx`:

1. **ATS CV Checker** — required upload (PDF / DOCX)
2. **Contact form** — optional "Attach CV" field (PDF / DOC / DOCX)

Click-to-browse stays fully functional. Analysis logic, output rendering, and other tools are not touched.

## What the user sees

A single styled zone replaces each existing file input:

- Dashed border using existing tokens (`border-career-sky/35` for ATS, `border-paper/30` for contact form), tinted background (`bg-career-sky/5` / `bg-paper/10`).
- Upload icon + primary line **"Drag your CV here"**.
- Smaller secondary line **"or click to browse files"**.
- Helper text below: **"PDF, DOC, DOCX — max 2MB"** (ATS zone shows "PDF, DOCX — max 2MB" since DOC isn't parseable there).
- Hover / drag-over state: brighter border + slightly stronger background tint.
- Selected-file state: keeps current "filename + Replace" chip styling already used in the ATS section; contact form gets an equivalent compact selected state.
- Errors render in the existing amber inline error block (same component pattern already used for `atsError`). No `alert()`.

## Behaviour

- Click anywhere on the zone → opens native file picker (wrap input in `<label>`, same as today).
- Drag over → `preventDefault` + visual highlight.
- Drop → take **only `files[0]`**, ignore the rest silently.
- Validate the chosen file:
  - **Type**: extension in allowed list (`.pdf`, `.docx` for ATS; `.pdf`, `.doc`, `.docx` for contact). Also check MIME where present.
  - **Size**: ≤ 2MB (`2 * 1024 * 1024`).
  - On failure: set the field's existing error state with a clear message (e.g. `"Unsupported file type. Use PDF or DOCX."` / `"File is larger than 2MB."`). Do not set the file.
- On success: clear any error, set the file in state.
- Mobile: no `dragenter`/`drop` events fire on touch — the same `<label>` click handler still opens the picker, so the zone degrades to a tap-to-browse button with identical styling. No separate mobile branch needed.

## Technical changes

**New component**: `src/components/career/CvDropzone.tsx`

Props:
```ts
type Variant = "ats" | "contact";
interface Props {
  file: File | null;
  onFile: (f: File | null) => void;
  onError: (msg: string) => void;
  error?: string;
  accept: string;              // e.g. ".pdf,.docx"
  allowedExt: string[];        // e.g. ["pdf","docx"]
  maxBytes?: number;           // default 2 * 1024 * 1024
  variant: Variant;            // controls colour tokens (career-sky vs paper)
  required?: boolean;
  label?: string;              // optional override for primary line
}
```

Internals:
- `useRef<HTMLInputElement>` for hidden `<input type="file">`.
- `useState` for `isDragging`.
- Handlers: `onDragOver` / `onDragEnter` (preventDefault + setDragging true), `onDragLeave` (false), `onDrop` (preventDefault, setDragging false, take `e.dataTransfer.files[0]`, run validate).
- `validate(file)` returns `{ ok, msg }`; on `!ok` calls `onError(msg)` and returns. On ok calls `onFile(file)` and `onError("")`.
- Rendered as a `<label>` wrapping the icon, text, helper line, hidden `<input>`, and (when `file` present) a filename row with a Replace affordance — preserves current ATS look.
- Tailwind classes use existing tokens only (`border-career-sky/35`, `bg-career-sky/5`, `text-career-sky`, `border-paper/30`, `bg-paper/10`, `text-paper/55`, etc.). Drag-over state bumps border opacity (`/60`) and bg (`/15`).

**`src/pages/Career.tsx` edits**:

- Import `CvDropzone`.
- ATS section (~line 325): replace the current `{atsFile ? <selected-file row> : <label upload>}` block with `<CvDropzone variant="ats" file={atsFile} onFile={setAtsFile} onError={setAtsError} error={atsError} accept=".pdf,.docx" allowedExt={["pdf","docx"]} required />`. Remove the now-duplicate amber error block beneath it (the dropzone renders its own validation error in the same amber style; the existing parse-failure `atsError` from `handleAtsSubmit` still needs to render — keep that block but only show it when the error is the parse-failure copy, OR simpler: keep one shared amber error block under the dropzone that always shows `atsError`). Final approach: keep the existing amber block as-is; the dropzone calls `setAtsError` for upload-validation messages, and `handleAtsSubmit` keeps using it for parse failures.
- Contact form (~line 327): replace the "Attach CV (optional)" label/input block with `<CvDropzone variant="contact" file={contactCv} onFile={setContactCv} onError={setContactCvError} error={contactCvError} accept=".pdf,.doc,.docx" allowedExt={["pdf","doc","docx"]} />`. Add new state `const [contactCvError, setContactCvError] = useState("")`. Keep the existing helper note ("file uploads aren't attached to the enquiry yet…") below the dropzone.

No changes to:
- `handleAtsSubmit`, `analyseCvText`, `looksLikeCv`, `extractPdfText`, `extractDocxText`
- ATS result display
- Contact submit handler / payload
- Any other tool or page

## Files touched

- **NEW** `src/components/career/CvDropzone.tsx`
- **EDIT** `src/pages/Career.tsx` (imports, ATS upload block, contact CV block, add `contactCvError` state)
