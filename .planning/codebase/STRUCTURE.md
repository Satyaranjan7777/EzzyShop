# Repository & Codebase Directory Structure

**Application:** EzzyShop (Fullstack MERN E-Commerce)  
**Root Path:** `d:/MERN Stack Practice Project/e-Commerce`

---

## 1. Top-Level Directory Layout

```
.
├── .agents/                 # Workspace agent rules and configurations
├── .git/                    # Git repository version control
├── .gitignore               # Root git ignore definitions
├── .planning/               # GSD planning directory
│   └── codebase/            # Codebase mapping documentation (7 documents)
├── backend/                 # Node.js / Express 5 API application
├── frontend/                # React 19 / Vite / Tailwind CSS SPA application
├── package.json             # Root monorepo orchestration scripts
└── SECURITY_AUDIT_REPORT.md # Historical comprehensive application security audit
```

---

## 2. Backend Workspace Structure (`/backend`)

```
backend/
├── .env                     # Local environment variables (gitignored)
├── .gitignore               # Backend-specific ignore list
├── README.md                # Backend architecture & documentation guide
├── jest.config.js           # Jest 30 ESM test runner configuration
├── package.json             # Backend dependencies and execution scripts
├── package-lock.json        # NPM dependency lockfile
├── server.js                # Application entrypoint & HTTP server bootstrap
├── storage/
│   └── uploads/             # User-uploaded media storage (gitignored/sandboxed)
├── tests/                   # Automated unit, integration, and security test suites
│   ├── address.test.js      # Address CRUD & validation tests
│   ├── auth.test.js         # Authentication, registration & login tests
│   ├── cart.test.js         # Cart mutation & recalculation tests
│   ├── category.test.js     # Category management tests
│   ├── errorHandler.test.js # Centralized error handling & status code tests
│   ├── health.test.js       # Healthcheck API verification tests
│   ├── master.test.js       # Master admin governance & activity log tests
│   ├── order.test.js        # Checkout, stock depletion & order lifecycle tests
│   ├── product.test.js      # Product catalog CRUD & search tests
│   ├── rateLimiter.test.js  # Sliding window & exponential backoff rate limiter tests
│   ├── securityHardening.test.js # Regression tests for security audit findings
│   ├── setup.js             # Global test database connection hooks
│   └── strictValidation.test.js  # Strict schema engine verification tests
└── src/
    ├── app.js               # Express app definition, middleware pipeline, static serving
    ├── config/              # Configuration files
    │   ├── db.js            # MongoDB Mongoose connection handler
    │   └── rateLimit.config.js # Rate limit window & threshold configurations
    ├── controllers/         # Request handling & business logic controllers
    │   ├── address.controller.js  # Address operations
    │   ├── auth.controller.js     # User registration, login, profile retrieval
    │   ├── authController.js      # Legacy export shim -> auth.controller.js
    │   ├── cart.controller.js     # Cart synchronization & calculation
    │   ├── category.controller.js # Category management
    │   ├── health.controller.js   # Server & database health checks
    │   ├── master.controller.js   # Master admin management & activity auditing
    │   ├── order.controller.js    # Order checkout, stock depletion, status transitions
    │   └── product.controller.js  # Product catalog browsing & CRUD
    ├── middleware/          # Express route middlewares
    │   ├── adminMiddleware.js     # Legacy export shim
    │   ├── auth.middleware.js     # JWT Bearer token authentication
    │   ├── authMiddleware.js      # Legacy export shim
    │   ├── error.middleware.js    # Global error interceptor & formatter
    │   ├── notFound.middleware.js # 404 handler for unmatched API routes
    │   ├── rateLimiter.middleware.js # Sliding-window rate limiters with backoff
    │   ├── role.middleware.js     # Role-based access control & enterprise duties
    │   ├── sanitize.middleware.js # NoSQL injection payload sanitization
    │   └── validate.middleware.js # Schema validation execution middleware
    ├── models/              # Mongoose data models
    │   ├── ActivityLog.js   # Administrative audit trail records
    │   ├── Address.js       # Customer delivery addresses
    │   ├── Cart.js          # Customer shopping cart items
    │   ├── Category.js      # Product categories with auto-slugs
    │   ├── Order.js         # Customer orders with snapshots & payment status
    │   ├── Product.js       # Product catalog items with inventory & text index
    │   └── User.js          # User identity, roles (user/admin/master), password hash
    ├── routes/              # Express API route declarations
    │   ├── address.routes.js   # /api/v1/addresses
    │   ├── auth.routes.js      # /api/v1/auth
    │   ├── authRoutes.js       # Legacy export shim -> auth.routes.js
    │   ├── cart.routes.js      # /api/v1/cart
    │   ├── category.routes.js  # /api/v1/categories
    │   ├── health.routes.js    # /health & /api/v1/health
    │   ├── master.routes.js    # /api/v1/master
    │   ├── order.routes.js     # /api/v1/orders
    │   ├── product.routes.js   # /api/v1/products
    │   └── upload.routes.js    # /api/v1/upload
    ├── seeds/               # Database seed scripts
    │   ├── seed.js          # Master seed: default categories, products, admin, users
    │   └── seedMaster.js    # Master account initializer & role verifier
    ├── utils/               # Shared backend utilities
    │   ├── ApiError.js      # Custom error class with HTTP status code
    │   ├── ApiResponse.js   # Standardized JSON response envelope builder
    │   ├── activityLogger.js # Non-blocking admin action logger
    │   ├── asyncHandler.js  # Async function wrapper for Express error propagation
    │   ├── errorSanitizer.js # Error masking & message cleanup for production
    │   ├── logger.js        # Timestamped structured logger
    │   └── upload.js        # Multer disk storage and MIME validation config
    └── validators/          # Custom strict schema validation definitions
        ├── address.validator.js # Address creation and update schemas
        ├── auth.validator.js    # Register, login, and profile update schemas
        ├── cart.validator.js    # Cart add and update item schemas
        ├── category.validator.js # Category creation schemas
        ├── common.validator.js  # MongoDB ObjectID parameter schemas
        ├── master.validator.js  # Master login and admin provisioning schemas
        ├── order.validator.js   # Checkout and status transition schemas
        ├── product.validator.js # Product catalog mutation & query schemas
        └── schema.js            # Custom zero-dependency strict validation engine
```

---

## 3. Frontend Workspace Structure (`/frontend`)

```
frontend/
├── .env                     # Frontend environment variables (`VITE_API_BASE_URL`)
├── .gitignore               # Frontend-specific ignore list
├── README.md                # Frontend documentation & design principles
├── dist/                    # Production bundle build output (gitignored)
├── eslint.config.js         # ESLint 10 flat configuration
├── index.html               # Single page application HTML entrypoint
├── package.json             # Frontend dependencies and Vite scripts
├── package-lock.json        # NPM dependency lockfile
├── public/                  # Static assets served as-is
├── vite.config.js           # Vite 8 configuration with React & Tailwind plugins
└── src/
    ├── App.jsx              # Root component with ToastContainer, ScrollToTop, Router
    ├── index.css            # Tailwind CSS v4 directives & custom utility classes
    ├── main.jsx             # React 19 root DOM mounting entrypoint
    ├── api/
    │   └── axios.js         # Configured Axios client with auth interceptors
    ├── assets/              # Static images, SVGs, audio notification files
    ├── components/
    │   ├── address/         # Address management components
    │   │   ├── AddressCard.jsx
    │   │   └── AddressForm.jsx
    │   ├── admin/           # Administrative portal UI components
    │   │   ├── AdminNotificationBell.jsx  # Notification counter & audio alerts
    │   │   ├── AdminSidebar.jsx           # Dashboard navigation sidebar
    │   │   ├── CategoryForm.jsx           # Modal form for category creation
    │   │   ├── OrderTable.jsx             # Paginated order fulfillment table
    │   │   └── ProductForm.jsx            # Multi-image product creation/edit form
    │   ├── cart/            # Shopping cart components
    │   │   ├── CartItem.jsx
    │   │   └── CartSummary.jsx
    │   ├── common/          # Reusable shared atomic components
    │   │   ├── Button.jsx         # Styled button with variants and loading spinners
    │   │   ├── ConfirmDialog.jsx  # Destructive action confirmation modal
    │   │   ├── EmptyState.jsx     # Friendly empty content placeholders
    │   │   ├── ErrorBoundary.jsx  # React class error boundary
    │   │   ├── ErrorState.jsx     # Error display card with retry button
    │   │   ├── Input.jsx          # Accessible form input with error feedback
    │   │   ├── Loader.jsx         # Loading spinner
    │   │   ├── Modal.jsx          # Accessible modal dialog wrapper
    │   │   ├── Pagination.jsx     # Paginated navigation controls
    │   │   └── ScrollToTop.jsx    # Smooth window scroll on route navigation
    │   ├── layout/          # Page layout structures
    │   │   ├── AdminLayout.jsx    # Dashboard layout for operational admins
    │   │   ├── Footer.jsx         # Storefront footer with links & newsletter
    │   │   ├── MainLayout.jsx     # Storefront layout (Navbar + Outlet + Footer)
    │   │   ├── MobileBottomNav.jsx # Bottom navigation bar for mobile devices
    │   │   └── Navbar.jsx         # Sticky storefront navbar with cart badge & search
    │   └── product/         # Product catalog components
    │       ├── ProductCard.jsx    # Product preview card with badges & pricing
    │       ├── ProductFilters.jsx # Category, price range, and sort dropdown filters
    │       ├── ProductGrid.jsx    # Responsive grid layout for product cards
    │       ├── ProductSearch.jsx  # Debounced live search input
    │       └── ProductSkeleton.jsx # Skeleton placeholder during product fetching
    ├── hooks/               # Custom React hooks
    │   ├── useAdminOrderPolling.js # 15-second polling hook for new admin orders
    │   ├── useAuth.js             # Convenient auth store selector hook
    │   ├── useDebounce.js         # Input debouncing hook for search
    │   └── useProducts.js         # Product fetching and filter state hook
    ├── pages/               # Routed page components
    │   ├── admin/           # Operational Admin views
    │   │   ├── AdminCategories.jsx # Category CRUD
    │   │   ├── AdminOrders.jsx     # Order fulfillment & status updates
    │   │   ├── AdminProducts.jsx   # Product catalog CRUD
    │   │   └── Dashboard.jsx       # Operational metrics overview
    │   ├── auth/            # Authentication views
    │   │   ├── Login.jsx           # Storefront customer & admin login
    │   │   └── Register.jsx        # Customer registration
    │   ├── master/          # Master Admin views
    │   │   ├── MasterAdminActivity.jsx # Paginated admin activity audit logs
    │   │   ├── MasterAdmins.jsx        # Admin account management (CRUD/suspend)
    │   │   └── MasterLogin.jsx         # Dedicated Master credentials entry
    │   ├── public/          # Public storefront views
    │   │   ├── Home.jsx            # Hero banner, featured products, categories
    │   │   ├── NotFound.jsx        # 404 page with redirect
    │   │   ├── ProductDetails.jsx  # Image carousel, inventory status, add-to-cart
    │   │   └── Products.jsx        # Catalog page with filters & pagination
    │   └── user/            # Authenticated customer views
    │       ├── Addresses.jsx       # Saved address book
    │       ├── Cart.jsx            # Active shopping cart
    │       ├── Checkout.jsx        # Address selection & COD confirmation
    │       ├── OrderDetails.jsx    # Single order status tracking & invoice
    │       ├── Orders.jsx          # Order history
    │       └── Profile.jsx         # User account settings & password change
    ├── routes/              # Route definitions & guards
    │   ├── AdminRoute.jsx   # Guards routes for role === "admin"
    │   ├── AppRoutes.jsx    # Master application route declaration
    │   ├── MasterRoute.jsx  # Guards routes for role === "master"
    │   └── ProtectedRoute.jsx # Guards routes for authenticated users
    ├── services/            # API communication services (Axios wrappers)
    │   ├── address.service.js
    │   ├── auth.service.js
    │   ├── cart.service.js
    │   ├── category.service.js
    │   ├── master.service.js
    │   ├── order.service.js
    │   └── product.service.js
    ├── store/               # Zustand state stores
    │   ├── adminNotification.store.js
    │   ├── auth.store.js
    │   ├── cart.store.js
    │   └── ui.store.js
    └── utils/               # Frontend utility helpers & constants
        ├── constants.js     # API endpoints, order statuses, sort options
        ├── formatCurrency.js # INR currency formatting utility
        └── helpers.js       # Error message extraction, date formatters
```
