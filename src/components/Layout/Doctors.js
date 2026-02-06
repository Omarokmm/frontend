import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../../helper/toaster";
import { format } from "date-fns";
import * as _global from "../../config/global";
import { useReactToPrint } from "react-to-print";
import {
  CountryDropdown,
  RegionDropdown,
  CountryRegionData,
} from "react-country-region-selector";
import ViewCase from "./Cases/ViewCase";

const Doctors = () => {
  const doctorsRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));
  const [doctors, setDoctors] = useState([]);
  const [buffDoctor, setBuffDoctor] = useState([]);
  const [buffDoctors, setBuffDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("");
  const [joiningDate, setJoiningDate] = useState(null);
  const [licenseExpireDate, setLicenseExpireDate] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState("");
  // New State for Detail View
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState(
    user?.roles?.[0] === _global.allRoles.admin || user?.roles?.[0] === _global.allRoles.superAdmin ? "stats" : "profile"
  ); // profile, cases, stats

  // Cases State
  const [doctorCases, setDoctorCases] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [inProcessCases, setInProcessCases] = useState([]);
  const [holdingCases, setHoldingCases] = useState([]);
  const [finishedCases, setFinishedCases] = useState([]);
  const [notStartCases, setNotStartCases] = useState([]);
  const [buffAllCases, setBuffAllCases] = useState([]);
  const [isCasesLoading, setIsCasesLoading] = useState(false);
  const [buffCase, setBuffCase] = useState(null);

  // Role-based permissions
  const isAdminOrSuperAdmin = user?.roles?.[0] === _global.allRoles.admin || user?.roles?.[0] === _global.allRoles.super_admin;

  // Add styles constant or helper
  const styles = `
    /* Premium Layout & Container */
    .master-detail-wrapper {
        display: flex;
        height: calc(100vh - 120px);
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        // margin: 20px;
        margin-top: 5rem;
        border: 1px solid rgba(0,0,0,0.04);
    }

    /* Master List (Left Panel) */
    .master-panel {
        width: 400px;
        background: #fff;
        border-right: 1px solid #dee2e6;
        display: flex;
        flex-direction: column;
        z-index: 2;
    }

    .master-header {
        padding: 20px;
        background: #fff;
        border-bottom: 1px solid #dee2e6;
    }

    .doctor-list-item {
        padding: 18px 20px;
        border-bottom: 1px solid #f8f9fa;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
    }

    .doctor-list-item:hover {
        background: #fcfcfc;
    }

    .doctor-list-item.active {
        background: #f0f7ff;
    }

    .doctor-list-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: #0d6efd;
    }

    .avatar-initials {
        width: 45px;
        height: 45px;
        background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
        color: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
        margin-right: 16px;
        box-shadow: 0 4px 10px rgba(13, 110, 253, 0.2);
    }

    /* Detail View (Right Panel) */
    .detail-panel {
        flex-grow: 1;
        background: #fafafa;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .detail-header {
        background: #fff;
        padding: 24px 30px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .detail-content {
        padding: 30px;
        overflow-y: auto;
        height: 100%;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #adb5bd;
    }

    .info-card {
        background: white;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #dee2e6;
        margin-bottom: 20px;
    }

    .info-label {
        font-size: 12px;
        text-transform: uppercase;
        color: #6c757d;
        font-weight: 600;
        margin-bottom: 4px;
    }
    
    .info-value {
        font-weight: 500;
        color: #212529;
    }

    .search-wrapper input {
        border-radius: 10px;
        padding-left: 35px;
    }

    /* Tabs */
    .detail-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 10px;
    }

    .tab-btn {
        background: none;
        border: none;
        padding: 5px 15px;
        font-weight: 600;
        color: #6c757d;
        border-radius: 5px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .tab-btn:hover {
        background-color: #f8f9fa;
    }
    
    /* Stats Tab */
    .tab-btn.tab-stats.active {
        background-color: #6610f2;
        color: white;
        box-shadow: 0 4px 6px rgba(102, 16, 242, 0.2);
    }
    .tab-btn.tab-stats { color: #6610f2; background: rgba(102, 16, 242, 0.05); }

    /* Cases Tab */
    .tab-btn.tab-cases.active {
        background-color: #0d6efd;
        color: white;
        box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2);
    }
    .tab-btn.tab-cases { color: #0d6efd; background: rgba(13, 110, 253, 0.05); }

    /* Profile Tab */
    .tab-btn.tab-profile.active {
        background-color: #fd7e14;
        color: white;
        box-shadow: 0 4px 6px rgba(253, 126, 20, 0.2);
    }
    .tab-btn.tab-profile { color: #fd7e14; background: rgba(253, 126, 20, 0.05); }


    /* Charts */
    .chart-container {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 200px;
        width: 200px;
        margin: 0 auto;
    }

    .donut-chart {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }

    .donut-segment {
        fill: transparent;
        stroke-width: 25;
        transition: stroke-dasharray 0.5s ease;
    }

    .chart-center-text {
        position: absolute;
        text-align: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .stat-card {
        background: #fff;
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #f0f0f0;
        text-align: center;
        transition: transform 0.2s;
    }

    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    /* Colored Tabs */
    .sub-tabs .nav-link {
        border: 1px solid transparent;
        // border-radius: 50rem;
        padding: 0.5rem 1rem;
        margin-right: 0.5rem;
        font-weight: 500;
        transition: all 0.2s;
        background: white;
    }

    .sub-tabs .nav-link:hover {
        transform: translateY(-1px);
    }

    /* All */
    .sub-tabs .nav-link.tab-all { color: #0d6efd; border-color: #0d6efd; background: rgba(13, 110, 253, 0.05); }
    .sub-tabs .nav-link.tab-all:hover { background: rgba(13, 110, 253, 0.1); }
    .sub-tabs .nav-link.active.tab-all { background-color: #0d6efd !important; color: white !important; box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2); }

    /* Not Start (Info) */
    .sub-tabs .nav-link.tab-not-start { color: #0dcaf0; border-color: #0dcaf0; background: rgba(13, 202, 240, 0.05); }
    .sub-tabs .nav-link.tab-not-start:hover { background: rgba(13, 202, 240, 0.1); }
    .sub-tabs .nav-link.active.tab-not-start { background-color: #0dcaf0 !important; color: white !important; box-shadow: 0 4px 6px rgba(13, 202, 240, 0.2); }

    /* In Process (Warning) */
    .sub-tabs .nav-link.tab-in-process { color: #ffc107; border-color: #ffc107; background: rgba(255, 193, 7, 0.05); }
    .sub-tabs .nav-link.tab-in-process:hover { background: rgba(255, 193, 7, 0.1); }
    .sub-tabs .nav-link.active.tab-in-process { background-color: #ffc107 !important; color: black !important; box-shadow: 0 4px 6px rgba(255, 193, 7, 0.2); }

    /* Holding (Danger) */
    .sub-tabs .nav-link.tab-holding { color: #dc3545; border-color: #dc3545; background: rgba(220, 53, 69, 0.05); }
    .sub-tabs .nav-link.tab-holding:hover { background: rgba(220, 53, 69, 0.1); }
    .sub-tabs .nav-link.active.tab-holding { background-color: #dc3545 !important; color: white !important; box-shadow: 0 4px 6px rgba(220, 53, 69, 0.2); }

    /* Finished (Success) */
    .sub-tabs .nav-link.tab-finished { color: #198754; border-color: #198754; background: rgba(25, 135, 84, 0.05); }
    .sub-tabs .nav-link.tab-finished:hover { background: rgba(25, 135, 84, 0.1); }
    .sub-tabs .nav-link.active.tab-finished { background-color: #198754 !important; color: white !important; box-shadow: 0 4px 6px rgba(25, 135, 84, 0.2); }

    /* Material Bars */
    .material-bar-container {
        height: 8px;
        background-color: #f0f2f5;
        border-radius: 10px;
        overflow: hidden;
        margin-top: 6px;
    }
    .material-bar {
        height: 100%;
        border-radius: 10px;
        transition: width 1s ease-in-out;
    }
    .stat-card-mini {
        background: white;
        border-radius: 12px;
        padding: 1.25rem;
        border: 1px solid #f0f0f0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    /* Professional Tooltips */
    .custom-tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 13px;
        pointer-events: none;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
        max-width: 250px;
    }
    
    .custom-tooltip::before {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid rgba(0, 0, 0, 0.95);
    }
    
    .custom-tooltip .tooltip-title {
        font-weight: 600;
        margin-bottom: 6px;
        font-size: 14px;
        border-bottom: 1px solid rgba(255,255,255,0.2);
        padding-bottom: 6px;
    }
    
    .custom-tooltip .tooltip-value {
        font-size: 18px;
        font-weight: 700;
        color: #3b82f6;
    }
    
    .custom-tooltip .tooltip-detail {
        font-size: 11px;
        opacity: 0.8;
        margin-top: 4px;
    }
    
    .chart-element-hover {
        transition: all 0.2s ease;
    }
    
    .chart-element-hover:hover {
        opacity: 1 !important;
        transform: scale(1.05);
    }
  `;
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [searchText, setSearchText] = useState([]);
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [noteDoctor, setNoteDoctor] = useState("");

  const navigate = useNavigate();
  // Assignment State
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [assignUsers, setAssignUsers] = useState([]); // All users for assignment
  const [receptionUsers, setReceptionUsers] = useState([]);
  const [selectedAssignUser, setSelectedAssignUser] = useState(""); // Single user for assignment (Receptionist)
  const [doctorToUnassign, setDoctorToUnassign] = useState(null);
  const [isUnassignLoading, setIsUnassignLoading] = useState(false);
  const [assignmentAction, setAssignmentAction] = useState("assign");
  const [previousUserId, setPreviousUserId] = useState("");

  const roles = [0, 1, 2, 3, 4, 5, 6];
  const Roles = {
    0: "admin",
    1: "manager",
    2: "teamleader",
    3: "technician",
    // Add more roles as needed
  };

  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorCases(selectedDoctor._id);
    }
  }, [selectedDoctor]);

  const fetchDoctorCases = async (doctorId) => {
    setIsCasesLoading(true);
    try {
      const res = await axios.get(`${_global.BASE_URL}doctors/casesbydoctor/${doctorId}`);
      const result = res.data;
      setDoctorCases(result);
      setAllCases(result);
      setBuffAllCases(result);
      setFinishedCases(result.filter((r) => r.delivering.status.isEnd === true));
      setHoldingCases(result.filter((r) => r.isHold));
      setNotStartCases(
        result.filter(
          (r) =>
            r.cadCam.actions.length <= 0 &&
            r.delivering.status.isEnd === false &&
            r.isHold === false
        )
      );
      setInProcessCases(
        result.filter(
          (r) =>
            r.delivering.status.isEnd === false &&
            r.cadCam.actions.length > 0 &&
            !r.isHold
        )
      );
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setIsCasesLoading(false);
    }
  };

  const getDoctors = () => {
    axios
      .get(_global.BASE_URL + "doctors")
      .then((res) => {
        const result = res.data;
        setDoctors(result);
        setBuffDoctors(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Helpers for Cases (from AssignedDoctors.js)
  const groupTeethNumbersByName = (teethNumbers) => {
    const result = {};
    teethNumbers.forEach(tn => {
      result[tn.name] = (result[tn.name] || 0) + 1;
    });
    return Object.entries(result).map(([name, count]) => ({ name, count }));
  };

  const checkCaseDate = (item) => {
    let response = "";
    let teethNumbersByName = groupTeethNumbersByName(item.teethNumbers);
    const days = _global.getDaysfromTowDates(item.dateIn, new Date());
    if (teethNumbersByName.length > 0) {
      const implant = teethNumbersByName.find(te => te.name === "Screw Retain Crown");
      const zircon = teethNumbersByName.find(t => t.name === "Zircon");
      const veneer = teethNumbersByName.find(tee => tee.name === "Veneer");
      const emax = teethNumbersByName.find(tee => tee.name === "E-Max / Inlay/ Onlay");
      const emaxCrown = teethNumbersByName.find(tee => tee.name === "E-Max Crown");
      const study = teethNumbersByName.find(tee => tee.name === "Study");
      if (implant && implant?.count >= 4 && implant?.count <= 5 && days >= 4 && !item.receptionPacking.status.isEnd) response = "table-danger";
      if (implant && implant?.count >= 7 && days > 7 && !item.receptionPacking.status.isEnd) response = "table-danger";
      if (((zircon && zircon?.count === 4 && days > 3) || (veneer && veneer?.count === 4 && days > 3)) && !item.receptionPacking.status.isEnd) response = "table-danger";
      if (((zircon && zircon?.count > 4 && days > 7) || (veneer && veneer?.count > 4 && days > 7)) && !item.receptionPacking.status.isEnd) response = "table-danger";
      if (((emax && emax?.count > 4 && days > 7) || (emax && emax?.count === 4 && days > 3)) && !item.receptionPacking.status.isEnd) response = "table-danger";
      if (((emaxCrown && emaxCrown?.count > 4 && days > 7) || (emaxCrown && emaxCrown?.count === 4 && days > 3)) && !item.receptionPacking.status.isEnd) response = "table-danger";
      if (study && study?.count >= 1 && days >= 3 && !item.receptionPacking.status.isEnd) response = "table-danger";
    }
    return response;
  };

  const getReasonlate = (item) => {
    let msg = "";
    let teethNumbersByName = groupTeethNumbersByName(item.teethNumbers);
    const days = _global.getDaysfromTowDates(item.dateIn, new Date());
    if (teethNumbersByName.length > 0) {
      const implant = teethNumbersByName.find(te => te.name === "Screw Retain Crown");
      const zircon = teethNumbersByName.find(t => t.name === "Zircon");
      const veneer = teethNumbersByName.find(tee => tee.name === "Veneer");
      const study = teethNumbersByName.find(tee => tee.name === "Study");
      if (implant && implant?.count >= 4 && implant?.count <= 5 && days >= 4) msg = "4,5 units implants and more than 4 days";
      if (implant && implant?.count >= 7 && days > 7) msg = "more than 7 units implants and more than 7 days";
      if (zircon && zircon?.count === 4 && days > 3) msg = "4 units Zircon and more than 3 days";
      if (study && study?.count >= 1 && days >= 3) msg = "study than 3 days";
    }
    return msg;
  };

  const checkNotStartDelay = (item) => {
    if (
      item.cadCam.actions.length <= 0 &&
      item.delivering.status.isEnd === true
    ) {
      return "table-info";
    }
  };

  function sumOfTeethNumbersLength(type) {
    let totalLength = 0;
    const casesToUse =
      type === "All" ? allCases :
        type === "Start" ? notStartCases :
          type === "progress" ? inProcessCases :
            type === "holding" ? holdingCases :
              type === "End" ? finishedCases : [];

    casesToUse.forEach((caseItem) => {
      totalLength += caseItem.teethNumbers.length;
    });
    return totalLength;
  }

  const getStudyCases = (data) => {
    return data.find((r) => r.name === "Study")
      ? data.find((r) => r.name === "Study")?.count
      : 0;
  };

  function groupCasesTeethNumbersByName(type) {
    const result = {};
    const casesToUse =
      type === "All" ? allCases :
        type === "Start" ? notStartCases :
          type === "progress" ? inProcessCases :
            type === "holding" ? holdingCases :
              type === "End" ? finishedCases : [];

    casesToUse.forEach((singleCase) => {
      singleCase.teethNumbers.forEach((teethNumber) => {
        const { name } = teethNumber;
        if (!result[name]) {
          result[name] = 0;
        }
        result[name]++;
      });
    });
    return Object.entries(result).map(([name, count]) => ({ name, count }));
  }

  // State for Case Tabs and Search
  const [activeCaseTab, setActiveCaseTab] = useState("all"); // all, notStart, inProcess, holding, finished
  const [caseSearchText, setCaseSearchText] = useState("");
  const [caseFilterType, setCaseFilterType] = useState("all");

  // State for Charts Filter
  const [statsFilter, setStatsFilter] = useState("all"); // all, currentMonth, last3Months, etc.
  const [selectedTrendMonth, setSelectedTrendMonth] = useState(null); // For interactive trend chart
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 }); // For rich tooltips

  const filterCasesByPeriod = (cases, period) => {
    if (!cases || cases.length === 0) return [];
    if (period === 'all') return cases;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return cases.filter(c => {
      // Use createdAt instead of dateIn
      const dateToUse = c.createdAt || c.dateIn;
      if (!dateToUse) return false;

      const caseDate = new Date(dateToUse);
      const caseYear = caseDate.getFullYear();
      const caseMonth = caseDate.getMonth();

      switch (period) {
        case 'currentMonth':
          return caseYear === currentYear && caseMonth === currentMonth;
        case 'previousMonth':
          // Logic for previous month, handling January rollover
          const prevMonthDate = new Date();
          prevMonthDate.setMonth(currentMonth - 1);
          return caseYear === prevMonthDate.getFullYear() && caseMonth === prevMonthDate.getMonth();
        case 'last3Months':
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(currentMonth - 3);
          return caseDate >= threeMonthsAgo;
        case 'yearToDate':
          return caseYear === currentYear;
        case 'lastYear':
          return caseYear === currentYear - 1;
        default:
          return true;
      }
    });
  };

  const getFilteredCases = () => {
    let currentCases = [];
    if (activeCaseTab === 'all') currentCases = buffAllCases;
    else if (activeCaseTab === 'notStart') currentCases = notStartCases;
    else if (activeCaseTab === 'inProcess') currentCases = inProcessCases;
    else if (activeCaseTab === 'holding') currentCases = holdingCases;
    else if (activeCaseTab === 'finished') currentCases = finishedCases;

    let filtered = currentCases;

    // Search Filter
    if (caseSearchText) {
      filtered = filtered.filter(item =>
        item.caseNumber?.toLowerCase().includes(caseSearchText.toLowerCase()) ||
        item.patientName.toLowerCase().includes(caseSearchText.toLowerCase()) ||
        item.dentistObj?.name.toLowerCase().includes(caseSearchText.toLowerCase())
      );
    }

    // Date Filter (Month)
    if (caseFilterType === "currentMonth") {
      filtered = _global.filterCasesByDate(filtered, "currentMonth");
    } else if (caseFilterType === "previousMonth") {
      filtered = _global.filterCasesByDate(filtered, "previousMonth");
    }

    return filtered;
  };

  // State (Tabs) -- Moved to top
  // ... (Other state)

  // Render Functions
  const renderTabs = () => (
    <div className="detail-tabs">
      {isAdminOrSuperAdmin && (
        <button
          className={`tab-btn tab-stats ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      )}
      <button
        className={`tab-btn tab-cases ${activeTab === 'cases' ? 'active' : ''}`}
        onClick={() => setActiveTab('cases')}
      >
        Cases <span className="badge bg-light text-primary rounded-pill ms-1">{doctorCases.length}</span>
      </button>
      <button
        className={`tab-btn tab-profile ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        Profile
      </button>
    </div>
  );

  const renderCases = () => {
    return (
      <div className="animate__animated animate__fadeIn">
        {isCasesLoading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <>
            {/* Case Sub-Tabs */}
            <ul className="nav nav-tabs mb-3 sub-tabs" role="tablist">
              <li className="nav-item">
                <button
                  className={`nav-link tab-all ${activeCaseTab === 'all' ? 'active' : ''}`}
                  onClick={() => { setActiveCaseTab('all'); setCaseSearchText(""); }}
                >
                  All <small>({buffAllCases.length})</small>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link tab-not-start ${activeCaseTab === 'notStart' ? 'active' : ''}`}
                  onClick={() => { setActiveCaseTab('notStart'); setCaseSearchText(""); }}
                >
                  Not Start <small>({notStartCases.length})</small>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link tab-in-process ${activeCaseTab === 'inProcess' ? 'active' : ''}`}
                  onClick={() => { setActiveCaseTab('inProcess'); setCaseSearchText(""); }}
                >
                  In Progress <small>({inProcessCases.length})</small>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link tab-holding ${activeCaseTab === 'holding' ? 'active' : ''}`}
                  onClick={() => { setActiveCaseTab('holding'); setCaseSearchText(""); }}
                >
                  Holding <small>({holdingCases.length})</small>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link tab-finished ${activeCaseTab === 'finished' ? 'active' : ''}`}
                  onClick={() => { setActiveCaseTab('finished'); setCaseSearchText(""); }}
                >
                  Finished <small>({finishedCases.length})</small>
                </button>
              </li>
            </ul>

            {/* Filters */}
            <div className="row g-2 mb-3">
              <div className="col-lg-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name | case number | case type"
                  value={caseSearchText}
                  onChange={(e) => setCaseSearchText(e.target.value)}
                />
              </div>
              <div className="col-lg-4">
                <select
                  className="form-select"
                  value={caseFilterType}
                  onChange={(e) => setCaseFilterType(e.target.value)}
                >
                  <option value="all">All Dates</option>
                  <option value="currentMonth">Current Month</option>
                  <option value="previousMonth">Previous Month</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {getFilteredCases().length > 0 ? (
              <div className="table-responsive">
                <table className="table text-center table-bordered table-hover align-middle">
                  <thead className="table-secondary">
                    <tr>
                      <th scope="col">Case #</th>
                      <th scope="col">Patient</th>
                      <th scope="col">In</th>
                      <th scope="col">Due</th>
                      <th scope="col">Status</th>
                      <th scope="col">#Tooth</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredCases().map(item => (
                      <tr
                        key={item._id}
                        className={(item.isHold ? "table-danger" : "") || checkCaseDate(item) || (activeCaseTab === 'notStart' ? checkNotStartDelay(item) : "")}
                      >
                        <td
                          className="fw-bold"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title={getReasonlate(item)}
                        >
                          {item.caseNumber}
                        </td>
                        <td>
                          <div className="fw-medium">{item.patientName}</div>
                          {/* <div className="small text-muted">{item.caseType}</div> */}
                        </td>
                        <td>{format(new Date(item.dateIn), 'dd MMM yyyy')}</td>
                        <td>{item.dateOut ? format(new Date(item.dateOut), 'dd MMM yyyy') : "-"}</td>
                        <td>
                          {item.isHold ? (
                            <span className="badge bg-danger">Hold</span>
                          ) : item.delivering?.status?.isEnd ? (
                            <span className="badge bg-success">Finished</span>
                          ) : item.cadCam?.actions?.length <= 0 ? (
                            <span className="badge bg-info text-dark">Not Start</span>
                          ) : (
                            <span className="badge bg-warning text-dark">In Process</span>
                          )}
                        </td>
                        <td className={item.teethNumbers.length <= 0 ? "bg-danger text-white" : ""}>
                          <b>{item.teethNumbers.length}</b>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-light text-primary rounded-circle shadow-sm"
                            onClick={() => setBuffCase(item)}
                            data-bs-toggle="modal"
                            data-bs-target="#viewModal"
                            title="View Details"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          {item?.historyHolding?.length > 0 && (
                            <button
                              className="btn btn-sm btn-light text-primary rounded-circle shadow-sm ms-1"
                              data-bs-toggle="modal"
                              data-bs-target="#caseHoldHistoryModal"
                              onClick={() => setBuffCase(item)}
                              title="History"
                            >
                              <i className="fas fa-history"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Material Summary Rows - Only for Admin */}
                    {isAdminOrSuperAdmin && getFilteredCases().length > 0 && (
                      <>
                        <tr>
                          <td className="fw-bold text-success" colSpan={5}>
                            <b>Total of Pieces</b>
                          </td>
                          <td className="bg-success p-2 text-white bg-opacity-75" colSpan={2}>
                            <b>{getFilteredCases().reduce((sum, c) => sum + c.teethNumbers.length, 0)}</b>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold text-success" colSpan={5}>
                            <b>Total Without Study</b>
                          </td>
                          <td className="bg-success p-2 text-white bg-opacity-75" colSpan={2}>
                            <b>
                              {(() => {
                                const cases = getFilteredCases();
                                const total = cases.reduce((sum, c) => sum + c.teethNumbers.length, 0);
                                const study = cases.reduce((sum, c) =>
                                  sum + c.teethNumbers.filter(t => t.name === "Study").length, 0
                                );
                                return total - study;
                              })()}
                            </b>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={7}>
                            <div className="summary-teeth-cases">
                              {(() => {
                                const materialCounts = {};
                                getFilteredCases().forEach(c => {
                                  c.teethNumbers.forEach(t => {
                                    materialCounts[t.name] = (materialCounts[t.name] || 0) + 1;
                                  });
                                });
                                return Object.entries(materialCounts).map(([name, count]) => (
                                  <p className="mb-0" key={name}>
                                    <span>{name}:</span>
                                    <b className="badge text-bg-success">{count}</b>
                                  </p>
                                ));
                              })()}
                            </div>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="fa-regular fa-folder-open fa-2x mb-3 opacity-25"></i>
                <p className="mb-0">No filtered cases found.</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderStatistics = () => {
    if (isCasesLoading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    // Filter Logic
    const filteredCases = filterCasesByPeriod(doctorCases, statsFilter);

    // Calculate Stats (Filtered)
    const total = filteredCases.length || 1; // avoid division by zero
    const finished = filteredCases.filter(c => c.delivering?.status?.isEnd).length;
    const hold = filteredCases.filter(c => c.isHold).length;
    const process = filteredCases.length - finished - hold;

    // Calc Percentages for SVG
    const finishedPct = (finished / total) * 100;
    const holdPct = (hold / total) * 100;
    const processPct = (process / total) * 100;

    // Helper to get color for material (Professional Palette)
    const getMaterialColor = (name) => {
      const colors = {
        "Zircon": "#3b82f6",        // Professional Blue
        "Emax": "#8b5cf6",          // Professional Purple
        "E-Max / Inlay/ Onlay": "#8b5cf6",
        "E-Max Crown": "#a855f7",
        "Veneer": "#ec4899",        // Professional Pink
        "Screw Retain Crown": "#f97316", // Professional Orange
        "Study": "#10b981",         // Professional Green
        "PMMA": "#eab308",          // Professional Amber
        "Titanium": "#64748b"       // Professional Slate
      };
      return colors[name] || "#06b6d4"; // Professional Cyan
    };

    // Material Data (Filtered by statsFilter AND selectedTrendMonth)
    let casesForMaterials = filteredCases;

    // If a trend month is selected, further filter by that specific month
    if (selectedTrendMonth !== null) {
      casesForMaterials = filteredCases.filter(c => {
        const dateToUse = c.createdAt || c.dateIn;
        if (!dateToUse) return false;
        const cDate = new Date(dateToUse);
        return cDate.getMonth() === selectedTrendMonth.month && cDate.getFullYear() === selectedTrendMonth.year;
      });
    }

    const materialDataRaw = {};
    casesForMaterials.forEach(c => {
      c.teethNumbers.forEach(t => {
        materialDataRaw[t.name] = (materialDataRaw[t.name] || 0) + 1;
      });
    });
    const materialData = Object.entries(materialDataRaw).map(([name, count]) => ({ name, count }));

    // Total Pieces (Filtered)
    let totalPieces = 0;
    casesForMaterials.forEach(c => totalPieces += c.teethNumbers.length);

    const totalWithoutStudy = totalPieces - (materialDataRaw["Study"] || 0);
    const studyCases = materialDataRaw["Study"] || 0;
    const maxMaterialCount = Math.max(...(materialData.map(m => m.count) || [0]), 1);

    // Trend Analysis Data (Last 6 Months) with Material Breakdown
    const getLast6MonthsData = () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
          name: d.toLocaleString('default', { month: 'short' }),
          month: d.getMonth(),
          year: d.getFullYear(),
          count: 0,
          materials: {} // Track materials for this month
        });
      }
      doctorCases.forEach(c => {
        const dateToUse = c.createdAt || c.dateIn;
        if (!dateToUse) return;
        const cDate = new Date(dateToUse);
        const match = months.find(m => m.month === cDate.getMonth() && m.year === cDate.getFullYear());
        if (match) {
          match.count++;
          // Count materials for this month
          c.teethNumbers.forEach(t => {
            match.materials[t.name] = (match.materials[t.name] || 0) + 1;
          });
        }
      });
      return months;
    };
    const trendData = getLast6MonthsData();
    const maxTrend = Math.max(...trendData.map(d => d.count), 1);

    // SVG Circle Props
    const radius = 15.9155;
    // const circumference = 2 * Math.PI * radius; // ~100

    return (
      <div className="animate__animated animate__fadeIn">
        {/* <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="fw-bold mb-0">Performance Overview</h6>
          <select
            className="form-select w-auto form-select-sm shadow-sm border-0 bg-light fw-medium"
            value={statsFilter}
            onChange={(e) => setStatsFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="currentMonth">Current Month</option>
            <option value="previousMonth">Previous Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="yearToDate">Year to Date (YTD)</option>
            <option value="lastYear">Last Year</option>
          </select>
        </div> */}

        {/* Main Donut & Summary Grid */}
        <div className="row g-4 mb-5">
          <div className="col-md-5">
            <div className="chart-container">
              <svg viewBox="0 0 42 42" className="donut-chart">
                <circle cx="21" cy="21" r="15.9155" fill="#fff"></circle>
                <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#e9ecef" strokeWidth="3"></circle>
                <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#ffc107" strokeWidth="5" strokeDasharray={`${processPct} ${100 - processPct}`} strokeDashoffset="25"></circle>
                <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#198754" strokeWidth="5" strokeDasharray={`${finishedPct} ${100 - finishedPct}`} strokeDashoffset={`${25 - processPct}`}></circle>
                <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#dc3545" strokeWidth="5" strokeDasharray={`${holdPct} ${100 - holdPct}`} strokeDashoffset={`${25 - processPct - finishedPct}`}></circle>
              </svg>
              <div className="chart-center-text">
                <div className="h4 fw-bold mb-0">{filteredCases.length}</div>
                <div className="small text-muted">Cases</div>
              </div>
            </div>
          </div>

          <div className="col-md-7">
            <div className="row g-3 h-100 align-content-center">
              <div className="col-4"><div className="stat-card" style={{ borderLeft: '4px solid #198754' }}><h3 className="fw-bold text-success mb-1">{finished}</h3><div className="small text-muted">Finished</div></div></div>
              <div className="col-4"><div className="stat-card" style={{ borderLeft: '4px solid #ffc107' }}><h3 className="fw-bold text-warning mb-1">{process}</h3><div className="small text-muted">In Process</div></div></div>
              <div className="col-4"><div className="stat-card" style={{ borderLeft: '4px solid #dc3545' }}><h3 className="fw-bold text-danger mb-1">{hold}</h3><div className="small text-muted">On Hold</div></div></div>


              <div className="col-4"><div className="stat-card-mini bg-primary bg-opacity-10 border-primary border-opacity-10"><div className="d-flex align-items-center gap-3"><div className="bg-white p-2 rounded-circle text-primary shadow-sm"><i className="fa-solid fa-tooth fa-lg"></i></div><div><h4 className="fw-bold text-primary mb-0">{totalPieces}</h4><div className="small text-primary text-opacity-75 fw-medium">Total Pieces</div></div></div></div></div>
              <div className="col-4"><div className="stat-card-mini bg-info bg-opacity-10 border-info border-opacity-10"><div className="d-flex align-items-center gap-3"><div className="bg-white p-2 rounded-circle text-info shadow-sm"><i className="fa-solid fa-layer-group fa-lg"></i></div><div><h4 className="fw-bold text-info mb-0">{totalWithoutStudy}</h4><div className="small text-info text-opacity-75 fw-medium">Without Study</div></div></div></div></div>
              <div className="col-4"><div className="stat-card-mini bg-success bg-opacity-10 border-success border-opacity-10"><div className="d-flex align-items-center gap-3"><div className="bg-white p-2 rounded-circle text-success shadow-sm"><i className="fa-solid fa-microscope fa-lg"></i></div><div><h4 className="fw-bold text-success mb-0">{studyCases}</h4><div className="small text-success text-opacity-75 fw-medium">Study Cases</div></div></div></div></div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Trend Chart */}
          <div className="col-lg-6">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">6-Month Trend</h6>
              {selectedTrendMonth && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSelectedTrendMonth(null)}
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-end justify-content-between h-100 px-2" style={{ minHeight: '200px' }}>
                {trendData.map((d, i) => {
                  const isSelected = selectedTrendMonth && selectedTrendMonth.month === d.month && selectedTrendMonth.year === d.year;
                  const percentage = ((d.count / doctorCases.length) * 100).toFixed(1);
                  const topMaterials = Object.entries(d.materials || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
                  return (
                    <div
                      key={i}
                      className="d-flex flex-column align-items-center gap-2"
                      style={{ width: '14%', cursor: 'pointer' }}
                      onClick={() => setSelectedTrendMonth(d)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          show: true,
                          content: (
                            <div>
                              <div className="tooltip-title">{d.name} {d.year}</div>
                              <div className="tooltip-value">{d.count} Cases</div>
                              <div className="tooltip-detail">{percentage}% of total</div>
                              {topMaterials.length > 0 && (
                                <>
                                  <div className="tooltip-detail mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '6px' }}>
                                    <strong>Top Materials:</strong>
                                  </div>
                                  {topMaterials.map(([name, count]) => (
                                    <div key={name} className="tooltip-detail" style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                                      <span>{name}</span>
                                      <span style={{ color: getMaterialColor(name) }}><strong>{count}</strong></span>
                                    </div>
                                  ))}
                                </>
                              )}
                              <div className="tooltip-detail mt-1">👆 Click to filter</div>
                            </div>
                          ),
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10
                        });
                      }}
                      onMouseLeave={() => setTooltip({ show: false, content: '', x: 0, y: 0 })}
                    >
                      <div className="w-100 bg-light rounded-top position-relative group-hover" style={{ height: '150px' }}>
                        <div
                          className="position-absolute bottom-0 w-100 rounded-top chart-element-hover"
                          style={{
                            height: `${(d.count / maxTrend) * 100}%`,
                            backgroundColor: isSelected ? '#3b82f6' : '#64748b',
                            opacity: isSelected ? 1 : 0.7,
                            transition: 'all 0.3s ease'
                          }}
                        ></div>
                      </div>
                      <span className={`small fw-medium ${isSelected ? 'text-primary' : 'text-muted'}`}>{d.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Material Chart */}
          <div className="col-lg-6">
            <h6 className="fw-bold mb-3">
              Material Breakdown
              {selectedTrendMonth && <small className="text-muted ms-2">({selectedTrendMonth.name} {selectedTrendMonth.year})</small>}
            </h6>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              {materialData && materialData.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {materialData.map((item, index) => {
                    const widthPct = (item.count / maxMaterialCount) * 100;
                    const totalPct = ((item.count / totalPieces) * 100).toFixed(1);
                    const color = getMaterialColor(item.name);
                    return (
                      <div
                        key={index}
                        className="row align-items-center g-2"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            show: true,
                            content: (
                              <div>
                                <div className="tooltip-title">{item.name}</div>
                                <div className="tooltip-value">{item.count} pieces</div>
                                <div className="tooltip-detail">{totalPct}% of total</div>
                                {selectedTrendMonth && <div className="tooltip-detail mt-1">📅 {selectedTrendMonth.name} {selectedTrendMonth.year}</div>}
                              </div>
                            ),
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10
                          });
                        }}
                        onMouseLeave={() => setTooltip({ show: false, content: '', x: 0, y: 0 })}
                      >
                        <div className="col-3 text-truncate"><span className="fw-medium text-dark small">{item.name}</span></div>
                        <div className="col-7"><div className="material-bar-container"><div className="material-bar" style={{ width: `${widthPct}%`, backgroundColor: color }} title={`${item.count} items`}></div></div></div>
                        <div className="col-2 text-end"><span className="fw-bold small" style={{ color: color }}>{item.count}</span></div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 text-muted small">No data for selected period.</div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Tooltip */}
        {tooltip.show && (
          <div
            className="custom-tooltip"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
              position: 'fixed'
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    );
  };
  useEffect(() => {
    axios
      .get(`${_global.BASE_URL}doctors`)
      .then((res) => {
        const result = res.data;
        setDoctors(result);
        setBuffDoctors(result);
        console.log(result);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
      });

    // Fetch users for assignment (Receptionists)
    axios
      .get(`${_global.BASE_URL}users`)
      .then((res) => {
        const users = res.data;
        // Filter for Reception role (id 4)
        const receptionists = users.filter((u) => u.roles.includes(4) && u.active);
        setReceptionUsers(receptionists);
        setAssignUsers(users); // Keep all if needed later
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  // assignment functions
  const handleDoctorSelection = (id, checked) => {
    if (checked) {
      setSelectedDoctors((prev) => [...prev, id]);
    } else {
      setSelectedDoctors((prev) => prev.filter((dId) => dId !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = doctors
        .filter((d) => !d?.assignmentDetails?.isAssigned)
        .map((d) => d._id);
      setSelectedDoctors(allIds);
    } else {
      setSelectedDoctors([]);
    }
  };

  const handleAssign = async () => {
    if (selectedDoctors.length === 0) {
      showToastMessage("No doctors selected", "error");
      return;
    }
    if (!selectedAssignUser) {
      showToastMessage("No receptionist selected", "error");
      return;
    }

    const receptionist = receptionUsers.find(u => u._id === selectedAssignUser);
    const assignment = {
      department: "Reception",
      userId: selectedAssignUser,
      userName: `${receptionist.firstName} ${receptionist.lastName}`, // optional, for display
      assignedBy: `${user.firstName} ${user.lastName}`, // optional, for display
      assignedById: user._id, // optional, for display
      assignedAt: new Date(),
      doctorIds: selectedDoctors,
      action: assignmentAction,
      previousUserId: assignmentAction === "reassign" ? previousUserId : undefined,
    };

    try {
      await fetch(`${_global.BASE_URL}doctors/assign-doctors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignment),
      });
      showToastMessage("Assigned successfully", "success");

      // Refresh doctors locally
      const updatedDoctors = doctors.map(d => {
        if (selectedDoctors.includes(d._id)) {
          const currentAssignments = d.assignments || [];
          const updatedAssignments = [
            ...currentAssignments.filter(a => a.department !== "Reception"),
            assignment
          ];
          return {
            ...d,
            assignments: updatedAssignments,
            assignmentDetails: {
              ...d.assignmentDetails,
              isAssigned: true,
              assignedToUser: selectedAssignUser,
              assignedToUserName: assignment.userName,
              assignedBy: assignment.assignedBy,
              assignedById: user._id,
              assignedAt: assignment.assignedAt,
            }
          };
        }
        return d;
      });
      setDoctors(updatedDoctors);
      setBuffDoctors(updatedDoctors); // Also update buffer
      setSelectedDoctors([]);
      setSelectedAssignUser("");
      setPreviousUserId("");
      setAssignmentAction("assign");

    } catch (error) {
      console.error("Assignment error", error);
      showToastMessage("Error assigning doctors", "error");
    }
  };

  const handleUnassign = async () => {
    if (!doctorToUnassign) return;

    setIsUnassignLoading(true);
    const payload = {
      doctorIds: [doctorToUnassign._id],
      action: "unassign",
      department: "Reception",
      userId: doctorToUnassign.assignmentDetails.assignedToUser,
      userName: `${user.firstName} ${user.lastName}`, // optional, for display
      assignedBy: `${user.firstName} ${user.lastName}`, // optional, for display
      assignedById: user._id, // optional, for display
      assignedAt: new Date(),
    };

    try {
      await fetch(`${_global.BASE_URL}doctors/assign-doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      showToastMessage("Unassigned successfully", "success");
      // Update local state
      const updatedDoctors = doctors.map(d => {
        if (d._id === doctorToUnassign._id) {
          // clear assignment details
          const { assignmentDetails, ...rest } = d;
          return { ...rest, assignmentDetails: { isAssigned: false } }; // or null
        }
        return d;
      });
      setDoctors(updatedDoctors);
      setBuffDoctors(updatedDoctors);
      setDoctorToUnassign(null);

    } catch (error) {
      console.error(error);
      showToastMessage("Error unassigning", "error");
    } finally {
      setIsUnassignLoading(false);
    }
  };

  const handleReassign = (doctor) => {
    // Open modal for this doctor only
    setSelectedDoctors([doctor._id]);
    setAssignmentAction("reassign");
    setPreviousUserId(doctor.assignmentDetails?.assignedToUser || "");
    // If we want to pre-fill current user:
    if (doctor.assignmentDetails?.assignedToUser) {
      setSelectedAssignUser(doctor.assignmentDetails.assignedToUser);
    }
  };


  const deleteDoctor = (id) => {
    axios
      .delete(`${_global.BASE_URL}doctors/${id}`)
      .then((res) => {
        const result = res.data;
        const filteredDoctors = doctors.filter(
          (doctor) => doctor._id !== result._id
        );
        setDoctors(filteredDoctors);
        showToastMessage("Deleted Doctor successfully", "success");
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
      });
  };
  const onAddDoctor = async () => {
    // e.preventDefault();
    const doctorModel = {
      firstName,
      lastName,
      email,
      password: `${firstName}123@@`,
      confirmPassword: `${firstName}123@@`,
      phone,
      gender: "Male",
      address: {
        street: "",
        city: city,
        state: "",
        zipCode: "",
        country: country,
      },
      clinicName,
      specialization,
      registrationNumber,
      notes: [],
      photo: "https://example.com/photo.jpg",
      active: true,
    };
    console.log(doctorModel);
    const response = await fetch(`${_global.BASE_URL}doctors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(doctorModel),
    });
    const json = await response.json();
    if (response.ok) {
      showToastMessage("Added Doctor successfully", "success");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setGender("");
      setCountry("");
      setCity("");
      setEmptyFields([]);
    }
    if (!response.ok) {
      console.log(json);
      showToastMessage("Added User successfully", "error");
      const newDoctors = [...doctors, JSON.parse(JSON.stringify(json.data))];
      setDoctors(newDoctors);
      setEmptyFields(json.emptyFields);
    }
  };
  const onAddNote = async () => {
    // e.preventDefault();
    buffDoctor.notes.push({
      title: noteDoctor,
      date: new Date(),
      addedBy: "Admin",
    });
    console.log(buffDoctor);
    console.log(noteDoctor);
    const response = await fetch(
      `${_global.BASE_URL}doctors/${buffDoctor._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buffDoctor),
      }
    );
    const json = await response.json();
    if (response.ok) {
      setNoteDoctor("");
      showToastMessage("Added note to successfully", "success");
    }
    // if (!response.ok) {
    //   console.log(json);
    //   const newUsers = [...users, JSON.parse(JSON.stringify(json.data))];
    //   setUsers(newUsers);
    //   setEmptyFields(json.emptyFields);
    // }
  };
  const onUpdateDoctor = async () => {
    const response = await fetch(
      `${_global.BASE_URL}doctors/${buffDoctor._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buffDoctor),
      }
    );
    const json = await response.json();
    if (response.ok) {
      setNoteDoctor("");
      showToastMessage("Updated note to successfully", "success");
    }
    // if (!response.ok) {
    //   console.log(json);
    //   const newUsers = [...users, JSON.parse(JSON.stringify(json.data))];
    //   setUsers(newUsers);
    //   setEmptyFields(json.emptyFields);
    // }
  };
  const searchByName = (searchText) => {
    setSearchText(searchText);
    setCountryFilter("");
    setRegionFilter("");
    console.log(searchText);

    if (searchText !== "") {
      const filteredDoctor = buffDoctors.filter(
        (item) =>
          item.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.lastName.toLowerCase().includes(searchText.toLowerCase())
      );
      setDoctors(filteredDoctor);
    } else {
      setDoctors(buffDoctors);
    }
  };
  const searchByCountry = (searchText) => {
    setCountryFilter(searchText);
    if (searchText !== "") {
      const filteredDoctor = buffDoctors.filter((item) =>
        item.address.country.toLowerCase().includes(searchText.toLowerCase())
      );
      setDoctors(filteredDoctor);
    } else {
      setDoctors(buffDoctors);
    }
  };
  const searchByCity = (searchText) => {
    setCountryFilter(countryFilter);
    setRegionFilter(searchText);
    if (searchText !== "") {
      const filteredDoctor = buffDoctors.filter(
        (item) =>
          item.address.country
            .toLowerCase()
            .includes(countryFilter.toLowerCase()) &&
          item.address.city.toLowerCase().includes(searchText.toLowerCase())
      );
      setDoctors(filteredDoctor);
    } else {
      setDoctors(buffDoctors);
    }
  };
  const handlePrint = useReactToPrint({
    content: () => doctorsRef.current,
    documentTitle: `List of Doctors`,
  });
  const selectCountry = (val) => {
    setCountry(val);
  };
  const selectRegion = (val) => {
    setRegion(val);
    setCity(val);
  };
  const viewCases = (item) => {
    navigate("/layout/cases-by-doctors", {
      state: { ...item, type: "doctors" },
    });
  };
  return (
    <>
      <div className="container-fluid p-0 h-100 bg-light">
        <style>{styles}</style>

        <div className="master-detail-wrapper">
          {/* Master Panel */}
          <div className="master-panel">
            <div className="master-header">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-dark">Doctors</h5>
                <span className="badge bg-light text-secondary border rounded-pill px-3">
                  {doctors.length} Total
                </span>
                {(user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.super_admin) && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm rounded-pill shadow-sm"
                      onClick={handlePrint}
                      title="Print List"
                    >
                      <i className="fa-solid fa-print"></i>
                    </button>
                    <button
                      className="btn btn-primary btn-sm rounded-pill shadow-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    >
                      <i className="fa-solid fa-plus me-1"></i> New
                    </button>
                  </div>
                )}
              </div>

              {/* Filters */}
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="position-relative">
                  <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ fontSize: '14px' }}></i>
                  <input
                    type="text"
                    className="form-control bg-light border-0 ps-5"
                    placeholder="Search doctors..."
                    value={searchText}
                    onChange={(e) => searchByName(e.target.value)}
                  />
                </div>
                <div className="d-flex gap-2">
                  <CountryDropdown
                    className="form-select form-select-sm bg-light border-0"
                    value={countryFilter}
                    onChange={(val) => searchByCountry(val)}
                    defaultOptionLabel="All Countries"
                  />
                  {countryFilter && (
                    <RegionDropdown
                      className="form-select form-select-sm bg-light border-0"
                      country={countryFilter}
                      value={regionFilter}
                      onChange={(val) => searchByCity(val)}
                      defaultOptionLabel="All Cities"
                    />
                  )}
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedDoctors.length > 0 && (
                <div className="d-flex align-items-center justify-content-between bg-primary-soft p-2 rounded-3 border border-primary-subtle animate__animated animate__fadeIn">
                  <span className="small fw-bold text-primary px-2">{selectedDoctors.length} selected</span>
                  <div className="d-flex gap-1">
                    {isAdminOrSuperAdmin && (
                      <button
                        className="btn btn-sm btn-primary rounded-pill px-3"
                        data-bs-toggle="modal"
                        data-bs-target="#assignUserModal"
                        onClick={() => setAssignmentAction("assign")}
                      >
                        Assign To
                      </button>
                    )}
                    <button className="btn btn-sm btn-light text-muted border rounded-circle" onClick={() => handleSelectAll(false)} title="Clear Selection">
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Select All Checkbox (if needed visible) */}
              {/* <div className="form-check mt-2 small">
                <input 
                    className="form-check-input" 
                    type="checkbox" 
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={doctors.length > 0 && selectedDoctors.length === doctors.length}
                />
                <label className="form-check-label text-muted">Select All Visible</label>
             </div> */}
            </div>

            <div className="overflow-auto flex-grow-1">
              {doctors.length > 0 ? (
                doctors.map((doctor) => {
                  const isSelected = selectedDoctors.includes(doctor._id);
                  const initials = `${doctor.firstName?.[0] || ""}${doctor.lastName?.[0] || ""}`;
                  return (
                    <div
                      key={doctor._id}
                      className={`doctor-list-item d-flex align-items-center ${selectedDoctor?._id === doctor._id ? "active" : ""}`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <div className="form-check me-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={isSelected || doctor?.assignmentDetails?.isAssigned}
                          disabled={doctor?.assignmentDetails?.isAssigned}
                          onChange={(e) => handleDoctorSelection(doctor._id, e.target.checked)}
                        />
                      </div>
                      <div className="avatar-initials flex-shrink-0">
                        {initials.toUpperCase()}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between">
                          <h6 className="mb-0 fw-bold text-dark text-truncate">{doctor.firstName} {doctor.lastName}</h6>
                          {doctor.assignmentDetails?.isAssigned && (
                            <span className="badge bg-light text-primary border rounded-pill" style={{ fontSize: '10px' }}>
                              Assigned to {doctor.assignmentDetails.assignedToUserName || "User"}
                            </span>
                          )}
                        </div>
                        <div className="small text-muted text-truncate">{doctor.clinicName}</div>
                        <div className="small text-muted text-truncate opacity-75">
                          <i className="fa-solid fa-location-dot me-1" style={{ fontSize: '10px' }}></i>
                          {doctor.address?.city || doctor.address?.country || "N/A"}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="fa-regular fa-folder-open fa-2x mb-3 opacity-25"></i>
                  <p className="mb-0 small">No doctors found</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="detail-panel">
            {selectedDoctor ? (
              <>
                <div className="detail-header">
                  <div>
                    <h4 className="fw-bold mb-1 text-dark">{selectedDoctor.firstName} {selectedDoctor.lastName}</h4>
                    <div className="d-flex text-muted gap-3 small">
                      <span><i className="fa-solid fa-clinic-medical me-1 text-primary"></i> {selectedDoctor.clinicName}</span>
                      <span><i className="fa-solid fa-flag me-1 text-primary"></i> {selectedDoctor.address?.country}</span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {/* <button className={`btn btn-sm rounded-pill px-3 ${activeTab === 'cases' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('cases')}>
                      <i className="fa-solid fa-eye me-2"></i> View Cases
                    </button> */}

                    {(user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.super_admin) && (
                      <>
                        <button
                          className="btn btn-light btn-sm rounded-circle shadow-sm text-secondary"
                          data-bs-toggle="modal"
                          data-bs-target="#updateDoctorModal"
                          onClick={() => setBuffDoctor(selectedDoctor)}
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                      </>
                    )}

                    {isAdminOrSuperAdmin && (
                      <div className="dropdown">
                        <button className="btn btn-light btn-sm rounded-circle shadow-sm text-secondary" data-bs-toggle="dropdown">
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 p-2">
                          {selectedDoctor.assignmentDetails?.isAssigned ? (
                            <>
                              <li><button className="dropdown-item rounded-2 small mb-1" onClick={() => handleReassign(selectedDoctor)} data-bs-toggle="modal" data-bs-target="#assignUserModal"><i className="fa-solid fa-user-pen me-2 text-primary"></i>Reassign</button></li>
                              <li><button className="dropdown-item rounded-2 small text-danger" onClick={() => setDoctorToUnassign(selectedDoctor)} data-bs-toggle="modal" data-bs-target="#unassignDoctorModal"><i className="fa-solid fa-user-xmark me-2"></i>Unassign</button></li>
                            </>
                          ) : (
                            <li><button className="dropdown-item rounded-2 small mb-1" onClick={() => { setSelectedDoctors([selectedDoctor._id]); setAssignmentAction("assign"); }} data-bs-toggle="modal" data-bs-target="#assignUserModal"><i className="fa-solid fa-user-plus me-2 text-success"></i>Assign</button></li>
                          )}
                          <li><hr className="dropdown-divider" /></li>
                          <li><button className="dropdown-item rounded-2 small" onClick={() => setBuffDoctor(selectedDoctor)} data-bs-toggle="modal" data-bs-target="#addNoteModal"><i className="fa-solid fa-sticky-note me-2 text-warning"></i>Add Note</button></li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-content bg-light">
                  {renderTabs()}

                  {activeTab === 'profile' && (
                    <div className="row g-3 animate__animated animate__fadeIn">
                      {/* Contact Info */}
                      <div className="col-md-6">
                        <div className="info-card h-100">
                          <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">Contact Information</h6>
                          <div className="row g-3">
                            <div className="col-12">
                              <div className="info-label">Doctor Name</div>
                              <div className="info-value">{selectedDoctor.firstName} {selectedDoctor.lastName}</div>
                            </div>
                            <div className="col-6">
                              <div className="info-label">Phone</div>
                              <div className="info-value">{selectedDoctor.phone || "-"}</div>
                            </div>
                            <div className="col-6">
                              <div className="info-label">Email</div>
                              <div className="info-value">{selectedDoctor.email || "-"}</div>
                            </div>
                            <div className="col-12">
                              <div className="info-label">Address</div>
                              <div className="info-value">
                                {selectedDoctor.address?.street && `${selectedDoctor.address.street}, `}
                                {selectedDoctor.address?.city && `${selectedDoctor.address.city}, `}
                                {selectedDoctor.address?.country}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Professional Info */}
                      <div className="col-md-6">
                        <div className="info-card h-100">
                          <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">Professional Details</h6>
                          <div className="row g-3">
                            <div className="col-12">
                              <div className="info-label">Clinic Name</div>
                              <div className="info-value">{selectedDoctor.clinicName}</div>
                            </div>
                            <div className="col-6">
                              <div className="info-label">Specialization</div>
                              <div className="info-value">{selectedDoctor.specialization || "General"}</div>
                            </div>
                            <div className="col-6">
                              <div className="info-label">Registration No.</div>
                              <div className="info-value">{selectedDoctor.registrationNumber || "-"}</div>
                            </div>
                            <div className="col-12">
                              <div className="info-label">Assignment Status</div>
                              <div className="info-value">
                                {selectedDoctor.assignmentDetails?.isAssigned ? (
                                  <span className="badge bg-success-soft text-success">
                                    Assigned to {selectedDoctor.assignmentDetails.assignedToUserName}
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary-soft text-secondary">Unassigned</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      <div className="col-12">
                        <div className="info-card">
                          <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                            <h6 className="fw-bold mb-0 text-dark">Notes</h6>
                            <button className="btn btn-sm btn-link p-0 text-primary fw-bold" onClick={() => setBuffDoctor(selectedDoctor)} data-bs-toggle="modal" data-bs-target="#addNoteModal">+ Add Note</button>
                          </div>

                          {selectedDoctor.notes && selectedDoctor.notes.length > 0 ? (
                            <div className="d-flex flex-column gap-3">
                              {selectedDoctor.notes.map((note, index) => (
                                <div key={index} className="bg-light p-3 rounded-3 border-start border-4 border-warning">
                                  <div className="d-flex justify-content-between mb-1">
                                    <span className="fw-bold text-dark small">{note.title}</span>
                                    <span className="text-muted small" style={{ fontSize: '11px' }}>{format(new Date(note.date), "MMM dd, yyyy")}</span>
                                  </div>
                                  <div className="small text-muted fst-italic">Added by {note.addedBy || "Admin"}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-3 text-muted small fst-italic">No notes added.</div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {activeTab === 'cases' && renderCases()}
                  {activeTab === 'stats' && renderStatistics()}

                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="bg-white p-5 rounded-circle shadow-sm mb-4" style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-user-doctor fa-3x text-primary opacity-50"></i>
                </div>
                <h4 className="fw-bold text-dark">Select a Doctor</h4>
                <p className="text-muted">Choose a doctor from the list to view profile.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "none" }}>
        <div ref={doctorsRef} className="p-4">
          <h3 className="text-center mb-4 fw-bold">Doctors List</h3>
          <div className="mb-3">Total Doctors: {doctors.length}</div>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Clinic</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(d => (
                <tr key={d._id}>
                  <td>{d.firstName} {d.lastName}</td>
                  <td>{d.clinicName}</td>
                  <td>
                    <div>{d.phone}</div>
                    <div className="small text-muted">{d.email}</div>
                  </td>
                  <td>
                    {d.address?.country}
                    {d.address?.city && `, ${d.address.city}`}
                  </td>
                  <td>
                    {d.assignmentDetails?.isAssigned ? (
                      <span className="badge bg-success-soft text-success border border-success">
                        {d.assignmentDetails.assignedToUserName}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Doctor Modal */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-light border-0 py-3 px-4">
              <h5 className="modal-title fw-bold text-dark">
                New Doctor
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <form>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label small fw-bold text-uppercase text-muted">First Name</label>
                      <input
                        type="text"
                        className={`form-control ${emptyFields.includes("firstName") ? "is-invalid" : ""}`}
                        onChange={(e) => setFirstName(e.target.value)}
                        value={firstName}
                        placeholder="e.g. John"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label small fw-bold text-uppercase text-muted">Last Name</label>
                      <input
                        type="text"
                        className={`form-control ${emptyFields.includes("lastName") ? "is-invalid" : ""}`}
                        onChange={(e) => setLastName(e.target.value)}
                        value={lastName}
                        placeholder="e.g. Doe"
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label small fw-bold text-uppercase text-muted">Clinic Name</label>
                      <input
                        type="text"
                        className={`form-control ${emptyFields.includes("clinicName") ? "is-invalid" : ""}`}
                        onChange={(e) => setClinicName(e.target.value)}
                        value={clinicName}
                        placeholder="Clinic Name"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label small fw-bold text-uppercase text-muted">Country</label>
                      <CountryDropdown
                        className="form-select"
                        value={country}
                        onChange={(val) => selectCountry(val)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label small fw-bold text-uppercase text-muted">City</label>
                      <RegionDropdown
                        className="form-select"
                        country={country}
                        value={region}
                        onChange={(val) => selectRegion(val)}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer border-0 p-4 pt-0 bg-transparent">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onAddDoctor}
                className="btn btn-primary rounded-pill px-4 shadow-sm"
                data-bs-dismiss="modal"
              >
                Add Doctor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Doctor Modal */}
      <div
        className="modal fade"
        id="updateDoctorModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-light border-0 py-3 px-4">
              <h5 className="modal-title fw-bold text-dark">
                Update Doctor
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <form>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label small fw-bold text-uppercase text-muted">First Name</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        disabled
                        value={buffDoctor.firstName}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label small fw-bold text-uppercase text-muted">Last Name</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        disabled
                        value={buffDoctor.lastName}
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label small fw-bold text-uppercase text-muted">Clinic Name</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        disabled
                        value={buffDoctor.clinicName}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label small fw-bold text-uppercase text-muted">Country</label>
                      <CountryDropdown
                        className="form-select"
                        value={buffDoctor?.address?.country}
                        onChange={(val) => {
                          const updatedDoctor = { ...buffDoctor };
                          if (!updatedDoctor.address) updatedDoctor.address = {};
                          updatedDoctor.address.country = val;
                          setBuffDoctor(updatedDoctor);
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label small fw-bold text-uppercase text-muted">City</label>
                      <RegionDropdown
                        className="form-select"
                        country={buffDoctor?.address?.country}
                        value={buffDoctor?.address?.city}
                        onChange={(val) => {
                          const updatedDoctor = { ...buffDoctor };
                          if (!updatedDoctor.address) updatedDoctor.address = {};
                          updatedDoctor.address.city = val;
                          setBuffDoctor(updatedDoctor);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer border-0 p-4 pt-0 bg-transparent">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onUpdateDoctor}
                className="btn btn-primary rounded-pill px-4 shadow-sm"
                data-bs-dismiss="modal"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      <div
        className="modal fade"
        id="addNoteModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-light border-0 py-3 px-4">
              <h5 className="modal-title fw-bold text-dark">
                {buffDoctor.firstName} {buffDoctor.lastName}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase text-muted">New Note</label>
                <textarea
                  className="form-control"
                  onChange={(e) => setNoteDoctor(e.target.value)}
                  value={noteDoctor}
                  placeholder="Enter note details..."
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold text-uppercase text-muted mb-3">Previous Notes</label>
                <div className="bg-light p-3 rounded-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {buffDoctor?.notes?.length <= 0 ? (
                    <div className="text-center text-muted small fst-italic py-3">
                      No notes found
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {buffDoctor?.notes?.map((noteItem, index) => (
                        <div key={index} className="bg-white p-2 rounded border border-light shadow-sm">
                          <div className="d-flex justify-content-between">
                            <span className="fw-medium text-dark small">{noteItem.title}</span>
                            <span className="text-muted" style={{ fontSize: '10px' }}>{format(new Date(noteItem.date), "MMM dd")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-4 pt-0 bg-transparent">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onAddNote}
                className="btn btn-primary rounded-pill px-4 shadow-sm"
                data-bs-dismiss="modal"
                disabled={!noteDoctor.trim()}
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign User Modal */}
      <div
        className="modal fade"
        id="assignUserModal"
        tabIndex="-1"
        aria-labelledby="assignUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-light border-0 py-3 px-4">
              <h5 className="modal-title fw-bold text-dark" id="assignUserModalLabel">
                Assign Doctors
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="mb-4">
                <div className="text-center p-3 bg-light rounded-3 mb-3 border border-light">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">You are assigning</span>
                  <h3 className="text-primary fw-bold mb-0">{selectedDoctors.length}</h3>
                  <span className="text-muted small">Doctors</span>
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label text-muted small fw-bold text-uppercase mb-2">Select Receptionist</label>
                <div className="position-relative">
                  <i className="fa-solid fa-user-check position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                  <select
                    className="form-select form-select-lg ps-5 border-2 shadow-none"
                    style={{ fontSize: '15px' }}
                    value={selectedAssignUser}
                    onChange={(e) => setSelectedAssignUser(e.target.value)}
                  >
                    <option value="">Choose User...</option>
                    {receptionUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.firstName} {u.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-4 pt-0 bg-transparent">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4 fw-medium"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm"
                onClick={handleAssign}
                data-bs-dismiss="modal"
                disabled={!selectedAssignUser}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unassign Doctor Modal */}
      <div
        className="modal fade"
        id="unassignDoctorModal"
        tabIndex="-1"
        aria-labelledby="unassignDoctorModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
            <div className="modal-body text-center p-4">
              <div className="mb-3 mx-auto rounded-circle bg-light-danger d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', background: '#ffebee' }}>
                <i className="fa-solid fa-user-xmark fa-xl text-danger"></i>
              </div>
              <h5 className="fw-bold mb-2">Unassign Doctor?</h5>
              <p className="text-muted small mb-4">
                Are you sure you want to remove assignment for <strong>{doctorToUnassign?.firstName} {doctorToUnassign?.lastName}</strong>?
              </p>
              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-danger rounded-pill shadow-sm"
                  onClick={handleUnassign}
                  data-bs-dismiss="modal"
                  disabled={isUnassignLoading}
                >
                  {isUnassignLoading ? "Unassigning..." : "Yes, Unassign"}
                </button>
                <button
                  type="button"
                  className="btn btn-light rounded-pill"
                  data-bs-dismiss="modal"
                  disabled={isUnassignLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Hold History Case */}
      <div
        className="modal fade"
        id="caseHoldHistoryModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-light border-0 py-3 px-4">
              <h5 className="modal-title fw-bold text-dark">
                <i className="fas fa-history me-2 text-primary"></i>
                Case History #{buffCase?.caseNumber}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="d-flex flex-column gap-3">
                {buffCase?.historyHolding?.length > 0 ? (
                  buffCase.historyHolding.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-3 border ${item.isHold
                          ? "bg-light-danger border-danger border-opacity-10"
                          : "bg-light-success border-success border-opacity-10"
                        }`}
                      style={{
                        backgroundColor: item.isHold ? "#fff5f5" : "#f0fff4"
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className={`badge ${item.isHold ? "bg-danger" : "bg-success"} rounded-pill`}>
                          {item.isHold ? "Hold" : "UnHold"}
                        </span>
                        <span className="text-muted small fw-medium">
                          {item.date ? format(new Date(item.date), "dd MMM yyyy, HH:mm") : "-"}
                        </span>
                      </div>
                      <div className="text-dark fw-medium small mb-1">
                        By: {item.name || "Unknown"}
                      </div>
                      <div className="text-muted small">
                        <strong>Reason:</strong> {item.msg || "No message provided"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted small fst-italic">
                    No history records found
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer border-0 p-4 pt-0 bg-transparent">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Case Modal */}
      <div
        className="modal fade"
        id="viewModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-light border-0 py-3 px-4">
              <h5 className="modal-title fw-bold text-dark">Case Details</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-0 bg-light">
              {buffCase && (
                <ViewCase
                  caseModel={buffCase}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doctors;
