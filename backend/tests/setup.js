import mongoose from "mongoose";
import dotenv from "dotenv";
import { rateLimitStore } from "../src/middleware/rateLimiter.middleware.js";

dotenv.config();

if (typeof jest !== "undefined") {
  jest.setTimeout(60000);
}

export const connectTestDB = async () => {
  rateLimitStore.resetAll();
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
};

export const closeTestDB = async () => {
  rateLimitStore.resetAll();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

