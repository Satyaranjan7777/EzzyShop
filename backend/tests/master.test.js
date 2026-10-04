import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import { connectTestDB, closeTestDB } from "./setup.js";
import bcrypt from "bcryptjs";

describe("Master Account & Admin Management Suite", () => {
  let masterToken = "";
  let adminToken = "";
  let userToken = "";
  let createdAdminId = "";

  const timestamp = Date.now();
  const masterEmail = `master_${timestamp}@test.com`;
  const adminEmail = `admin_${timestamp}@test.com`;
  const userEmail = `user_${timestamp}@test.com`;
  const defaultPassword = "Password123!";

  beforeAll(async () => {
    await connectTestDB();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Create Master User
    const masterUser = await User.create({
      name: "Test Master",
      email: masterEmail,
      password: hashedPassword,
      role: "master",
      isActive: true,
    });

    // Create Regular Admin
    const adminUser = await User.create({
      name: "Test Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    // Create Regular Customer
    const normalUser = await User.create({
      name: "Test Customer",
      email: userEmail,
      password: hashedPassword,
      role: "user",
      isActive: true,
    });

    // Log in as Master
    const masterLoginRes = await request(app)
      .post("/api/v1/master/login")
      .send({ email: masterEmail, password: defaultPassword });
    masterToken = masterLoginRes.body.data.token;

    // Log in as Admin via standard login
    const adminLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: adminEmail, password: defaultPassword });
    adminToken = adminLoginRes.body.data.token;

    // Log in as User via standard login
    const userLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userEmail, password: defaultPassword });
    userToken = userLoginRes.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({
      email: { $in: [masterEmail, adminEmail, userEmail] },
    });
    if (createdAdminId) {
      await User.findByIdAndDelete(createdAdminId);
    }
    await closeTestDB();
  });

  describe("1. Master Login Route (`POST /api/v1/master/login`)", () => {
    it("should successfully authenticate master and return token with master role", async () => {
      const res = await request(app)
        .post("/api/v1/master/login")
        .send({ email: masterEmail, password: defaultPassword });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user.role).toBe("master");
    });

    it("should reject customer attempts to log in via master login route with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/v1/master/login")
        .send({ email: userEmail, password: defaultPassword });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Master privileges required");
    });

    it("should reject admin attempts to log in via master login route with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/v1/master/login")
        .send({ email: adminEmail, password: defaultPassword });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Master privileges required");
    });

    it("should reject invalid password with 401 Unauthorized", async () => {
      const res = await request(app)
        .post("/api/v1/master/login")
        .send({ email: masterEmail, password: "WrongPassword999!" });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("2. Public Registration Security Hardening", () => {
    it("should reject customer registration attempting to claim 'admin' role", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Hacker Admin",
          email: `hacker_${Date.now()}@test.com`,
          password: "Password123!",
          role: "admin",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("elevated roles");
    });

    it("should reject customer registration attempting to claim 'master' role", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Hacker Master",
          email: `hackermaster_${Date.now()}@test.com`,
          password: "Password123!",
          role: "master",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("3. Admin Management by Master (`/api/v1/master/admins`)", () => {
    it("should allow master to create a new admin", async () => {
      const newAdminEmail = `newadmin_${Date.now()}@ezzyshop.com`;
      const res = await request(app)
        .post("/api/v1/master/admins")
        .set("Authorization", `Bearer ${masterToken}`)
        .send({
          name: "Subordinate Admin",
          email: newAdminEmail,
          password: "SecureAdminPass1!",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.admin.role).toBe("admin");
      expect(res.body.data.admin.email).toBe(newAdminEmail);

      createdAdminId = res.body.data.admin._id;
    });

    it("should forbid regular customer from creating an admin", async () => {
      const res = await request(app)
        .post("/api/v1/master/admins")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Unauthorized Admin",
          email: `unauth_${Date.now()}@test.com`,
          password: "SecureAdminPass1!",
        });

      expect(res.statusCode).toBe(403);
    });

    it("should forbid existing admin from creating an admin (only Master has access)", async () => {
      const res = await request(app)
        .post("/api/v1/master/admins")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Admin Trying To Create Admin",
          email: `admin2admin_${Date.now()}@test.com`,
          password: "SecureAdminPass1!",
        });

      expect(res.statusCode).toBe(403);
    });

    it("should allow master to list all admins", async () => {
      const res = await request(app)
        .get("/api/v1/master/admins")
        .set("Authorization", `Bearer ${masterToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.admins)).toBe(true);
      expect(res.body.data.admins.some((a) => a.email === adminEmail)).toBe(true);
    });

    it("should allow master to update an admin's status", async () => {
      expect(createdAdminId).toBeTruthy();

      const res = await request(app)
        .put(`/api/v1/master/admins/${createdAdminId}`)
        .set("Authorization", `Bearer ${masterToken}`)
        .send({ isActive: false });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.admin.isActive).toBe(false);
    });

    it("should allow master to delete an admin", async () => {
      expect(createdAdminId).toBeTruthy();

      const res = await request(app)
        .delete(`/api/v1/master/admins/${createdAdminId}`)
        .set("Authorization", `Bearer ${masterToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion from DB
      const found = await User.findById(createdAdminId);
      expect(found).toBeNull();
      createdAdminId = null;
    });
  });

  describe("4. Separation of Duties: Master Strictly Forbidden from Mutating Products", () => {
    it("should reject Master from creating products with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${masterToken}`)
        .send({
          title: "Master Product Attempt",
          description: "This should fail",
          price: 100,
          category: "507f1f77bcf86cd799439011",
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("restricted from modifying catalog products");
    });

    it("should reject Master from updating products with 403 Forbidden", async () => {
      const res = await request(app)
        .patch("/api/v1/products/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${masterToken}`)
        .send({ title: "Updated by Master" });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("restricted from modifying catalog products");
    });

    it("should reject Master from deleting products with 403 Forbidden", async () => {
      const res = await request(app)
        .delete("/api/v1/products/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${masterToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("restricted from modifying catalog products");
    });
  });

  describe("5. Master Platform Overview & Admin Activity Audit Trail", () => {
    it("should allow master to view platform overview metrics", async () => {
      const res = await request(app)
        .get("/api/v1/master/overview")
        .set("Authorization", `Bearer ${masterToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("stats");
      expect(res.body.data.stats).toHaveProperty("admins");
      expect(res.body.data.stats).toHaveProperty("products");
      expect(res.body.data.stats).toHaveProperty("orders");
    });

    it("should allow master to query activity audit trail", async () => {
      const res = await request(app)
        .get("/api/v1/master/activities")
        .set("Authorization", `Bearer ${masterToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.activities)).toBe(true);
      expect(res.body.data).toHaveProperty("pagination");
    });
  });
});
