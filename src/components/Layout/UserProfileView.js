import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as _global from "../../config/global";

const UserProfileView = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const Roles = {
    0: "admin",
    1: "manager", 
    2: "teamleader",
    3: "technician",
    4: "Reception",
    5: "Driver",
    6: "graphic_design",
    7: "software_Engineer",
    8: "Super Admin",
  };

  useEffect(() => {
    // Prevent multiple API calls
    if (hasFetched.current) {
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        hasFetched.current = true; // Mark as fetched
        const response = await axios.get(`${_global.BASE_URL}users/${user._id}`);
        setUserData(response.data);
        console.log("User profile data:", response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to load user profile");
        hasFetched.current = false; // Reset on error to allow retry
      } finally {
        setLoading(false);
      }
    };

    if (user && user._id) {
      fetchUserProfile();
    } else {
      setError("No user found");
      setLoading(false);
    }
  }, []); // Empty dependency array - only run once on mount

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleNames = (roleIds) => {
    if (!roleIds || !Array.isArray(roleIds)) return "N/A";
    return roleIds.map(roleId => Roles[roleId] || `Role ${roleId}`).join(", ");
  };

  if (loading) {
    return (
      <div className="content user-profile-view">
        <div className="card">
          <div className="card-body text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading user profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content user-profile-view">
        <div className="card">
          <div className="card-body text-center">
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="content user-profile-view">
        <div className="card">
          <div className="card-body text-center">
            <p>No user data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content user-profile-view">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col">
                <div className="d-flex align-items-center">
                  <button 
                    className="btn btn-outline-light me-3"
                    onClick={() =>  window.history.back()}
                  >
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <div>
                    <h2 className="text-white mb-1">
                      {userData.firstName} {userData.lastName}
                    </h2>
                    <p className="text-white-50 mb-0">
                      <i className="fas fa-briefcase me-2"></i>
                      {getRoleNames(userData.roles)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <span className={`badge ${userData.active ? 'bg-success' : 'bg-danger'} fs-6`}>
                  <i className={`fas ${userData.active ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                  {userData.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-fluid mt-4">
        <div className="row">
          {/* Personal Information Card */}
          <div className="col-lg-6 mb-4">
            <div className="info-card">
              <div className="card-header-custom">
                <h5 className="mb-0">
                  <i className="fas fa-user-circle me-2"></i>
                  Personal Information
                </h5>
              </div>
              <div className="card-body-custom">
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-id-card me-2"></i>
                    Full Name
                  </div>
                  <div className="info-value">
                    {userData.firstName} {userData.lastName}
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-envelope me-2"></i>
                    Email Address
                  </div>
                  <div className="info-value">
                    <a href={`mailto:${userData.email}`} className="info-link">
                      {userData.email || "N/A"}
                    </a>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-phone me-2"></i>
                    Phone Number
                  </div>
                  <div className="info-value">
                    <a href={`tel:${userData.phone}`} className="info-link">
                      {userData.phone || "N/A"}
                    </a>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-venus-mars me-2"></i>
                    Gender
                  </div>
                  <div className="info-value">
                    {userData.gender || "N/A"}
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-birthday-cake me-2"></i>
                    Date of Birth
                  </div>
                  <div className="info-value">
                    {formatDate(userData.dateOfBirth)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Information Card */}
          <div className="col-lg-6 mb-4">
            <div className="info-card">
              <div className="card-header-custom">
                <h5 className="mb-0">
                  <i className="fas fa-briefcase me-2"></i>
                  Work Information
                </h5>
              </div>
              <div className="card-body-custom">
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-user-tag me-2"></i>
                    Roles
                  </div>
                  <div className="info-value">
                    {getRoleNames(userData.roles)}
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-calendar-plus me-2"></i>
                    Joining Date
                  </div>
                  <div className="info-value">
                    {formatDate(userData.joiningDate)}
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-certificate me-2"></i>
                    License Expiry
                  </div>
                  <div className="info-value">
                    {formatDate(userData.licenseExpireDate)}
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-clock me-2"></i>
                    Created At
                  </div>
                  <div className="info-value">
                    {formatDate(userData.createdAt)}
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-edit me-2"></i>
                    Last Updated
                  </div>
                  <div className="info-value">
                    {formatDate(userData.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Card */}
          {userData.address && (
            <div className="col-lg-6 mb-4">
              <div className="info-card">
                <div className="card-header-custom">
                  <h5 className="mb-0">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Address Information
                  </h5>
                </div>
                <div className="card-body-custom">
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-road me-2"></i>
                      Street
                    </div>
                    <div className="info-value">
                      {userData.address.street || "N/A"}
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-city me-2"></i>
                      City
                    </div>
                    <div className="info-value">
                      {userData.address.city || "N/A"}
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-map me-2"></i>
                      State
                    </div>
                    <div className="info-value">
                      {userData.address.state || "N/A"}
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-flag me-2"></i>
                      Country
                    </div>
                    <div className="info-value">
                      {userData.address.country || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          {/* {userData.notes && userData.notes.length > 0 && (
            <div className="col-lg-6 mb-4">
              <div className="info-card">
                <div className="card-header-custom">
                  <h5 className="mb-0">
                    <i className="fas fa-sticky-note me-2"></i>
                    Notes ({userData.notes.length})
                  </h5>
                </div>
                <div className="card-body-custom">
                  <div className="notes-list">
                    {userData.notes.map((note, index) => (
                      <div key={note.id || index} className="note-item">
                        <div className="note-header">
                          <h6 className="note-title">{note.title}</h6>
                          <span className={`badge note-type-${note.noteType.toLowerCase()}`}>
                            {note.noteType}
                          </span>
                        </div>
                        <div className="note-meta">
                          <small className="text-muted">
                            <i className="fas fa-user me-1"></i>
                            {note.addedBy} • 
                            <i className="fas fa-calendar me-1 ms-2"></i>
                            {formatDate(note.date)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
