import { Router } from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getUsers,
  toggleUserStatus,
  toggleWishlist,
  getWishlist,
} from "../controllers/authController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Authenticated user routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateUserProfile);
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, toggleWishlist);

// Admin-only routes
router.get("/users", protect, admin, getUsers);
router.put("/users/:id/status", protect, admin, toggleUserStatus);

export default router;
