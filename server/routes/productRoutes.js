import express from "express";
import {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  updateProductReview,
  deleteProductReview,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", searchProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);

// Reviews routes
router.post("/:id/reviews", protect, createProductReview);
router.put("/:id/reviews", protect, updateProductReview);
router.delete("/:id/reviews", protect, deleteProductReview);

// Admin-only routes
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;
