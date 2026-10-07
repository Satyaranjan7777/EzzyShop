# Technical Debt, Concerns & Scalability Assessment

**Application:** EzzyShop Fullstack MERN Application  
**Assessment Date:** October 2026

---

## 1. High-Priority Technical Debt & Code Organization

### 1.1 Uncommitted Working Tree Changes
- **Observation:** The repository currently has active uncommitted modifications across 50+ files and untracked files for the newly developed Master Admin feature (`backend/src/controllers/master.controller.js`, `backend/src/models/ActivityLog.js`, `backend/src/routes/master.routes.js`, `frontend/src/pages/master/`, etc.).
- **Impact:** Risk of unversioned regressions or divergence between developer environments.
- **Recommended Action:** Complete validation, run automated tests, and commit the Master Admin capability as an atomic milestone.

### 1.2 Legacy Backward-Compatibility Export Shims
- **Observation:** The codebase contains legacy stub files maintained for backward compatibility:
  - `backend/src/controllers/authController.js` (`export * from "./auth.controller.js"`)
  - `backend/src/middleware/adminMiddleware.js`
  - `backend/src/middleware/authMiddleware.js`
  - `backend/src/routes/authRoutes.js` (`export { default } from "./auth.routes.js"`)
- **Impact:** Minor code redundancy and potential confusion for new contributors.
- **Recommended Action:** Deprecate and remove these shims once all external references are updated to the canonical `.controller.js` / `.middleware.js` naming scheme.

---

## 2. Scalability & Production Infrastructure Concerns

### 2.1 In-Memory Rate Limiting vs Distributed Cache
- **Current Architecture:** Rate limiting is managed entirely via an in-memory sliding window store (`rateLimitStore` in `backend/src/middleware/rateLimiter.middleware.js`).
- **Limitation:** In a scaled production deployment featuring multiple Node.js processes (PM2 cluster, Docker replicas, or Kubernetes pods), each process maintains its own independent rate-limiting memory map. An attacker could bypass limits by distributing requests across instances.
- **Mitigation Strategy:** Transition the in-memory cache to a centralized Redis adapter (e.g., `ioredis` or `redis-om`) for production clustering.

### 2.2 Local Disk Storage for Media Uploads
- **Current Architecture:** Image uploads (`/api/v1/upload`) are saved to local filesystem storage (`backend/storage/uploads`) via Multer disk storage.
- **Limitation:** In a containerized or horizontally scaled deployment, local disk storage is ephemeral. Assets uploaded to one container are not accessible to other containers unless mounted via a shared network volume.
- **Mitigation Strategy:** Introduce a cloud storage driver (AWS S3, Cloudinary, or Google Cloud Storage) behind an abstraction interface, keeping local disk storage as a development fallback.

### 2.3 Real-Time Admin Order Polling Overhead
- **Current Architecture:** `frontend/src/hooks/useAdminOrderPolling.js` polls `GET /api/v1/orders` every 15 seconds to notify administrators of incoming orders.
- **Limitation:** As concurrent administrator sessions grow, periodic HTTP polling generates unnecessary database queries and network overhead.
- **Mitigation Strategy:** Transition order change notifications to WebSockets (`socket.io`) or Server-Sent Events (SSE).

---

## 3. Testing & Verification Gaps

### 3.1 Lack of Frontend Automated Test Coverage
- **Current State:** The backend has 13 comprehensive Jest test suites (>100 tests), but the frontend currently has zero automated component, integration, or end-to-end tests.
- **Risk:** Regressions in UI interactions (such as cart recalculations, checkout form validation, or route guard redirects) can only be caught through manual exploratory testing.
- **Recommended Action:** Introduce `vitest` with `@testing-library/react` for Zustand store and component unit tests, accompanied by Playwright for critical E2E user journeys.

---

## 4. Payment Gateway & Business Logic Constraints

### 4.1 Limited Payment Gateways (Cash on Delivery Only)
- **Current State:** Payment processing is restricted to `"COD"` (Cash on Delivery).
- **Limitation:** No digital payment methods (credit card, UPI, net banking, digital wallets) are integrated.
- **Mitigation Strategy:** Integrate Stripe, Razorpay, or PayPal webhooks with idempotent payment verification in `order.controller.js`.

---

## 5. Security Posture & Vigilance Points

*(Refer to `SECURITY_AUDIT_REPORT.md` for full vulnerability remediations)*

| Component | Status | Vigilance / Maintenance Requirement |
| :--- | :--- | :--- |
| **Registration Mass-Assignment** | Remediated | Strictly maintain hardcoded `role: "user"` on public registration routes. |
| **Inventory Depletion Race Condition** | Remediated | Ensure all future order creation endpoints use atomic conditional queries (`stock: { $gte: qty }`). |
| **CORS Policy** | Remediated | Verify production `.env` configures specific domain in `CLIENT_URL` rather than wildcard. |
| **Password Visibility** | Remediated | Retain `select: false` on `password` field in `User.js` model. |
| **Media File Sandboxing** | Remediated | Maintain `Content-Security-Policy: sandbox; default-src 'none'` headers on `/uploads`. |
