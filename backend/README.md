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
│   │   └── db.js                 # MongoDB connection logic
│   │
│   ├── controllers/
│   │   ├── auth.controller.js     # User registration, login, and profile
│   │   ├── product.controller.js  # Product listing, search, and CRUD
│   │   ├── category.controller.js # Category management
│   │   ├── cart.controller.js     # Shopping cart operations
│   │   ├── address.controller.js  # User shipping address management
│   │   └── order.controller.js    # Checkout & order processing
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
│   │   └── order.routes.js        # /api/v1/orders
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verification & req.user attachment
│   │   ├── role.middleware.js     # Role authorization (e.g. adminOnly)
│   │   ├── validate.middleware.js # Request validation middleware
│   │   ├── error.middleware.js    # Global error handler
│   │   └── notFound.middleware.js # 404 handler
│   │
│   ├── validators/
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

### Setting up an Admin User:

1. Register a new user via `POST /api/v1/auth/register` (default role is `user`).
2. Alternatively, provide `"role": "admin"` in the register body, or update the user's `role` field directly in MongoDB:
   ```javascript
   db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
   ```

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

### Health Check
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Check if API server is running |

---

### Authentication (`/auth`)
| Method | Endpoint | Access | Description | Request Body |
|---|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user | `{ "name": "John", "email": "john@example.com", "password": "password123", "role": "user" }` |
| `POST` | `/auth/login` | Public | Login & receive JWT | `{ "email": "john@example.com", "password": "password123" }` |
| `GET` | `/auth/me` | Private | Get current authenticated user profile | — |

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
