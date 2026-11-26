import { useEffect, useState } from "react";
import "./PatientSettings.css";

function PatientSettings() {
  const user = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "null"
  );

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
              disabled
              title="Coming soon"
            >
              Coming Soon
            </button>
          </div>
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