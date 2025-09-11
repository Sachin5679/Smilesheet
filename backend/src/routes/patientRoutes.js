const express = require("express");
const { protect, authorize } = require("../middlewares/authMiddleware");
const Submission = require("../models/Submission");
const AWS = require("aws-sdk");

const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

router.get("/submissions", protect, authorize("patient"), async (req, res) => {
  try {
    const submissions = await Submission.find({ patient: req.user._id }).sort({ createdAt: -1 });

    const submissionsWithUrls = submissions.map((sub) => {
      const s = sub.toObject();

      if (s.originalImageUrl) {
        const key = decodeURIComponent(new URL(s.originalImageUrl).pathname.substring(1));
        s.originalImageUrl = s3.getSignedUrl("getObject", { Bucket: process.env.AWS_BUCKET_NAME, Key: key, Expires: 300 });
      }

      if (s.annotatedImageUrl) {
        const key = decodeURIComponent(new URL(s.annotatedImageUrl).pathname.substring(1));
        s.annotatedImageUrl = s3.getSignedUrl("getObject", { Bucket: process.env.AWS_BUCKET_NAME, Key: key, Expires: 300 });
      }

      return s;
    });

    res.json(submissionsWithUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});

router.get("/submissions/:id", protect, authorize("patient"), async (req, res) => {
  try {
    const submission = await Submission.findOne({ _id: req.params.id, patient: req.user._id });
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const s = submission.toObject();

    if (s.originalImageUrl) {
      const key = decodeURIComponent(new URL(s.originalImageUrl).pathname.substring(1));
      s.originalImageUrl = s3.getSignedUrl("getObject", { Bucket: process.env.AWS_BUCKET_NAME, Key: key, Expires: 300 });
    }

    if (s.annotatedImageUrl) {
      const key = decodeURIComponent(new URL(s.annotatedImageUrl).pathname.substring(1));
      s.annotatedImageUrl = s3.getSignedUrl("getObject", { Bucket: process.env.AWS_BUCKET_NAME, Key: key, Expires: 300 });
    }

    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch submission" });
  }
});

router.get("/submissions/:id/report", protect, authorize("patient"), async (req, res) => {
  try {
    const submission = await Submission.findOne({ _id: req.params.id, patient: req.user._id });
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (!submission.reportUrl) return res.status(404).json({ message: "Report not yet generated" });

    const key = decodeURIComponent(new URL(submission.reportUrl).pathname.substring(1));
    const signedUrl = s3.getSignedUrl("getObject", { Bucket: process.env.AWS_BUCKET_NAME, Key: key, Expires: 300 });

    res.json({ message: "Report ready for download", downloadUrl: signedUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate download link" });
  }
});

module.exports = router;
