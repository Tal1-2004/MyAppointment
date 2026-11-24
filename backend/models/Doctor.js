const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    specialty: {
        type: String,
        required: true,
        trim: true,
      },

      specialties: {
        type: [
          {
            type: String,
            trim: true,
          },
        ],
        default: [],
        validate: {
          validator: function (value) {
            return value.length <= 2;
          },
          message:
            "A doctor can have a maximum of two specialties",
        },
      },

    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },

    appointmentDuration: {
      type: Number,
      enum: [15, 30, 45, 60],
      default: 30,
    },

    availability: {
      monday: {
        enabled: {
          type: Boolean,
          default: false,
        },
        periods: {
          type: [
            {
              startTime: {
                type: String,
                default: "",
              },
              endTime: {
                type: String,
                default: "",
              },
            },
          ],
          default: [],
        },
      },

      tuesday: {
        enabled: {
          type: Boolean,
          default: false,
        },
        periods: {
          type: [
            {
              startTime: {
                type: String,
                default: "",
              },
              endTime: {
                type: String,
                default: "",
              },
            },
          ],
          default: [],
        },
      },

      wednesday: {
        enabled: {
          type: Boolean,
          default: false,
        },
        periods: {
          type: [
            {
              startTime: {
                type: String,
                default: "",
              },
              endTime: {
                type: String,
                default: "",
              },
            },
          ],
          default: [],
        },
      },

      thursday: {
        enabled: {
          type: Boolean,
          default: false,
        },
        periods: {
          type: [
            {
              startTime: {
                type: String,
                default: "",
              },
              endTime: {
                type: String,
                default: "",
              },
            },
          ],
          default: [],
        },
      },

      friday: {
        enabled: {
          type: Boolean,
          default: false,
        },
        periods: {
          type: [
            {
              startTime: {
                type: String,
                default: "",
              },
              endTime: {
                type: String,
                default: "",
              },
            },
          ],
          default: [],
        },
      },

      saturday: {
        enabled: {
          type: Boolean,
          default: false,
        },
        periods: {
          type: [
            {
              startTime: {
                type: String,
                default: "",
              },
              endTime: {
                type: String,
                default: "",
              },
            },
          ],
          default: [],
        },
      },

      sunday: {
        enabled: {
          type: Boolean,
          default: false,
        },
        periods: {
          type: [
            {
              startTime: {
                type: String,
                default: "",
              },
              endTime: {
                type: String,
                default: "",
              },
            },
          ],
          default: [],
        },
      },
    },

    documents: {
      cv: {
        type: String,
        default: "",
      },

      diploma: {
        type: String,
        default: "",
      },

      licence: {
        type: String,
        default: "",
      },
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;