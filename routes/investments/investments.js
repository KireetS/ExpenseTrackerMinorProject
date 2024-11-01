const express = require("express");
const router = express.Router();
const Investments = require("../../models/Investments"); // Adjust the path as necessary
const fetchUser = require("../../middlewares/fetchUser"); // Your middleware for fetching user

// Create a new investment
router.post("/", fetchUser, async (req, res) => {
  const { amount, date, investmentType, description } = req.body;

  try {
    const newInvestment = new Investments({
      user: req.user.id, // Assuming the user's ID is stored in req.user after fetching
      amount,
      date,
      investmentType,
      description,
    });

    await newInvestment.save();
    return res.status(201).json(newInvestment);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating investment", error });
  }
});

// Get all investments for the authenticated user
router.get("/", fetchUser, async (req, res) => {
  try {
    const investments = await Investments.find({ user: req.user.id }).sort({
      date: -1,
    });
    return res.status(200).json(investments);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching investments", error });
  }
});

// Update an investment by ID
router.put("/:id", fetchUser, async (req, res) => {
  const { amount, date, investmentType, description } = req.body;

  try {
    const updatedInvestment = await Investments.findByIdAndUpdate(
      req.params.id,
      { amount, date, investmentType, description },
      { new: true }
    );

    if (!updatedInvestment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    return res.status(200).json(updatedInvestment);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating investment", error });
  }
});

// Delete an investment by ID
router.delete("/:id", fetchUser, async (req, res) => {
  try {
    const deletedInvestment = await Investments.findByIdAndDelete(
      req.params.id
    );

    if (!deletedInvestment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    return res.status(200).json({ message: "Investment deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting investment", error });
  }
});

module.exports = router;
