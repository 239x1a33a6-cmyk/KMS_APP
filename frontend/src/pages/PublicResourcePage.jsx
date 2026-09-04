import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import accessRequestService from "../services/accessRequestService";
import resourceService from "../services/resourceService";

const PublicResourcePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [notice, setNotice] = useState("");

  const fetchResource = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getPublic(id);
      setResource(response.data?.data || null);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load this public resource.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [id]);

  const handleRequestAccess = async () => {
    if (!user) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }

    setRequesting(true);
    setNotice("");

    try {
      const response = await accessRequestService.requestAccess(id, "");
      setNotice(response.data?.message || "Access request sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send access request.");
    } finally {
      setRequesting(false);
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

  if (error || !resource) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning border-0 rounded-4 shadow-sm">
          {error || "This resource is not available publicly."}
        </div>
      </div>
    );
  }

  const isOwner = user && String(resource.createdBy) === String(user._id);

  return (
    <div className="container py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm resource-hero-card">
            <div className="card-body p-4 p-lg-5">
              <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
                <span className="badge rounded-pill text-bg-dark">
                  Public note
                </span>
                <span className="badge rounded-pill text-bg-light text-dark">
                  {resource.type}
                </span>
              </div>

              <h1 className="mb-3 resource-title">{resource.title}</h1>

              <div className="d-flex flex-wrap gap-3 text-secondary mb-3 small">
                <span>
                  Owner: {resource.createdBy?.name || "KnowledgeVault member"}
                </span>
                <span>{resource.category || "General"}</span>
              </div>

              <p className="lead text-secondary mb-4">
                {resource.description || "No description provided."}
              </p>

              {resource.tags?.length > 0 && (
                <div className="mb-4">
                  {resource.tags.map((tag) => (
                    <span
                      className="badge rounded-pill text-bg-light me-2 mb-2"
                      key={tag}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {!isOwner && (
                <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                  <button
                    type="button"
                    className="btn btn-dark px-4"
                    onClick={handleRequestAccess}
                    disabled={requesting}
                  >
                    {requesting ? "Sending request..." : "Request access"}
                  </button>
                  {!user && (
                    <Link to="/login" className="btn btn-outline-dark">
                      Login to continue
                    </Link>
                  )}
                </div>
              )}

              {notice && (
                <div className="alert alert-success border-0 rounded-4 mb-3">
                  {notice}
                </div>
              )}

              {(resource.type === "LINK" || resource.url) && resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-dark mb-4"
                >
                  Open source link
                </a>
              )}

              {resource.content && (
                <pre className="resource-content">{resource.content}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicResourcePage;
