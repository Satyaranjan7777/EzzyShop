# Integrations & External Systems

**Application:** EzzyShop  
**Scope:** External services, database connections, API specifications, authentication flows, environment variable schemas, and cross-subsystem contracts.

---

## 1. Database & Persistence Integration

### 1.1 MongoDB via Mongoose
- **Protocol:** `mongodb://` or `mongodb+srv://` (MongoDB Atlas or standalone instance).
- **Connector Module:** `backend/src/config/db.js`
- **Connection Lifecycle:**
  - Instantiated synchronously on server bootstrap (`backend/server.js`) via `connectDB()`.
  - Process terminates immediately (`process.exit(1)`) on initial connection failure.
  - Handled via `mongoose.connection` in test harnesses (`backend/tests/setup.js`).
- **Mongoose Configuration Highlights:**
  - Strict document schema definitions with field transforms (`delete ret.password; delete ret.__v`).
  - Text indexes configured for product title and description search.
  - Compound indexes on audit logs (`ActivityLog.js`) for optimized administrative queries.
  - Atomic transactions / atomic conditional mutations used for inventory decrements (`stock: { $gte: quantity }`).

---

## 2. API Protocols & Routing Architecture

### 2.1 Base URL & Namespaces
- **API Prefix:** `/api/v1`
- **Health Check Endpoints:**
  - `GET /health` (Top-level)
  - `GET /api/v1/health` (API namespace)
- **Response Format:** Standardized JSON envelope:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Operation completed successfully",
    "data": { ... }
  }
  ```

### 2.2 Endpoint Map by Resource

| Namespace | Path | Method | Auth / Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/v1/auth/register` | `POST` | Public | Registers customer (strictly assigns `role: "user"`). |
| | `/api/v1/auth/login` | `POST` | Public | Customer & Admin login with credentials. Returns JWT. |
| | `/api/v1/auth/me` | `GET` | Authenticated | Retrieves profile of currently authenticated user. |
| | `/api/v1/auth/profile` | `PUT` | Authenticated | Updates customer name, email, or password. |
| **Master** | `/api/v1/master/login` | `POST` | Public | Dedicated Master login; rejects non-master users. |
| | `/api/v1/master/overview` | `GET` | Master | High-level metrics: total revenue, order count, admins, logs. |
| | `/api/v1/master/admins` | `GET` | Master | Lists operational admin accounts. |
| | `/api/v1/master/admins` | `POST` | Master | Provisions a new operational admin account. |
| | `/api/v1/master/admins/:id` | `GET` | Master | Inspects specific admin details. |
| | `/api/v1/master/admins/:id` | `PUT` | Master | Updates admin name, email, password, or active status. |
| | `/api/v1/master/admins/:id` | `DELETE` | Master | Deletes an admin account. |
| | `/api/v1/master/activities` | `GET` | Master | Global admin activity audit logs with pagination & filters. |
| | `/api/v1/master/admins/:id/activities` | `GET` | Master | Audit logs specific to an individual admin. |
| **Products** | `/api/v1/products` | `GET` | Public | Paginated product browsing with filters (search, category, sort, price). |
| | `/api/v1/products/:id` | `GET` | Public | Single product details with slug or ID resolution. |
| | `/api/v1/products` | `POST` | Admin Only | Creates product with image assets, category, and inventory. |
| | `/api/v1/products/:id` | `PUT` | Admin Only | Updates product properties or stock. |
| | `/api/v1/products/:id` | `DELETE` | Admin Only | Deletes product from catalog. |
| **Categories**| `/api/v1/categories` | `GET` | Public | Lists all active categories. |
| | `/api/v1/categories` | `POST` | Admin Only | Creates new category with auto-generated slug. |
| | `/api/v1/categories/:id` | `PUT` | Admin Only | Renames or updates category status. |
| | `/api/v1/categories/:id` | `DELETE` | Admin Only | Deletes category (verifies orphaned products). |
| **Cart** | `/api/v1/cart` | `GET` | Authenticated | Retrieves current user cart with computed subtotals. |
| | `/api/v1/cart/items` | `POST` | Authenticated | Adds product to cart with requested quantity. |
| | `/api/v1/cart/items/:id` | `PUT` | Authenticated | Updates quantity of specific item in cart. |
| | `/api/v1/cart/items/:id` | `DELETE` | Authenticated | Removes item from cart. |
| | `/api/v1/cart/clear` | `DELETE` | Authenticated | Empties user cart entirely. |
| **Addresses** | `/api/v1/addresses` | `GET` | Authenticated | Lists saved delivery addresses for authenticated customer. |
| | `/api/v1/addresses` | `POST` | Authenticated | Adds new delivery address with Indian phone/pincode validation. |
| | `/api/v1/addresses/:id` | `PUT` | Authenticated | Edits saved address. |
| | `/api/v1/addresses/:id` | `DELETE` | Authenticated | Removes delivery address. |
| | `/api/v1/addresses/:id/default`| `PATCH` | Authenticated | Sets designated address as primary default. |
| **Orders** | `/api/v1/orders` | `POST` | Authenticated | Atomic checkout; checks and reserves stock; creates order. |
| | `/api/v1/orders/my-orders`| `GET` | Authenticated | Lists orders placed by authenticated customer. |
| | `/api/v1/orders/:id` | `GET` | Authenticated | Order details (restricted to order owner or admin). |
| | `/api/v1/orders/:id/cancel`| `PATCH` | Authenticated | Customer or Admin cancellation with reason and stock restock. |
| | `/api/v1/orders` | `GET` | Admin / Master| Full platform order list with status filters & search. |
| | `/api/v1/orders/:id/status`| `PATCH` | Admin Only | Advances order status (`confirmed` -> `processing` -> `shipped` -> `delivered`). |
| **Uploads** | `/api/v1/upload` | `POST` | Admin Only | Single/multi image uploads (JPEG/PNG/WEBP/GIF up to 5MB). |

---

## 3. Authentication & Authorization Contract

### 3.1 Token Transmission
- **Bearer Token Pattern:** Clients send `Authorization: Bearer <JWT_STRING>` header on authenticated requests.
- **Client Storage Mechanism:** Stored in browser `sessionStorage` (`TOKEN_STORAGE_KEY = "ezzyshop_auth_token"`).
  - Isolates session across tabs and prevents cross-tab hijacking.
  - Automatically cleared on 401 response status via Axios response interceptor (`frontend/src/api/axios.js`).

### 3.2 Role Hierarchy & Enterprise Separation of Duties
1. `user` (Customer): Standard storefront customer. Can only view and mutate their own cart, orders, and addresses.
2. `admin` (Operational Admin): Manages day-to-day operations (products, categories, order statuses). All operational actions trigger audit logs in `ActivityLog`.
3. `master` (Super / Governance Admin):
   - Created initially via `backend/src/seeds/seedMaster.js`.
   - Has exclusive authority to provision, update, suspend, or delete operational admins.
   - Has exclusive authority to inspect the system-wide `ActivityLog`.
   - **Enterprise Boundary:** Strictly prohibited from mutating products, stock, or pricing (`forbidMasterCatalogModification` middleware).

---

## 4. File Storage & Upload Integration

- **Storage Provider:** Local filesystem directory (`backend/storage/uploads`).
- **Static Exposure:** Express static route `/uploads` with sandboxing headers:
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy: default-src 'none'; sandbox`
  - `Cross-Origin-Resource-Policy: cross-origin`
- **Upload Constraints:**
  - Max file size: 5 MB (`MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024`).
  - Whitelisted MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
  - Cryptographic collision-resistant filenames generated via `crypto.randomBytes(16)`.

---

## 5. Payments Integration

- **Current Implementation:** Cash on Delivery (COD) workflow.
- **Schema Representation:**
  - `Order.payment.method`: `"COD"`
  - `Order.payment.status`: `"pending"` | `"completed"` | `"failed"`
- **Extensibility:** The order schema and checkout flow are structured with an explicit `pricing` breakdown (`subtotal`, `shippingFee`, `total`) and `payment` sub-document, ready for external gateway integration (Stripe, Razorpay, PayPal).

---

## 6. Environment Configuration Contract

### 6.1 Backend Environment Variables (`backend/.env`)

| Variable | Type | Required | Default | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Number | No | `5001` | HTTP listening port for Express. |
| `NODE_ENV` | String | No | `"development"` | Environment flag (`development`, `production`, `test`). |
| `MONGO_URI` | String | **Yes** | — | MongoDB connection string. Server exits if missing. |
| `JWT_SECRET` | String | **Yes** | — | Secret key used for signing JWT tokens. Exits if missing. |
| `JWT_EXPIRE` | String | No | `"7d"` | Expiration window for issued tokens. |
| `CLIENT_URL` | String | No | `""` | Comma-separated CORS allowed origins for frontend. |
| `TRUST_PROXY` | Number/Boolean | No | `1` | Reverse proxy trust level for accurate IP parsing. |
| `RATE_LIMIT_ENABLED` | Boolean | No | `true` | Global switch to enable/disable rate limiting. |
| `RATE_LIMIT_AUTH_WINDOW_MS` | Number | No | `900000` (15m) | Window for authentication attempts tracking. |
| `RATE_LIMIT_AUTH_IP_MAX` | Number | No | `10` | Max auth attempts per IP before backoff. |
| `RATE_LIMIT_AUTH_ACCOUNT_MAX` | Number | No | `5` | Max auth attempts per email account before backoff. |

### 6.2 Frontend Environment Variables (`frontend/.env`)

| Variable | Type | Required | Default | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | String | No | `"/api/v1"` | Base URL prefix for Axios HTTP requests. |
