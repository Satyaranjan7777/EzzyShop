import express from "express";
import request from "supertest";
import schema from "../src/validators/schema.js";
import { validate } from "../src/middleware/validate.middleware.js";
import { errorHandler } from "../src/middleware/error.middleware.js";
import { registerValidator, loginValidator } from "../src/validators/auth.validator.js";
import {
  createProductValidator,
  updateProductValidator,
  getProductsQueryValidator,
} from "../src/validators/product.validator.js";
import { createCategoryValidator } from "../src/validators/category.validator.js";
import { addToCartValidator } from "../src/validators/cart.validator.js";
import { createAddressValidator } from "../src/validators/address.validator.js";
import { idParamValidator } from "../src/validators/common.validator.js";

const createTestApp = (registerRoutes) => {
  const app = express();
  app.use(express.json());
  registerRoutes(app);
  app.use(errorHandler);
  return app;
};

describe("Strict Schema Validation Engine", () => {
  describe("Type, Length, and Format Validation", () => {
    it("should reject invalid types (e.g., number for string, string for number)", async () => {
      const app = createTestApp((app) => {
        app.post("/test/types", validate(registerValidator), (req, res) => {
          res.status(200).json({ success: true });
        });
      });

      // Name must be string, not a number or object
      const res1 = await request(app).post("/test/types").send({
        name: 12345,
        email: "test@example.com",
        password: "ValidPassword123!",
      });
      expect(res1.status).toBe(400);
      expect(res1.body.success).toBe(false);
      expect(res1.body.message).toContain("must be a string");

      // Password must be string, not array
      const res2 = await request(app).post("/test/types").send({
        name: "Valid Name",
        email: "test@example.com",
        password: ["pass1", "pass2"],
      });
      expect(res2.status).toBe(400);
      expect(res2.body.message).toContain("must be a string");
    });

    it("should reject inputs violating length bounds (min and max)", async () => {
      const app = createTestApp((app) => {
        app.post("/test/length", validate(registerValidator), (req, res) => {
          res.status(200).json({ success: true });
        });
      });

      // Name too short (< 2)
      const res1 = await request(app).post("/test/length").send({
        name: "A",
        email: "test@example.com",
        password: "ValidPassword123!",
      });
      expect(res1.status).toBe(400);
      expect(res1.body.message).toContain("at least 2 characters");

      // Name too long (> 50)
      const res2 = await request(app).post("/test/length").send({
        name: "A".repeat(55),
        email: "test@example.com",
        password: "ValidPassword123!",
      });
      expect(res2.status).toBe(400);
      expect(res2.body.message).toContain("cannot exceed 50 characters");

      // Password too short (< 8)
      const res3 = await request(app).post("/test/length").send({
        name: "Valid User",
        email: "test@example.com",
        password: "123",
      });
      expect(res3.status).toBe(400);
      expect(res3.body.message).toContain("at least 8 characters");
    });

    it("should reject inputs violating format (email, ObjectId, phone, pincode)", async () => {
      const app = createTestApp((app) => {
        app.post("/test/format", validate(registerValidator), (req, res) => {
          res.status(200).json({ success: true });
        });
      });

      // Invalid email formats
      const invalidEmails = ["notanemail", "@missinguser.com", "user@.com", "user@domain..com"];
      for (const email of invalidEmails) {
        const res = await request(app).post("/test/format").send({
          name: "Valid User",
          email,
          password: "ValidPassword123!",
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toContain("valid email address");
      }
    });

    it("should reject whitespace-only or empty strings when required", async () => {
      const app = createTestApp((app) => {
        app.post("/test/empty", validate(registerValidator), (req, res) => {
          res.status(200).json({ success: true });
        });
      });

      const res = await request(app).post("/test/empty").send({
        name: "     ",
        email: "test@example.com",
        password: "ValidPassword123!",
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("cannot be empty or whitespace only");
    });
  });

  describe("Rejection of Unknown/Disallowed Properties (Strict Schemas)", () => {
    it("should strictly reject requests containing unexpected fields (mass assignment prevention)", async () => {
      const app = createTestApp((app) => {
        app.post("/test/strict-register", validate(registerValidator), (req, res) => {
          res.status(200).json({ success: true });
        });
      });

      const res = await request(app).post("/test/strict-register").send({
        name: "Legit User",
        email: "legit@example.com",
        password: "ValidPassword123!",
        isAdmin: true,              // Disallowed injected field
        injectedField: "malicious", // Disallowed injected field
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Unexpected field");
      expect(res.body.errors.some((err) => err.includes("isAdmin"))).toBe(true);
    });

    it("should strictly reject unexpected fields on login", async () => {
      const app = createTestApp((app) => {
        app.post("/test/strict-login", validate(loginValidator), (req, res) => {
          res.status(200).json({ success: true });
        });
      });

      const res = await request(app).post("/test/strict-login").send({
        email: "user@example.com",
        password: "Password123!",
        token: "fake-token", // Injected unexpected field
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Unexpected field 'body.token'");
    });

    it("should strictly reject unexpected fields on product creation", async () => {
      const app = createTestApp((app) => {
        app.post("/test/strict-product", validate(createProductValidator), (req, res) => {
          res.status(200).json({ success: true });
        });
      });

      const res = await request(app).post("/test/strict-product").send({
        title: "Test Product",
        description: "Valid product description here",
        price: 99.99,
        category: "507f1f77bcf86cd799439011",
        stock: 10,
        extraUnauthorizedField: "exploit",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Unexpected field 'body.extraUnauthorizedField'");
    });
  });

  describe("URL Parameter and Query String Validation", () => {
    it("should strictly validate :id route parameter against ObjectId schema", async () => {
      const app = createTestApp((app) => {
        app.get("/test/items/:id", validate(idParamValidator), (req, res) => {
          res.status(200).json({ success: true, id: req.params.id });
        });
      });

      // Valid 24-hex ObjectId
      const validRes = await request(app).get("/test/items/507f1f77bcf86cd799439011");
      expect(validRes.status).toBe(200);

      // Invalid format with 24 chars but non-hex char 'z'
      const invalidHexRes = await request(app).get("/test/items/507f1f77bcf86cd79943901z");
      expect(invalidHexRes.status).toBe(400);
      expect(invalidHexRes.body.success).toBe(false);
      expect(invalidHexRes.body.message).toContain("24-character hexadecimal ObjectId");

      // Short ID
      const shortIdRes = await request(app).get("/test/items/123");
      expect(shortIdRes.status).toBe(400);
      expect(shortIdRes.body.message).toContain("at least 24 characters");
    });

    it("should strictly validate query parameters on product list", async () => {
      const app = createTestApp((app) => {
        app.get("/test/products", validate(getProductsQueryValidator), (req, res) => {
          res.status(200).json({ success: true });
        });
      });

      // Valid query
      const validRes = await request(app).get("/test/products?page=2&limit=20&sort=price");
      expect(validRes.status).toBe(200);

      // Invalid query: unknown parameter
      const unknownQueryRes = await request(app).get("/test/products?unknownParam=bad");
      expect(unknownQueryRes.status).toBe(400);
      expect(unknownQueryRes.body.message).toContain("Unexpected field 'query.unknownParam'");

      // Invalid query: negative limit
      const invalidLimitRes = await request(app).get("/test/products?limit=-5");
      expect(invalidLimitRes.status).toBe(400);
      expect(invalidLimitRes.body.message).toContain("must be at least 1");

      // Invalid query: limit exceeds max allowed (100)
      const excessiveLimitRes = await request(app).get("/test/products?limit=500");
      expect(excessiveLimitRes.status).toBe(400);
      expect(excessiveLimitRes.body.message).toContain("cannot exceed 100");
    });
  });

  describe("Complex Domain Validation", () => {
    it("should reject product where discountPrice >= price", async () => {
      const app = createTestApp((app) => {
        app.post("/test/product-discount", validate(createProductValidator), (req, res) => {
          res.status(200).json({ success: true });
        });
      });

      const res = await request(app).post("/test/product-discount").send({
        title: "Test Product",
        description: "Valid product description here",
        price: 100,
        discountPrice: 150, // Invalid: discount price is greater than regular price
        category: "507f1f77bcf86cd799439011",
        stock: 5,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Discount price must be strictly less than the regular price");
    });

    it("should reject address with invalid Indian phone or pincode format", async () => {
      const app = createTestApp((app) => {
        app.post("/test/address", validate(createAddressValidator), (req, res) => {
          res.status(200).json({ success: true });
        });
      });

      // Invalid phone format (10 digits but starts with 1)
      const res1 = await request(app).post("/test/address").send({
        fullName: "John Doe",
        phone: "1234567890", // Invalid phone (must start with 6-9 in India)
        addressLine: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      });
      expect(res1.status).toBe(400);
      expect(res1.body.message).toContain("valid 10-digit Indian mobile number");

      // Invalid pincode (too short or starts with 0)
      const res2 = await request(app).post("/test/address").send({
        fullName: "John Doe",
        phone: "9876543210",
        addressLine: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "000001", // Invalid pincode (starts with 0)
      });
      expect(res2.status).toBe(400);
      expect(res2.body.message).toContain("6-digit Indian PIN code");
    });
  });
});
