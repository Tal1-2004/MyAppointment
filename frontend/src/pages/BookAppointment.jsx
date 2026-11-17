import { useState } from "react";
import "./BookAppointment.css";

function BookAppointment() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [formData, setFormData] = useState({
    specialty: "",
    doctorName: "",
    date: "",
    time: "",
    reason: "",
  });

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const specialties = [
    "General Medicine",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Neurology",
  ];

  const doctors = {
    "General Medicine": [
      "Dr. Arben Krasniqi",
      "Dr. Elira Berisha",
    ],
    Cardiology: [
      "Dr. Leon Gashi",
      "Dr. Sara Hoxha",
    ],
    Dermatology: [
      "Dr. Arta Shala",
      "Dr. Dren Morina",
    ],
    Pediatrics: [
      "Dr. Era Kelmendi",
      "Dr. Luan Berisha",
    ],
    Neurology: [
      "Dr. Nora Gashi",
      "Dr. Erion Krasniqi",
    ],
  };

  const times = [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === "specialty" && {
        doctorName: "",
      }),
    }));
  };

  // =========================
  // CALENDAR
  // =========================

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  // JavaScript: Sunday = 0
  // Calendar: Monday = 0
  const firstDayOfMonth =
    (new Date(year, month, 1).getDay() + 6) % 7;

  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const formatDate = (yearValue, monthValue, dayValue) => {
    const formattedMonth = String(monthValue + 1).padStart(2, "0");
    const formattedDay = String(dayValue).padStart(2, "0");

    return `${yearValue}-${formattedMonth}-${formattedDay}`;
  };

  const selectDate = (day) => {
    if (!day) return;

    const selectedDate = new Date(year, month, day);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return;
    }

    const dateString = formatDate(year, month, day);

    setFormData((current) => ({
      ...current,
      date: dateString,
      time: "",
    }));

    setCalendarOpen(false);
  };

  const previousMonth = () => {
    const previous = new Date(year, month - 1, 1);

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

    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    return date < today;
  };

  const isSelectedDate = (day) => {
    if (!day || !formData.date) return false;

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
      !formData.doctorName ||
      !formData.date ||
      !formData.time
    ) {
      setMessage("Please complete all required fields.");
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
            specialty: formData.specialty,
            doctorName: formData.doctorName,
            date: formData.date,
            time: formData.time,
            reason: formData.reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Appointment booking failed."
        );

        return;
      }

      sessionStorage.setItem(
      "appointmentSuccess",
      "Your appointment has been booked successfully!"
      );

      window.location.href = "/";
      } catch (error) {
        console.error(error);

        setMessage("Cannot connect to the server.");
      } finally {
        setIsSubmitting(false);
      }
  };

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
              required
            >
              <option value="">
                Select specialty
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

          {/* DOCTOR */}

          <div className="booking-group">
            <label>Doctor</label>

            <select
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              disabled={!formData.specialty}
              required
            >
              <option value="">
                Select doctor
              </option>

              {formData.specialty &&
                doctors[formData.specialty].map(
                  (doctor) => (
                    <option
                      key={doctor}
                      value={doctor}
                    >
                      {doctor}
                    </option>
                  )
                )}
            </select>
          </div>

          {/* DATE */}

          <div className="booking-group">
            <label>Date</label>

            <button
              type="button"
              className={`date-selector ${
                formData.date ? "has-date" : ""
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

            {/* LARGE CALENDAR */}

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

           

          <div className="booking-group">
            <label>Time</label>

            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              disabled={!formData.date}
              required
            >
              <option value="">
                {formData.date
                  ? "Select time"
                  : "Choose a date first"}
              </option>

              {times.map((time) => (
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
            disabled={isSubmitting}
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