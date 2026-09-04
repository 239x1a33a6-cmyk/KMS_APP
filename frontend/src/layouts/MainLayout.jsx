import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SpotlightSearch from "../components/SpotlightSearch";
import KeyboardShortcuts from "../components/KeyboardShortcuts";

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell min-vh-100">
      {/* Global keyboard shortcuts listener */}
      {user && (
        <KeyboardShortcuts onSpotlight={() => setSpotlightOpen(true)} />
      )}

      {/* Spotlight search modal */}
      {user && (
        <SpotlightSearch
          open={spotlightOpen}
          onClose={() => setSpotlightOpen(false)}
        />
      )}

      <header className="topbar">
        <div className="container d-flex align-items-center justify-content-between py-3 gap-3">
          <Link
            to={user ? "/dashboard" : "/login"}
            className="brand-mark text-decoration-none"
          >
            KnowledgeVault
          </Link>

          <nav className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
            {user ? (
              <>
                {/* Spotlight trigger button */}
                <button
                  className="nav-pill spotlight-trigger"
                  onClick={() => setSpotlightOpen(true)}
                  title="Search (Ctrl+K)"
                  type="button"
                >
                  🔍 Search
                  <kbd className="spotlight-shortcut-hint">⌘K</kbd>
                </button>

                <Link to="/dashboard" className="nav-pill">
                  Dashboard
                </Link>
                <Link to="/resources" className="nav-pill">
                  Resources
                </Link>
                <Link to="/favorites" className="nav-pill">
                  Favorites
                </Link>
                <Link to="/profile" className="nav-pill">
                  Profile
                </Link>

                {/* Keyboard shortcuts hint */}
                <span
                  className="nav-pill shortcuts-hint"
                  title="Press ? for keyboard shortcuts"
                >
                  ?
                </span>

                <button
                  className="btn btn-dark btn-sm rounded-pill"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-pill">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-dark btn-sm rounded-pill"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;
