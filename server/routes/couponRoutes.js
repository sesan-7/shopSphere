import express from "express";
import {
  createCoupon,
  getCoupons,
  deleteCoupon,
  applyCoupon,
} from "../controllers/couponController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/apply", protect, applyCoupon);

// Admin-only routes
router.post("/", protect, admin, createCoupon);
router.get("/", protect, admin, getCoupons);
router.delete("/:id", protect, admin, deleteCoupon);

export default router;
