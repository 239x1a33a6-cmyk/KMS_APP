const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const {
  createResourceHandler,
  getResourcesHandler,
  getResourceHandler,
  updateResourceHandler,
  deleteResourceHandler,
  getFavoriteResourcesHandler,
  getArchivedResourcesHandler,
  getTrashResourcesHandler,
  toggleFavoriteHandler,
  toggleArchiveHandler,
  restoreResourceHandler,
  permanentDeleteResourceHandler,
} = require("../controllers/resourceController");
const {
  requestAccessHandler,
  getIncomingRequestsHandler,
  getMyRequestsHandler,
  updateAccessRequestHandler,
} = require("../controllers/accessRequestController");

const router = express.Router();

router.use(authMiddleware);

router.get("/favorites", getFavoriteResourcesHandler);
router.get("/archived", getArchivedResourcesHandler);
router.get("/trash", getTrashResourcesHandler);
router.get("/requests/incoming", getIncomingRequestsHandler);
router.get("/requests/mine", getMyRequestsHandler);
router.patch("/requests/:requestId", updateAccessRequestHandler);

router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").optional().trim(),
    body("content").optional().trim(),
    body("type")
      .isIn(["NOTE", "ARTICLE", "LINK", "CODE", "DOCUMENT"])
      .withMessage("Invalid resource type"),
    body("category").optional().trim(),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("url")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("URL must be valid"),
    body("visibility")
      .optional()
      .isIn(["PRIVATE", "PUBLIC"])
      .withMessage("Visibility must be PRIVATE or PUBLIC"),
  ],
  validationMiddleware,
  createResourceHandler,
);

router.get("/", getResourcesHandler);
router.post("/:id/request-access", requestAccessHandler);
router.get("/:id", getResourceHandler);
router.post("/:id/favorite", toggleFavoriteHandler);
router.post("/:id/archive", toggleArchiveHandler);
router.post("/:id/restore", restoreResourceHandler);
router.delete("/:id/permanent", permanentDeleteResourceHandler);
router.put(
  "/:id",
  [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty"),
    body("type")
      .optional()
      .isIn(["NOTE", "ARTICLE", "LINK", "CODE", "DOCUMENT"])
      .withMessage("Invalid resource type"),
    body("visibility")
      .optional()
      .isIn(["PRIVATE", "PUBLIC"])
      .withMessage("Visibility must be PRIVATE or PUBLIC"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("url")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("URL must be valid"),
  ],
  validationMiddleware,
  updateResourceHandler,
);
router.delete("/:id", deleteResourceHandler);

module.exports = router;
