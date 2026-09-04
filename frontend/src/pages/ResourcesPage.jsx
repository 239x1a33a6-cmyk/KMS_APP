import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import resourceService from "../services/resourceService";

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (typeFilter) params.type = typeFilter;
      if (visibilityFilter) params.visibility = visibilityFilter;
      if (sortBy) params.sort = sortBy;

      const response = await resourceService.getAll(params);
      setResources(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load resources");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, visibilityFilter, sortBy]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const overviewStats = useMemo(
    () => [
      {
        label: "Active",
        value: resources.filter((item) => !item.isArchived && !item.isDeleted)
          .length,
      },
      {
        label: "Favorites",
        value: resources.filter((item) => item.isFavorite).length,
      },
      {
        label: "Public",
        value: resources.filter((item) => item.visibility === "PUBLIC").length,
      },
      {
        label: "Views",
        value: resources.reduce(
          (total, item) => total + (item.viewCount || 0),
          0,
        ),
      },
    ],
    [resources],
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <p className="text-uppercase text-secondary fw-semibold mb-1">
            Resources
          </p>
          <h2 className="mb-0">My Knowledge Base</h2>
        </div>
        <Link to="/resources/new" className="btn btn-dark">
          + Create Resource
        </Link>
      </div>

      <div className="row g-3 mb-4">
        {overviewStats.map((stat) => (
          <div className="col-md-3" key={stat.label}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-secondary mb-1">{stat.label}</p>
                <h4 className="mb-0">{stat.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label">Search</label>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="form-control"
                placeholder="Search title, notes, tags..."
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Type</label>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="form-select"
              >
                <option value="">All</option>
                <option value="NOTE">NOTE</option>
                <option value="ARTICLE">ARTICLE</option>
                <option value="LINK">LINK</option>
                <option value="CODE">CODE</option>
                <option value="DOCUMENT">DOCUMENT</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Visibility</label>
              <select
                value={visibilityFilter}
                onChange={(event) => setVisibilityFilter(event.target.value)}
                className="form-select"
              >
                <option value="">All</option>
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Sort</label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="form-select"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="alphabetical">A-Z</option>
                <option value="mostViewed">Most viewed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5 text-secondary">
            No resources found. Create your first one to get started.
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {resources.map((resource) => (
            <div className="col-md-6 col-xl-4" key={resource._id}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <h5 className="mb-0">{resource.title}</h5>
                    <span className="badge text-bg-light">{resource.type}</span>
                  </div>
                  <p className="text-secondary mb-2">
                    {resource.description || "No description provided."}
                  </p>
                  <div className="mb-2">
                    <span className="badge text-bg-secondary me-1">
                      {resource.category || "Other"}
                    </span>
                    {resource.visibility === "PUBLIC" && (
                      <span className="badge text-bg-success me-1">Public</span>
                    )}
                    {resource.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge text-bg-light me-1">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto d-flex gap-2">
                    <Link
                      to={`/resources/${resource._id}`}
                      className="btn btn-outline-dark btn-sm flex-fill"
                    >
                      View
                    </Link>
                    <Link
                      to={`/resources/${resource._id}/edit`}
                      className="btn btn-dark btn-sm flex-fill"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
