# Code Conventions & Style Guide

**Application:** EzzyShop  
**Scope:** Backend and Frontend development patterns, formatting rules, error-handling contracts, naming standards, and architectural conventions.

---

## 1. General Principles & Module System

- **Native ES Modules (ESM):** All code uses standard `import` and `export` statements (`"type": "module"` in `package.json`). CommonJS (`require()`, `module.exports`) is strictly avoided.
- **Asynchronous Code:** Prefer modern `async`/`await` over raw promise chains (`.then()`, `.catch()`).
- **Defensive Programming:** Avoid silent failures; validate all external boundaries (network inputs, environment variables, user payloads).

---

## 2. Naming Conventions

### 2.1 File & Directory Names

| Category | Convention | Examples |
| :--- | :--- | :--- |
| **Backend Controllers** | `[resource].controller.js` | `auth.controller.js`, `order.controller.js` |
| **Backend Routes** | `[resource].routes.js` | `product.routes.js`, `master.routes.js` |
| **Backend Middleware** | `[name].middleware.js` | `auth.middleware.js`, `rateLimiter.middleware.js` |
| **Backend Models** | PascalCase `[Model].js` | `User.js`, `Order.js`, `ActivityLog.js` |
| **Backend Validators** | `[resource].validator.js` | `order.validator.js`, `product.validator.js` |
| **Frontend Components** | PascalCase `[Name].jsx` | `ProductCard.jsx`, `AdminSidebar.jsx` |
| **Frontend Pages** | PascalCase `[Page].jsx` | `Dashboard.jsx`, `ProductDetails.jsx` |
| **Frontend Services** | `[resource].service.js` | `cart.service.js`, `master.service.js` |
| **Frontend Stores** | `[name].store.js` | `auth.store.js`, `cart.store.js` |
| **Frontend Hooks** | `use[Name].js` | `useAuth.js`, `useAdminOrderPolling.js` |
| **Utility Modules** | camelCase `[name].js` | `formatCurrency.js`, `helpers.js`, `activityLogger.js` |

### 2.2 Variables & Identifiers

- **Components & Classes:** PascalCase (`ProductCard`, `ApiError`, `BaseSchema`).
- **Functions, Methods, Variables:** camelCase (`createOrder`, `fetchCart`, `subtotal`).
- **Constants & Enums:** UPPER_SNAKE_CASE (`ORDER_STATUS`, `MAX_FILE_SIZE_BYTES`, `TOKEN_STORAGE_KEY`).
- **React Custom Hooks:** Prefix with `use` (`useAuth`, `useCartStore`).

---

## 3. Backend Conventions

### 3.1 Controller Signature & Error Propagation

Controllers do not implement redundant `try { ... } catch (err)` blocks if wrapped in `asyncHandler`. Unhandled errors automatically bubble to `errorHandler.middleware.js`.

```javascript
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return res.status(200).json(
    new ApiResponse(200, product, "Product retrieved successfully")
  );
});
```

### 3.2 Response & Error Envelope Contract

All successful backend responses strictly return an instance of `ApiResponse`:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

All failed responses return a standardized error payload via `error.middleware.js`:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error: Field 'title' is required",
  "errors": ["Field 'title' is required"]
}
```
*(In production, internal error messages and stack traces are masked to prevent information leakage).*

### 3.3 Strict Schema Validation Pattern

All incoming requests with bodies, query parameters, or route identifiers must pass through `backend/src/middleware/validate.middleware.js` using `backend/src/validators/schema.js`:

```javascript
import schema from "./schema.js";

export const createProductSchema = schema.object({
  title: schema.string().min(2).max(200).trim(),
  price: schema.number().positive(),
  stock: schema.number().int().min(0),
  category: schema.objectId(),
}).strict(); // Rejects unknown properties to eliminate mass-assignment
```

---

## 4. Frontend Conventions

### 4.1 Component Structure

1. React imports & library hooks.
2. Icons & external components.
3. Internal child components & custom hooks.
4. Services & Zustand store selectors.
5. Component definition:
   - State hooks (`useState`, `useRef`).
   - Store selectors (`useAuthStore((state) => state.user)`).
   - Effects (`useEffect`).
   - Action / Event handlers.
   - JSX return statement.
6. Export statement (`export default ComponentName;`).

### 4.2 State Store Conventions (Zustand)

- Place stores in `src/store/`.
- Provide atomic selectors in components to prevent unnecessary re-renders:
  ```javascript
  // Good: Selects only needed primitive
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Avoid: Subscribes to the entire store object
  const authState = useAuthStore();
  ```
- Use `react-hot-toast` for user notifications directly in store actions or component handlers.

### 4.3 Form Validation Pattern

- Use `react-hook-form` connected with `zod` via `@hookform/resolvers/zod`:
  ```javascript
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";

  const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });
  ```

---

## 5. Security & Authorization Conventions

1. **Role Verification:** Always enforce role authorization at both the API level (`role.middleware.js`) and UI level (`ProtectedRoute.jsx`, `AdminRoute.jsx`, `MasterRoute.jsx`).
2. **Master Account Isolation:** Master accounts are strictly supervisory; never grant Master accounts access to product catalog modification routes.
3. **Session Storage Isolation:** Authentication tokens must be saved in `sessionStorage` (`TOKEN_STORAGE_KEY`) rather than `localStorage` to enforce tab-level session boundaries.
