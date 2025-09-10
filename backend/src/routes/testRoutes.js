const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Hello Admin!", user: req.user });
});

router.get("/all-users", protect, authorize("admin", "patient"), (req, res) => {
  res.json({ message: "Hello Authenticated User!", user: req.user });
});

module.exports = router;
