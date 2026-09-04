const AccessRequest = require("../models/AccessRequest");
const Resource = require("../models/Resource");

const normalizeAccessRequestDecision = (status) => {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (value === "approved") {
    return "APPROVED";
  }

  if (value === "rejected") {
    return "REJECTED";
  }

  return "PENDING";
};

const requestAccessToResource = async ({
  userId,
  resourceId,
  message = "",
}) => {
  const resource = await Resource.findOne({
    _id: resourceId,
    visibility: "PUBLIC",
    isDeleted: false,
    isArchived: false,
  }).lean();

  if (!resource) {
    throw new Error("Resource not found or not available for public request.");
  }

  if (String(resource.createdBy) === String(userId)) {
    throw new Error("You already own this resource.");
  }

  const existingRequest = await AccessRequest.findOne({
    resource: resourceId,
    requester: userId,
  }).sort({ createdAt: -1 });

  if (existingRequest) {
    return {
      request: existingRequest,
      created: false,
    };
  }

  const request = await AccessRequest.create({
    resource: resourceId,
    requester: userId,
    owner: resource.createdBy,
    message: String(message || "")
      .trim()
      .slice(0, 500),
    status: "PENDING",
  });

  return {
    request,
    created: true,
  };
};

const getRequestsForOwner = async ({ ownerId }) => {
  return AccessRequest.find({ owner: ownerId })
    .populate("requester", "name email")
    .populate("resource", "title type category description")
    .sort({ createdAt: -1 })
    .lean();
};

const getRequestsByRequester = async ({ userId }) => {
  return AccessRequest.find({ requester: userId })
    .populate("owner", "name email")
    .populate("resource", "title type category description")
    .sort({ createdAt: -1 })
    .lean();
};

const resolveAccessRequest = async ({ ownerId, requestId, status }) => {
  const normalizedStatus = normalizeAccessRequestDecision(status);

  if (normalizedStatus === "PENDING") {
    throw new Error("Decision must be approved or rejected.");
  }

  const request = await AccessRequest.findOne({
    _id: requestId,
    owner: ownerId,
  });

  if (!request) {
    throw new Error("Access request not found.");
  }

  request.status = normalizedStatus;
  request.reviewedBy = ownerId;
  request.reviewedAt = new Date();

  await request.save();

  return request;
};

module.exports = {
  normalizeAccessRequestDecision,
  requestAccessToResource,
  getRequestsForOwner,
  getRequestsByRequester,
  resolveAccessRequest,
};
