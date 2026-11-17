const Appointment = require("../models/Appointment");
const User = require("../models/User");

const {
  sendAppointmentConfirmation,
} = require("../services/emailService");

const createAppointment = async (req, res) => {
  try {
    const {
      patient,
      doctorName,
      specialty,
      date,
      time,
      reason,
    } = req.body;

    const user = await User.findById(patient);

    if (!user) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const appointment = await Appointment.create({
      patient,
      doctorName,
      specialty,
      date,
      time,
      reason,
    });

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

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createAppointment,
};