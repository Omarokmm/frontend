import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { showToastMessage } from "../../helper/toaster";
import * as _global from "../../config/global";
const Login = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // if (user) {
  //   navigate("/");
  // }
  const Login = async (e) => {
    e.preventDefault();
    let model = {
      email: email,
      password: password,
    };
    const response = await fetch(`${_global.BASE_URL_WiTHOUT_API}login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(model),
    });
    const json = await response.json();
    if (response.ok) {
      console.log("login successfully");
      navigate("/layout/cases");
      const { password, confirmPassword, ...userWithoutPasswords } = json.data;
      localStorage.setItem("user", JSON.stringify(userWithoutPasswords));
      localStorage.setItem("departments", JSON.stringify(json.departments));
      showToastMessage("logged successfully", "success");
      console.log(json);
    }
    if (!response.ok) {
      console.log("login NOT  successfully");
      console.log(json);
      showToastMessage(json.msg, "error");
    }
  };
  return (
    <div className="login-page">
      <div class="container" id="container">
        <div class="form-container sign-up">
          {/* <form>
            <h1>Create Account</h1>
            <div class="social-icons">
              <a href="#" class="icon">
                <i class="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" class="icon">
                <i class="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" class="icon">
                <i class="fa-brands fa-github"></i>
              </a>
              <a href="#" class="icon">
                <i class="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email for registeration</span>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button>Sign Up</button>
          </form> */}
        </div>
        <div class="form-container sign-in">
          <form onSubmit={Login}>
            <img
              src="./images/arak-2.png"
              class="img-fluid-arak img-phone"
              alt=""
            />
            <h1 className="mb-5">Sign In</h1>
            {/* <div class="social-icons">
              <a href="#" class="icon">
                <i class="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" class="icon">
                <i class="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" class="icon">
                <i class="fa-brands fa-github"></i>
              </a>
              <a href="#" class="icon">
                <i class="fa-brands fa-linkedin-in"></i>
              </a>
            </div> */}
            {/* <span>or use your email password</span> */}
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            {/* <a href="#">Forget Your Password?</a> */}
            <button className="mt-4" type="submit">
              Sign In
            </button>
          </form>
        </div>
        <div class="toggle-container">
          <div class="toggle">
            <div class="toggle-panel toggle-left">
              <h1>Arak Dental Lab!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button class="hidden" id="login">
                Sign In
              </button>
            </div>
            <div class="toggle-panel toggle-right">
              <img
                src="./images/arak.png"
                class="img-fluid-arak img-desktop"
                alt=""
              />
              <h3>Arak Dental Lab!</h3>
              <p>
                Signing with your personal details to use all of system features
              </p>
              {/* <button class="hidden" id="register">
                Sign Up
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
