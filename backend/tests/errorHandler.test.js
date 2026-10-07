import express from "express";
import request from "supertest";
import { errorHandler } from "../src/middleware/error.middleware.js";
import ApiError from "../src/utils/ApiError.js";
import logger from "../src/utils/logger.js";

const createTestApp = (registerRoutes) => {
  const app = express();
  app.use(express.json());
  registerRoutes(app);
  app.use(errorHandler);
  return app;
};

describe("Global Error Handling & Information Leakage Prevention", () => {
  let origConsoleError;
  let origConsoleWarn;
  const errorLogs = [];
  const warnLogs = [];

  beforeAll(() => {
    origConsoleError = console.error;
    origConsoleWarn = console.warn;
  });

  afterAll(() => {
    console.error = origConsoleError;
    console.warn = origConsoleWarn;
  });

  beforeEach(() => {
    errorLogs.length = 0;
    warnLogs.length = 0;
    console.error = (...args) => {
      errorLogs.push(args.join(" "));
    };
    console.warn = (...args) => {
      warnLogs.push(args.join(" "));
    };
  });

  describe("500 Internal Server Errors & Stack Trace Shielding", () => {
    it("should return generic message and NEVER leak stack traces to client", async () => {
      const app = createTestApp((router) => {
        router.get("/test/crash", (req, res, next) => {
          const error = new Error("Unexpected database connection crash: connect ECONNREFUSED 127.0.0.1:27017");
          next(error);
        });
      });

      const res = await request(app).get("/test/crash");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("An internal server error occurred. Please try again later.");
      expect(res.body.stack).toBeUndefined();
      expect(res.body.errors).toBeUndefined();
      // Ensure raw database hosts and exception messages are never leaked in payload
      expect(JSON.stringify(res.body)).not.toContain("ECONNREFUSED");
      expect(JSON.stringify(res.body)).not.toContain("127.0.0.1");

      // Verify server-side logging captured the full error details
      expect(errorLogs.length).toBeGreaterThan(0);
      const combinedLogs = errorLogs.join("\n");
      expect(combinedLogs).toContain("[SERVER_ERROR 500]");
      expect(combinedLogs).toContain("ECONNREFUSED");
    });

    it("should never expose stack traces even if NODE_ENV is development", async () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      try {
        const app = createTestApp((router) => {
          router.get("/test/dev-stack", (req, res, next) => {
            const err = new TypeError("Cannot read properties of undefined (reading 'token')");
            next(err);
          });
        });

        const res = await request(app).get("/test/dev-stack");

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("An internal server error occurred. Please try again later.");
        expect(res.body.stack).toBeUndefined();
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });

    it("should mask 500 ApiError with internal messages to generic user response", async () => {
      const app = createTestApp((router) => {
        router.get("/test/internal-apierror", (req, res, next) => {
          const err = new ApiError(500, "Internal query timeout on table users");
          next(err);
        });
      });

      const res = await request(app).get("/test/internal-apierror");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("An internal server error occurred. Please try again later.");
      expect(res.body.stack).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain("table users");
    });
  });

  describe("Filesystem Paths & System Details Scrubbing", () => {
    it("should scrub Windows drive paths from error responses", async () => {
      const app = createTestApp((router) => {
        router.get("/test/windows-path", (req, res, next) => {
          const err = new Error("ENOENT: no such file or directory, open 'D:\\MERN Stack Practice Project\\e-Commerce\\backend\\secret.json'");
          err.code = "ENOENT";
          next(err);
        });
      });

      const res = await request(app).get("/test/windows-path");

      expect(res.status).toBe(500);
      expect(JSON.stringify(res.body)).not.toContain("D:\\MERN");
      expect(JSON.stringify(res.body)).not.toContain("secret.json");
      expect(res.body.stack).toBeUndefined();
    });

    it("should scrub POSIX paths from error responses", async () => {
      const app = createTestApp((router) => {
        router.get("/test/posix-path", (req, res, next) => {
          const err = new Error("EACCES: permission denied, open '/var/www/ecommerce/config/production.env'");
          err.code = "EACCES";
          next(err);
        });
      });

      const res = await request(app).get("/test/posix-path");

      expect(res.status).toBe(500);
      expect(JSON.stringify(res.body)).not.toContain("/var/www");
      expect(JSON.stringify(res.body)).not.toContain("production.env");
    });
  });

  describe("Database Error Normalization & Abstraction", () => {
    it("should safely format Mongoose CastError without leaking internal schema or raw values", async () => {
      const app = createTestApp((router) => {
        router.get("/test/casterror", (req, res, next) => {
          const err = new Error('Cast to ObjectId failed for value "{ \'$gt\': \'\' }" at path "_id" for model "Product"');
          err.name = "CastError";
          err.path = "_id";
          err.value = { $gt: "" };
          next(err);
        });
      });

      const res = await request(app).get("/test/casterror");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid format for field '_id'.");
      expect(JSON.stringify(res.body)).not.toContain("$gt");
      expect(JSON.stringify(res.body)).not.toContain("Product");
    });

    it("should normalize MongoDB Duplicate Key Error (11000) without leaking collection or index", async () => {
      const app = createTestApp((router) => {
        router.post("/test/duplicate", (req, res, next) => {
          const err = new Error("E11000 duplicate key error collection: ezzy_shop.users index: email_1 dup key: { email: 'alice@example.com' }");
          err.code = 11000;
          err.keyValue = { email: "alice@example.com" };
          next(err);
        });
      });

      const res = await request(app).post("/test/duplicate");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("A record with this email already exists.");
      expect(JSON.stringify(res.body)).not.toContain("ezzy_shop");
      expect(JSON.stringify(res.body)).not.toContain("email_1");
    });

    it("should catch raw MongoServerError and return safe database error message", async () => {
      const app = createTestApp((router) => {
        router.get("/test/mongoserver", (req, res, next) => {
          const err = new Error("MongoServerError: not master and slaveOk=false");
          err.name = "MongoServerError";
          next(err);
        });
      });

      const res = await request(app).get("/test/mongoserver");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("A database error occurred. Please try again later.");
      expect(JSON.stringify(res.body)).not.toContain("not master");
    });

    it("should format Mongoose ValidationError with clean field messages", async () => {
      const app = createTestApp((router) => {
        router.post("/test/mongoose-validation", (req, res, next) => {
          const err = new Error("Product validation failed");
          err.name = "ValidationError";
          err.errors = {
            title: { path: "title", message: "Title is required" },
            price: { path: "price", message: "Price must be positive" },
          };
          next(err);
        });
      });

      const res = await request(app).post("/test/mongoose-validation");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation Error");
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors).toContain("title: Title is required");
      expect(res.body.errors).toContain("price: Price must be positive");
    });
  });

  describe("Protocol & Parser Errors", () => {
    it("should safely handle malformed JSON body parser SyntaxError", async () => {
      const app = createTestApp((router) => {
        router.post("/test/malformed-json", (req, res) => res.json({ ok: true }));
      });

      // Send broken JSON syntax
      const res = await request(app)
        .post("/test/malformed-json")
        .set("Content-Type", "application/json")
        .send('{"invalid": json');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Malformed JSON payload in request body.");
      expect(res.body.stack).toBeUndefined();
    });

    it("should safely handle CORS rejection error", async () => {
      const app = createTestApp((router) => {
        router.get("/test/cors-error", (req, res, next) => {
          next(new Error("Not allowed by CORS"));
        });
      });

      const res = await request(app).get("/test/cors-error");

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Request blocked by CORS policy.");
    });

    it("should safely handle JWT verification errors", async () => {
      const app = createTestApp((router) => {
        router.get("/test/jwt-invalid", (req, res, next) => {
          const err = new Error("invalid signature");
          err.name = "JsonWebTokenError";
          next(err);
        });
      });

      const res = await request(app).get("/test/jwt-invalid");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid authentication token. Please authenticate again.");
    });
  });

  describe("Operational ApiErrors (4xx)", () => {
    it("should preserve client-facing validation messages while scrubbing internal paths", async () => {
      const app = createTestApp((router) => {
        router.post("/test/operational", (req, res, next) => {
          next(new ApiError(400, "Please provide a valid quantity between 1 and 100"));
        });
      });

      const res = await request(app).post("/test/operational");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Please provide a valid quantity between 1 and 100");
    });
  });
});
