// goalModel.js
const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    goalName: { type: String, required: true }, // e.g., "Vacation Fund", "Emergency Fund"
    targetAmount: { type: Number, required: true }, // goal target amount
    currentAmount: { type: Number, default: 0 }, // amount saved so far
    deadline: { type: Date }, // optional deadline for goal completion
    description: { type: String }, // optional details about the goal
    achieved: { type: Boolean, default: false }, // whether the goal is met
  },
  {
    timestamps: true,
  }
);

// Compound index to allow efficient querying of user-specific goals
goalSchema.index({ user: 1, achieved: 1 });

module.exports = mongoose.model("Goal", goalSchema);
