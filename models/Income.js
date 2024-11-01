// incomeModel.js
const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    source: { type: String, required: true }, // e.g., "salary", "investment"
    date: {
      type: Date,
      required: true,
      index: true,
      // Ensure that the date only allows one entry per month
      unique: true,
    },
    description: { type: String }, // optional description for additional details
  },
  {
    timestamps: true,
  }
);

// Compound index for user-specific and month-year queries
incomeSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Income", incomeSchema);
