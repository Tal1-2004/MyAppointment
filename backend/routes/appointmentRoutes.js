const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getBookedSlots,
} = require("../controllers/appointmentController");

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

router.get("/booked-slots", getBookedSlots);


module.exports = router;