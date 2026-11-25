const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");

const {
  sendAppointmentConfirmation,
} = require("../services/emailService");

// ==============================
// CREATE APPOINTMENT
// ==============================

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

    if (
      !patient ||
      !doctor ||
      !doctorName ||
      !specialty ||
      !date ||
      !time
    ) {
      return res.status(400).json({
        message:
          "Please complete all required appointment fields.",
      });
    }
  
    const user = await User.findById(patient);

    if (!user) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const doctorProfile = await Doctor.findById(
      doctor
    );

    if (!doctorProfile) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    if (
      doctorProfile.verificationStatus !==
      "approved"
    ) {
      return res.status(400).json({
        message:
          "This doctor is not available for booking.",
      });
    }

    const appointmentDate = new Date(date);

    // Kontrollo a është termini i zënë
    const existingAppointment =
      await Appointment.findOne({
        doctor,
        date: appointmentDate,
        time,
        status: {
          $ne: "cancelled",
        },
      });

    if (existingAppointment) {
      return res.status(409).json({
        message:
          "This time slot is already booked.",
      });
    }

    const appointment =
      await Appointment.create({
        patient,
        doctor,
        doctorName,
        specialty,
        date: appointmentDate,
        time,
        reason,
      });

      try {
        await Notification.create({
          doctor: doctorProfile._id,
          appointment: appointment._id,
          type: "new_appointment",
          title: "New appointment",
          message: `${user.name} booked an appointment for ${date} at ${time}.`,
          isRead: false,
        });
      } catch (notificationError) {
        console.error(
          "Create notification error:",
          notificationError.message
        );
      }

              // ==============================
        // CREATE PATIENT NOTIFICATION
        // ==============================

        try {
          await Notification.create({
            patient: user._id,
            appointment: appointment._id,
            type: "appointment_booked",
            title: "Appointment booked",
            message:
              `Your appointment with ${doctorName} ` +
              `has been booked for ${date} at ${time}.`,
            isRead: false,
          });
        } catch (notificationError) {
          console.error(
            "Create patient notification error:",
            notificationError.message
          );
        }
      

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
      message:
        "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error(
      "Create appointment error:",
      error
    );

    // MongoDB duplicate doctor + date + time
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This time slot is already booked.",
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==============================
// GET DOCTOR APPOINTMENTS
// ==============================

const getDoctorAppointments = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    const doctorProfile =
      await Doctor.findOne({
        user: userId,
      });

    if (!doctorProfile) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const appointments =
      await Appointment.find({
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

// ==============================
// UPDATE APPOINTMENT STATUS
// ==============================

    const updateAppointmentStatus = async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
          "completed",
          "delayed",
          "cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            message: "Invalid appointment status",
          });
        }

        // Gjeje doktorin që është logged in
        const doctorProfile = await Doctor.findOne({
          user: req.user._id,
        });

        if (!doctorProfile) {
          return res.status(404).json({
            message: "Doctor profile not found",
          });
        }

        // SË PARI gjeje appointment-in
        const appointment =
          await Appointment.findById(id);

        if (!appointment) {
          return res.status(404).json({
            message: "Appointment not found",
          });
        }

        // Kontrollo që appointment-i i takon këtij doktori
        if (
          appointment.doctor.toString() !==
          doctorProfile._id.toString()
        ) {
          return res.status(403).json({
            message:
              "You cannot manage this appointment",
          });
        }

        // Nëse është cancelled, mos lejo ndryshime tjera
        if (appointment.status === "cancelled") {
          return res.status(400).json({
            message:
              "Cancelled appointments cannot be updated",
          });
        }

        // Ndrysho statusin
        appointment.status = status;

        await appointment.save();

                // ==============================
        // NOTIFY PATIENT ABOUT STATUS
        // ==============================

        try {
          if (status === "delayed") {
            await Notification.create({
              patient: appointment.patient,
              appointment: appointment._id,
              type: "appointment_delayed",

              title: "Appointment delayed",

              message:
                `Your appointment with ${appointment.doctorName} ` +
                `has been marked as delayed.`,

              isRead: false,
            });
          }

          if (status === "completed") {
            await Notification.create({
              patient: appointment.patient,
              appointment: appointment._id,
              type: "appointment_completed",

              title: "Appointment completed",

              message:
                `Your appointment with ${appointment.doctorName} ` +
                `has been marked as completed.`,

              isRead: false,
            });
          }

          if (status === "cancelled") {
            await Notification.create({
              patient: appointment.patient,
              appointment: appointment._id,
              type: "appointment_cancelled",

              title: "Appointment cancelled",

              message:
                `Your appointment with ${appointment.doctorName} ` +
                `has been cancelled.`,

              isRead: false,
            });
          }
        } catch (notificationError) {
          console.error(
            "Patient status notification error:",
            notificationError.message
          );
        }


                // ==============================
        // NOTIFY PATIENT ABOUT STATUS
        // ==============================

        try {
          if (status === "delayed") {
            await Notification.create({
              patient: appointment.patient,
              appointment: appointment._id,

              type: "appointment_delayed",

              title: "Appointment delayed",

              message:
                `Your appointment with ${appointment.doctorName} ` +
                `has been marked as delayed.`,

              isRead: false,
            });
          }

          if (status === "completed") {
            await Notification.create({
              patient: appointment.patient,
              appointment: appointment._id,

              type: "appointment_completed",

              title: "Appointment completed",

              message:
                `Your appointment with ${appointment.doctorName} ` +
                `has been marked as completed.`,

              isRead: false,
            });
          }
        } catch (notificationError) {
          console.error(
            "Patient status notification error:",
            notificationError.message
          );
        }

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


              // ==============================
          // GET PATIENT APPOINTMENTS
          // ==============================

          const getPatientAppointments = async (
            req,
            res
          ) => {
            try {
              const appointments =
                await Appointment.find({
                  patient: req.user._id,
                })
                  .populate({
                    path: "doctor",
                    populate: {
                      path: "user",
                      select: "name email",
                    },
                  })
                  .sort({
                    date: -1,
                    time: -1,
                  });

              return res.status(200).json({
                appointments,
              });
            } catch (error) {
              console.error(
                "Get patient appointments error:",
                error
              );

              return res.status(500).json({
                message: "Server error",
                error: error.message,
              });
            }
          };

                  // ==============================
          // PATIENT CANCEL APPOINTMENT
          // ==============================

          const cancelPatientAppointment = async (
            req,
            res
          ) => {
            try {
              const { id } = req.params;

              // Gjeje appointment-in
              const appointment =
                await Appointment.findById(id);

              if (!appointment) {
                return res.status(404).json({
                  message: "Appointment not found",
                });
              }

              // Pacienti mundet me anulu
              // vetëm appointment-in e vet
              if (
                appointment.patient.toString() !==
                req.user._id.toString()
              ) {
                return res.status(403).json({
                  message:
                    "You cannot cancel this appointment",
                });
              }

              // Nëse është already cancelled
              if (
                appointment.status === "cancelled"
              ) {
                return res.status(400).json({
                  message:
                    "Appointment is already cancelled",
                });
              }

              // Completed nuk mundet me u anulu
              if (
                appointment.status === "completed"
              ) {
                return res.status(400).json({
                  message:
                    "Completed appointments cannot be cancelled",
                });
              }

              

              // Ndrysho vetëm statusin direkt në MongoDB.
              // Kjo shmang validation-in e appointment-eve
              // të vjetra që mund të mos kenë doctor field.

              const updatedAppointment =
                await Appointment.findByIdAndUpdate(
                  id,
                  {
                    $set: {
                      status: "cancelled",
                    },
                  },
                  {
                    new: true,
                    runValidators: false,
                  }
                );

              return res.status(200).json({
                message:
                  "Appointment cancelled successfully",

                appointment: updatedAppointment,
              });
            } catch (error) {
              console.error(
                "Cancel patient appointment error:",
                error
              );

              return res.status(500).json({
                message: "Server error",
                error: error.message,
              });
            }
};
         

  const getBookedSlots = async (req, res) => {
    try {
      const { doctor, date } = req.query;

      if (!doctor || !date) {
        return res.status(400).json({
          message: "Doctor and date are required.",
        });
      }

      const appointmentDate = new Date(date);

      const appointments = await Appointment.find({
        doctor,
        date: appointmentDate,
        status: {
          $ne: "cancelled",
        },
      }).select("time");

      const bookedTimes = appointments.map(
        (appointment) => appointment.time
      );

      return res.status(200).json({
        bookedTimes,
      });
    } catch (error) {
      console.error(
        "Get booked slots error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };


// ==============================
// EXPORTS
// ==============================

module.exports = {
  createAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
  cancelPatientAppointment,
  getBookedSlots,
};