import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import resourceService from "../services/resourceService";

const ArchivedPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchArchived = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getArchived();
      setResources(response.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load archived resources.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <p className="text-uppercase text-secondary fw-semibold mb-1">
            Archive
          </p>
          <h2 className="mb-0">Archived Resources</h2>
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
            No archived resources.
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {resources.map((resource) => (
            <div className="col-md-6 col-xl-4" key={resource._id}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <h5 className="mb-0">{resource.title}</h5>
                    <span className="badge text-bg-secondary">Archived</span>
                  </div>
                  <p className="text-secondary mb-3">
                    {resource.description || "No description provided."}
                  </p>
                  <Link
                    to={`/resources/${resource._id}`}
                    className="btn btn-outline-dark btn-sm w-100"
                  >
                    Open
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedPage;
