const express = require("express");
const { protect, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const s3 = require("../config/s3");
const Submission = require("../models/Submission");

const router = express.Router();


router.get(
  "/submissions",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const submissions = await Submission.find().populate("patient", "name email role");
      res.json(submissions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  }
);


router.get(
  "/submissions/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.id).populate("patient", "name email role");
      if (!submission) return res.status(404).json({ message: "Submission not found" });
      res.json(submission);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  }
);


router.put(
  "/submissions/:id/annotate",
  protect,
  authorize("admin"),
  upload.single("annotatedImage"), 
  async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.id);
      if (!submission) return res.status(404).json({ message: "Submission not found" });

      let annotatedImageUrl;

      if (req.file) {
        const s3Params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `annotations/${Date.now()}-${req.file.originalname}`,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };
        const s3Data = await s3.upload(s3Params).promise();
        annotatedImageUrl = s3Data.Location;
      }

      // Annotation: Yet to be tested
      submission.annotationJson = req.body.annotationJson ? JSON.parse(req.body.annotationJson) : submission.annotationJson;
      if (annotatedImageUrl) submission.annotatedImageUrl = annotatedImageUrl;
      submission.status = "annotated";
      submission.updatedAt = Date.now();

      await submission.save();

      res.json({
        message: "Annotation saved successfully",
        submission,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to save annotation" });
    }
  }
);

module.exports = router;
