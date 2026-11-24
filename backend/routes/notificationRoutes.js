const express = require("express");

const router = express.Router();

const {
  getDoctorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require(
  "../controllers/notificationController"
);

const {
  protect,
} = require("../middleware/authMiddleware");


router.get(
  "/doctor",
  protect,
  getDoctorNotifications
);


router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);


router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);


module.exports = router;