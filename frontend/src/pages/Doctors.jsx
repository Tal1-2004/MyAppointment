import "./Doctors.css";

function Doctors() {
  const doctors = [
    {
      id: 1,
      name: "Dr. Emmanuel Wilson",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 120,
      image: "/doctor1.jpg",
      availability: "Available today",
    },
    {
      id: 2,
      name: "Dr. James Carter",
      specialty: "Dermatologist",
      rating: 4.8,
      reviews: 98,
      image: "/doctor2.jpg",
      availability: "Available today",
    },
    {
      id: 3,
      name: "Dr. Samed Miller",
      specialty: "Dentist",
      rating: 4.9,
      reviews: 86,
      image: "/doctor3.jpg",
      availability: "Available today",
    },
    {
      id: 4,
      name: "Dr. Sarah Brown",
      specialty: "Neurologist",
      rating: 4.7,
      reviews: 74,
      image: "/doctor4.jpg",
      availability: "Available today",
    },
  ];

  const handleBook = () => {
    const user = JSON.parse(
      localStorage.getItem("user") ||
      sessionStorage.getItem("user")
    );

    if (!user) {
      window.location.href = "/login";
      return;
    }

    window.location.href = "/book-appointment";
  };

  return (
    <main className="doctors-page">
      <section className="doctors-header">
        <p>Our Specialists</p>
        <h1>Find Your Doctor</h1>
        <span>
          Choose from our healthcare professionals and book your appointment
          easily.
        </span>
        <div className="doctors-back">
        <button onClick={() => window.location.href = "/"}>
          <span>←</span> Back to Home
          </button>
        </div>
      </section>

      <section className="all-doctors">
        <div className="all-doctors-grid">
          {doctors.map((doctor) => (
            <div className="doctor-card" key={doctor.id}>
              <div className="doctor-image">
                <img src={doctor.image} alt={doctor.name} />
              </div>

              <div className="doctor-info">
                <span className="doctor-specialty">
                  {doctor.specialty}
                </span>

                <h3>{doctor.name}</h3>

                <div className="doctor-rating">
                  <span>★</span>
                  <strong>{doctor.rating}</strong>
                  <small>({doctor.reviews} reviews)</small>
                </div>

                <p className="availability">
                  ● {doctor.availability}
                </p>

                <div className="doctor-buttons">
                  <button className="profile-btn">
                    View Profile
                  </button>

                  <button
                    className="doctor-book-btn"
                    onClick={handleBook}
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Doctors;