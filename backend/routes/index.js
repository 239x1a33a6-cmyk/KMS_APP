const express = require("express");
const authRoutes = require("./authRoutes");
const resourceRoutes = require("./resourceRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const publicRoutes = require("./publicRoutes");
const utilsRoutes = require("./utilsRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/resources", resourceRoutes);
router.use("/public", publicRoutes);
router.use("/utils", utilsRoutes);

router.get("/status", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API routes are active",
    data: {
      project: "KnowledgeVault",
      phase: "Phase 10 - Complete Secure Knowledge Management Platform",
    },
  });
});

module.exports = router;
