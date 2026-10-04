import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Load environment variables silently
dotenv.config({ quiet: true });

const MASTER_CREDENTIALS = {
  name: "Master Admin",
  email: "satyaranjan@gmail.com",
  plainPassword: "Master@2026",
  role: "master",
  isActive: true,
};

export const seedMaster = async (options = {}) => {
  const isDirectRun = Boolean(process.argv[1] && /seedMaster(\.js)?$/i.test(process.argv[1]));
  const silent = options.silent ?? !isDirectRun;

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    if (mongoose.connection.readyState === 0) {
      if (!silent) console.log("Connecting to MongoDB...");
      await mongoose.connect(mongoUri);
      if (!silent) console.log("MongoDB connected successfully.");
    }

    const normalizedEmail = MASTER_CREDENTIALS.email.toLowerCase().trim();

    // Check if master user already exists
    let masterUser = await User.findOne({ email: normalizedEmail }).select("+password");

    if (masterUser) {
      const isRoleMatch = masterUser.role === "master";
      let isPasswordMatch = false;
      try {
        isPasswordMatch = await bcrypt.compare(MASTER_CREDENTIALS.plainPassword, masterUser.password);
      } catch {
        isPasswordMatch = false;
      }

      // Only update if role, status or password differs
      if (!isRoleMatch || !isPasswordMatch || !masterUser.isActive) {
        const salt = await bcrypt.genSalt(10);
        masterUser.name = MASTER_CREDENTIALS.name;
        masterUser.password = await bcrypt.hash(MASTER_CREDENTIALS.plainPassword, salt);
        masterUser.role = "master";
        masterUser.isActive = true;
        await masterUser.save();
        if (!silent) console.log(`✓ Existing account updated to Master role: ${normalizedEmail}`);
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(MASTER_CREDENTIALS.plainPassword, salt);
      masterUser = await User.create({
        name: MASTER_CREDENTIALS.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "master",
        isActive: true,
      });
      if (!silent) console.log(`✓ Master account created successfully: ${normalizedEmail}`);
    }

    if (!silent) {
      console.log("\n====================================");
      console.log("Master Account Seed Completed!");
      console.log("====================================");
      console.log(`Email:    ${MASTER_CREDENTIALS.email}`);
      console.log(`Role:     ${MASTER_CREDENTIALS.role}`);
      console.log(`Password: ${MASTER_CREDENTIALS.plainPassword}`);
      console.log("====================================\n");
    }

    return masterUser;
  } catch (error) {
    if (!silent) console.error("❌ Master Seeding Failed:", error.message);
    throw error;
  } finally {
    if (isDirectRun) {
      await mongoose.connection.close();
      if (!silent) console.log("MongoDB connection closed.");
    }
  }
};

// Run directly if called via CLI: `node src/seeds/seedMaster.js`
if (process.argv[1] && /seedMaster(\.js)?$/i.test(process.argv[1])) {
  seedMaster({ silent: false })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedMaster;
