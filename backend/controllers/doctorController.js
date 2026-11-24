const User = require("../models/User");
const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");

const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialty,
      experience,
      location,
      bio,
    } = req.body;
    if (
        !req.files?.cv ||
        !req.files?.diploma ||
        !req.files?.licence
      ) {
        return res.status(400).json({
          message: "CV, diploma and medical licence are required",
        });
      }

    // Kontrollo a ekziston email-i
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Krijo account-in me role doctor
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
    });

    try {
      // Krijo profilin profesional
      const doctor = await Doctor.create({
        user: user._id,
        specialty,
        experience,
        location,
        bio,

        documents: {
          cv: req.files?.cv?.[0]?.path || "",
          diploma: req.files?.diploma?.[0]?.path || "",
          licence: req.files?.licence?.[0]?.path || "",
        },

        verificationStatus: "pending",
      });

      return res.status(201).json({
        message: "Doctor registration submitted for verification",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        doctor: {
          id: doctor._id,
          specialty: doctor.specialty,
          experience: doctor.experience,
          location: doctor.location,
          verificationStatus: doctor.verificationStatus,
        },
      });
    } catch (doctorError) {
      // Nëse Doctor profile dështon, mos e lëmë User-in pa profil
      await User.findByIdAndDelete(user._id);

      throw doctorError;
    }
  } catch (error) {
    console.error("Doctor registration error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
  const getApprovedDoctors = async (req, res) => {
    try {
      const doctors = await Doctor.find({
        verificationStatus: "approved",
      })
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        doctors,
      });
    } catch (error) {
      console.error("Get doctors error:", error);

      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };

    const updateDoctorAvailability = async (req, res) => {
    try {
      const {
        userId,
        availability,
        appointmentDuration,
      } = req.body;

      if (!userId || !availability) {
        return res.status(400).json({
          message: "User ID and availability are required",
        });
      }

      const doctor = await Doctor.findOne({
        user: userId,
      });

      if (!doctor) {
        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      doctor.availability = availability;
      doctor.availability = availability;
      doctor.appointmentDuration =
        appointmentDuration;

      await doctor.save();

      return res.status(200).json({
        message: "Availability updated successfully",
        availability: doctor.availability,
        appointmentDuration:
          doctor.appointmentDuration,
      });
    } catch (error) {
      console.error(
        "Update doctor availability error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };
  
  
  module.exports = {
    registerDoctor,
    getApprovedDoctors,
    updateDoctorAvailability,
  } ;