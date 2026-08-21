const express = require("express");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authControllers");

const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/forgot", forgotPassword);

router.post("/reset/:token", resetPassword);

router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});

module.exports = router;