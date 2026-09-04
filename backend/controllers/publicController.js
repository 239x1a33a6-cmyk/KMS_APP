const {
  getPublicResourceById,
  getPublicResources,
} = require("../services/resourceService");

const getPublicResourcesHandler = async (req, res, next) => {
  try {
    const resources = await getPublicResources({
      search: req.query.search,
      type: req.query.type,
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.status(200).json({
      success: true,
      data: resources.data,
      pagination: resources.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const getPublicResourceHandler = async (req, res, next) => {
  try {
    const resource = await getPublicResourceById({ id: req.params.id });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found or not public",
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

module.exports = {
  getPublicResourcesHandler,
  getPublicResourceHandler,
};
