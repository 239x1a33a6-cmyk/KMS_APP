import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import dashboardService from "../services/dashboardService";

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalResources: 0,
    activeResources: 0,
    archivedResources: 0,
    deletedResources: 0,
    favoriteResources: 0,
    totalViews: 0,
    recentResources: [],
    recentlyViewed: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboard();
        setStats(response.data?.data || stats);
      } catch (error) {
        console.error("Dashboard failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (authLoading || loading) {
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="text-uppercase text-secondary fw-semibold mb-1">
            Dashboard
          </p>
          <h2 className="mb-0">Welcome back, {user?.name || "User"}</h2>
        </div>
        <Link to="/resources/new" className="btn btn-dark">
          + Create Resource
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-secondary mb-1">Total Resources</p>
              <h3 className="mb-0">{stats.totalResources}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-secondary mb-1">Favorites</p>
              <h3 className="mb-0">{stats.favoriteResources}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-secondary mb-1">Views</p>
              <h3 className="mb-0">{stats.totalViews}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-secondary mb-1">Trash</p>
              <h3 className="mb-0">{stats.deletedResources}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="mb-3">Quick actions</h5>
              <div className="d-grid gap-2">
                <Link to="/resources/new" className="btn btn-dark text-start">
                  Create a note
                </Link>
                <Link
                  to="/resources"
                  className="btn btn-outline-dark text-start"
                >
                  Browse all resources
                </Link>
                <Link
                  to="/favorites"
                  className="btn btn-outline-dark text-start"
                >
                  Review favorites
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="mb-3">Recent Resources</h5>
              {stats.recentResources.length === 0 ? (
                <p className="text-secondary mb-0">No recent resources yet.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {stats.recentResources.map((resource) => (
                    <li key={resource._id} className="list-group-item px-0">
                      <Link
                        to={`/resources/${resource._id}`}
                        className="text-dark text-decoration-none"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{resource.title}</span>
                          <small className="text-secondary">
                            {resource.type}
                          </small>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="mb-3">Recently Viewed</h5>
              {stats.recentlyViewed.length === 0 ? (
                <p className="text-secondary mb-0">No recently viewed items.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {stats.recentlyViewed.map((resource) => (
                    <li key={resource._id} className="list-group-item px-0">
                      <Link
                        to={`/resources/${resource._id}`}
                        className="text-dark text-decoration-none"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{resource.title}</span>
                          <small className="text-secondary">
                            {resource.viewCount || 0} views
                          </small>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="mb-3">Workspace snapshot</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span>Active</span>
                  <strong>{stats.activeResources}</strong>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span>Archived</span>
                  <strong>{stats.archivedResources}</strong>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span>Favorites</span>
                  <strong>{stats.favoriteResources}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
