const {
  requestAccessToResource,
  getRequestsForOwner,
  getRequestsByRequester,
  resolveAccessRequest,
} = require("../services/accessRequestService");

const requestAccessHandler = async (req, res, next) => {
  try {
    const result = await requestAccessToResource({
      userId: req.user.id,
      resourceId: req.params.id,
      message: req.body?.message,
    });

    if (!result.created) {
      return res.status(200).json({
        success: true,
        message: "You already sent a request for this resource.",
        data: result.request,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Access request sent to the owner.",
      data: result.request,
    });
  } catch (error) {
    return next(error);
  }
};

const getIncomingRequestsHandler = async (req, res, next) => {
  try {
    const requests = await getRequestsForOwner({ ownerId: req.user.id });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return next(error);
  }
};

const getMyRequestsHandler = async (req, res, next) => {
  try {
    const requests = await getRequestsByRequester({ userId: req.user.id });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return next(error);
  }
};

const updateAccessRequestHandler = async (req, res, next) => {
  try {
    const request = await resolveAccessRequest({
      ownerId: req.user.id,
      requestId: req.params.requestId,
      status: req.body?.status,
    });

    return res.status(200).json({
      success: true,
      message: `Request ${request.status.toLowerCase()}.`,
      data: request,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requestAccessHandler,
  getIncomingRequestsHandler,
  getMyRequestsHandler,
  updateAccessRequestHandler,
};
