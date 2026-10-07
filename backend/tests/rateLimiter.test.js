import express from "express";
import request from "supertest";
import {
  createPublicRateLimiter,
  createUserRateLimiter,
  createAuthRateLimiter,
  MemoryStore,
  getClientIp,
  getAccountIdentifier,
} from "../src/middleware/rateLimiter.middleware.js";

describe("Rate Limiter Middleware", () => {
  describe("Utility Functions", () => {
    it("should extract client IP correctly from headers and fallbacks", () => {
      const req1 = { headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" } };
      expect(getClientIp(req1)).toBe("203.0.113.195");

      const req2 = { headers: {}, ip: "::ffff:192.0.2.1" };
      expect(getClientIp(req2)).toBe("192.0.2.1");

      const req3 = { headers: {}, ip: "::1" };
      expect(getClientIp(req3)).toBe("127.0.0.1");

      const req4 = { headers: {}, socket: { remoteAddress: "10.0.0.1" } };
      expect(getClientIp(req4)).toBe("10.0.0.1");
    });

    it("should extract and normalize account identifier from body or user object", () => {
      const req1 = { body: { email: "  User.Test@Example.COM " } };
      expect(getAccountIdentifier(req1)).toBe("user.test@example.com");

      const req2 = { body: { username: "Admin_Master" } };
      expect(getAccountIdentifier(req2)).toBe("admin_master");

      const req3 = { body: {}, user: { email: "user@domain.com" } };
      expect(getAccountIdentifier(req3)).toBe("user@domain.com");

      const req4 = { body: null };
      expect(getAccountIdentifier(req4)).toBeNull();
    });
  });

  describe("Public Rate Limiter (Moderate, IP-based)", () => {
    let app;
    let store;

    beforeEach(() => {
      store = new MemoryStore();
      app = express();
      app.use(express.json());

      const publicLimiter = createPublicRateLimiter({
        windowMs: 60000,
        max: 3,
        message: "Public rate limit reached",
        store,
      });

      app.get("/test/public", publicLimiter, (req, res) => {
        res.status(200).json({ success: true, message: "OK" });
      });
    });

    afterEach(() => {
      store.destroy();
    });

    it("should allow requests up to max and return standard rate limit headers", async () => {
      const res1 = await request(app).get("/test/public");
      expect(res1.status).toBe(200);
      expect(res1.headers["ratelimit-limit"]).toBe("3");
      expect(res1.headers["ratelimit-remaining"]).toBe("2");

      const res2 = await request(app).get("/test/public");
      expect(res2.status).toBe(200);
      expect(res2.headers["ratelimit-remaining"]).toBe("1");

      const res3 = await request(app).get("/test/public");
      expect(res3.status).toBe(200);
      expect(res3.headers["ratelimit-remaining"]).toBe("0");
    });

    it("should block requests exceeding max with HTTP 429 and Retry-After header", async () => {
      await request(app).get("/test/public");
      await request(app).get("/test/public");
      await request(app).get("/test/public");

      // 4th request exceeds max (3)
      const res4 = await request(app).get("/test/public");
      expect(res4.status).toBe(429);
      expect(res4.body.success).toBe(false);
      expect(res4.body.message).toBe("Public rate limit reached");
      expect(res4.headers["retry-after"]).toBeDefined();
      expect(parseInt(res4.headers["retry-after"], 10)).toBeGreaterThan(0);
    });
  });

  describe("Authenticated User Rate Limiter (Looser, User ID-based)", () => {
    let app;
    let store;

    beforeEach(() => {
      store = new MemoryStore();
      app = express();
      app.use(express.json());

      // Mock authentication middleware
      app.use((req, res, next) => {
        const userId = req.headers["x-test-user-id"];
        if (userId) {
          req.user = { id: userId, email: `${userId}@test.com` };
        }
        next();
      });

      const userLimiter = createUserRateLimiter({
        windowMs: 60000,
        max: 4,
        store,
      });

      app.get("/test/user", userLimiter, (req, res) => {
        res.status(200).json({ success: true, user: req.user?.id });
      });
    });

    afterEach(() => {
      store.destroy();
    });

    it("should isolate rate limits per user ID", async () => {
      // User 1 uses 4 requests (hits limit)
      for (let i = 0; i < 4; i++) {
        const res = await request(app).get("/test/user").set("x-test-user-id", "user_1");
        expect(res.status).toBe(200);
      }

      // User 1 is now blocked
      const user1Blocked = await request(app).get("/test/user").set("x-test-user-id", "user_1");
      expect(user1Blocked.status).toBe(429);

      // User 2 is not affected and can still make requests
      const user2Req = await request(app).get("/test/user").set("x-test-user-id", "user_2");
      expect(user2Req.status).toBe(200);
      expect(user2Req.headers["ratelimit-remaining"]).toBe("3");
    });
  });

  describe("Auth Routes Rate Limiter (Exponential Backoff, Dual IP + Account)", () => {
    let app;
    let store;

    beforeEach(() => {
      store = new MemoryStore();
      app = express();
      app.use(express.json());

      const authLimiter = createAuthRateLimiter({
        windowMs: 60000,
        ipMax: 3,
        accountMax: 2,
        baseDelayMs: 200, // 200ms base delay for fast tests
        backoffFactor: 2,  // 200ms -> 400ms -> 800ms
        maxDelayMs: 10000,
        resetOnSuccess: true,
        store,
      });

      app.post("/test/auth/login", authLimiter, (req, res) => {
        const { email, password } = req.body;
        if (password === "correct_password") {
          return res.status(200).json({ success: true, message: "Logged in" });
        }
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      });
    });

    afterEach(() => {
      store.destroy();
    });

    it("should enforce per-account limits with exponential backoff on failed logins", async () => {
      const email = "target@example.com";

      // Attempt 1: fails (401)
      const res1 = await request(app)
        .post("/test/auth/login")
        .send({ email, password: "wrong" });
      expect(res1.status).toBe(401);

      // Attempt 2: fails (401) -> reaches accountMax = 2!
      const res2 = await request(app)
        .post("/test/auth/login")
        .send({ email, password: "wrong" });
      expect(res2.status).toBe(401);

      // Attempt 3 (immediate retry): blocked by exponential backoff (HTTP 429)
      const res3 = await request(app)
        .post("/test/auth/login")
        .send({ email, password: "wrong" });
      expect(res3.status).toBe(429);
      expect(res3.body.success).toBe(false);
      expect(res3.headers["retry-after"]).toBeDefined();
      expect(res3.body.message).toContain("Too many attempts for account");

      // Wait for the 200ms exponential cooldown to expire
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Attempt 4: cooldown passed! Request is allowed to try
      const res4 = await request(app)
        .post("/test/auth/login")
        .send({ email, password: "wrong" });
      // Failed again (401) -> next backoff doubles to 400ms!
      expect(res4.status).toBe(401);

      // Attempt 5 (immediate): blocked again
      const res5 = await request(app)
        .post("/test/auth/login")
        .send({ email, password: "wrong" });
      expect(res5.status).toBe(429);
    });

    it("should enforce per-account limits across multiple different client IPs", async () => {
      const email = "distributed_target@example.com";

      // Attacker from IP 1 attempts account
      const res1 = await request(app)
        .post("/test/auth/login")
        .set("x-forwarded-for", "1.1.1.1")
        .send({ email, password: "wrong" });
      expect(res1.status).toBe(401);

      // Attacker from IP 2 attempts same account (account reaches limit 2)
      const res2 = await request(app)
        .post("/test/auth/login")
        .set("x-forwarded-for", "2.2.2.2")
        .send({ email, password: "wrong" });
      expect(res2.status).toBe(401);

      // Attacker from IP 3 attempts same account -> blocked by account limit!
      const res3 = await request(app)
        .post("/test/auth/login")
        .set("x-forwarded-for", "3.3.3.3")
        .send({ email, password: "wrong" });
      expect(res3.status).toBe(429);
      expect(res3.body.message).toContain("Too many attempts for account");
    });

    it("should enforce per-IP limits even across different account emails (credential stuffing)", async () => {
      const ip = "198.51.100.50";

      // Attempt on email 1 (IP attempts: 1)
      const res1 = await request(app)
        .post("/test/auth/login")
        .set("x-forwarded-for", ip)
        .send({ email: "user1@example.com", password: "wrong" });
      expect(res1.status).toBe(401);

      // Attempt on email 2 (IP attempts: 2)
      const res2 = await request(app)
        .post("/test/auth/login")
        .set("x-forwarded-for", ip)
        .send({ email: "user2@example.com", password: "wrong" });
      expect(res2.status).toBe(401);

      // Attempt on email 3 (IP attempts: 3 -> reaches ipMax = 3)
      const res3 = await request(app)
        .post("/test/auth/login")
        .set("x-forwarded-for", ip)
        .send({ email: "user3@example.com", password: "wrong" });
      expect(res3.status).toBe(401);

      // Attempt on email 4 from same IP -> blocked by IP limit!
      const res4 = await request(app)
        .post("/test/auth/login")
        .set("x-forwarded-for", ip)
        .send({ email: "user4@example.com", password: "wrong" });
      expect(res4.status).toBe(429);
      expect(res4.body.message).toContain("Too many authentication requests from this IP");
    });

    it("should reset account tracker on successful login (resetOnSuccess)", async () => {
      const email = "legitimate_user@example.com";

      // 1 failed attempt
      await request(app)
        .post("/test/auth/login")
        .send({ email, password: "wrong" });

      // Successful login
      const successRes = await request(app)
        .post("/test/auth/login")
        .send({ email, password: "correct_password" });
      expect(successRes.status).toBe(200);

      // Account record should be cleared from store
      const accountRecord = store.get(`auth:account:${email}`);
      expect(accountRecord).toBeUndefined();
    });
  });
});
