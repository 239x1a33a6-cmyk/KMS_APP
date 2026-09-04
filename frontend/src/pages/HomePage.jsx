import { Link } from "react-router-dom";

const HomePage = () => (
  <div className="container py-5">
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-5 text-center">
            <p className="text-uppercase text-secondary fw-semibold mb-2">
              KnowledgeVault
            </p>
            <h1 className="mb-3">Secure personal knowledge management</h1>
            <p className="text-secondary mb-4 fs-5">
              Capture, organise, and share your notes, articles, links, and
              code snippets — all in one place.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/login" className="btn btn-dark btn-lg px-4">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-outline-dark btn-lg px-4">
                Create account
              </Link>
            </div>
          </div>
        </div>

        <div className="row g-3 mt-4">
          {[
            {
              icon: "📄",
              title: "Notes & articles",
              body: "Write rich notes and articles you can revisit any time.",
            },
            {
              icon: "🔗",
              title: "Link library",
              body: "Save and tag useful URLs so nothing gets lost in your browser.",
            },
            {
              icon: "💻",
              title: "Code snippets",
              body: "Store reusable code snippets with syntax highlighting.",
            },
          ].map((feature) => (
            <div className="col-md-4" key={feature.title}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="fs-2 mb-2">{feature.icon}</div>
                  <h5 className="mb-1">{feature.title}</h5>
                  <p className="text-secondary mb-0 small">{feature.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default HomePage;
