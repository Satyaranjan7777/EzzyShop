# Production-Style MERN E-Commerce Backend

A modular, scalable, and secure RESTful API backend for an E-Commerce platform built with **Node.js, Express.js, MongoDB, and Mongoose**.

---

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs (password hashing)
- **CORS**: Cross-Origin Resource Sharing
- **Environment**: dotenv

---

## Features

- **Clean Modular Architecture**: Separation of concerns across Config, Models, Controllers, Routes, Middleware, Validators, and Utilities.
- **Robust Security**:
  - Secure password hashing using `bcryptjs`.
  - Stateless authentication with JWT Bearer tokens.
  - Role-based authorization (`user` vs `admin`).
  - Strict ownership checks on carts, addresses, and orders.
- **Category & Product Management**:
  - Public browsing and search by title/description.
  - Category filtering, dynamic sorting, and safe pagination.
  - Admin-only CRUD operations.
- **Cart System**:
  - Real-time stock validation.
  - Dynamic price calculations on the backend (never trusting frontend prices).
- **Address Management**:
  - Multi-address support with default address auto-management.
- **Secure Order Flow**:
  - Cart-to-order conversion with snapshot preservation of prices, titles, and images.
  - Automatic stock reduction on checkout and stock restoration on cancellation.
  - Cash on Delivery (COD) workflow with status tracking.
- **Standardized API Responses & Error Handling**:
  - Consistent response structure for success, errors, and pagination.
  - Centralized global error handling with validation and Mongoose error handling.

---

## Project Structure

```text
backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.js                 # MongoDB connection logic
│   │   └── rateLimit.config.js   # Configurable rate limiting thresholds
│   │
│   ├── controllers/
│   │   ├── auth.controller.js     # User registration, login, and profile
│   │   ├── product.controller.js  # Product listing, search, and CRUD
│   │   ├── category.controller.js # Category management
│   │   ├── cart.controller.js     # Shopping cart operations
│   │   ├── address.controller.js  # User shipping address management
│   │   ├── order.controller.js    # Checkout & order processing
│   │   └── health.controller.js   # System diagnostics & DB connectivity check
│   │
│   ├── models/
│   │   ├── User.js                # User schema & password comparison
│   │   ├── Product.js             # Product schema & search indexing
│   │   ├── Category.js            # Category schema with slug generation
│   │   ├── Cart.js                # User shopping cart schema
│   │   ├── Address.js             # Shipping address schema
│   │   └── Order.js               # Order & snapshot schema
│   │
│   ├── routes/
│   │   ├── auth.routes.js         # /api/v1/auth
│   │   ├── product.routes.js      # /api/v1/products
│   │   ├── category.routes.js     # /api/v1/categories
│   │   ├── cart.routes.js         # /api/v1/cart
│   │   ├── address.routes.js      # /api/v1/addresses
│   │   ├── order.routes.js        # /api/v1/orders
│   │   └── health.routes.js       # /health & /api/v1/health
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verification & req.user attachment
│   │   ├── rateLimiter.middleware.js # Multi-tier rate limiting with exponential backoff
│   │   ├── role.middleware.js     # Role authorization (e.g. adminOnly)
│   │   ├── validate.middleware.js # Request validation middleware
│   │   ├── error.middleware.js    # Global error handler
│   │   └── notFound.middleware.js # 404 handler
│   │
│   ├── validators/
│   │   ├── schema.js              # Strict schema engine (type, length, format & reject unknown)
│   │   ├── common.validator.js    # Shared parameter & query validators (e.g. ObjectId)
│   │   ├── auth.validator.js      # Auth request validation
│   │   ├── product.validator.js   # Product request validation
│   │   ├── category.validator.js  # Category request validation
│   │   ├── cart.validator.js      # Cart request validation
│   │   ├── address.validator.js   # Address request validation
│   │   └── order.validator.js     # Order request validation
│   │
│   ├── utils/
│   │   ├── ApiError.js            # Custom error class
│   │   ├── ApiResponse.js         # Standard response formatter
│   │   └── asyncHandler.js        # Async error wrapper
│   │
│   └── app.js                     # Express application configuration
│
├── server.js                      # Server startup & DB connection
├── .env                           # Environment variables (git-ignored)
├── .env.example                   # Example environment template
├── .gitignore                     # Git ignore rules
├── package.json                   # Project metadata & dependencies
└── README.md                      # Documentation
```

---

## Installation & Setup

### 1. Clone the repository and navigate to `backend`:

```bash
cd backend
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Setup Environment Variables:

Create a `.env` file in the `backend/` root directory (copy from `.env.example`):

```env
PORT=5001
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 4. Start the server:

- **Development Mode (with auto-restart)**:
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

---

## Authentication & Authorization

All protected endpoints require an `Authorization` header with a valid JWT token:

```http
Authorization: Bearer <your_jwt_token>
```

### Setting up the Master & Admin Users:

1. **Seed the Master Account**:
   Run the master seed command to create the master administrator:
   ```bash
   npm run seed:master
   ```
   - **Master Email**: `satyaranjan@gmail.com`
   - **Master Password**: `Master@2026`

2. **Admin Provisioning**:
   - Public registration (`/auth/register`) only creates standard customer (`user`) accounts. Users **cannot** register as admin.
   - Only the **Master Account** can create, activate, deactivate, and delete administrators via `POST /api/v1/master/admins` or through the Master Console UI at `/master/login`.

---

## Standard API Response Formats

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Paginated Response:
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description message"
}
```

---

## API Endpoints Reference

Base URL: `http://localhost:5001/api/v1`

### Health Check & System Diagnostics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Full system, uptime, and MongoDB connectivity status |
| `GET` | `/api/v1/health` | Public | Full system, uptime, and MongoDB connectivity status |
| `GET` | `/health?strict=true` | Public | Readiness probe (returns 503 if MongoDB is disconnected) |

**Sample Response (`200 OK`):**
```json
{
  "success": true,
  "message": "API is running",
  "status": "healthy",
  "timestamp": "2026-10-02T12:00:00.000Z",
  "uptime": {
    "seconds": 120,
    "formatted": "2m 0s"
  },
  "services": {
    "database": {
      "status": "connected",
      "readyState": 1,
      "latencyMs": 4
    }
  },
  "system": {
    "nodeVersion": "v20.x.x",
    "environment": "development",
    "memory": {
      "rss": "52.12 MB",
      "heapTotal": "34.50 MB",
      "heapUsed": "28.10 MB",
      "external": "2.40 MB"
    }
  },
  "responseTimeMs": 5
}
```

---

### Authentication (`/auth`)
| Method | Endpoint | Access | Description | Request Body |
|---|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user | `{ "name": "John", "email": "john@example.com", "password": "password123", "role": "user" }` |
| `POST` | `/auth/login` | Public | Login & receive JWT | `{ "email": "john@example.com", "password": "password123" }` |
| `GET` | `/auth/me` | Private | Get current authenticated user profile | — |

---

### Master Governance, Audit Trail & Admin Provisioning (`/master`)
| Method | Endpoint | Access | Description | Request Body |
|---|---|---|---|---|
| `POST` | `/master/login` | Public (Master Only) | Authenticate Master and obtain JWT | `{ "email": "satyaranjan@gmail.com", "password": "..." }` |
| `GET` | `/master/overview` | Master | Executive dashboard metrics (revenue, orders, admins, catalog) | — |
| `GET` | `/master/activities` | Master | Global audit trail of all operational admin activities | — |
| `GET` | `/master/admins` | Master | List all administrators (supports `?search=...`) | — |
| `POST` | `/master/admins` | Master | Provision a new administrator account | `{ "name": "Admin Name", "email": "admin@example.com", "password": "..." }` |
| `GET` | `/master/admins/:id` | Master | Get detailed admin info | — |
| `GET` | `/master/admins/:id/activities` | Master | View activity history stream for a specific administrator | — |
| `PUT` | `/master/admins/:id` | Master | Update admin status, email, name, or password | `{ "name": "...", "isActive": false }` |
| `DELETE` | `/master/admins/:id` | Master | Permanently revoke/delete an administrator | — |

> **Enterprise Separation of Duties**: Master accounts have governance and audit oversight privileges only. Catalog product modifications (`POST`, `PATCH`, `DELETE` on `/products`) are strictly restricted to Operational Admins.

---

### Categories (`/categories`)
| Method | Endpoint | Access | Description | Request Body |
|---|---|---|---|---|
| `GET` | `/categories` | Public | List all active categories | — |
| `GET` | `/categories/:id` | Public | Get single category by ID | — |
| `POST` | `/categories` | Admin | Create a new category | `{ "name": "Electronics", "slug": "electronics" }` |
| `PATCH` | `/categories/:id` | Admin | Update category | `{ "name": "Updated Electronics", "isActive": true }` |
| `DELETE` | `/categories/:id` | Admin | Delete category | — |

---

### Products (`/products`)
| Method | Endpoint | Access | Description | Query / Body |
|---|---|---|---|---|
| `GET` | `/products` | Public | List products (with search, category, sort, pagination) | `?search=phone&category=electronics&sort=price&page=1&limit=10` |
| `GET` | `/products/:id` | Public | Get product details | — |
| `POST` | `/products` | Admin | Create a new product | `{ "title": "...", "description": "...", "price": 999, "category": "CATEGORY_ID", "stock": 50, "images": ["https://..."] }` |
| `PATCH` | `/products/:id` | Admin | Update product | `{ "price": 899, "stock": 40 }` |
| `DELETE` | `/products/:id` | Admin | Delete product | — |

---

### Shopping Cart (`/cart`)
| Method | Endpoint | Access | Description | Request Body |
|---|---|---|---|---|
| `GET` | `/cart` | Private | View current user's shopping cart | — |
| `POST` | `/cart/items` | Private | Add product item to cart | `{ "productId": "PRODUCT_ID", "quantity": 1 }` |
| `PATCH` | `/cart/items/:productId` | Private | Update item quantity in cart | `{ "quantity": 3 }` |
| `DELETE` | `/cart/items/:productId` | Private | Remove item from cart | — |
| `DELETE` | `/cart` | Private | Clear entire cart | — |

---

### Addresses (`/addresses`)
| Method | Endpoint | Access | Description | Request Body |
|---|---|---|---|---|
| `GET` | `/addresses` | Private | List all saved addresses of user | — |
| `POST` | `/addresses` | Private | Add a new address | `{ "fullName": "...", "phone": "...", "addressLine": "...", "city": "...", "state": "...", "pincode": "...", "isDefault": true }` |
| `PATCH` | `/addresses/:id` | Private | Update address details | `{ "city": "New City", "isDefault": true }` |
| `DELETE` | `/addresses/:id` | Private | Delete an address | — |

---

### Orders (`/orders`)
| Method | Endpoint | Access | Description | Request Body |
|---|---|---|---|---|
| `POST` | `/orders` | Private | Place an order from cart | `{ "addressId": "ADDRESS_ID" }` or `{ "shippingAddress": { ... } }` |
| `GET` | `/orders/my-orders` | Private | Get current user's order history | `?page=1&limit=10` |
| `GET` | `/orders/:id` | Private | Get single order details | — |
| `GET` | `/orders` | Admin | List all orders across all users | `?status=pending&page=1&limit=10` |
| `PATCH` | `/orders/:id/status` | Admin | Update order status | `{ "orderStatus": "confirmed" }` |

---

## Rate Limiting & Abuse Prevention

The backend implements a granular, tiered rate limiting system designed for enterprise security and optimal user experience:

### 1. Endpoint Tiers

| Tier | Endpoints | Default Limit | Strategy / Key |
|---|---|---|---|
| **Authentication** | `POST /api/v1/auth/login`<br>`POST /api/v1/auth/register` | 10 per IP, 5 per Account | **Exponential Backoff** with dual tracking (Per-IP & Per-Account) |
| **Public Endpoints** | `GET /api/v1/products`<br>`GET /api/v1/categories`<br>`GET /api/v1/health` | 100 req / 15 min | Sliding window keyed by Client IP |
| **Authenticated Actions** | `/api/v1/cart/*`<br>`/api/v1/orders/*`<br>`/api/v1/addresses/*`<br>`GET /api/v1/auth/me`<br>Admin mutations | 500 req / 15 min | Sliding window keyed by Authenticated User ID (with IP fallback) |

### 2. Auth Routes: Exponential Backoff & Dual IP + Account Defense

Rather than applying a rigid lockout that locks out legitimate users for 30 minutes, authentication routes implement **progressive exponential backoff**:
- **Dual Vector Protection**:
  - **Per-IP Limit**: Stops single-IP credential stuffing across many accounts.
  - **Per-Account Limit**: Stops distributed brute-force attacks from multiple botnet IPs targeting a single user account.
- **Exponential Cooldown Formula**:
  $$\text{Delay} = \min(\text{baseDelayMs} \times (\text{backoffFactor}^{\text{excessAttempts}}), \text{maxDelayMs})$$
  *(e.g. 1s → 2s → 4s → 8s → 16s → 32s ... up to 15 minutes)*.
- **Trial Attempts**: When the cooldown expires, the user is granted a single trial attempt. If authentication succeeds, the account backoff resets immediately. If it fails, the cooldown doubles exponentially.
- **Standard HTTP Headers**: Sets `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, and `Retry-After: <seconds>` on `HTTP 429 Too Many Requests`.

### 3. Environment Variable Configuration

All thresholds are fully configurable in `.env`:

```env
# Master Toggle
RATE_LIMIT_ENABLED=true

# Auth Routes Configuration
RATE_LIMIT_AUTH_WINDOW_MS=900000        # 15 min tracking window
RATE_LIMIT_AUTH_IP_MAX=10              # Max attempts per IP
RATE_LIMIT_AUTH_ACCOUNT_MAX=5          # Max attempts per account
RATE_LIMIT_AUTH_BASE_DELAY_MS=1000     # Base backoff delay (1s)
RATE_LIMIT_AUTH_BACKOFF_FACTOR=2       # Exponential multiplier (2x)
RATE_LIMIT_AUTH_MAX_DELAY_MS=900000    # Max backoff cap (15 min)
RATE_LIMIT_AUTH_RESET_ON_SUCCESS=true  # Reset account counter on success

# Public Endpoints
RATE_LIMIT_PUBLIC_WINDOW_MS=900000     # 15 min window
RATE_LIMIT_PUBLIC_MAX=100              # 100 requests per IP

# Authenticated User Actions
RATE_LIMIT_USER_WINDOW_MS=900000       # 15 min window
RATE_LIMIT_USER_MAX=500                # 500 requests per user
```

---

## Strict Input Schema Validation

To prevent injection, mass assignment, type juggling, and malformed payload attacks, the API applies **strict schema validation** across all input channels (`body`, `params`, `query`):

### 1. Fail-Closed Principles
- **No Sanitization / Coercion Bypasses**: The API does not silently strip, escape, or coerce malformed payloads. Any input that deviates from the strict schema is **immediately rejected with HTTP 400 Bad Request**.
- **Mass Assignment & Unknown Field Rejection (`strict: true`)**: Any unexpected, unknown, or extraneous properties submitted in the request body or query parameters are flagged and rejected immediately.
- **Boundary Validation**:
  - **Type**: Strict type checks (`string`, `number`, `boolean`, `array`, `object`). Passing numbers for strings or objects for primitives is instantly rejected.
  - **Length**: Strict minimum and maximum boundaries on all string and array fields (e.g. name: 2-50 chars, description: 5-5000 chars, password: 6-128 chars).
  - **Format**: Regex and structural format verification (RFC 5322 emails, 24-character hexadecimal MongoDB ObjectIds, 10-digit Indian phone numbers, 6-digit postal PIN codes, valid http/https URLs, and exact enum whitelists).
  - **Parameter Security**: All route parameters (`:id`, `:productId`) are strictly verified as valid 24-character hexadecimal ObjectIds before hitting any database query.


