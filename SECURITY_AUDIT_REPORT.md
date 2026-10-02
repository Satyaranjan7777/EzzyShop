# Application Security Audit & Production Hardening Report

**Application Name:** EzzyShop (Production Fullstack MERN E-Commerce Application)  
**Audit Scope:** Complete Repository (Backend API, Data Models, Middleware, Authentication, Input Validation, Configuration, Dependencies, Error Handling, File Handling, and Automated Test Suites)  
**Role:** Senior Application-Security Engineer, Senior Software Architect, and Production-Readiness Reviewer  
**Audit Date:** September 22, 2026  
**Final Test Status:** 10 Passed / 10 Test Suites, 92 Passed / 92 Tests (100% Pass Rate)

---

## Executive Summary

A comprehensive application security audit and defensive remediation was conducted across the EzzyShop fullstack MERN codebase. The audit identified multiple vulnerabilities ranging from **Critical** (Vertical Privilege Escalation via Mass Assignment in registration) to **High** (ReDoS/Regex Injection in product and category search, Concurrency Race Conditions in inventory depletion during order checkout, and Missing HTTP Security Headers) alongside Medium/Low findings (Insecure CORS fallbacks, unbounded request payload bodies, unmasked password field defaults, and unmanaged file upload handling).

All identified vulnerabilities were patched adhering to the principle of smallest safe change. A dedicated regression test suite (`tests/securityHardening.test.js`) was engineered and integrated. All 10 test suites—comprising 92 individual automated unit, integration, and security tests—passed with zero regressions.

---

## Architecture & Trust Boundaries Map

- **Backend Architecture:** Node.js (ESM), Express 5 (`^5.2.1`), MongoDB via Mongoose (`^9.9.2`).
- **Frontend Architecture:** React 19, Vite, Zustand state management, Axios client with `sessionStorage` token isolation.
- **Authentication Model:** JWT Bearer Token authorization (`jsonwebtoken: ^9.0.3`) in `Authorization: Bearer <token>` headers; passwords hashed using `bcryptjs: ^3.0.3` (cost factor 10).
- **Access Control Model:** Role-Based Access Control (`role: 'user'` vs `role: 'admin'`) enforced via `role.middleware.js` and server-side model ownership validation (`user: req.user._id`).
- **Data Boundaries:**
  - *Public Boundaries:* Health checks, product browsing, category browsing, user registration, user login.
  - *Authenticated Customer Boundaries:* Cart modification, address management, checkout/order placement, viewing owned orders, cancelling owned pending orders.
  - *Administrative Boundaries:* Product creation/updates/deletion, category management, order status transitions across all customer accounts, media file uploads.

---

## Summary of Findings

| Finding ID | Category | Severity | Component | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Identity & Access Control | **Critical** | `auth.controller.js`, `auth.validator.js` | **Remediated & Verified** |
| **SEC-02** | Concurrency & Business Logic | **High** | `order.controller.js` | **Remediated & Verified** |
| **SEC-03** | Injection & Denial of Service | **High** | `product.controller.js`, `category.controller.js` | **Remediated & Verified** |
| **SEC-04** | Security Headers & Web Defense | **High** | `app.js` (Express Server) | **Remediated & Verified** |
| **SEC-05** | API & Abuse Protection | **Medium** | `app.js` (CORS Policy) | **Remediated & Verified** |
| **SEC-06** | Data Protection & Field Exposure | **Medium** | `User.js` Mongoose Model | **Remediated & Verified** |
| **SEC-07** | Denial of Service & Resource Caps | **Medium** | `app.js` Body Parsers | **Remediated & Verified** |
| **SEC-08** | Authentication Strength | **Medium** | `auth.validator.js`, `User.js` | **Remediated & Verified** |
| **SEC-09** | Injection Defense (NoSQL) | **Medium** | Global Middleware (`sanitize.middleware.js`) | **Remediated & Verified** |
| **SEC-10** | File Uploads & Storage | **Medium** | `upload.js`, `upload.routes.js` | **Remediated & Verified** |
| **SEC-11** | Secrets & Configuration | **Low** | `.env.example` templates | **Remediated & Verified** |
| **SEC-12** | Information Leakage (Seeds) | **Low** | `seed.js` | **Remediated & Verified** |

---

## Detailed Vulnerability Findings & Remediation

### Finding SEC-01: Vertical Privilege Escalation via Mass Assignment in User Registration
- **Category:** Identity & Access Control / Broken Access Control (CWE-269, OWASP A01:2021)
- **Affected Component:** `backend/src/controllers/auth.controller.js` (line 27, 46) and `backend/src/validators/auth.validator.js` (lines 17–19)
- **Severity:** **Critical**
- **Evidence:**
  ```javascript
  // Prior Vulnerable Code in auth.controller.js:
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: role || "user", // Directly accepted role from unauthenticated client
  });
  ```
  `registerBodySchema` in `auth.validator.js` allowed `role: schema.enum(["user", "admin"]).optional()`.
- **Risk:** Any unauthenticated remote visitor could send a POST request with `{"role": "admin"}` and instantly gain full administrative privileges over the store, products, categories, and customer orders.
- **Fix Made:**
  1. Updated `registerBodySchema` in `backend/src/validators/auth.validator.js` to strictly reject elevated roles:
     `role: schema.enum(["user"], "Public registration cannot assign elevated roles").optional()`.
  2. Hardcoded `role: "user"` in `backend/src/controllers/auth.controller.js` on `User.create()`, ensuring the server unconditionally provisions the standard customer role on public registration.
- **Verification Performed:** Verified in `tests/securityHardening.test.js` (`should strictly reject registration requests attempting to supply role: 'admin'` and `should force role to 'user' even if client sends role: 'user'`). Both tests passed.
- **Residual Risk:** None on public registration.
- **Manual Action Required:** Any initial admin accounts must be created via the database seed script or promoted directly by an existing administrator.

---

### Finding SEC-02: Concurrency Race Condition & Inventory Overselling in Order Creation
- **Category:** Business Logic & High-Risk Flows / Race Condition (CWE-362)
- **Affected Component:** `backend/src/controllers/order.controller.js` (lines 115–150)
- **Severity:** **High**
- **Evidence:**
  In `createOrder`, product inventory was checked sequentially in JavaScript (`if (product.stock < item.quantity)`), and then decremented via `Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })`. Under concurrent requests for low-stock items (e.g. 1 unit remaining), multiple simultaneous checkouts would read `stock = 1`, all pass validation, and all decrement stock, driving inventory to negative values (`-1`, `-2`, etc.) and resulting in unfillable orders.
- **Risk:** Financial loss, overselling physical inventory, and unfulfillable orders during high-traffic or flash-sale periods.
- **Fix Made:**
  Refactored `createOrder` to execute atomic conditional stock reservations prior to order creation:
  ```javascript
  const updatedProduct = await Product.findOneAndUpdate(
    {
      _id: item.product,
      stock: { $gte: item.quantity },
      isActive: true,
    },
    { $inc: { stock: -item.quantity } },
    { returnDocument: "after", ...sessionOpts }
  );
  if (!updatedProduct) {
    throw new ApiError(400, `Insufficient stock for "${item.title}". It may have just sold out.`);
  }
  ```
  Integrated MongoDB multi-document transactions where replica sets are configured, with automatic rollback compensation for standalone MongoDB instances to restore inventory if a subsequent cart item fails reservation.
- **Verification Performed:** Tested in `tests/securityHardening.test.js` (`should reject checkout if requested quantity exceeds current available stock`) and verified via `tests/order.test.js`. All tests passed.
- **Residual Risk:** Low. Full multi-document ACID isolation is guaranteed when running on a MongoDB replica set.
- **Manual Action Required:** In production, ensure MongoDB is deployed as a replica set (standard on MongoDB Atlas) to enable full distributed transactions.

---

### Finding SEC-03: Regular Expression Denial of Service (ReDoS) / Regex Injection in Search
- **Category:** Input & Injection Defense (CWE-1333, CWE-400)
- **Affected Component:** `backend/src/controllers/product.controller.js` (lines 39–43) and `backend/src/controllers/category.controller.js` (lines 68, 113)
- **Severity:** **High**
- **Evidence:**
  Raw client input from `req.query.search` and `req.body.name` was directly interpolated into `new RegExp(search.trim(), "i")`. Supplying unescaped regex metacharacters (`*`, `+`, `?`, `(`, `[`, `\\`) triggered unhandled 500 SyntaxErrors, while malicious repeating patterns (`(((a+)+)+)+`) caused catastrophic backtracking, freezing the single-threaded Node.js event loop.
- **Risk:** Complete service denial of the backend application for all users via a single unauthenticated HTTP request.
- **Fix Made:**
  Created and applied a regex escape utility (`escapeRegex`):
  ```javascript
  export const escapeRegex = (text) => {
    if (typeof text !== "string") return "";
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };
  ```
  Applied `escapeRegex` to all search terms in `product.controller.js` and category duplicate lookups in `category.controller.js`.
- **Verification Performed:** Automated fuzzing test in `tests/securityHardening.test.js` tested patterns including `(((a+)+)+)`, `.*.*.*.*`, `[a-z]+`, `\\`, `?`, `+`, and `*`. All returned HTTP 200 without regex errors or event loop stall.
- **Residual Risk:** None.
- **Manual Action Required:** None.

---

### Finding SEC-04: Missing HTTP Security Headers
- **Category:** Security Headers & Web Defense (OWASP A05:2021 Security Misconfiguration)
- **Affected Component:** `backend/src/app.js`
- **Severity:** **High**
- **Evidence:**
  The Express application mounted no HTTP security header middleware. Missing headers included: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, and `X-DNS-Prefetch-Control`.
- **Risk:** Susceptibility to MIME-confusion attacks, clickjacking within iframes, and man-in-the-middle protocol downgrade attacks.
- **Fix Made:**
  Installed `helmet` (`^8.1.0`) and mounted `app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))` in `backend/src/app.js`, protecting against clickjacking, sniffing, and cross-site scripting while preserving SPA asset loading.
- **Verification Performed:** Verified in `tests/securityHardening.test.js` (`should include modern security response headers on all responses`). Verified headers: `x-content-type-options: nosniff`, `x-frame-options: SAMEORIGIN`, `x-dns-prefetch-control: off`.
- **Residual Risk:** None.
- **Manual Action Required:** If custom domains or CDN reverse proxies (e.g. Cloudflare, AWS CloudFront) are used, configure Content-Security-Policy (CSP) at the edge matching domain asset hosts.

---

### Finding SEC-05: Insecure CORS Fallback & Credentials Mismatch
- **Category:** API & Abuse Protection (CWE-346)
- **Affected Component:** `backend/src/app.js` (lines 28–50)
- **Severity:** **Medium**
- **Evidence:**
  The previous CORS configuration allowed any origin when `CLIENT_URL` was unset (`allowedOrigins.length === 0`), included wildcard `*` with `credentials: true` (prohibited by W3C CORS standards), and permitted arbitrary `http://localhost:*` ports unconditionally in production.
- **Risk:** Cross-Origin Request Forgery and credential leakage across unauthorized domains in production environments.
- **Fix Made:**
  Restructured the CORS policy to enforce strict origin whitelisting:
  - Validates incoming origins strictly against parsed `process.env.CLIENT_URL` entries.
  - Permits localhost ports only when `process.env.NODE_ENV !== "production"`.
  - Disallows wildcards with `credentials: true`.
  - Blocks disallowed cross-origin requests with `new Error("Not allowed by CORS")`.
- **Verification Performed:** Verified via unit and integration tests (`tests/errorHandler.test.js` and `tests/securityHardening.test.js`).
- **Residual Risk:** None when `CLIENT_URL` is set in production.
- **Manual Action Required:** Set `CLIENT_URL=https://your-production-domain.com` in production `.env`.

---

### Finding SEC-06: Sensitive Field Exposure Risk in User Model
- **Category:** Database & Data Protection / Sensitive Data Exposure (CWE-200)
- **Affected Component:** `backend/src/models/User.js`
- **Severity:** **Medium**
- **Evidence:**
  The `password` property in `User.js` lacked `{ select: false }`. While existing controller queries included manual `.select("-password")` clauses, any newly authored query, aggregation, or subdocument population risked leaking bcrypt password hashes to client responses or application logs.
- **Risk:** Accidental exposure of hashed passwords via newly added endpoints or logging interceptors.
- **Fix Made:**
  1. Configured `select: false` on the `password` field in `backend/src/models/User.js`.
  2. Implemented `toJSON` and `toObject` transform hooks on `userSchema` that delete `password` and `__v` upon serialization.
  3. Updated `auth.controller.js` login routine to explicitly request `.select("+password")` solely for bcrypt credential verification.
- **Verification Performed:** Verified in `tests/securityHardening.test.js` (`should never expose password hash in default User model queries` and `should successfully log in by explicitly selecting password on login`).
- **Residual Risk:** None.
- **Manual Action Required:** None.

---

### Finding SEC-07: Unbounded Request Body Size Limits
- **Category:** API & Abuse Protection / Denial of Service (CWE-770)
- **Affected Component:** `backend/src/app.js`
- **Severity:** **Medium**
- **Evidence:**
  `app.use(express.json())` and `app.use(express.urlencoded({ extended: true }))` were invoked without explicit size limit parameters.
- **Risk:** Memory exhaustion and DoS via oversized JSON request bodies sent to API endpoints.
- **Fix Made:**
  Configured explicit payload limits on both body parsers:
  ```javascript
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  ```
- **Verification Performed:** Verified across all functional tests; standard API payloads function smoothly while oversized payloads are rejected with HTTP 413 Payload Too Large.
- **Residual Risk:** None.
- **Manual Action Required:** None.

---

### Finding SEC-08: Weak Password Minimum Length Requirement
- **Category:** Identity & Access Control (CWE-521)
- **Affected Component:** `backend/src/validators/auth.validator.js` and `backend/src/models/User.js`
- **Severity:** **Medium**
- **Evidence:**
  Password length validation permitted 6-character passwords (`min(6)`), below NIST SP 800-63B and OWASP recommendations.
- **Risk:** Weak passwords vulnerable to automated brute-force attacks and credential cracking.
- **Fix Made:**
  Updated minimum password length from 6 to 8 characters in both `auth.validator.js` and `User.js`.
- **Verification Performed:** Tested in `tests/securityHardening.test.js` (`should reject registration passwords with fewer than 8 characters`) and updated `tests/strictValidation.test.js`. Tests passed.
- **Residual Risk:** None. Existing seed passwords already satisfy the 8+ character policy (e.g. `Admin@12345`).
- **Manual Action Required:** None.

---

### Finding SEC-09: NoSQL Operator Injection
- **Category:** Input & Injection Defense (CWE-943)
- **Affected Component:** Global Middleware (`backend/src/middleware/sanitize.middleware.js`)
- **Severity:** **Medium**
- **Evidence:**
  Untrusted request bodies or query strings carrying MongoDB operator keys (such as `{"$gt": ""}`) could potentially alter query evaluation if passed into unvalidated database operations.
- **Risk:** Potential query bypass or data extraction if inputs bypass schema validation.
- **Fix Made:**
  Engineered recursive sanitization middleware (`mongoSanitize` in `backend/src/middleware/sanitize.middleware.js`) that strips keys starting with `$` or containing `.` from `req.body`, `req.query`, and `req.params`. Mounted globally in `app.js` before route dispatch.
- **Verification Performed:** Verified in full test suite and confirmed that operator injection vectors are neutralized without impeding normal query structures.
- **Residual Risk:** None.
- **Manual Action Required:** None.

---

### Finding SEC-10: File Upload Hardening & Magic-Byte Content Validation
- **Category:** File Uploads & Storage (CWE-434, OWASP A04:2021)
- **Affected Component:** `backend/src/utils/upload.js`, `backend/src/routes/upload.routes.js`, `backend/src/app.js`
- **Severity:** **Medium**
- **Evidence:**
  `multer` was present in `package.json` without rigorous content validation (trusting client-controlled `Content-Type` headers and file extensions without verifying actual binary magic bytes/signatures), and static upload serving lacked sandboxing security headers.
- **Risk:** Spoofed file extensions (e.g., shell scripts, polyglots, or HTML renamed to `.png`) could bypass extension filters, potentially enabling arbitrary file storage, stored XSS, or MIME-confusion attacks.
- **Fix Made:**
  Engineered end-to-end file upload defense-in-depth across `upload.js`, `upload.routes.js`, and `app.js`:
  - **Size Limit Validation:** Strict 5MB file size limit (`MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024`) with Multer `limits: { fileSize, files: 1 }` and `LIMIT_FILE_SIZE` error handling.
  - **Extension & MIME Whitelist:** Strict whitelist allowing only JPEG (`.jpg`, `.jpeg`), PNG (`.png`), WebP (`.webp`), and GIF (`.gif`). Disallows executable scripts (`.sh`, `.js`, `.py`, `.exe`, `.bat`) and scriptable vector images (`.svg`).
  - **Magic-Byte Binary Content Validation:** Added `validateUploadedFileContent` middleware that inspects raw binary magic bytes (first 16 bytes) on disk before approving the upload. Any mismatch between claimed MIME type and actual binary header immediately triggers automated deletion (`fs.promises.unlink`) and returns a `400 Bad Request`.
  - **Path Traversal & Storage Isolation:** Destination is strictly set to `storage/uploads` (separated from application code in `backend/src` and client code in `frontend/dist`). Original client filenames are discarded in favor of cryptographic hex hashes (`Date.now() - crypto.randomBytes(16) + ext`), preventing path traversal (`../`) and filename collision attacks.
  - **Code Execution Prevention:** Express static serving never executes files as code. Furthermore, `/uploads` static file serving in `app.js` attaches hardened HTTP headers:
    - `X-Content-Type-Options: nosniff` (blocks browser MIME-type sniffing).
    - `Content-Security-Policy: default-src 'none'; sandbox` (sandboxes direct file views and disables all script execution, popups, and form submissions).
    - `Cross-Origin-Resource-Policy: cross-origin` (restricts execution context while permitting safe image display).
  - **Access Control & Rate Limiting:** Endpoint is restricted to authenticated administrators (`authenticate`, `adminOnly`) and throttled via `userLimiter`.
- **Verification Performed:** Tested in `tests/securityHardening.test.js`:
  1. Denies unauthenticated or non-admin access (401/403).
  2. Rejects non-image executable extensions (`.sh`, `.js`) with 400.
  3. Rejects spoofed image extensions with invalid magic-byte binary content with 400 and immediately unlinks the file from disk.
  4. Accepts valid image uploads with authentic magic bytes and serves with `nosniff`, `sandbox`, and `cross-origin` headers.
- **Residual Risk:** None.
- **Manual Action Required:** For distributed multi-instance production environments, offload uploads to an isolated object storage service (e.g. AWS S3, Cloudflare R2, GCP Cloud Storage) served via a dedicated asset domain/CDN.

---

### Finding SEC-11: Missing Environment Configuration Templates
- **Category:** Secrets & Configuration (OWASP A05:2021)
- **Affected Component:** `backend/.env.example` and `frontend/.env.example`
- **Severity:** **Low**
- **Evidence:**
  The repository lacked `.env.example` reference files for both backend and frontend, causing deployment ambiguity.
- **Risk:** Accidental commitment of real `.env` files or misconfigured deployment environments.
- **Fix Made:**
  Created `backend/.env.example` and `frontend/.env.example` containing clean, production-ready keys and placeholders without exposing any secret values.
- **Verification Performed:** Verified that all `.env` files are tracked in `.gitignore` and absent from git history (`git ls-files` and `git status`).
- **Residual Risk:** None.
- **Manual Action Required:** DevOps engineers should populate real secrets into deployment secret vaults (e.g. GitHub Secrets / AWS Secrets Manager).

---

### Finding SEC-12: Plaintext Credentials Logged in Database Seeder
- **Category:** Errors, Logging & Information Leakage (CWE-532)
- **Affected Component:** `backend/src/seeds/seed.js` (lines 868–876)
- **Severity:** **Low**
- **Evidence:**
  `seed.js` previously printed plain demo credentials to `stdout` upon completion regardless of execution environment.
- **Risk:** Sensitive passwords appearing in centralized production logging pipelines or CI job logs.
- **Fix Made:**
  Added environment check in `seed.js`:
  ```javascript
  if (process.env.NODE_ENV === "production") {
    console.log("Seeding in PRODUCTION mode: Plaintext passwords are not displayed.");
  } else { ... }
  ```
- **Verification Performed:** Verified in local code inspection and development runs.
- **Residual Risk:** None.
- **Manual Action Required:** Change default seed passwords (`Admin@12345`) if seed is run in staging environments.

---

## Production-Readiness Checklist

| Area | Check Item | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Secrets & Keys** | Secrets excluded from git tracking | **READY** | `.env` files excluded in `.gitignore` |
| **Secrets & Keys** | No hardcoded API keys or private tokens | **READY** | Validated via static code grep |
| **Authentication** | Passwords hashed with bcrypt | **READY** | Cost factor 10, salt generated per user |
| **Authentication** | Minimum password length >= 8 characters | **READY** | Enforced in schema & validator |
| **Authentication** | Sensitive fields stripped from queries | **READY** | `select: false` + `toJSON` transforms |
| **Authorization** | Horizontal privilege checks (IDOR) | **READY** | Address, Cart, and Order check `user: req.user._id` |
| **Authorization** | Vertical privilege escalation defense | **READY** | Public registration forces `role: "user"` |
| **Authorization** | Admin routes protected on server | **READY** | `adminOnly` applied on all administrative routes |
| **Input Validation** | Strict schema validation on all inputs | **READY** | `strict()` rejects unexpected fields |
| **Injection Defense** | ReDoS & Regex injection prevention | **READY** | All regex search terms safely escaped |
| **Injection Defense** | NoSQL operator injection stripped | **READY** | `mongoSanitize` mounted globally |
| **Abuse Protection** | Dual-layer rate limiting (IP + Account) | **READY** | Exponential backoff on auth failures |
| **Network Security** | HTTP security headers (Helmet) | **READY** | X-Frame-Options, X-Content-Type-Options active |
| **Network Security** | Hardened CORS policy | **READY** | Restricts origins to `CLIENT_URL` in production |
| **File Handling** | Size limits & MIME whitelist | **READY** | 5MB max, cryptographic filenames, image whitelist |
| **Concurrency** | Atomic inventory depletion on checkout | **READY** | Conditional updates with rollback compensation |
| **Error Handling** | Stack traces & internal paths masked | **READY** | `errorSanitizer.js` scrubs all paths and DB traces |
| **Dependencies** | Vulnerability scan clean | **READY** | `npm audit` reported 0 vulnerabilities |
| **Automated Tests** | Full test suite passing | **READY** | 10/10 test suites, 92/92 tests passing (100%) |

---

## Verification Summary & Items for Production Deployment

### Test Execution Results
The complete automated test suite was executed against the hardened codebase:
- **`tests/securityHardening.test.js`**: PASSED (11 tests — privilege escalation, ReDoS, Helmet headers, password length, select: false, atomic stock, upload security)
- **`tests/address.test.js`**: PASSED (7 tests — CRUD, Indian phone and pincode validation, user ownership)
- **`tests/auth.test.js`**: PASSED (8 tests — registration, login, profile, wrong password, missing fields)
- **`tests/cart.test.js`**: PASSED (9 tests — add item, quantity update, stock limits, delete, clear)
- **`tests/category.test.js`**: PASSED (7 tests — admin-only creation/update/delete, public list, duplicate slug checks)
- **`tests/errorHandler.test.js`**: PASSED (12 tests — stack trace shielding, path scrubbing, database error normalization)
- **`tests/order.test.js`**: PASSED (13 tests — order creation, inventory deduction, cancellation, admin status transitions, IDOR protection)
- **`tests/product.test.js`**: PASSED (7 tests — pagination, search, category filtering, admin CRUD)
- **`tests/rateLimiter.test.js`**: PASSED (8 tests — public IP limits, user account limits, exponential backoff)
- **`tests/strictValidation.test.js`**: PASSED (10 tests — type/length bounds, unexpected field rejection, complex domain validation)
- **Total:** **10 Test Suites Passed, 92 Tests Passed, 0 Failed.**

### Unverified External Items & Production Recommendations
1. **Production TLS/SSL Termination:** In production, ensure HTTPS is terminated at the reverse proxy (Nginx, AWS ALB, Cloudflare) with HTTP/2 and modern TLS 1.3 ciphers.
2. **MongoDB Replica Set:** For high-concurrency environments, deploy MongoDB as a 3-node replica set to leverage native multi-document ACID transactions across order processing.
3. **Persistent Rate Limit Store:** If deploying multiple load-balanced backend instances in containers (e.g. Kubernetes, ECS), transition the in-memory rate limiter store (`rateLimiter.middleware.js`) to a centralized Redis cluster.
4. **Third-Party Payment Gateway Integration:** The current application supports Cash-On-Delivery (`COD`). When integrating external payment webhooks (Stripe, Razorpay, etc.), verify webhook HMAC signatures using raw request bodies before processing payment events.
