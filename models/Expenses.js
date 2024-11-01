// expenseModel.js
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    category: { type: String, required: true, index: true }, // e.g., "groceries", "rent", "entertainment"
    date: { type: Date, required: true, index: true },
    description: { type: String }, // optional description for additional details
  },
  {
    timestamps: true,
  }
);

// Compound index for optimized user and date range queries
expenseSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
