const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

// Merr doktorët që janë në pritje
const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      verificationStatus: "pending",
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      doctors,
    });
  } catch (error) {
    console.error("Get pending doctors error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Aprovo doktorin
const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    doctor.verificationStatus = "approved";

    await doctor.save();

    return res.status(200).json({
      message: "Doctor approved successfully",
      doctor,
    });
  } catch (error) {
    console.error("Approve doctor error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Refuzo aplikimin
const rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    doctor.verificationStatus = "rejected";

    await doctor.save();

    return res.status(200).json({
      message: "Doctor rejected successfully",
      doctor,
    });
  } catch (error) {
    console.error("Reject doctor error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Merr doktorët e aprovuar
const getApprovedDoctorsAdmin = async (req, res) => {
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
    console.error("Get approved doctors error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Largo doktorin dhe account-in e tij
const removeDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const userId = doctor.user;

    await Doctor.findByIdAndDelete(doctor._id);
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "Doctor removed successfully",
    });
  } catch (error) {
    console.error("Remove doctor error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      appointments,
    });
  } catch (error) {
    console.error("Get all appointments error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "upcoming") {
      return res.status(400).json({
        message: "Only upcoming appointments can be cancelled",
      });
    }

    appointment.status = "cancelled";

    await appointment.save();

    return res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getApprovedDoctorsAdmin,
  removeDoctor,
  getAllAppointments,
  cancelAppointment,
};