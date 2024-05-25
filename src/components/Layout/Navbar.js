import { Link, useNavigate } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const logout = ()=>{
    localStorage.removeItem("user");
    navigate("/");
  }
  return (
    <nav className="navbar">
      <div className="logo_item">
        <i className="bx bx-menu" id="sidebarOpen"></i>
        <img src="/images/logo.png" alt="" />
        Arak
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
            class="btn btn-secondary dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="fa-regular fa-user fx-1"></i>
          </button>
          <ul class="dropdown-menu dropstart">
            <li>
              <a class="dropdown-item" href="#">
                My Profile
              </a>
            </li>
            <li>
              <a class="dropdown-item">
                <span onClick={() => logout()}>Logout</span>
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
