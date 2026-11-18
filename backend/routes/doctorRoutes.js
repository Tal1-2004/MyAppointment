const express = require("express");

const {
  registerDoctor,
} = require("../controllers/doctorController");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/register",

  upload.fields([
    {
      name: "cv",
      maxCount: 1,
    },
    {
      name: "diploma",
      maxCount: 1,
    },
    {
      name: "licence",
      maxCount: 1,
    },
  ]),

  registerDoctor
);

module.exports = router;