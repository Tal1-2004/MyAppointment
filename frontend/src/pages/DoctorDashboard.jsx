import "./DoctorDashboard.css";

function DoctorDashboard() {
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
    <div className="doctor-dashboard">

      {/* SIDEBAR */}
      <aside className="doctor-sidebar">

        <div className="doctor-sidebar-logo">
          <img src="/Designer.png" alt="MyAppointment logo" />
          <span>MyAppointment</span>
        </div>

        <nav className="doctor-dashboard-nav">
          <button className="active">
            🏠 Dashboard
          </button>

          <button>
            📅 Appointments
          </button>

          <button>
            🕒 Availability
          </button>

          <button>
            👤 My Profile
          </button>

          <button>
            ⚙ Settings
          </button>
        </nav>

        <button
          className="doctor-logout"
          onClick={handleLogout}
        >
          Log out
        </button>

      </aside>


      {/* MAIN CONTENT */}
      <main className="doctor-dashboard-content">

        <header className="doctor-dashboard-header">
          <div>
            <p>Doctor Dashboard</p>

            <h1>
              Welcome back, {user?.name || "Doctor"}
            </h1>

            <span>
              Here's an overview of your practice.
            </span>
          </div>

          <div className="doctor-dashboard-user">
            <div className="dashboard-avatar">
              {user?.name?.charAt(0).toUpperCase() || "D"}
            </div>

            <div>
              <strong>{user?.name || "Doctor"}</strong>
              <span>Doctor</span>
            </div>
          </div>
        </header>


        {/* VERIFICATION */}

        <section className="verification-card">
          <div>
            <span className="verification-icon">✓</span>
          </div>

          <div>
            <h3>Profile verification</h3>

            <p>
              Your professional documents have been submitted
              and are waiting for verification.
            </p>
          </div>

          <span className="verification-status">
            Pending
          </span>
        </section>


        {/* STATISTICS */}

        <section className="doctor-stats">

          <div className="doctor-stat-card">
            <span>📅</span>

            <div>
              <p>Today's Appointments</p>
              <h2>0</h2>
            </div>
          </div>

          <div className="doctor-stat-card">
            <span>🕒</span>

            <div>
              <p>Upcoming</p>
              <h2>0</h2>
            </div>
          </div>

          <div className="doctor-stat-card">
            <span>👥</span>

            <div>
              <p>Total Patients</p>
              <h2>0</h2>
            </div>
          </div>

        </section>


        {/* APPOINTMENTS */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">
            <div>
              <h2>Upcoming Appointments</h2>
              <p>Your next scheduled patient visits.</p>
            </div>

            <button>
              View All
            </button>
          </div>

          <div className="empty-appointments">
            <div>📅</div>

            <h3>No upcoming appointments</h3>

            <p>
              New appointments from patients will appear here.
            </p>
          </div>

        </section>


        {/* QUICK ACTIONS */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your doctor profile and schedule.</p>
            </div>
          </div>

          <div className="doctor-quick-actions">

            <button>
              <span>🕒</span>

              <div>
                <strong>Manage Availability</strong>
                <p>Set your available days and hours.</p>
              </div>
            </button>

            <button>
              <span>👤</span>

              <div>
                <strong>Edit Profile</strong>
                <p>Update your professional information.</p>
              </div>
            </button>

          </div>

        </section>

      </main>
    </div>
  );
}

export default DoctorDashboard;