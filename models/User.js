import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const habitSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  isComplete: { type: Boolean, default: false },
  count: { type: Number, required: false, default: 0 },
  originalCount: { type: Number, required: false }, // Store original count
  duration: { type: String, required: false }, // Total duration in minutes
  originalDuration: { type: String, required: false }, // Store original duration
  timer: { type: Number, default: 0 }, // Remaining time in seconds
  dateAdded: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 }, // Progress percentage
  order: { type: Number, default: 0 }, // Order of the habit
  getCharged: { type: Boolean, default: true }, // Get charged
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
