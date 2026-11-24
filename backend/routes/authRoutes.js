const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  changePassword,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");


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


module.exports = router;