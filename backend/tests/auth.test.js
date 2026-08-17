import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB } from "./setup.js";

describe("Auth Endpoints (/api/v1/auth)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  const timestamp = Date.now();
  const testUser = {
    name: "Jest Test User",
    email: `jest_user_${timestamp}@example.com`,
    password: "Password123!",
    role: "user",
  };

  let authToken = "";

  it("GET /api/v1/health - should return API health status", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("API is running");
  });

  it("POST /api/v1/auth/register - should register a new user successfully", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user).toHaveProperty("email", testUser.email);
    expect(res.body.data.user).not.toHaveProperty("password");

    authToken = res.body.data.token;
  });

  it("POST /api/v1/auth/register - should fail on duplicate email", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/auth/register - should fail on invalid/missing fields", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "invalid-email",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/auth/login - should login user with valid credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
  });

  it("POST /api/v1/auth/login - should fail with wrong password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: "WrongPassword!",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/auth/me - should fetch user profile with valid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("GET /api/v1/auth/me - should reject access without token", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
