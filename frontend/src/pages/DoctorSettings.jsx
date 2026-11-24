import { useEffect, useState } from "react";
import "./DoctorSettings.css";

function DoctorSettings() {
  const user = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user")
  );

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const [activeSection, setActiveSection] =
    useState(null);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("doctorDarkMode") === "true"
  );

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("");

  // =========================
  // DARK MODE
  // =========================

  useEffect(() => {
    document.body.classList.toggle(
      "doctor-dark-mode",
      darkMode
    );

    localStorage.setItem(
      "doctorDarkMode",
      darkMode
    );

    return () => {
      document.body.classList.remove(
        "doctor-dark-mode"
      );
    };
  }, [darkMode]);

  // =========================
  // OPEN SECTION
  // =========================

  const openSection = (section) => {
    setActiveSection(section);
    setMessage("");
    setMessageType("");
  };

  const backToSettings = () => {
    setActiveSection(null);
    setMessage("");
    setMessageType("");

    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // =========================
  // PASSWORD FORM
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  };

  // =========================
  // CHANGE PASSWORD
  // =========================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setMessage(
        "Please complete all password fields."
      );

      setMessageType("error");
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage(
        "New password must be at least 6 characters."
      );

      setMessageType("error");
      return;
    }

    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {
      setMessage(
        "New passwords do not match."
      );

      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            currentPassword:
              formData.currentPassword,

            newPassword:
              formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not change password."
        );

        setMessageType("error");
        return;
      }

      setMessage(
        "Password changed successfully."
      );

      setMessageType("success");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setMessage(
        "Cannot connect to the server."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
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
  // SETTINGS MENU
  // =========================

  const renderSettingsMenu = () => {
    return (
      <>
        <div className="doctor-settings-header">
          <div>
            <p>Doctor Account</p>

            <h1>Settings</h1>

            <span>
              Manage your account, security and
              appearance.
            </span>
          </div>

          <button
            type="button"
            className="settings-dashboard-btn"
            onClick={() => {
              window.location.href =
                "/doctor-dashboard";
            }}
          >
            ← Dashboard
          </button>
        </div>

        <div className="settings-menu">

          {/* ACCOUNT DETAILS */}

          <button
            type="button"
            className="settings-menu-item"
            onClick={() =>
              openSection("account")
            }
          >
            <div className="settings-menu-icon">
              👤
            </div>

            <div className="settings-menu-text">
              <strong>Account Details</strong>

              <span>
                View your account information
              </span>
            </div>

            <span className="settings-arrow">
              ›
            </span>
          </button>

          {/* PASSWORD */}

          <button
            type="button"
            className="settings-menu-item"
            onClick={() =>
              openSection("password")
            }
          >
            <div className="settings-menu-icon">
              🔐
            </div>

            <div className="settings-menu-text">
              <strong>
                Password & Security
              </strong>

              <span>
                Change your account password
              </span>
            </div>

            <span className="settings-arrow">
              ›
            </span>
          </button>

          {/* DARK MODE */}

          <div className="settings-menu-item settings-toggle-item">
            <div className="settings-menu-icon">
              {darkMode ? "☀️" : "🌙"}
            </div>

            <div className="settings-menu-text">
              <strong>Appearance</strong>

              <span>
                {darkMode
                  ? "Dark mode is on"
                  : "Dark mode is off"}
              </span>
            </div>

            <button
              type="button"
              className={
                darkMode
                  ? "settings-toggle active"
                  : "settings-toggle"
              }
              onClick={() =>
                setDarkMode(
                  (current) => !current
                )
              }
              aria-label="Toggle dark mode"
            >
              <span />
            </button>
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            className="settings-menu-item settings-logout-item"
            onClick={handleLogout}
          >
            <div className="settings-menu-icon">
              🚪
            </div>

            <div className="settings-menu-text">
              <strong>Log out</strong>

              <span>
                Sign out of MyAppointment
              </span>
            </div>

            <span className="settings-arrow">
              ›
            </span>
          </button>
        </div>
      </>
    );
  };

  // =========================
  // ACCOUNT DETAILS
  // =========================

  const renderAccountDetails = () => {
    return (
      <>
        <button
          type="button"
          className="settings-section-back"
          onClick={backToSettings}
        >
          ← Settings
        </button>

        <div className="settings-section-heading">
          <div className="settings-section-icon">
            👤
          </div>

          <div>
            <h1>Account Details</h1>

            <p>
              Information associated with your
              account.
            </p>
          </div>
        </div>

        <section className="doctor-settings-card">
          <div className="settings-account-grid">
            <div className="settings-field">
              <label>Full name</label>

              <input
                type="text"
                value={
                  user?.name || "Doctor"
                }
                disabled
              />
            </div>

            <div className="settings-field">
              <label>Email address</label>

              <input
                type="email"
                value={user?.email || ""}
                disabled
              />
            </div>

            <div className="settings-field">
              <label>Account type</label>

              <input
                type="text"
                value="Doctor"
                disabled
              />
            </div>
          </div>

          <div className="settings-info-note">
            Professional details such as
            specialties, experience, location
            and bio can be changed from My
            Profile.
          </div>

          <button
            type="button"
            className="settings-profile-btn"
            onClick={() => {
              window.location.href =
                "/doctor-profile";
            }}
          >
            Go to My Profile
          </button>
        </section>
      </>
    );
  };

  // =========================
  // PASSWORD & SECURITY
  // =========================

  const renderPasswordSecurity = () => {
    return (
      <>
        <button
          type="button"
          className="settings-section-back"
          onClick={backToSettings}
        >
          ← Settings
        </button>

        <div className="settings-section-heading">
          <div className="settings-section-icon">
            🔐
          </div>

          <div>
            <h1>Password & Security</h1>

            <p>
              Change the password you use to
              access your doctor account.
            </p>
          </div>
        </div>

        <section className="doctor-settings-card">
          {message && (
            <div
              className={`settings-message settings-message-${messageType}`}
            >
              {message}
            </div>
          )}

          <form
            className="settings-password-form"
            onSubmit={
              handleChangePassword
            }
          >
            <div className="settings-field settings-field-full">
              <label>
                Current password
              </label>

              <input
                type="password"
                name="currentPassword"
                value={
                  formData.currentPassword
                }
                onChange={handleChange}
                der="Enter your current password"
                autoComplete="current-password"
              />
            </div>

            <div className="settings-password-row">
              <div className="settings-field">
                <label>
                  New password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={
                    formData.newPassword
                  }
                  onChange={handleChange}
                  placeholder="Enter a new password"
                  autoComplete="new-password"
                />
              </div>

              <div className="settings-field">
                <label>
                  Confirm new password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <small className="settings-password-help">
              Use at least 6 characters for
              your new password.
            </small>

            <div className="settings-password-actions">
              <button
                type="submit"
                className="settings-save-btn"
                disabled={loading}
              >
                {loading
                  ? "Changing..."
                  : "Change Password"}
              </button>
            </div>
          </form>
        </section>
      </>
    );
  };

  // =========================
  // JSX
  // =========================

  return (
    <main
      className={
        darkMode
          ? "doctor-settings-page dark"
          : "doctor-settings-page"
      }
    >
      <div className="doctor-settings-container">
        {activeSection === null &&
          renderSettingsMenu()}

        {activeSection === "account" &&
          renderAccountDetails()}

        {activeSection === "password" &&
          renderPasswordSecurity()}
      </div>
    </main>
  );
}

export default DoctorSettings;