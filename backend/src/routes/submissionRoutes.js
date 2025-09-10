const express = require("express");
const { protect, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const s3 = require("../config/s3");
const Submission = require("../models/Submission");

const router = express.Router();

router.post(
  "/upload",
  protect,
  authorize("patient"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file required" });
      }

      const s3Params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `submissions/${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const s3Data = await s3.upload(s3Params).promise();

      const submission = new Submission({
        patient: req.user._id,
        patientId: req.body.patientId,
        email: req.body.email,
        note: req.body.note,
        originalImageUrl: s3Data.Location,
      });

      await submission.save();

      res.status(201).json({
        message: "Submission uploaded successfully",
        submission,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

module.exports = router;
