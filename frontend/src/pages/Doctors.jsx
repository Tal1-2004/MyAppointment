import { useEffect, useState } from "react";
import "./Doctors.css";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // =========================
  // LOAD REAL DOCTORS
  // =========================

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/doctors"
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message || "Could not load doctors."
          );
          return;
        }

        setDoctors(data.doctors || []);
      } catch (error) {
        console.error("Load doctors error:", error);

        setMessage(
          "Cannot connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // =========================
  // BOOK
  // =========================

  const handleBook = () => {
    const user = JSON.parse(
      localStorage.getItem("user") ||
        sessionStorage.getItem("user")
    );

    if (!user) {
      window.location.href = "/login";
      return;
    }

    window.location.href = "/book-appointment";
  };

  // =========================
  // SPECIALTIES HELPER
  // =========================

  const getDoctorSpecialties = (doctor) => {
    if (
      doctor.specialties &&
      doctor.specialties.length > 0
    ) {
      return doctor.specialties;
    }

    if (doctor.specialty) {
      return [doctor.specialty];
    }

    return [];
  };

  // =========================
  // JSX
  // =========================

  return (
    <main className="doctors-page">
      <section className="doctors-header">
        <p>Our Specialists</p>

        <h1>Find Your Doctor</h1>

        <span>
          Choose from our healthcare professionals
          and book your appointment easily.
        </span>

        <div className="doctors-back">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <span>←</span> Back to Home
          </button>
        </div>
      </section>

      <section className="all-doctors">

        {/* LOADING */}

        {loading ? (
          <div className="doctors-state">
            <h3>Loading doctors...</h3>

            <p>
              Please wait while we load our
              healthcare professionals.
            </p>
          </div>
        ) : message ? (
          <div className="doctors-state">
            <h3>Could not load doctors</h3>

            <p>{message}</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="doctors-state">
            <h3>No doctors available</h3>

            <p>
              There are currently no approved
              doctors available.
            </p>
          </div>
        ) : (
          <div className="all-doctors-grid">
            {doctors.map((doctor) => {
              const doctorName =
                doctor.user?.name || "Doctor";

              const specialties =
                getDoctorSpecialties(doctor);

              const initial = doctorName
                .charAt(0)
                .toUpperCase();

              return (
                <div
                  className="doctor-card"
                  key={doctor._id}
                >
                  {/* AVATAR */}

                  <div className="doctor-image doctor-avatar-image">
                    <div className="doctor-list-avatar">
                      {initial}
                    </div>
                  </div>

                  <div className="doctor-info">

                    {/* SPECIALTIES */}

                    <div className="doctor-specialties">
                      {specialties.map(
                        (specialty) => (
                          <span
                            className="doctor-specialty"
                            key={specialty}
                          >
                            {specialty}
                          </span>
                        )
                      )}
                    </div>

                    {/* NAME */}

                    <h3>{doctorName}</h3>

                    {/* LOCATION */}

                    <p className="doctor-location">
                      📍 {doctor.location}
                    </p>

                    {/* EXPERIENCE */}

                    <p className="doctor-experience">
                      {doctor.experience}{" "}
                      {doctor.experience === 1
                        ? "year"
                        : "years"}{" "}
                      of experience
                    </p>

                    {/* RATING */}

                    <div className="doctor-rating">
                      <span>★</span>

                      <strong>
                        {doctor.rating || 0}
                      </strong>

                      <small>
                        ({doctor.reviews || 0}{" "}
                        reviews)
                      </small>
                    </div>

                    {/* VERIFICATION */}

                    <p className="availability">
                      ● Verified doctor
                    </p>

                    {/* BUTTONS */}

                    <div className="doctor-buttons">
                      <button
                        type="button"
                        className="profile-btn"
                      >
                        View Profile
                      </button>

                      <button
                        type="button"
                        className="doctor-book-btn"
                        onClick={handleBook}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Doctors;