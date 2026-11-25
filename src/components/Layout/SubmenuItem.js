import React from "react";
import { Link, useLocation } from "react-router-dom";

const SubmenuItem = ({ link, icon, title }) => {
  const location = useLocation();

  // Check if current route matches this menu item
  const isActive =
    location.pathname === link ||
    (link !== "/layout" && location.pathname.startsWith(link));

  return (
    <div className={`nav_link submenu_item ${isActive ? "active" : ""}`} title={title}>
      <Link to={link} className="nav_link_inner">
        <span className="navlink_icon">
          <i className={icon}></i>
        </span>
        <span className="navlink_text">{title}</span>
        {isActive && <span className="active_indicator"></span>}
      </Link>
    </div>
  );
};

export default SubmenuItem;
