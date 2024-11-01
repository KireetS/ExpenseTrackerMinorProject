const express = require("express");
require("dotenv").config();
const connectToMongo = require("./db");
const cors = require("cors");
connectToMongo();

const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/auth", require("./routes/auth/auth"));
app.use("/api/expenses", require("./routes/expenses/expenses"));
app.use("/api/goals", require("./routes/goals/goals"));
app.use("/api/investments", require("./routes/investments/investments"));
app.get("/", (req, res) => {
  res.json({ msg: "hello" });
});
app.listen(5000, () => {
  console.log("listening on port 5000");
});
