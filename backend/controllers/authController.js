const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Kontrollo nëse ekziston user me këtë email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password-in para se të ruhet në MongoDB
    const hashedPassword = await bcrypt.hash(password, 10);

    // Krijo user-in
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
  const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      console.log("LOGIN EMAIL:", email);
      console.log("USER FOUND:", user ? user.email : "NO USER");

      if (!user) {
        return res.status(400).json({
          message: "Invalid email or password",
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log("PASSWORD MATCH:", passwordMatch);


      if (!passwordMatch) {
        return res.status(400).json({
          message: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };

    const changePassword = async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message:
            "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters",
        });
      }

      const user = await User.findById(
        req.user._id
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!passwordMatch) {
        return res.status(400).json({
          message:
            "Current password is incorrect",
        });
      }

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.password
        );

      if (samePassword) {
        return res.status(400).json({
          message:
            "New password must be different from your current password",
        });
      }

      user.password = await bcrypt.hash(
        newPassword,
        10
      );

      await user.save();

      return res.status(200).json({
        message:
          "Password changed successfully",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };

  // ==============================
// GET USER PROFILE
// ==============================

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(
      "Get user profile error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==============================
// UPDATE USER PROFILE
// ==============================

const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      dateOfBirth,
      location,
    } = req.body;

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (dateOfBirth !== undefined) {
      user.dateOfBirth =
        dateOfBirth || null;
    }

    if (location !== undefined) {
      user.location = location.trim();
    }

    await user.save();

    return res.status(200).json({
      message:
        "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        location: user.location,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(
      "Update user profile error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

  module.exports = {
  registerUser,
  loginUser,
  changePassword,
  getUserProfile,
  updateUserProfile,
};