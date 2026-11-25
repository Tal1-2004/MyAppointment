const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
      
    phone: {
    type: String,
    trim: true,
    default: "",
  },

  dateOfBirth: {
    type: Date,
    default: null,
  },

  location: {
    type: String,
    trim: true,
    default: "",
  },

  profileImage: {
    type: String,
    default: "",
  },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;