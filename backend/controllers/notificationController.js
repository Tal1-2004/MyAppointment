const Notification = require("../models/Notification");
const Doctor = require("../models/Doctor");


// ==============================
// GET DOCTOR NOTIFICATIONS
// ==============================

const getDoctorNotifications = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user._id,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const notifications = await Notification.find({
      doctor: doctor._id,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount =
      await Notification.countDocuments({
        doctor: doctor._id,
        isRead: false,
      });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==============================
// MARK ONE AS READ
// ==============================

const markNotificationAsRead = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user._id,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const notification =
      await Notification.findOne({
        _id: req.params.id,
        doctor: doctor._id,
      });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==============================
// MARK ALL AS READ
// ==============================

const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user._id,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    await Notification.updateMany(
      {
        doctor: doctor._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = {
  getDoctorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};