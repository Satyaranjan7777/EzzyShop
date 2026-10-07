import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB } from "./setup.js";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import Category from "../src/models/Category.js";
import Cart from "../src/models/Cart.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Security Hardening & Vulnerability Verification Suite", () => {
  let adminToken = "";
  let userToken = "";
  let testUserId = "";
  let testCategoryId = "";
  let testProductId = "";

  beforeAll(async () => {
    await connectTestDB();

    const timestamp = Date.now();

    // Create a regular test user
    const user = await User.create({
      name: "Security Test User",
      email: `sectest_user_${timestamp}@example.com`,
      password: "HashedPassword123!",
      role: "user",
    });
    testUserId = user._id;
    userToken = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET || "test-secret"
    );

    // Create an admin user
    const admin = await User.create({
      name: "Security Admin User",
      email: `secadmin_${timestamp}@example.com`,
      password: "HashedPassword123!",
      role: "admin",
    });
    adminToken = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET || "test-secret"
    );

    // Create test category and product
    const category = await Category.create({
      name: `Sec Category ${timestamp}`,
      slug: `sec-cat-${timestamp}`,
      isActive: true,
    });
    testCategoryId = category._id;

    const product = await Product.create({
      title: `Sec Product ${timestamp}`,
      slug: `sec-prod-${timestamp}`,
      description: "A secure test product for vulnerability validation",
      price: 100,
      stock: 5,
      category: testCategoryId,
      isActive: true,
    });
    testProductId = product._id;
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe("Finding 1: Vertical Privilege Escalation Prevention", () => {
    it("should strictly reject registration requests attempting to supply role: 'admin'", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Attacker Trying Admin",
          email: `attacker_admin_${Date.now()}@example.com`,
          password: "SecurePassword123!",
          role: "admin",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("elevated roles");
    });

    it("should force role to 'user' even if client sends role: 'user'", async () => {
      const email = `legit_user_${Date.now()}@example.com`;
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Normal User Registration",
          email,
          password: "SecurePassword123!",
          role: "user",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe("user");

      const savedUser = await User.findOne({ email });
      expect(savedUser.role).toBe("user");
    });
  });

  describe("Finding 2: ReDoS and Regex Injection Immunity", () => {
    it("should safely handle special regex metacharacters in product search without crashing or syntax error", async () => {
      const dangerousPatterns = [
        "(((a+)+)+)",
        ".*.*.*.*",
        "[a-z]+",
        "\\",
        "?",
        "+",
        "*",
        "{1,10}",
      ];

      for (const pattern of dangerousPatterns) {
        const res = await request(app)
          .get(`/api/v1/products?search=${encodeURIComponent(pattern)}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });

    it("should safely handle special regex characters in category creation duplicate check", async () => {
      const specialName = `Spec [Special] (Test) + ${Date.now().toString().slice(-4)}`;
      const res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: specialName,
          slug: `special-cat-${Date.now()}`,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Attempting to create duplicate with same special characters must be caught cleanly without regex error
      const dupRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: specialName,
          slug: `special-cat-dup-${Date.now()}`,
        });

      expect(dupRes.status).toBe(400);
      expect(dupRes.body.message).toContain("already exists");
    });
  });

  describe("Finding 3: HTTP Security Headers (Helmet)", () => {
    it("should include modern security response headers on all responses", async () => {
      const res = await request(app).get("/api/v1/health");

      expect(res.status).toBe(200);
      expect(res.headers).toHaveProperty("x-content-type-options", "nosniff");
      expect(res.headers).toHaveProperty("x-frame-options", "SAMEORIGIN");
      expect(res.headers).toHaveProperty("x-dns-prefetch-control", "off");
    });
  });

  describe("Finding 4: Password Length Policy Enforcement", () => {
    it("should reject registration passwords with fewer than 8 characters", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Short Pass User",
          email: `shortpass_${Date.now()}@example.com`,
          password: "Pass1!", // 6 characters
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("at least 8 characters long");
    });
  });

  describe("Finding 5: Sensitive Field Protection (select: false on password)", () => {
    it("should never expose password hash in default User model queries", async () => {
      const queriedUser = await User.findById(testUserId);
      expect(queriedUser.password).toBeUndefined();

      const userJson = queriedUser.toJSON();
      expect(userJson.password).toBeUndefined();
      expect(userJson.__v).toBeUndefined();
    });

    it("should successfully log in by explicitly selecting password on login", async () => {
      // Register new user with known password
      const email = `login_check_${Date.now()}@example.com`;
      const plainPassword = "ValidPassword123!";

      await request(app).post("/api/v1/auth/register").send({
        name: "Login Check",
        email,
        password: plainPassword,
      });

      const res = await request(app).post("/api/v1/auth/login").send({
        email,
        password: plainPassword,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user).not.toHaveProperty("password");
    });
  });

  describe("Finding 6: Concurrency and Atomic Stock Reservation", () => {
    it("should reject checkout if requested quantity exceeds current available stock", async () => {
      // Create limited product with exactly 1 unit in stock
      const limitedProduct = await Product.create({
        title: `Limited Stock Product ${Date.now()}`,
        slug: `limited-stock-${Date.now()}`,
        description: "Testing concurrency and stock limits",
        price: 50,
        stock: 1,
        category: testCategoryId,
        isActive: true,
      });

      // Place 2 units in user's cart
      await Cart.findOneAndUpdate(
        { user: testUserId },
        {
          items: [{ product: limitedProduct._id, quantity: 2 }],
        },
        { upsert: true }
      );

      // Attempt to place order
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          shippingAddress: {
            fullName: "Tester",
            phone: "+919876543210",
            addressLine: "123 Test St",
            city: "Bhubaneswar",
            state: "Odisha",
            pincode: "751001",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Insufficient stock");

      // Verify stock was not changed
      const unchangedProduct = await Product.findById(limitedProduct._id);
      expect(unchangedProduct.stock).toBe(1);
    });
  });

  describe("Finding 7: File Upload Security", () => {
    it("should deny unauthenticated or non-admin access to file uploads", async () => {
      // Unauthenticated
      const unauthRes = await request(app)
        .post("/api/v1/upload")
        .attach("image", Buffer.from("fake data"), "test.png");
      expect(unauthRes.status).toBe(401);

      // Authenticated as regular customer
      const userRes = await request(app)
        .post("/api/v1/upload")
        .set("Authorization", `Bearer ${userToken}`)
        .attach("image", Buffer.from("fake data"), "test.png");
      expect(userRes.status).toBe(403);
    });

    it("should reject non-image executable uploads even for admin", async () => {
      const res = await request(app)
        .post("/api/v1/upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("image", Buffer.from("echo 'evil'"), "script.sh");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid file type");
    });

    it("should reject uploads with spoofed image extension but invalid magic byte content", async () => {
      // Admin uploads a .png file with plain text/script content (spoofed extension)
      const res = await request(app)
        .post("/api/v1/upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("image", Buffer.from("malicious script pretending to be png"), "fake.png");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid file content");
    });

    it("should accept valid image upload with authentic magic bytes and serve with security headers", async () => {
      // Valid PNG header (8 bytes) + minimal chunk data
      const validPngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
      ]);

      const res = await request(app)
        .post("/api/v1/upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("image", validPngBuffer, "valid.png");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toMatch(/^\/uploads\/\d+-[a-f0-9]+\.png$/);

      // Verify static serving headers (nosniff, sandbox, cross-origin)
      const staticRes = await request(app).get(res.body.data.url);
      expect(staticRes.headers["x-content-type-options"]).toBe("nosniff");
      expect(staticRes.headers["content-security-policy"]).toContain("sandbox");
      expect(staticRes.headers["cross-origin-resource-policy"]).toBe("cross-origin");

      // Cleanup test file from disk
      const uploadedFilePath = path.resolve(
        __dirname,
        "../storage/uploads",
        res.body.data.filename
      );
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
    });
  });
});
