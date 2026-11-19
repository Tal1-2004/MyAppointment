import { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "null"
  );

  // =========================
  // GET DOCTORS
  // =========================

  const getDoctors = async () => {
    try {
      const [pendingResponse, approvedResponse] =
        await Promise.all([
          fetch(
            "http://localhost:5000/api/admin/doctors/pending",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            "http://localhost:5000/api/admin/doctors/approved",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      if (!pendingResponse.ok || !approvedResponse.ok) {
        throw new Error("Could not load doctors");
      }

      const pendingData = await pendingResponse.json();
      const approvedData = await approvedResponse.json();

      setPendingDoctors(pendingData.doctors || []);
      setApprovedDoctors(approvedData.doctors || []);
    } catch (error) {
      console.error(error);
      setMessage("Could not load doctors.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET APPOINTMENTS
  // =========================

  const getAppointments = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/appointments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Could not load appointments."
        );
        return;
      }

      setAppointments(data.appointments || []);
    } catch (error) {
      console.error(error);
      setMessage("Could not load appointments.");
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      window.location.href = "/login";
      return;
    }

    getDoctors();
    getAppointments();
  }, []);

  // =========================
  // APPROVE DOCTOR
  // =========================

  const approveDoctor = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/doctors/${id}/approve`,
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
          data.message || "Could not approve doctor."
        );
        return;
      }

      setMessage("Doctor approved successfully.");

      await getDoctors();
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the server.");
    }
  };

  // =========================
  // REJECT DOCTOR
  // =========================

  const rejectDoctor = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/doctors/${id}/reject`,
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
          data.message || "Could not reject doctor."
        );
        return;
      }

      setMessage("Doctor application rejected.");

      await getDoctors();
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the server.");
    }
  };

  // =========================
  // REMOVE DOCTOR
  // =========================

  const removeDoctor = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently remove this doctor?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/doctors/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Could not remove doctor."
        );
        return;
      }

      setMessage("Doctor removed successfully.");

      await getDoctors();
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the server.");
    }
  };

  // =========================
  // CANCEL APPOINTMENT
  // =========================

  const cancelAppointment = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/appointments/${id}/cancel`,
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
          data.message || "Could not cancel appointment."
        );
        return;
      }

      setMessage("Appointment cancelled successfully.");

      await getAppointments();
    } catch (error) {
      console.error(error);

      setMessage("Cannot connect to the server.");
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

    window.location.href = "/login";
  };

  if (loading) {
    return <p>Loading admin dashboard...</p>;
  }

  return (
    <main className="admin-dashboard">

      {/* HEADER */}

      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Manage doctor applications, verified doctors
            and appointments.
          </p>
        </div>

        <button onClick={handleLogout}>
          Log out
        </button>
      </div>

      {/* MESSAGE */}

      {message && (
        <p className="admin-message">
          {message}
        </p>
      )}

      {/* =========================
          PENDING DOCTORS
      ========================= */}

      <section className="admin-section">
        <h2>Pending Doctor Applications</h2>

        {pendingDoctors.length === 0 ? (
          <p>No pending doctor applications.</p>
        ) : (
          pendingDoctors.map((doctor) => (
            <div
              className="admin-doctor-card"
              key={doctor._id}
            >
              <h3>
                {doctor.user?.name || "Doctor"}
              </h3>

              <p>
                <strong>Email:</strong>{" "}
                {doctor.user?.email}
              </p>

              <p>
                <strong>Specialty:</strong>{" "}
                {doctor.specialty}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {doctor.location}
              </p>

              <p>
                <strong>Experience:</strong>{" "}
                {doctor.experience} years
              </p>

              <p>
                <strong>Status:</strong> Pending
              </p>

              <div className="admin-actions">
                <button
                  onClick={() =>
                    approveDoctor(doctor._id)
                  }
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    rejectDoctor(doctor._id)
                  }
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* =========================
          APPROVED DOCTORS
      ========================= */}

      <section className="admin-section">
        <h2>Approved Doctors</h2>

        {approvedDoctors.length === 0 ? (
          <p>No approved doctors.</p>
        ) : (
          approvedDoctors.map((doctor) => (
            <div
              className="admin-doctor-card"
              key={doctor._id}
            >
              <h3>
                {doctor.user?.name || "Doctor"}
              </h3>

              <p>
                <strong>Email:</strong>{" "}
                {doctor.user?.email}
              </p>

              <p>
                <strong>Specialty:</strong>{" "}
                {doctor.specialty}
              </p>

              <p>
                <strong>Experience:</strong>{" "}
                {doctor.experience} years
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {doctor.location}
              </p>

              <p>
                <strong>Bio:</strong>{" "}
                {doctor.bio}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                Approved ✅
              </p>

              <button
                className="remove-doctor-btn"
                onClick={() =>
                  removeDoctor(doctor._id)
                }
              >
                Remove Doctor
              </button>
            </div>
          ))
        )}
      </section>

      {/* =========================
          ALL APPOINTMENTS
      ========================= */}

      <section className="admin-section">
        <h2>All Appointments</h2>

        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div className="appointments-table-wrapper">

            <table className="appointments-table">

              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>

                    <td>
                      <div className="patient-cell">
                        <strong>
                          {appointment.patient?.name ||
                            "Patient"}
                        </strong>

                        <span>
                          {appointment.patient?.email ||
                            "N/A"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {appointment.doctorName}
                    </td>

                    <td>
                      {appointment.specialty}
                    </td>

                    <td>
                      {new Date(
                        appointment.date
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {appointment.time}
                    </td>

                    <td>
                      {appointment.reason ||
                        "Not provided"}
                    </td>

                    <td>
                      <span
                        className={`appointment-status ${appointment.status}`}
                      >
                        {appointment.status}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      {appointment.status ===
                      "upcoming" ? (
                        <button
                          className="cancel-appointment-btn"
                          onClick={() =>
                            cancelAppointment(
                              appointment._id
                            )
                          }
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="no-action">
                          {appointment.status ===
                          "completed"
                            ? "Completed"
                            : "Cancelled"}
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}
      </section>

    </main>
  );
}

export default AdminDashboard;