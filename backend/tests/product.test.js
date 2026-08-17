import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB } from "./setup.js";

describe("Product Endpoints (/api/v1/products)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  const timestamp = Date.now();
  let adminToken = "";
  let userToken = "";
  let categoryId = "";
  let productId = "";

  beforeAll(async () => {
    const adminRes = await request(app).post("/api/v1/auth/register").send({
      name: "Admin Prod",
      email: `admin_prod_${timestamp}@example.com`,
      password: "Password123!",
      role: "admin",
    });
    adminToken = adminRes.body.data?.token;

    const userRes = await request(app).post("/api/v1/auth/register").send({
      name: "User Prod",
      email: `user_prod_${timestamp}@example.com`,
      password: "Password123!",
      role: "user",
    });
    userToken = userRes.body.data?.token;

    const catRes = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: `Prod Category ${timestamp}`, slug: `prod-cat-${timestamp}` });
    categoryId = catRes.body.data?._id;
  });

  it("POST /api/v1/products - should create product with valid admin credentials", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: `Jest Mechanical Keyboard ${timestamp}`,
        description: "RGB Mechanical Keyboard with Blue Switches",
        price: 1500,
        stock: 25,
        category: categoryId,
        images: ["https://placehold.co/400x400.png"],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data.stock).toBe(25);
    expect(res.body.data.price).toBe(1500);
    productId = res.body.data._id;
  });

  it("POST /api/v1/products - should reject user without admin privileges (403)", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: `Unauthorized Keyboard ${timestamp}`,
        description: "Test description",
        price: 500,
        stock: 5,
        category: categoryId,
      });

    expect(res.statusCode).toBe(403);
  });

  it("POST /api/v1/products - should fail on missing title / invalid price (400)", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        price: -50,
        stock: 10,
        category: categoryId,
      });

    expect(res.statusCode).toBe(400);
  });

  it("GET /api/v1/products - should return list of products with pagination", async () => {
    const res = await request(app).get("/api/v1/products?page=1&limit=5");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("pagination");
  });

  it("GET /api/v1/products - should filter products by search and category", async () => {
    const res = await request(app).get(
      `/api/v1/products?search=Mechanical&category=${categoryId}&minPrice=1000&maxPrice=2000`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/v1/products/:id - should get single product details", async () => {
    const res = await request(app).get(`/api/v1/products/${productId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(productId);
    expect(res.body.data.title).toContain("Mechanical Keyboard");
  });

  it("PATCH /api/v1/products/:id - should update product details (admin)", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 1400, stock: 30 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.price).toBe(1400);
    expect(res.body.data.stock).toBe(30);
  });
});
