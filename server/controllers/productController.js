import mongoose from "mongoose";
import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
};

export const searchProducts = async (req,res) =>{
  try{
    const {query} = req.query;

    if(!query){
      return res.status(400).json({
        success : false,
        message :"Search query is required"
      })
    }
    const products = await Product.find({
      $or : [
        {name : {$regex : query , $options : "i"}},
        {description : {$regex : query , $options : "i"}},
        {category : {$regex : query , $options : "i"}}
      ]
    });

    return res.status(200).json({
      success: true,
      count : products.length,
      products,
    });
  }catch(error){
    console.error(error)

    return res.status(500).json({
      success : false,
      message : "Failed to search products"
    })
  }
};

// @desc    Create product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, discount, category, stock, images } = req.body;

    if (!name || !description || price === undefined || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const product = new Product({
      name,
      description,
      price,
      discount: discount || 0,
      category,
      stock,
      images: images || [],
    });

    const createdProduct = await product.save();

    return res.status(201).json({
      success: true,
      product: createdProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, discount, category, stock, images } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.name = name !== undefined ? name : product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.discount = discount !== undefined ? discount : product.discount;
    product.category = category !== undefined ? category : product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.images = images !== undefined ? images : product.images;

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

// @desc    Create new product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 3 characters long",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product. Please edit your existing review.",
      });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
      user: req.user._id,
    };

    product.reviews.push(review);
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      rating: product.rating,
      reviews: product.reviews,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

// @desc    Update product review
// @route   PUT /api/products/:id/reviews
// @access  Private
export const updateProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (comment !== undefined && comment.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 3 characters long",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const review = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment.trim();

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      rating: product.rating,
      reviews: product.reviews,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews
// @access  Private
export const deleteProductReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviewIndex = product.reviews.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    product.reviews.splice(reviewIndex, 1);

    if (product.reviews.length > 0) {
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
    } else {
      product.rating = 0;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      rating: product.rating,
      reviews: product.reviews,
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};