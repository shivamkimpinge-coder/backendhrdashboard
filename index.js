require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoute");

const app = express();

const PORT = 4000;

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use("/api", authRoutes);

// Home
app.get("/", (req, res) => {
  res.send("Hello Shivam from backend");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

        