# Technology Stack Architecture

**Application:** EzzyShop (Production Fullstack MERN E-Commerce Application)  
**Repository Architecture:** Monorepo Workspace (Root orchestrator with decoupled `backend/` and `frontend/` workspaces)  
**Runtime:** Node.js (ESM native, `type: module`)

---

## 1. Core Languages & Runtimes

| Component | Technology | Version / Specification | Rationale & Usage |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Node.js | v20+ / ESM Native (`"type": "module"`) | Asynchronous non-blocking I/O, modern ES Modules syntax. |
| **Frontend Runtime** | Browser / Node.js (Build) | Modern Evergreen Browsers, Node.js 18+ | Client-side Single Page Application (SPA). |
| **Language** | JavaScript (ECMAScript) | ES2023+ (ESM throughout) | Consistent syntax across server and browser. |

---

## 2. Backend Stack (`/backend`)

### 2.1 Framework & Core Libraries
- **Web Framework:** Express `^5.2.1`
  - Utilizes Express 5 native Promise handling in route handlers and middleware.
  - Supports modern asynchronous error propagation without repetitive try/catch overhead where `asyncHandler` is applied.
- **Database ODM:** Mongoose `^9.9.2`
  - Strict schema definitions, hooks/middleware (`pre('validate')`, `pre('save')`), embedded documents, and query sanitization.
- **Security & Hardening:**
  - `helmet: ^8.3.0` — Configures critical security HTTP response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, etc.).
  - `cors: ^2.8.6` — Dynamic origin whitelisting supporting production client URLs and local development servers.
  - Custom NoSQL Sanitizer (`backend/src/middleware/sanitize.middleware.js`) — Strips `$` and `.` operators from request keys.
  - In-memory Rate Limiting (`backend/src/middleware/rateLimiter.middleware.js`) — Configurable sliding window rate limiters with exponential backoff on auth routes.
- **Authentication & Cryptography:**
  - `jsonwebtoken: ^9.0.3` — HMAC SHA256 signed JWT tokens containing user ID and role claims (`user`, `admin`, `master`).
  - `bcryptjs: ^3.0.3` — One-way salted password hashing (salt cost 10) with timing-safe comparison methods.
- **File Upload & Asset Storage:**
  - `multer: ^2.4.0` — Multipart form handling with disk storage destination (`backend/storage/uploads`), random cryptographic filename hashing, and strict MIME-type whitelisting.
- **Environment Management:**
  - `dotenv: ^17.4.2` — Environment variable loading from `.env`.

### 2.2 Backend Development & Testing Dependencies
- **Test Framework:** `jest: ^30.4.2`
  - Executed with experimental VM modules support: `cross-env NODE_OPTIONS=--experimental-vm-modules jest --runInBand --detectOpenHandles --forceExit`.
- **HTTP Assertions:** `supertest: ^7.2.2` — End-to-end integration testing against Express application instance.
- **Dev Process Manager:** `nodemon: ^3.1.14` — Hot reloading during development (`npm run dev`).
- **Environment CLI:** `cross-env: ^10.1.0` — Cross-platform environment variable injection.

---

## 3. Frontend Stack (`/frontend`)

### 3.1 Framework, Bundler & UI Libraries
- **UI Framework:** React `^19.2.8` & React DOM `^19.2.8`
  - Modern React 19 functional components, custom hooks, and state management.
- **Build Tool & Dev Server:** Vite `^8.2.0`
  - Lightning-fast ESM dev server with HMR, optimized Rollup production builds.
  - Plugin `@vitejs/plugin-react: ^6.0.4` for Fast Refresh.
- **CSS Framework:** Tailwind CSS `^4.3.3`
  - Modern Tailwind CSS v4 with `@tailwindcss/vite: ^4.3.3` integration.
  - CSS custom properties, utility classes, and responsive grids.
- **Routing:** React Router DOM `^7.18.2`
  - Declarative client-side routing, nested layouts (`MainLayout`, `AdminLayout`), route guards (`ProtectedRoute`, `AdminRoute`, `MasterRoute`).
- **State Management:** Zustand `^5.0.15`
  - Lightweight decoupled store pattern:
    - `useAuthStore` — User profile, authentication state, token storage management.
    - `useCartStore` — Cart synchronization, optimistic quantity updates.
    - `useAdminNotificationStore` — Real-time audio-visual notifications for order status polling.
    - `useUIStore` — Sidebar states and mobile drawer toggles.
- **HTTP Client:** Axios `^1.19.0`
  - Configured base instance (`frontend/src/api/axios.js`) with request interceptor for JWT injection and response interceptor for 401 handling.
- **Form Handling & Validation:**
  - `react-hook-form: ^7.85.0` — High-performance un-rendered form input controllers.
  - `zod: ^4.4.3` & `@hookform/resolvers: ^5.9.0` — Schema-based client-side form validation.
- **UI Icons & Utilities:**
  - `lucide-react: ^1.31.0` — Modern SVG icon system.
  - `react-hot-toast: ^2.6.0` — Animated notification toasts.
  - `react-loading-skeleton: ^3.5.0` — Accessible skeleton placeholder loaders.

### 3.2 Frontend Tooling & Linting
- **Linter:** ESLint `^10.8.0` with `@eslint/js: ^10.0.1`
  - Flat configuration in `frontend/eslint.config.js`.
  - Plugins: `eslint-plugin-react-hooks: ^7.1.1`, `eslint-plugin-react-refresh: ^0.5.3`.

---

## 4. Root Workspace Scripts & Orchestration

The root `package.json` coordinates both workspaces:

```json
{
  "scripts": {
    "install:all": "npm install --prefix backend && npm install --include=dev --prefix frontend",
    "build": "npm install --prefix backend && npm install --include=dev --prefix frontend && npm run build --prefix frontend",
    "start": "npm run start --prefix backend",
    "dev:backend": "npm run dev --prefix backend",
    "dev:frontend": "npm run dev --prefix frontend",
    "dev": "npm run dev:backend",
    "test": "npm run test --prefix backend"
  }
}
```

---

## 5. Build, Packaging & Deployment Pipeline

- **Local Development:**
  - Backend: Runs on `http://localhost:5001` (or `$PORT`) via `npm run dev:backend`.
  - Frontend: Runs on `http://localhost:5173` via `npm run dev:frontend` (proxies `/api/v1` or connects via CORS).
- **Production Single-Process Serving:**
  - Frontend builds into static assets in `frontend/dist/` via `npm run build`.
  - Backend `backend/src/app.js` statically serves `frontend/dist/` and falls back to `frontend/dist/index.html` for unknown non-API routes, enabling unified single-server deployment.
