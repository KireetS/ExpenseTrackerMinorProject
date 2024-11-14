const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  expenseCategories: {
    type: [{ name: String, createdAt: { type: Date, default: Date.now } }],
    default: [
      { name: "Groceries" },
      { name: "Utilities" },
      { name: "Transport" },
      { name: "Entertainment" },
      { name: "Other" },
      { name: "All" },
    ],
  },
  investmentTypes: {
    type: [{ name: String, createdAt: { type: Date, default: Date.now } }],
    default: [
      { name: "Stocks" },
      { name: "Bonds" },
      { name: "Real Estate" },
      { name: "Cryptocurrency" },
      { name: "Commodities" },
      { name: "Other" },
    ],
  },
});

module.exports = mongoose.model("User", UserSchema);
