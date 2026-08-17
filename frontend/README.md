# EzzyShop — Frontend (React.js + Vite + Tailwind CSS)

EzzyShop is a production-ready, modern E-Commerce frontend built with React.js, Vite, Tailwind CSS, Zustand, and React Hook Form. It integrates cleanly with the existing MERN Stack REST API.

---

## 🚀 Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Form Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) + [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Loading Skeletons**: [react-loading-skeleton](https://github.com/dvtng/react-loading-skeleton)

---

## 🏛️ Architecture & Separation of Concerns

```
Component
   ↓
Hook / Store (Zustand)
   ↓
Service Layer (auth, product, category, cart, address, order)
   ↓
Axios API Client (src/api/axios.js)
   ↓
Backend REST API (/api/v1)
```

---

## 📁 Project Directory Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js                 # Centralized Axios client with JWT interceptors
│   ├── services/
│   │   ├── auth.service.js          # Authentication API calls
│   │   ├── category.service.js      # Category management API calls
│   │   ├── product.service.js       # Product catalog & admin CRUD API calls
│   │   ├── cart.service.js          # User cart management API calls
│   │   ├── address.service.js       # Saved address CRUD API calls
│   │   └── order.service.js         # Order placement & admin status updates
│   ├── store/
│   │   ├── auth.store.js            # User session & auth state (Zustand)
│   │   ├── cart.store.js            # Real-time cart state (Zustand)
│   │   └── ui.store.js              # Global navigation drawer states
│   ├── hooks/
│   │   ├── useAuth.js               # Auth helper hook
│   │   ├── useProducts.js           # Product listing & pagination hook
│   │   └── useDebounce.js           # Debounce hook for real-time search
│   ├── utils/
│   │   ├── constants.js             # Status configs, sort options & constants
│   │   ├── formatCurrency.js        # INR currency formatting helper
│   │   └── helpers.js               # Error parsing, discount & date helpers
│   ├── components/
│   │   ├── common/                  # Button, Input, Modal, Loader, Pagination, etc.
│   │   ├── layout/                  # Navbar, Footer, MainLayout, AdminLayout
│   │   ├── product/                 # ProductCard, ProductGrid, ProductFilters, ProductSearch
│   │   ├── cart/                    # CartItem, CartSummary
│   │   ├── address/                 # AddressCard, AddressForm
│   │   └── admin/                   # AdminSidebar, ProductForm, CategoryForm, OrderTable
│   ├── pages/
│   │   ├── public/                  # Home, Products, ProductDetails, NotFound
│   │   ├── auth/                    # Login, Register
│   │   ├── user/                    # Profile, Cart, Addresses, Checkout, Orders, OrderDetails
│   │   └── admin/                   # Dashboard, AdminProducts, AdminCategories, AdminOrders
│   ├── routes/
│   │   ├── AppRoutes.jsx            # Application route tree
│   │   ├── ProtectedRoute.jsx       # Customer session route guard
│   │   └── AdminRoute.jsx           # Admin privilege route guard
│   ├── App.jsx                      # App root with session restoration
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Design tokens and styles
├── .env                             # Environment configuration
├── .env.example                     # Example environment configuration
├── package.json
└── vite.config.js
```

---

## ⚙️ Environment Variables

Create `.env` inside the `frontend/` folder:

```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

---

## 🏃 Running the Application

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
```
