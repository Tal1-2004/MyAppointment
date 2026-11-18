import { useState } from "react";
import "./DoctorRegister.css";

function DoctorRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
    experience: "",
    location: "",
    bio: "",
  });
  const [files, setFiles] = useState({
    cv: null,
    diploma: null,
    licence: null,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleFileChange = (e) => {
  setFiles({
    ...files,
    [e.target.name]: e.target.files[0],
  });
  };
    const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("");
  setLoading(true);

  const doctorData = new FormData();

  doctorData.append("name", formData.name);
  doctorData.append("email", formData.email);
  doctorData.append("password", formData.password);
  doctorData.append("specialty", formData.specialty);
  doctorData.append("experience", formData.experience);
  doctorData.append("location", formData.location);
  doctorData.append("bio", formData.bio);

  doctorData.append("cv", files.cv);
  doctorData.append("diploma", files.diploma);
  doctorData.append("licence", files.licence);

  try {
      const response = await fetch(
        "http://localhost:5000/api/doctors/register",
        {
          method: "POST",
          body: doctorData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Doctor registration failed.");
        return;
      }

      setMessage(
        "Your doctor application was submitted successfully and is waiting for verification."
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);

    } catch (error) {
      console.error(error);

      setMessage(
        "Cannot connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
};
  

  return (
    <main className="doctor-register-page">
      <div className="doctor-register-card">

        <div className="doctor-register-header">
          <img src="/Designer.png" alt="MyAppointment logo" />

          <h1>Create Doctor Account</h1>

          <p>
            Join MyAppointment and create your professional doctor profile.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="doctor-form-row">
            <div className="doctor-form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="name"
                placeholder="Dr. John Smith"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="doctor-form-group">
              <label>Specialty</label>

              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
              >
                <option value="">Select specialty</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Dentist">Dentist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Ophthalmologist">Ophthalmologist</option>
              </select>
            </div>
          </div>

          <div className="doctor-form-row">
            <div className="doctor-form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="doctor@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="doctor-form-group">
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
          </div>

          <div className="doctor-form-row">
            <div className="doctor-form-group">
              <label>Experience</label>

              <input
                type="number"
                name="experience"
                placeholder="Years of experience"
                min="0"
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </div>

            <div className="doctor-form-group">
            <label>City</label>

            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            >
              <option value="">Select your city</option>
              <option value="Prishtina">Prishtina</option>
              <option value="Prizren">Prizren</option>
              <option value="Peja">Peja</option>
              <option value="Gjakova">Gjakova</option>
              <option value="Ferizaj">Ferizaj</option>
              <option value="Gjilan">Gjilan</option>
              <option value="Mitrovica">Mitrovica</option>
            </select>
          </div>
          </div>

          <div className="doctor-form-group">
            <label>About You</label>

            <textarea
              name="bio"
              placeholder="Write a short professional biography..."
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          {message && (
            <p className="doctor-register-message">
              {message}
            </p>
          )}
          <div className="doctor-documents">
            <h3>Professional Documents</h3>

            <p className="documents-info">
              Upload your professional documents for verification.
            </p>

            <div className="doctor-form-row">
              <div className="doctor-form-group">
                <label>CV</label>

                <input
                  type="file"
                  name="cv"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <div className="doctor-form-group">
                <label>Diploma / Medical Degree</label>

                <input
                  type="file"
                  name="diploma"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>

            <div className="doctor-form-group">
              <label>Medical Licence / Certificate</label>

              <input
                type="file"
                name="licence"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="doctor-register-btn"
            disabled={loading}
          >
            {loading ? "Submitting application..." : "Create Doctor Account"}
          </button>

        </form>

        <div className="doctor-register-footer">
          <p>
            Already have a doctor account?{" "}
            <a href="/login">Log in</a>
          </p>

          <a href="/">← Back to Home</a>
        </div>

      </div>
    </main>
  );
}

export default DoctorRegister;