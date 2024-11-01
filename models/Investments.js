const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true }, // amount invested
    date: { type: Date, required: true, index: true }, // date of investment
    investmentType: { type: String, required: true }, // type of investment (e.g., stocks, bonds)
    description: { type: String }, // optional description for the investment
  },
  {
    timestamps: true,
  }
);

// Compound index to allow efficient querying of user-specific investments
investmentSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("Investment", investmentSchema);
