import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // 2. Check duplicate email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5. Return response
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is suspended
    if (existingUser.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
    }

    // 3. Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      {
        userId: existingUser._id,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // 5. Return response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
};

// Helper to send email OTP code
const sendOTPMail = async (toEmail, otpCode) => {
  try {
    let host = process.env.SMTP_HOST;
    let port = process.env.SMTP_PORT || "587";
    let user = process.env.SMTP_USER || process.env.EMAIL_USER;
    let pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    let previewUrl = null;

    if (!user || !pass) {
      console.warn("SMTP credentials are not configured. Generating temporary Ethereal test account...");
      const testAccount = await nodemailer.createTestAccount();
      host = "smtp.ethereal.email";
      port = "587";
      user = testAccount.user;
      pass = testAccount.pass;
    }

    const transporter = nodemailer.createTransport({
      host: host || "smtp.gmail.com",
      port: Number(port),
      secure: port === "465",
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"ShopSphere Verification" <${user}>`,
      to: toEmail,
      subject: "ShopSphere Verification - Reset Your Password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e4e7; border-radius: 12px; color: #08060d;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">ShopSphere Reset Verification</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #6b6375;">
            We received a request to reset your password on your ShopSphere account. Use the following verification code to complete the process:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; background: #f4f3ec; padding: 10px 25px; border-radius: 8px; border: 1px solid #e5e4e7; letter-spacing: 5px; color: #08060d;">
              ${otpCode}
            </span>
          </div>
          <p style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
            This verification code is valid for 10 minutes. If you did not make this request, you can safely ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #e5e4e7; margin: 20px 0;" />
          <p style="font-size: 10px; color: #9ca3af; text-align: center;">
            © 2026 ShopSphere Premium Hub. Secure transaction verification.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification code successfully processed. Message ID: ${info.messageId}`);

    if (host.includes("ethereal.email")) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Ethereal email preview URL: ${previewUrl}`);
    }

    return { success: true, previewUrl };
  } catch (error) {
    console.error("Nodemailer send email error:", error);
    return { success: false };
  }
};

// @desc    Forgot Password (mock or live code)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email address",
      });
    }

    // Generate dynamic 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save token and expiry on user document
    user.resetPasswordToken = otpCode;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    console.log("=========================================");
    console.log("=== FORGOT PASSWORD OTP: ", otpCode, " ===");
    console.log("=========================================");

    // Attempt to send email
    const emailRes = await sendOTPMail(email, otpCode);

    return res.status(200).json({
      success: true,
      message: emailRes.previewUrl
        ? "Verification code generated! View email in test mailbox below."
        : "Verification code sent to your email.",
      code: otpCode,
      previewUrl: emailRes.previewUrl,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during forgot password",
    });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear verification token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error resetting password",
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Do not allow banning self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot disable your own admin account",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User is now ${user.isActive ? "active" : "inactive"}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle user status",
    });
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/auth/wishlist/:productId
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isWishlisted = user.wishlist.includes(productId);

    if (isWishlisted) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
    });
  }
};

// @desc    Get wishlist
// @route   GET /api/auth/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};