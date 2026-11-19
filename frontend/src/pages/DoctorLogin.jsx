import { useState } from "react";
import "./DoctorLogin.css";

function DoctorLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Invalid email or password."
        );
        return;
      }

      // Ky login lejon VETËM doktorët
      if (data.user?.role !== "doctor") {
        setMessage(
          "This login is for doctors only."
        );
        return;
      }

      // Ruaj login vetëm pasi e kemi konfirmuar
      // që account-i është doctor
      if (rememberMe) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } else {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      window.location.href = "/doctor-dashboard";
    } catch (error) {
      console.error("Doctor login error:", error);

      setMessage(
        "Cannot connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="doctor-login-page">
      <div className="doctor-login-card">

        <div className="doctor-login-logo">
          <img
            src="/Designer.png"
            alt="MyAppointment logo"
          />

          <h2>MyAppointment</h2>
        </div>

        <div className="doctor-login-heading">
          <span>Healthcare Professionals</span>

          <h1>Doctor Login</h1>

          <p>
            Sign in to access your doctor dashboard
            and manage your appointments.
          </p>
        </div>

        <form
          className="doctor-login-form"
          onSubmit={handleSubmit}
        >
          <div className="doctor-login-group">
            <label>Email address</label>

            <input
              type="email"
              name="email"
              placeholder="doctor@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="doctor-login-group">
            <label>Password</label>

            <div className="doctor-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="doctor-password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <label className="doctor-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(e.target.checked)
              }
            />

            Remember me
          </label>

          {message && (
            <div className="doctor-login-message">
              ⚠ {message}
            </div>
          )}

          <button
            type="submit"
            className="doctor-login-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Doctor Login"}
          </button>
        </form>

        <div className="doctor-login-footer">
          <p>
            Don't have a doctor account?
            <a href="/doctor-register">
              {" "}Apply as a Doctor
            </a>
          </p>

          <a href="/for-doctors">
            ← Back to For Doctors
          </a>
        </div>

      </div>
    </main>
  );
}

export default DoctorLogin;