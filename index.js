require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoute");
const employeeRoute = require("./routes/employeeRoute");
const profileRoute = require("./routes/profileRoute");

const app = express();

const PORT = process.env.PORT || 4000

connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
}));
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoute);
app.use("/api/profile", profileRoute);

// Home
app.get("/", (req, res) => {
  res.send("backend api is running");
});
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Error handler (handles multer errors like invalid file type / size limit)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message || "Something went wrong" });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

