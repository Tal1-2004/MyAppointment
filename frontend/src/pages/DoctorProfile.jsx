import { useEffect, useState } from "react";
import "./DoctorProfile.css";

function DoctorProfile() {
  const user = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user")
  );

  const [doctor, setDoctor] = useState(null);

  const [formData, setFormData] = useState({
    specialties: [],
    experience: "",
    location: "",
    bio: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fotoja e konfirmuar që do të ruhet në backend
  const [profileImage, setProfileImage] =
    useState(null);

  // Fotoja që shfaqet në profil
  const [imagePreview, setImagePreview] =
    useState("");

  // Modal-i i fotografisë
  const [photoModalOpen, setPhotoModalOpen] =
    useState(false);

  // Fotoja e zgjedhur brenda modal-it
  const [temporaryImage, setTemporaryImage] =
    useState(null);

  const [temporaryPreview, setTemporaryPreview] =
    useState("");

  const locations = [
    "Prishtina",
    "Prizren",
    "Peja",
    "Gjakova",
    "Ferizaj",
    "Gjilan",
    "Mitrovica",
  ];

  const specialtyOptions = [
    "General Practitioner",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Paediatrician",
    "Psychiatrist",
    "Gynaecologist",
    "Ophthalmologist",
    "Orthopaedic Surgeon",
    "Otolaryngologist",
    "Urologist",
    "Endocrinologist",
    "Gastroenterologist",
    "Pulmonologist",
    "Rheumatologist",
  ];

  // =========================
  // PROFILE IMAGE URL
  // =========================

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) {
      return "";
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    const cleanPath = imagePath
      .replaceAll("\\", "/")
      .replace(/^\/+/, "");

    return `http://localhost:5000/${cleanPath}`;
  };

  // =========================
  // LOAD PROFILE
  // =========================

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!user?.id) {
        window.location.href = "/doctor-login";
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/doctors/profile/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Could not load doctor profile."
          );
          return;
        }

        setDoctor(data.doctor);
        setProfileImage(null);

        setImagePreview(
          getProfileImageUrl(
            data.doctor.profileImage
          )
        );

        const savedSpecialties =
          data.doctor.specialties?.length > 0
            ? data.doctor.specialties
            : data.doctor.specialty
            ? [data.doctor.specialty]
            : [];

        setFormData({
          specialties: savedSpecialties,
          experience:
            data.doctor.experience ?? "",
          location:
            data.doctor.location || "",
          bio: data.doctor.bio || "",
        });
      } catch (error) {
        console.error(
          "Load doctor profile error:",
          error
        );

        setMessage(
          "Cannot connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [user?.id]);

  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  };

  // =========================
  // SPECIALTIES
  // =========================

  const handleSpecialtyToggle = (specialty) => {
    setMessage("");

    setFormData((current) => {
      const isSelected =
        current.specialties.includes(specialty);

      if (isSelected) {
        return {
          ...current,
          specialties:
            current.specialties.filter(
              (item) => item !== specialty
            ),
        };
      }

      if (current.specialties.length >= 2) {
        setMessage(
          "You can select a maximum of two specialties."
        );

        return current;
      }

      return {
        ...current,
        specialties: [
          ...current.specialties,
          specialty,
        ],
      };
    });
  };

  // =========================
  // PHOTO MODAL
  // =========================

  const openPhotoModal = () => {
    setTemporaryImage(null);
    setTemporaryPreview(imagePreview);
    setPhotoModalOpen(true);
    setMessage("");
  };

  const closePhotoModal = () => {
    setTemporaryImage(null);
    setTemporaryPreview("");
    setPhotoModalOpen(false);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "Please select a JPG or PNG image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage(
        "Profile image must be smaller than 5 MB."
      );
      return;
    }

    setTemporaryImage(file);

    setTemporaryPreview(
      URL.createObjectURL(file)
    );

    setMessage("");
  };

  const confirmPhoto = () => {
    if (!temporaryImage) {
      setMessage(
        "Please choose an image first."
      );
      return;
    }

    // Fotoja shfaqet në profil,
    // por ruhet në backend vetëm me Save Changes
    setProfileImage(temporaryImage);
    setImagePreview(temporaryPreview);

    setTemporaryImage(null);
    setTemporaryPreview("");
    setPhotoModalOpen(false);
    setMessage("");
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancel = () => {
    if (!doctor) {
      return;
    }

    setFormData({
      specialties:
        doctor.specialties?.length > 0
          ? doctor.specialties
          : doctor.specialty
          ? [doctor.specialty]
          : [],

      experience:
        doctor.experience ?? "",

      location:
        doctor.location || "",

      bio:
        doctor.bio || "",
    });

    setProfileImage(null);

    setImagePreview(
      getProfileImageUrl(
        doctor.profileImage
      )
    );

    setPhotoModalOpen(false);
    setTemporaryImage(null);
    setTemporaryPreview("");

    setEditing(false);
    setMessage("");
  };

  // =========================
  // UPDATE PROFILE
  // =========================

  const handleSave = async () => {
  if (
    formData.specialties.length === 0 ||
    formData.experience === "" ||
    !formData.location.trim() ||
    !formData.bio.trim()
  ) {
    setMessage(
      "Please complete all profile fields."
    );
    return;
  }

  if (formData.specialties.length > 2) {
    setMessage(
      "You can select a maximum of two specialties."
    );
    return;
  }

  const experience = Number(formData.experience);

  if (
    Number.isNaN(experience) ||
    experience < 0
  ) {
    setMessage(
      "Experience must be a valid number."
    );
    return;
  }

  // =========================
  // PREPARE DATA
  // =========================

  const profileData = new FormData();

  profileData.append(
    "specialty",
    formData.specialties[0]
  );

  profileData.append(
    "specialties",
    JSON.stringify(formData.specialties)
  );

  profileData.append(
    "experience",
    experience
  );

  profileData.append(
    "location",
    formData.location.trim()
  );

  profileData.append(
    "bio",
    formData.bio.trim()
  );

  // Nëse është zgjedhur foto e re
  if (profileImage) {
    profileData.append(
      "profileImage",
      profileImage
    );
  }

  // =========================
  // SAVE PROFILE
  // =========================

  try {
    setSaving(true);
    setMessage("");

    const response = await fetch(
      `http://localhost:5000/api/doctors/profile/${user.id}`,
      {
        method: "PUT",
        body: profileData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.message ||
          "Could not update profile."
      );
      return;
    }

    // Profili i ri prej backend-it
    setDoctor(data.doctor);

    // Fotoja tash është ruajtur
    setProfileImage(null);

    setImagePreview(
      getProfileImageUrl(
        data.doctor.profileImage
      )
    );

    // Rifresko formën me të dhënat e ruajtura
    setFormData({
      specialties:
        data.doctor.specialties?.length > 0
          ? data.doctor.specialties
          : data.doctor.specialty
          ? [data.doctor.specialty]
          : [],

      experience:
        data.doctor.experience ?? "",

      location:
        data.doctor.location || "",

      bio:
        data.doctor.bio || "",
    });

    // Pastro modalin e fotos
    setPhotoModalOpen(false);
    setTemporaryImage(null);
    setTemporaryPreview("");

    // Kthehu prej Edit Mode në profil normal
    setEditing(false);

    setMessage(
      "Profile updated successfully."
    );
  } catch (error) {
    console.error(
      "Update doctor profile error:",
      error
    );

    setMessage(
      "Cannot connect to the server."
    );
  } finally {
    setSaving(false);
  }
};

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="doctor-profile-page">
        <div className="doctor-profile-loading">
          Loading profile...
        </div>
      </main>
    );
  }

  if (!doctor) {
    return (
      <main className="doctor-profile-page">
        <div className="doctor-profile-loading">
          {message ||
            "Doctor profile not found."}
        </div>
      </main>
    );
  }

  // =========================
  // DOCTOR INFORMATION
  // =========================

  const verificationText =
    doctor.verificationStatus === "approved"
      ? "Approved"
      : doctor.verificationStatus ===
        "rejected"
      ? "Rejected"
      : "Pending";

  const doctorName =
    doctor.user?.name ||
    user?.name ||
    "Doctor";

  const doctorEmail =
    doctor.user?.email ||
    user?.email ||
    "";

  const doctorSpecialties =
    doctor.specialties?.length > 0
      ? doctor.specialties
      : doctor.specialty
      ? [doctor.specialty]
      : [];

      const hasChanges =
      profileImage !== null ||
      JSON.stringify(formData.specialties) !==
        JSON.stringify(doctorSpecialties) ||
      String(formData.experience) !==
        String(doctor.experience ?? "") ||
      formData.location !==
        (doctor.location || "") ||
      formData.bio !==
        (doctor.bio || "");

  // =========================
  // JSX
  // =========================

  return (
    <main className="doctor-profile-page">
      <div className="doctor-profile-container">

        {/* HEADER */}

        <div className="doctor-profile-header">
          <div>
            <p>Doctor Account</p>

            <h1>My Profile</h1>

            <span>
              View and manage your professional
              information.
            </span>
          </div>

          <button
            type="button"
            className="doctor-profile-back"
            onClick={() => {
              window.location.href =
                "/doctor-dashboard";
            }}
          >
            ← Dashboard
          </button>
        </div>

        {/* PROFILE HERO */}

        <section className="doctor-profile-hero">

          {/* PROFILE PHOTO */}

          <div className="doctor-profile-photo-wrapper">
            <div className="doctor-profile-avatar">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={`${doctorName} profile`}
                />
              ) : (
                doctorName
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            {editing && (
              <button
                type="button"
                className="doctor-change-photo-btn"
                onClick={openPhotoModal}
              >
                Change photo
              </button>
            )}
          </div>

          {/* DOCTOR INFO */}

          <div className="doctor-profile-identity">
            <h2>{doctorName}</h2>

            <p>{doctorEmail}</p>

            <div className="doctor-profile-badges">
              {doctorSpecialties.map(
                (specialty) => (
                  <span
                    className="specialty-badge"
                    key={specialty}
                  >
                    {specialty}
                  </span>
                )
              )}

              <span
                className={`verification-badge verification-${doctor.verificationStatus}`}
              >
                {verificationText}
              </span>
            </div>
          </div>

          {!editing && (
            <button
              type="button"
              className="doctor-profile-edit"
              onClick={() => {
                setEditing(true);
                setMessage("");
              }}
            >
              Edit Profile
            </button>
          )}
        </section>

        {/* PHOTO UPLOAD MODAL */}

        {photoModalOpen && (
          <div className="doctor-photo-modal-overlay">
            <div className="doctor-photo-modal">

              <div className="doctor-photo-modal-header">
                <h2>Upload profile photo</h2>

                <button
                  type="button"
                  className="doctor-photo-modal-close"
                  onClick={closePhotoModal}
                >
                  ×
                </button>
              </div>

              <div className="doctor-photo-preview">
                {temporaryPreview ? (
                  <img
                    src={temporaryPreview}
                    alt="Profile preview"
                  />
                ) : (
                  <span>
                    {doctorName
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <label
                htmlFor="doctor-photo-upload"
                className="doctor-photo-upload-box"
              >
                <strong>
                  📷 Upload image
                </strong>

                <span>
                  JPG or PNG, maximum 5 MB
                </span>
              </label>

              <input
                id="doctor-photo-upload"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={
                  handleProfileImageChange
                }
                hidden
              />

              <div className="doctor-photo-modal-actions">
                <button
                  type="button"
                  className="doctor-photo-cancel-btn"
                  onClick={closePhotoModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="doctor-photo-save-btn"
                  onClick={confirmPhoto}
                  disabled={!temporaryImage}
                >
                  Save photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGE */}

        {message && (
          <div className="doctor-profile-message">
            {message}
          </div>
        )}

        {/* PROFESSIONAL INFORMATION */}

        <section className="doctor-profile-card">
          <div className="doctor-profile-card-header">
            <div>
              <h2>
                Professional Information
              </h2>

              <p>
                Information patients see on
                your doctor profile.
              </p>
            </div>
          </div>

          <div className="doctor-profile-form">

            {/* NAME */}

            <div className="profile-field">
              <label>Full name</label>

              <input
                type="text"
                value={doctorName}
                disabled
              />

              <small>
                Account information
              </small>
            </div>

            {/* EMAIL */}

            <div className="profile-field">
              <label>Email</label>

              <input
                type="email"
                value={doctorEmail}
                disabled
              />

              <small>
                Account information
              </small>
            </div>

            {/* SPECIALTIES */}

            <div className="profile-field profile-field-full">
              <label>
                Specialties

                <span className="specialty-limit">
                  {formData.specialties.length}/2 selected
                </span>
              </label>

              <div className="profile-specialty-options">
                {specialtyOptions.map(
                  (specialty) => {
                    const isSelected =
                      formData.specialties.includes(
                        specialty
                      );

                    return (
                      <button
                        key={specialty}
                        type="button"
                        disabled={!editing}
                        onClick={() =>
                          handleSpecialtyToggle(
                            specialty
                          )
                        }
                        className={
                          isSelected
                            ? "profile-specialty-option specialty-selected"
                            : "profile-specialty-option"
                        }
                      >
                        {isSelected && (
                          <span>✓</span>
                        )}

                        {specialty}
                      </button>
                    );
                  }
                )}
              </div>

              <small>
                Select up to two verified
                medical specialties.
              </small>
            </div>

            {/* EXPERIENCE */}

            <div className="profile-field">
              <label>
                Years of experience
              </label>

              <input
                type="number"
                name="experience"
                min="0"
                value={formData.experience}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            {/* LOCATION */}

            <div className="profile-field">
              <label>Location</label>

              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={!editing}
              >
                {locations.map(
                  (location) => (
                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* APPOINTMENT DURATION */}

            <div className="profile-field">
              <label>
                Appointment duration
              </label>

              <input
                type="text"
                value={
                  doctor.appointmentDuration === 60
                    ? "1 hour"
                    : `${doctor.appointmentDuration} minutes`
                }
                disabled
              />

              <small>
                Change this from Manage
                Availability
              </small>
            </div>

            {/* BIO */}

            <div className="profile-field profile-field-full">
              <label>
                Professional bio
              </label>

              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!editing}
                rows="6"
              />
            </div>
          </div>

          {/* EDIT ACTIONS */}

          {editing && (
            <div className="doctor-profile-actions">
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              {hasChanges && (
                <button
                  type="button"
                  className="profile-save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              )}
            </div>
          )}
        </section>

        {/* PRACTICE */}

        <section className="doctor-profile-card">
          <div className="doctor-profile-card-header">
            <div>
              <h2>Practice</h2>

              <p>
                Your current booking
                configuration.
              </p>
            </div>

            <button
              type="button"
              className="manage-availability-btn"
              onClick={() => {
                window.location.href =
                  "/doctor-availability";
              }}
            >
              Manage Availability
            </button>
          </div>

          <div className="profile-practice-grid">
            <div>
              <span>
                Appointment duration
              </span>

              <strong>
                {doctor.appointmentDuration === 60
                  ? "1 hour"
                  : `${doctor.appointmentDuration} min`}
              </strong>
            </div>

            <div>
              <span>Rating</span>

              <strong>
                ⭐ {doctor.rating || 0}
              </strong>
            </div>

            <div>
              <span>Reviews</span>

              <strong>
                {doctor.reviews || 0}
              </strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default DoctorProfile;