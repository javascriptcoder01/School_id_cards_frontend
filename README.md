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
- **`SUPER_ADMIN`**: Multi-tenant platform management, college provisioning, user administration, and system-wide template control.
- **`COLLEGE_ADMIN`**: Institution-level student records, bulk CSV/Excel imports, interactive visual template designer, batch ID card generation jobs, and physical output downloads.
- **`OPERATOR`**: Operational workspace with read-only visibility.
- **`UNAUTHENTICATED` / Public**: Instant, secure QR code verification of printed ID cards.

---

## 2. Tech Stack

- **Core UI**: React 19 (`react`, `react-dom`)
- **Build Tool & Dev Server**: Vite 8 with Tailwind CSS
- **State Management**: Redux Toolkit (RTK)
- **Side Effects / Async Workflows**: Redux Saga (`redux-saga`)
- **Routing**: React Router DOM v7 (`react-router-dom`)
- **HTTP Client**: Axios with centralized request/response interceptors and error sanitization
- **Icons**: Lucide React (`lucide-react`)
- **Testing**: Vitest + React Testing Library (107 test files, 466 passing tests)
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
│   │   └── dashboard/          # StatCards, ActivityFeed, QuickActions, MetricCharts
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
│   │   └── users/              # User CRUD operations
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

---

## 8. Testing & Quality Assurance

The frontend contains **107 test files and 466 unit/integration tests** using Vitest and React Testing Library.

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

---

## 10. Security & Data Sanitization

- **Zero Secret Exposure**: Tokens, passwords, and Authorization headers are never rendered in the DOM or stored in error state.
- **Mongo & Stack Trace Sanitization**: Database metadata (`__v`) and server stack traces are filtered out by `apiError.js`.
- **Blob Safety**: Binary file streams are handled in memory and never persisted in Redux state.
- **Storage Isolation**: Token storage wrapper handles quota errors and clears all session keys on logout or 401 Unauthorized.
