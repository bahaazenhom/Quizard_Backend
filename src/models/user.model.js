import mongoose from "mongoose";
import bcrypt from "bcrypt";
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
