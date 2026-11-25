const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  changePassword,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const upload = require(
  "../middleware/uploadMiddleware"
);


// REGISTER
router.post(
  "/register",
  registerUser
);


// LOGIN
router.post(
  "/login",
  loginUser
);


// CHANGE PASSWORD
router.patch(
  "/change-password",
  protect,
  changePassword
);

// USER PROFILE
router.get(
  "/profile",
  protect,
  getUserProfile
);

router.put(
  "/profile",
  protect,
  upload.single("profileImage"),
  updateUserProfile
);


module.exports = router;