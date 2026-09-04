const Resource = require("../models/Resource");

const ALLOWED_SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  updated: { updatedAt: -1 },
  alphabetical: { title: 1 },
  recentlyViewed: { lastViewedAt: -1 },
  mostViewed: { viewCount: -1 },
};

const normalizeTags = (tags) =>
  Array.isArray(tags)
    ? tags.map((tag) => String(tag).trim()).filter(Boolean)
    : [];

const buildResourceQuery = ({
  userId,
  search,
  type,
  category,
  tag,
  favorite,
  archived,
  deleted,
  visibility,
}) => {
  const query = { createdBy: userId };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  if (type) query.type = type;
  if (category) query.category = category;
  if (tag) query.tags = { $in: [new RegExp(`^${tag}$`, "i")] };
  if (favorite !== undefined)
    query.isFavorite = favorite === "true" || favorite === true;
  if (archived !== undefined)
    query.isArchived = archived === "true" || archived === true;
  if (deleted !== undefined)
    query.isDeleted = deleted === "true" || deleted === true;
  if (visibility) query.visibility = visibility;

  if (search && !query.$or) {
    delete query.$or;
  }

  return query;
};

const createResource = async ({ userId, payload }) => {
  const resourceData = {
    ...payload,
    createdBy: userId,
    tags: normalizeTags(payload.tags),
  };

  return Resource.create(resourceData);
};

const getUserResources = async ({
  userId,
  search,
  type,
  category,
  tag,
  favorite,
  archived,
  deleted,
  visibility,
  sort = "newest",
  page = 1,
  limit = 10,
}) => {
  const query = buildResourceQuery({
    userId,
    search,
    type,
    category,
    tag,
    favorite,
    archived,
    deleted,
    visibility,
  });

  if (query.isDeleted === undefined) {
    query.isDeleted = false;
  }
  if (query.isArchived === undefined && archived === undefined) {
    query.isArchived = false;
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (safePage - 1) * safeLimit;
  const sortOptions = ALLOWED_SORTS[sort] || ALLOWED_SORTS.newest;

  const [items, total] = await Promise.all([
    Resource.find(query).sort(sortOptions).skip(skip).limit(safeLimit).lean(),
    Resource.countDocuments(query),
  ]);

  return {
    data: items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
      hasNextPage: safePage < Math.ceil(total / safeLimit),
      hasPreviousPage: safePage > 1,
    },
  };
};

const getOwnedResourceById = async ({ userId, id }) => {
  const resource = await Resource.findOne({
    _id: id,
    createdBy: userId,
    isDeleted: false,
  });
  if (!resource) return null;

  resource.lastViewedAt = new Date();
  resource.viewCount = (resource.viewCount || 0) + 1;
  await resource.save();

  return resource;
};

const getOwnedResourceForUpdate = async ({ userId, id }) => {
  return Resource.findOne({ _id: id, createdBy: userId });
};

const updateResource = async ({ userId, id, payload }) => {
  const resource = await getOwnedResourceForUpdate({ userId, id });
  if (!resource) return null;

  const allowedFields = [
    "title",
    "description",
    "content",
    "type",
    "category",
    "tags",
    "url",
    "language",
    "visibility",
  ];

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      resource[field] =
        field === "tags" ? normalizeTags(payload.tags) : payload[field];
    }
  }

  return resource.save();
};

const deleteResource = async ({ userId, id }) => {
  const resource = await getOwnedResourceForUpdate({ userId, id });
  if (!resource) return null;

  resource.isDeleted = true;
  resource.deletedAt = new Date();
  resource.isArchived = false;
  return resource.save();
};

const toggleFavorite = async ({ userId, id, isFavorite }) => {
  const resource = await getOwnedResourceForUpdate({ userId, id });
  if (!resource) return null;

  resource.isFavorite = Boolean(isFavorite);
  return resource.save();
};

const toggleArchive = async ({ userId, id, isArchived }) => {
  const resource = await getOwnedResourceForUpdate({ userId, id });
  if (!resource) return null;

  resource.isArchived = Boolean(isArchived);
  resource.archivedAt = isArchived ? new Date() : null;
  if (!isArchived) {
    resource.isDeleted = false;
    resource.deletedAt = null;
  }
  return resource.save();
};

const restoreResource = async ({ userId, id }) => {
  const resource = await getOwnedResourceForUpdate({ userId, id });
  if (!resource || !resource.isDeleted) return null;

  resource.isDeleted = false;
  resource.deletedAt = null;
  return resource.save();
};

const permanentDeleteResource = async ({ userId, id }) => {
  const resource = await getOwnedResourceForUpdate({ userId, id });
  if (!resource || !resource.isDeleted) return null;

  await Resource.deleteOne({ _id: id, createdBy: userId });
  return resource;
};

const getPublicResourceById = async ({ id }) => {
  return Resource.findOne({
    _id: id,
    visibility: "PUBLIC",
    isDeleted: false,
    isArchived: false,
  }).lean();
};

const getPublicResources = async ({
  search,
  type,
  page = 1,
  limit = 12,
} = {}) => {
  const query = {
    visibility: "PUBLIC",
    isDeleted: false,
    isArchived: false,
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  if (type) query.type = type;

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("createdBy", "name email")
      .lean(),
    Resource.countDocuments(query),
  ]);

  return {
    data: items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
      hasNextPage: safePage < Math.ceil(total / safeLimit),
      hasPreviousPage: safePage > 1,
    },
  };
};

const getResourcesByState = async ({ userId, state, page = 1, limit = 10 }) => {
  const activeQuery = {
    createdBy: userId,
    isDeleted: state === "trash",
    isArchived: state === "archived",
    isFavorite: state === "favorites",
  };

  if (state === "active") {
    activeQuery.isDeleted = false;
    activeQuery.isArchived = false;
  }

  const query = { createdBy: userId };

  if (state === "trash") {
    query.isDeleted = true;
  } else if (state === "archived") {
    query.isDeleted = false;
    query.isArchived = true;
  } else if (state === "favorites") {
    query.isDeleted = false;
    query.isFavorite = true;
  } else {
    query.isDeleted = false;
    query.isArchived = false;
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Resource.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Resource.countDocuments(query),
  ]);

  return {
    data: items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
      hasNextPage: safePage < Math.ceil(total / safeLimit),
      hasPreviousPage: safePage > 1,
    },
  };
};

module.exports = {
  createResource,
  getUserResources,
  getOwnedResourceById,
  getOwnedResourceForUpdate,
  updateResource,
  deleteResource,
  toggleFavorite,
  toggleArchive,
  restoreResource,
  permanentDeleteResource,
  getPublicResourceById,
  getPublicResources,
  getResourcesByState,
};
