const express = require("express");
const router = express.Router();
const fetchUser = require("../../middlewares/fetchUser"); // Middleware to authenticate user
const Goal = require("../../models/Goals");

// Create a new goal
router.post("/", fetchUser, async (req, res) => {
  const { goalName, targetAmount, currentAmount, deadline, description } =
    req.body;

  try {
    const newGoal = new Goal({
      user: req.user.id,
      goalName,
      targetAmount,
      currentAmount,
      deadline,
      description,
    });

    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (err) {
    console.error("Error creating goal", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all goals for the authenticated user
router.get("/", fetchUser, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });
    res.json(goals);
  } catch (err) {
    console.error("Error fetching goals", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific goal by ID
router.get("/:id", fetchUser, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json(goal);
  } catch (err) {
    console.error("Error fetching goal", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a specific goal by ID
router.put("/:id", fetchUser, async (req, res) => {
  const {
    goalName,
    targetAmount,
    currentAmount,
    deadline,
    description,
    achieved,
  } = req.body;

  try {
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        goalName,
        targetAmount,
        currentAmount,
        deadline,
        description,
        achieved,
      },
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json(updatedGoal);
  } catch (err) {
    console.error("Error updating goal", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a specific goal by ID
router.delete("/:id", fetchUser, async (req, res) => {
  try {
    const deletedGoal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deletedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("Error deleting goal", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
