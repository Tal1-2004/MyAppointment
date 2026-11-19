const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
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


module.exports = router;