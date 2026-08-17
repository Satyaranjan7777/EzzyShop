import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB } from "./setup.js";

describe("Address Endpoints (/api/v1/addresses)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  const timestamp = Date.now();
  let userToken = "";
  let addressId = "";

  beforeAll(async () => {
    const userRes = await request(app).post("/api/v1/auth/register").send({
      name: "Address Tester",
      email: `addr_tester_${timestamp}@example.com`,
      password: "Password123!",
      role: "user",
    });
    userToken = userRes.body.data?.token;
  });

  it("POST /api/v1/addresses - should create a new address", async () => {
    const res = await request(app)
      .post("/api/v1/addresses")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        fullName: "Address Tester",
        phone: "+91 9876543210",
        addressLine: "Flat 101, Horizon Towers",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        country: "India",
        isDefault: true,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data.isDefault).toBe(true);
    addressId = res.body.data._id;
  });

  it("POST /api/v1/addresses - should fail on missing required fields (400)", async () => {
    const res = await request(app)
      .post("/api/v1/addresses")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        fullName: "A", // too short
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/addresses - should get list of user addresses", async () => {
    const res = await request(app)
      .get("/api/v1/addresses")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("PATCH /api/v1/addresses/:id - should update address details", async () => {
    const res = await request(app)
      .patch(`/api/v1/addresses/${addressId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ city: "Mumbai", pincode: "400001" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.city).toBe("Mumbai");
    expect(res.body.data.pincode).toBe("400001");
  });

  it("DELETE /api/v1/addresses/:id - should delete address", async () => {
    const res = await request(app)
      .delete(`/api/v1/addresses/${addressId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
