import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB } from "./setup.js";
import User from "../src/models/User.js";

describe("Order Endpoints (/api/v1/orders)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  const timestamp = Date.now();
  let adminToken = "";
  let userAToken = "";
  let userBToken = "";
  let productId = "";
  let orderAId = "";
  let orderBId = "";

  beforeAll(async () => {
    // Register Admin
    const adminEmail = `admin_order_${timestamp}@example.com`;
    const adminRes = await request(app).post("/api/v1/auth/register").send({
      name: "Admin Order Test",
      email: adminEmail,
      password: "Password123!",
    });
    adminToken = adminRes.body.data?.token;
    await User.updateOne({ email: adminEmail }, { role: "admin" });

    // Register User A
    const userARes = await request(app).post("/api/v1/auth/register").send({
      name: "User A",
      email: `usera_${timestamp}@example.com`,
      password: "Password123!",
      role: "user",
    });
    userAToken = userARes.body.data?.token;

    // Register User B
    const userBRes = await request(app).post("/api/v1/auth/register").send({
      name: "User B",
      email: `userb_${timestamp}@example.com`,
      password: "Password123!",
      role: "user",
    });
    userBToken = userBRes.body.data?.token;

    // Create Category & Product (Stock = 10, Price = 1000)
    const catRes = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: `Order Cat ${timestamp}`, slug: `order-cat-${timestamp}` });

    const prodRes = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: `Order Monitor ${timestamp}`,
        description: "4K UHD IPS Monitor",
        price: 1000,
        stock: 10,
        category: catRes.body.data._id,
      });
    productId = prodRes.body.data._id;
  });

  it("POST /api/v1/orders - should fail if cart is empty (400)", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({
        shippingAddress: {
          fullName: "User A",
          phone: "+91 9876543210",
          addressLine: "123 Test St",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
        },
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/orders - should place order, decrement stock and empty cart", async () => {
    // 1. Add 2 units to cart
    await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ productId, quantity: 2 });

    // 2. Place Order
    const orderRes = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({
        shippingAddress: {
          fullName: "User A",
          phone: "+91 9876543210",
          addressLine: "123 Test St",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
          country: "India",
        },
        paymentMethod: "COD",
      });

    expect(orderRes.statusCode).toBe(201);
    expect(orderRes.body.success).toBe(true);
    expect(orderRes.body.data.pricing.subtotal).toBe(2000);
    expect(orderRes.body.data.pricing.total).toBe(2000);
    expect(orderRes.body.data.orderStatus).toBe("pending");
    orderAId = orderRes.body.data._id;

    // 3. Verify stock reduced to 8
    const prodRes = await request(app).get(`/api/v1/products/${productId}`);
    expect(prodRes.body.data.stock).toBe(8);

    // 4. Verify cart is cleared
    const cartRes = await request(app)
      .get("/api/v1/cart")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(cartRes.body.data.items.length).toBe(0);
  });

  it("Order Isolation - User B must NOT access User A's order (403)", async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderAId}`)
      .set("Authorization", `Bearer ${userBToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/orders/my-orders - should return only user's own orders", async () => {
    const res = await request(app)
      .get("/api/v1/orders/my-orders")
      .set("Authorization", `Bearer ${userAToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((o) => o._id === orderAId)).toBe(true);
  });

  it("GET /api/v1/orders - should allow admin to view all orders", async () => {
    const res = await request(app)
      .get("/api/v1/orders")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("PATCH /api/v1/orders/:id/status - should reject invalid order status (400)", async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${orderAId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ orderStatus: "invalid-status-xyz" });

    expect(res.statusCode).toBe(400);
  });

  it("PATCH /api/v1/orders/:id/status - should progress status and update payment on delivery", async () => {
    // pending -> confirmed
    const confRes = await request(app)
      .patch(`/api/v1/orders/${orderAId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ orderStatus: "confirmed" });
    expect(confRes.statusCode).toBe(200);
    expect(confRes.body.data.orderStatus).toBe("confirmed");

    // confirmed -> delivered
    const delivRes = await request(app)
      .patch(`/api/v1/orders/${orderAId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ orderStatus: "delivered" });
    expect(delivRes.statusCode).toBe(200);
    expect(delivRes.body.data.orderStatus).toBe("delivered");
    expect(delivRes.body.data.payment.status).toBe("completed");
  });

  describe("Customer Order Cancellation (PATCH /api/v1/orders/:id/cancel)", () => {
    let orderPendingId = "";
    let orderConfirmedId = "";
    let orderProcessingId = "";
    let cancelProductId = "";

    beforeAll(async () => {
      // Create product with Stock = 20
      const prodRes = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: `Cancel Test Product ${timestamp}`,
          description: "Testing cancellation stock restoration",
          price: 500,
          stock: 20,
          category: (await request(app).get("/api/v1/categories")).body.data[0]._id,
        });
      cancelProductId = prodRes.body.data._id;

      // 1. Create Order 1 for User A (will remain pending, qty = 3)
      await request(app)
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ productId: cancelProductId, quantity: 3 });

      const ord1 = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          shippingAddress: {
            fullName: "User A",
            phone: "+91 9876543210",
            addressLine: "123 Test St",
            city: "Bangalore",
            state: "Karnataka",
            pincode: "560001",
          },
        });
      orderPendingId = ord1.body.data._id;

      // 2. Create Order 2 for User A (will become confirmed, qty = 2)
      await request(app)
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ productId: cancelProductId, quantity: 2 });

      const ord2 = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          shippingAddress: {
            fullName: "User A",
            phone: "+91 9876543210",
            addressLine: "123 Test St",
            city: "Bangalore",
            state: "Karnataka",
            pincode: "560001",
          },
        });
      orderConfirmedId = ord2.body.data._id;
      await request(app)
        .patch(`/api/v1/orders/${orderConfirmedId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ orderStatus: "confirmed" });

      // 3. Create Order 3 for User A (will become processing, qty = 1)
      await request(app)
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ productId: cancelProductId, quantity: 1 });

      const ord3 = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          shippingAddress: {
            fullName: "User A",
            phone: "+91 9876543210",
            addressLine: "123 Test St",
            city: "Bangalore",
            state: "Karnataka",
            pincode: "560001",
          },
        });
      orderProcessingId = ord3.body.data._id;
      await request(app)
        .patch(`/api/v1/orders/${orderProcessingId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ orderStatus: "processing" });

      // Stock check: 20 - 3 - 2 - 1 = 14
      const pCheck = await request(app).get(`/api/v1/products/${cancelProductId}`);
      expect(pCheck.body.data.stock).toBe(14);
    });

    it("should reject cancellation if user does NOT own the order (403)", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${orderPendingId}/cancel`)
        .set("Authorization", `Bearer ${userBToken}`)
        .send({ reason: "I want to cancel A's order" });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should reject cancellation for processing, shipped, or delivered status (400)", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${orderProcessingId}/cancel`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ reason: "Changed my mind" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject cancellation if reason exceeds 250 characters (400)", async () => {
      const tooLongReason = "a".repeat(251);
      const res = await request(app)
        .patch(`/api/v1/orders/${orderPendingId}/cancel`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ reason: tooLongReason });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should successfully cancel pending order and restore stock (14 + 3 = 17)", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${orderPendingId}/cancel`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ reason: "Ordered by mistake" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderStatus).toBe("cancelled");
      expect(res.body.data.cancellationReason).toBe("Ordered by mistake");
      expect(res.body.data.cancelledBy).toBe("user");
      expect(res.body.data.payment.status).toBe("failed");
      expect(res.body.data.cancelledAt).toBeTruthy();

      // Check stock restored
      const pCheck = await request(app).get(`/api/v1/products/${cancelProductId}`);
      expect(pCheck.body.data.stock).toBe(17);
    });

    it("should reject duplicate cancellation attempt and NOT restore stock again", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${orderPendingId}/cancel`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ reason: "Cancelling again" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);

      // Stock should still be 17 (not 20!)
      const pCheck = await request(app).get(`/api/v1/products/${cancelProductId}`);
      expect(pCheck.body.data.stock).toBe(17);
    });

    it("should successfully cancel confirmed order and restore stock (17 + 2 = 19)", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${orderConfirmedId}/cancel`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ reason: "Found a better price" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderStatus).toBe("cancelled");
      expect(res.body.data.cancellationReason).toBe("Found a better price");

      // Stock should be 19
      const pCheck = await request(app).get(`/api/v1/products/${cancelProductId}`);
      expect(pCheck.body.data.stock).toBe(19);
    });
  });
});
