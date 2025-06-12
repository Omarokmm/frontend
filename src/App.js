import { BrowserRouter as Router, Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Layout from "./pages/Layout/Layout";
import Home from "./pages/home/home";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Departments from "./components/Layout/Departments/Departments.js";
import Users from "./components/Layout/Users";
import Doctors from "./components/Layout/Doctors";
import RequireAuth from "./actions/RequiredAuth";
import Cases from "./components/Layout/Cases/Cases";
import ViewCase from "./components/Layout/Cases/ViewCase";
import AddNewCase from "./components/Layout/Cases/AddNewCase";
import CaseProcess from "./components/Layout/Cases/CaseProcess/CaseProcess";
import UserProfile from "./components/Layout/UserProfile";
import EditCase from "./components/Layout/Cases/EditCase";
import NotesUser from "./components/NotesUser";
import DocotrCases from "./components/Layout/DoctorCases.js";
import Shipments from "./components/Layout/Shipments/Shipments.js";
import CasesInDepartments from "./components/Layout/Departments/CasesInDepartments.js";
import Clinics from "./components/Layout/Clinics/Clinics.js";
import RedoCase from "./components/Layout/Cases/RedoCase.js";
function App() {
  return (
    <div className="App">
      <ToastContainer />
      <div className="pages">
        <BrowserRouter>
          <Routes>
            <Route index path="/" element={<Login />} />
            <Route element={<RequireAuth allowedRoles={[0]} />}>
              <Route path="layout" element={<Layout />}>
                <Route path="users" element={<Users />} />
                <Route path="user-profile" element={<UserProfile />} />
                <Route path="departments" element={<Departments />} />
                <Route path="clinics" element={<Clinics />} />
                <Route path="cases-in-departments" element={<CasesInDepartments />} />
                <Route path="doctors" element={<Doctors />} />
                <Route path="cases" element={<Cases />} />
                <Route path="view-case" element={<ViewCase />} />
                <Route path="add-case" element={<AddNewCase />} />
                <Route path="edit-case/:id" element={<EditCase />} />
                <Route path="redo-case/:id" element={<RedoCase />} />
                <Route path="process-case" element={<CaseProcess />} />
                <Route path="user-notes" element={<NotesUser />} />
                <Route path="cases-by-doctors" element={<DocotrCases />} />
                <Route path="shipments" element={<Shipments />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
