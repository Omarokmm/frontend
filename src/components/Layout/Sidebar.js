import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SubmenuItem from "./SubmenuItem"; // Assuming SubmenuItem is in the same directory
import * as _global from "../../config/global";
const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <nav className={`sidebar ${isSidebarOpen ? "" : "close"}`}>
      <div className="menu_content">
        <ul className="menu_items">
          <div className="menu_title menu_dashboard"></div>

          {/* Main menu item with submenu */}
          <li className="item">
            <SubmenuItem
              title="Cases"
              iconClass="bx bxs-user"
              icon="fa-solid fa-bars-progress"
              link="/layout/cases"
              sublinks={[
                "Nav Sub Link 1",
                "Nav Sub Link 2",
                "Nav Sub Link 3",
                "Nav Sub Link 4",
              ]}
            />
            {(user.roles[0] === _global.allRoles.admin ||
              user.roles[0] === _global.allRoles.manager ||
              (user.roles[0] === _global.allRoles.technician &&
                user.firstName === "Mustafa") ||
              user.roles[0] === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="Users"
                  iconClass="bx bxs-user"
                  link="/layout/users"
                  icon="fa-solid fa-users-gear"
                  sublinks={[
                    "Nav Sub Link 1",
                    "Nav Sub Link 2",
                    "Nav Sub Link 3",
                    "Nav Sub Link 4",
                  ]}
                />
              )}
            {(user.roles[0] === _global.allRoles.admin ||
              user.roles[0] === _global.allRoles.manager ||
              user.roles[0] === _global.allRoles.super_admin || (user.roles[0] === _global.allRoles.technician &&
                user.firstName === "Mustafa")) && (
                <SubmenuItem
                  title="Departments"
                  iconClass="bx bxs-user"
                  icon="fa-solid fa-outdent"
                  link="/layout/departments"
                  sublinks={[
                    "Nav Sub Link 1",
                    "Nav Sub Link 2",
                    "Nav Sub Link 3",
                    "Nav Sub Link 4",
                  ]}
                />
              )}
            {(user.roles[0] === _global.allRoles.admin ||
              user.roles[0] === _global.allRoles.manager ||
              user.roles[0] === _global.allRoles.super_admin ||
              (user.roles[0] === _global.allRoles.technician &&
                user.lastName === "Jamous")) && (
                <SubmenuItem
                  title="Clinics"
                  iconClass="bx bxs-user"
                  icon="fas fa-clinic-medical"
                  link="/layout/clinics"
                  sublinks={[
                    "Nav Sub Link 1",
                    "Nav Sub Link 2",
                    "Nav Sub Link 3",
                    "Nav Sub Link 4",
                  ]}
                />
              )}
            {(user.roles[0] === _global.allRoles.admin ||
              user.roles[0] === _global.allRoles.Reception ||
              (user.roles[0] === _global.allRoles.technician &&
                user.lastName === "Jamous") ||
              user.roles[0] === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="Doctors"
                  iconClass="bx bxs-user"
                  icon="fa-solid fa-user-doctor"
                  link="/layout/doctors"
                  sublinks={[
                    "Nav Sub Link 1",
                    "Nav Sub Link 2",
                    "Nav Sub Link 3",
                    "Nav Sub Link 4",
                  ]}
                />
              )}
            {(user.roles[0] !== _global.allRoles.admin ||
              user.roles[0] !== _global.allRoles.manager ||
              user.roles[0] === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="My Work"
                  iconClass="bx bxs-user"
                  icon="fas fa-tasks"
                  link="/layout/user-profile"
                  sublinks={[
                    "Nav Sub Link 1",
                    "Nav Sub Link 2",
                    "Nav Sub Link 3",
                    "Nav Sub Link 4",
                  ]}
                />
              )}
            {(user.roles[0] === _global.allRoles.admin ||
              user.roles[0] === _global.allRoles.Reception ||
              user.roles[0] === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="Shipments"
                  iconClass="bx bxs-user"
                  icon="fas fa-shipping-fast"
                  link="/layout/shipments"
                  sublinks={[
                    "Nav Sub Link 1",
                    "Nav Sub Link 2",
                    "Nav Sub Link 3",
                    "Nav Sub Link 4",
                  ]}
                />
              )}
            {(
              user.roles[0] === _global.allRoles.Reception ||
              user.roles[0] === _global.allRoles.super_admin) && (
                <SubmenuItem
                  title="Assigned Doctors"
                  iconClass="bx bxs-user"
                  icon="fa-solid fa-user-check"
                  link="/layout/assigned-doctors"
                  sublinks={[
                    "Nav Sub Link 1",
                    "Nav Sub Link 2",
                    "Nav Sub Link 3",
                    "Nav Sub Link 4",
                  ]}
                />
              )}
          </li>
          {/* <li>
            <a href="/users">users</a>
          </li> */}
          {/* Add more SubmenuItem components for other menu items */}
        </ul>

        {/* Add other sidebar content here */}
        <div className="bottom_content" onClick={toggleSidebar}>
          <div className="bottom expand_sidebar">
            <span> Expand</span>
            <i className="bx bx-log-in"></i>
          </div>
          <div className="bottom collapse_sidebar" onClick={toggleSidebar}>
            <span> Collapse</span>
            <i className="bx bx-log-out"></i>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
