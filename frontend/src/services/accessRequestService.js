import api from "./api";

const accessRequestService = {
  requestAccess: (resourceId, message = "") =>
    api.post(`/resources/${resourceId}/request-access`, { message }),
  getIncoming: () => api.get("/resources/requests/incoming"),
  getMine: () => api.get("/resources/requests/mine"),
  decide: (requestId, status) =>
    api.patch(`/resources/requests/${requestId}`, { status }),
};

export default accessRequestService;
