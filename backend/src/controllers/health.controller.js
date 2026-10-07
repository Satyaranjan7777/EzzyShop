import mongoose from "mongoose";

/**
 * Formats uptime in seconds to a readable human format (e.g., "1d 4h 12m 30s")
 * @param {number} seconds
 * @returns {string}
 */
const formatUptime = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
};

/**
 * Returns human-readable label for Mongoose readyState
 * @param {number} state
 * @returns {string}
 */
const getDbStatusString = (state) => {
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "unknown";
  }
};

/**
 * Health check controller providing system uptime, memory usage,
 * and database connection diagnostics.
 *
 * @route GET /api/v1/health
 * @route GET /health
 */
export const getHealthStatus = async (req, res) => {
  const startTime = Date.now();
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  let dbPingMs = null;
  if (isDbConnected && mongoose.connection.db) {
    try {
      const pingStart = Date.now();
      await mongoose.connection.db.admin().ping();
      dbPingMs = Date.now() - pingStart;
    } catch {
      dbPingMs = null;
    }
  }

  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = process.uptime();
  const isHealthy = isDbConnected;

  // Strict check (useful for Kubernetes readiness probes / load balancers)
  const isStrict = req.query.strict === "true" || req.query.readiness === "true";
  const statusCode = isStrict && !isHealthy ? 503 : 200;

  res.status(statusCode).json({
    success: !isStrict || isHealthy,
    message: isStrict && !isHealthy ? "Service degraded - Database unavailable" : "API is running",
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptimeSeconds),
      formatted: formatUptime(uptimeSeconds),
    },
    services: {
      database: {
        status: getDbStatusString(dbState),
        readyState: dbState,
        latencyMs: dbPingMs,
      },
    },
    system: {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
      memory: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
      },
    },
    responseTimeMs: Date.now() - startTime,
  });
};
