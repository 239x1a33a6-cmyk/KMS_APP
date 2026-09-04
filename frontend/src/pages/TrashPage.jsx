import { useEffect, useState } from "react";
import resourceService from "../services/resourceService";

const TrashPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getTrash();
      setResources(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load trash");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await resourceService.restore(id);
      fetchTrash();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to restore resource.");
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm("This will permanently delete the resource. Continue?"))
      return;

    try {
      await resourceService.permanentDelete(id);
      fetchTrash();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to permanently delete resource.",
      );
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <p className="text-uppercase text-secondary fw-semibold mb-1">
            Trash
          </p>
          <h2 className="mb-0">Deleted Resources</h2>
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
            Trash is empty.
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
                    <span className="badge text-bg-dark">Deleted</span>
                  </div>
                  <p className="text-secondary mb-3">
                    {resource.description || "No description provided."}
                  </p>
                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-dark btn-sm flex-fill"
                      onClick={() => handleRestore(resource._id)}
                    >
                      Restore
                    </button>
                    <button
                      className="btn btn-outline-dark btn-sm flex-fill"
                      onClick={() => handlePermanentDelete(resource._id)}
                    >
                      Delete
                    </button>
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

export default TrashPage;
