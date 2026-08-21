const express = require("express");

const {
  getProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
} = require("../controllers/profileController");
const authMiddleware = require("../middleware/authmiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/image", upload.single("profileImage"), updateProfileImage);
router.put("/password", changePassword);

module.exports = router;
