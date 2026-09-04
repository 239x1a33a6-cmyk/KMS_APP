const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["NOTE", "ARTICLE", "LINK", "CODE", "DOCUMENT"],
      required: true,
      default: "NOTE",
    },
    category: {
      type: String,
      default: "Other",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          const seen = new Set();
          for (const tag of value) {
            const normalized = tag.trim().toLowerCase();
            if (!normalized || seen.has(normalized)) {
              return false;
            }
            seen.add(normalized);
          }
          return true;
        },
        message: "Tags must be unique and cannot be empty.",
      },
    },
    url: {
      type: String,
      default: "",
      trim: true,
    },
    language: {
      type: String,
      default: "",
      trim: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ["PRIVATE", "PUBLIC"],
      default: "PRIVATE",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    lastViewedAt: {
      type: Date,
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

resourceSchema.index({ createdBy: 1, isDeleted: 1 });
resourceSchema.index({ createdBy: 1, isArchived: 1 });
resourceSchema.index({ createdBy: 1, isFavorite: 1 });
resourceSchema.index({ createdBy: 1, category: 1 });
resourceSchema.index({ createdBy: 1, type: 1 });
resourceSchema.index(
  {
    title: "text",
    description: "text",
    content: "text",
    category: "text",
    tags: "text",
  },
  {
    default_language: "english",
    language_override: "resourceLang",
    name: "resource_search_index",
  },
);

module.exports = mongoose.model("Resource", resourceSchema);
