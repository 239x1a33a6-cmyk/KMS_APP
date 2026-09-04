const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  spotlightSearchHandler,
  linkPreviewHandler,
  similarTitleHandler,
} = require("../controllers/utilsController");

const router = express.Router();

router.use(authMiddleware);

// GET /api/utils/search?q=...           → Spotlight search (top 8 results)
router.get("/search", spotlightSearchHandler);

// GET /api/utils/link-preview?url=...   → Fetch OG metadata for a URL
router.get("/link-preview", linkPreviewHandler);

// GET /api/utils/similar-title?title=.. → Duplicate detection
router.get("/similar-title", similarTitleHandler);

module.exports = router;
