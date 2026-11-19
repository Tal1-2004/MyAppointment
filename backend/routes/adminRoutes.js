const express = require("express");

const {
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getApprovedDoctorsAdmin,
  removeDoctor,
  getAllAppointments,
  cancelAppointment,
} = require("../controllers/adminController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Vetëm admini mundet me përdor krejt routes poshtë
router.use(protect);
router.use(adminOnly);

// Merr doktorët pending
router.get("/doctors/pending", getPendingDoctors);

// Merr doktorët approved
router.get("/doctors/approved", getApprovedDoctorsAdmin);

// Aprovo doktorin
router.patch("/doctors/:id/approve", approveDoctor);

// Refuzo doktorin
router.patch("/doctors/:id/reject", rejectDoctor);

// Largo doktorin
router.delete("/doctors/:id", removeDoctor);

// Merr krejt appointments
router.get("/appointments", getAllAppointments);

// Cancel rezervimin
router.patch(
  "/appointments/:id/cancel",
  cancelAppointment
);


module.exports = router;