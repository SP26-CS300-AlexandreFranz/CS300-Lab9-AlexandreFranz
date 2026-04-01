require("dotenv").config();
const express = require("express");
const { requestLogger } = require("./middleware/requestLogger");
const { authRouter } = require("./routes/auth");
const { entriesRouter } = require("./routes/entries");

const app = express();

app.use(express.json());

// Middleware chain example — add more (CORS, etc.) here per lab instructions.
app.use(requestLogger);

app.use("/api/auth", authRouter);
app.use("/api/entries", entriesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = { app };
