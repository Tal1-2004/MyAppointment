import { useEffect, useState } from "react";
import "./DoctorDashboard.css";

function DoctorDashboard() {
  const user = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user")
  );

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);

  const [verificationStatus, setVerificationStatus] =
    useState("pending");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // =========================
  // LOAD APPOINTMENTS
  // =========================

  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      if (!user?.id) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/appointments/doctor/user/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Could not load appointments."
          );
          return;
        }

        setAppointments(data.appointments || []);

        setVerificationStatus(
          data.doctor?.verificationStatus ||
            "pending"
        );
      } catch (error) {
        console.error(
          "Load doctor appointments error:",
          error
        );

        setMessage(
          "Cannot load appointments from the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAppointments();
  }, [user?.id]);

  // =========================
  // DATE HELPERS
  // =========================

  const getLocalDateString = (dateValue) => {
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

  const todayString = getLocalDateString(
    new Date()
  );

  // =========================
  // APPOINTMENT STATISTICS
  // =========================

  const todayAppointments = appointments.filter(
    (appointment) =>
      getLocalDateString(appointment.date) ===
        todayString &&
      appointment.status !== "cancelled"
  );

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      getLocalDateString(appointment.date) >=
        todayString &&
      appointment.status === "upcoming"
  );

  const uniquePatientIds = new Set(
    appointments
      .map(
        (appointment) =>
          appointment.patient?._id
      )
      .filter(Boolean)
  );

  const totalPatients = uniquePatientIds.size;

  // Vetëm 3 appointment-et e para
  const dashboardAppointments =
    upcomingAppointments.slice(0, 3);

  // =========================
  // FORMAT DATE
  // =========================

  const formatAppointmentDate = (dateValue) => {
    return new Date(dateValue).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  // =========================
  // UPDATE APPOINTMENT STATUS
  // =========================

  const updateAppointmentStatus = async (
    id,
    status
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not update appointment."
        );
        return;
      }

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment._id === id
            ? {
                ...appointment,
                status: data.appointment.status,
              }
            : appointment
        )
      );

      if (status === "completed") {
        setMessage(
          "Appointment marked as completed."
        );
      } else {
        setMessage(
          "Appointment marked as delayed."
        );
      }
    } catch (error) {
      console.error(
        "Update appointment status error:",
        error
      );

      setMessage(
        "Cannot connect to the server."
      );
    }
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
  // VERIFICATION TEXT
  // =========================

  const verificationText =
    verificationStatus === "approved"
      ? "Approved"
      : verificationStatus === "rejected"
        ? "Rejected"
        : "Pending";

  return (
    <div className="doctor-dashboard">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="doctor-sidebar">

        <div className="doctor-sidebar-logo">
          <img
            src="/Designer.png"
            alt="MyAppointment logo"
          />

          <span>MyAppointment</span>
        </div>

        <nav className="doctor-dashboard-nav">

          <button className="active">
            🏠 Dashboard
          </button>

          <button>
            📅 Appointments
          </button>

                    <button
            onClick={() =>
              window.location.href = "/doctor-availability"
            }
          >
            🕒 Availability
          </button>

          <button
            onClick={() => {
              window.location.href = "/doctor-profile";
            }}
          >
            👤 My Profile
          </button>

          <button>
            ⚙ Settings
          </button>

        </nav>

        <button
          className="doctor-logout"
          onClick={handleLogout}
        >
          Log out
        </button>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="doctor-dashboard-content">

        {/* HEADER */}

        <header className="doctor-dashboard-header">

          <div>
            <p>Doctor Dashboard</p>

            <h1>
              Welcome back,{" "}
              {user?.name || "Doctor"}
            </h1>

            <span>
              Here's an overview of your practice.
            </span>
          </div>

          <div className="doctor-dashboard-user">

            <div className="dashboard-avatar">
              {user?.name
                ?.charAt(0)
                .toUpperCase() || "D"}
            </div>

            <div>
              <strong>
                {user?.name || "Doctor"}
              </strong>

              <span>Doctor</span>
            </div>

          </div>

        </header>

        {/* MESSAGE */}

        {message && (
          <div className="dashboard-error">
            <span>⚠</span>
            {message}
          </div>
        )}

        {/* =========================
            VERIFICATION
        ========================= */}

        <section
          className={`verification-card verification-${verificationStatus}`}
        >
          <div>
            <span className="verification-icon">

              {verificationStatus === "approved"
                ? "✓"
                : verificationStatus === "rejected"
                  ? "×"
                  : "!"}

            </span>
          </div>

          <div>
            <h3>Profile verification</h3>

            <p>
              {verificationStatus === "approved"
                ? "Your doctor profile has been verified and is visible to patients."
                : verificationStatus === "rejected"
                  ? "Your verification was rejected. Please review your professional documents."
                  : "Your professional documents have been submitted and are waiting for verification."}
            </p>
          </div>

          <span className="verification-status">
            {verificationText}
          </span>

        </section>

        {/* =========================
            STATISTICS
        ========================= */}

        <section className="doctor-stats">

          <div className="doctor-stat-card">

            <span>📅</span>

            <div>
              <p>Today's Appointments</p>

              <h2>
                {loading
                  ? "..."
                  : todayAppointments.length}
              </h2>
            </div>

          </div>

          <div className="doctor-stat-card">

            <span>🕒</span>

            <div>
              <p>Upcoming</p>

              <h2>
                {loading
                  ? "..."
                  : upcomingAppointments.length}
              </h2>
            </div>

          </div>

          <div className="doctor-stat-card">

            <span>👥</span>

            <div>
              <p>Total Patients</p>

              <h2>
                {loading
                  ? "..."
                  : totalPatients}
              </h2>
            </div>

          </div>

        </section>

        {/* =========================
            APPOINTMENTS
        ========================= */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>
              <h2>Upcoming Appointments</h2>

              <p>
                Your next scheduled patient visits.
              </p>
            </div>

            <button type="button">
              View All
            </button>

          </div>

          {loading ? (

            <div className="empty-appointments">
              <div>⏳</div>

              <h3>
                Loading appointments...
              </h3>
            </div>

          ) : dashboardAppointments.length === 0 ? (

            <div className="empty-appointments">
              <div>📅</div>

              <h3>
                No upcoming appointments
              </h3>

              <p>
                New appointments from patients
                will appear here.
              </p>
            </div>

          ) : (

            <div className="dashboard-appointments-list">

              {dashboardAppointments.map(
                (appointment) => (

                  <article
                    className="dashboard-appointment-card"
                    key={appointment._id}
                  >

                    {/* PATIENT */}

                    <div className="appointment-patient">

                      <div className="patient-avatar">
                        {appointment.patient?.name
                          ?.charAt(0)
                          .toUpperCase() ||
                          "P"}
                      </div>

                      <div>
                        <strong>
                          {appointment.patient?.name ||
                            "Patient"}
                        </strong>

                        <span>
                          {appointment.patient?.email ||
                            "No email"}
                        </span>
                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="appointment-details">

                      <div>
                        <span className="detail-label">
                          Date
                        </span>

                        <strong>
                          {formatAppointmentDate(
                            appointment.date
                          )}
                        </strong>
                      </div>

                      <div>
                        <span className="detail-label">
                          Time
                        </span>

                        <strong>
                          {appointment.time}
                        </strong>
                      </div>

                      <div>
                        <span className="detail-label">
                          Status
                        </span>

                        <span
                          className={`appointment-status appointment-status-${appointment.status}`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                    </div>

                    {/* REASON */}

                    <div className="appointment-reason">

                      <span className="detail-label">
                        Reason for visit
                      </span>

                      <p>
                        {appointment.reason?.trim()
                          ? appointment.reason
                          : "No reason was provided by the patient."}
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="doctor-appointment-actions">

                      <button
                        type="button"
                        className="complete-appointment-btn"
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment._id,
                            "completed"
                          )
                        }
                      >
                        ✓ Mark Completed
                      </button>

                      <button
                        type="button"
                        className="delay-appointment-btn"
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment._id,
                            "delayed"
                          )
                        }
                      >
                        🕒 Mark Delayed
                      </button>

                    </div>

                  </article>

                )
              )}

            </div>
          )}

        </section>

        {/* =========================
            QUICK ACTIONS
        ========================= */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>
              <h2>Quick Actions</h2>

              <p>
                Manage your doctor profile and
                schedule.
              </p>
            </div>

          </div>

          <div className="doctor-quick-actions">

            <button
              type="button"
              onClick={() =>
                window.location.href = "/doctor-availability"
              }
            >
              <span>🕒</span>

              <div>
                <strong>Manage Availability</strong>
                <p>Set your available days and hours.</p>
              </div>
            </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/doctor-profile";
            }}
          >
            <span>👤</span>

            <div>
              <strong>Edit Profile</strong>

              <p>
                Update your professional information.
              </p>
            </div>
          </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default DoctorDashboard;