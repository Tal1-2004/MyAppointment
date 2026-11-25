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
    dateOfBirth: "",
    location: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const locations = [
    "Prishtina",
    "Prizren",
    "Peja",
    "Gjakova",
    "Ferizaj",
    "Gjilan",
    "Mitrovica",
  ];

  // =========================
  // FORMAT DATE FOR INPUT
  // =========================

  const formatDateForInput = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().split("T")[0];
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

        setPatient(data.user);

        setFormData({
          name: data.user.name || "",
          phone: data.user.phone || "",
          dateOfBirth:
            formatDateForInput(
              data.user.dateOfBirth
            ),
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
  // CANCEL
  // =========================

  const handleCancel = () => {
    if (!patient) {
      return;
    }

    setFormData({
      name: patient.name || "",
      phone: patient.phone || "",
      dateOfBirth:
        formatDateForInput(
          patient.dateOfBirth
        ),
      location:
        patient.location || "",
    });

    setEditing(false);
    setMessage("");
  };

  // =========================
  // CHECK CHANGES
  // =========================

  const hasChanges =
    patient &&
    (
      formData.name !==
        (patient.name || "") ||

      formData.phone !==
        (patient.phone || "") ||

      formData.dateOfBirth !==
        formatDateForInput(
          patient.dateOfBirth
        ) ||

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

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            dateOfBirth:
              formData.dateOfBirth,
            location:
              formData.location,
          }),
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

      setPatient(data.user);

      setFormData({
        name: data.user.name || "",
        phone: data.user.phone || "",
        dateOfBirth:
          formatDateForInput(
            data.user.dateOfBirth
          ),
        location:
          data.user.location || "",
      });

      // Update user stored in browser too
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
             your personal information.
            </span>
          </div>

          <button
            type="button"
            className="patient-profile-home"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            ← Home
          </button>
        </div>

        {/* PROFILE HERO */}

        <section className="patient-profile-hero">
          <div className="patient-profile-avatar">
            {patientName
              .charAt(0)
              .toUpperCase()}
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

        {/* MESSAGE */}

        {message && (
          <div className="patient-profile-message">
            {message}
          </div>
        )}

        {/* PERSONAL INFORMATION */}

        <section className="patient-profile-card">
          <div className="patient-profile-card-header">
            <h2>
              Personal Information
            </h2>

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

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!editing}
              />
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