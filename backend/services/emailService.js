const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAppointmentConfirmation = async ({
  email,
  patientName,
  doctorName,
  specialty,
  date,
  time,
  bookingId,
}) => {
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  await transporter.sendMail({
    from: `"MyAppointment" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Appointment Confirmation - MyAppointment",

    text: `
Appointment Confirmed

Patient: ${patientName}
Doctor: ${doctorName}
Specialty: ${specialty}
Date: ${formattedDate}
Time: ${time}
Booking ID: ${bookingId}

Please arrive 10 minutes before your scheduled appointment.

MyAppointment
    `,

    html: `
      <div style="
        background:#f0fdf7;
        padding:40px 20px;
        font-family:Arial,sans-serif;
        color:#263b3a;
      ">
        <div style="
          max-width:600px;
          margin:auto;
          background:#ffffff;
          border:1px solid #e1eee9;
          border-radius:16px;
          overflow:hidden;
        ">

          <div style="
            background:#18a875;
            padding:24px;
            text-align:center;
            color:white;
          ">
            <h1 style="margin:0;font-size:24px;">
              MyAppointment
            </h1>

            <p style="margin:8px 0 0;">
              Appointment Confirmation
            </p>
          </div>

          <div style="padding:30px;">

            <div style="
              text-align:center;
              margin-bottom:28px;
            ">
              <div style="
                width:55px;
                height:55px;
                margin:auto;
                background:#ecfdf5;
                color:#18a875;
                border-radius:50%;
                line-height:55px;
                font-size:30px;
                font-weight:bold;
              ">
                ✓
              </div>

              <h2 style="
                color:#16332b;
                margin-bottom:5px;
              ">
                Appointment Confirmed
              </h2>

              <p style="
                color:#64748b;
                margin:0;
              ">
                Your appointment has been booked successfully.
              </p>
            </div>

            <div style="
              border:1px solid #e5eee9;
              border-radius:12px;
              overflow:hidden;
            ">

              <div style="padding:14px 18px;border-bottom:1px solid #edf2f0;">
                <strong>Patient:</strong>
                ${patientName}
              </div>

              <div style="padding:14px 18px;border-bottom:1px solid #edf2f0;">
                <strong>Doctor:</strong>
                ${doctorName}
              </div>

              <div style="padding:14px 18px;border-bottom:1px solid #edf2f0;">
                <strong>Specialty:</strong>
                ${specialty}
              </div>

              <div style="padding:14px 18px;border-bottom:1px solid #edf2f0;">
                <strong>Date:</strong>
                ${formattedDate}
              </div>

              <div style="padding:14px 18px;border-bottom:1px solid #edf2f0;">
                <strong>Time:</strong>
                ${time}
              </div>

              <div style="padding:14px 18px;">
                <strong>Booking ID:</strong>
                ${bookingId}
              </div>

            </div>

            <p style="
              margin-top:25px;
              padding:14px;
              color:#475569;
              background:#f8faf9;
              border-radius:8px;
              text-align:center;
              font-size:14px;
            ">
              Please arrive 10 minutes before your scheduled appointment.
            </p>

          </div>

          <div style="
            padding:18px;
            background:#f8faf9;
            color:#94a3b8;
            text-align:center;
            font-size:12px;
          ">
            MyAppointment • Appointment confirmation
          </div>

        </div>
      </div>
    `,
  });
};

module.exports = {
  sendAppointmentConfirmation,
};
