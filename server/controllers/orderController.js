import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponCode,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

    // 1. Verify and update stock for each product
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} not found`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${item.name}. Available: ${product.stock}`,
        });
      }
    }

    // Update stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 2. Coupon Validation
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (coupon && coupon.expirationDate > new Date() && itemsPrice >= coupon.minOrderAmount) {
        if (coupon.discountType === "percentage") {
          discountAmount = (itemsPrice * coupon.discountValue) / 100;
        } else if (coupon.discountType === "fixed") {
          discountAmount = coupon.discountValue;
        }
      }
    }

    // Adjust final totalPrice based on discount
    const finalTotalPrice = Math.max(0, itemsPrice + taxPrice + shippingPrice - discountAmount);

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice: finalTotalPrice,
      discountAmount,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      isPaid: paymentMethod === "COD" ? false : true, // Mock payment auto-paid for card
      paidAt: paymentMethod === "COD" ? undefined : new Date(),
    });

    const createdOrder = await order.save();

    return res.status(201).json({
      success: true,
      order: createdOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Authenticated user can only view their own order, or admin can view all
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "id name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all orders",
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Adjust stock inventory if status changes to/from Cancelled
    if (order.status !== "Cancelled" && status === "Cancelled") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    if (order.status === "Cancelled" && status !== "Cancelled") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    order.status = status;
    
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.isPaid = true; // Delivered implies paid if it was COD
      if (!order.paidAt) {
        order.paidAt = new Date();
      }
    }

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Use atomic update to prevent race condition
    const query = {
      _id: id,
      status: { $in: ["Pending", "Confirmed"] },
    };

    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    const order = await Order.findOneAndUpdate(
      query,
      { status: "Cancelled" },
      { new: true }
    );

    if (!order) {
      const existingOrder = await Order.findById(id);
      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (
        existingOrder.user.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to cancel this order",
        });
      }

      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in status: ${existingOrder.status}`,
      });
    }

    // Restore stock to inventory
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};
