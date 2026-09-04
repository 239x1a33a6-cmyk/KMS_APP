import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import resourceService from "../services/resourceService";
import ResourceInsights from "../components/ResourceInsights";
import LinkPreviewCard from "../components/LinkPreviewCard";

const ResourceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResource = async () => {
    try {
      const response = await resourceService.getById(id);
      setResource(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load resource details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      await resourceService.remove(id);
      navigate("/resources");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete resource.");
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <p className="text-uppercase text-secondary fw-semibold mb-1">
            Resource
          </p>
          <h2 className="mb-0">{resource.title}</h2>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/resources/${id}/edit`} className="btn btn-dark btn-sm">
            Edit
          </Link>
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          {/* Badges */}
          <div className="mb-3">
            <span className="badge text-bg-secondary me-2">
              {resource.type}
            </span>
            <span className="badge text-bg-light me-2">
              {resource.category || "Other"}
            </span>
            <span className="badge text-bg-light">{resource.visibility}</span>
          </div>

          {/* ── NEW: Insights chips ── */}
          <ResourceInsights content={resource.content} type={resource.type} />

          <p className="text-secondary mt-2">
            {resource.description || "No description provided."}
          </p>

          {resource.tags?.length > 0 && (
            <div className="mb-3">
              {resource.tags.map((tag) => (
                <span key={tag} className="badge text-bg-light me-2">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ── NEW: Link preview card for LINK-type resources ── */}
          {resource.type === "LINK" && resource.url && (
            <div className="mb-3">
              <LinkPreviewCard url={resource.url} />
            </div>
          )}

          {resource.type === "CODE" && resource.language && (
            <div className="mb-3">
              <small className="text-secondary">
                Language: {resource.language}
              </small>
            </div>
          )}

          {resource.content && (
            <pre
              className="bg-light p-3 border rounded mb-0"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {resource.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailsPage;
