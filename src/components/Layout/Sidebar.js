import React, { useState } from "react";
import SubmenuItem from "./SubmenuItem";
import * as _global from "../../config/global";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem("user")) || { roles: [], firstName: "", lastName: "" };
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : "";

  return (
    <nav className={`sidebar ${isSidebarOpen ? "" : "close"}`}>
      <div className="menu_content">
        <ul className="menu_items">
          <div className="menu_title menu_dashboard"></div>

          {/* Main menu items */}
          <li className="item">
            <SubmenuItem
              title="Cases"
              icon="fa-solid fa-clipboard-list"
              link="/layout/cases"
            />
            {(userRole === _global.allRoles.admin ||
              userRole === _global.allRoles.manager ||
              (userRole === _global.allRoles.technician &&
                user.firstName === "Mustafa") ||
              userRole === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="Users"
                  link="/layout/users"
                  icon="fa-solid fa-users-gear"
                />
              )}
            {(userRole === _global.allRoles.admin ||
              userRole === _global.allRoles.manager ||
              userRole === _global.allRoles.Reception ||
              userRole === _global.allRoles.super_admin ||
              (userRole === _global.allRoles.technician &&
                user.firstName === "Mustafa")) && (
                <SubmenuItem
                  title="Departments"
                  icon="fa-solid fa-layer-group"
                  link="/layout/departments"
                />
              )}
            {(userRole === _global.allRoles.admin ||
              userRole === _global.allRoles.manager ||
              userRole === _global.allRoles.super_admin ||
              (userRole === _global.allRoles.technician &&
                user.lastName === "Jamous")) && (
                <SubmenuItem
                  title="Clinics"
                  icon="fa-solid fa-hospital-user"
                  link="/layout/clinics"
                />
              )}
            {(userRole === _global.allRoles.admin ||
              userRole === _global.allRoles.Reception ||
              (userRole === _global.allRoles.technician &&
                user.lastName === "Jamous") ||
              userRole === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="Doctors"
                  icon="fa-solid fa-user-doctor"
                  link="/layout/doctors"
                />
              )}
            {(userRole !== _global.allRoles.admin ||
              userRole !== _global.allRoles.manager ||
              userRole === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="My Work"
                  icon="fa-solid fa-list-check"
                  link="/layout/user-profile"
                />
              )}
            {(userRole === _global.allRoles.admin ||
              userRole === _global.allRoles.Reception ||
              userRole === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="Shipments"
                  icon="fa-solid fa-truck-fast"
                  link="/layout/shipments"
                />
              )}
            {(userRole === _global.allRoles.Reception ||
              userRole === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="Assigned Doctors"
                  icon="fa-solid fa-user-check"
                  link="/layout/assigned-doctors"
                />
              )}
            {(userRole === _global.allRoles.admin ||
              userRole === _global.allRoles.Reception ||
              userRole === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="Reports"
                  icon="fa-solid fa-chart-pie"
                  link="/layout/reports"
                />
              )}
            {(userRole === _global.allRoles.admin ||
              userRole === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="Items"
                  icon="fa-solid fa-boxes-stacked"
                  link="/layout/items"
                />
              )}
          </li>
        </ul>

        {/* Modern Sidebar Bottom Collapse Toggle */}
        <div className="sidebar_bottom_wrapper">
          <button
            type="button"
            className="sidebar_toggle_btn"
            onClick={toggleSidebar}
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <div className="toggle_icon_wrapper">
              <i className={`fa-solid ${isSidebarOpen ? "fa-angles-left" : "fa-angles-right"}`}></i>
            </div>
            {isSidebarOpen && <span className="toggle_text">Collapse</span>}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
