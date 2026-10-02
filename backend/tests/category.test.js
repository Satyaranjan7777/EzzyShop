import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB } from "./setup.js";
import User from "../src/models/User.js";

describe("Category Endpoints (/api/v1/categories)", () => {
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

  beforeAll(async () => {
    // Register Admin
    const adminEmail = `admin_cat_${timestamp}@example.com`;
    const adminRes = await request(app).post("/api/v1/auth/register").send({
      name: "Admin Cat",
      email: adminEmail,
      password: "Password123!",
    });
    adminToken = adminRes.body.data?.token;
    await User.updateOne({ email: adminEmail }, { role: "admin" });

    // Register User
    const userRes = await request(app).post("/api/v1/auth/register").send({
      name: "User Cat",
      email: `user_cat_${timestamp}@example.com`,
      password: "Password123!",
      role: "user",
    });
    userToken = userRes.body.data?.token;
  });

  it("POST /api/v1/categories - should allow admin to create category", async () => {
    const res = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Jest Category ${timestamp}`,
        slug: `jest-category-${timestamp}`,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("_id");
    categoryId = res.body.data._id;
  });

  it("POST /api/v1/categories - should block regular user (403 Forbidden)", async () => {
    const res = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: `Unauthorized Cat ${timestamp}`,
      });

    expect(res.statusCode).toBe(403);
  });

  it("POST /api/v1/categories - should reject unauthenticated request (401)", async () => {
    const res = await request(app)
      .post("/api/v1/categories")
      .send({ name: "No Auth Cat" });

    expect(res.statusCode).toBe(401);
  });

  it("GET /api/v1/categories - should return public list of categories", async () => {
    const res = await request(app).get("/api/v1/categories");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/v1/categories/:id - should return single category by ID", async () => {
    const res = await request(app).get(`/api/v1/categories/${categoryId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(categoryId);
  });

  it("PATCH /api/v1/categories/:id - should allow admin to update category", async () => {
    const res = await request(app)
      .patch(`/api/v1/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: `Updated Jest Category ${timestamp}` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe(`Updated Jest Category ${timestamp}`);
  });

  it("DELETE /api/v1/categories/:id - should allow admin to delete unused category", async () => {
    // Create temporary category to delete
    const tempRes = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: `Temp Cat ${timestamp}`, slug: `temp-cat-${timestamp}` });

    const tempId = tempRes.body.data._id;

    const delRes = await request(app)
      .delete(`/api/v1/categories/${tempId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);
  });
});
