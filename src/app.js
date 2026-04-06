require("dotenv").config();
const express = require("express");
const { requestLogger } = require("./middleware/requestLogger");
const { requestId } = require("./middleware/requestId");
const { authRouter } = require("./routes/auth");
const { entriesRouter } = require("./routes/entries");

const app = express();

app.use(express.json());

app.use(requestLogger);
app.use(requestId);

app.use("/api/auth", authRouter);
app.use("/api/entries", entriesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = { app };