import {
  useEffect,
  useState,
} from "react";

import "./PatientSettings.css";

function PatientSettings() {
  const user = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "null"
  );

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // =========================
  // SETTINGS STATE
  // =========================

  const [darkMode, setDarkMode] =
    useState(
      localStorage.getItem("theme") ===
        "dark"
    );

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(true);

  // =========================
  // CHANGE PASSWORD STATE
  // =========================

  const [
    changePasswordOpen,
    setChangePasswordOpen,
  ] = useState(false);

  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState("");

  const [
    passwordMessageType,
    setPasswordMessageType,
  ] = useState("");

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  // =========================
  // THEME
  // =========================

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute(
        "data-theme",
        "dark"
      );

      localStorage.setItem(
        "theme",
        "dark"
      );
    } else {
      document.documentElement.setAttribute(
        "data-theme",
        "light"
      );

      localStorage.setItem(
        "theme",
        "light"
      );
    }
  }, [darkMode]);

  // =========================
  // PASSWORD INPUT
  // =========================

  const handlePasswordChange = (
    event
  ) => {
    const { name, value } =
      event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordMessageType("");
  };

  // =========================
  // CLOSE PASSWORD FORM
  // =========================

  const closePasswordForm = () => {
    setChangePasswordOpen(false);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordMessage("");
    setPasswordMessageType("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // =========================
  // SUBMIT CHANGE PASSWORD
  // =========================

  const handleChangePassword = async (
    event
  ) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordMessageType("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordMessage(
        "Please complete all password fields."
      );

      setPasswordMessageType("error");
      return;
    }

    if (
      passwordForm.newPassword.length < 6
    ) {
      setPasswordMessage(
        "New password must be at least 6 characters."
      );

      setPasswordMessageType("error");
turn;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordMessage(
        "New passwords do not match."
      );

      setPasswordMessageType("error");
      return;
    }

    if (
      passwordForm.currentPassword ===
      passwordForm.newPassword
    ) {
      setPasswordMessage(
        "New password must be different from your current password."
      );

      setPasswordMessageType("error");
      return;
    }

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            currentPassword:
              passwordForm.currentPassword,

            newPassword:
              passwordForm.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setPasswordMessage(
          data.message ||
            "Could not change password."
        );

        setPasswordMessageType("error");
        return;
      }

      setPasswordMessage(
        data.message ||
          "Password changed successfully."
      );

      setPasswordMessageType("success");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setPasswordMessage(
        "Cannot connect to the server."
      );

      setPasswordMessageType("error");
    } finally {
      setChangingPassword(false);
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

  return (
    <main className="patient-settings-page">
      <div className="patient-settings-container">

        {/* HEADER */}

        <div className="patient-settings-header">
          <div>
            <p>Patient Account</p>

            <h1>Settings</h1>

            <span>
              Manage your account,
              security and preferences.
            </span>
          </div>

          <button
            type="button"
            className="settings-dashboard-btn"
            onClick={() => {
              window.location.href =
                "/patient-dashboard";
            }}
          >
            ← Dashboard
          </button>
        </div>

        {/* ACCOUNT */}

        <section className="patient-settings-section">
          <div className="settings-section-heading">
            <h2>Account</h2>

            <p>
              Manage your personal account
              information.
            </p>
          </div>

          <div className="settings-option">
            <div className="settings-option-icon">
              👤
            </div>

            <div className="settings-option-content">
              <strong>
                Account Details
              </strong>

              <p>
                View and update your
                personal information.
              </p>
            </div>

            <button
              type="button"
              className="settings-action-btn"
              onClick={() => {
                window.location.href =
                  "/patient-profile";
              }}
            >
              Go to Profile
            </button>
          </div>
        </section>

        {/* SECURITY */}

        <section className="patient-settings-section">
          <div className="settings-section-heading">
            <h2>Security</h2>

            <p>
              Manage the security of your
              MyAppointment account.
            </p>
          </div>

          <div className="settings-option">
            <div className="settings-option-icon">
              🔐
            </div>

            <div className="settings-option-content">
              <strong>
                Change Password
              </strong>

              <p>
                Choose a new password for
                your account.
              </p>
            </div>

            <button
              type="button"
              className="settings-action-btn"
              onClick={() => {
                if (changePasswordOpen) {
                  closePasswordForm();
                } else {
                  setChangePasswordOpen(true);
                }
              }}
            >
              {changePasswordOpen
                ? "Close"
                : "Change Password"}
            </button>
          </div>

          {/* CHANGE PASSWORD FORM */}

          {changePasswordOpen && (
            <form
              className="change-password-form"
              onSubmit={
                handleChangePassword
              }
            >
              <div className="change-password-heading">
                <h3>
                  Update your password
                </h3>

                <p>
                  Enter your current
                  password and choose a new
                  secure password.
                </p>
              </div>

              <div className="change-password-fields">

                {/* CURRENT PASSWORD */}

                <div className="change-password-group">
                  <label htmlFor="currentPassword">
                    Current Password
                  </label>

                  <div className="settings-password-wrapper">
                    <input
                      id="currentPassword"
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      name="currentPassword"
                      value={
                        passwordForm.currentPassword
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Enter current password"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (current) =>
                            !current
                        )
                      }
                      aria-label={
                        showCurrentPassword
                          ? "Hide current password"
                          : "Show current password"
                      }
                    >
                      {showCurrentPassword
                        ? "🙈"
                        : "👁"}
                    </button>
                  </div>
                </div>

                {/* NEW PASSWORD */}

                <div className="change-password-group">
                  <label htmlFor="newPassword">
                    New Password
                  </label>

                  <div className="settings-password-wrapper">
                    <input
                      id="newPassword"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      name="newPassword"
                      value={
                        passwordForm.newPassword
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      minLength="6"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (current) =>
                            !current
                        )
                      }
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                    >
                      {showNewPassword
                        ? "🙈"
                        : "👁"}
                    </button>
                  </div>

                  <small>
                    Minimum 6 characters.
                  </small>
                </div>

                {/* CONFIRM PASSWORD */}

                <div className="change-password-group">
                  <label htmlFor="confirmPassword">
                    Confirm New Password
                  </label>

                  <div className="settings-password-wrapper">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={
                        passwordForm.confirmPassword
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      minLength="6"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) =>
                            !current
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmed password"
                          : "Show confirmed password"
                      }
                    >
                      {showConfirmPassword
                        ? "🙈"
                        : "👁"}
                    </button>
                  </div>
                </div>
              </div>

              {passwordMessage && (
                <div
                  className={`change-password-message ${passwordMessageType}`}
                >
                  {passwordMessage}
                </div>
              )}

              <div className="change-password-actions">
                <button
                  type="button"
                  className="change-password-cancel"
                  onClick={
                    closePasswordForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="change-password-submit"
                  disabled={
                    changingPassword
                  }
                >
                  {changingPassword
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* PREFERENCES */}

        <section className="patient-settings-section">
          <div className="settings-section-heading">
            <h2>Preferences</h2>

            <p>
              Personalise your application
              experience.
            </p>
          </div>

          {/* DARK MODE */}

          <div className="settings-option">
            <div className="settings-option-icon">
              🌙
            </div>

            <div className="settings-option-content">
              <strong>
                Dark Mode
              </strong>

              <p>
                Switch between light and
                dark appearance.
              </p>
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

          {/* NOTIFICATIONS */}

          <div className="settings-option">
            <div className="settings-option-icon">
              🔔
            </div>

            <div className="settings-option-content">
              <strong>
                Notifications
              </strong>

              <p>
                Show appointment updates and
                notifications.
              </p>
            </div>

            <button
              type="button"
              className={
                notificationsEnabled
                  ? "settings-toggle active"
                  : "settings-toggle"
              }
              onClick={() =>
                setNotificationsEnabled(
                  (current) => !current
                )
              }
              aria-label="Toggle notifications"
            >
              <span />
            </button>
          </div>
        </section>

        {/* LOGOUT */}

        <section className="patient-settings-section danger-section">
          <div className="settings-section-heading">
            <h2>Session</h2>

            <p>
              Manage your current login
              session.
            </p>
          </div>

          <div className="settings-option">
            <div className="settings-option-icon danger">
              ↪
            </div>

            <div className="settings-option-content">
              <strong>
                Log Out
              </strong>

              <p>
                Sign out of{" "}
                {user?.name
                  ? `${user.name}'s account`
                  : "your account"}
                .
              </p>
            </div>

            <button
              type="button"
              className="settings-logout-btn"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default PatientSettings;