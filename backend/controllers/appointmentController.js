const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

const {
  sendAppointmentConfirmation,
} = require("../services/emailService");

const createAppointment = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      doctorName,
      specialty,
      date,
      time,
      reason,
    } = req.body;

    // Kontrollo fushat e nevojshme
    if (
      !patient ||
      !doctor ||
      !doctorName ||
      !specialty ||
      !date ||
      !time
    ) {
      return res.status(400).json({
        message: "Please complete all required appointment fields.",
      });
    }

    // Kontrollo pacientin
    const user = await User.findById(patient);

    if (!user) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    // Kontrollo doktorin
    const doctorProfile = await Doctor.findById(doctor);

    if (!doctorProfile) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // Lejo booking vetëm me doktor të aprovuar
    if (doctorProfile.verificationStatus !== "approved") {
      return res.status(400).json({
        message: "This doctor is not available for booking.",
      });
    }

    // Krijo appointment
    const appointment = await Appointment.create({
      patient,
      doctor,
      doctorName,
      specialty,
      date,
      time,
      reason,
    });

    // Dërgo confirmation email
    try {
      await sendAppointmentConfirmation({
        email: user.email,
        patientName: user.name,
        doctorName: appointment.doctorName,
        specialty: appointment.specialty,
        date: appointment.date,
        time: appointment.time,
        bookingId: appointment._id,
      });
    } catch (emailError) {
      console.error(
        "Confirmation email error:",
        emailError.message
      );
    }

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error(
      "Create appointment error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createAppointment,
};