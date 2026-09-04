import api from "./api";

const utilsService = {
  // Spotlight search: returns top 8 resources matching query
  search: (q) => api.get("/utils/search", { params: { q } }),

  // Fetch Open Graph metadata for a URL
  getLinkPreview: (url) => api.get("/utils/link-preview", { params: { url } }),

  // Check for similar titles (duplicate detection)
  getSimilarTitles: (title) =>
    api.get("/utils/similar-title", { params: { title } }),
};

export default utilsService;
