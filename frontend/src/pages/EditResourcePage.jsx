import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import resourceService from "../services/resourceService";

const EditResourcePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    type: "NOTE",
    category: "Other",
    tags: "",
    url: "",
    language: "",
    visibility: "PRIVATE",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await resourceService.getById(id);
        const resource = response.data.data;
        setFormData({
          ...resource,
          tags: resource.tags?.join(", ") || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load resource.");
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (!payload.url || !payload.url.trim()) delete payload.url;
      if (!payload.language || !payload.language.trim())
        delete payload.language;
      if (!payload.description || !payload.description.trim())
        delete payload.description;
      if (!payload.content || !payload.content.trim()) delete payload.content;
      if (!payload.category || !payload.category.trim())
        delete payload.category;

      await resourceService.update(id, payload);
      navigate(`/resources/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update resource.");
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

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h2 className="mb-3">Edit Resource</h2>
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="NOTE">NOTE</option>
                  <option value="ARTICLE">ARTICLE</option>
                  <option value="LINK">LINK</option>
                  <option value="CODE">CODE</option>
                  <option value="DOCUMENT">DOCUMENT</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Category</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Tags</label>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
              </div>

              {formData.type === "LINK" && (
                <div className="col-12">
                  <label className="form-label">URL</label>
                  <input
                    name="url"
                    value={formData.url || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              )}

              {formData.type === "CODE" && (
                <div className="col-md-6">
                  <label className="form-label">Programming Language</label>
                  <input
                    name="language"
                    value={formData.language || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              )}

              {formData.type !== "LINK" && formData.type !== "CODE" && (
                <div className="col-12">
                  <label className="form-label">Content</label>
                  <textarea
                    name="content"
                    value={formData.content || ""}
                    onChange={handleChange}
                    className="form-control"
                    rows="8"
                  />
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label">Visibility</label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="PRIVATE">PRIVATE</option>
                  <option value="PUBLIC">PUBLIC</option>
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => navigate(`/resources/${id}`)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-dark">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditResourcePage;
