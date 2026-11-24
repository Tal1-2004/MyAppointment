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

  const [bookedTimes, setBookedTimes] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

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

  // =========================
  // LOAD BOOKED TIMES
  // =========================

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!formData.doctor || !formData.date) {
        setBookedTimes([]);
        return;
      }

      try {
        setSlotsLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/appointments/booked-slots?doctor=${formData.doctor}&date=${formData.date}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Could not load available times."
          );
          return;
        }

        setBookedTimes(data.bookedTimes || []);
      } catch (error) {
        console.error(
          "Load booked slots error:",
          error
        );

        setMessage(
          "Cannot load available times from the server."
        );
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchBookedSlots();
  }, [formData.doctor, formData.date]);

  // =========================
  // DOCTORS / LOCATIONS
  // =========================

  const specialties = [
      ...new Set(
        availableDoctors.flatMap((doctor) => {
          if (
            doctor.specialties &&
            doctor.specialties.length > 0
          ) {
            return doctor.specialties;
          }

          return doctor.specialty
            ? [doctor.specialty]
            : [];
        })
      ),
    ].sort();

  const locations = [
    "Prishtina",
    "Prizren",
    "Peja",
    "Gjakova",
    "Ferizaj",
    "Gjilan",
    "Mitrovica",
  ];

  const filteredDoctors = availableDoctors.filter(
    (doctor) => {
      const doctorSpecialties =
        doctor.specialties?.length > 0
          ? doctor.specialties
          : doctor.specialty
          ? [doctor.specialty]
          : [];

      return (
        doctorSpecialties.includes(
          formData.specialty
        ) &&
        doctor.location === formData.location
      );
    }
  );

  const selectedDoctor = availableDoctors.find(
    (doctor) => doctor._id === formData.doctor
  );

  // =========================
  // TIMES
  // =========================

  const appointmentDuration =
    Number(selectedDoctor?.appointmentDuration) || 30;

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const timeToMinutes = (time) => {
    if (!time || !time.includes(":")) {
      return 0;
    }

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    return hours * 60 + minutes;
  };

  const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
  };

  const generateTimesForDate = () => {
    if (
      !formData.date ||
      !selectedDoctor?.availability
    ) {
      return [];
    }

    const selectedDate = new Date(
      `${formData.date}T00:00:00`
    );

    const selectedDayName =
      dayNames[selectedDate.getDay()];

    const dayAvailability =
      selectedDoctor.availability[selectedDayName];

    if (
      !dayAvailability?.enabled ||
      !dayAvailability.periods?.length
    ) {
      return [];
    }

    const generatedTimes = [];

    dayAvailability.periods.forEach((period) => {
      if (!period.startTime || !period.endTime) {
        return;
      }

      let currentMinutes = timeToMinutes(
        period.startTime
      );

      const endMinutes = timeToMinutes(
        period.endTime
      );

      while (
        currentMinutes + appointmentDuration <=
        endMinutes
      ) {
        generatedTimes.push(
          minutesToTime(currentMinutes)
        );

        currentMinutes += appointmentDuration;
      }
    });

    return [...new Set(generatedTimes)].sort(
      (firstTime, secondTime) =>
        timeToMinutes(firstTime) -
        timeToMinutes(secondTime)
    );
  };

  const times = generateTimesForDate();

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
        date: "",
        time: "",
      }),

      ...(name === "location" && {
        doctor: "",
        doctorName: "",
        date: "",
        time: "",
      }),
    }));

    if (
      name === "specialty" ||
      name === "location"
    ) {
      setBookedTimes([]);
      setMessage("");
    }
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;

    const doctor = availableDoctors.find(
      (item) => item._id === doctorId
    );

    setFormData((current) => ({
      ...current,
      doctor: doctorId,
      doctorName: doctor?.user?.name || "",
      date: "",
      time: "",
    }));

    setBookedTimes([]);
    setCalendarOpen(false);
    setMessage("");
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

  // =========================
  // AVAILABLE TIMES
  // =========================

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

    let validTimes = [...times];

    // Nëse është sot, hiqi orët që kanë kaluar
    if (formData.date === todayDate) {
      const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

      validTimes = validTimes.filter((time) => {
        const appointmentMinutes =
          timeToMinutes(time);

        return appointmentMinutes > currentMinutes;
      });
    }

    // Hiqi orët e rezervuara
    return validTimes.filter(
      (time) => !bookedTimes.includes(time)
    );
  };

  const availableTimes = getAvailableTimes();

  const handleTimeSelect = (time) => {
    if (
      bookedTimes.includes(time) ||
      !availableTimes.includes(time)
    ) {
      return;
    }

    setFormData((current) => ({
      ...current,
      time,
    }));

    setMessage("");
  };

  // =========================
  // CALENDAR HELPERS
  // =========================

  const isPastDate = (day) => {
    if (!day) return false;

    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    return date < today;
  };

  const isDoctorUnavailable = (day) => {
    if (
      !day ||
      !selectedDoctor?.availability
    ) {
      return false;
    }

    const date = new Date(year, month, day);

    const dayName = dayNames[date.getDay()];

    const dayAvailability =
      selectedDoctor.availability[dayName];

    return (
      !dayAvailability?.enabled ||
      !dayAvailability.periods?.some(
        (period) =>
          period.startTime && period.endTime
      )
    );
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

    const selectedDayName =
      dayNames[selectedDate.getDay()];

    const dayAvailability =
      selectedDoctor?.availability?.[
        selectedDayName
      ];

    if (
      !dayAvailability?.enabled ||
      !dayAvailability.periods?.some(
        (period) =>
          period.startTime && period.endTime
      )
    ) {
      ge(
        "This doctor is not available on the selected day."
      );
      return;
    }

    const dateString = formatDate(
      year,
      month,
      day
    );

    setMessage("");

    setFormData((current) => ({
      ...current,
      date: dateString,
      time: "",
    }));

    setBookedTimes([]);
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

    // Sigurohu që ora është ende valide
    if (!availableTimes.includes(formData.time)) {
      setMessage(
        "This appointment time is no longer available."
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

        // Dikush tjetër e ka rezervuar
        // të njëjtën orë ndërkohë
        if (response.status === 409) {
          setFormData((current) => ({
            ...current,
            time: "",
          }));

          try {
            const slotsResponse = await fetch(
              `http://localhost:5000/api/appointments/booked-slots?doctor=${formData.doctor}&date=${formData.date}`
            );

            const slotsData =
              await slotsResponse.json();

            if (slotsResponse.ok) {
              setBookedTimes(
                slotsData.bookedTimes || []
              );
            }
          } catch (slotsError) {
            console.error(
              "Refresh booked slots error:",
              slotsError
            );
          }
        }

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

          {/* CITY */}

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
                formData.date ? "has-date" : ""
              }`}
              disabled={!formData.doctor}
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
                  : formData.doctor
                  ? "Choose appointment date"
                  : "Choose a doctor first"}
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
                      year ===
                        today.getFullYear() &&
                      month ===
                        today.getMonth()
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

                      const doctorUnavailable =
                        isDoctorUnavailable(day);

                      const selected =
                        isSelectedDate(day);

                      const currentDay =
                        isToday(day);

                      return (
                        <button
                          type="button"
                          key={day}
                          disabled={
                            past ||
                            doctorUnavailable
                          }
                          onClick={() =>
                            selectDate(day)
                          }
                          className={[
                            "calendar-day",

                            past
                              ? "past-day"
                              : "",

                            doctorUnavailable
                              ? "unavailable-day"
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

            {!formData.date ? (
              <div className="time-slots-message">
                Choose a date first
              </div>
            ) : slotsLoading ? (
              <div className="time-slots-message">
                Loading available times...
              </div>
            ) : (
              <>
                <div className="time-slots">
                  {times.map((time) => {
                    const isBooked =
                      bookedTimes.includes(time);

                    const isAvailable =
                      availableTimes.includes(
                        time
                      );

                    const isSelected =
                      formData.time === time;

                    const isDisabled =
                      isBooked ||
                      !isAvailable;

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isDisabled}
                        onClick={() =>
                          handleTimeSelect(
                            time
                          )
                        }
                        className={[
                          "time-slot",

                          isSelected
                            ? "time-slot-selected"
                            : "",

                          isBooked
                            ? "time-slot-booked"
                            : "",

                          !isBooked &&
                          !isAvailable
                            ? "time-slot-passed"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <span>{time}</span>

                        {isBooked && (
                          <small>
                            Booked
                          </small>
                        )}

                        {!isBooked &&
                          !isAvailable && (
                            <small>
                              Passed
                            </small>
                          )}
                      </button>
                    );
                  })}
                </div>

                {times.length === 0 && (
                  <p className="no-time-slots">
                    The doctor is not available
                    on this date.
                  </p>
                )}

                {times.length > 0 &&
                  availableTimes.length ===
                    0 && (
                    <p className="no-time-slots">
                      No available times for
                      this date.
                    </p>
                  )}
              </>
            )}
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
              doctorsLoading ||
              slotsLoading
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