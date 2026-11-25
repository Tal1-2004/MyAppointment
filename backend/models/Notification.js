const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      // =========================
      // RECIPIENTS
      // =========================

      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",

        // Jo çdo notification është
        // për doktorin.
        default: null,
      },

      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

        // Jo çdo notification është
        // për pacientin.
        default: null,
      },

      // =========================
      // APPOINTMENT
      // =========================

      appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        default: null,
      },

      // =========================
      // TYPE
      // =========================

      type: {
        type: String,

        enum: [
          "new_appointment",
          "appointment_booked",
          "appointment_cancelled",
          "appointment_delayed",
          "appointment_completed",
        ],

        required: true,
      },

      // =========================
      // CONTENT
      // =========================

      title: {
        type: String,
        required: true,
        trim: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      // =========================
      // READ STATUS
      // =========================

      isRead: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;