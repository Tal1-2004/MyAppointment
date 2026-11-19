import { Link } from "react-router";
import "./ForDoctors.css";

function ForDoctors() {
  return (
    <main className="for-doctors-page">
      <div className="for-doctors-container">

        <div className="for-doctors-content">
          <span className="for-doctors-badge">
            For Healthcare Professionals
          </span>

          <h1>
            Join MyAppointment as a Doctor
          </h1>

          <p>
            Create your professional profile, submit your credentials
            for verification, and connect with patients looking for
            trusted healthcare professionals.
          </p>

          <div className="for-doctors-actions">
            <Link
              to="/doctor-register"
              className="apply-doctor-btn"
            >
              Apply as a Doctor
            </Link>

            <Link
              to="/login"
              className="doctor-login-btn"
            >
              Doctor Login
            </Link>
          </div>

          <Link to="/" className="for-doctors-back">
            ← Back to Home
          </Link>
        </div>

      </div>
    </main>
  );
}

export default ForDoctors;