import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  {
    name: "Demo User",
    email: "demo@knowledgevault.app",
    password: "Demo123!",
  },
  {
    name: "Aisha Patel",
    email: "aisha@knowledgevault.app",
    password: "Demo123!",
  },
  {
    name: "Rahul Nair",
    email: "rahul@knowledgevault.app",
    password: "Demo123!",
  },
];

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData);
      const nextPath = location.state?.from?.pathname || "/dashboard";
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUser) => {
    setError("");
    setLoading(true);

    try {
      await login({
        email: demoUser.email,
        password: demoUser.password,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Demo login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="container">
        <div className="row justify-content-center g-4 align-items-center">
          <div className="col-lg-5">
            <div className="card shadow-sm border-0 login-panel">
              <div className="card-body p-4 p-lg-5">
                <div className="feature-badge mb-3">Secure knowledge hub</div>
                <h1 className="mb-3">Welcome back</h1>
                <p className="text-secondary mb-4">
                  Manage notes, approve access requests, and keep your knowledge
                  organized in one simple workspace.
                </p>

                {error && (
                  <div className="alert alert-danger rounded-4">{error}</div>
                )}

                <div className="mb-4">
                  <small className="text-uppercase text-secondary fw-semibold">
                    Quick demo access
                  </small>
                  <div className="d-flex flex-column gap-2 mt-2">
                    {demoAccounts.map((demoUser) => (
                      <button
                        key={demoUser.email}
                        type="button"
                        className="btn btn-outline-dark btn-sm text-start rounded-4"
                        onClick={() => handleDemoLogin(demoUser)}
                        disabled={loading}
                      >
                        {demoUser.name} · {demoUser.email}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control rounded-4"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control rounded-4"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark w-100 rounded-4"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <p className="mt-3 mb-0 text-center text-secondary">
                  Need an account? <Link to="/register">Register</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
