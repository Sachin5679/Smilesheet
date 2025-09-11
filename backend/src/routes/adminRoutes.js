const express = require("express");
const { protect, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const s3 = require("../config/s3");
const Submission = require("../models/Submission");

const router = express.Router();

router.get("/submissions", protect, authorize("admin"), async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("patient", "name email role");

    const submissionsWithUrls = submissions.map((sub) => {
      const s = sub.toObject();

      if (s.originalImageUrl) {
        const key = decodeURIComponent(new URL(s.originalImageUrl).pathname.substring(1));
        s.originalImageUrl = s3.getSignedUrl("getObject", {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Expires: 300,
        });
      }

      if (s.annotatedImageUrl) {
        const key = decodeURIComponent(new URL(s.annotatedImageUrl).pathname.substring(1));
        s.annotatedImageUrl = s3.getSignedUrl("getObject", {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Expires: 300,
        });
      }

      return s;
    });

    res.json(submissionsWithUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});

router.get("/submissions/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("patient", "name email role");

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const s = submission.toObject();

    if (s.originalImageUrl) {
      const key = decodeURIComponent(new URL(s.originalImageUrl).pathname.substring(1));
      s.originalImageUrl = s3.getSignedUrl("getObject", {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Expires: 300,
      });
    }

    if (s.annotatedImageUrl) {
      const key = decodeURIComponent(new URL(s.annotatedImageUrl).pathname.substring(1));
      s.annotatedImageUrl = s3.getSignedUrl("getObject", {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Expires: 300,
      });
    }

    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch submission" });
  }
});

router.put("/submissions/:id/annotate", protect, authorize("admin"), upload.single("annotatedImage"), async (req, res) => {
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

    submission.annotationJson = req.body.annotationJson ? JSON.parse(req.body.annotationJson) : submission.annotationJson;
    if (annotatedImageUrl) submission.annotatedImageUrl = annotatedImageUrl;
    submission.status = "annotated";
    submission.updatedAt = Date.now();

    await submission.save();

    const s = submission.toObject();
    if (s.originalImageUrl) {
      const key = decodeURIComponent(new URL(s.originalImageUrl).pathname.substring(1));
      s.originalImageUrl = s3.getSignedUrl("getObject", { Bucket: process.env.AWS_BUCKET_NAME, Key: key, Expires: 300 });
    }
    if (s.annotatedImageUrl) {
      const key = decodeURIComponent(new URL(s.annotatedImageUrl).pathname.substring(1));
      s.annotatedImageUrl = s3.getSignedUrl("getObject", { Bucket: process.env.AWS_BUCKET_NAME, Key: key, Expires: 300 });
    }

    res.json({ message: "Annotation saved successfully", submission: s });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save annotation" });
  }
});

module.exports = router;
