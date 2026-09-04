const {
  createResource,
  getUserResources,
  getOwnedResourceById,
  updateResource,
  deleteResource,
  toggleFavorite,
  toggleArchive,
  restoreResource,
  permanentDeleteResource,
  getResourcesByState,
} = require("../services/resourceService");

const createResourceHandler = async (req, res, next) => {
  try {
    const resource = await createResource({
      userId: req.user.id,
      payload: req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    return next(error);
  }
};

const getResourcesHandler = async (req, res, next) => {
  try {
    const result = await getUserResources({
      userId: req.user.id,
      search: req.query.search,
      type: req.query.type,
      category: req.query.category,
      tag: req.query.tag,
      favorite: req.query.favorite,
      archived: req.query.archived,
      deleted: req.query.deleted,
      visibility: req.query.visibility,
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const getResourceHandler = async (req, res, next) => {
  try {
    const resource = await getOwnedResourceById({
      userId: req.user.id,
      id: req.params.id,
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    return next(error);
  }
};

const updateResourceHandler = async (req, res, next) => {
  try {
    const resource = await updateResource({
      userId: req.user.id,
      id: req.params.id,
      payload: req.body,
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: resource,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteResourceHandler = async (req, res, next) => {
  try {
    const resource = await deleteResource({
      userId: req.user.id,
      id: req.params.id,
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resource moved to trash",
      data: resource,
    });
  } catch (error) {
    return next(error);
  }
};

const getFavoriteResourcesHandler = async (req, res, next) => {
  try {
    const result = await getResourcesByState({
      userId: req.user.id,
      state: "favorites",
      page: req.query.page,
      limit: req.query.limit,
    });
    return res
      .status(200)
      .json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
  } catch (error) {
    return next(error);
  }
};

const getArchivedResourcesHandler = async (req, res, next) => {
  try {
    const result = await getResourcesByState({
      userId: req.user.id,
      state: "archived",
      page: req.query.page,
      limit: req.query.limit,
    });
    return res
      .status(200)
      .json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
  } catch (error) {
    return next(error);
  }
};

const getTrashResourcesHandler = async (req, res, next) => {
  try {
    const result = await getResourcesByState({
      userId: req.user.id,
      state: "trash",
      page: req.query.page,
      limit: req.query.limit,
    });
    return res
      .status(200)
      .json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
  } catch (error) {
    return next(error);
  }
};

const toggleFavoriteHandler = async (req, res, next) => {
  try {
    const resource = await toggleFavorite({
      userId: req.user.id,
      id: req.params.id,
      isFavorite: req.body.isFavorite,
    });

    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Favorite updated", data: resource });
  } catch (error) {
    return next(error);
  }
};

const toggleArchiveHandler = async (req, res, next) => {
  try {
    const resource = await toggleArchive({
      userId: req.user.id,
      id: req.params.id,
      isArchived: req.body.isArchived,
    });

    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Archive updated", data: resource });
  } catch (error) {
    return next(error);
  }
};

const restoreResourceHandler = async (req, res, next) => {
  try {
    const resource = await restoreResource({
      userId: req.user.id,
      id: req.params.id,
    });

    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Deleted resource not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Resource restored", data: resource });
  } catch (error) {
    return next(error);
  }
};

const permanentDeleteResourceHandler = async (req, res, next) => {
  try {
    const resource = await permanentDeleteResource({
      userId: req.user.id,
      id: req.params.id,
    });

    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Resource permanently deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
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
};
