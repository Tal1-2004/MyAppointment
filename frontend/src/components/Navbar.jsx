import { useState } from "react";
import "./Navbar.css";

function Navbar() {

  const handleAppointmentsClick = (e) => {
  e.preventDefault();

  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user")
  );

  if (!user) {
    window.location.href = "/login";
    return;
    }

    window.location.href = "/book-appointment";
  };


  const [profileOpen, setProfileOpen] = useState(false);

  const user = JSON.parse(
  localStorage.getItem("user") ||
  sessionStorage.getItem("user")
  );

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/Designer.png" alt="MyAppointment logo" />
        <span>MyAppointment</span>
      </div>

      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="#services">Services</a>

        <a
          href="/appointments"
          onClick={handleAppointmentsClick}
        >
          Appointments
        </a>

        <a href="#about">About Us</a>
        <a href="#contact">Contact</a>
      </div>

      <div className="navbar-actions">

        <a href="/for-doctors" className="doctor-nav-btn">
          🩺 For Doctors
        </a>

        {user ? (
          <div className="profile-menu">
            <button
              type="button"
              className="profile-button"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <span className="profile-avatar">
                {user.name.charAt(0).toUpperCase()}
              </span>

              <span className="profile-name">
                {user.name}
              </span>

              <span className="profile-arrow">
                {profileOpen ? "▲" : "▼"}
              </span>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>

                <a href="/profile">
                  👤 My Profile
                </a>

                <a href="/appointments">
                  📅 My Appointments
                </a>

                <a href="/appointment-history">
                  🕘 Appointment History
                </a>

                <button
                  type="button"
                  className="dropdown-logout"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <a href="/login" className="login-btn">
            Log in
          </a>
        )}

        <a
          href="/book-appointment"
          className="book-btn"
          onClick={handleAppointmentsClick}
        >
          Book Appointment
        </a>
      </div>
    </nav>
  );
}

export default Navbar;