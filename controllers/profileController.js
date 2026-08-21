const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const User = require("../model/userModel");

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

// Get the logged-in user's profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

// Update the logged-in user's profile (name / email)
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email) {
      if (!EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.status(409).json({ message: "An account already exists with this email" });
      }
      user.email = normalizedEmail;
    }

    if (name) user.name = name.trim();

    await user.save();

    const userData = user.toObject();
    delete userData.password;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpires;

    res.status(200).json({ message: "Profile updated successfully", user: userData });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// Change the logged-in user's password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};
// Update the logged-in user's profile image
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Profile image file is required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousImage = user.profileImage;

    user.profileImage = req.file.filename;
    await user.save();

    if (previousImage) {
      const previousImagePath = path.join(__dirname, "..", "uploads", previousImage);
      fs.unlink(previousImagePath, () => {});
    }

    res.status(200).json({
      message: "Profile image updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile image", error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
};
