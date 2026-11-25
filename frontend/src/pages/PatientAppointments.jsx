import { useEffect, useState } from "react";
import "./PatientAppointments.css";

function PatientAppointments() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const [appointments, setAppointments] =
    useState([]);

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [cancellingId, setCancellingId] =
    useState(null);

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
              Authorization: `Bearer ${token}`,
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
  // CANCEL APPOINTMENT
  // =========================

  const cancelAppointment = async (id) => {
    try {
      setCancellingId(id);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/appointments/${id}/cancel`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not cancel appointment."
        );

        return;
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === id
            ? {
                ...appointment,
                status: "cancelled",
              }
            : appointment
        )
      );

      setMessage(
        "Appointment cancelled successfully."
      );
    } catch (error) {
      console.error(
        "Cancel appointment error:",
        error
      );

      setMessage(
        "Cannot connect to the server."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // =========================
  // FILTERS
  // =========================

  const filteredAppointments =
    activeFilter === "all"
      ? appointments
      : appointments.filter(
          (appointment) =>
            appointment.status ===
            activeFilter
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
  // DOCTOR NAME
  // =========================

  const getDoctorName = (appointment) => {
    return (
      appointment.doctor?.user?.name ||
      appointment.doctorName ||
      "Doctor"
    );
  };

  // =========================
  // JSX
  // =========================

  return (
    <main className="patient-appointments-page">
      <div className="patient-appointments-container">

        {/* HEADER */}

        <div className="patient-appointments-header">
          <div>
            <p>Patient Account</p>

            <h1>My Appointments</h1>

            <span>
              View and manage your medical
              appointments.
            </span>
          </div>

          <button
            type="button"
            className="patient-appointments-home"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            ← Home
          </button>
        </div>

        {/* FILTERS */}

        <div className="patient-appointment-filters">
          {[
            ["all", "All"],
            ["upcoming", "Upcoming"],
            ["completed", "Completed"],
            ["cancelled", "Cancelled"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                activeFilter === value
                  ? "patient-appointment-filter active"
                  : "patient-appointment-filter"
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
          <div className="patient-appointments-message">
            {message}
          </div>
        )}

        {/* CONTENT */}

        {loading ? (
          <div className="patient-appointments-empty">
            <h3>
              Loading appointments...
            </h3>
          </div>
        ) : filteredAppointments.length ===
          0 ? (
          <div className="patient-appointments-empty">
            <div>📅</div>

            <h3>
              No{" "}
              {activeFilter === "all"
                ? ""
                : activeFilter}{" "}
              appointments
            </h3>

            <p>
              Your appointments will appear
              here.
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
          <div className="patient-appointments-list">
            {filteredAppointments.map(
              (appointment) => (
                <article
                  key={appointment._id}
                  className="patient-appointment-card"
                >

                  {/* DOCTOR */}

                  <div className="patient-appointment-doctor">
                    <div className="patient-doctor-avatar">
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

                    <span
                      className={`patient-appointment-status patient-status-${appointment.status}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  {/* DETAILS */}

                  <div className="patient-appointment-details">
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
                      <span>
                        Booking ID
                      </span>

                      <strong>
                        {appointment._id}
                      </strong>
                    </div>
                  </div>

                  {/* REASON */}

                  <div className="patient-appointment-reason">
                    <span>
                      Reason for visit
                    </span>

                    <p>
                      {appointment.reason?.trim()
                        ? appointment.reason
                        : "No reason was provided."}
                    </p>
                  </div>

                  {/* CANCEL ACTION */}

                  {appointment.status ===
                    "upcoming" && (
                    <div className="patient-appointment-actions">
                      <button
                        type="button"
                        className="patient-cancel-appointment"
                        disabled={
                          cancellingId ===
                          appointment._id
                        }
                        onClick={() =>
                          cancelAppointment(
                            appointment._id
                          )
                        }
                      >
                        {cancellingId ===
                        appointment._id
                          ? "Cancelling..."
                          : "Cancel Appointment"}
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

export default PatientAppointments;