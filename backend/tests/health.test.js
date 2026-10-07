import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB } from "./setup.js";

describe("Health Check Suite", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe("GET /api/v1/health", () => {
    it("should return 200 with complete system and database diagnostic status", async () => {
      const res = await request(app).get("/api/v1/health");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("API is running");
      expect(res.body.status).toBe("healthy");
      expect(res.body).toHaveProperty("timestamp");

      // Uptime validation
      expect(res.body).toHaveProperty("uptime");
      expect(typeof res.body.uptime.seconds).toBe("number");
      expect(typeof res.body.uptime.formatted).toBe("string");

      // Database service diagnostics
      expect(res.body).toHaveProperty("services");
      expect(res.body.services).toHaveProperty("database");
      expect(res.body.services.database.status).toBe("connected");
      expect(res.body.services.database.readyState).toBe(1);

      // System diagnostics
      expect(res.body).toHaveProperty("system");
      expect(res.body.system).toHaveProperty("nodeVersion");
      expect(res.body.system).toHaveProperty("environment");
      expect(res.body.system).toHaveProperty("memory");
      expect(res.body.system.memory).toHaveProperty("heapUsed");
      expect(res.body.system.memory).toHaveProperty("heapTotal");
      expect(res.body.system.memory).toHaveProperty("rss");

      // Response time
      expect(typeof res.body.responseTimeMs).toBe("number");
    });

    it("should succeed in strict mode when database is connected", async () => {
      const res = await request(app).get("/api/v1/health?strict=true");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe("healthy");
    });
  });

  describe("GET /health (Root health check alias)", () => {
    it("should respond at /health for container orchestrators and load balancers", async () => {
      const res = await request(app).get("/health");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("API is running");
      expect(res.body.status).toBe("healthy");
    });
  });
});
