import { Link, useNavigate } from "react-router-dom";
import * as _global from "../../config/global";
const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const departments = JSON.parse(localStorage.getItem("departments"));
  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
  return (
    <nav className="navbar">
      <div className="logo_item">
        <div class="btn-group dropend menu-navbar">
          <button
            type="button"
            class="btn btn-menu dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bx bx-menu" id="sidebarOpen"></i>
          </button>
          <ul class="dropdown-menu dropstart">
            <li>
              <Link class="dropdown-item" to="/layout/cases">
                Cases
              </Link>
              {(user.roles[0] !== _global.allRoles.admin ||
                user.roles[0] !== _global.allRoles.manager ||
                user.roles[0] === _global.allRoles.super_admin) && (
                  <Link class="dropdown-item" to="/layout/user-profile">
                    My Work
                  </Link>
                )}
              {(user.roles[0] === _global.allRoles.admin ||
                (user.roles[0] === _global.allRoles.technician &&
                  user.lastName === "Jamous")) && (
                  <>
                    <Link class="dropdown-item" to="/layout/users">
                      Users
                    </Link>
                    <Link class="dropdown-item" to="/layout/departments">
                      Departments
                    </Link>
                    <Link class="dropdown-item" to="/layout/clinics">
                      Clinics
                    </Link>
                  </>
                )}
              {(user.roles[0] === _global.allRoles.admin ||
                user.roles[0] === _global.allRoles.Reception ||
                user.roles[0] === _global.allRoles.super_admin ||
                (user.roles[0] === _global.allRoles.technician &&
                  user.lastName === "Jamous")) && (
                  <>
                    <Link class="dropdown-item" to="/layout/doctors">
                      Doctors
                    </Link>
                    <Link class="dropdown-item" to="/layout/shipments">
                      Shipments
                    </Link>
                  </>
                )}
            </li>
          </ul>
        </div>
        <div
          className="c-pointer mr-2"
          onClick={() => navigate("/layout/cases")}
        >
          <img src="/images/logo.png" alt="" />
          <span>Arak</span>
          <sup>1.3.7</sup>
        </div>
      </div>
      {/* <div className="search_bar">
        <input type="text" placeholder="Search" />
      </div> */}
      <div className="navbar_content">
        <i className="bi bi-grid"></i>
        {/* <i className='bx bx-sun' id="darkLight"></i> */}
        {/* <i className='bx bx-bell' ></i> */}
        {/* <img
          src="/images/profile.jpg"
          data-bs-toggle="dropdown"
          aria-expanded="false"
           alt=""
          className="profile"
        /> */}
        <div class="btn-group dropstart profile-navbar">
          <button
            type="button"
            class="btn btn-arak dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="fa-regular fa-user fx-1"></i>
          </button>
          <ul class="dropdown-menu dropstart">
            <li onClick={() => navigate("/layout/user-profile-view")}>
              <a class="dropdown-item" >
                {user.firstName} {user.lastName}
              </a>
            </li>
            <li onClick={() => logout()}>
              <a class="dropdown-item">
                <span>Logout</span>
              </a>
            </li>
            {/* <li>
              <a class="dropdown-item" href="#">
                Something else here
              </a>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
