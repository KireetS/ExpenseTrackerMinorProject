const express = require("express");
const router = express.Router();
const Expense = require("../../models/Expenses");
const User = require("../../models/User");
const Income = require("../../models/Income");
const fetchUser = require("../../middlewares/fetchUser");
const { body, validationResult } = require("express-validator");

// Route: POST /api/expenses - Add new expense
router.post(
  "/",
  fetchUser,
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("category").isString().withMessage("Category is required"),
    body("date").isISO8601().toDate().withMessage("Invalid date format"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { amount, category, date, description } = req.body;
      const expense = new Expense({
        user: req.user.id,
        amount,
        category,
        date,
        description,
      });
      await expense.save();

      res.json({ expense });
    } catch (err) {
      console.error("Error saving expense", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Route: GET /api/expenses - Get all expenses for a user or filter by month and year
// Route: GET /api/expenses - Get all expenses for a user, with optional filters for month, year, and category
router.get("/", fetchUser, async (req, res) => {
  try {
    const { month, year, category } = req.query;
    const query = { user: req.user.id };

    // Apply date filtering if month and year are provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Add category filtering if a specific category (other than "all") is provided
    if (category && category != "All") {
      query.category = category;
    }

    const expenses = await Expense.find(query);
    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route: GET /api/income - Get all income for a user or filter by month and year
router.get("/income", fetchUser, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.user.id };

    // Add date filtering if month and year are provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const income = await Income.find(query);
    res.json(income);
  } catch (err) {
    console.error("Error fetching income", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route: GET /api/savings - Get user's savings filtered by month and year
router.get("/savings", fetchUser, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.user.id };

    // Calculate savings based on income and expenses
    const incomeQuery = { user: req.user.id };
    const expenseQuery = { user: req.user.id };

    // Add date filtering if month and year are provided for income
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      incomeQuery.date = { $gte: startDate, $lte: endDate };
      expenseQuery.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      incomeQuery.date = { $gte: startDate, $lte: endDate };
      expenseQuery.date = { $gte: startDate, $lte: endDate };
    }

    const totalIncome = await Income.aggregate([
      { $match: incomeQuery },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpenses = await Expense.aggregate([
      { $match: expenseQuery },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const savings =
      (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0);
    res.json({ savings });
  } catch (err) {
    console.error("Error fetching savings", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route: PUT /api/expenses/:id - Update an expense
router.put(
  "/:id",
  fetchUser,
  [
    body("amount")
      .optional()
      .isNumeric()
      .withMessage("Amount must be a number"),
    body("category")
      .optional()
      .isString()
      .withMessage("Category must be a string"),
    body("date")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Invalid date format"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { amount, category, date, description } = req.body;
      const updateData = { amount, category, date, description };
      const expense = await Expense.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { $set: updateData },
        { new: true }
      );
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }

      res.json({ expense });
    } catch (err) {
      console.error("Error updating expense", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Route: DELETE /api/expenses/:id - Delete an expense
router.delete("/:id", fetchUser, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new category
router.post("/category", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const user = await User.findById(userId);
    if (user.expenseCategories.find((cat) => cat.name === name)) {
      return res.status(400).json({ error: "Category already exists" });
    }

    user.expenseCategories.push({ name });
    await user.save();
    res.json(user.expenseCategories);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a category by name
router.delete("/category", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const user = await User.findById(userId);
    user.expenseCategories = user.expenseCategories.filter(
      (category) => category.name !== name
    );

    await user.save();
    res.json(user.expenseCategories);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Edit a category name
router.put("/category", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldName, newName } = req.body;

    const user = await User.findById(userId);
    const category = user.expenseCategories.find(
      (category) => category.name === oldName
    );

    if (category) {
      category.name = newName;
      await user.save();
      res.json(user.expenseCategories);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/category", fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.expenseCategories);
  } catch (error) {
    console.error("Error fetching categories", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route: GET /api/expenses/:id - Get a specific expense by ID
router.get("/:id", fetchUser, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (err) {
    console.error("Error fetching expense", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
