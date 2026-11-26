import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./Navbar.css";

function Navbar() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const profileRef = useRef(null);

  const user = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "null"
  );

  // =========================
  // BOOK APPOINTMENT
  // =========================

  const handleAppointmentsClick = (e) => {
    e.preventDefault();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    window.location.href =
      "/book-appointment";
  };

  // =========================
  // CLOSE DROPDOWN OUTSIDE
  // =========================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

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
  // JSX
  // =========================

  return (
    <nav className="navbar">

      {/* LOGO */}

      <div className="navbar-logo">
        <img
          src="/Designer.png"
          alt="MyAppointment logo"
        />

        <span>MyAppointment</span>
      </div>

      {/* LINKS */}

      <div className="navbar-links">
        <a href="/">
          Home
        </a>

        <a href="#services">
          Services
        </a>

        <a
          href="/appointments"
          onClick={
            handleAppointmentsClick
          }
        >
          Appointments
        </a>

        <a href="#about">
          About Us
        </a>

        <a href="#contact">
          Contact
        </a>
      </div>

      {/* ACTIONS */}

      <div className="navbar-actions">

        {/* FOR DOCTORS */}

        {!user && (
          <a
            href="/for-doctors"
            className="doctor-nav-btn"
          >
            🩺 For Doctors
          </a>
        )}

        {/* USER */}

        {user ? (
          <div
            className="profile-menu"
            ref={profileRef}
          >
            <button
              type="button"
              className="profile-button"
              onClick={() =>
                setProfileOpen(
                  (current) => !current
                )
              }
            >
              <span className="profile-avatar">
                {user.name
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </span>

              <span className="profile-name">
                {user.name}
              </span>

              <span className="profile-arrow">
                {profileOpen
                  ? "▲"
                  : "▼"}
              </span>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">

                {/* USER INFO */}

                <div className="profile-info">
                  <strong>
                    {user.name}
                  </strong>

                  <span>
                    {user.email}
                  </span>

                  <small>
                    {user.role === "doctor"
                      ? "Doctor Account"
                      : user.role === "admin"
                      ? "Admin Account"
                      : "Patient Account"}
                  </small>
                </div>

                {/* PATIENT MENU */}

                {user.role !== "doctor" &&
                  user.role !== "admin" && (
                    <>
                      <a href="/patient-dashboard">
                        🏠 Dashboard
                      </a>

                      <a href="/my-appointments">
                        📅 My Appointments
                      </a>

                      <a href="/patient-profile">
                        👤 My Profile
                      </a>

                      <a href="/patient-settings">
                        ⚙ Settings
                      </a>
                    </>
                  )}

                {/* DOCTOR MENU */}

                {user.role === "doctor" && (
                  <>
                    <a href="/doctor-dashboard">
                      🏠 Doctor Dashboard
                    </a>

                    <a href="/doctor-appointments">
                      📅 Appointments
                    </a>

                    <a href="/doctor-profile">
                      👤 My Profile
                    </a>

                    <a href="/doctor-settings">
                      ⚙ Settings
                    </a>
                  </>
                )}

                {/* ADMIN MENU */}

                {user.role === "admin" && (
                  <a href="/admin-dashboard">
                    🛡 Admin Dashboard
                  </a>
                )}

                {/* LOGOUT */}

                <div className="profile-dropdown-divider" />

                <button
                  type="button"
                  className="dropdown-logout"
                  onClick={
                    handleLogout
                  }
                >
                  🚪 Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/login"
            className="login-btn"
          >
            Log in
          </a>
        )}

        {/* BOOK */}

        <a
          href="/book-appointment"
          className="book-btn"
          onClick={
            handleAppointmentsClick
          }
        >
          Book Appointment
        </a>
      </div>
    </nav>
  );
}

export default Navbar;