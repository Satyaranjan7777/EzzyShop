import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import healthRoutes from "./routes/health.routes.js";
import masterRoutes from "./routes/master.routes.js";

// Middlewares
import { notFound } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import mongoSanitize from "./middleware/sanitize.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust reverse proxy (e.g. Nginx, Cloudflare, Heroku) for accurate IP resolution
app.set("trust proxy", process.env.TRUST_PROXY || 1);

// Security Headers: Helmet protects against clickjacking, sniffing, and XSS attacks
app.use(
  helmet({
    contentSecurityPolicy: false, // Prevents inline script/style execution blocks for bundled SPA
    crossOriginEmbedderPolicy: false,
  })
);

// Global Middlewares - dynamic origins loaded from env
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      // Exact match for configured client origins
      if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In development/test environments, allow localhost dev servers
      if (!isProduction && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Request body size limits to prevent Denial of Service via large payloads
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Defense-in-depth NoSQL operator injection sanitizer
app.use(mongoSanitize);

// Health Check Endpoints (available at both root and api/v1)
app.use("/health", healthRoutes);
app.use("/api/v1/health", healthRoutes);

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/master", masterRoutes);

// Serve uploaded assets statically with dotfile protection and execution sandboxing
const uploadsStaticPath = path.resolve(__dirname, "../storage/uploads");
app.use(
  "/uploads",
  express.static(uploadsStaticPath, {
    dotfiles: "ignore",
    maxAge: "1d",
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Serve Frontend Static Build
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(frontendDistPath));

// Fallback to React index.html for non-API client-side routes (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method !== "GET" || req.originalUrl.startsWith("/api/v1")) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
    if (err) {
      next();
    }
  });
});

// 404 Not Found Middleware (only reached if API route doesn't match or frontend build not available)
app.use(notFound);

// Centralized Global Error Handling Middleware
app.use(errorHandler);

export default app;
