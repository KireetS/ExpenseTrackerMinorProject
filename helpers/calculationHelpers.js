// calculationHelpers.js
const Income = require("../models/Income");
const Expense = require("../models/Expenses");
const Saving = require("../models/Investments");

// Function to calculate total expenses for a user
async function calculateTotalExpenses(userId) {
  const totalExpenses = await Expense.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return totalExpenses[0] ? totalExpenses[0].total : 0;
}

// Function to calculate remaining savings after expenses
async function calculateSavings(userId) {
  const totalIncome = await Income.aggregate([
    { $match: { user: userId, isActive: true } }, // Consider only active incomes
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalExpenses = await calculateTotalExpenses(userId);
  const savings = totalIncome[0] ? totalIncome[0].total - totalExpenses : 0;

  await Saving.findOneAndUpdate(
    { user: userId },
    { amount: savings },
    { upsert: true, new: true }
  );

  return savings;
}

module.exports = {
  calculateTotalExpenses,
  calculateSavings,
};
