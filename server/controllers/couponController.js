import Coupon from "../models/Coupon.js";

// @desc    Create new coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expirationDate, minOrderAmount } = req.body;

    if (!code || !discountType || discountValue === undefined || !expirationDate) {
      return res.status(400).json({
        success: false,
        message: "Please enter all required fields",
      });
    }

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expirationDate,
      minOrderAmount: minOrderAmount || 0,
    });

    const createdCoupon = await coupon.save();

    return res.status(201).json({
      success: true,
      coupon: createdCoupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
};

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

// @desc    Delete coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

// @desc    Validate and apply coupon
// @route   POST /api/coupons/apply
// @access  Private
export const applyCoupon = async (req, res) => {
  try {
    const { code, itemsPrice } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive coupon code",
      });
    }

    // Expiry check
    if (new Date(coupon.expirationDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    // Minimum order amount check
    if (itemsPrice < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required to use this coupon`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (itemsPrice * coupon.discountValue) / 100;
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;
    }

    // Cap discount amount at itemsPrice
    discountAmount = Math.min(discountAmount, itemsPrice);

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount,
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
    });
  }
};
