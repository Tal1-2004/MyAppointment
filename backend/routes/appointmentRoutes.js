const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
  cancelPatientAppointment,
  getBookedSlots,
} = require(
  "../controllers/appointmentController"
);

const {
  protect,
} = require("../middleware/authMiddleware");

router.post("/", createAppointment);

router.get(
  "/doctor/user/:userId",
  getDoctorAppointments
);

router.patch(
  "/:id/status",
  protect,
  updateAppointmentStatus
);

// PATIENT APPOINTMENTS

router.get(
  "/patient",
  protect,
  getPatientAppointments
);


router.patch(
  "/:id/cancel",
  protect,
  cancelPatientAppointment
);

router.get("/booked-slots", getBookedSlots);


module.exports = router;