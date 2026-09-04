const mongoose = require("mongoose");
const Resource = require("../models/Resource");

const toObjectId = (id) =>
  id instanceof mongoose.Types.ObjectId
    ? id
    : new mongoose.Types.ObjectId(id.toString());

const toLookupMap = (items) => {
  return items.reduce((acc, item) => {
    const key = item._id || "Other";
    acc[key] = item.count;
    return acc;
  }, {});
};

const getDashboardData = async (userId) => {
  const uid = toObjectId(userId);
  const [
    totalResources,
    activeResources,
    archivedResources,
    deletedResources,
    favoriteResources,
    totalViews,
    byCategory,
    byType,
    recentResources,
    recentlyViewed,
  ] = await Promise.all([
    Resource.countDocuments({ createdBy: uid }),
    Resource.countDocuments({
      createdBy: uid,
      isDeleted: false,
      isArchived: false,
    }),
    Resource.countDocuments({
      createdBy: uid,
      isDeleted: false,
      isArchived: true,
    }),
    Resource.countDocuments({ createdBy: uid, isDeleted: true }),
    Resource.countDocuments({
      createdBy: uid,
      isFavorite: true,
      isDeleted: false,
    }),
    Resource.aggregate([
      { $match: { createdBy: uid } },
      { $group: { _id: null, total: { $sum: "$viewCount" } } },
    ]),
    Resource.aggregate([
      { $match: { createdBy: uid, isDeleted: false } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Resource.aggregate([
      { $match: { createdBy: userId, isDeleted: false } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Resource.find({ createdBy: userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Resource.find({
      createdBy: userId,
      lastViewedAt: { $ne: null },
      isDeleted: false,
    })
      .sort({ lastViewedAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    totalResources,
    activeResources,
    archivedResources,
    deletedResources,
    favoriteResources,
    totalViews: totalViews[0]?.total || 0,
    resourcesByCategory: toLookupMap(byCategory),
    resourcesByType: toLookupMap(byType),
    recentResources,
    recentlyViewed,
  };
};

module.exports = {
  getDashboardData,
};
