import { useEffect, useState } from "react";
import "./PatientProfile.css";

function PatientProfile() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const [patient, setPatient] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    location: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [profileImage, setProfileImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [photoModalOpen, setPhotoModalOpen] =
    useState(false);

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

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: 120 },
    (_, index) => currentYear - index
  );

  const days = Array.from(
    { length: 31 },
    (_, index) =>
      String(index + 1).padStart(2, "0")
  );

  // =========================
  // IMAGE URL
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
  // DATE HELPERS
  // =========================

  const getBirthDateParts = (dateValue) => {
    if (!dateValue) {
      return {
        birthDay: "",
        birthMonth: "",
        birthYear: "",
      };
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return {
        birthDay: "",
        birthMonth: "",
        birthYear: "",
      };
    }

    return {
      birthDay: String(
        date.getUTCDate()
      ).padStart(2, "0"),

      birthMonth: String(
        date.getUTCMonth() + 1
      ).padStart(2, "0"),

      birthYear: String(
        date.getUTCFullYear()
      ),
    };
  };

  const createBirthDate = () => {
    const {
      birthDay,
      birthMonth,
      birthYear,
    } = formData;

    if (
      !birthDay &&
      !birthMonth &&
      !birthYear
    ) {
      return "";
    }

    if (
      !birthDay ||
      !birthMonth ||
      !birthYear
    ) {
      return null;
    }

    const dateString =
      `${birthYear}-${birthMonth}-${birthDay}`;

    const date = new Date(
      `${dateString}T00:00:00.000Z`
    );

    const valid =
      !Number.isNaN(date.getTime()) &&
      date.getUTCFullYear() ===
        Number(birthYear) &&
      date.getUTCMonth() + 1 ===
        Number(birthMonth) &&
      date.getUTCDate() ===
        Number(birthDay);

    return valid ? dateString : null;
  };

  // =========================
  // LOAD PROFILE
  // =========================

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/auth/profile",
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
              "Could not load profile."
          );
          return;
        }

        const birthParts =
          getBirthDateParts(
            data.user.dateOfBirth
          );

        setPatient(data.user);
        setProfileImage(null);

        setImagePreview(
          getProfileImageUrl(
            data.user.profileImage
          )
        );

        setFormData({
          name: data.user.name || "",
          phone: data.user.phone || "",
          ...birthParts,
          location:
            data.user.location || "",
        });
      } catch (error) {
        console.error(
          "Load patient profile error:",
          error
        );

        setMessage(
          "Cannot connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // =========================
  // FORM CHANGE
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

    setProfileImage(temporaryImage);
    setImagePreview(temporaryPreview);

    setTemporaryImage(null);
    setTemporaryPreview("");
    setPhotoModalOpen(false);
    setMessage("");
  };

  // =========================
  // CANCEL
  // =========================

  const handleCancel = () => {
    if (!patient) {
      return;
    }

    const birthParts =
      getBirthDateParts(
        patient.dateOfBirth
      );

    setFormData({
      name: patient.name || "",
      phone: patient.phone || "",
      ...birthParts,
      location: patient.location || "",
    });

    setProfileImage(null);

    setImagePreview(
      getProfileImageUrl(
        patient.profileImage
      )
    );

    setPhotoModalOpen(false);
    setTemporaryImage(null);
    setTemporaryPreview("");

    setEditing(false);
    setMessage("");
  };

  // =========================
  // CHECK CHANGES
  // =========================

  const savedBirthParts =
    getBirthDateParts(
      patient?.dateOfBirth
    );

  const hasChanges =
    patient &&
    (
      profileImage !== null ||

      formData.name !==
        (patient.name || "") ||

      formData.phone !==
        (patient.phone || "") ||

      formData.birthDay !==
        savedBirthParts.birthDay ||

      formData.birthMonth !==
        savedBirthParts.birthMonth ||

      formData.birthYear !==
        savedBirthParts.birthYear ||

      formData.location !==
        (patient.location || "")
    );

  // =========================
  // SAVE PROFILE
  // =========================

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMessage(
        "Full name is required."
      );
      return;
    }

    const dateOfBirth =
      createBirthDate();

    if (dateOfBirth === null) {
      setMessage(
        "Please select a valid date of birth."
      );
      return;
    }

    const profileData =
      new FormData();

    profileData.append(
      "name",
      formData.name.trim()
    );

    profileData.append(
      "phone",
      formData.phone.trim()
    );

    profileData.append(
      "dateOfBirth",
      dateOfBirth
    );

    profileData.append(
      "location",
      formData.location
    );

    if (profileImage) {
      profileData.append(
        "profileImage",
        profileImage
      );
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

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

      const birthParts =
        getBirthDateParts(
          data.user.dateOfBirth
        );

      setPatient(data.user);
      setProfileImage(null);

      setImagePreview(
        getProfileImageUrl(
          data.user.profileImage
        )
      );

      setFormData({
        name: data.user.name || "",
        phone: data.user.phone || "",
        ...birthParts,
        location:
          data.user.location || "",
      });

      const storage =
        localStorage.getItem("user")
          ? localStorage
          : sessionStorage;

      const storedUser = JSON.parse(
        storage.getItem("user") || "{}"
      );

      storage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          name: data.user.name,
        })
      );

      setPhotoModalOpen(false);
      setTemporaryImage(null);
      setTemporaryPreview("");
      setEditing(false);

      setMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Update patient profile error:",
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
      <main className="patient-profile-page">
        <div className="patient-profile-state">
          Loading profile...
        </div>
      </main>
    );
  }

  if (!patient) {
    return (
      <main className="patient-profile-page">
        <div className="patient-profile-state">
          {message ||
            "Patient profile not found."}
        </div>
      </main>
    );
  }

  const patientName =
    patient.name || "Patient";

  // =========================
  // JSX
  // =========================

  return (
    <main className="patient-profile-page">
      <div className="patient-profile-container">

        {/* HEADER */}

        <div className="patient-profile-header">
          <div>
            <p>Patient Account</p>

            <h1>My Profile</h1>

            <span>
              View and manage your personal
              information.
            </span>
          </div>

          <button
            type="button"
            className="patient-profile-home"
            onClick={() => {
              window.location.href =
                "/patient-dashboard";
            }}
          >
            ← Dashboard
          </button>
        </div>

        {/* PROFILE HERO */}

        <section className="patient-profile-hero">
          <div className="patient-profile-photo-wrapper">
            <div className="patient-profile-avatar">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={`${patientName} profile`}
                />
              ) : (
                patientName
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            {editing && (
              <button
                type="button"
                className="patient-change-photo-btn"
                onClick={openPhotoModal}
              >
                Change photo
              </button>
            )}
          </div>

          <div className="patient-profile-identity">
            <h2>{patientName}</h2>

            <p>{patient.email}</p>

            <span>Patient</span>
          </div>

          {!editing && (
            <button
              type="button"
              className="patient-profile-edit"
              onClick={() => {
                setEditing(true);
                setMessage("");
              }}
            >
              Edit Profile
            </button>
          )}
        </section>

        {/* PHOTO MODAL */}

        {photoModalOpen && (
          <div className="patient-photo-modal-overlay">
            <div className="patient-photo-modal">
              <div className="patient-photo-modal-header">
                <h2>Upload profile photo</h2>

                <button
                  type="button"
                  className="patient-photo-modal-close"
                  onClick={closePhotoModal}
                >
                  ×
                </button>
              </div>

              <div className="patient-photo-preview">
                {temporaryPreview ? (
                  <img
                    src={temporaryPreview}
                    alt="Profile preview"
                  />
                ) : (
                  <span>
                    {patientName
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <label
                htmlFor="patient-photo-upload"
                className="patient-photo-upload-box"
              >
                <strong>
                  📷 Upload image
                </strong>

                <span>
                  JPG or PNG, maximum 5 MB
                </span>
              </label>

              <input
                id="patient-photo-upload"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={
                  handleProfileImageChange
                }
                hidden
              />

              <div className="patient-photo-modal-actions">
                <button
                  type="button"
                  className="patient-photo-cancel-btn"
                  onClick={closePhotoModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="patient-photo-save-btn"
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
          <div className="patient-profile-message">
            {message}
          </div>
        )}

        {/* PERSONAL INFORMATION */}

        <section className="patient-profile-card">
          <div className="patient-profile-card-header">
            <h2>Personal Information</h2>

            <p>
              Information associated with your
              patient account.
            </p>
          </div>

          <div className="patient-profile-form">

            {/* NAME */}

            <div className="patient-profile-field">
              <label>Full name</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            {/* EMAIL */}

            <div className="patient-profile-field">
              <label>Email</label>

              <input
                type="email"
                value={patient.email || ""}
                disabled
              />

              <small>
                Email cannot be changed here.
              </small>
            </div>

            {/* PHONE */}

            <div className="patient-profile-field">
              <label>Phone</label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder={
                  editing
                    ? "Enter phone number"
                    : "Not provided"
                }
              />
            </div>

            {/* DATE OF BIRTH */}

            <div className="patient-profile-field">
              <label>Date of birth</label>

              {editing ? (
                <div className="patient-birth-date-selects">
                  <select
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleChange}
                  >
                    <option value="">
                      Day
                    </option>

                    {days.map((day) => (
                      <option
                        key={day}
                        value={day}
                      >
                        {day}
                      </option>
                    ))}
                  </select>

                  <select
                    name="birthMonth"
                    value={formData.birthMonth}
                    onChange={handleChange}
                  >
                    <option value="">
                      Month
                    </option>

                    {months.map((month) => (
                      <option
                        key={month.value}
                        value={month.value}
                      >
                        {month.label}
                      </option>
                    ))}
                  </select>

                  <select
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                  >
                    <option value="">
                      Year
                    </option>

                    {years.map((year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="text"
                  value={
                    patient.dateOfBirth
                      ? new Date(
                          patient.dateOfBirth
                        ).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            timeZone: "UTC",
                          }
                        )
                      : "Not provided"
                  }
                  disabled
                />
              )}
            </div>

            {/* CITY */}

            <div className="patient-profile-field patient-profile-field-full">
              <label>City</label>

              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={!editing}
              >
                <option value="">
                  Select city
                </option>

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
          </div>

          {/* ACTIONS */}

          {editing && (
            <div className="patient-profile-actions">
              <button
                type="button"
                className="patient-profile-cancel"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              {hasChanges && (
                <button
                  type="button"
                  className="patient-profile-save"
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
      </div>
    </main>
  );
}

export default PatientProfile;