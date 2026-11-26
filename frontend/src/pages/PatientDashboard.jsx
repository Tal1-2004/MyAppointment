import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./PatientDashboard.css";

function PatientDashboard() {
  const user = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "null"
  );

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // =========================
  // STATE
  // =========================

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(true);

  const notificationsRef = useRef(null);

  // =========================
  // CLOSE NOTIFICATIONS
  // WHEN CLICKING OUTSIDE
  // =========================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(
          event.target
        )
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================
  // LOAD APPOINTMENTS
  // =========================

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/appointments/patient",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Could not load appointments."
          );

          return;
        }

        setAppointments(
          data.appointments || []
        );
      } catch (error) {
        console.error(
          "Load patient appointments error:",
          error
        );

        setMessage(
          "Cannot connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  // =========================
  // LOAD NOTIFICATIONS
  // =========================

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setNotificationsLoading(false);
        return;
      }

      try {
        setNotificationsLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/notifications/patient",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Load patient notifications error:",
            data.message
          );
          return;
        }

        setNotifications(
          data.notifications || []
        );

        setUnreadCount(
          data.unreadCount || 0
        );
      } catch (error) {
        console.error(
          "Load patient notifications error:",
          error
        );
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  // =========================
  // DATE HELPERS
  // =========================

  const getLocalDateString = (
    dateValue
  ) => {
    const date = new Date(dateValue);

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatAppointmentDate = (
    dateValue
  ) => {
    return new Date(
      dateValue
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatNotificationTime = (
    dateValue
  ) => {
    return new Date(
      dateValue
    ).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================
  // APPOINTMENT STATISTICS
  // =========================

  const todayString =
    getLocalDateString(new Date());

  const upcomingAppointments =
    appointments.filter(
      (appointment) =>
        getLocalDateString(
          appointment.date
        ) >= todayString &&
        appointment.status ===
          "upcoming"
    );

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "completed"
    );

  const cancelledAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "cancelled"
    );

  const dashboardAppointments =
    upcomingAppointments.slice(0, 3);

  // =========================
  // DOCTOR NAME
  // =========================

  const getDoctorName = (
    appointment
  ) => {
    return (
      appointment.doctor?.user?.name ||
      appointment.doctorName ||
      "Doctor"
    );
  };

  // =========================
  // MARK ONE NOTIFICATION READ
  // =========================

  const markNotificationAsRead =
    async (notificationId) => {
      const notification =
        notifications.find(
          (item) =>
            item._id === notificationId
        );

      if (
        !notification ||
        notification.isRead
      ) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/notifications/patient/${notificationId}/read`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Mark patient notification read error:",
            data.message
          );
          return;
        }

        setNotifications((current) =>
          current.map((item) =>
            item._id === notificationId
              ? {
                  ...item,
                  isRead: true,
                }
              : item
          )
        );

        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );
      } catch (error) {
        console.error(
          "Mark patient notification read error:",
          error
        );
      }
    };

  // =========================
  // MARK ALL NOTIFICATIONS READ
  // =========================

  const markAllNotificationsAsRead =
    async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/notifications/patient/read-all",
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Mark all patient notifications error:",
            data.message
          );
          return;
        }

        setNotifications((current) =>
          current.map((item) => ({
            ...item,
            isRead: true,
          }))
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Mark all patient notifications error:",
          error
        );
      }
    };

  // =========================
  // NOTIFICATION ICON
  // =========================

  const getNotificationIcon = (
    type
  ) => {
    if (
      type === "appointment_cancelled"
    ) {
      return "✕";
    }

    if (
      type === "appointment_delayed"
    ) {
      return "🕒";
    }

    if (
      type === "appointment_completed"
    ) {
      return "✓";
    }

    return "📅";
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    window.location.href = "/";
  };

  // =========================
  // JSX
  // =========================

  return (
    <div className="patient-dashboard">

      {/* SIDEBAR */}

      <aside className="patient-dashboard-sidebar">
        <div className="patient-sidebar-logo">
          <img
            src="/Designer.png"
            alt="MyAppointment logo"
          />

          <span>MyAppointment</span>
        </div>

        <nav className="patient-dashboard-nav">
          <button
            type="button"
            className="active"
          >
            🏠 Dashboard
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/my-appointments";
            }}
          >
            📅 My Appointments
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/doctors";
            }}
          >
            🩺 Find Doctors
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/patient-profile";
            }}
          >
            👤 My Profile
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/book-appointment";
            }}
          >
            ➕ Book Appointment
          </button>
        </nav>

        <button
          type="button"
          className="patient-dashboard-logout"
          onClick={handleLogout}
        >
          Log out
        </button>
      </aside>

      {/* MAIN */}

      <main className="patient-dashboard-content">

        {/* HEADER */}

        <header className="patient-dashboard-header">
          <div>
            <p>Patient Dashboard</p>

            <h1>
              Welcome back,{" "}
              {user?.name || "Patient"}
            </h1>

            <span>
              Manage your appointments and
              healthcare journey.
            </span>
          </div>

          <div className="patient-dashboard-header-actions">

            {/* NOTIFICATIONS */}

            <div
              className="patient-notifications-wrapper"
              ref={notificationsRef}
            >
              <button
                type="button"
                className="patient-notification-button"
                onClick={() =>
                  setNotificationsOpen(
                    (current) => !current
                  )
                }
              >
                <span>
                  🔔
                </span>

                {unreadCount > 0 && (
                  <span className="patient-notification-count">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="patient-notifications-panel">

                  <div className="patient-notifications-header">
                    <div>
                      <h3>
                        Notifications
                      </h3>

                      <span>
                        {unreadCount} unread
                      </span>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          markAllNotificationsAsRead
                        }
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="patient-notifications-list">
                    {notificationsLoading ? (
                      <div className="patient-notifications-empty">
                        Loading notifications...
                      </div>
                    ) : notifications.length ===
                      0 ? (
                      <div className="patient-notifications-empty">
                        <span>🔔</span>

                        <strong>
                          No notifications
                        </strong>

                        <p>
                          Appointment updates
                          will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            key={
                              notification._id
                            }
                            type="button"
                            className={
                              notification.isRead
                                ? "patient-notification-item"
                                : "patient-notification-item patient-notification-unread"
                            }
                            onClick={() =>
                              markNotificationAsRead(
                                notification._id
                              )
                            }
                          >
                            <span className="patient-notification-icon">
                              {getNotificationIcon(
                                notification.type
                              )}
                            </span>

                            <span className="patient-notification-content">
                              <strong>
                                {
                                  notification.title
                                }
                              </strong>

                              <p>
                                {
                                  notification.message
                                }
                              </p>

                              <small>
                                {formatNotificationTime(
                                  notification.createdAt
                                )}
                              </small>
                            </span>

                            {!notification.isRead && (
                              <span className="patient-notification-dot" />
                            )}
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* USER */}

            <button
              type="button"
              className="patient-dashboard-user"
              onClick={() => {
                window.location.href =
                  "/patient-profile";
              }}
            >
              <div className="patient-dashboard-avatar">
                {user?.name
                  ?.charAt(0)
                  .toUpperCase() || "P"}
              </div>

              <div>
                <strong>
                  {user?.name || "Patient"}
                </strong>

                <span>Patient</span>
              </div>
            </button>
          </div>
        </header>

        {/* MESSAGE */}

        {message && (
          <div className="patient-dashboard-message">
            <span>⚠</span>

            {message}
          </div>
        )}

        {/* STATS */}

        <section className="patient-dashboard-stats">
          <div className="patient-stat-card">
            <span>📅</span>

            <div>
              <p>Upcoming</p>

              <h2>
                {loading
                  ? "..."
                  : upcomingAppointments
                      .length}
              </h2>
            </div>
          </div>

          <div className="patient-stat-card">
            <span>✓</span>

            <div>
              <p>Completed</p>

              <h2>
                {loading
                  ? "..."
                  : completedAppointments
                      .length}
              </h2>
            </div>
          </div>

          <div className="patient-stat-card">
            <span>✕</span>

            <div>
              <p>Cancelled</p>

              <h2>
                {loading
                  ? "..."
                  : cancelledAppointments
                      .length}
              </h2>
            </div>
          </div>
        </section>

        {/* UPCOMING APPOINTMENTS */}

        <section className="patient-dashboard-section">
          <div className="patient-dashboard-section-header">
            <div>
              <h2>
                Upcoming Appointments
              </h2>

              <p>
                Your next scheduled doctor
                visits.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/my-appointments";
              }}
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="patient-dashboard-empty">
              <div>⏳</div>

              <h3>
                Loading appointments...
              </h3>
            </div>
          ) : dashboardAppointments.length ===
            0 ? (
            <div className="patient-dashboard-empty">
              <div>📅</div>

              <h3>
                No upcoming appointments
              </h3>

              <p>
                Book an appointment with one
                of our doctors.
              </p>

              <button
                type="button"
                onClick={() => {
                  window.location.href =
                    "/book-appointment";
                }}
              >
                Book Appointment
              </button>
            </div>
          ) : (
            <div className="patient-dashboard-appointments">
              {dashboardAppointments.map(
                (appointment) => (
                  <article
                    key={appointment._id}
                    className="patient-dashboard-appointment-card"
                  >
                    <div className="patient-dashboard-doctor">
                      <div className="patient-dashboard-doctor-avatar">
                        {getDoctorName(
                          appointment
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {getDoctorName(
                            appointment
                          )}
                        </strong>

                        <span>
                          {
                            appointment.specialty
                          }
                        </span>
                      </div>
                    </div>

                    <div className="patient-dashboard-appointment-details">
                      <div>
                        <span>
                          Time
                        </span>

                        <strong>
                          {
                            appointment.time
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Date
                        </span>

                        <strong>
                          {formatAppointmentDate(
                            appointment.date
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Status
                        </span>

                        <strong className="patient-dashboard-status">
                          {
                            appointment.status
                          }
                        </strong>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        {/* QUICK ACTIONS */}

        <section className="patient-dashboard-section">
          <div className="patient-dashboard-section-header">
            <div>
              <h2>Quick Actions</h2>

              <p>
                Find doctors and manage your
                appointments.
              </p>
            </div>
          </div>

          <div className="patient-dashboard-quick-actions">
            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/doctors";
              }}
            >
              <span>🩺</span>

              <div>
                <strong>
                  Find a Doctor
                </strong>

                <p>
                  Browse available doctors
                  and specialties.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/book-appointment";
              }}
            >
              <span>📅</span>

              <div>
                <strong>
                  Book Appointment
                </strong>

                <p>
                  Schedule your next medical
                  appointment.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/patient-profile";
              }}
            >
              <span>👤</span>

              <div>
                <strong>
                  My Profile
                </strong>

                <p>
                  View and manage your
                  account information.
                </p>
              </div>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

export default PatientDashboard;