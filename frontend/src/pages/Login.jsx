import { useState } from "react";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

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
        setMessage(data.message || "Invalid email or password");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } else {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));

        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

     if (data.user.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else if (data.user.role === "doctor") {
          window.location.href = "/doctor-dashboard";
        } else {
          window.location.href = "/";
        }
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the server.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <img src="/Designer.png" alt="MyAppointment logo" />
          <h2>MyAppointment</h2>
        </div>

        <div className="auth-heading">
          <h1>Welcome back</h1>
          <p>Log in to manage your appointments.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email address</label>

            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
              />

              Remember me
            </label>

            <a href="#">Forgot password?</a>
          </div>

          {message && (
            <div className="login-error">
              <span>⚠</span>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
          >
            Log in
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?
          <a href="/register"> Create account</a>
        </p>

        <a href="/" className="back-home">
          ← Back to Home
        </a>

      </div>
    </div>
  );
}

export default Login;