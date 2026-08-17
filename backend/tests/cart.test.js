import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB } from "./setup.js";

describe("Cart Endpoints (/api/v1/cart)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  const timestamp = Date.now();
  let adminToken = "";
  let userToken = "";
  let productId = "";

  beforeAll(async () => {
    // Register Admin
    const adminRes = await request(app).post("/api/v1/auth/register").send({
      name: "Admin Cart",
      email: `admin_cart_${timestamp}@example.com`,
      password: "Password123!",
      role: "admin",
    });
    adminToken = adminRes.body.data?.token;

    // Register User
    const userRes = await request(app).post("/api/v1/auth/register").send({
      name: "User Cart",
      email: `user_cart_${timestamp}@example.com`,
      password: "Password123!",
      role: "user",
    });
    userToken = userRes.body.data?.token;

    // Create Category & Product
    const catRes = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: `Cart Cat ${timestamp}`, slug: `cart-cat-${timestamp}` });

    const prodRes = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: `Gaming Mouse ${timestamp}`,
        description: "High DPI optical gaming mouse",
        price: 800,
        stock: 5,
        category: catRes.body.data._id,
      });

    productId = prodRes.body.data._id;
  });

  it("GET /api/v1/cart - should fetch empty cart initially", async () => {
    const res = await request(app)
      .get("/api/v1/cart")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.summary.totalItems).toBe(0);
  });

  it("POST /api/v1/cart/items - should add product to cart", async () => {
    const res = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 2,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.summary.totalItems).toBe(2);
    expect(res.body.data.summary.subtotal).toBe(1600);
  });

  it("POST /api/v1/cart/items - should reject adding more than available stock (400)", async () => {
    const res = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 10,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("PATCH /api/v1/cart/items/:productId - should update item quantity in cart", async () => {
    const res = await request(app)
      .patch(`/api/v1/cart/items/${productId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 3 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.summary.totalItems).toBe(3);
    expect(res.body.data.summary.subtotal).toBe(2400);
  });

  it("DELETE /api/v1/cart/items/:productId - should remove item from cart", async () => {
    const res = await request(app)
      .delete(`/api/v1/cart/items/${productId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.items.length).toBe(0);
  });

  it("DELETE /api/v1/cart - should clear all items from cart", async () => {
    // Add item first
    await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 1 });

    const res = await request(app)
      .delete("/api/v1/cart")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.items.length).toBe(0);
  });
});
