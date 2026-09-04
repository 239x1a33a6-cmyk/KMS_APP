const express = require("express");
const {
  getPublicResourceHandler,
  getPublicResourcesHandler,
} = require("../controllers/publicController");

const router = express.Router();

router.get("/resources", getPublicResourcesHandler);
router.get("/resources/:id", getPublicResourceHandler);

module.exports = router;
