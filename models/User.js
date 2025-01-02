import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const habitSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  isComplete: { type: Boolean, default: false },
  count: { type: Number, required: true, default: 0 },
  duration: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 }, // Progress percentage
});

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
    },
    image: {
      type: String,
    },
    customerId: {
      type: String,
      validate(value) {
        return value.includes("cus_");
      },
    },
    priceId: {
      type: String,
      validate(value) {
        return value.includes("price_");
      },
    },
    paymentMethodId: {
      type: String,
      validate(value) {
        return value.includes("pm_");
      },
    },
    lastChargeDate: {
      // New field
      type: Date,
      default: null,
    },
    totalCharges: {
      // New field
      type: Number,
      default: 0, // Amount in dollars
    },
    penaltyAmount: {
      type: Number,
      default: 5, // Amount in dollars
    },
    quote: {
      type: String,
      default: "",
    },

    hasAccess: {
      type: Boolean,
      default: false,
    },
    habits: [habitSchema],
    lastResetDate: {
      type: Number,
      default: parseInt(new Date().getDate()),
    },
    completedDays: {
      type: [Number],
      default: [],
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
