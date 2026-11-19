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
const getDoctorAppointments = async (req, res) => {
  try {
    const { userId } = req.params;

    // Gjeje profilin Doctor për user-in që është login
    const doctorProfile = await Doctor.findOne({
      user: userId,
    });

    if (!doctorProfile) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    // Merr vetëm appointment-et e këtij doktori
    const appointments = await Appointment.find({
      doctor: doctorProfile._id,
    })
      .populate("patient", "name email")
      .sort({
        date: 1,
        time: 1,
      });

    return res.status(200).json({
      doctor: {
        id: doctorProfile._id,
        verificationStatus:
          doctorProfile.verificationStatus,
      },
      appointments,
    });
  } catch (error) {
    console.error(
      "Get doctor appointments error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Vetëm këto statuse mund t'i vendos doktori
    const allowedStatuses = ["completed", "delayed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    // Gjeje profilin e doktorit që është login
    const doctorProfile = await Doctor.findOne({
      user: req.user._id,
    });

    if (!doctorProfile) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    // Gjeje appointment-in
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Sigurohu që appointment-i i takon këtij doktori
    if (
      appointment.doctor.toString() !==
      doctorProfile._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot manage this appointment",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled appointments cannot be updated",
      });
    }

    appointment.status = status;

    await appointment.save();

    return res.status(200).json({
      message: `Appointment marked as ${status}`,
      appointment,
    });
  } catch (error) {
    console.error(
      "Update appointment status error:",
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
  getDoctorAppointments,
  updateAppointmentStatus,
};