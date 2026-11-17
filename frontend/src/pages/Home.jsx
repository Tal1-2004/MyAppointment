import { useEffect, useRef, useState } from "react";
import "./Home.css";


function Home() {
  const sliderRef = useRef(null);
  const [appointmentSuccess, setAppointmentSuccess] = useState("");

  useEffect(() => {
    const successMessage = sessionStorage.getItem(
      "appointmentSuccess"
    );

    if (!successMessage) return;

    setAppointmentSuccess(successMessage);
    sessionStorage.removeItem("appointmentSuccess");

    const timer = setTimeout(() => {
      setAppointmentSuccess("");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const scrollServices = (direction) => {
  const slider = sliderRef.current;

      if (!slider) return;

      const scrollAmount = 350;
      const maxScroll = slider.scrollWidth - slider.clientWidth;

      if (direction === "right") {
        if (slider.scrollLeft >= maxScroll - 10) {
          slider.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        } else {
          slider.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
          });
        }
      }

      if (direction === "left") {
        if (slider.scrollLeft <= 10) {
          slider.scrollTo({
            left: maxScroll,
            behavior: "smooth",
          });
        } else {
          slider.scrollBy({
            left: -scrollAmount,
            behavior: "smooth",
          });
        }
      }
    };
  return (
    <main>
            {appointmentSuccess && (
        <div className="appointment-success-toast">
          <div className="success-toast-icon">✓</div>

          <div className="success-toast-content">
            <strong>Appointment confirmed</strong>
            <span>{appointmentSuccess}</span>
          </div>

          <button
            type="button"
            className="success-toast-close"
            onClick={() => setAppointmentSuccess("")}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-small">Your health, our priority</p>

          <h1>
            Healthcare made <span>simple.</span>
          </h1>

          <p className="hero-text">
            Book and manage your medical appointments easily.
            Find the right doctor and choose the time that works best for you.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              Book Appointment
            </button>

            <button className="secondary-btn">
              Our Services
            </button>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/Designer.png"
            alt="MyAppointment healthcare"
          />
        </div>
      </section>

      {/* SERVICES */}
        <section className="services" id="services">
          <div className="section-title">
            <p>Our Services</p>
            <h2>Healthcare for you and your family</h2>
          </div>

          <div className="services-slider-wrapper">
            <button
              className="slider-btn slider-left"
              onClick={() => scrollServices("left")}
              aria-label="Previous services"
            >
              ‹
            </button>

            <div className="service-cards" ref={sliderRef}>
              <div className="service-card">
                <div className="service-icon">🩺</div>
                <h3>General Checkup</h3>
                <p>
                  Schedule regular health checkups with experienced doctors.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">❤️</div>
                <h3>Cardiology</h3>
                <p>
                  Professional consultations and care for your heart health.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">🦷</div>
                <h3>Dental Care</h3>
                <p>
                  Book dental appointments and keep your smile healthy.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">🧴</div>
                <h3>Dermatology</h3>
                <p>
                  Get professional care for your skin, hair, and nails.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">👶</div>
                <h3>Pediatrics</h3>
                <p>
                  Healthcare services and medical checkups for children.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">🧠</div>
                <h3>Neurology</h3>
                <p>
                  Specialist consultations for neurological health concerns.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">🦴</div>
                <h3>Orthopedics</h3>
                <p>
                  Care for bones, joints, muscles, and mobility problems.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">👁️</div>
                <h3>Ophthalmology</h3>
                <p>
                  Eye examinations and specialist care for your vision.
                </p>
              </div>
            </div>

            <button
              className="slider-btn slider-right"
              onClick={() => scrollServices("right")}
              aria-label="Next services"
            >
              ›
            </button>
          </div>
        </section>
        {/* POPULAR DOCTORS */}
          <section className="popular-doctors">
            <div className="section-title">
              <p>Our Specialists</p>
              <h2>Most Popular Doctors</h2>
            </div>

            <div className="doctors-grid">

              <div className="doctor-card">
                <div className="doctor-image">
                  <img src="/doctor1.jpg" alt="Doctor profile" />
                </div>

                <div className="doctor-info">
                  <span className="doctor-specialty">Cardiologist</span>
                  <h3>Dr. Emmanuel Wilson</h3>

                  <div className="doctor-rating">
                    <span>★</span>
                    <strong>4.9</strong>
                    <small>(120 reviews)</small>
                  </div>

                  <p className="availability">
                    ● Available today
                  </p>

                  <div className="doctor-buttons">
                    <button className="profile-btn">
                      View Profile
                    </button>

                    <button className="doctor-book-btn">
                      Book
                    </button>
                  </div>
                </div>
              </div>


              <div className="doctor-card">
                <div className="doctor-image">
                  <img src="/doctor2.jpg" alt="Doctor profile" />
                </div>

                <div className="doctor-info">
                  <span className="doctor-specialty">Dermatologist</span>
                  <h3>Dr. James Carter</h3>

                  <div className="doctor-rating">
                    <span>★</span>
                    <strong>4.8</strong>
                    <small>(98 reviews)</small>
                  </div>

                  <p className="availability">
                    ● Available today
                  </p>

                  <div className="doctor-buttons">
                    <button className="profile-btn">
                      View Profile
                    </button>

                    <button className="doctor-book-btn">
                      Book
                    </button>
                  </div>
                </div>
              </div>


              <div className="doctor-card">
                <div className="doctor-image">
                  <img src="/doctor3.jpg" alt="Doctor profile" />
                </div>

                <div className="doctor-info">
                  <span className="doctor-specialty">Dentist</span>
                  <h3>Dr. Samed Miller</h3>

                  <div className="doctor-rating">
                    <span>★</span>
                    <strong>4.9</strong>
                    <small>(86 reviews)</small>
                  </div>

                  <p className="availability">
                    ● Available today
                  </p>

                  <div className="doctor-buttons">
                    <button className="profile-btn">
                      View Profile
                    </button>

                    <button className="doctor-book-btn">
                      Book
                    </button>
                  </div>
                </div>
              </div>


              <div className="doctor-card">
                <div className="doctor-image">
                  <img src="/doctor4.jpg" alt="Doctor profile" />
                </div>

                <div className="doctor-info">
                  <span className="doctor-specialty">Neurologist</span>
                  <h3>Dr. Sarah Brown</h3>

                  <div className="doctor-rating">
                    <span>★</span>
                    <strong>4.7</strong>
                    <small>(74 reviews)</small>
                  </div>

                  <p className="availability">
                    ● Available today
                  </p>

                  <div className="doctor-buttons">
                    <button className="profile-btn">
                      View Profile
                    </button>

                    <button className="doctor-book-btn">
                      Book
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div className="view-all-doctors">
              <button>View All Doctors</button>
            </div>
          </section>

        {/* HOW IT WORKS */}
        <section className="how-it-works">
          <div className="section-title">
            <p>Simple &amp; Fast</p>
            <h2>Book your appointment in 3 steps</h2>
          </div>

          <div className="steps">
            <div className="step">
              <span>01</span>
              <h3>Choose a Doctor</h3>
              <p>
                Find the right healthcare professional for your needs.
              </p>
            </div>

            <div className="step">
              <span>02</span>
              <h3>Select a Time</h3>
              <p>
                Choose an available date and time that works for you.
              </p>
            </div>

            <div className="step">
              <span>03</span>
              <h3>Book Appointment</h3>
              <p>
                Confirm your appointment and you&apos;re ready to go.
              </p>
            </div>
          </div>
        </section>

      {/* WHY US */}
      <section className="why-us">
        <div className="why-content">
          <p className="section-small">
            Why MyAppointment?
          </p>

          <h2>Your healthcare, made easier.</h2>

          <p>
            MyAppointment helps you find healthcare professionals
            and manage your appointments in one simple place.
          </p>

          <div className="benefit">
            <span>✓</span>
            Easy online booking
          </div>

          <div className="benefit">
            <span>✓</span>
            Qualified healthcare professionals
          </div>

          <div className="benefit">
            <span>✓</span>
            Simple appointment management
          </div>

          <div className="benefit">
            <span>✓</span>
            Fast and easy to use
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to book your appointment?</h2>

        <p>
          Find the right doctor and schedule your visit today.
        </p>

        <button>Book Appointment</button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          <h3>MyAppointment</h3>
          <p>
            Making healthcare appointments simple and accessible.
          </p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>

          <a href="/">Home</a>
          <a href="#services">Services</a>
          <a href="#appointments">Appointments</a>
          <a href="#about">About Us</a>
        </div>

        <div>
          <h4>Contact</h4>
          <p>Prishtina, Kosovo</p>
          <p>info@myappointment.com</p>
        </div>

        <div>
          <h4>Opening Hours</h4>
          <p>Mon - Fri: 08:00 - 20:00</p>
          <p>Sat: 09:00 - 17:00</p>
        </div>
      </footer>
    </main>
  );
};


export default Home;