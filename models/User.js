import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const habitSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  isComplete: { type: Boolean, default: false },
  duration: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now },
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
