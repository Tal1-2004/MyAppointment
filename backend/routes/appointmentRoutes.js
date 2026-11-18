const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getDoctorAppointments,
} = require("../controllers/appointmentController");

router.post("/", createAppointment);

router.get(
  "/doctor/user/:userId",
  getDoctorAppointments
);

module.exports = router;