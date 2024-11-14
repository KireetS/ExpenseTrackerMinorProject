const express = require("express");
const axios = require("axios");
const router = express.Router();
const Expense = require("../../models/Expenses");
const Goal = require("../../models/Goals");
const Investment = require("../../models/Investments");
const fetchUser = require("../../middlewares/fetchUser");
// const { Configuration, OpenAIAPi } = require("openai");
// ChatGPT API settings
const CHATGPT_API_KEY =
  "6CnEITGeyqS5UnoBGICUEvT3BlbkFJJXehIfXY7QbaXbP8A3KSfIvZizM471iJDIhBJ5pscxZdeKuzrQ6Jcrt5Jkqq77Kn49dghHcN4A"; // Replace with your actual API key
const CHATGPT_API_URL = "https://api.openai.com/v1/chat/completions";

// Endpoint to get insights from ChatGPT based on user data
router.get("/get-insights", fetchUser, async (req, res) => {
  const { month, year, income } = req.query;
  const userId = req.user.id;

  try {
    // Fetch data from the database
    const expenses = await Expense.find({ userId, month, year });
    const goals = await Goal.find({ userId });
    const investments = await Investment.find({ userId });

    // Prepare the data for ChatGPT API
    const userData = {
      income,
      expenses,
      goals,
      investments,
    };

    // Make a request to ChatGPT API with the user data
    const chatGptResponse = await axios.post(
      CHATGPT_API_URL,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful financial advisor.",
          },
          {
            role: "user",
            content: `Here is the user's financial data: Income: ${income}, Expenses: ${JSON.stringify(
              expenses
            )}, Goals: ${JSON.stringify(goals)}, Investments: ${JSON.stringify(
              investments
            )}. Please analyze this data and provide insights on their spending, savings rate, financial health, and a user rating between 0 and 100 based on their financial habits.`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${CHATGPT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const insights = chatGptResponse.data.choices[0].message.content;

    res.json({ insights });
  } catch (error) {
    console.error("Error getting insights:", error);
    res.status(500).json({ message: "Error generating insights." });
  }
});

module.exports = router;
