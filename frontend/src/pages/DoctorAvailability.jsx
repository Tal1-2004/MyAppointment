import { useState } from "react";
import "./DoctorAvailability.css";

function DoctorAvailability() {
  const user = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user")
  );

  const createDayAvailability = () => ({
    enabled: false,
    periods: [
      {
        startTime: "",
        endTime: "",
      },
    ],
  });

  const [availability, setAvailability] = useState({
    monday: createDayAvailability(),
    tuesday: createDayAvailability(),
    wednesday: createDayAvailability(),
    thursday: createDayAvailability(),
    friday: createDayAvailability(),
    saturday: createDayAvailability(),
    sunday: createDayAvailability(),
  });

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [appointmentDuration, setAppointmentDuration] =
  useState(30);

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // =========================
  // 15-MINUTE TIME OPTIONS
  // =========================

  const generateTimeOptions = () => {
    const options = [];

    const openingHour = 8;
    const closingHour = 20;

    for (
      let totalMinutes = openingHour * 60;
      totalMinutes <= closingHour * 60;
      totalMinutes += 15
    ) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const formattedHour = String(hours).padStart(
        2,
        "0"
      );

      const formattedMinutes = String(
        minutes
      ).padStart(2, "0");

      options.push(
        `${formattedHour}:${formattedMinutes}`
      );
    }

    return options;
  };

  const timeOptions = generateTimeOptions();

  // =========================
  // TOGGLE DAY
  // =========================

  const handleToggle = (day) => {
    setMessage("");

    setAvailability((current) => ({
      ...current,

      [day]: {
        ...current[day],
        enabled: !current[day].enabled,

        periods:
          current[day].periods.length > 0
            ? current[day].periods
            : [
                {
                  startTime: "",
                  endTime: "",
                },
              ],
      },
    }));
  };

  // =========================
  // CHANGE PERIOD TIME
  // =========================

  const handleTimeChange = (
    day,
    periodIndex,
    field,
    value
  ) => {
    setMessage("");

    setAvailability((current) => {
      const updatedPeriods = current[
        day
      ].periods.map((period, index) => {
        if (index !== periodIndex) {
          return period;
        }

        if (field === "startTime") {
          return {
            ...period,
            startTime: value,
            endTime: "",
          };
        }

        return {
          ...period,
          [field]: value,
        };
      });

      return {
        ...current,

        [day]: {
          ...current[day],
          periods: updatedPeriods,
        },
      };
    });
  };

  // =========================
  // ADD PERIOD AFTER BREAK
  // =========================

  const handleAddSecondPeriod = (day) => {
    setMessage("");

    setAvailability((current) => {
      const dayData = current[day];

      if (dayData.periods.length >= 2) {
        return current;
      }

      const firstPeriod = dayData.periods[0];

      if (
        !firstPeriod.startTime ||
        !firstPeriod.endTime
      ) {
        setMessage(
          `Complete the first working period for ${
            day.charAt(0).toUpperCase() +
            day.slice(1)
          } before adding hours after the break.`
        );

        return current;
      }

      return {
        ...current,

        [day]: {
          ...dayData,

          periods: [
            ...dayData.periods,

            {
              startTime: "",
              endTime: "",
            },
          ],
        },
      };
    });
  };

  // =========================
  // REMOVE SECOND PERIOD
  // =========================

  const handleRemoveSecondPeriod = (day) => {
    setMessage("");

    setAvailability((current) => ({
      ...current,

      [day]: {
        ...current[day],
        periods: current[day].periods.slice(0, 1),
      },
    }));
  };

  // =========================
  // END TIME OPTIONS
  // =========================

  const getEndTimeOptions = (
    day,
    periodIndex
  ) => {
    const currentPeriod =
      availability[day].periods[periodIndex];

    if (!currentPeriod?.startTime) {
      return [];
    }

    return timeOptions.filter(
      (time) => time > currentPeriod.startTime
    );
  };

  // =========================
  // SECOND PERIOD START OPTIONS
  // =========================

  const getSecondPeriodStartOptions = (day) => {
    const firstPeriod =
      availability[day].periods[0];

    if (!firstPeriod?.endTime) {
      return [];
    }

    return timeOptions.filter(
      (time) => time > firstPeriod.endTime
    );
  };

  // =========================
  // VALIDATION
  // =========================

    const validateAvailability = () => {
      for (const day of days) {
        const dayData = availability[day];

        // Nëse dita është OFF, kalojmë te dita tjetër
        if (!dayData.enabled) {
          continue;
        }

        const dayName =
          day.charAt(0).toUpperCase() +
          day.slice(1);

        // Duhet të ketë të paktën një periudhë pune
        if (dayData.periods.length === 0) {
          return `${dayName} needs at least one working period.`;
        }

        // Kontrollo secilën periudhë
        for (
          let index = 0;
          index < dayData.periods.length;
          index++
        ) {
          const period = dayData.periods[index];

          if (
            !period.startTime ||
            !period.endTime
          ) {
            return `Complete all working hours for ${dayName}.`;
          }

          if (
            period.startTime >= period.endTime
          ) {
            return `The end time must be after the start time for ${dayName}.`;
          }
        }

        // Nëse ka periudhë pas pauzës
        if (dayData.periods.length === 2) {
          const firstPeriod =
            dayData.periods[0];

          const secondPeriod =
            dayData.periods[1];

          if (
            secondPeriod.startTime <=
            firstPeriod.endTime
          ) {
            return `Hours after the break must begin after the first working period on ${dayName}.`;
          }
        }
      }

      return "";
    };

  // =========================
  // SAVE AVAILABILITY
  // =========================

  const handleSave = async () => {
    if (!user?.id) {
      window.location.href = "/login";
      return;
    }

    setMessage("");

    const validationMessage =
      validateAvailability();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:5000/api/doctors/availability",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId: user.id,
            availability,
            appointmentDuration,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not save availability."
        );

        return;
      }

      setAvailability(
        data.availability || availability
      );

      setMessage(
        "Availability saved successfully."
      );
    } catch (error) {
      console.error(
        "Save availability error:",
        error
      );

      setMessage(
        "Cannot connect to the server."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // JSX
  // =========================

  return (
    <main className="availability-page">
      <div className="availability-card">

        {/* HEADER */}

        <div className="availability-header">
          <div>
            <p>Doctor Schedule</p>

            <h1>Manage Availability</h1>

            <span>
              Choose the days and hours when
              patients can book appointments
              with you.
            </span>
          </div>

          <button
            type="button"
            className="availability-back"
            onClick={() => {
              window.location.href =
                "/doctor-dashboard";
            }}
          >
            ← Dashboard
          </button>
        </div>

        {/* DAYS */}

        <div className="appointment-duration-section">
          <div>
            <h3>Appointment duration</h3>
            <p>
              Choose how much time you normally need
              for each patient.
            </p>
          </div>

          <div className="duration-options">
            {[15, 30, 45, 60].map((duration) => (
              <button
                key={duration}
                type="button"
                className={
                  appointmentDuration === duration
                    ? "duration-option duration-active"
                    : "duration-option"
                }
                onClick={() =>
                  setAppointmentDuration(duration)
                }
              >
                {duration === 60
                  ? "1 hour"
                  : `${duration} min`}
              </button>
            ))}
          </div>
        </div>

        <div className="availability-days">
          {days.map((day) => {
            const dayData = availability[day];

            const dayName =
              day.charAt(0).toUpperCase() +
              day.slice(1);

            return (
              <div
                key={day}
                className={`availability-day ${
                  dayData.enabled
                    ? "availability-day-active"
                    : ""
                }`}
              >
                <div className="availability-day-top">
                  <div className="availability-day-name">
                    <strong>{dayName}</strong>

                    <span>
                      {dayData.enabled
                        ? "Available"
                        : "Day off"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`availability-toggle ${
                      dayData.enabled
                        ? "toggle-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleToggle(day)
                    }
                  >
                    {dayData.enabled
                      ? "ON"
                      : "OFF"}
                  </button>
                </div>

                {dayData.enabled && (
                  <div className="availability-periods">

                    {dayData.periods.map(
                      (period, periodIndex) => {
                        const isSecondPeriod =
                          periodIndex === 1;

                        const startOptions =
                          isSecondPeriod
                            ? getSecondPeriodStartOptions(
                                day
                              )
                            : timeOptions.slice(
                                0,
                                -1
                              );

                        const endOptions =
                          getEndTimeOptions(
                            day,
                            periodIndex
                          );

                        return (
                          <div
                            className="availability-period"
                            key={`${day}-${periodIndex}`}
                          >
                            <div className="period-heading">
                              <strong>
                                {dayData.periods
                                  .length === 1
                                  ? "Working hours"
                                  : isSecondPeriod
                                    ? "After break"
                                    : "Before break"}
                              </strong>
                            </div>

                            <div className="availability-hours">
                              <label>
                                <span>From</span>

                                <select
                                  value={
                                    period.startTime
                                  }
                                  onChange={(e) =>
                                    handleTimeChange(
                                      day,
                                      periodIndex,
                                      "startTime",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">
                                    Select start
                                  </option>

                                  {startOptions.map(
                                    (time) => (
                                      <option
                                        key={time}
                                        value={time}
                                      >
                                        {time}
                                      </option>
                                    )
                                  )}
                                </select>
                              </label>

                              <span className="availability-arrow">
                                →
                              </span>

                              <label>
                                <span>To</span>

                                <select
                                  value={
                                    period.endTime
                                  }
                                  disabled={
                                    !period.startTime
                                  }
                                  onChange={(e) =>
                                    handleTimeChange(
                                      day,
                                      periodIndex,
                                      "endTime",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">
                                    {period.startTime
                                      ? "Select end"
                                      : "Select start first"}
                                  </option>

                                  {endOptions.map(
                                    (time) => (
                                      <option
                                        key={time}
                                        value={time}
                                      >
                                        {time}
                                      </option>
                                    )
                                  )}
                                </select>
                              </label>
                            </div>
                          </div>
                        );
                      }
                    )}

                    {dayData.periods.length === 1 ? (
                      <div className="break-option">
                        <p>
                          Do you have a break during
                          the day?
                        </p>

                        <button
                          type="button"
                          className="add-break-period"
                          onClick={() =>
                            handleAddSecondPeriod(
                              day
                            )
                          }
                        >
                          + Add hours after break
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="remove-break-period"
                        onClick={() =>
                          handleRemoveSecondPeriod(
                            day
                          )
                        }
                      >
                        Remove hours after break
                      </button>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="availability-message">
            {message}
          </div>
        )}

        {/* SAVE */}

        <button
          type="button"
          className="availability-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Availability"}
        </button>

      </div>
    </main>
  );
}

export default DoctorAvailability;