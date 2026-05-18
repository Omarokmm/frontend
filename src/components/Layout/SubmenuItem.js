import React, { useState } from "react";
import { Link } from "react-router-dom";

const SubmenuItem = ({ link,icon,title, sublinks }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);

  const toggleSubmenu = ( sublinks ) => {
    setShowSubmenu(!showSubmenu);
  };

  return (
    <div className={`nav_link submenu_item`}>
      <Link to={`${link}`}>
        <span className="navlink_icon">
          {/* <i className="bx bx-home-alt"></i> */}
          {/* <i class="fa-solid fa-user-group"></i> */}
          <i class={icon}></i>
        </span>
        {title}
      </Link>
      {/* <i
      className={`bx ${
        showSubmenu ? "bx-chevron-down" : "bx-chevron-right"
      } arrow-left`}
      ></i> */}
      {/* {showSubmenu && (
        <ul className="menu_items submenu">
          {sublinks.map((link, index) => (
            <li key={index} className="item">
              <Link to={link}>{link}</Link>
            </li>
          ))}
        </ul>
      )} */}
    </div>
  );
};

export default SubmenuItem;
