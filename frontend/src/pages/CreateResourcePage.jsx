import { useState } from "react";
import { useNavigate } from "react-router-dom";
import resourceService from "../services/resourceService";
import DuplicateWarning from "../components/DuplicateWarning";

const defaultState = {
  title: "",
  description: "",
  content: "",
  type: "NOTE",
  category: "Other",
  tags: "",
  url: "",
  language: "",
  visibility: "PRIVATE",
};

const templateLibrary = [
  {
    name: "Meeting Notes",
    title: "Weekly team sync",
    type: "NOTE",
    category: "Meetings",
    tags: "team, planning, notes",
    description: "Summary of initiatives, priorities, blockers, and decisions.",
    content:
      "Agenda\n- Goals for the week\n- Key blockers\n- Action items\n- Risk areas\n\nDecisions\n-\n\nNext steps\n-",
    visibility: "PRIVATE",
  },
  {
    name: "Engineering Guide",
    title: "Deployment checklist",
    type: "ARTICLE",
    category: "Engineering",
    tags: "deploy, release, operations",
    description: "Checklist for validating a production release safely.",
    content:
      "1. Confirm feature flags and environment config\n2. Run smoke tests\n3. Back up relevant data\n4. Monitor logs after release\n5. Publish release note",
    visibility: "PRIVATE",
  },
  {
    name: "Code Snippet",
    title: "Utility function pattern",
    type: "CODE",
    category: "Development",
    tags: "javascript, utility, snippet",
    description: "Reusable helper for safe parsing and validation.",
    content:
      "const safeRead = (value) => {\n  try {\n    return JSON.parse(value);\n  } catch {\n    return null;\n  }\n};",
    language: "javascript",
    visibility: "PRIVATE",
  },
  {
    name: "Resource Link",
    title: "Best practices reference",
    type: "LINK",
    category: "Learning",
    tags: "reference, docs, learning",
    description: "Use this resource to capture a reusable external reference.",
    url: "https://example.com",
    visibility: "PUBLIC",
  },
  {
    name: "Book Review",
    title: "Book review: ",
    type: "ARTICLE",
    category: "Learning",
    tags: "book, review, reading",
    description: "My notes and takeaways from reading this book.",
    content:
      "## Summary\n\n## Key Takeaways\n1. \n2. \n3. \n\n## Quotes\n\n## Would I recommend?\n",
    visibility: "PRIVATE",
  },
  {
    name: "Daily Log",
    title: "Daily log — ",
    type: "NOTE",
    category: "Journal",
    tags: "daily, log, productivity",
    description: "What I worked on today.",
    content:
      "## Done today\n-\n\n## Blockers\n-\n\n## Tomorrow\n-\n\n## Notes\n",
    visibility: "PRIVATE",
  },
];

const CreateResourcePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyTemplate = (template) => {
    setFormData({
      ...defaultState,
      ...template,
      tags: template.tags || "",
      content: template.content || "",
      description: template.description || "",
      url: template.url || "",
      language: template.language || "",
      visibility: template.visibility || "PRIVATE",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

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

      const response = await resourceService.create(payload);
      navigate(`/resources/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create resource.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h2 className="mb-3">Create Resource</h2>

          {/* Templates — now includes 2 extra (Book Review & Daily Log) */}
          <div className="mb-4">
            <p className="text-uppercase text-secondary fw-semibold mb-2">
              Quick templates
            </p>
            <div className="d-flex flex-wrap gap-2">
              {templateLibrary.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  className="btn btn-outline-dark btn-sm"
                  onClick={() => applyTemplate(template)}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

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
                {/* ── NEW: Duplicate detection warning ── */}
                <DuplicateWarning title={formData.title} />
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
                  placeholder="node, javascript"
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
                    value={formData.url}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="https://…"
                  />
                </div>
              )}

              {formData.type === "CODE" && (
                <div className="col-md-6">
                  <label className="form-label">Programming Language</label>
                  <input
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="JavaScript"
                  />
                </div>
              )}

              {formData.type !== "LINK" && (
                <div className="col-12">
                  <label className="form-label">Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="form-control"
                    rows="10"
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
                onClick={() => navigate("/resources")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-dark" disabled={loading}>
                {loading ? "Creating..." : "Create Resource"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateResourcePage;
