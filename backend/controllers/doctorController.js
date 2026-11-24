const User = require("../models/User");
const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");

  const registerDoctor = async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        specialty,
        specialties,
        experience,
        location,
        bio,
      } = req.body;

      // Kontrollo dokumentet
      if (
        !req.files?.cv ||
        !req.files?.diploma ||
        !req.files?.licence
      ) {
        return res.status(400).json({
          message:
            "CV, diploma and medical licence are required",
        });
      }

      // =========================
      // SPECIALTIES
      // =========================

      let parsedSpecialties = [];

      try {
        parsedSpecialties = specialties
          ? JSON.parse(specialties)
          : specialty
          ? [specialty]
          : [];
      } catch (error) {
        return res.status(400).json({
          message: "Invalid specialties format",
        });
      }

      if (
        !Array.isArray(parsedSpecialties) ||
        parsedSpecialties.length === 0 ||
        parsedSpecialties.length > 2
      ) {
        return res.status(400).json({
          message:
            "Please select one or two specialties",
        });
      }

      // Kontrollo a ekziston email-i
      const existingUser = await User.findOne({
        email,
      });

      if (existingUser) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      // Krijo account-in me role doctor
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "doctor",
      });

      try {
        // Krijo profilin profesional
        const doctor = await Doctor.create({
          user: user._id,

          // Primary specialty për kompatibilitet
          specialty: parsedSpecialties[0],

          // 1 ose 2 specialties
          specialties: parsedSpecialties,

          experience,
          location,
          bio,

          documents: {
            cv: req.files?.cv?.[0]?.path || "",
            diploma:
              req.files?.diploma?.[0]?.path || "",
            licence:
              req.files?.licence?.[0]?.path || "",
          },

          verificationStatus: "pending",
        });

        return res.status(201).json({
          message:
            "Doctor registration submitted for verification",

          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },

          doctor: {
            id: doctor._id,
            specialty: doctor.specialty,
            specialties: doctor.specialties,
            experience: doctor.experience,
            location: doctor.location,
            verificationStatus:
              doctor.verificationStatus,
          },
        });
      } catch (doctorError) {
        // Nëse krijimi i Doctor dështon,
        // fshije User-in që sapo u krijua
        await User.findByIdAndDelete(user._id);

        throw doctorError;
      }
    } catch (error) {
      console.error(
        "Doctor registration error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };
  const getApprovedDoctors = async (req, res) => {
    try {
      const doctors = await Doctor.find({
        verificationStatus: "approved",
      })
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        doctors,
      });
    } catch (error) {
      console.error("Get doctors error:", error);

      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };

    const updateDoctorAvailability = async (req, res) => {
    try {
      const {
        userId,
        availability,
        appointmentDuration,
      } = req.body;

      if (!userId || !availability) {
        return res.status(400).json({
          message: "User ID and availability are required",
        });
      }

      const doctor = await Doctor.findOne({
        user: userId,
      });

      if (!doctor) {
        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      doctor.availability = availability;
      doctor.appointmentDuration =
        appointmentDuration;

      await doctor.save();

      return res.status(200).json({
        message: "Availability updated successfully",
        availability: doctor.availability,
        appointmentDuration:
          doctor.appointmentDuration,
      });
    } catch (error) {
      console.error(
        "Update doctor availability error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };

    const getDoctorProfile = async (req, res) => {
    try {
      const doctor = await Doctor.findOne({
        user: req.params.userId,
      }).populate("user", "name email");

      if (!doctor) {
        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      return res.status(200).json({
        doctor,
      });
    } catch (error) {
      console.error("Get doctor profile error:", error);

      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };

    const updateDoctorProfile = async (req, res) => {
      try {
        const {
          specialty,
          specialties,
          experience,
          location,
          bio,
        } = req.body;

        const doctor = await Doctor.findOne({
          user: req.params.userId,
        });

        if (!doctor) {
          return res.status(404).json({
            message: "Doctor profile not found",
          });
        }

        // =========================
        // EXPERIENCE
        // =========================

        if (experience !== undefined) {
          doctor.experience = Number(experience);
        }

        // =========================
        // LOCATION
        // =========================

        if (location !== undefined) {
          doctor.location = location;
        }

        // =========================
        // BIO
        // =========================

        if (bio !== undefined) {
          doctor.bio = bio;
        }

        // =========================
        // SPECIALTIES
        // =========================

        if (specialties !== undefined) {
          let parsedSpecialties;

          try {
            parsedSpecialties =
              typeof specialties === "string"
                ? JSON.parse(specialties)
                : specialties;
          } catch (error) {
            return res.status(400).json({
              message: "Invalid specialties format",
            });
          }

          if (
            !Array.isArray(parsedSpecialties) ||
            parsedSpecialties.length === 0 ||
            parsedSpecialties.length > 2
          ) {
            return res.status(400).json({
              message:
                "Select between one and two specialties",
            });
          }

          doctor.specialties =
            parsedSpecialties;

          // Specialiteti i parë mbetet primary
          doctor.specialty =
            parsedSpecialties[0];
        } else if (specialty !== undefined) {
          doctor.specialty = specialty;
          doctor.specialties = [specialty];
        }

        // =========================
        // PROFILE IMAGE
        // =========================

        if (req.file) {
          doctor.profileImage =
            req.file.path.replaceAll("\\", "/");
        }

        // =========================
        // SAVE
        // =========================

        await doctor.save();

        await doctor.populate(
          "user",
          "name email"
        );

        return res.status(200).json({
          message:
            "Doctor profile updated successfully",
          doctor,
        });
      } catch (error) {
        console.error(
          "Update doctor profile error:",
          error
        );

        return res.status(500).json({
          message: "Server error",
          error: error.message,
        });
      }
    };
  
  
  module.exports = {
    registerDoctor,
    getApprovedDoctors,
    updateDoctorAvailability,
    getDoctorProfile,
    updateDoctorProfile,
  };