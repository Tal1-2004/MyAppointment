const express = require("express");

const router = express.Router();

const {
  getDoctorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,

  getPatientNotifications,
  markPatientNotificationAsRead,
  markAllPatientNotificationsAsRead,
} = require(
  "../controllers/notificationController"
);

// ==============================
// DOCTOR NOTIFICATIONS
// ==============================

router.get(
  "/doctor",
  protect,
  getDoctorNotifications
);

router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);


// ==============================
// PATIENT NOTIFICATIONS
// ==============================

router.get(
  "/patient",
  protect,
  getPatientNotifications
);

router.patch(
  "/patient/read-all",
  protect,
  markAllPatientNotificationsAsRead
);

router.patch(
  "/patient/:id/read",
  protect,
  markPatientNotificationAsRead
);

module.exports = router;