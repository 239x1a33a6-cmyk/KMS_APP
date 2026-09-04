import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import accessRequestService from "../services/accessRequestService";

const getStatusTone = (status) => {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "secondary";
  }
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  const loadRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [incomingResponse, myResponse] = await Promise.all([
        accessRequestService.getIncoming(),
        accessRequestService.getMine(),
      ]);

      setIncomingRequests(incomingResponse.data?.data || []);
      setMyRequests(myResponse.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleDecision = async (requestId, status) => {
    setActioning(requestId);

    try {
      await accessRequestService.decide(requestId, status);
      await loadRequests();
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="container py-4 py-lg-5">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <p className="text-uppercase text-secondary fw-semibold mb-1">
            Profile
          </p>
          <h2 className="mb-3">{user?.name || "User Profile"}</h2>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label text-secondary">Name</label>
              <div className="form-control bg-light border-0 rounded-4">
                {user?.name || "Not available"}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-secondary">Email</label>
              <div className="form-control bg-light border-0 rounded-4">
                {user?.email || "Not available"}
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <Link to="/dashboard" className="btn btn-dark">
              Dashboard
            </Link>
            <Link to="/resources" className="btn btn-outline-dark">
              My resources
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h4 className="mb-3">Access requests</h4>
              {loading ? (
                <p className="text-secondary mb-0">Loading requests...</p>
              ) : incomingRequests.length === 0 ? (
                <p className="text-secondary mb-0">
                  No new requests yet. Your public notes are still quiet.
                </p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="border rounded-4 p-3 bg-light-subtle"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>
                          {request.resource?.title || "Shared note"}
                        </strong>
                        <span
                          className={`badge text-bg-${getStatusTone(request.status)}`}
                        >
                          {request.status}
                        </span>
                      </div>

                      <p className="text-secondary mb-2 small">
                        Requested by {request.requester?.name || "A user"}
                      </p>

                      {request.message && (
                        <p className="small text-secondary mb-3">
                          “{request.message}”
                        </p>
                      )}

                      {request.status === "PENDING" && (
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-dark btn-sm"
                            onClick={() =>
                              handleDecision(request._id, "approved")
                            }
                            disabled={actioning === request._id}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-dark btn-sm"
                            onClick={() =>
                              handleDecision(request._id, "rejected")
                            }
                            disabled={actioning === request._id}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h4 className="mb-3">My requests</h4>
              {loading ? (
                <p className="text-secondary mb-0">Loading your requests...</p>
              ) : myRequests.length === 0 ? (
                <p className="text-secondary mb-0">
                  You have not requested access to any public notes yet.
                </p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {myRequests.map((request) => (
                    <div
                      key={request._id}
                      className="border rounded-4 p-3 bg-light-subtle"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>
                          {request.resource?.title || "Shared note"}
                        </strong>
                        <span
                          className={`badge text-bg-${getStatusTone(request.status)}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-secondary mb-0 small">
                        Sent to {request.owner?.name || "the owner"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
