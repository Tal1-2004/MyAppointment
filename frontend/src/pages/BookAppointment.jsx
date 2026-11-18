import { useEffect, useState } from "react";
import "./BookAppointment.css";

function BookAppointment() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [formData, setFormData] = useState({
  specialty: "",
  location: "",
  doctor: "",
  doctorName: "",
  date: "",
  time: "",
  reason: "",
  }); 

  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // =========================
  // LOAD DOCTORS
  // =========================

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/doctors"
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message || "Could not load doctors."
          );
          return;
        }

        setAvailableDoctors(data.doctors || []);
      } catch (error) {
        console.error("Load doctors error:", error);

        setMessage(
          "Cannot load doctors from the server."
        );
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Specialties prej doktorëve realë
  const specialties = [
    ...new Set(
      availableDoctors.map(
        (doctor) => doctor.specialty
      )
    ),
  ];
  const locations = [
    "Prishtina",
    "Prizren",
    "Peja",
    "Gjakova",
    "Ferizaj",
    "Gjilan",
    "Mitrovica",
  ];


  // Doktorët e specialty së zgjedhur
  const filteredDoctors = availableDoctors.filter(
    (doctor) =>
      doctor.specialty === formData.specialty &&
      doctor.location === formData.location
  );

  const times = [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
  ];

  const getAvailableTimes = () => {
  if (!formData.date) {
    return [];
  }

  const now = new Date();

  const todayDate = formatDate(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // Nëse është ditë tjetër në të ardhmen,
  // krejt oraret janë në dispozicion.
  if (formData.date !== todayDate) {
    return times;
  }

    // Nëse është sot, largo orët që kanë kaluar.
    const currentMinutes =
      now.getHours() * 60 + now.getMinutes();

    return times.filter((time) => {
      const [hours, minutes] = time
        .split(":")
        .map(Number);

      const appointmentMinutes =
        hours * 60 + minutes;

      return appointmentMinutes > currentMinutes;
    });
  };

  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((current) => ({
    ...current,
    [name]: value,

    ...(name === "specialty" && {
      location: "",
      doctor: "",
      doctorName: "",
    }),

    ...(name === "location" && {
      doctor: "",
      doctorName: "",
    }),
  }));
};

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;

    const selectedDoctor = availableDoctors.find(
      (doctor) => doctor._id === doctorId
    );

    setFormData((current) => ({
      ...current,
      doctor: doctorId,
      doctorName: selectedDoctor?.user?.name || "",
    }));
  };

  // =========================
  // CALENDAR
  // =========================

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDayOfMonth =
    (new Date(year, month, 1).getDay() + 6) % 7;

  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const formatDate = (
    yearValue,
    monthValue,
    dayValue
  ) => {
    const formattedMonth = String(
      monthValue + 1
    ).padStart(2, "0");

    const formattedDay = String(
      dayValue
    ).padStart(2, "0");

    return `${yearValue}-${formattedMonth}-${formattedDay}`;
  };
  
  const availableTimes = getAvailableTimes();

  const selectDate = (day) => {
    if (!day) return;

    const selectedDate = new Date(
      year,
      month,
      day
    );

    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return;
    }

    const dateString = formatDate(
      year,
      month,
      day
    );

    setFormData((current) => ({
      ...current,
      date: dateString,
      time: "",
    }));

    setCalendarOpen(false);
  };

  const previousMonth = () => {
    const previous = new Date(
      year,
      month - 1,
      1
    );

    const currentRealMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (previous < currentRealMonth) {
      return;
    }

    setCurrentMonth(previous);
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(year, month + 1, 1)
    );
  };

  const isPastDate = (day) => {
    if (!day) return false;

    const date = new Date(
      year,
      month,
      day
    );

    date.setHours(0, 0, 0, 0);

    return date < today;
  };

  const isSelectedDate = (day) => {
    if (!day || !formData.date) {
      return false;
    }

    return (
      formData.date ===
      formatDate(year, month, day)
    );
  };

  const isToday = (day) => {
    if (!day) return false;

    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  // =========================
  // BOOK APPOINTMENT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const user = JSON.parse(
      localStorage.getItem("user") ||
        sessionStorage.getItem("user")
    );

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!user || !token) {
      window.location.href = "/login";
      return;
    }

    if (
      !formData.specialty ||
      !formData.location ||
      !formData.doctor ||
      !formData.doctorName ||
      !formData.date ||
      !formData.time
    ) {
      setMessage(
        "Please complete all required fields."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/appointments",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            patient: user.id,
            doctor: formData.doctor,
            doctorName: formData.doctorName,
            specialty: formData.specialty,
            date: formData.date,
            time: formData.time,
            reason: formData.reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Appointment booking failed."
        );
        return;
      }

      sessionStorage.setItem(
        "appointmentSuccess",
        "Your appointment has been booked successfully!"
      );

      window.location.href = "/";
    } catch (error) {
      console.error(
        "Appointment booking error:",
        error
      );

      setMessage(
        "Cannot connect to the server."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // JSX
  // =========================

  return (
    <div className="booking-page">
      <div className="booking-card">

        {/* LOGO */}

        <div className="booking-logo">
          <img
            src="/Designer.png"
            alt="MyAppointment logo"
          />

          <h2>MyAppointment</h2>
        </div>

        {/* HEADING */}

        <div className="booking-heading">
          <h1>Book an Appointment</h1>

          <p>
            Choose a doctor and a time that works
            best for you.
          </p>
        </div>

        <form
          className="booking-form"
          onSubmit={handleSubmit}
        >

          {/* SPECIALTY */}

          <div className="booking-group">
            <label>Specialty</label>

            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              disabled={doctorsLoading}
              required
            >
              <option value="">
                {doctorsLoading
                  ? "Loading specialties..."
                  : "Select specialty"}
              </option>

              {specialties.map((specialty) => (
                <option
                  key={specialty}
                  value={specialty}
                >
                  {specialty}
                </option>
              ))}
            </select>
          </div>
              {/* Qyteti */}

          <div className="booking-group">
            
            <label>City</label>

            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={!formData.specialty}
              required
            >
              <option value="">
                {!formData.specialty
                  ? "Select specialty first"
                  : "Select city"}
              </option>

              {locations.map((location) => (
                <option
                  key={location}
                  value={location}
                >
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* DOCTOR */}

          <div className="booking-group">
            <label>Doctor</label>

            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleDoctorChange}
              disabled={
                !formData.specialty ||
                !formData.location ||
                doctorsLoading
              }
              required
            >
              <option value="">
                {!formData.specialty
                  ? "Select specialty first"
                  : !formData.location
                    ? "Select city first"
                    : "Select doctor"}
              </option>

              {filteredDoctors.map((doctor) => (
                <option
                  key={doctor._id}
                  value={doctor._id}
                >
                  {doctor.user?.name}
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}

          <div className="booking-group">
            <label>Date</label>

            <button
              type="button"
              className={`date-selector ${
                formData.date
                  ? "has-date"
                  : ""
              }`}
              onClick={() =>
                setCalendarOpen(
                  (current) => !current
                )
              }
            >
              <span>
                {formData.date
                  ? new Date(
                      `${formData.date}T00:00:00`
                    ).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "Choose appointment date"}
              </span>

              <span className="calendar-icon">
                📅
              </span>
            </button>

            {/* CALENDAR */}

            {calendarOpen && (
              <div className="custom-calendar">

                <div className="calendar-header">

                  <button
                    type="button"
                    className="calendar-arrow"
                    onClick={previousMonth}
                    disabled={
                      year === today.getFullYear() &&
                      month === today.getMonth()
                    }
                  >
                    ‹
                  </button>

                  <h3>{monthName}</h3>

                  <button
                    type="button"
                    className="calendar-arrow"
                    onClick={nextMonth}
          >
                    ›
                  </button>

                </div>

                <div className="calendar-weekdays">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                <div className="calendar-grid">

                  {calendarDays.map(
                    (day, index) => {
                      if (!day) {
                        return (
                          <span
                            key={`empty-${index}`}
                            className="calendar-empty"
                          />
                        );
                      }

                      const past =
                        isPastDate(day);

                      const selected =
                        isSelectedDate(day);

                      const currentDay =
                        isToday(day);

                      return (
                        <button
                          type="button"
                          key={day}
                          disabled={past}
                          onClick={() =>
                            selectDate(day)
                          }
                          className={[
                            "calendar-day",

                            past
                              ? "past-day"
                              : "",

                            selected
                              ? "selected-day"
                              : "",

                            currentDay
                              ? "today"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {day}
                        </button>
                      );
                    }
                  )}

                </div>

                <div className="calendar-footer">

                  <span className="calendar-legend">
                    <span className="legend-dot today-dot" />
                    Today
                  </span>

                  <span className="calendar-legend">
                    <span className="legend-dot selected-dot" />
                    Selected
                  </span>

                </div>

              </div>
            )}

          </div>
          {/* TIME */}

          <div className="booking-group">
            <label>Time</label>

            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              disabled={
                !formData.date ||
                availableTimes.length === 0
              }
              required
            >
              <option value="">
                {!formData.date
                  ? "Choose a date first"
                  : availableTimes.length === 0
                    ? "No available times today"
                    : "Select time"}
              </option>

              {availableTimes.map((time) => (
                <option
                  key={time}
                  value={time}
                >
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* REASON */}

          <div className="booking-group">
            <label>Reason for visit</label>

            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Briefly describe the reason for your appointment..."
              rows="4"
            />
          </div>

          {/* ERROR */}

          {message && (
            <div className="booking-error">
              <span>⚠</span>
              {message}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="booking-submit"
            disabled={
              isSubmitting ||
              doctorsLoading
            }
          >
            {isSubmitting
              ? "Booking..."
              : "Confirm Appointment"}
          </button>

        </form>

        <a
          href="/"
          className="booking-back"
        >
          ← Back to Home
        </a>

      </div>
    </div>
  );
}

export default BookAppointment;