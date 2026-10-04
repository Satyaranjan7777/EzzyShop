import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import logger from "./src/utils/logger.js";
import seedMaster from "./src/seeds/seedMaster.js";

// Load environment variables silently
dotenv.config({ quiet: true });

// Verify required critical environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  logger.error(
    `[SECURITY CONFIG ERROR] Missing required environment variables:\n   - ${missingEnvVars.join("\n   - ")}`
  );
  process.exit(1);
}

// Global process error handlers for unhandled errors outside the Express request-response cycle
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception detected - terminating process for safety`, error);
  process.exit(1);
});

const PORT = process.env.PORT || 5001;

// Connect to MongoDB & Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-verify Master Account silently in background
    try {
      await seedMaster({ silent: true });
    } catch (seedErr) {
      logger.warn(`Master seed verification warning: ${seedErr.message}`);
    }

    const server = app.listen(PORT, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
      );
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason) => {
      logger.error(`Unhandled Promise Rejection detected`, reason);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`, error);
    process.exit(1);
  }
};

startServer();

export default app;
