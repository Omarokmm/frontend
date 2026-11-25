import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as _global from "../../config/global";
import { THEME_PRESETS, applyGlobalTheme, getInitialTheme } from "../../config/themeConfig";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { roles: [], firstName: "User", lastName: "" };
  const [currentTheme, setCurrentTheme] = useState(() => getInitialTheme());
  const [showPalette, setShowPalette] = useState(false);

  const userInitials = ((user?.firstName?.[0] || "U") + (user?.lastName?.[0] || "")).toUpperCase();
  const userRole = user?.roles?.[0] || "Staff";

  useEffect(() => {
    const initial = getInitialTheme();
    setCurrentTheme(initial);

    const handleThemeChange = (e) => {
      if (e.detail) {
        setCurrentTheme(e.detail);
      }
    };
    window.addEventListener("appThemeChanged", handleThemeChange);
    return () => window.removeEventListener("appThemeChanged", handleThemeChange);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo_item">
        <div className="btn-group dropend menu-navbar">
          <button
            type="button"
            className="btn btn-menu dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bx bx-menu" id="sidebarOpen"></i>
          </button>
          <ul className="dropdown-menu dropstart">
            <li>
              <Link className="dropdown-item" to="/layout/cases">
                Cases
              </Link>
              {(userRole !== _global.allRoles.admin ||
                userRole !== _global.allRoles.manager ||
                userRole === _global.allRoles.super_admin) && (
                  <Link className="dropdown-item" to="/layout/user-profile">
                    My Work
                  </Link>
                )}
              {(userRole === _global.allRoles.admin ||
                (userRole === _global.allRoles.technician &&
                  user.lastName === "Jamous")) && (
                  <>
                    <Link className="dropdown-item" to="/layout/users">
                      Users
                    </Link>
                    <Link className="dropdown-item" to="/layout/departments">
                      Departments
                    </Link>
                    <Link className="dropdown-item" to="/layout/clinics">
                      Clinics
                    </Link>
                  </>
                )}
              {(userRole === _global.allRoles.admin ||
                userRole === _global.allRoles.Reception ||
                userRole === _global.allRoles.super_admin ||
                (userRole === _global.allRoles.technician &&
                  user.lastName === "Jamous")) && (
                  <>
                    <Link className="dropdown-item" to="/layout/doctors">
                      Doctors
                    </Link>
                    <Link className="dropdown-item" to="/layout/shipments">
                      Shipments
                    </Link>
                  </>
                )}
            </li>
          </ul>
        </div>

        <div
          className="navbar_brand c-pointer"
          onClick={() => navigate("/layout/cases")}
          title="Arak Dental Lab"
        >
          <div className="brand_logo_wrapper">
            <img src="/images/logo.png" alt="Arak Logo" className="brand_logo_img" />
          </div>
          <div className="brand_meta_wrapper">
            <span className="brand_title">Arak</span>
            <span className="brand_version_tag">v1.3.7</span>
          </div>
        </div>
      </div>

      <div className="navbar_content">
        {/* Global Dashboard Palette Theme Customizer */}
        <div className="theme-navbar-group">
          <button
            type="button"
            className="btn btn-theme-palette"
            onClick={() => setShowPalette(!showPalette)}
            title="Customize Dashboard Theme Colors"
          >
            <i className="fas fa-palette"></i>
          </button>

          {showPalette && (
            <div className="navbar-palette-popover">
              <div className="palette-popover-header">
                <span>
                  <i className="fas fa-palette text-primary me-1"></i> Dashboard Theme
                </span>
                <button
                  type="button"
                  className="btn-close"
                  style={{ fontSize: "0.65rem" }}
                  onClick={() => setShowPalette(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="palette-presets-grid">
                {THEME_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`palette-preset-chip ${currentTheme.id === p.id ? "active" : ""}`}
                    onClick={() => {
                      applyGlobalTheme(p);
                      setCurrentTheme(p);
                    }}
                  >
                    <span
                      className="palette-swatch-dot"
                      style={{
                        backgroundColor: p.primary,
                        border: `2px solid ${p.panelBorder}`,
                      }}
                    ></span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>

              {/* Global Font Quick Control */}
              <div className="palette-global-font-bar">
                <label className="global-font-picker-label">
                  <i className="fas fa-font me-1 text-primary"></i>
                  <span>All System Font Color:</span>
                </label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="color"
                    className="global-font-input"
                    value={currentTheme.fontColor?.length === 7 ? currentTheme.fontColor : "#ffffff"}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updated = {
                        ...currentTheme,
                        id: "custom",
                        name: "Custom",
                        fontColor: val,
                        navbarFontColor: val,
                        sidebarFontColor: val,
                        tableTextColor: val,
                        tableHeaderColor: val,
                      };
                      applyGlobalTheme(updated);
                      setCurrentTheme(updated);
                    }}
                    title="Set font color across all layout, navbar, sidebar, and tables"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary font-quick-btn"
                    onClick={() => {
                      const val = "#ffffff";
                      const updated = {
                        ...currentTheme,
                        id: "custom",
                        name: "Custom",
                        fontColor: val,
                        navbarFontColor: val,
                        sidebarFontColor: val,
                        tableTextColor: val,
                        tableHeaderColor: val,
                      };
                      applyGlobalTheme(updated);
                      setCurrentTheme(updated);
                    }}
                    title="Set all fonts to Pure White"
                  >
                    White
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary font-quick-btn"
                    onClick={() => {
                      const val = "#1e293b";
                      const updated = {
                        ...currentTheme,
                        id: "custom",
                        name: "Custom",
                        fontColor: val,
                        navbarFontColor: val,
                        sidebarFontColor: val,
                        tableTextColor: val,
                        tableHeaderColor: val,
                      };
                      applyGlobalTheme(updated);
                      setCurrentTheme(updated);
                    }}
                    title="Set all fonts to Dark Slate"
                  >
                    Dark Slate
                  </button>
                </div>
              </div>

              {/* Layout & Fonts Section */}
              <div className="palette-custom-section">
                <span className="palette-custom-title">
                  <i className="fas fa-desktop me-1"></i> Layout & Fonts
                </span>
                <div className="palette-color-pickers">
                  <label className="color-picker-item">
                    <span>Main Font</span>
                    <input
                      type="color"
                      value={currentTheme.fontColor?.length === 7 ? currentTheme.fontColor : "#1e293b"}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", fontColor: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Navbar Font</span>
                    <input
                      type="color"
                      value={currentTheme.navbarFontColor?.length === 7 ? currentTheme.navbarFontColor : (currentTheme.fontColor || "#1e293b")}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", navbarFontColor: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Sidebar Font</span>
                    <input
                      type="color"
                      value={currentTheme.sidebarFontColor?.length === 7 ? currentTheme.sidebarFontColor : (currentTheme.fontColor || "#334155")}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", sidebarFontColor: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Page BG</span>
                    <input
                      type="color"
                      value={currentTheme.layoutBg?.length === 7 ? currentTheme.layoutBg : "#f1f5f9"}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", layoutBg: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Navbar BG</span>
                    <input
                      type="color"
                      value={currentTheme.navbarBg?.length === 7 ? currentTheme.navbarBg : "#ffffff"}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", navbarBg: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Sidebar BG</span>
                    <input
                      type="color"
                      value={currentTheme.sidebarBg?.length === 7 ? currentTheme.sidebarBg : (currentTheme.navbarBg || "#ffffff")}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", sidebarBg: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Cards BG</span>
                    <input
                      type="color"
                      value={currentTheme.cardBg?.length === 7 ? currentTheme.cardBg : "#ffffff"}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", cardBg: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Card Header</span>
                    <input
                      type="color"
                      value={currentTheme.cardTitleBg?.length === 7 ? currentTheme.cardTitleBg : "#e2e8f0"}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", cardTitleBg: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Accent</span>
                    <input
                      type="color"
                      value={currentTheme.primary?.length === 7 ? currentTheme.primary : "#0284c7"}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", primary: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Tables Section */}
              <div className="palette-custom-section">
                <span className="palette-custom-title">
                  <i className="fas fa-table me-1"></i> Tables Customization
                </span>
                <div className="palette-color-pickers">
                  <label className="color-picker-item">
                    <span>Header BG</span>
                    <input
                      type="color"
                      value={currentTheme.tableHeaderBg?.length === 7 ? currentTheme.tableHeaderBg : "#f1f5f9"}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", tableHeaderBg: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Header Text</span>
                    <input
                      type="color"
                      value={currentTheme.tableHeaderColor?.length === 7 ? currentTheme.tableHeaderColor : (currentTheme.fontColor || "#1e293b")}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", tableHeaderColor: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Row BG</span>
                    <input
                      type="color"
                      value={currentTheme.tableBg?.length === 7 ? currentTheme.tableBg : "#ffffff"}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", tableBg: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Row Text</span>
                    <input
                      type="color"
                      value={currentTheme.tableTextColor?.length === 7 ? currentTheme.tableTextColor : (currentTheme.fontColor || "#1e293b")}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", tableTextColor: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                  <label className="color-picker-item">
                    <span>Border</span>
                    <input
                      type="color"
                      value={currentTheme.tableBorderColor?.length === 7 ? currentTheme.tableBorderColor : "#e2e8f0"}
                      onChange={(e) => {
                        const updated = { ...currentTheme, id: "custom", name: "Custom", tableBorderColor: e.target.value };
                        applyGlobalTheme(updated);
                        setCurrentTheme(updated);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="palette-popover-footer">
                <button
                  type="button"
                  className="palette-reset-btn"
                  onClick={() => {
                    applyGlobalTheme(THEME_PRESETS[0]);
                    setCurrentTheme(THEME_PRESETS[0]);
                  }}
                >
                  <i className="fas fa-rotate-left me-1"></i> Reset to Classic
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Pill */}
        <div className="dropdown profile-navbar">
          <button
            type="button"
            className="btn nav-user-pill dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div className="user_avatar_circle">
              <span>{userInitials}</span>
              <span className="user_status_dot"></span>
            </div>
            <div className="user_meta_text d-none d-md-flex flex-column text-start">
              <span className="user_display_name">{user.firstName} {user.lastName}</span>
              {/* <span className="user_role_badge">{userRole}</span> */}
            </div>
            <i className="fa-solid fa-chevron-down user_dropdown_chevron"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end user_profile_dropdown">
            <li className="user_dropdown_header">
              <div className="user_avatar_circle lg">
                <span>{userInitials}</span>
              </div>
              <div className="user_header_details">
                <div className="user_header_name">{user.firstName} {user.lastName}</div>
                {/* <div className="user_header_role">{userRole}</div> */}
              </div>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button
                type="button"
                className="dropdown-item user_menu_item"
                onClick={() => navigate("/layout/user-profile-view")}
              >
                <i className="fa-regular fa-id-badge me-2"></i>
                <span>My Profile</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item user_menu_item text-danger"
                onClick={() => logout()}
              >
                <i className="fa-solid fa-arrow-right-from-bracket me-2"></i>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
