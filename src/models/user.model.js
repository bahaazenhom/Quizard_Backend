import mongoose from "mongoose";
import bcrypt from "bcrypt";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: John
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (unique)
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: User's password (hashed)
 *         phone:
 *           type: string
 *           description: User's phone number
 *           example: '+1234567890'
 *         age:
 *           type: number
 *           description: User's age
 *           example: 25
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           default: male
 *           description: User's gender
 *         photoURL:
 *           type: string
 *           description: URL to user's profile photo
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *           description: User's role
 *         isActive:
 *           type: boolean
 *           default: false
 *           description: Whether the user account is active
 *         teachingCourses:
 *           type: number
 *           default: 0
 *           description: Number of courses user is teaching
 *         enrolledCourses:
 *           type: number
 *           default: 0
 *           description: Number of courses user is enrolled in
 *         isConfirmed:
 *           type: boolean
 *           default: false
 *           description: Whether email is confirmed
 *         stripeCustomerId:
 *           type: string
 *           description: Stripe customer ID
 *         currentSubscription:
 *           type: string
 *           description: Reference to current subscription
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?\d{10,15}$/, "Invalid phone number"],
    },
    age: Number,
    gender: { type: String, enum: ["male", "female"], default: "male" },
    photoURL: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: {
      type: Boolean,
      default: false,
    },
    teachingCourses: { type: Number, default: 0 },
    enrolledCourses: { type: Number, default: 0 },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: { type: String },
    currentSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const saltRounds = parseInt(process.env.HASH_SALT_ROUNDS) || 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
