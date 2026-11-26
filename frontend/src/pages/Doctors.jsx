import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./Doctors.css";

function Doctors() {
  const [doctors, setDoctors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [
    selectedSpecialty,
    setSelectedSpecialty,
  ] = useState("All");

  const [searchTerm, setSearchTerm] =
    useState("");

  const specialtiesSliderRef =
    useRef(null);

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
            data.message ||
              "Could not load doctors."
          );

          return;
        }

        setDoctors(data.doctors || []);
      } catch (error) {
        console.error(
          "Load doctors error:",
          error
        );

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
  // SPECIALTIES HELPER
  // =========================

  const getDoctorSpecialties = (
    doctor
  ) => {
    if (
      Array.isArray(doctor.specialties) &&
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
  // ALL MEDICAL SPECIALTIES
  // =========================

  const allSpecialties = [
  {
    value: "All",
    label: "All",
  },
  {
    value: "General Practitioner",
    label: "General Medicine",
  },
  {
    value: "Family Physician",
    label: "Family Medicine",
  },
  {
    value: "Cardiologist",
    label: "Cardiology",
  },
  {
    value: "Dermatologist",
    label: "Dermatology",
  },
  {
    value: "Dentist",
    label: "Dentistry",
  },
  {
    value: "Neurologist",
    label: "Neurology",
  },
  {
    value: "Paediatrician",
    label: "Paediatrics",
  },
  {
    value: "Ophthalmologist",
    label: "Ophthalmology",
  },
  {
    value: "Orthopaedist",
    label: "Orthopaedics",
  },
  {
    value: "Gynaecologist",
    label: "Gynaecology",
  },
  {
    value: "Psychiatrist",
    label: "Psychiatry",
  },
  {
    value: "Urologist",
    label: "Urology",
  },
  {
    value: "Oncologist",
    label: "Oncology",
  },
  {
    value: "Radiologist",
    label: "Radiology",
  },
  {
    value: "Surgeon",
    label: "Surgery",
  },
  {
    value: "Endocrinologist",
    label: "Endocrinology",
  },
  {
    value: "Gastroenterologist",
    label: "Gastroenterology",
  },
  {
    value: "Pulmonologist",
    label: "Pulmonology",
  },
  {
    value: "Nephrologist",
    label: "Nephrology",
  },
  {
    value: "Rheumatologist",
    label: "Rheumatology",
  },
  {
    value: "Haematologist",
    label: "Haematology",
  },
  {
    value: "Allergist",
    label: "Allergology",
  },
  {
    value: "Immunologist",
    label: "Immunology",
  },
  {
    value: "Infectious Disease Specialist",
    label: "Infectious Diseases",
  },
  {
    value: "Otolaryngologist",
    label: "ENT",
  },
  {
    value: "Plastic Surgeon",
    label: "Plastic Surgery",
  },
  {
    value: "Vascular Surgeon",
    label: "Vascular Surgery",
  },
  {
    value: "Neurosurgeon",
    label: "Neurosurgery",
  },
  {
    value: "Anaesthesiologist",
    label: "Anaesthesiology",
  },
  {
    value: "Emergency Medicine Physician",
    label: "Emergency Medicine",
  },
  {
    value: "Sports Medicine Physician",
    label: "Sports Medicine",
  },
  {
    value: "Physiatrist",
    label: "Physical Medicine & Rehabilitation",
  },
];

  // =========================
  // SPECIALTY ICON
  // =========================

  const getSpecialtyIcon = (
    specialty
  ) => {
    const icons = {
      All: "✦",

      "General Medicine": "🩺",
      "Family Medicine": "🏥",

      Cardiology: "❤️",
      Dermatology: "✨",
      Dentistry: "🦷",
      Neurology: "🧠",
      Pediatrics: "🧸",
      Ophthalmology: "👁️",
      Orthopedics: "🦴",
      Gynecology: "🌸",
      Psychiatry: "💬",
      Urology: "🩺",
      Oncology: "🎗️",
      Radiology: "🔬",
      Surgery: "🏥",

      Endocrinology: "🧬",
      Gastroenterology: "🩺",
      Pulmonology: "🫁",
      Nephrology: "🩺",
      Rheumatology: "🦴",
      Hematology: "🩸",
      Allergology: "🌿",
      Immunology: "🛡️",

      "Infectious Diseases": "🦠",

      "Otolaryngology (ENT)": "👂",

      "Plastic Surgery": "🏥",
      "Vascular Surgery": "🩸",

      Neurosurgery: "🧠",
      Anesthesiology: "💉",

      "Emergency Medicine": "🚑",

      "Sports Medicine": "🏃",

      "Physical Medicine & Rehabilitation":
        "♿",
    };

    return icons[specialty] || "⚕️";
  };

  // =========================
  // COUNT DOCTORS BY SPECIALTY
  // =========================

  const getSpecialtyDoctorCount = (
    specialty
  ) => {
    if (specialty === "All") {
      return doctors.length;
    }

    return doctors.filter((doctor) =>
      getDoctorSpecialties(doctor).some(
        (doctorSpecialty) =>
          doctorSpecialty.toLowerCase() ===
          specialty.toLowerCase()
      )
    ).length;
  };

  // =========================
  // FILTER AND SORT DOCTORS
  // =========================

  const displayedDoctors =
    useMemo(() => {
      const normalisedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      const filtered =
        doctors.filter((doctor) => {
          const doctorName =
            doctor.user?.name || "";

          const specialties =
            getDoctorSpecialties(
              doctor
            );

          const matchesSpecialty =
            selectedSpecialty ===
              "All" ||
            specialties.some(
              (specialty) =>
                specialty.toLowerCase() ===
                selectedSpecialty.toLowerCase()
            );

          const matchesSearch =
            !normalisedSearch ||
            doctorName
              .toLowerCase()
              .includes(
                normalisedSearch
              ) ||
            specialties.some(
              (specialty) =>
                specialty
                  .toLowerCase()
                  .includes(
                    normalisedSearch
                  )
            ) ||
            (doctor.location || "")
              .toLowerCase()
              .includes(
                normalisedSearch
              );

          return (
            matchesSpecialty &&
            matchesSearch
          );
        });

      // Recommended order:
      // rating -> reviews -> experience
      return [...filtered].sort(
        (first, second) => {
          const firstRating =
            Number(first.rating) || 0;

          const secondRating =
            Number(second.rating) || 0;

          if (
            secondRating !==
            firstRating
          ) {
            return (
              secondRating -
              firstRating
            );
          }

          const firstReviews =
            Number(first.reviews) || 0;

          const secondReviews =
            Number(second.reviews) || 0;

          if (
            secondReviews !==
            firstReviews
          ) {
            return (
              secondReviews -
              firstReviews
            );
          }

          const firstExperience =
            Number(first.experience) || 0;

          const secondExperience =
            Number(second.experience) || 0;

          return (
            secondExperience -
            firstExperience
          );
        }
      );
    }, [
      doctors,
      selectedSpecialty,
      searchTerm,
    ]);

  // =========================
  // SLIDER
  // =========================

  const slideSpecialties = (
    direction
  ) => {
    if (!specialtiesSliderRef.current) {
      return;
    }

    specialtiesSliderRef.current.scrollBy(
      {
        left:
          direction === "left"
            ? -350
            : 350,

        behavior: "smooth",
      }
    );
  };

  // =========================
  // BOOK
  // =========================

  const handleBook = (doctor) => {
    const user = JSON.parse(
      localStorage.getItem("user") ||
        sessionStorage.getItem(
          "user"
        ) ||
        "null"
    );

    if (!user) {
      window.location.href =
        "/login";

      return;
    }

    sessionStorage.setItem(
      "selectedDoctor",
      JSON.stringify({
        id: doctor._id,

        name:
          doctor.user?.name ||
          "Doctor",

        specialties:
          getDoctorSpecialties(
            doctor
          ),
      })
    );

    window.location.href =
      "/book-appointment";
  };

  // =========================
  // SECTION TITLE
  // =========================

  const doctorsSectionTitle =
    selectedSpecialty === "All"
      ? "Recommended Doctors"
      : `${selectedSpecialty} Specialists`;

  // =========================
  // JSX
  // =========================

  return (
    <main className="doctors-page">

      {/* HEADER */}

      <section className="doctors-header">
        <p>Our Specialists</p>

        <h1>Find Your Doctor</h1>

        <span>
          Choose from our healthcare
          professionals and book your
          appointment easily.
        </span>

        {/* SEARCH */}

        <div className="doctors-search-wrapper">
          <span>⌕</span>

          <input
            type="text"
            value={searchTerm}
            placeholder="Search by doctor, specialty or location..."
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="doctors-back">
          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/";
            }}
          >
            <span>←</span>
            Back to Home
          </button>
        </div>
      </section>

      {/* =========================
          SPECIALTIES
      ========================= */}

      {!loading &&
        !message &&
        doctors.length > 0 && (
          <section className="specialties-section">

            <div className="specialties-heading">
              <div>
                <p>
                  Browse by specialty
                </p>

                <h2>
                  Medical Specialties
                </h2>

                <span>
                  Select a specialty to
                  discover its doctors.
                </span>
              </div>

              <div className="specialties-arrows">
                <button
                  type="button"
                  onClick={() =>
                    slideSpecialties(
                      "left"
                    )
                  }
                  aria-label="Previous specialties"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() =>
                    slideSpecialties(
                      "right"
                    )
                  }
                  aria-label="Next specialties"
                >
                  →
                </button>
              </div>
            </div>

            <div
                className="specialties-slider"
                ref={specialtiesSliderRef}
              >
                {allSpecialties.map((specialty) => {
                  const doctorCount =
                    getSpecialtyDoctorCount(
                      specialty.value
                    );

                  return (
                    <button
                      key={specialty.value}
                      type="button"
                      className={
                        selectedSpecialty ===
                        specialty.value
                          ? "specialty-slide active"
                          : "specialty-slide"
                      }
                      onClick={() =>
                        setSelectedSpecialty(
                          specialty.value
                        )
                      }
                    >
                      <span className="specialty-slide-icon">
                        {getSpecialtyIcon(
                          specialty.label
                        )}
                      </span>

                      <strong>
                        {specialty.label}
                      </strong>

                      <small>
                        {doctorCount === 0
                          ? "No doctors yet"
                          : doctorCount === 1
                          ? "1 doctor"
                          : `${doctorCount} doctors`}
                      </small>
                    </button>
                  );
                })}
              </div>
          </section>
        )}

      {/* =========================
          DOCTORS
      ========================= */}

      <section className="all-doctors">

        {loading ? (
          <div className="doctors-state">
            <h3>
              Loading doctors...
            </h3>

            <p>
              Please wait while we
              load our healthcare
              professionals.
            </p>
          </div>
        ) : message ? (
          <div className="doctors-state">
            <h3>
              Could not load doctors
            </h3>

            <p>{message}</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="doctors-state">
            <h3>
              No doctors available
            </h3>

            <p>
              There are currently no
              approved doctors
              available.
            </p>
          </div>
        ) : (
          <>
            {/* RESULTS HEADER */}

            <div className="doctors-results-header">
              <div>
                <p>
                  {selectedSpecialty ===
                  "All"
                    ? "Top matches for you"
                    : selectedSpecialty}
                </p>

                <h2>
                  {
                    doctorsSectionTitle
                  }
                </h2>

                <span>
                  {
                    displayedDoctors.length
                  }{" "}
                  {displayedDoctors.length ===
                  1
                    ? "doctor found"
                    : "doctors found"}
                </span>
              </div>

              {selectedSpecialty !==
                "All" && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSpecialty(
                      "All"
                    )
                  }
                >
                  Clear specialty
                </button>
              )}
            </div>

            {/* NO DOCTORS */}

            {displayedDoctors.length ===
            0 ? (
              <div className="doctors-state doctors-filter-empty">
                <div>🔍</div>

                <h3>
                  {selectedSpecialty ===
                  "All"
                    ? "No matching doctors"
                    : `No ${selectedSpecialty} doctors yet`}
                </h3>

                <p>
                  {selectedSpecialty ===
                  "All"
                    ? "Try another search term."
                    : "Doctors from this specialty will appear here once their accounts are approved."}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");

                    setSelectedSpecialty(
                      "All"
                    );
                  }}
                >
                  Show all doctors
                </button>
              </div>
            ) : (
              /* DOCTOR CARDS */

              <div className="all-doctors-grid">
                {displayedDoctors.map(
                  (doctor) => {
                    const doctorName =
                      doctor.user
                        ?.name ||
                      "Doctor";

                    const specialties =
                      getDoctorSpecialties(
                        doctor
                      );

                    const initial =
                      doctorName
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
                              (
                                specialty
                              ) => (
                                <span
                                  className="doctor-specialty"
                                  key={
                                    specialty
                                  }
                                >
                                  {
                                    specialty
                                  }
                                </span>
                              )
                            )}
                          </div>

                          {/* NAME */}

                          <h3>
                            {doctorName}
                          </h3>

                          {/* LOCATION */}

                          <p className="doctor-location">
                            📍{" "}
                            {doctor.location ||
                              "Location not provided"}
                          </p>

                          {/* EXPERIENCE */}

                          <p className="doctor-experience">
                            {doctor.experience ||
                              0}{" "}
                            {Number(
                              doctor.experience
                            ) === 1
                              ? "year"
                              : "years"}{" "}
                            of experience
                          </p>

                          {/* RATING */}

                          <div className="doctor-rating">
                            <span>
                              ★
                            </span>

                            <strong>
                              {doctor.rating ||
                                0}
                            </strong>

                            <small>
                              (
                              {doctor.reviews ||
                                0}{" "}
                              reviews)
                            </small>
                          </div>

                          {/* VERIFIED */}

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
                              onClick={() =>
                                handleBook(
                                  doctor
                                )
                              }
                            >
                              Book
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default Doctors;