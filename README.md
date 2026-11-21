# School ID Cards — Frontend Documentation

An enterprise-grade, multi-tenant Web Application for Educational Institution Governance, Student Management, Visual ID Card Design, Batch Generation, High-Resolution PNG & ZIP Export, and Public QR Verification.

---

## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Tech Stack](#tech-stack)
3. [Project Directory Structure](#project-directory-structure)
4. [Environment Setup & Configuration](#environment-setup--configuration)
5. [State Management (Redux Toolkit + Saga)](#state-management-redux-toolkit--saga)
6. [Routing & Role-Based Access Control](#routing--role-based-access-control)
7. [Key Features & Modules](#key-features--modules)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Build & Production Deployment](#build--production-deployment)
10. [Security & Data Sanitization](#security--data-sanitization)

---

## 1. Overview & Architecture

The School ID Cards frontend is built using **React 19**, **Vite**, **Redux Toolkit**, and **Redux Saga**. It delivers a role-aware interface for three distinct user roles:
- **`SUPER_ADMIN`**: Manages one tenant: college provisioning, user administration, system-wide template control, ID card commission (default, school and optional school + template rates), **Letterhead Rates**, **Letterhead Orders** and letterhead settings.
- **`COLLEGE_ADMIN`**: Institution-level student records, bulk CSV/Excel imports, interactive visual template designer, batch ID card generation jobs and output downloads. Also the **Letterhead Studio**, the **Document composer** and history, **Send to print**, and their own letterhead print orders.
- **`OPERATOR`** (Class Teacher): Operational workspace for assigned classes. Can create documents only if the Super Admin allows it, and never sees money (no rates, orders or payments).
- **`UNAUTHENTICATED` / Public**: Instant, secure QR code verification of printed ID cards.

Users sign in with a **Key Code** + email + password. Super Admins use their tenant code (e.g. `MAIN`); School Admins and Class Teachers use their college code. The backend keeps each tenant's data in its own database.

---

## 2. Tech Stack

- **Core UI**: React 19 (`react`, `react-dom`)
- **Build Tool & Dev Server**: Vite 8 with Tailwind CSS
- **State Management**: Redux Toolkit (RTK)
- **Side Effects / Async Workflows**: Redux Saga (`redux-saga`)
- **Routing**: React Router DOM v7 (`react-router-dom`)
- **HTTP Client**: Axios with centralized request/response interceptors and error sanitization
- **Icons**: Lucide React (`lucide-react`)
- **Rich text (letter body)**: TipTap 3.31.4 (`@tiptap/react`, `starter-kit` incl. Underline + Link, `extension-text-align`, `extension-table`), loaded only on the composer page
- **Testing**: Vitest + React Testing Library (126 test files, 522 tests; 47 of them currently fail and pre-date the letterhead work)
- **Code Quality**: Oxlint

---

## 3. Project Directory Structure

```
frontend/
├── public/                     # Static public assets & branding
├── src/
│   ├── api/                    # Centralized Axios client & safe error normalizer
│   │   ├── apiClient.js        # Global Axios instance with auth & 401 interceptors
│   │   └── apiError.js         # API error sanitization & standard formatting
│   ├── app/                    # Redux store configuration
│   │   ├── rootReducer.js      # Combined slice reducers
│   │   ├── rootSaga.js         # Combined saga watchers
│   │   └── store.js            # configureAppStore factory
│   ├── components/             # Reusable UI & Feature components
│   │   ├── common/             # AppErrorBoundary, RouteLoader, Toast, ConfirmDialog, EmptyState
│   │   ├── layout/             # MainLayout, Header, Sidebar, Navigation
│   │   ├── colleges/           # CollegeForm, CollegeCard, CollegeFilters
│   │   ├── users/              # UserForm, UserTable, UserFilters
│   │   ├── students/           # StudentForm, StudentTable, StudentPhotoUploader
│   │   ├── studentImport/      # FileDropzone, ImportProgress, ErrorSummary
│   │   ├── templates/          # TemplateForm, TemplatePreview, StatusBadges
│   │   │   └── designer/       # Interactive Canvas, Drag/Drop Elements, Live Preview
│   │   ├── idCardGeneration/   # GenerationStatusBadge, BatchProgressBar, JobCard
│   │   ├── idCardOutput/       # DownloadPanel, StudentOutputTable, ZipDownload
│   │   ├── idCardVerification/ # VerifiedStudentCard, VerificationBadge, QrScanner
│   │   ├── commission/         # ID card rates, Mark Paid, payments, TemplateRatesModal, PayNowCard
│   │   ├── letterheads/        # Letterhead Studio: TemplateGrid, SystemTemplateForm, CustomUploadEditor, LivePreview …
│   │   ├── documents/          # LetterBodyEditor (TipTap), quick templates, preview panel
│   │   ├── letterheadCommission/ # Letterhead rate editor + shared UI bits
│   │   ├── letterheadOrders/   # SendToPrintModal, Mark Paid / decline / undo modals
│   │   └── dashboard/          # StatCards, ActivityFeed, QuickActions, LetterheadPrintPanel, LetterheadPrintOrgPanel
│   ├── constants/              # Centralized roles, routes, statuses, storage keys
│   ├── features/               # Domain feature modules (slices, sagas, selectors, APIs)
│   │   ├── account/            # Current account profile & security state
│   │   ├── auth/               # Login, session restoration, token management
│   │   ├── colleges/           # College management state & API
│   │   ├── confirmDialog/      # Global confirmation modal state
│   │   ├── dashboard/          # Dashboard analytics aggregation
│   │   ├── idCardGeneration/   # Generation jobs state & saga workflows
│   │   ├── idCardOutput/       # Blob downloads & ZIP export
│   │   ├── idCardVerification/ # Public QR verification resolution
│   │   ├── notifications/      # Toast notification system
│   │   ├── studentImport/      # File validation & bulk upload
│   │   ├── students/           # Student CRUD operations
│   │   ├── templateDesigner/   # Visual designer canvas state
│   │   ├── templates/          # Template CRUD operations
│   │   ├── users/              # User CRUD operations
│   │   ├── commission/         # ID card commission rates + payments
│   │   ├── commissionTemplateRates/ # Optional school + template rates
│   │   ├── letterheads/        # Letterhead list / editor / preview / templates / settings
│   │   ├── documents/          # Generate (PDF blob), preview, history, saved-copy download
│   │   ├── letterheadCommission/ # Letterhead print rates (Super Admin)
│   │   └── letterheadOrders/   # Print orders, payments, quote, send to print, my rate
│   ├── pages/                  # Lazy-loaded route views
│   ├── routes/                 # AppRoutes, ProtectedRoute, RoleRoute
│   ├── test/                   # Comprehensive Vitest test suites (107 files)
│   └── utils/                  # Storage wrappers, date formatting, sanitizers
├── .env.example                # Safe environment variable template
├── package.json                # Dependencies & scripts
└── vite.config.js              # Vite & Vitest configuration
```

---

## 4. Environment Setup & Configuration

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Base API URL pointing to the backend Express server |

---

## 5. State Management (Redux Toolkit + Saga)

The application uses an asynchronous data flow:
1. **Component**: Dispatches an action (e.g., `fetchStudentsRequested({ page: 1 })`).
2. **Saga Worker**: Listens to the action via `takeLatest`, calls the feature API service, and handles response unwrapping.
3. **Redux Slice**: Updates state with validated payload (`fetchStudentsSucceeded`) or error message (`fetchStudentsFailed`).
4. **Selectors**: Memoized selectors extract state for rendering without unnecessary re-renders.

```
Component ──[Dispatch Action]──> Redux Store ──[Trigger]──> Redux Saga Worker
                                                                   │
Component <──[Select Memoized State]── Redux Store <──[Success]─── API Service
```

---

## 6. Routing & Role-Based Access Control

All routing is configured in `src/routes/AppRoutes.jsx` with route-level code splitting:

- **`ProtectedRoute`**: Blocks unauthenticated requests and redirects to `/login`.
- **`RoleRoute`**: Enforces authorized roles (`SUPER_ADMIN`, `COLLEGE_ADMIN`, `OPERATOR`) and redirects forbidden requests to `/unauthorized` (`403 Access Denied`).
- **Route-Level Code Splitting**: Every page is loaded via `React.lazy()` wrapped in `<Suspense fallback={<RouteLoader />}>`.
- **Global Error Boundary**: `<AppErrorBoundary>` protects the UI tree from uncaught rendering errors.

Routes added for the letterhead, document and print-rate flows (constants in `src/constants/routes.js`):

| Route | Roles | Page |
|---|---|---|
| `/letterheads` | SA, CA | Letterhead list (Super Admin: per school, plus letterhead settings) |
| `/letterheads/new` · `/letterheads/:id/edit` | SA, CA | Letterhead Studio (create / edit) |
| `/documents` | SA, CA, OP | Document history |
| `/documents/new` | SA, CA, OP | Document composer |
| `/commission/letterhead-rates` | SA | Letterhead Rates |
| `/letterhead-orders` | SA | Letterhead Orders (all organisations) |
| `/my-letterhead-orders` | CA | My letterhead orders |

The router is `<BrowserRouter>` (not a data router), so `useBlocker` isn't available. The Letterhead Studio's unsaved-changes guard uses `beforeunload` plus a confirm on its own Back/Cancel buttons.

---

## 7. Key Features & Modules

### 1. Multi-Role Dashboard
- **Super Admin**: Platform-wide metrics (colleges, users, templates) and activity log.
- **College Admin**: Institution metrics (students, templates, card generations, completed batches).
- **Operator**: Operational status and workspace tools.

### 2. ID Card Visual Designer & Live Preview
- Interactive canvas with real-world millimeter-to-pixel scaling (e.g., standard CR80 ID card: 86mm x 54mm).
- Dynamic element positioning for Student Name, Roll No, Class, Barcode/QR, and Photo Box.
- Live real-time preview toggle showing sample data rendering.

### 3. Student Bulk Import
- Client-side validation for `.csv` and `.xlsx` files up to 10MB.
- Multipart `FormData` streaming to backend `/api/students/import`.
- Row-level error reporting and duplicate detection.

### 4. ID Card Generation & Output Export
- Single and bulk generation job submission.
- Real-time job status polling (`PENDING` -> `PROCESSING` -> `COMPLETED` / `FAILED`).
- Single PNG card download and bulk ZIP package streaming via `responseType: 'blob'`.

### 5. Public QR Verification
- Unauthenticated portal at `/verify/:token`.
- Resolves cryptographic token and displays official verification badge, student credentials, and college branding.
- Never exposes sensitive user passwords, internal database IDs, or JWT tokens.

### 6. Key Code login
- The login form has a **Key Code** field (uppercased, remembered on the device in `localStorage.lastKeyCode`, with a "Not you?" link to clear it).
- The header shows the tenant name.

### 7. ID card commission: template rates
- On the Commission page each school row has **Template rates**, a list of that school's ID card templates where Super Admin can set or clear a rate. It wins over the school rate (e.g. ABC ₹50, ABC + "Royal Wave" ₹55).
- Rate history can be filtered to template rates and shows the template name.

### 8. Letterhead Studio (`/letterheads`)
- **Create:** choose **Use a ready template** or **Upload my letterhead**, then the organisation type. Super Admin picks the school first.
- **Template editor:** template picker with thumbnails, colours (with **Match logo**), fonts, logo, header layout, organisation details (empty fields show the school profile as placeholders), footer, page 2+ header and watermark.
- **Upload editor:** PDF / PNG / JPG upload for page 1 and an optional page 2+. You set the text area by dragging the safe-zone lines (mm) or typing the numbers. Low-resolution images get a warning, and a multi-page PDF offers **Use page 2 of my PDF**.
- **Also:** signatory, reference number format with a live example, and a **live PDF preview** (refreshes 0.5 s after typing stops, Page 1 / Page 2 tabs, "Open preview PDF" on phones).
- **Save:** saving shows the new version. List actions are duplicate, set default and delete.

### 9. Documents (`/documents`, `/documents/new`)
- **Composer:**
  - letterhead (the default for its organisation type is preselected), document type, reference number (empty = next number), date, subject, recipient;
  - rich-text body (TipTap; pasting from Word keeps only what the backend allows);
  - **10 quick templates** with a small placeholder form (bonafide, character, leave, experience, offer, notice, fee reminder, appointment, legal notice, medical certificate);
  - signatory override, CC, enclosures, **Save a copy**.
- **Preview:** shows page 1 without using a number. **Generate** downloads the PDF named after the reference number.
- **History:** filters (type, dates, search). Saved copies can be downloaded again.

### 10. Letterhead printing
- **Send to print** (School Admin): use **Generate & send to print** in the composer (always saves a copy), **Send to print** on the success banner, or **Print** in history.
  - The form takes copies, colour / B&W, double-sided (A4) and a note. It shows a live price from the server with a breakdown, and the price is locked on submit.
  - If no rate is set, or the document has no saved copy, the button is disabled and the reason is shown.
- **My letterhead orders** (`/my-letterhead-orders`, School Admin):
  - status tabs and My payments;
  - Cancel before the order is accepted, PDF download, payment badge;
  - the header shows their own print rate.
- **Letterhead Rates** (`/commission/letterhead-rates`, Super Admin):
  - global default card, sector rates (Schools, Clinics, Corporate, Legal, Government, NGO, General; "Uses global" when unset), organisation rates with search ("Inherited from Sector: Clinics ₹12");
  - rate editor: you type rupees; unit, B/W, double-sided extra, minimum order, GST, quantity tiers with gap/overlap checks, valid dates, note;
  - a live example priced by the server, a **Rate checker** and history.
- **Letterhead Orders** (`/letterhead-orders`, Super Admin):
  - tabs New / In Print / Completed / Declined / All / Payments;
  - order actions: Accept, Decline (reason), Printing, Complete, Download PDF;
  - **Mark as Paid** for one organisation's pending orders (method, reference no., date, optional proof, note), and **Undo** with a reason on the Payments tab.
- **Dashboards:** separate teal **Letterhead printing** panels. Super Admin's shows all-time totals; School Admin's shows their own rate, pending, paid, in print and a separate Pay-now box. These amounts are never added to the ID card revenue / payment cards.

### Downloads and PDFs
The PDF calls (letter preview, generate, document preview, order download) use `responseType: 'arraybuffer'` with a `transformResponse`. The apiClient interceptor returns only `response.data`, so this is how a call reads response headers such as `X-Ref-No` and decodes JSON error bodies. Blobs never go into Redux; previews keep only an object URL, which is freed when replaced or when the page unmounts.

---

## 8. Testing & Quality Assurance

The frontend contains **126 test files and 522 unit/integration tests** using Vitest and React Testing Library. 47 of them currently fail; those failures pre-date the letterhead and print-rate work and are the baseline to compare against. On a slow machine a run sometimes collects fewer tests, so if the total isn't 522, run it again.

```bash
# Run full comprehensive test suite
npm test

# Run final release integration suite (Batch 16)
npm run test:final-integration

# Run production hardening suite (Batch 15)
npm run test:production-hardening

# Run UI/UX hardening suite (Batch 11)
npm run test:ui-hardening

# Run specific feature suites
npm run test:college-management
npm run test:user-management
npm run test:student-management
npm run test:student-import
npm run test:template-management
npm run test:template-designer
npm run test:id-card-generation-management
npm run test:id-card-output
npm run test:id-card-verification
npm run test:dashboard
npm run test:account-management
```

---

## 9. Build & Production Deployment

```bash
# Compile and build for production
npm run build

# Preview production build locally
npm run preview
```

### Production Build Optimization:
- Automatic chunk splitting for React, Redux, Lucide icons, and lazy-loaded routes.
- Fully sanitized asset outputs in `dist/`.
- Safe fallback base URL (`/api`) when environment variables are omitted in production reverse-proxy environments.
- Deploy together with the backend: login sends a `keyCode`, which older backends don't accept.

---

## 10. Security & Data Sanitization

- **Zero Secret Exposure**: Tokens, passwords, and Authorization headers are never rendered in the DOM or stored in error state.
- **Mongo & Stack Trace Sanitization**: Database metadata (`__v`) and server stack traces are filtered out by `apiError.js`.
- **Blob Safety**: Binary file streams are handled in memory and never persisted in Redux state.
- **Storage Isolation**: Token storage wrapper handles quota errors and clears all session keys on logout or 401 Unauthorized.
