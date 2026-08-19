import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";

const seedAdminAndCoupons = async () => {
  try {
    await connectDB();

    // 1. Seed Admin User
    await User.deleteMany({ email: "admin@shopsphere.com" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    await User.create({
      name: "ShopSphere Admin",
      email: "admin@shopsphere.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin user seeded successfully (admin@shopsphere.com / admin123)");

    // 2. Seed Coupons
    await Coupon.deleteMany({});

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Valid for 1 year

    const coupons = [
      {
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10,
        expirationDate,
        minOrderAmount: 0,
        isActive: true,
      },
      {
        code: "SAVE500",
        discountType: "fixed",
        discountValue: 500,
        expirationDate,
        minOrderAmount: 2000,
        isActive: true,
      },
    ];

    await Coupon.insertMany(coupons);
    console.log("Discount coupons seeded successfully (WELCOME10, SAVE500)");

    process.exit(0);
  } catch (error) {
    console.error("Seeding admin/coupons failed:", error);
    process.exit(1);
  }
};

seedAdminAndCoupons();
