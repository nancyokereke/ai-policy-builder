# AI Policy Builder

**Created by Nancy Okereke.** A free, private, browser-only tool for creating customised workplace AI Usage Policies.

## Run locally

Requires Node.js 20.19+ (or a current Node.js 22+ release).

```sh
npm ci
npm run dev
```

Vite binds to `0.0.0.0` and accepts the Arena preview host. Open the URL printed in the terminal, normally `http://localhost:5173`.

## Build and deploy

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to any static web host. There is no application backend, database, authentication service, external AI API, analytics, or runtime CDN dependency. All navigation uses hash destinations, so no server-side route rewrites are necessary. The production Content Security Policy restricts scripts, fonts, images and network connections to the site's own origin. Opening Nancy's LinkedIn profile is an explicit external navigation and never includes questionnaire data.

The development server's CSP additionally permits Vite's inline development refresh script and hot-reload connections. These development allowances are removed in the production build.

## Application

- Responsive landing page with a custom, locally served abstract hero asset.
- Four-stage, 18-question builder with required-field validation and conditional Other fields.
- In-memory answer preservation across steps, the results view and browser back/forward navigation.
- Exclusive “We do not currently use AI tools” selection and future-adoption guidance.
- Deterministic, modular policy clauses covering all 13 requested document sections.
- Conditional recruitment, customer support, account, upload, integration, approval, oversight, disclosure, incident, training and review rules.
- Complete, explicitly proposed requirements for unconfirmed arrangements; no generated placeholders or blank acknowledgement fields.
- Inline editing of the actual policy title, headings, paragraphs and notice, including paragraph addition/removal.
- Complete clipboard export with a fallback for browsers that deny the Clipboard API.
- Text-based, searchable A4 PDF export with embedded Lato fonts, wrapped paragraphs, page-aware headings, page numbers and Nancy Okereke attribution on every page.
- Confirmation before discarding work or replacing manual edits after answer changes.
- Privacy Notice and Disclaimer in keyboard-accessible native dialogs.
- Reduced-motion support, visible focus, labelled controls, screen-reader validation and responsive navigation.

## Privacy and data lifetime

Questionnaire responses, generated documents and manual edits live only in React memory in the current tab. The app does **not** write responses to localStorage, sessionStorage, IndexedDB, cookies, a database, or an API. Refreshing or closing the page loses the work. Users should copy their policy or download a PDF before leaving.

The only essential-information text fields concern the business, its industry and its country. There are no personal contact fields, accounts or lead-capture forms. The employee acknowledgement is blank text in the exported document; the application does not collect signatures or employee details.

All fonts and images are served locally. PDF generation is lazy-loaded from the same origin, and the fonts it embeds are also local. The PDF includes the same current document object used by the editor and clipboard export, not an older generated snapshot.

## Source map

```text
src/
  App.tsx                     In-memory state, navigation, dialogs and actions
  components/
    Landing.tsx               Landing page and educational sections
    Questionnaire.tsx         Guided form, progress and stage navigation
    Fields.tsx                Reusable accessible form controls
    Results.tsx               Document workspace, outline and inline editor
    Footer.tsx                Attribution and supporting links
    Modal.tsx                 Native accessible dialogs
    Brand.tsx                 Wordmark and vector mark
  lib/
    types.ts                  Shared document and answer models
    questionnaire.ts          Options, selections and validation rules
    policy-clauses.ts         Modular conditional policy language
    policy-engine.ts          Policy assembly and plain-text serialisation
    export-policy.ts          Clipboard and paginated PDF export
  styles*.css                 Responsive visual system
public/
  images/                     Optimised local hero artwork
  fonts/                      Embedded PDF fonts and their licence
tests/
  unit/                       Policy and validation tests
  e2e/                        Browser workflow and accessibility tests
```

To change policy wording, edit `policy-clauses.ts` or the relevant assembly section in `policy-engine.ts`. Keep conditional rules consistent across sections and use complete recommendations or proposed requirements wherever a company-specific fact has not been confirmed; never invent existing arrangements or output placeholders. The engine is pure and independent of React and the PDF renderer.

## Quality checks

```sh
npm test                      # 97 policy, validation and conditional-logic tests
npx playwright install chromium
npm run test:e2e               # 10 complete browser workflows, including axe checks
npm run build                 # Strict TypeScript and production build
```

On a minimal Linux environment, Playwright may also need `npx playwright install-deps chromium`.

Browser checks cover landing links, privacy/disclaimer dialogs, required and conditional validation, exclusive tool selections, preserved answers, no-current-AI policies, manual document edits, complete clipboard output, real PDF downloads, reset confirmation, mobile layouts from 320–1440px, and automated WCAG A/AA checks across the landing page, all four stages, results and editor. The production PDF was also inspected with an independent PDF text extractor to confirm edited paragraphs, all 13 sections, page numbers and attribution.

Automated accessibility checks are not a substitute for a full assistive-technology audit. The generated policy is a practical starting point, not legal advice or certification of compliance. Business owners must review and adapt it before adoption.

## licences

Manrope and Inter are distributed through Fontsource under their respective SIL Open Font Licences. Lato's licence is included at `public/fonts/OFL-Lato.txt`. Lucide icons retain their upstream licence. The abstract hero image was generated for this project.