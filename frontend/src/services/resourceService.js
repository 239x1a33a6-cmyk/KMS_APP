import api from "./api";

const resourceService = {
  getAll: (params = {}) => api.get("/resources", { params }),
  getFavorites: (params = {}) => api.get("/resources/favorites", { params }),
  getArchived: (params = {}) => api.get("/resources/archived", { params }),
  getTrash: (params = {}) => api.get("/resources/trash", { params }),
  getById: (id) => api.get(`/resources/${id}`),
  getPublic: (id) => api.get(`/public/resources/${id}`),
  create: (payload) => api.post("/resources", payload),
  update: (id, payload) => api.put(`/resources/${id}`, payload),
  remove: (id) => api.delete(`/resources/${id}`),
  toggleFavorite: (id, isFavorite) =>
    api.post(`/resources/${id}/favorite`, { isFavorite }),
  toggleArchive: (id, isArchived) =>
    api.post(`/resources/${id}/archive`, { isArchived }),
  restore: (id) => api.post(`/resources/${id}/restore`),
  permanentDelete: (id) => api.delete(`/resources/${id}/permanent`),
};

export default resourceService;
