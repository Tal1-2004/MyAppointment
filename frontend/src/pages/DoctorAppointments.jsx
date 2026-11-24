import { useEffect, useState } from "react";
import "./DoctorAppointments.css";

function DoctorAppointments() {
  const user = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user")
  );

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // =========================
  // LOAD APPOINTMENTS
  // =========================

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) {
        window.location.href = "/doctor-login";
        return;
      }

      try {
        setLoading(true);

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
      } catch (error) {
        console.error(
          "Load appointments error:",
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
  }, [user?.id]);

  // =========================
  // UPDATE STATUS
  // =========================

  const updateAppointmentStatus = async (
    id,
    status
  ) => {
    try {
      setUpdatingId(id);
      setMessage("");

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

      setAppointments((current) =>
        current.map((appointment) =>
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
      } else if (status === "delayed") {
        setMessage(
          "Appointment marked as delayed."
        );
      } else if (status === "cancelled") {
        setMessage(
          "Appointment cancelled successfully."
        );
      }
    } catch (error) {
      console.error(
        "Update appointment error:",
        error
      );

      setMessage(
        "Cannot connect to the server."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredAppointments =
    activeFilter === "all"
      ? appointments
      : appointments.filter(
          (appointment) =>
            appointment.status === activeFilter
        );

  const getCount = (status) => {
    if (status === "all") {
      return appointments.length;
    }

    return appointments.filter(
      (appointment) =>
        appointment.status === status
    ).length;
  };

  // =========================
  // DATE
  // =========================

  const formatDate = (dateValue) => {
    return new Date(
      dateValue
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // =========================
  // JSX
  // =========================

  return (
    <main className="doctor-appointments-page">
      <div className="doctor-appointments-container">

        {/* HEADER */}

        <div className="doctor-appointments-header">
          <div>
            <p>Doctor Schedule</p>

            <h1>Appointments</h1>

            <span>
              View and manage your patient
              appointments.
            </span>
          </div>

          <button
            type="button"
            className="appointments-back-btn"
            onClick={() => {
              window.location.href =
                "/doctor-dashboard";
            }}
          >
            ← Dashboard
          </button>
        </div>

        {/* FILTERS */}

        <div className="appointment-filters">
          {[
            ["all", "All"],
            ["upcoming", "Upcoming"],
            ["completed", "Completed"],
            ["delayed", "Delayed"],
            ["cancelled", "Cancelled"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                activeFilter === value
                  ? "appointment-filter active"
                  : "appointment-filter"
              }
              onClick={() =>
                setActiveFilter(value)
              }
            >
              {label}

              <span>
                {getCount(value)}
              </span>
            </button>
          ))}
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="appointments-message">
            {message}
          </div>
        )}

        {/* CONTENT */}

        {loading ? (
          <div className="appointments-empty">
            <h3>
              Loading appointments...
            </h3>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="appointments-empty">
            <div>📅</div>

            <h3>
              No{" "}
              {activeFilter === "all"
                ? ""
                : activeFilter}{" "}
              appointments
            </h3>

            <p>
              Appointments matching this
              filter will appear here.
            </p>
          </div>
        ) : (
          <div className="doctor-all-appointments">
            {filteredAppointments.map(
              (appointment) => (
                <article
                  key={appointment._id}
                  className="doctor-full-appointment-card"
                >

                  {/* PATIENT */}

                  <div className="full-appointment-patient">
                    <div className="appointment-patient-avatar">
                      {appointment.patient?.name
                        ?.charAt(0)
                        .toUpperCase() || "P"}
                    </div>

                    <div>
                      <strong>
                        {appointment.patient
                          ?.name ||
                          "Patient"}
                      </strong>

                      <span>
                        {appointment.patient
                          ?.email ||
                          "No email"}
                      </span>
                    </div>
                  </div>

                  {/* INFORMATION */}

                  <div className="full-appointment-info">
                    <div>
                      <span>Date</span>

                      <strong>
                        {formatDate(
                          appointment.date
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Time</span>

                      <strong>
                        {appointment.time}
                      </strong>
                    </div>

                    <div>
                      <span>Specialty</span>

                      <strong>
                        {appointment.specialty}
                      </strong>
                    </div>

                    <div>
                      <span>Status</span>

                      <strong
                        className={`full-status status-${appointment.status}`}
                      >
                        {appointment.status}
                      </strong>
                    </div>
                  </div>

                  {/* REASON */}

                  <div className="full-appointment-reason">
                    <span>
                      Reason for visit
                    </span>

                    <p>
                      {appointment.reason?.trim()
                        ? appointment.reason
                        : "No reason was provided by the patient."}
                    </p>
                  </div>

                  {/* UPCOMING ACTIONS */}

                  {appointment.status ===
                    "upcoming" && (
                    <div className="full-appointment-actions">
                      <button
                        type="button"
                        className="appointment-complete-btn"
                        disabled={
                          updatingId ===
                          appointment._id
                        }
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
                        className="appointment-delay-btn"
                        disabled={
                          updatingId ===
                          appointment._id
                        }
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
                  )}

                  {/* DELAYED ACTIONS */}

                  {appointment.status ===
                    "delayed" && (
                    <div className="full-appointment-actions">
                      <button
                        type="button"
                        className="appointment-complete-btn"
                        disabled={
                          updatingId ===
                          appointment._id
                        }
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
                        className="appointment-cancel-btn"
                        disabled={
                          updatingId ===
                          appointment._id
                        }
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment._id,
                            "cancelled"
                          )
                        }
                      >
                        ✕ Cancel Appointment
                      </button>
                    </div>
                  )}

                </article>
              )
            )}
          </div>
        )}

      </div>
    </main>
  );
}

export default DoctorAppointments;