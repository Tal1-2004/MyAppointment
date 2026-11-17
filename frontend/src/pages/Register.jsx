import { useState } from "react";
import "./Register.css";

function Register() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: "patient",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created successfully!");

        setTimeout(() => {
        window.location.href = "/login";
        }, 1500);
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the server.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-logo">
          <img src="/Designer.png" alt="MyAppointment logo" />
          <h2>MyAppointment</h2>
        </div>

        <div className="register-heading">
          <h1>Create your account</h1>
          <p>Join MyAppointment and manage your healthcare easily.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>

          <div className="register-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-group">
            <label>Email address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <label className="terms">
            <input type="checkbox" required />
            <span>
              I agree to the Terms & Conditions and Privacy Policy
            </span>
          </label>

          {message && <p>{message}</p>}

          <button type="submit" className="register-submit">
            Create Account
          </button>

        </form>

        <p className="register-switch">
          Already have an account?
          <a href="/login"> Log in</a>
        </p>

        <a href="/" className="register-back-home">
          ← Back to Home
        </a>

      </div>
    </div>
  );
}

export default Register;
