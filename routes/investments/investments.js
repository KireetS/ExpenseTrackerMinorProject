const express = require("express");
const router = express.Router();
const Investments = require("../../models/Investments"); // Adjust the path as necessary
const User = require("../../models/User"); // Add User model
const fetchUser = require("../../middlewares/fetchUser"); // Your middleware for fetching user

// Create a new investment
router.post("/", fetchUser, async (req, res) => {
  const { amount, date, investmentType, description } = req.body;

  try {
    // Fetch the user's predefined investment types
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the investment type is valid for the user
    const validInvestmentTypes = user.investmentTypes.map((item) => item.name);
    if (!validInvestmentTypes.includes(investmentType)) {
      return res.status(400).json({ message: "Invalid investment type" });
    }

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
router.get("/investments/by-type", async (req, res) => {
  const { investmentType } = req.query;

  // Check if the investmentType parameter is provided
  if (!investmentType) {
    return res.status(400).json({ message: "Investment type is required" });
  }

  try {
    // Query the investments collection by investmentType
    const investments = await Investment.find({ investmentType });

    // Return the found investments
    return res.status(200).json(investments);
  } catch (error) {
    console.error("Error fetching investments:", error);
    return res.status(500).json({ message: "Server error" });
  }
});
// Add a new investment type to the user's list
router.post("/investment-types", fetchUser, async (req, res) => {
  const { investmentType } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the investment type already exists
    if (user.investmentTypes.some((item) => item.name === investmentType)) {
      return res
        .status(400)
        .json({ message: "Investment type already exists" });
    }

    // Add the new investment type to the user's list
    user.investmentTypes.push({ name: investmentType });
    await user.save();

    return res
      .status(201)
      .json({ message: "Investment type added successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding investment type", error });
  }
});

module.exports = router;
