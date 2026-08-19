import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        name : {
            type: String,
            required : true,
            trim : true
        },
        email: {
            type: String,
            required : true,
            unique: true
        },
        password : {
            type: String,
            required: true,
            minlength: 6
        },
        role: {
            type: String,
            default: 'user'
        },
        isActive : {
            type: Boolean,
            default: true
        },
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ],
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        },
        createdAt : {
            type: Date,
            default: Date.now
        }
    }
)
export default mongoose.model("User", userSchema)