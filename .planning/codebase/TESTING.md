# Testing Architecture & Verification Guide

**Application:** EzzyShop Fullstack MERN Application  
**Current Test Coverage:** 13 Backend Test Files / 100+ Automated Integration & Security Tests

---

## 1. Backend Testing Stack

- **Runner & Assertion Library:** Jest `^30.4.2`
- **HTTP Integration Assertions:** Supertest `^7.2.2`
- **ESM Execution Environment:** `cross-env NODE_OPTIONS=--experimental-vm-modules`
- **Configuration:** `backend/jest.config.js`
  ```javascript
  export default {
    testEnvironment: "node",
    transform: {},
    testMatch: ["**/tests/**/*.test.js"],
    verbose: true,
    testTimeout: 30000,
  };
  ```

---

## 2. Test Execution Commands

From the repository root or backend workspace:

| Target | Command | Notes |
| :--- | :--- | :--- |
| **All Backend Tests (Root)** | `npm run test` | Proxies to backend test script |
| **Direct Backend Execution** | `npm run test --prefix backend` | Executes Jest directly in `backend/` |
| **Run Single Suite** | `npm test --prefix backend -- tests/auth.test.js` | Runs isolated test file |
| **Verbose Open Handle Check** | `cross-env NODE_OPTIONS=--experimental-vm-modules jest --runInBand --detectOpenHandles --forceExit` | Ensures no leaking MongoDB handles |

---

## 3. Test Suites Inventory (`backend/tests/`)

| Test File | Target Module | Scope & Verification Coverage |
| :--- | :--- | :--- |
| `setup.js` | Global Test Lifecycle | Database connection pooling, rate limit store cache clearing (`rateLimitStore.resetAll()`), global timeouts. |
| `auth.test.js` | `auth.controller.js` | Registration validation, duplicate email detection, valid/invalid credentials login, JWT token issuance. |
| `securityHardening.test.js` | Full Stack Defense | Privilege escalation rejection on registration (`role: 'admin'`), inventory race condition concurrency, regex injection immunity, security headers. |
| `strictValidation.test.js` | `validators/schema.js` | Stripping unknown fields, type casting rejection, string length constraints, regex pattern enforcement. |
| `rateLimiter.test.js` | `rateLimiter.middleware.js`| Sliding window thresholds, IP rate limit triggers, exponential backoff delays, account attempt counters. |
| `master.test.js` | `master.controller.js` | Dedicated master login, operational admin creation, admin suspension, audit log querying, catalog tampering blockage. |
| `product.test.js` | `product.controller.js` | Product creation, image association, paginated catalog retrieval, category filtering, text search. |
| `category.test.js` | `category.controller.js`| Category slug generation, duplicate slug protection, category updates. |
| `cart.test.js` | `cart.controller.js` | Adding products to cart, quantity increments, stock bounds checking, cart clearance. |
| `address.test.js` | `address.controller.js`| Indian phone and pincode regex validation, default address toggling, CRUD operations. |
| `order.test.js` | `order.controller.js` | Atomic stock reservation, checkout calculation, order status lifecycle, cancellation & inventory restoration. |
| `errorHandler.test.js` | `error.middleware.js` | Operational `ApiError` status mapping, production error masking, unhandled exception formatting. |
| `health.test.js` | `health.controller.js` | MongoDB connectivity checks, ping endpoints at `/health` and `/api/v1/health`. |

---

## 4. Test Lifecycle & Harness Pattern

All backend integration test suites follow the standardized harness pattern defined in `tests/setup.js`:

```javascript
import { connectTestDB, closeTestDB } from "./setup.js";
import supertest from "supertest";
import app from "../src/app.js";

const request = supertest(app);

describe("Resource API Integration", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  it("should perform expected action", async () => {
    const response = await request
      .post("/api/v1/resource")
      .send({ ... });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 5. Frontend Testing Status & Quality Strategy

### 5.1 Current Frontend State
- **Automated Unit / Component Tests:** Currently not configured (no Vitest or React Testing Library scripts in `frontend/package.json`).
- **Static Code Analysis:** ESLint 10 configured with React Hooks and React Refresh rules (`npm run lint --prefix frontend`).
- **Build Verification:** Vite production bundling (`npm run build --prefix frontend`) acts as a compile-time syntax and asset integrity check.

### 5.2 Recommended Testing Roadmap for Frontend
1. **Vitest + React Testing Library:** Setup `vitest` and `@testing-library/react` for unit testing Zustand stores (`auth.store.js`, `cart.store.js`) and UI components (`ProductCard.jsx`, `Button.jsx`).
2. **Playwright / Cypress:** End-to-end browser test suite simulating customer registration, product search, cart addition, and checkout.
