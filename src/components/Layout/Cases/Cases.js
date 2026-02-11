import axios from "axios";
import { useEffect, useRef, useState } from "react";
import * as _global from "../../../config/global";
import "./Cases.css";
import { useLocation, useNavigate } from "react-router-dom";
import { showToastMessage } from "../../../helper/toaster";
import { useReactToPrint } from "react-to-print";
import SEARCH_FIELDS from "../../../enum/searchFieldEnum";
import DatePicker, { Calendar, DateObject } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import ViewCase from "./ViewCase";
import { CountryDropdown } from "react-country-region-selector";
import CaseProcess from "./CaseProcess/CaseProcess";


const initialData = {
  caseNumber: "",
  name: "",
  type: "",
  dateIn: "",
  dateOut: "",
  dentistObj: {
    id: "",
    name: "",
  },
  phone: "",
  address: "",
  patientName: "",
  gender: "",
  age: "",
  patientPhone: "",
  shadeCase: {
    shade: "",
    stumpShade: "",
    gingShade: "",
  },
  occlusalStaining: "",
  texture: "",
  jobDescription: "",
  teethNumbers: [],
  naturalOfWorks: [],
  isInvoice: false,
  isEmail: false,
  isPhoto: false,
  photos: [],
  deadline: "",
  dateReceived: "",
  dateReceivedInEmail: "",
  notes: [],
  fitting: [
    {
      technicianName: "",
      technicianId: "",
      dateStart: "",
      dateEnd: "",
      notes: "",
      obj: {},
    },
  ],
  cadCam: [
    {
      technicianName: "",
      technicianId: "",
      dateStart: "",
      dateEnd: "",
      notes: "",
      obj: {},
    },
  ],
  ceramic: [
    {
      technicianName: "",
      technicianId: "",
      dateStart: "",
      dateEnd: "",
      notes: "",
      obj: {},
    },
  ],
  logs: [
    {
      id: "",
      name: "",
      date: "",
      msg: "",
    },
  ],
};

const Cases = () => {
  const userRef = useRef();
  const userRef1 = useRef();
  const userRef2 = useRef();
  const userRef3 = useRef();
  const casesRefUrgent = useRef();
  const departments = JSON.parse(localStorage.getItem("departments"));
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [buffCase, setBuffCase] = useState(null);
  const [isHoldCase, setIsHoldCase] = useState(false);
  const [isUrgentCase, setIsUrgentCase] = useState(false);
  const [docotrs, seDoctors] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [forShipments, setForShipments] = useState([]);
  const [inProcessCases, setInProcessCases] = useState([]);
  const [forAssignCases, setForAssignCases] = useState([]);
  const [selectedCases, setSelectedCases] = useState([]);
  const [notStartCasesListIds, setNotStartCasesListIds] = useState([]);
  const [notStudyCasesListIds, setNotStudyCasesListIds] = useState([]);
  const [holdingCases, setHoldingCases] = useState([]);
  const [holdingBuffCases, setHoldingBuffCases] = useState([]);
  const [urgentCases, setUrgentCases] = useState([]);
  const [studyCases, setStudyCases] = useState([]);
  const [finishedCases, setFinishedCases] = useState([]);
  const [notStartCases, setNotStartCases] = useState([]);
  const [buffAllCases, setBuffAllCases] = useState([]);
  const [allCasesInClinics, setAllCasesInClinics] = useState([]);
  const [allCasesImplants, setAllCasesImplants] = useState([]);
  const [buffAllCasesInClinics, setBuffAllCasesInClinics] = useState([]);
  const [buffUrgentCases, setBuffUrgentCases] = useState([]);
  const [buffStudyCases, setBuffStudyCases] = useState([]);
  const [delayCases, setDelayCases] = useState([]);
  const [packingCases, setPackingCases] = useState([]);
  const [redoCases, setRedoCases] = useState([]);
  const [redoBuffCases, setRedoBuffCases] = useState([]);
  const [buffPackingCases, setBuffPackingCases] = useState([]);
  const [forWorkCases, setForWorkCases] = useState([]);
  const [redoCasesInClinics, setRedoCasesInClinics] = useState([]);
  const [buffForWorkCases, setBuffForWorkCases] = useState([]);
  const [buffDelayCases, setBuffDelayCases] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [holdText, setHoldText] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [countryFilter, setCountryFilter] = useState("");
  const [isTableView, setIsTableView] = useState(false);
  const [filterBy, setFilterBy] = useState(SEARCH_FIELDS.CASE_NUMBER);
  const [values, setValues] = useState([
    new DateObject().subtract(0, "days"),
    new DateObject().add(0, "days"),
  ]);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [scheduleConfig, setScheduleConfig] = useState({
    cadCam: { selected: false, date: new Date() },
    fitting: { selected: false, date: new Date() },
    ceramic: { selected: false, date: new Date() }
  });
  // Assign user to case state
  const [assignUsers, setAssignUsers] = useState([]);
  const [assignUsersByDept, setAssignUsersByDept] = useState({});
  const [assignSearch, setAssignSearch] = useState("");
  const [selectedAssignUsers, setSelectedAssignUsers] = useState({}); // {deptName: userId}
  const [isAssignLoading, setIsAssignLoading] = useState(false);

  // Sorting State
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const sortData = (data, key, direction) => {
    if (!data || !Array.isArray(data)) return [];

    return [...data].sort((a, b) => {
      let aValue, bValue;

      if (key === "doctorName") {
        aValue = a.dentistObj?.name?.toLowerCase() || "";
        bValue = b.dentistObj?.name?.toLowerCase() || "";
      } else if (key === "technicianName") {
        const getTechName = (item) =>
          item.assignmentHistory?.[item.assignmentHistory.length - 1]
            ?.newAssignment?.slice(-1)[0]?.userName?.toLowerCase() || "";
        aValue = getTechName(a);
        bValue = getTechName(b);
      } else if (key === "dateIn") {
        aValue = new Date(a.dateIn).getTime();
        bValue = new Date(b.dateIn).getTime();
      } else if (key === "holdBy") {
        // Extract name from last item in historyHolding array
        const aLastHold = a.historyHolding && a.historyHolding.length > 0
          ? a.historyHolding[a.historyHolding.length - 1]
          : null;
        const bLastHold = b.historyHolding && b.historyHolding.length > 0
          ? b.historyHolding[b.historyHolding.length - 1]
          : null;

        aValue = aLastHold?.name?.toLowerCase() || "";
        bValue = bLastHold?.name?.toLowerCase() || "";
      } else {
        return 0;
      }

      if (aValue < bValue) {
        return direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const sortNestedData = (data, key, direction) => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((clinic) => {
      if (!clinic.dentists || !Array.isArray(clinic.dentists)) return clinic;

      const sortedDentists = [...clinic.dentists].map((dentist) => {
        if (!dentist.cases || !Array.isArray(dentist.cases)) return dentist;
        return {
          ...dentist,
          cases: sortData(dentist.cases, key, direction),
        };
      });

      // If sorting by Doctor Name, also sort the dentist groups themselves
      if (key === 'doctorName') {
        sortedDentists.sort((a, b) => {
          // Assuming dentist object might not have name directly, but cases do. 
          // Use first case to get dentist name if needed, or check structure.
          // Based on code: extractName(caseItem?.dentistObj?.name)
          const nameA = a.cases?.[0]?.dentistObj?.name?.toLowerCase() || "";
          const nameB = b.cases?.[0]?.dentistObj?.name?.toLowerCase() || "";
          if (nameA < nameB) return direction === 'asc' ? -1 : 1;
          if (nameA > nameB) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return {
        ...clinic,
        dentists: sortedDentists,
      };
    });
  };

  const handleSort = (key) => {
    let direction = "asc";
    // Default to 'asc' (Old to Newest for date, A-Z for name)
    // Toggle only if clicking the same key again
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    // Apply sorting to all relevant lists
    setNotStartCases((prev) => sortData(prev, key, direction));
    setForAssignCases((prev) => sortData(prev, key, direction));
    setInProcessCases((prev) => sortData(prev, key, direction));
    setHoldingCases((prev) => sortData(prev, key, direction));
    setFinishedCases((prev) => sortData(prev, key, direction));
    setRedoCases((prev) => sortData(prev, key, direction));
    setUrgentCases((prev) => sortData(prev, key, direction));
    setDelayCases((prev) => sortData(prev, key, direction));
    setPackingCases((prev) => sortData(prev, key, direction));
    setForWorkCases((prev) => sortNestedData(prev, key, direction));
    setRedoCasesInClinics((prev) => sortNestedData(prev, key, direction));
    setStudyCases((prev) => sortData(prev, key, direction));
    setAllCasesImplants((prev) => sortData(prev, key, direction));
    // For Shipments is complex and not requested explicitly or structurally compatible
  };

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <i className="fas fa-sort ms-1 text-secondary" style={{ opacity: 0.3 }}></i>;
    }
    return sortConfig.direction === "asc" ? (
      <i className="fas fa-sort-up ms-1 text-primary"></i>
    ) : (
      <i className="fas fa-sort-down ms-1 text-primary"></i>
    );
  };

  const allowedAssignDepartments = new Set(["CadCam", "Caramic"]);

  // Helper function to get CadCam and Ceramic assignments
  const getCadCamAndCeramicAssignments = (caseItem) => {
    if (!caseItem?.assignmentHistory || caseItem.assignmentHistory.length === 0) {
      return { cadCam: null, ceramic: null };
    }

    let cadCamUser = null;
    let ceramicUser = null;

    // Search through assignmentHistory in reverse to find the most recent assignments
    for (let i = caseItem.assignmentHistory.length - 1; i >= 0; i--) {
      const historyEntry = caseItem.assignmentHistory[i];
      const assignments = historyEntry?.newAssignment || [];

      // Look for CadCam assignment if we haven't found one yet
      if (!cadCamUser) {
        const cadCam = assignments.find(a => a.department === "CadCam");
        if (cadCam) cadCamUser = cadCam.userName;
      }

      // Look for Ceramic assignment if we haven't found one yet
      if (!ceramicUser) {
        const ceramic = assignments.find(a => a.department === "Caramic");
        if (ceramic) ceramicUser = ceramic.userName;
      }

      // If we found both, we can stop searching
      if (cadCamUser && ceramicUser) break;
    }

    return {
      cadCam: cadCamUser,
      ceramic: ceramicUser
    };
  };

  // State for tracking assignment actions
  const [assignmentAction, setAssignmentAction] = useState("assign"); // 'assign', 'reassign', 'unassign'

  // Helper function to get current assignments for a case
  const getCurrentAssignments = (caseItem) => {
    if (!caseItem) return {};
    const assignments = {};

    // Check actual assignments array first (most reliable)
    if (caseItem.assignments && Array.isArray(caseItem.assignments)) {
      caseItem.assignments.forEach((assignment) => {
        if (assignment.department && assignment.userId) {
          assignments[assignment.department] = assignment.userId;
        }
      });
    }

    // Check department flags as fallback
    if (caseItem.isAssignedCadCam && !assignments.CadCam)
      assignments.CadCam = "assigned";
    if (caseItem.isAssignedFitting && !assignments.Fitting)
      assignments.Fitting = "assigned";
    if (caseItem.isAssignedCeramic && !assignments.Ceramic)
      assignments.Ceramic = "assigned";

    // Also check for assignedUserIds array
    if (
      caseItem.assignedUserIds &&
      Array.isArray(caseItem.assignedUserIds) &&
      caseItem.assignedUserIds.length > 0
    ) {
      // If we have assignedUserIds but no specific department assignments,
      // we can assume there are assignments
      if (Object.keys(assignments).length === 0) {
        assignments["Unknown"] = "assigned";
      }
    }

    // If still no assignments found, check if case is in process (might have assignments)
    if (Object.keys(assignments).length === 0) {
      // Check if case has any workflow status that indicates assignments
      if (
        caseItem.cadCam &&
        (caseItem.cadCam.status?.isStart || caseItem.cadCam.actions?.length > 0)
      ) {
        assignments["CadCam"] = "assigned";
      }
      if (
        caseItem.fitting &&
        (caseItem.fitting.status?.isStart ||
          caseItem.fitting.actions?.length > 0)
      ) {
        assignments["Fitting"] = "assigned";
      }
      if (
        caseItem.ceramic &&
        (caseItem.ceramic.status?.isStart ||
          caseItem.ceramic.actions?.length > 0)
      ) {
        assignments["Ceramic"] = "assigned";
      }
    }

    // If still no assignments found, create default assignments for testing
    if (Object.keys(assignments).length === 0) {
      // For testing purposes, assume all departments are assigned
      assignments["CadCam"] = "assigned";
      assignments["Fitting"] = "assigned";
      assignments["Ceramic"] = "assigned";
    }

    return assignments;
  };

  // Helper function to determine if case has any assignments
  const hasAssignments = (caseItem) => {
    const assignments = getCurrentAssignments(caseItem);
    const hasAssignmentsResult = Object.keys(assignments).length > 0;

    return hasAssignmentsResult;
  };

  // Helper function to check if case is assigned to CadCam department specifically
  const isAssignedToCadCam = (caseItem) => {
    // Check multiple sources for CadCam assignment
    if (caseItem.assignments && Array.isArray(caseItem.assignments)) {
      return caseItem.assignments.some(
        (assignment) =>
          assignment.department &&
          assignment.department.toLowerCase() === "cadcam"
      );
    }

    // Check department flags
    if (caseItem.isAssignedCadCam === true) {
      return true;
    }

    // Check assignedUserIds for CadCam
    if (caseItem.assignedUserIds && Array.isArray(caseItem.assignedUserIds)) {
      return caseItem.assignedUserIds.length > 0;
    }

    // Check workflow status for CadCam
    if (
      caseItem.cadCam &&
      caseItem.cadCam.status &&
      caseItem.cadCam.status.isStart === true
    ) {
      return true;
    }

    return false;
  };

  // Helper function to get assignment status text
  const getAssignmentStatusText = (caseItem) => {
    const assignments = getCurrentAssignments(caseItem);
    const assignedDepts = Object.keys(assignments);

    if (assignedDepts.length === 0) return "Not Assigned";
    if (assignedDepts.length === 1) return `Assigned to ${assignedDepts[0]}`;
    return `Assigned to ${assignedDepts.join(", ")}`;
  };

  // Handle case selection for bulk assignment
  const handleCaseSelection = (caseId, isSelected) => {
    if (isSelected) {
      setSelectedCases((prev) => [...prev, caseId]);
    } else {
      setSelectedCases((prev) => prev.filter((id) => id !== caseId));
    }
  };

  const handleSelectAllCases = (isSelected) => {
    if (isSelected) {
      // Only select cases that are not assigned to CadCam
      const selectableCases = forAssignCases
        .filter((caseItem) => !isAssignedToCadCam(caseItem))
        .map((caseItem) => caseItem._id);
      setSelectedCases(selectableCases);
    } else {
      setSelectedCases([]);
    }
  };

  const openAssignModal = (caseItem, action = "assign") => {
    setBuffCase(caseItem);
    setAssignmentAction(action);

    // For reassign, pre-populate with current assignments
    if (action === "reassign") {
      const currentAssignments = getCurrentAssignments(caseItem);
      const preSelectedUsers = {};

      Object.entries(currentAssignments).forEach(([deptName, userId]) => {
        if (userId && userId !== "assigned") {
          preSelectedUsers[deptName] = userId;
        }
      });

      setSelectedAssignUsers(preSelectedUsers);
    } else {
      // For assign and unassign, start with empty selections
      setSelectedAssignUsers({});
    }

    if (assignUsers.length === 0) {
      axios
        .get(`${_global.BASE_URL}users`)
        .then((res) => {
          const list = (res.data || []).filter((u) => u.active === true);
          setAssignUsers(list);
          groupUsersByDepartment(list);
        })
        .catch(() => { });
    } else {
      groupUsersByDepartment(assignUsers);
    }
  };

  const groupUsersByDepartment = (usersList) => {
    const map = {};
    usersList.forEach((u) => {
      if (u.active !== true) return;
      const deps = Array.isArray(u.departments) ? u.departments : [];
      if (deps.length === 0) return; // skip users without department
      deps.forEach((d) => {
        const name = d?.name || d; // handle {_id,name} or id
        if (!name || !allowedAssignDepartments.has(name)) return;
        const key = name;
        if (!map[key]) map[key] = [];
        map[key].push(u);
      });
    });
    setAssignUsersByDept(map);
  };

  const filteredUsersByDept = () => {
    if (!assignSearch) return assignUsersByDept;
    const q = assignSearch.toLowerCase();
    const out = {};
    Object.keys(assignUsersByDept).forEach((dep) => {
      const list = assignUsersByDept[dep].filter(
        (u) =>
          (u.firstName + " " + u.lastName).toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q)
      );
      if (list.length > 0) out[dep] = list;
    });
    return out;
  };

  // Generic function to handle assign, reassign, and unassign actions
  const handleCaseAssignment = async (
    action = "assign",
    caseIds = null,
    assignments = null
  ) => {
    console.log("DEBUG - handleCaseAssignment called with:", {
      action,
      caseIds,
      assignments,
    });

    const targetCaseIds = caseIds || (buffCase?._id ? [buffCase._id] : []);
    console.log("DEBUG - targetCaseIds:", targetCaseIds);

    let targetAssignments;
    if (assignments) {
      // Use provided assignments (for bulk operations)
      targetAssignments = assignments;
      console.log("DEBUG - using provided assignments:", targetAssignments);
    } else {
      // For assign, reassign, and unassign, use selected users
      targetAssignments = Object.entries(selectedAssignUsers)
        .filter(([deptName, userId]) => userId)
        .map(([deptName, userId]) => ({
          department: deptName,
          userId: action === "unassign" ? null : userId,
        }));
      console.log(
        `DEBUG - ${action} targetAssignments from selected users:`,
        targetAssignments
      );
    }

    if (targetCaseIds.length === 0) {
      showToastMessage("No cases selected", "error");
      return;
    }
    console.log("DEBUG - targetAssignments:", targetAssignments);
    if (targetAssignments.length === 0) {
      const message =
        action === "unassign"
          ? "No users selected for unassignment"
          : "No users selected for assignment";
      showToastMessage(message, "error");
      return;
    }

    if (isAssignLoading) return;

    setIsAssignLoading(true);
    try {
      const assignmentData = {
        caseIds: targetCaseIds,
        assignments: targetAssignments,
        assignedBy: user._id,
        assignedByName: `${user.firstName} ${user.lastName}`,
        assignedAt: new Date().toISOString(),
        action: action,
      };

      console.log(
        "DEBUG - assignmentData being sent to backend:",
        assignmentData
      );
      console.log(
        "DEBUG - targetAssignments before sending:",
        targetAssignments
      );
      console.log(
        "DEBUG - assignmentData.assignments:",
        assignmentData.assignments
      );

      const response = await fetch(`${_global.BASE_URL}cases/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignmentData),
      });

      const result = await response.json();

      if (response.ok) {
        const successMessage =
          action === "unassign"
            ? `Unassigned ${targetCaseIds.length} case(s) successfully`
            : action === "reassign"
              ? `Reassigned ${targetCaseIds.length} case(s) successfully`
              : `Assigned ${targetAssignments.length} user(s) to ${targetCaseIds.length} case(s)`;

        showToastMessage(successMessage, "success");

        // Update local state based on action
        if (action === "assign") {
          // Remove assigned cases from For Assign tab
          setForAssignCases((prev) =>
            prev.filter((c) => !targetCaseIds.includes(c._id))
          );
        }

        // Update case lists with assignment data
        const updateCaseInList = (caseList) =>
          caseList.map((c) => {
            if (targetCaseIds.includes(c._id)) {
              return {
                ...c,
                assignedUserIds:
                  action === "unassign"
                    ? []
                    : targetAssignments.map((a) => a.userId),
                assignments: action === "unassign" ? [] : targetAssignments,
                lastAssignedBy: user._id,
                lastAssignedByName: `${user.firstName} ${user.lastName}`,
                lastAssignedAt: new Date().toISOString(),
                // Update department flags based on action
                isAssignedCadCam:
                  action === "unassign"
                    ? false
                    : targetAssignments.some(
                      (a) => a.department.toLowerCase() === "cadcam"
                    ),
                isAssignedFitting:
                  action === "unassign"
                    ? false
                    : targetAssignments.some(
                      (a) => a.department.toLowerCase() === "fitting"
                    ),
                isAssignedCeramic:
                  action === "unassign"
                    ? false
                    : targetAssignments.some(
                      (a) =>
                        a.department.toLowerCase() === "ceramic" ||
                        a.department.toLowerCase() === "caramic"
                    ),
              };
            }
            return c;
          });

        setAllCases(updateCaseInList);
        setInProcessCases(updateCaseInList);

        // Update buffCase if it's one of the affected cases
        if (buffCase && targetCaseIds.includes(buffCase._id)) {
          const updatedBuffCase = {
            ...buffCase,
            assignedUserIds:
              action === "unassign"
                ? []
                : targetAssignments.map((a) => a.userId),
            assignments: action === "unassign" ? [] : targetAssignments,
            lastAssignedBy: user._id,
            lastAssignedByName: `${user.firstName} ${user.lastName}`,
            lastAssignedAt: new Date().toISOString(),
          };
          setBuffCase(updatedBuffCase);
        }

        // Clear selections after successful operation
        setSelectedAssignUsers({});
        if (caseIds) {
          setSelectedCases([]);
        }
      } else {
        showToastMessage(
          result.error || result.message || `Failed to ${action} cases`,
          "error"
        );
      }
    } catch (e) {
      console.error(`${action} assignment error:`, e);
      showToastMessage(`Network error during ${action}`, "error");
    } finally {
      setIsAssignLoading(false);
    }
  };

  // Handle assignment action based on current mode
  const handleAssignmentAction = async () => {
    console.log(
      "DEBUG - handleAssignmentAction called with assignmentAction:",
      assignmentAction
    );
    switch (assignmentAction) {
      case "assign":
        console.log("DEBUG - calling assignUserToCase");
        await assignUserToCase();
        break;
      case "reassign":
        console.log("DEBUG - calling reassignUserToCase");
        await reassignUserToCase();
        break;
      case "unassign":
        console.log("DEBUG - calling unassignUserFromCase");
        await unassignUserFromCase();
        break;
      default:
        console.log("DEBUG - default case, calling assignUserToCase");
        await assignUserToCase();
    }
  };

  // Assign users to a single case
  const assignUserToCase = async () => {
    await handleCaseAssignment("assign");
  };

  // Reassign users to a single case
  const reassignUserToCase = async () => {
    await handleCaseAssignment("reassign");
  };

  // Unassign users from a single case
  const unassignUserFromCase = async () => {
    console.log("DEBUG - unassignUserFromCase called");
    await handleCaseAssignment("unassign");
  };

  // Bulk assign users to multiple selected cases
  const bulkAssignUsersToCases = async () => {
    const assignments = Object.entries(selectedAssignUsers)
      .filter(([deptName, userId]) => userId)
      .map(([deptName, userId]) => ({ department: deptName, userId }));

    await handleCaseAssignment("assign", selectedCases, assignments);
  };

  // Bulk reassign users to multiple selected cases
  const bulkReassignUsersToCases = async () => {
    console.log(
      "DEBUG -selectedAssignUsersselectedAssignUsersselectedAssignUsers ",
      selectedAssignUsers
    );
    const assignments = Object.entries(selectedAssignUsers)
      .filter(([deptName, userId]) => userId)
      .map(([deptName, userId]) => ({ department: deptName, userId }));

    await handleCaseAssignment("reassign", selectedCases, assignments);
  };

  // Bulk unassign users from multiple selected cases
  const bulkUnassignUsersFromCases = async () => {
    // For bulk unassign, use selected users (same as assign and reassign)
    const assignments = Object.entries(selectedAssignUsers)
      .filter(([deptName, userId]) => userId)
      .map(([deptName, userId]) => ({
        department: deptName,
        userId: null, // For unassign, userId is null
      }));

    console.log("DEBUG - bulk unassign assignments:", assignments);
    await handleCaseAssignment("unassign", selectedCases, assignments);
  };
  useEffect(() => {
    // get cases
    axios
      .get(`${_global.BASE_URL}cases/cases-by-month`)
      .then((res) => {
        const result = res.data.cases;
        const holdingCases = res.data.holdingCases;
        const urgentCases = res.data.urgentCases;
        const redoCases = res.data.redoCases;
        const studyCases = res.data.studyCases
          .filter(
            (r) =>
              (r.cadCam.actions.length <= 0 &&
                r.delivering.status.isEnd === false &&
                r.delivering.status.isEnd === false &&
                r.isHold === false &&
                r.isStudy === true) ||
              (r.cadCam.actions.length > 0 &&
                r.cadCam.actions[r.cadCam.actions.length - 1].prfeix ===
                "start" &&
                r.cadCam.status.isStart === true &&
                r.cadCam.status.isPause === false &&
                r.cadCam.status.isEnd === false &&
                r.historyHolding.length > 0 &&
                r.historyHolding[r.historyHolding.length - 1].isHold ===
                false &&
                r.delivering.status.isEnd === false &&
                r.delivering.status.isEnd === false &&
                r.isHold === false &&
                r.isStudy === true)
          )
          .sort((a, b) => new Date(b.dateIn) - new Date(a.dateIn));
        setBuffUrgentCases(urgentCases);
        setRedoCases(redoCases);
        setRedoBuffCases(redoCases);
        setBuffStudyCases(studyCases.filter((s) => !s.isHold));
        setAllCases(result);
        // setBuffCase(result[0])
        console.log(result);
        setBuffAllCases(result);
        console.log("implants", getImplantsCases(result));
        setAllCasesImplants(getImplantsCases(result));
        setFinishedCases(
          result.filter((r) => r.delivering.status.isEnd === true)
        );
        const packingCasesbuff = result.filter(
          (r) =>
            r.receptionPacking.status.isEnd === true &&
            r.delivering.status.isEnd === false
        );
        // console.log("packingCasesbuff", packingCasesbuff);
        setPackingCases(_global.groupAndSortCases(packingCasesbuff));
        setBuffPackingCases(_global.groupAndSortCases(packingCasesbuff));
        // console.log('packingCases',packingCases)
        // && r.delivering.status.isEnd === false
        const notStartCasesList = result
          .filter(
            (r) =>
              (r.cadCam.actions.length <= 0 &&
                r.delivering.status.isEnd === false &&
                r.delivering.status.isEnd === false &&
                r.isHold === false &&
                r.isStudy === false) ||
              (r.cadCam.actions.length > 0 &&
                r.cadCam.actions[r.cadCam.actions.length - 1].prfeix ===
                "start" &&
                r.cadCam.status.isStart === true &&
                r.cadCam.status.isPause === false &&
                r.cadCam.status.isEnd === false &&
                r.historyHolding.length > 0 &&
                r.historyHolding[r.historyHolding.length - 1].isHold ===
                false &&
                r.delivering.status.isEnd === false &&
                r.delivering.status.isEnd === false &&
                r.isHold === false &&
                r.isStudy === false)
          )
          .sort((a, b) => new Date(b.dateIn) - new Date(a.dateIn));
        setNotStartCases(notStartCasesList);
        const notStartIds = new Set(notStartCasesList.map((r) => r._id));
        const studyIds = new Set(studyCases.map((r) => r._id));
        setNotStartCasesListIds(notStartIds);
        setNotStudyCasesListIds(studyIds);
        const casesWork = result.filter(
          (r) =>
            r.cadCam.actions.length <= 0 &&
            r.delivering.status.isEnd === false &&
            r.delivering.status.isEnd === false &&
            r.isHold === false &&
            r.isStudy === false
        );
        // setForWorkCases(_global.groupAndSortCases(casesWork));
        setInProcessCases(
          result
            .filter(
              (r) =>
                // r.cadCam.status.isStart === true &&
                r.ceramic.status.isEnd === false &&
                r.receptionPacking.status.isEnd === false &&
                r.isHold === false &&
                r.cadCam.actions.length > 0
            )
            .filter((r) => !notStartIds.has(r._id) && !studyIds.has(r._id))
        );
        setHoldingCases(holdingCases);
        setHoldingBuffCases(holdingCases);
        setUrgentCases(urgentCases);
        setStudyCases(studyCases.filter((s) => !s.isHold));
        console.log("Holding Cases", result.holdingCases);
        const delayCasesfilter = result.filter(
          (c) => filterDaley(c) && c.isHold === false
        );
        console.log(delayCasesfilter);
        setDelayCases(delayCasesfilter);
        setBuffDelayCases(delayCasesfilter);
        // get  clinics
        axios
          .get(`${_global.BASE_URL}clinics`)
          .then((res) => {
            const resultClinics = res.data;
            setClinics(resultClinics);
            console.log("clinics", resultClinics);
            setForShipments(
              getClinicsWithActiveCases(
                resultClinics.filter(
                  (r) => r.address.country !== "United Arab Emirates"
                ),
                packingCasesbuff,
                result
              )
            );
            setAllCasesInClinics(
              getClinicsWithAllActiveCases(resultClinics, result, result)
            );
            setBuffAllCasesInClinics(
              getClinicsWithAllActiveCases(resultClinics, result, result)
            );
            setForWorkCases(
              getClinicsWithActiveCasesNotStart(
                resultClinics,
                result
                  .filter(
                    (r) =>
                      r.cadCam.actions.length <= 0 &&
                      r.delivering.status.isEnd === false &&
                      r.delivering.status.isEnd === false &&
                      r.isHold === false &&
                      r.isStudy === false
                  )
                  .sort((a, b) => new Date(b.dateIn) - new Date(a.dateIn))
              )
            );
            setRedoCasesInClinics(
              getClinicsWithActiveCasesNotStart(resultClinics, redoCases)
            );
            console.log(
              "redoCasesInClinics",
              getClinicsWithActiveCasesNotStart(resultClinics, redoCases)
            );
            // setRedoCasesInClinics(
            //   getClinicsWithActiveCasesNotStart(resultClinics, redoCases)
            // );
          })
          .catch((error) => { });
      })
      .catch((error) => {
        console.error("Error fetching cases:", error);
      });
    // get doctors
    axios
      .get(`${_global.BASE_URL}doctors`)
      .then((res) => {
        const result = res.data;
        seDoctors(result);
        console.log("seDoctors", docotrs);
      })
      .catch((error) => { });
  }, []);
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabIndex = parseInt(queryParams.get("tab"), 10);
    if (!isNaN(tabIndex)) {
      setActiveTab(tabIndex);
    }
  }, [location.search]);
  // Handle tab change and update URL
  const handleTabChange = (index, callback) => {
    setActiveTab(index);
    setSelectedCases([]);
    navigate(`?tab=${index}`); // Update the URL with the active tab index
    if (callback) callback();
  };
  // delete case
  const deleteCase = (id) => {
    axios
      .delete(`${_global.BASE_URL}cases/${id}`)
      .then((res) => {
        const result = res.data;
        const filteredCases = allCases.filter(
          (user) => user._id !== result._id
        );
        setAllCases(filteredCases);
        showToastMessage("deleted Case successfully", "success");
      })
      .catch((error) => {
        console.error("Error fetching cases:", error);
      });
  };
  // hold case
  const holdCase = (id) => {
    let action;
    let historyHolding = [
      ...(buffCase.historyHolding ? buffCase.historyHolding : []),
      {
        id: user._id,
        name: `${user.firstName}, ${user.lastName}`,
        date: new Date(),
        isHold: isHoldCase,
        msg: holdText,
      },
    ];
    if (isHoldCase) {
      action = {
        technicianName: `${user.firstName}, ${user.lastName}`,
        technicianId: user._id,
        datePause: new Date(),
        notes: "",
        prfeix: "pause",
        prfeixMsg: "Puase by  ",
        msg: holdText,
      };
      const logs = [...buffCase["cadCam"].actions];
      let newModel = {
        namePhase: "cadCam",
        actions: logs,
        status: {
          isStart: true,
          isPause: false,
          isEnd: buffCase["cadCam"].status.isEnd,
        },
        obj: buffCase["cadCam"].buffObj,
      };
      axios
        .put(`${_global.BASE_URL}cases/${buffCase._id}/cadCam`, newModel)
        .then((res) => { })
        .catch((error) => {
          showToastMessage("Error  Holding successfully", "error");
        });
    }

    axios
      .put(
        `${_global.BASE_URL}cases/${buffCase._id}/hold/${isHoldCase}`,
        historyHolding
      )
      .then((res) => {
        const result = res.data;
        setHoldText("");
        console.log(result);
        if (isHoldCase) {
          const filteredAllCases = allCases.map((item) => {
            if (item._id === result._id) {
              return {
                ...item,
                isHold: true,
                historyHolding: result.historyHolding,
              };
            }
            return item;
          });
          const filteredHoldCases = [result, ...holdingCases];
          setAllCases(filteredAllCases);
          setHoldingCases(filteredHoldCases);
          showToastMessage("Held Case successfully", "success");
        } else {
          const filteredAllCases = allCases.map((item) => {
            if (item._id === result._id) {
              return {
                ...item,
                isHold: false,
                historyHolding: result.historyHolding,
              };
            }
            return item;
          });
          const filteredHoldCases = holdingCases.filter(
            (user) => user._id !== result._id
          );
          setAllCases(filteredAllCases);
          setHoldingCases(filteredHoldCases);
          showToastMessage("Held Case successfully", "success");
        }
      })
      .catch((error) => {
        console.error("Error fetching cases:", error);
      });
  };
  // approve case
  const aprroveCase = (id) => {
    let buffHistoryApproving = [
      ...(buffCase?.historyApproving ? buffCase?.historyApproving : []),
      {
        id: user._id,
        name: `${user.firstName}, ${user.lastName}`,
        date: new Date(),
        isApprove: true,
        msg: "",
      },
    ];

    axios
      .put(
        `${_global.BASE_URL}cases/${buffCase._id}/approve/${true}`,
        buffHistoryApproving
      )
      .then((res) => {
        const result = res.data;
        setHoldText("");
        console.log(result);
        const filteredAllCases = allCases.map((item) => {
          if (item._id === result._id) {
            return {
              ...item,
              isApprove: true,
              historyApproving: result.historyApproving,
            };
          }
          return item;
        });
        setAllCases(filteredAllCases);
        showToastMessage("Approved Case successfully", "success");
      })
      .catch((error) => {
        console.error("Error fetching cases:", error);
      });
  };
  // hold case
  const urgentCase = (id) => {
    // let action;
    let historyUrgent = [
      ...(buffCase.historyUrgent ? buffCase.historyUrgent : []),
      {
        id: user._id,
        name: `${user.firstName}, ${user.lastName}`,
        date: new Date(),
        isUrgent: isUrgentCase,
        msg: " Case is marked as urgent",
      },
    ];
    // if (isHoldCase) {
    //   action = {
    //     technicianName: `${user.firstName}, ${user.lastName}`,
    //     technicianId: user._id,
    //     datePause: new Date(),
    //     notes: "",
    //     prfeix: "pause",
    //     prfeixMsg: "Puase by  ",
    //     msg: holdText,
    //   };
    //   const logs = [...buffCase["cadCam"].actions];
    //   let newModel = {
    //     namePhase: "cadCam",
    //     actions: logs,
    //     status: {
    //       isStart: true,
    //       isPause: false,
    //       isEnd: buffCase["cadCam"].status.isEnd,
    //     },
    //     obj: buffCase["cadCam"].buffObj,
    //   };
    //   axios
    //     .put(`${_global.BASE_URL}cases/${buffCase._id}/cadCam`, newModel)
    //     .then((res) => {})
    //     .catch((error) => {
    //       showToastMessage("Error  Holding successfully", "error");
    //     });
    // }

    axios
      .put(
        `${_global.BASE_URL}cases/${buffCase._id}/urgent/${isUrgentCase}`,
        historyUrgent
      )
      .then((res) => {
        const result = res.data;
        console.log(result);
        if (isUrgentCase) {
          const filteredAllCases = allCases.map((item) => {
            if (item._id === result._id) {
              return {
                ...item,
                isUrgent: true,
                historyHolding: result.historyUrgent,
              };
            }
            return item;
          });
          const filteredUrgentCases = [result, ...urgentCases];
          setAllCases(filteredAllCases);
          setUrgentCases(filteredUrgentCases);
          showToastMessage("Case marked as urgent successfully", "success");
        } else {
          const filteredAllCases = allCases.map((item) => {
            if (item._id === result._id) {
              return {
                ...item,
                isUrgent: false,
                historyUrgent: result.historyUrgent,
              };
            }
            return item;
          });
          const filteredUrgentCases = urgentCases.filter(
            (user) => user._id !== result._id
          );
          setAllCases(filteredAllCases);
          setUrgentCases(filteredUrgentCases);
          showToastMessage("Case marked as Non-Urgent successfully", "success");
        }
      })
      .catch((error) => {
        console.error("Error fetching cases:", error);
      });
  };
  // useEffect(() => {
  //   // console.log("Updated state:", buffCase);
  // }, [buffCase]);
  const viewCaseHandle = (item, type) => {
    if (type === "view") {
      navigate("/layout/view-case", { state: { ...item, type: "cases" } });
    } else if (type === "process") {
      navigate("/layout/process-case", { state: { ...item } });
    }
  };
  const searchByName = (searchText, name) => {
    setSearchText(searchText);
    if (name === "allCases") {
      if (searchText !== "") {
        const filteredAllCases = allCases.filter(
          (item) =>
            item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setAllCases(filteredAllCases);
      } else {
        setAllCases(buffAllCases);
      }
    }
    if (name === "notStart") {
      if (searchText !== "") {
        const filteredAllNotStartCases = notStartCases.filter(
          (item) =>
            item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        console.log("filteredAllNotStartCases");
        setNotStartCases(filteredAllNotStartCases);
      } else {
        console.log("notStartCases");
        setNotStartCases(
          buffAllCases
            .filter(
              (r) =>
                (r.cadCam.actions.length <= 0 &&
                  r.delivering.status.isEnd === false &&
                  r.delivering.status.isEnd === false &&
                  r.isHold === false &&
                  r.isStudy === false) ||
                (r.cadCam.actions.length > 0 &&
                  r.cadCam.actions[r.cadCam.actions.length - 1].prfeix ===
                  "start" &&
                  r.cadCam.status.isStart === true &&
                  r.cadCam.status.isPause === false &&
                  r.cadCam.status.isEnd === false &&
                  r.historyHolding.length > 0 &&
                  r.historyHolding[r.historyHolding.length - 1].isHold ===
                  false &&
                  r.delivering.status.isEnd === false &&
                  r.delivering.status.isEnd === false &&
                  r.isHold === false &&
                  r.isStudy === false)
            )
            .sort((a, b) => new Date(b.dateIn) - new Date(a.dateIn))
        );
      }
    }
    if (name === "inProccess") {
      if (searchText !== "") {
        const filteredAllInPrgreesCases = inProcessCases.filter(
          (item) =>
            item.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setInProcessCases(filteredAllInPrgreesCases);
      } else {
        setInProcessCases(
          buffAllCases
            .filter(
              (r) =>
                // r.cadCam.status.isStart === true &&
                r.ceramic.status.isEnd === false &&
                r.receptionPacking.status.isEnd === false &&
                r.isHold === false &&
                r.cadCam.actions.length > 0
            )
            .filter(
              (r) =>
                !notStartCasesListIds.has(r._id) &&
                !notStudyCasesListIds.has(r._id)
            )
        );
      }
    }
    if (name === "holing") {
      if (searchText !== "") {
        const filteredAllHoldingCases = holdingCases.filter(
          (item) =>
            item.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setHoldingCases(filteredAllHoldingCases);
      } else {
        setHoldingCases(holdingBuffCases);
      }
    }
    if (name === "forAssign") {
      if (searchText !== "") {
        const filteredForAssignCases = forAssignCases.filter(
          (item) =>
            item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setForAssignCases(filteredForAssignCases);
      } else {
        setForAssignCases(
          buffAllCases
            .filter(
              (r) =>
                (r.cadCam.actions.length <= 0 &&
                  r.delivering.status.isEnd === false &&
                  r.delivering.status.isEnd === false &&
                  r.isHold === false &&
                  r.isStudy === false) ||
                (r.cadCam.actions.length > 0 &&
                  r.cadCam.actions[r.cadCam.actions.length - 1].prfeix ===
                  "start" &&
                  r.cadCam.status.isStart === true &&
                  r.cadCam.status.isPause === false &&
                  r.cadCam.status.isEnd === false &&
                  r.historyHolding.length > 0 &&
                  r.historyHolding[r.historyHolding.length - 1].isHold ===
                  false &&
                  r.delivering.status.isEnd === false &&
                  r.delivering.status.isEnd === false &&
                  r.isHold === false &&
                  r.isStudy === false)
            )
            .sort((a, b) => new Date(b.dateIn) - new Date(a.dateIn))
        );
      }
    }
    if (name === "finished") {
      if (searchText !== "") {
        const filteredAllCases = finishedCases.filter(
          (item) =>
            item?.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.dentistObj.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setFinishedCases(filteredAllCases);
      } else {
        setFinishedCases(
          buffAllCases.filter((r) => r.delivering.status.isEnd === true)
        );
      }
    }
    if (name === "delay") {
      if (searchText !== "") {
        const filteredAllDelayCases = delayCases.filter(
          (item) =>
            item?.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.dentistObj.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setDelayCases(filteredAllDelayCases);
      } else {
        setDelayCases(buffDelayCases);
      }
    }
    if (name === "urgent") {
      if (searchText !== "") {
        const filteredAllUrgentCases = urgentCases.filter(
          (item) =>
            item?.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.dentistObj.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setUrgentCases(filteredAllUrgentCases);
      } else {
        setUrgentCases(buffUrgentCases);
      }
    }
    if (name === "study") {
      if (searchText !== "") {
        const filteredAllStudyCases = studyCases.filter(
          (item) =>
            item?.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.dentistObj.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setStudyCases(filteredAllStudyCases);
      } else {
        setStudyCases(buffStudyCases);
      }
    }
    if (name === "packing") {
      if (searchText !== "") {
        const filteredAllPackingCases = packingCases.filter(
          (item) =>
            item?.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.dentistObj.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setPackingCases(filteredAllPackingCases);
      } else {
        setPackingCases(buffPackingCases);
      }
    }
    if (name === "forWork") {
      if (searchText !== "") {
        const filteredAllForWorkCases = forWorkCases.filter(
          (item) =>
            item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setForWorkCases(filteredAllForWorkCases);
      } else {
        setForWorkCases(
          buffAllCases.filter(
            (r) =>
              r.cadCam.actions.length <= 0 &&
              r.delivering.status.isEnd === false &&
              r.delivering.status.isEnd === false &&
              r.isHold === false &&
              r.isStudy === false
          )
        );
      }
    }
    if (name === "redo") {
      if (searchText !== "") {
        const filteredAllForWorkCases = redoCases.filter(
          (item) =>
            item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setRedoCases(filteredAllForWorkCases);
      } else {
        setRedoCases(redoBuffCases);
      }
    }
  };
  // Handle key press to trigger search on "Enter"
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      // Only trigger search on "Enter" key
      searchByNameOrNumber(searchText, "allCases");
    }
  };
  const searchbyIcon = () => {
    if (searchText !== "") {
      // Only trigger search on "Enter" key
      searchByNameOrNumber(searchText, "allCases");
    }
  };
  const searchByNameOrNumber = (searchText, type) => {
    if (searchText !== "") {
      axios
        .get(
          `${_global.BASE_URL}cases/search?search=${searchText}&searchField=${filterBy}`
        )
        .then((res) => {
          const result = res.data;
          setAllCases(result);
        })
        .catch((error) => { });
    } else {
      setAllCases(buffAllCases);
    }
  };
  const getImplantsCases = (result) => {
    const targetNames = [
      "Zircon Over Implant",
      "Temporary Implant",
      "Screw Retain Crown",
    ];

    return result.filter((c) =>
      !c.cadCam.status.isEnd && c.teethNumbers.some((t) => targetNames.includes(t.name))
    );
  };

  const getCasesByRangeDate = () => {
    axios
      .get(
        `${_global.BASE_URL
        }cases/cases-by-month?startDate=${values[0].format()}&endDate=${values[1] ? values[1].format() : values[0].format()
        }`
      )
      .then((res) => {
        const result = res.data.cases;
        setAllCases(result);
        console.log(result);
        setBuffAllCases(result);
        setFinishedCases(
          result.filter((r) => r.delivering.status.isEnd === true)
        );
        // && r.delivering.status.isEnd === false
        setNotStartCases(
          result
            .filter(
              (r) =>
                (r.cadCam.actions.length <= 0 &&
                  r.delivering.status.isEnd === false &&
                  r.delivering.status.isEnd === false &&
                  r.isHold === false &&
                  r.isStudy === false) ||
                (r.cadCam.actions.length > 0 &&
                  r.cadCam.actions[r.cadCam.actions.length - 1].prfeix ===
                  "start" &&
                  r.cadCam.status.isStart === true &&
                  r.cadCam.status.isPause === false &&
                  r.cadCam.status.isEnd === false &&
                  r.historyHolding.length > 0 &&
                  r.historyHolding[r.historyHolding.length - 1].isHold ===
                  false &&
                  r.delivering.status.isEnd === false &&
                  r.delivering.status.isEnd === false &&
                  r.isHold === false &&
                  r.isStudy === false)
            )
            .sort((a, b) => new Date(b.dateIn) - new Date(a.dateIn))
        );
        setForWorkCases(
          result.filter(
            (r) =>
              r.cadCam.actions.length <= 0 &&
              r.delivering.status.isEnd === false &&
              r.delivering.status.isEnd === false &&
              r.isHold === false &&
              r.isStudy === false
          )
        );
        setInProcessCases(
          result
            .filter(
              (r) =>
                // r.cadCam.status.isStart === true &&
                r.ceramic.status.isEnd === false &&
                r.receptionPacking.status.isEnd === false &&
                r.isHold === false &&
                r.cadCam.actions.length > 0
            )
            .filter(
              (r) =>
                !notStartCasesListIds.has(r._id) &&
                !notStudyCasesListIds.has(r._id)
            )
        );
        setHoldingCases(result.filter((r) => r.isHold === true));
        console.log(
          "Holding Cases",
          result.filter((r) => r.isHold === true)
        );
        // For Assign cases - same data as Not Start tab
        setForAssignCases(
          result
            .filter(
              (r) =>
                (r.cadCam.actions.length <= 0 &&
                  r.delivering.status.isEnd === false &&
                  r.delivering.status.isEnd === false &&
                  r.isHold === false &&
                  r.isStudy === false) ||
                (r.cadCam.actions.length > 0 &&
                  r.cadCam.actions[r.cadCam.actions.length - 1].prfeix ===
                  "start" &&
                  r.cadCam.status.isStart === true &&
                  r.cadCam.status.isPause === false &&
                  r.cadCam.status.isEnd === false &&
                  r.historyHolding.length > 0 &&
                  r.historyHolding[r.historyHolding.length - 1].isHold ===
                  false &&
                  r.delivering.status.isEnd === false &&
                  r.delivering.status.isEnd === false &&
                  r.isHold === false &&
                  r.isStudy === false)
            )
            .sort((a, b) => new Date(b.dateIn) - new Date(a.dateIn))
        );
        const delayCasesfilter = result.filter((c) => filterDaley(c));
        console.log(delayCasesfilter);
        setDelayCases(delayCasesfilter);
        setBuffDelayCases(delayCasesfilter);
      })
      .catch((error) => {
        console.error("Error fetching cases:", error);
      });
  };
  const editCase = (id, isRedo) => {
    // navigate(`/layout/edit-case/${id}`);
    navigate(`/layout/edit-case/${id}`);
  };
  const addItemToDelayCases = (item) => {
    setDelayCases((prevDelayCases) => [...prevDelayCases, item]);
  };
  const filterDaley = (item) => {
    let teethNumbersByName = groupTeethNumbersByName(item.teethNumbers);
    const days = _global.getDaysfromTowDates(item.dateIn, new Date());
    if (teethNumbersByName.length > 0) {
      const implant = teethNumbersByName.find(
        (te) => te.name === "Screw Retain Crown"
      );
      const zircon = teethNumbersByName.find((t) => t.name === "Zircon");
      const veneer = teethNumbersByName.find((tee) => tee.name === "Veneer");
      const emax = teethNumbersByName.find(
        (tee) => tee.name === "E-Max / Inlay/ Onlay"
      );
      const emaxCrown = teethNumbersByName.find(
        (tee) => tee.name === "E-Max Crown"
      );
      const study = teethNumbersByName.find((tee) => tee.name === "Study");
      if (
        (implant &&
          implant?.count >= 4 &&
          implant?.count <= 5 &&
          days >= 4 &&
          !item.receptionPacking.status.isEnd) ||
        (implant &&
          implant?.count >= 7 &&
          days > 7 &&
          !item.receptionPacking.status.isEnd) ||
        (zircon &&
          zircon?.count === 4 &&
          days > 3 &&
          !item.receptionPacking.status.isEnd) ||
        (veneer &&
          veneer?.count === 4 &&
          days > 3 &&
          !item.receptionPacking.status.isEnd) ||
        (zircon &&
          zircon?.count > 4 &&
          days > 7 &&
          !item.receptionPacking.status.isEnd) ||
        (veneer &&
          veneer?.count > 4 &&
          days > 7 &&
          !item.receptionPacking.status.isEnd) ||
        (emax &&
          emax?.count > 4 &&
          days > 7 &&
          !item.receptionPacking.status.isEnd) ||
        (emax &&
          emax?.count === 4 &&
          days > 3 &&
          !item.receptionPacking.status.isEnd) ||
        (emaxCrown &&
          emaxCrown?.count > 4 &&
          days > 7 &&
          !item.receptionPacking.status.isEnd) ||
        (emaxCrown &&
          emaxCrown?.count === 4 &&
          days > 3 &&
          !item.receptionPacking.status.isEnd) ||
        (study &&
          study?.count >= 1 &&
          days >= 3 &&
          !item.receptionPacking.status.isEnd)
      ) {
        return item;
      }
    }
  };
  const checkCaseDate = (item) => {
    let response = "";
    if (
      (user.roles[0] === _global.allRoles.admin &&
        departments[0].name === "QC") ||
      user.roles[0] === _global.allRoles.Reception
    ) {
      let teethNumbersByName = groupTeethNumbersByName(item.teethNumbers);
      const days = _global.getDaysfromTowDates(item.dateIn, new Date());
      if (teethNumbersByName.length > 0) {
        const implant = teethNumbersByName.find(
          (te) => te.name === "Screw Retain Crown"
        );
        const zircon = teethNumbersByName.find((t) => t.name === "Zircon");
        const veneer = teethNumbersByName.find((tee) => tee.name === "Veneer");
        const emax = teethNumbersByName.find(
          (tee) => tee.name === "E-Max / Inlay/ Onlay"
        );
        const emaxCrown = teethNumbersByName.find(
          (tee) => tee.name === "E-Max Crown"
        );
        const study = teethNumbersByName.find((tee) => tee.name === "Study");
        if (
          implant &&
          implant?.count >= 4 &&
          implant?.count <= 5 &&
          days >= 4 &&
          !item.receptionPacking.status.isEnd
        ) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if (
          implant &&
          implant?.count >= 7 &&
          days > 7 &&
          !item.receptionPacking.status.isEnd
        ) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if (
          (zircon &&
            zircon?.count === 4 &&
            days > 3 &&
            !item.receptionPacking.status.isEnd) ||
          (veneer &&
            veneer?.count === 4 &&
            days > 3 &&
            !item.receptionPacking.status.isEnd)
        ) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if (
          (zircon &&
            zircon?.count > 4 &&
            days > 7 &&
            !item.receptionPacking.status.isEnd) ||
          (veneer &&
            veneer?.count > 4 &&
            days > 7 &&
            !item.receptionPacking.status.isEnd)
        ) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if (
          (emax &&
            emax?.count > 4 &&
            days > 7 &&
            !item.receptionPacking.status.isEnd) ||
          (emax &&
            emax?.count === 4 &&
            days > 3 &&
            !item.receptionPacking.status.isEnd)
        ) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if (
          (emaxCrown &&
            emaxCrown?.count > 4 &&
            days > 7 &&
            !item.receptionPacking.status.isEnd) ||
          (emaxCrown &&
            emaxCrown?.count === 4 &&
            days > 3 &&
            !item.receptionPacking.status.isEnd)
        ) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if (
          study &&
          study?.count >= 1 &&
          days >= 3 &&
          !item.receptionPacking.status.isEnd
        ) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
      }
    } else if (
      user.roles[0] === _global.allRoles.technician &&
      departments[0].name === "CadCam" &&
      !item.cadCam.status.isEnd
    ) {
      response = "table-warning";
    } else if (
      user.roles[0] === _global.allRoles.super_admin &&
      !item.delivering.status.isEnd &&
      item.receptionPacking.status.isEnd
    ) {
      response = "table-success";
    } else if (
      user.roles[0] === _global.allRoles.Reception &&
      departments[0].name === "Reception" &&
      item.receptionPacking.status.isEnd &&
      !item.delivering.status.isEnd
    ) {
      response = "table-success";
    }

    return response;
  };
  const checkNotStartDelay = (item) => {
    if (
      item.cadCam.actions.length <= 0 &&
      item.delivering.status.isEnd === true
    ) {
      return "table-info";
    }
    if (item.isRedo) {
      return "table-warning";
    }
  };
  function groupTeethNumbersByName(teethNumbers) {
    const result = {};
    teethNumbers.forEach((teethNumber) => {
      const { name } = teethNumber;
      if (!result[name]) {
        result[name] = 0;
      }

      result[name]++;
    });
    return Object.entries(result).map(([name, count]) => ({ name, count }));
  }
  const getReasonlate = (item) => {
    let msg = "";
    let teethNumbersByName = groupTeethNumbersByName(item.teethNumbers);
    const days = _global.getDaysfromTowDates(item.dateIn, new Date());
    if (teethNumbersByName.length > 0) {
      const implant = teethNumbersByName.find(
        (te) => te.name === "Screw Retain Crown"
      );
      const zircon = teethNumbersByName.find((t) => t.name === "Zircon");
      const veneer = teethNumbersByName.find((tee) => tee.name === "Veneer");
      const emax = teethNumbersByName.find(
        (tee) => tee.name === "E-Max / Inlay/ Onlay"
      );
      const emaxCrown = teethNumbersByName.find(
        (tee) => tee.name === "E-Max Crown"
      );
      const study = teethNumbersByName.find((tee) => tee.name === "Study");
      if (implant && implant?.count >= 4 && implant?.count <= 5 && days >= 4) {
        msg = "4,5 unites implants and more than 4 days";
      }
      if (implant && implant?.count >= 7 && days > 7) {
        msg = "more than 7 unites implants and more than 7 days";
      }
      if (zircon && zircon?.count === 4 && days > 3) {
        msg = "4 unites Zircon and more than 3 days";
      }
      if (zircon && zircon?.count > 4 && days > 7) {
        msg = "more than 4 unites Zircon and more than 7 days";
      }
      if (veneer && veneer?.count === 4 && days > 3) {
        msg = "4 unites Veneer and more than 3 days";
      }
      if (veneer && veneer?.count > 4 && days > 7) {
        msg = "more than 4 unites Veneer and more than 7 days";
      }
      if (emax && emax?.count === 4 && days > 3) {
        msg = "4 unites E-Max / Inlay/ Onlay and more than 3 days";
      }
      if (emax && emax?.count > 4 && days > 7) {
        msg = "more than 4 unites E-Max / Inlay/ Onlay and more than 7 days";
      }
      if (emaxCrown && emaxCrown?.count === 4 && days > 3) {
        msg = "4 unites Emax Crown and more than 3 days";
      }
      if (emaxCrown && emaxCrown?.count > 4 && days > 7) {
        msg = "more than 4 unites Emax Crown and more than 7 days";
      }
      if (study && study?.count >= 1 && days >= 3) {
        msg = "study and more than 3 days";
      }
    }
    return msg;
  };
  const handlePrint = useReactToPrint({
    content: () => userRef.current,
    documentTitle: `Delay Cases`,
  });
  const handlePrintUrgentCases = useReactToPrint({
    content: () => casesRefUrgent.current,
    documentTitle: `Urgent Cases`,
  });
  const handleCheckboxChange = (e, item) => {
    if (e.target.checked) {
      // Add the item to the array
      setSelectedItems((prev) => [...prev, item]);
    } else {
      // Remove the item from the array
      setSelectedItems((prev) =>
        prev.filter((selectedItem) => selectedItem._id !== item._id)
      );
    }
  };
  const printSelectedItems = useReactToPrint({
    content: () => userRef1.current,
    documentTitle: `Cases`,
  });
  const printSelectedItemsShippment = useReactToPrint({
    content: () => userRef2.current,
    documentTitle: `Cases For Shipment`,
  });
  const printSelectedItemsClinics = useReactToPrint({
    content: () => userRef3.current,
    documentTitle: `Cases In  clinics`,
  });
  const getDoctorCountry = (id) => {
    return docotrs.find((doctor) => doctor._id === id).address.country;
  };

  const getClinicsWithActiveCases = (clinics, cases, allCases) => {
    if (cases.length === 0 || clinics.length === 0) return [];
    return clinics
      .map((clinic) => {
        // Get all cases related to this clinic (by matching dentistId in cases with clinic's dentistsIds)
        const clinicCases = allCases
          .filter((caseItem) =>
            clinic.dentistsIds.some(
              (dentistIdObj) => dentistIdObj.value === caseItem.dentistObj.id
            )
          )
          .filter(
            (caseItem) =>
              // Filter cases with delivering.actions <= 0 and receptionPacking.actions <= 0
              caseItem.delivering?.actions?.length <= 0
          )
          .map((caseItem) => {
            // Group cases into NotStat, cadCamCases, fittingCases, ceramicCases based on conditions
            if (caseItem.cadCam?.actions?.length <= 0 && !caseItem.isHold) {
              caseItem.status = "NotStat"; // Mark as NotStat if cadCam actions are empty
            } else if (
              (!caseItem.cadCam?.status?.isStart &&
                caseItem.cadCam?.status?.isPause &&
                !caseItem.cadCam?.status?.isEnd) ||
              (!caseItem.cadCam?.status?.isStart &&
                !caseItem.cadCam?.status?.isPause &&
                caseItem.cadCam?.status?.isEnd &&
                caseItem.fitting.actions.length <= 0 &&
                caseItem.receptionPacking?.actions.length <= 0)
            ) {
              caseItem.status = "cadCamCases"; // Mark as cadCamCases if cadCam is started
            } else if (
              !caseItem.fitting?.status?.isStart &&
              caseItem.fitting?.status?.isPause &&
              !caseItem.fitting?.status?.isEnd
            ) {
              caseItem.status = "fittingCases"; // Mark as fittingCases if fitting is started
            } else if (
              caseItem.fitting?.status?.isEnd &&
              caseItem.ceramic?.status?.isStart &&
              caseItem.receptionPacking?.status?.isStart
            ) {
              caseItem.status = "forCeramicCases"; // Mark as forCeramicCases
            } else if (
              !caseItem.ceramic?.status?.isStart &&
              caseItem.ceramic?.status?.isPause &&
              !caseItem.ceramic?.status?.isEnd &&
              !caseItem.receptionPacking?.status?.isEnd
            ) {
              caseItem.status = "ceramicCases"; // Mark as ceramicCases if ceramic is started
            } else if (caseItem.receptionPacking?.status?.isEnd) {
              caseItem.status = "receptionPacking"; // Mark as ceramicCases if ceramic is started
            }
            return caseItem;
          });

        // Check if this clinic has any active cases
        const hasActiveCases = clinicCases.some((caseItem) =>
          [
            "NotStat",
            "cadCamCases",
            "fittingCases",
            "ceramicCases",
            "receptionPacking",
            "forCeramicCases",
          ].includes(caseItem.status)
        );

        // If clinic doesn't have active cases, skip it
        if (!hasActiveCases) {
          return null;
        }

        // Get dentists in this clinic who have active cases
        const dentistsWithCases = clinic.dentistsIds
          .map((dentistIdObj) => {
            const dentistId = dentistIdObj.value; // Extracting actual dentist ID
            const dentistCases = cases.filter(
              (c) => c.dentistObj.id === dentistId
            );
            return dentistCases.length > 0
              ? {
                dentistId,
                dentistName: dentistCases[0].dentistObj.name, // Get name from first case
                cases: dentistCases,
              }
              : null;
          })
          .filter((dentist) => dentist !== null); // Remove dentists without cases

        // Return clinic with grouped cases and dentist-related cases
        return {
          clinicName: clinic.clinicName,
          dentists: dentistsWithCases,
          allClinicCases: {
            NotStatCases: clinicCases.filter(
              (caseItem) => caseItem.status === "NotStat"
            ),
            cadCamCases: clinicCases.filter(
              (caseItem) => caseItem.status === "cadCamCases"
            ),
            fittingCases: clinicCases.filter(
              (caseItem) => caseItem.status === "fittingCases"
            ),
            forCeramicCases: clinicCases.filter(
              (caseItem) => caseItem.status === "forCeramicCases"
            ),
            ceramicCases: clinicCases.filter(
              (caseItem) => caseItem.status === "ceramicCases"
            ),
            receptionPacking: clinicCases.filter(
              (caseItem) => caseItem.status === "receptionPacking"
            ),
          },
        };
      })
      .filter((clinic) => clinic !== null && clinic.dentists.length > 0); // Remove clinics without dentists or active cases
  };
  const getClinicsWithAllActiveCases = (clinics, cases, allCases) => {
    console.log("getClinicsWithAllActiveCases", clinics, cases, allCases);
    if (cases.length === 0 || clinics.length === 0) return [];
    return clinics
      .map((clinic) => {
        // Get all cases related to this clinic (by matching dentistId in cases with clinic's dentistsIds)
        const clinicCases = allCases
          .filter((caseItem) =>
            clinic.dentistsIds.some(
              (dentistIdObj) => dentistIdObj.value === caseItem.dentistObj.id
            )
          )
          .filter(
            (caseItem) =>
              // Filter cases with delivering.actions <= 0 and receptionPacking.actions <= 0
              caseItem.delivering?.actions?.length <= 0
          )
          .map((caseItem) => {
            // Group cases into NotStat, cadCamCases, fittingCases, ceramicCases based on conditions
            if (caseItem.cadCam?.actions?.length <= 0 && !caseItem.isHold) {
              caseItem.status = "NotStat"; // Mark as NotStat if cadCam actions are empty
            }
            if (caseItem.isHold) {
              caseItem.status = "Holding"; // Mark as NotStat if cadCam actions are empty
            } else if (
              !caseItem.cadCam?.status?.isStart &&
              caseItem.cadCam?.status?.isPause &&
              !caseItem.cadCam?.status?.isEnd
            ) {
              caseItem.status = "cadCamCases"; // Mark as cadCamCases if cadCam is started
            } else if (
              !caseItem.fitting?.status?.isStart &&
              caseItem.fitting?.status?.isPause &&
              !caseItem.fitting?.status?.isEnd
            ) {
              caseItem.status = "fittingCases"; // Mark as fittingCases if fitting is started
            } else if (
              caseItem.fitting?.status?.isEnd &&
              caseItem.ceramic?.status?.isStart &&
              caseItem.receptionPacking?.status?.isStart
            ) {
              caseItem.status = "forCeramicCases"; // Mark as forCeramicCases
            } else if (
              !caseItem.ceramic?.status?.isStart &&
              caseItem.ceramic?.status?.isPause &&
              !caseItem.ceramic?.status?.isEnd &&
              !caseItem.receptionPacking?.status?.isEnd
            ) {
              caseItem.status = "ceramicCases"; // Mark as ceramicCases if ceramic is started
            } else if (caseItem.receptionPacking?.status?.isEnd) {
              caseItem.status = "receptionPacking"; // Mark as ceramicCases if ceramic is started
            }
            return caseItem;
          });

        // Check if this clinic has any active cases
        const hasActiveCases = clinicCases.some((caseItem) =>
          [
            "NotStat",
            "Holding",
            "cadCamCases",
            "fittingCases",
            "ceramicCases",
            "receptionPacking",
            "forCeramicCases",
          ].includes(caseItem.status)
        );

        // If clinic doesn't have active cases, skip it
        if (!hasActiveCases) {
          return null;
        }

        // Get dentists in this clinic who have active cases
        const dentistsWithCases = clinic.dentistsIds
          .map((dentistIdObj) => {
            const dentistId = dentistIdObj.value; // Extracting actual dentist ID
            const dentistCases = cases.filter(
              (c) => c.dentistObj.id === dentistId
            );
            return dentistCases.length > 0
              ? {
                dentistId,
                dentistName: dentistCases[0].dentistObj.name, // Get name from first case
                cases: dentistCases,
              }
              : null;
          })
          .filter((dentist) => dentist !== null); // Remove dentists without cases

        // Return clinic with grouped cases and dentist-related cases
        return {
          clinicName: clinic.clinicName,
          address: clinic.address,
          dentists: dentistsWithCases,
          allClinicCases: {
            NotStatCases: clinicCases.filter(
              (caseItem) => caseItem.status === "NotStat"
            ),
            Holding: clinicCases.filter(
              (caseItem) => caseItem.status === "Holding"
            ),
            cadCamCases: clinicCases.filter(
              (caseItem) => caseItem.status === "cadCamCases"
            ),
            fittingCases: clinicCases.filter(
              (caseItem) => caseItem.status === "fittingCases"
            ),
            forCeramicCases: clinicCases.filter(
              (caseItem) => caseItem.status === "forCeramicCases"
            ),
            ceramicCases: clinicCases.filter(
              (caseItem) => caseItem.status === "ceramicCases"
            ),
            receptionPacking: clinicCases.filter(
              (caseItem) => caseItem.status === "receptionPacking"
            ),
          },
        };
      })
      .filter((clinic) => clinic !== null && clinic.dentists.length > 0); // Remove clinics without dentists or active cases
  };
  const getClinicsWithActiveCasesNotStart = (clinics, cases) => {
    // console.log("casesNOTSTART", cases, clinics);
    if (cases.length === 0 || clinics.length === 0) return [];
    return clinics
      .map((clinic) => {
        // Get dentists in this clinic who have active cases
        const dentistsWithCases = clinic.dentistsIds
          .map((dentistIdObj) => {
            const dentistId = dentistIdObj.value; // Extracting actual dentist ID
            const dentistCases = cases.filter(
              (c) => c.dentistObj.id === dentistId
            );
            return dentistCases.length > 0
              ? {
                dentistId,
                dentistName: dentistCases[0].dentistObj.name, // Get name from first case
                cases: dentistCases,
              }
              : null;
          })
          .filter((dentist) => dentist !== null); // Remove dentists without cases

        // Return clinic with grouped cases and dentist-related cases
        return {
          clinicName: clinic.clinicName,
          dentists: dentistsWithCases,
        };
      })
      .filter((clinic) => clinic !== null && clinic.dentists.length > 0); // Remove clinics without dentists or active cases
  };
  // Function to get clinics with ongoing cases for dentists
  const filterClinicsWithOngoingCases = (clinics, cases) => {
    if (cases.length === 0 || clinics.length === 0) return [];
    return clinics.map((clinic) => {
      // Find all dentists in the clinic
      const clinicDentists = clinic.dentistsIds.map((dentist) => dentist.value);

      // Filter cases for the clinic and its dentists
      const clinicCases = cases.filter(
        (caseItem) =>
          caseItem.clinicName === clinic.clinicName &&
          clinicDentists.includes(caseItem.dentistObj.id)
      );

      // If there are cases, we add them to the clinic
      if (clinicCases.length > 0) {
        clinic.cases = clinicCases; // Add the cases to the clinic
      }

      return clinic;
    });
  };

  const extractName = (fullString) => {
    // Remove any content inside parentheses
    const cleanedString = fullString.replace(/\(.*?\)/g, "").trim();

    // Split by commas and remove "Dr." if present
    const parts = cleanedString.split(",").map((part) => part.trim());

    // Find first and last name, ignoring "Dr."
    const nameParts = parts.filter((part) => !part.includes("Dr."));

    // Join and return as "First Last"
    return nameParts.join(" ");
  };

  function sumOfTeethNumbersLength(type) {
    let totalLength = 0;
    if (type === "All") {
      allCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    } else if (type === "Start") {
      notStartCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    } else if (type === "ForAssign") {
      forAssignCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    } else if (type === "progress") {
      inProcessCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    } else if (type === "End") {
      finishedCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    } else if (type === "holding") {
      holdingCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    } else if (type === "study") {
      studyCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    } else if (type === "packing") {
      packingCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    } else if (type === "forWorking") {
      forWorkCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    } else if (type === "redo") {
      redoCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    }
  }
  const getStudyCases = (data) => {
    return data.find((r) => r.name === "Study")
      ? data.find((r) => r.name === "Study")?.count
      : 0;
  };
  function groupCasesTeethNumbersByName(type) {
    const result = {};
    if (type === "All") {
      allCases.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    } else if (type === "End") {
      finishedCases.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    } else if (type === "Start") {
      notStartCases.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    } else if (type === "ForAssign") {
      forAssignCases.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    } else if (type === "progress") {
      inProcessCases.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    } else if (type === "holding") {
      holdingCases.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    } else if (type === "study") {
      studyCases.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    } else if (type === "packing") {
      packingCases.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    } else if (type === "forWorking") {
      forWorkCases.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    } else if (type === "redo") {
      redoCases.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    }
    return Object.entries(result).map(([name, count]) => ({ name, count }));
  }
  const searchByCountry = (searchText) => {
    // setAllCasesInClinics(buffAllCasesInClinics)
    setCountryFilter(searchText);
    if (searchText !== "") {
      const filteredClinic = buffAllCasesInClinics.filter((item) =>
        item.address.country.toLowerCase().includes(searchText.toLowerCase())
      );
      setAllCasesInClinics(filteredClinic);
    } else {
      setAllCasesInClinics(buffAllCasesInClinics);
    }
  };
  const buffCaseHandle = (item) => {
    const newItem = JSON.parse(JSON.stringify(item)); // Deep clone = new object ref
    setBuffCase(newItem);
  };
  function extractAllCases(data) {
    if (!data || !Array.isArray(data.dentists)) return [];

    return data.dentists.flatMap((dentist) =>
      dentist.cases.map((c) => ({
        dentistId: dentist.dentistId,
        dentistName: dentist.dentistName,
        caseId: c._id,
        caseNumber: c.caseNumber,
        patientName: c.patientName,
        jobDescription: c.jobDescription,
        teethNumbers: (c.teethNumbers || []).map((t) => ({
          teethNumber: t.teethNumber,
          material: t.name,
          color: t.color,
        })),
        isRedo: c.isRedo,
        redoReason: c.redoReason || null,
        dateIn: c.dateIn,
        dateOut: c.dateOut,
      }))
    );
  }

  /* Priority & Schedule Handlers */

  const togglePriority = async (item) => {
    const newPriority = !item.isTopPriority;

    // Optimistic Update
    const updateList = (list) => list.map(c => c._id === item._id ? { ...c, isTopPriority: newPriority } : c);
    setNotStartCases(prev => updateList(prev));
    setAllCases(prev => updateList(prev));

    try {
      await axios.put(`${_global.BASE_URL}cases/${item._id}/top-priority/${newPriority}`, [
        {
          id: user._id,
          name: `${user.firstName}, ${user.lastName}`,
          date: new Date(),
          isTopPriority: newPriority,
          msg: `Case marked as ${newPriority ? 'Top Priority' : 'Normal'}`,
        }
      ]);
      showToastMessage(`Case marked as ${newPriority ? 'Top Priority' : 'Normal'}`, "success");
    } catch (error) {
      console.error("Error toggling priority:", error);
      showToastMessage("Error updating priority", "error");
      // Revert optimistic update (simplified)
      const revertList = (list) => list.map(c => c._id === item._id ? { ...c, isTopPriority: item.isTopPriority } : c);
      setNotStartCases(prev => revertList(prev));
      setAllCases(prev => revertList(prev));
    }
  };


  const handleScheduleSave = async () => {
    // Determine target(s)
    let targets = [];
    if (buffCase) {
      targets = [buffCase._id];
    } else if (selectedCases.length > 0) {
      targets = selectedCases;
    } else {
      return;
    }

    // Build payload
    const payload = {};
    if (scheduleConfig.cadCam.selected) payload.deadlineCadCam = scheduleConfig.cadCam.date;
    if (scheduleConfig.fitting.selected) payload.deadlineFitting = scheduleConfig.fitting.date;
    if (scheduleConfig.ceramic.selected) payload.deadlineCeramic = scheduleConfig.ceramic.date;

    if (Object.keys(payload).length === 0) {
      showToastMessage("Please select at least one department", "error");
      return;
    }

    try {
      await Promise.all(targets.map(id =>
        axios.patch(`${_global.BASE_URL}cases/${id}`, payload)
      ));

      // Update local state (Optimistic-ish, assumed success)
      const updateStateList = (list) => list.map(item => {
        if (targets.includes(item._id)) {
          return { ...item, ...payload };
        }
        return item;
      });

      setNotStartCases(prev => updateStateList(prev));
      setAllCases(prev => updateStateList(prev));

      showToastMessage("Cases scheduled successfully", "success");
      setSelectedCases([]);
      setBuffCase(null); // Clear buffer

      const closeBtn = document.getElementById("closeScheduleModalBtn");
      if (closeBtn) closeBtn.click();
    } catch (error) {
      console.error("Error scheduling cases:", error);
      showToastMessage("Error scheduling cases", "error");
    }
  };

  const handleBulkTopPriority = async () => {
    if (selectedCases.length === 0) return;

    // Optimistic UI Update
    const updatedNotStart = notStartCases.map(item => {
      if (selectedCases.includes(item._id)) {
        return { ...item, isTopPriority: true };
      }
      return item;
    });
    setNotStartCases(updatedNotStart);

    const updatedAllCases = allCases.map(item => {
      if (selectedCases.includes(item._id)) {
        return { ...item, isTopPriority: true };
      }
      return item;
    });
    setAllCases(updatedAllCases);

    try {
      await Promise.all(selectedCases.map(id =>
        axios.put(`${_global.BASE_URL}cases/${id}/top-priority/true`, [
          {
            id: user._id,
            name: `${user.firstName}, ${user.lastName}`,
            date: new Date(),
            isTopPriority: true,
            msg: " Case is marked as Top Priority",
          }
        ])
      ));

      showToastMessage("Selected cases marked as Top Priority", "success");
      setSelectedCases([]);
    } catch (error) {
      console.error("Error updating priority:", error);
      showToastMessage("Error marking cases as specific priority", "error");
    }
  };



  return (
    <div className="content">
      <div className="card">
        <h5 class="card-title">
          <span>Cases</span>
          <span className="add-user-icon">
            {(user.roles[0] === _global.allRoles.admin ||
              user.lastName === "Jamous") && (
                <span onClick={() => navigate("/layout/add-case")}>
                  {" "}
                  <i class="fa-solid fa-circle-plus "></i>
                </span>
              )}
          </span>
        </h5>
        <div className="card-body">
          <ul class="nav nav-tabs" id="myTab" role="tablist">
            <li class="nav-item" role="presentation">
              <button
                className={`nav-link bgc-primary ${activeTab === 0 ? "active " : ""
                  }`}
                id="allCases-tab"
                data-bs-toggle="tab"
                data-bs-target="#allCases-tab-pane"
                type="button"
                role="tab"
                aria-controls="allCases-tab-pane"
                aria-selected={activeTab === 0}
                onClick={() => handleTabChange(0)}
              >
                All <small>({allCases.length})</small>
              </button>
            </li>
            {((user.roles[0] === _global.allRoles.admin &&
              departments[0].name === "QC") ||
              user.roles[0] === _global.allRoles.Reception ||
              user.lastName === "Jamous") && (
                <li
                  class="nav-item"
                  role="presentation"
                  onClick={() => {
                    setSearchText("");
                    setAllCases(buffAllCases);
                  }}
                >
                  <button
                    // class="nav-link  bgc-info"
                    className={`nav-link bgc-info ${activeTab === 1 ? "active " : ""
                      }`}
                    id="notStart-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#notStart-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="notStart-tab-pane"
                    aria-selected={activeTab === 1}
                    onClick={() => handleTabChange(1)}
                  >
                    Not Start <small>({notStartCases.length})</small>
                  </button>
                </li>
              )}
            {/* {user.roles[0] === _global.allRoles.admin &&    
        <li
              class="nav-item"
              role="presentation"
              onClick={() => {
                setSearchText("");
               
              }}
            >
              <button
                className={`nav-link ${activeTab === 15 ? "active " : ""}`}
                style={{ backgroundColor: "#479f42", color: "white" }}
                id="forAssign-tab"
                data-bs-toggle="tab"
                data-bs-target="#forAssign-tab-pane"
                type="button"
                role="tab"
                aria-controls="forAssign-tab-pane"
                aria-selected={activeTab === 15}
                onClick={() => handleTabChange(15)}
              >
                For Assign <small>({forAssignCases.length})</small>
              </button>
            </li>} */}
            <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                id="home-tab"
                className={`nav-link bgc-warning ${activeTab === 2 ? "active bgc-warning" : ""
                  }`}
                data-bs-toggle="tab"
                data-bs-target="#home-tab-pane"
                type="button"
                role="tab"
                aria-controls="home-tab-pane"
                aria-selected={activeTab === 2}
                onClick={() => handleTabChange(2)}
              >
                In Progress <small>({inProcessCases.length})</small>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                className={`nav-link bgc-danger ${activeTab === 3 ? "active " : ""
                  }`}
                id="profile-tab"
                data-bs-toggle="tab"
                data-bs-target="#profile-tab-pane"
                type="button"
                role="tab"
                aria-controls="profile-tab-pane"
                aria-selected={activeTab === 3}
                onClick={() => handleTabChange(3)}
              >
                Holding <small>({holdingCases?.length})</small>
              </button>
            </li>
            {/*  <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                className={`nav-link bgc-success ${
                  activeTab === 4 ? "active " : ""
                }`}
                id="contact-tab"
                data-bs-toggle="tab"
                data-bs-target="#contact-tab-pane"
                type="button"
                role="tab"
                aria-controls="contact-tab-pane"
                aria-selected={activeTab === 4}
                onClick={() => handleTabChange(4)}
              >
                Finished <small>({finishedCases.length})</small>
              </button>
            </li> */}
            <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                // class="nav-link bgc-danger"
                className={`nav-link bgc-danger ${activeTab === 5 ? "active " : ""
                  }`}
                id="delay-tab"
                data-bs-toggle="tab"
                data-bs-target="#delay-tab-pane"
                type="button"
                role="tab"
                aria-controls="delay-tab-pane"
                aria-selected={activeTab === 5}
                onClick={() => handleTabChange(5)}
              >
                Delay <small>({delayCases.length})</small>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                className={`nav-link animate-me bgc-danger_1 ${activeTab === 6 ? "active  " : ""
                  }`}
                id="urgent-tab"
                data-bs-toggle="tab"
                data-bs-target="#urgent-tab-pane"
                type="button"
                role="tab"
                aria-controls="urgent-tab-pane"
                aria-selected={activeTab === 6}
                onClick={() => handleTabChange(6)}
              >
                Urgent <small>({urgentCases?.length})</small>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                className={`nav-link bgc-study ${activeTab === 7 ? "active  " : ""
                  }`}
                id="study-tab"
                data-bs-toggle="tab"
                data-bs-target="#study-tab-pane"
                type="button"
                role="tab"
                aria-controls="study-tab-pane"
                aria-selected={activeTab === 7}
                onClick={() => handleTabChange(7)}
              >
                Study <small>({studyCases?.length})</small>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                className={`nav-link bgc-primary ${activeTab === 8 ? "active  " : ""
                  }`}
                id="packing-tab"
                data-bs-toggle="tab"
                data-bs-target="#packing-tab-pane"
                type="button"
                role="tab"
                aria-controls="packing-tab-pane"
                aria-selected={activeTab === 8}
                onClick={() => handleTabChange(8)}
              >
                Packing <small>({packingCases?.length})</small>
              </button>
            </li>
            <li
              class="nav-item"
              role="forWork"
              onClick={() => setSearchText("")}
            >
              <button
                className={`nav-link bgc-work ${activeTab === 9 ? "active  " : ""
                  }`}
                id="work-tab"
                data-bs-toggle="tab"
                data-bs-target="#work-tab-pane"
                type="button"
                role="tab"
                aria-controls="work-tab-pane"
                aria-selected={activeTab === 9}
                onClick={() => handleTabChange(9)}
              >
                For Work <small>({notStartCases?.length})</small>
              </button>
            </li>
            <li
              class="nav-item"
              role="forShipments"
              onClick={() => setSearchText("")}
            >
              <button
                className={`nav-link text-bg-success ${activeTab === 10 ? "active  " : ""
                  }`}
                id="shipment-tab"
                data-bs-toggle="tab"
                data-bs-target="#shipment-tab-pane"
                type="button"
                role="tab"
                aria-controls="shipment-tab-pane"
                aria-selected={activeTab === 10}
                onClick={() => handleTabChange(10)}
              >
                Shipments <small>({forShipments?.length})</small>
              </button>
            </li>
            <li class="nav-item" role="redo" onClick={() => setSearchText("")}>
              <button
                className={`nav-link bgc-redo ${activeTab === 12 ? "active  " : ""
                  }`}
                id="redo-tab"
                data-bs-toggle="tab"
                data-bs-target="#redo-tab-pane"
                type="button"
                role="tab"
                aria-controls="redo-tab-pane"
                aria-selected={activeTab === 12}
                onClick={() => handleTabChange(12)}
              >
                Redo <small>({redoCases?.length})</small>
              </button>
            </li>
            <li
              class="nav-item"
              role="clinics"
              onClick={() => setSearchText("")}
            >
              <button
                className={`nav-link bgc-clinics ${activeTab === 13 ? "active  " : ""
                  }`}
                id="clinics-tab"
                data-bs-toggle="tab"
                data-bs-target="#clinics-tab-pane"
                type="button"
                role="tab"
                aria-controls="clinics-tab-pane"
                aria-selected={activeTab === 13}
                onClick={() => handleTabChange(13)}
              >
                Clinics <small>({allCasesInClinics?.length})</small>
              </button>
            </li>
            <li
              class="nav-item"
              role="implantCases"
              onClick={() => setSearchText("")}
            >
              <button
                className={`nav-link bgc-implants ${activeTab === 14 ? "active  " : ""
                  }`}
                id="implantCases-tab"
                data-bs-toggle="tab"
                data-bs-target="#implantCases-tab-pane"
                type="button"
                role="tab"
                aria-controls="implantCasestab-pane"
                aria-selected={activeTab === 14}
                onClick={() => handleTabChange(14)}
              >
                Implants Cases <small>({allCasesImplants?.length})</small>
              </button>
            </li>
          </ul>
          <div
            class="tab-content"
            id="myTabContent"
            onClick={() => setSearchText("")}
          >
            {/* All Cases */}
            <div
              // class="tab-pane fade show active"
              className={`tab-pane  fade ${activeTab === 0 ? "show active" : ""
                }`}
              id="allCases-tab-pane"
              role="tabpanel"
              aria-labelledby="allCases-tab"
              tabIndex="0"
            >
              <div className="row ">
                <div className="col-md-6">
                  <div className=""></div>
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      name="searchText"
                      className="form-control"
                      placeholder="Search by name | case number | case type "
                      onKeyDown={handleKeyDown} // Trigger search on Enter key
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      id="button-addon2"
                      onClick={() => searchbyIcon()}
                    >
                      <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  {/* <DatePicker
                    multiple
                    value={value}
                    onChange={setValue}
                    plugins={[<DatePanel />]}
                  /> */}
                  <DatePicker
                    className="form-control"
                    range
                    value={values}
                    onChange={setValues}
                    plugins={[<DatePanel />]}
                    onClose={() => getCasesByRangeDate()}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <select
                    class="form-select"
                    aria-label="Default select example"
                    onChange={(e) => setFilterBy(e.target.value)}
                  >
                    <option selected>Filter by</option>
                    <option value={SEARCH_FIELDS.CASE_NUMBER}>
                      Case Number
                    </option>
                    <option value={SEARCH_FIELDS.DOCTOR}>Doctor Name</option>
                    <option value={SEARCH_FIELDS.PATIENT}>Patient Name</option>
                  </select>
                </div>
              </div>
              {allCases.length > 0 && (
                <table className="table table-responsive text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      {(user.roles[0] === _global.allRoles.admin ||
                        user.lastName === "Jamous" ||
                        user.roles[0] === _global.allRoles.Reception) && (
                          <th scope="col">
                            <span onClick={() => printSelectedItems()}>
                              <i class="fas fa-print"></i>
                            </span>
                          </th>
                        )}
                      <th scope="col">#</th>
                      <th scope="col">Doctor </th>
                      <th scope="col">Patient</th>
                      {/* <th scope="col">Assignment Status</th> */}
                      <th className="td-phone" scope="col">
                        #Unites
                      </th>
                      <th scope="col">In</th>
                      <th scope="col">Due</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCases.map((item, index) => (
                      <tr
                        role="alert"
                        className={
                          (item.isHold ? "table-danger" : "") ||
                          (item.isUrgent ? "urgent-case animate-me" : "") ||
                          checkCaseDate(item)
                        }
                        key={item._id}
                      >
                        {(user.roles[0] === _global.allRoles.admin ||
                          user.roles[0] === _global.allRoles.Reception ||
                          user.lastName === "Jamous") && (
                            <td>
                              <div class="form-check">
                                <input
                                  class="form-check-input"
                                  type="checkbox"
                                  value=""
                                  id={item._id}
                                  onChange={(e) => handleCheckboxChange(e, item)}
                                />
                                <label
                                  class="form-check-label"
                                  for={item._id}
                                ></label>
                              </div>
                            </td>
                          )}
                        <td>
                          <span
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title={getReasonlate(item)}
                          >
                            {item.caseNumber}
                          </span>
                        </td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        {/* <td>
                          <div className="assignment-status">
                            <span
                              className={`badge ${
                                hasAssignments(item)
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {getAssignmentStatusText(item)}
                            </span>
                          </div>
                        </td> */}
                        <td
                          className={`${item.teethNumbers.length <= 0
                            ? "bg-danger"
                            : "bg-white"
                            } td-phone`}
                        >
                          {item.teethNumbers.length}
                        </td>
                        {/* <td>{item.caseType}</td> */}
                        <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                        <td>
                          {item.dateOut &&
                            _global.formatDateToYYYYMMDD(item.dateOut)}
                        </td>
                        <td>
                          <div className="actions-btns">
                            <span
                              className="c-success"
                              // onClick={() => viewCase(item, "view")}
                              onClick={() => {
                                buffCaseHandle(item);
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#viewModal"
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            {/* {user.roles[0] === _global.allRoles.admin && (
                              <>
                                <span
                                  className="c-primary"
                                  data-bs-toggle="modal"
                                  data-bs-target="#assignUserModal"
                                  onClick={() =>
                                    openAssignModal(item, "assign")
                                  }
                                  title="Assign User"
                                >
                                  <i class="fa-solid fa-user-plus"></i>
                                </span>
                                {hasAssignments(item) && (
                                  <>
                                    <span
                                      className="c-warning"
                                      data-bs-toggle="modal"
                                      data-bs-target="#assignUserModal"
                                      onClick={() =>
                                        openAssignModal(item, "reassign")
                                      }
                                      title="Reassign User"
                                    >
                                      <i class="fa-solid fa-user-edit"></i>
                                    </span>
                                    <span
                                      className="c-danger"
                                      data-bs-toggle="modal"
                                      data-bs-target="#assignUserModal"
                                      onClick={() =>
                                        openAssignModal(item, "unassign")
                                      }
                                      title="Unassign User"
                                    >
                                      <i class="fa-solid fa-user-minus"></i>
                                    </span>
                                  </>
                                )}
                              </>
                            )} */}
                            <span
                              className="c-success"
                              onClick={() => viewCaseHandle(item, "process")}
                            // onClick={() => {
                            //   buffCaseHandle(item);
                            // }}
                            // data-bs-toggle="modal"
                            // data-bs-target="#ProcessModal"
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
                            {!item.isHold &&
                              !item.cadCam.status.isEnd &&
                              (user.roles[0] === _global.allRoles.admin ||
                                (user.roles[0] ===
                                  _global.allRoles.technician &&
                                  departments[0].name === "CadCam") ||
                                (user.roles[0] ===
                                  _global.allRoles.technician &&
                                  user.lastName === "Jamous") ||
                                user.roles[0] ===
                                _global.allRoles.super_admin) && (
                                <span
                                  data-bs-toggle="modal"
                                  data-bs-target="#caseHoldModal"
                                  onClick={() => {
                                    setIsHoldCase(true);
                                    setBuffCase(item);
                                  }}
                                >
                                  <i class="fa-regular fa-circle-pause"></i>
                                </span>
                              )}
                            {item?.historyHolding?.length > 0 &&
                              (user.roles[0] === _global.allRoles.admin ||
                                (user.roles[0] ===
                                  _global.allRoles.technician &&
                                  departments[0].name === "CadCam") ||
                                (user.roles[0] ===
                                  _global.allRoles.technician &&
                                  user.lastName === "Jamous") ||
                                user.roles[0] ===
                                _global.allRoles.super_admin) && (
                                <span
                                  className="c-primary"
                                  data-bs-toggle="modal"
                                  data-bs-target="#caseHoldHistoryModal"
                                  onClick={() => {
                                    setBuffCase(item);
                                  }}
                                >
                                  <i class="fas fa-history"></i>
                                </span>
                              )}
                            {/* { (user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" || user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&& */}
                            {((user.roles[0] === _global.allRoles.technician &&
                              user.lastName === "Jamous") ||
                              (user.roles[0] === _global.allRoles.admin &&
                                departments[0].name === "QC") ||
                              user.roles[0] ===
                              _global.allRoles.super_admin) && (
                                <>
                                  <span
                                    className="c-primary ml-3"
                                    onClick={(e) => editCase(item._id)}
                                  >
                                    <i class="fas fa-edit"></i>
                                  </span>
                                  <span
                                    className="c-success"
                                    onClick={(e) =>
                                      navigate(`/layout/redo-case/${item._id}`, {
                                        state: { isRedo: true },
                                      })
                                    }
                                  >
                                    <i class="fas fa-retweet"></i>
                                  </span>
                                </>
                              )}
                            {!item.isUrgent &&
                              !item?.delivering?.status?.isEnd &&
                              // user.roles[0] === _global.allRoles.admin ||
                              (user.roles[0] === _global.allRoles.Reception ||
                                (user.roles[0] ===
                                  _global.allRoles.technician &&
                                  user.lastName === "Jamous") ||
                                user.roles[0] ===
                                _global.allRoles.receptionPacking) && (
                                <span
                                  data-bs-toggle="modal"
                                  data-bs-target="#caseUrgentModal"
                                  onClick={() => {
                                    setIsUrgentCase(true);
                                    setBuffCase(item);
                                  }}
                                >
                                  <span className="c-danger">
                                    <i class="far fa-calendar-check"></i>
                                  </span>
                                </span>
                              )}
                            {(user.firstName === "Fake" ||
                              (user.roles[0] === _global.allRoles.technician &&
                                user.lastName === "Jamous") ||
                              user.roles[0] === _global.allRoles.admin) && (
                                <span
                                  data-bs-toggle="modal"
                                  data-bs-target="#deleteCaseModal"
                                  onClick={() => {
                                    setBuffCase(item);
                                  }}
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </span>
                              )}
                            {user.roles[0] === _global.allRoles.Reception &&
                              !item.isApprove && (
                                <span
                                  className="c-success"
                                  // data-bs-toggle="modal"
                                  // data-bs-target="#deleteCaseModal"
                                  onClick={() => {
                                    setBuffCase(item);
                                    aprroveCase(item._id);
                                  }}
                                >
                                  <i class="fas fa-check-circle"></i>
                                </span>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {allCases.length <= 0 && (
                <div className="no-content">No Cases Added yet!</div>
              )}
            </div>
            {/* In Not Start  */}
            <div
              // class="tab-pane fade "
              className={`tab-pane fade ${activeTab === 1 ? "show active" : ""
                }`}
              id="notStart-tab-pane"
              role="tabpanel"
              aria-labelledby="notStart-tab"
              tabIndex="1"
            >
              <div className="form-group">
                <input
                  type="text"
                  name="searchText"
                  className="form-control"
                  placeholder="Search by name | case number | case type "
                  value={searchText}
                  onChange={(e) => searchByName(e.target.value, "notStart")}
                />
              </div>
              {/* Selection Controls */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                {/* <div className="d-flex align-items-center">
                      <input
                        type="checkbox"
                        className="form-check-input me-2"
                        checked={(() => {
                          const selectableCases = forAssignCases.filter(item => !isAssignedToCadCam(item));
                          return selectedCases.length === selectableCases.length && selectableCases.length > 0;
                        })()}
                        onChange={(e) => handleSelectAllCases(e.target.checked)}
                      />
                      <label className="form-check-label">
                        Select All ({selectedCases.length}/{forAssignCases.filter(item => !isAssignedToCadCam(item)).length} selectable)
                      </label>
                    </div> */}
                {selectedCases.length > 0 && (
                  <div className="btn-group" role="group">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        setBuffCase(null); // Clear single case selection
                        setAssignmentAction("assign");
                        setSelectedAssignUsers({});
                        // Load users if not already loaded
                        if (assignUsers.length === 0) {
                          axios
                            .get(`${_global.BASE_URL}users`)
                            .then((res) => {
                              const list = (res.data || []).filter(
                                (u) => u.active === true
                              );
                              setAssignUsers(list);
                              const usersByDept = {};
                              list.forEach((u) => {
                                if (Array.isArray(u.departments)) {
                                  u.departments.forEach((d) => {
                                    if (
                                      allowedAssignDepartments.has(d.name)
                                    ) {
                                      if (!usersByDept[d.name])
                                        usersByDept[d.name] = [];
                                      usersByDept[d.name].push(u);
                                    }
                                  });
                                }
                              });
                              setAssignUsersByDept(usersByDept);
                            })
                            .catch((error) => {
                              console.error("Error fetching users:", error);
                            });
                        }
                      }}
                      data-bs-toggle="modal"
                      data-bs-target="#assignUserModal"
                    >
                      <i class="fa-solid fa-user-plus me-1"></i>
                      Assign
                    </button>
                    {/* <button
                          className="btn btn-warning btn-sm"
                          onClick={() => {
                            setBuffCase(null);
                            setAssignmentAction('reassign');
                            setSelectedAssignUsers({});
                            // Load users if not already loaded
                            if (assignUsers.length === 0) {
                              axios
                                .get(`${_global.BASE_URL}users`)
                                .then((res) => {
                                  const list = (res.data || []).filter((u) => u.active === true);
                                  setAssignUsers(list);
                                  const usersByDept = {};
                                  list.forEach((u) => {
                                    if (Array.isArray(u.departments)) {
                                      u.departments.forEach((d) => {
                                        if (allowedAssignDepartments.has(d.name)) {
                                          if (!usersByDept[d.name]) usersByDept[d.name] = [];
                                          usersByDept[d.name].push(u);
                                        }
                                      });
                                    }
                                  });
                                  setAssignUsersByDept(usersByDept);
                                })
                                .catch((error) => {
                                  console.error("Error fetching users:", error);
                                });
                            }
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#assignUserModal"
                        >
                          <i class="fa-solid fa-user-edit me-1"></i>
                          Reassign
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setBuffCase(null);
                            setAssignmentAction('unassign');
                            setSelectedAssignUsers({});
                            // Load users if not already loaded
                            if (assignUsers.length === 0) {
                              axios
                                .get(`${_global.BASE_URL}users`)
                                .then((res) => {
                                  const list = (res.data || []).filter((u) => u.active === true);
                                  setAssignUsers(list);
                                  const usersByDept = {};
                                  list.forEach((u) => {
                                    if (Array.isArray(u.departments)) {
                                      u.departments.forEach((d) => {
                                        if (allowedAssignDepartments.has(d.name)) {
                                          if (!usersByDept[d.name]) usersByDept[d.name] = [];
                                          usersByDept[d.name].push(u);
                                        }
                                      });
                                    }
                                  });
                                  setAssignUsersByDept(usersByDept);
                                })
                                .catch((error) => {
                                  console.error("Error fetching users:", error);
                                });
                            }
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#assignUserModal"
                        >
                          <i class="fa-solid fa-user-minus me-1"></i>
                          Unassign
                        </button> */}
                  </div>
                )}
                {/* {selectedCases.length > 0 && (
                  <div className="btn-group mx-2" role="group">
                    <button
                      className="btn btn-warning btn-sm text-white me-2"
                      onClick={handleBulkTopPriority}
                    >
                      Top Priority
                    </button>
                    <button
                      className="btn btn-info btn-sm text-white "
                      data-bs-toggle="modal"
                      data-bs-target="#scheduleModal"
                    >
                      <i className="fa-regular fa-calendar me-1"></i>
                      Schedule
                    </button>
                  </div>
                )} */}
              </div>
              {notStartCases.length > 0 && (
                <table className="table table-responsive text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">Select</th>

                      <th scope="col">#Case</th>
                      <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>
                        Doctor Name {renderSortIcon("doctorName")}
                      </th>
                      <th scope="col">Patient Name</th>
                      <th scope="col" onClick={() => handleSort("technicianName")} style={{ cursor: "pointer" }}>
                        Cad Cam {renderSortIcon("technicianName")}
                      </th>
                      <th scope="col">Ceramic</th>
                      {/* <th scope="col">Type</th> */}
                      <th className="td-phone" scope="col">
                        #Unites
                      </th>
                      <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>
                        In {renderSortIcon("dateIn")}
                      </th>
                      <th scope="col">Due</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {console.log("notStartCases", notStartCases)}
                    {notStartCases.map((item, index) => (
                      <tr key={item._id} className={checkNotStartDelay(item)}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={
                              item.isAssignedCadCam ||
                              selectedCases.includes(item._id)
                            }
                            disabled={item.isAssignedCadCam}
                            onChange={(e) =>
                              handleCaseSelection(item._id, e.target.checked)
                            }
                            title={
                              isAssignedToCadCam(item)
                                ? "Case is assigned to CadCam - cannot be selected"
                                : "Select case for assignment"
                            }
                          />
                        </td>
                        <td>{item.caseNumber}</td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        <td>
                          {item.isAssignedCadCam && item.assignmentHistory &&
                            item.assignmentHistory.length > 0 &&
                            item.assignmentHistory[
                              item.assignmentHistory.length - 1
                            ].newAssignment &&
                            item.assignmentHistory[
                              item.assignmentHistory.length - 1
                            ].newAssignment.length > 0
                            ? item.assignmentHistory[
                              item.assignmentHistory.length - 1
                            ].newAssignment[
                              item.assignmentHistory[
                                item.assignmentHistory.length - 1
                              ].newAssignment.length - 1
                            ].userName
                            : "-"}
                        </td>
                        <td>
                          <div className="text-start small">
                            {(() => {
                              const assignments = getCadCamAndCeramicAssignments(item);
                              return (
                                <>
                                  {/* {assignments.cadCam && (
                                    <div><strong>CadCam:</strong> {assignments.cadCam}</div>
                                  )} */}
                                  {assignments.ceramic && item.isAssignedCeramic && (
                                    <div className="text-center"><  strong>{assignments.ceramic ? assignments.ceramic : "-"}</strong></div>
                                  )}
                                  {!assignments.ceramic && (
                                    <div className="text-center"><strong>-</strong></div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        {/* <td>{item.caseType}</td> */}
                        <td
                          className={`${item.teethNumbers.length <= 0
                            ? "bg-danger"
                            : "bg-white"
                            } td-phone`}
                        >
                          {item.teethNumbers.length}
                        </td>
                        <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                        <td>
                          {item.dateOut &&
                            _global.formatDateToYYYYMMDD(item.dateOut)}
                        </td>
                        <td>
                          <div className="actions-btns">
                            {(item.isAssignedCadCam || item.isAssignedCeramic) &&
                              <>
                                <span
                                  className="c-warning"
                                  onClick={() =>
                                    openAssignModal(item, "reassign")
                                  }
                                  data-bs-toggle="modal"
                                  data-bs-target="#assignUserModal"
                                  title="Reassign User"
                                >
                                  <i class="fa-solid fa-user-edit"></i>
                                </span>
                                <span
                                  className="c-danger"
                                  onClick={() =>
                                    openAssignModal(item, "unassign")
                                  }
                                  data-bs-toggle="modal"
                                  data-bs-target="#assignUserModal"
                                  title="Unassign User"
                                >
                                  <i class="fa-solid fa-user-minus"></i>
                                </span>
                              </>
                            }
                            <span
                              className="c-success"
                              // onClick={() => viewCaseHandle(item, "view")}
                              onClick={() => {
                                buffCaseHandle(item);
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#viewModal"
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCaseHandle(item, "process")}
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
                            {((user.roles[0] === _global.allRoles.technician &&
                              user.lastName === "Jamous") ||
                              (user.roles[0] === _global.allRoles.admin &&
                                departments[0].name === "QC")) && (
                                <span
                                  className="c-primary"
                                  onClick={(e) => editCase(item._id)}
                                >
                                  <i class="fas fa-edit"></i>
                                </span>
                              )}
                            {/* New Row Buttons */}
                            <span
                              className={item.isTopPriority ? "c-danger" : "c-warning"}
                              onClick={() => togglePriority(item)}
                              title="Top Priority"
                            >
                              {item.isTopPriority ? <i className="fa-solid fa-star"></i> : <i className="fa-regular fa-star"></i>}
                            </span>
                            <span
                              className=" c-primary  "
                              onClick={() => {
                                setBuffCase(item);
                                // setScheduleDate(new Date(item.dateOut || new Date())); // Optional: prefill
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#scheduleModal"
                              title="Schedule"
                            >
                              <i className="fa-regular fa-calendar"></i>
                            </span>

                            {(user.firstName === "Fake" ||
                              user.roles[0] === _global.allRoles.admin) && (
                                <span
                                  data-bs-toggle="modal"
                                  data-bs-target="#deleteCaseModal"
                                  onClick={() => {
                                    setBuffCase(item);
                                  }}
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </span>
                              )}
                            {/* <span onClick={(e) => deleteCase(item._id)}>
                              <i className="fa-solid fa-trash-can"></i>
                            </span> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {user.roles[0] === _global.allRoles.admin && (
                      <>
                        <tr>
                          <td className="f-bold c-success" colSpan={5}>
                            <b>Total of Pieces</b>
                          </td>
                          <td
                            className="bg-success p-2 text-dark bg-opacity-50"
                            colSpan={2}
                          >
                            <b>{sumOfTeethNumbersLength("Start")}</b>
                          </td>
                        </tr>
                        {/* {user.roles[0] === _global.allRoles.admin && (
                          <tr>
                            <td className="f-bold c-success" colSpan={5}>
                              <b>Total Without Study</b>
                            </td>
                            <td
                              className="bg-success p-2 text-dark bg-opacity-50"
                              colSpan={2}
                            >
                              <b>
                                {sumOfTeethNumbersLength("Start") -
                                  getStudyCases(
                                    groupCasesTeethNumbersByName("Start")
                                  )}
                              </b>
                            </td>
                          </tr>
                        )} */}
                        <tr>
                          <td colSpan={7}>
                            <div className="summary-teeth-cases">
                              {groupCasesTeethNumbersByName("Start")?.map(
                                (item) => (
                                  <p className="mb-0">
                                    <span>{item.name}:</span>
                                    <b className="badge text-bg-success">
                                      {item.count}
                                    </b>
                                  </p>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              )}
              {notStartCases.length <= 0 && (
                <div className="no-content">No Cases Not Start yet!</div>
              )}
            </div>
            {/* For Assign */}
            <div
              className={`tab-pane fade ${activeTab === 15 ? "show active" : ""
                }`}
              id="forAssign-tab-pane"
              role="tabpanel"
              aria-labelledby="forAssign-tab"
              tabIndex="15"
            >
              <div className="form-group">
                <input
                  type="text"
                  name="searchText"
                  className="form-control"
                  placeholder="Search by name | case number | case type "
                  value={searchText}
                  onChange={(e) => searchByName(e.target.value, "forAssign")}
                />
              </div>
              {forAssignCases.length > 0 && (
                <div>
                  {/* Selection Controls */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    {/* <div className="d-flex align-items-center">
                      <input
                        type="checkbox"
                        className="form-check-input me-2"
                        checked={(() => {
                          const selectableCases = forAssignCases.filter(item => !isAssignedToCadCam(item));
                          return selectedCases.length === selectableCases.length && selectableCases.length > 0;
                        })()}
                        onChange={(e) => handleSelectAllCases(e.target.checked)}
                      />
                      <label className="form-check-label">
                        Select All ({selectedCases.length}/{forAssignCases.filter(item => !isAssignedToCadCam(item)).length} selectable)
                      </label>
                    </div> */}
                    {selectedCases.length > 0 && (
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            setBuffCase(null); // Clear single case selection
                            setAssignmentAction("assign");
                            setSelectedAssignUsers({});
                            // Load users if not already loaded
                            if (assignUsers.length === 0) {
                              axios
                                .get(`${_global.BASE_URL}users`)
                                .then((res) => {
                                  const list = (res.data || []).filter(
                                    (u) => u.active === true
                                  );
                                  setAssignUsers(list);
                                  const usersByDept = {};
                                  list.forEach((u) => {
                                    if (Array.isArray(u.departments)) {
                                      u.departments.forEach((d) => {
                                        if (
                                          allowedAssignDepartments.has(d.name)
                                        ) {
                                          if (!usersByDept[d.name])
                                            usersByDept[d.name] = [];
                                          usersByDept[d.name].push(u);
                                        }
                                      });
                                    }
                                  });
                                  setAssignUsersByDept(usersByDept);
                                })
                                .catch((error) => {
                                  console.error("Error fetching users:", error);
                                });
                            }
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#assignUserModal"
                        >
                          <i class="fa-solid fa-user-plus me-1"></i>
                          Assign
                        </button>
                        {/* <button
                          className="btn btn-warning btn-sm"
                          onClick={() => {
                            setBuffCase(null);
                            setAssignmentAction('reassign');
                            setSelectedAssignUsers({});
                            // Load users if not already loaded
                            if (assignUsers.length === 0) {
                              axios
                                .get(`${_global.BASE_URL}users`)
                                .then((res) => {
                                  const list = (res.data || []).filter((u) => u.active === true);
                                  setAssignUsers(list);
                                  const usersByDept = {};
                                  list.forEach((u) => {
                                    if (Array.isArray(u.departments)) {
                                      u.departments.forEach((d) => {
                                        if (allowedAssignDepartments.has(d.name)) {
                                          if (!usersByDept[d.name]) usersByDept[d.name] = [];
                                          usersByDept[d.name].push(u);
                                        }
                                      });
                                    }
                                  });
                                  setAssignUsersByDept(usersByDept);
                                })
                                .catch((error) => {
                                  console.error("Error fetching users:", error);
                                });
                            }
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#assignUserModal"
                        >
                          <i class="fa-solid fa-user-edit me-1"></i>
                          Reassign
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setBuffCase(null);
                            setAssignmentAction('unassign');
                            setSelectedAssignUsers({});
                            // Load users if not already loaded
                            if (assignUsers.length === 0) {
                              axios
                                .get(`${_global.BASE_URL}users`)
                                .then((res) => {
                                  const list = (res.data || []).filter((u) => u.active === true);
                                  setAssignUsers(list);
                                  const usersByDept = {};
                                  list.forEach((u) => {
                                    if (Array.isArray(u.departments)) {
                                      u.departments.forEach((d) => {
                                        if (allowedAssignDepartments.has(d.name)) {
                                          if (!usersByDept[d.name]) usersByDept[d.name] = [];
                                          usersByDept[d.name].push(u);
                                        }
                                      });
                                    }
                                  });
                                  setAssignUsersByDept(usersByDept);
                                })
                                .catch((error) => {
                                  console.error("Error fetching users:", error);
                                });
                            }
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#assignUserModal"
                        >
                          <i class="fa-solid fa-user-minus me-1"></i>
                          Unassign
                        </button> */}
                      </div>
                    )}
                  </div>

                  <table className="table table-responsive text-center table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">Select</th>
                        <th scope="col">#Case</th>
                        <th scope="col">Doctor Name</th>
                        <th scope="col">Patient Name</th>
                        <th className="td-phone" scope="col">
                          #Unites
                        </th>
                        <th scope="col">In</th>
                        <th scope="col">Due</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forAssignCases.map((item, index) => (
                        <tr key={item._id} className={checkNotStartDelay(item)}>
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={
                                item.isAssignedCadCam ||
                                selectedCases.includes(item._id)
                              }
                              disabled={item.isAssignedCadCam}
                              onChange={(e) =>
                                handleCaseSelection(item._id, e.target.checked)
                              }
                              title={
                                isAssignedToCadCam(item)
                                  ? "Case is assigned to CadCam - cannot be selected"
                                  : "Select case for assignment"
                              }
                            />
                          </td>
                          <td>{item.caseNumber}</td>
                          <td>{item.dentistObj.name}</td>
                          <td>{item.patientName}</td>
                          <td
                            className={`${item.teethNumbers.length <= 0
                              ? "bg-danger"
                              : "bg-white"
                              } td-phone`}
                          >
                            {item.teethNumbers.length}
                          </td>
                          <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                          <td>
                            {item.dateOut &&
                              _global.formatDateToYYYYMMDD(item.dateOut)}
                          </td>
                          <td>
                            <div className="actions-btns">
                              {/* <span
                                className="c-primary"
                                onClick={() => openAssignModal(item, "assign")}
                                data-bs-toggle="modal"
                                data-bs-target="#assignUserModal"
                                title="Assign User"
                              >
                                <i class="fa-solid fa-user-plus"></i>
                              </span> */}
                              {item.isAssignedCadCam && (
                                <>
                                  <span
                                    className="c-warning"
                                    onClick={() =>
                                      openAssignModal(item, "reassign")
                                    }
                                    data-bs-toggle="modal"
                                    data-bs-target="#assignUserModal"
                                    title="Reassign User"
                                  >
                                    <i class="fa-solid fa-user-edit"></i>
                                  </span>
                                  <span
                                    className="c-danger"
                                    onClick={() =>
                                      openAssignModal(item, "unassign")
                                    }
                                    data-bs-toggle="modal"
                                    data-bs-target="#assignUserModal"
                                    title="Unassign User"
                                  >
                                    <i class="fa-solid fa-user-minus"></i>
                                  </span>
                                </>
                              )}
                              <span
                                className="c-success"
                                onClick={() => {
                                  buffCaseHandle(item);
                                }}
                                data-bs-toggle="modal"
                                data-bs-target="#viewModal"
                                title="View Case"
                              >
                                <i class="fa-solid fa-eye"></i>
                              </span>
                              <span
                                className="c-success"
                                onClick={() => viewCaseHandle(item, "process")}
                              >
                                <i class="fa-brands fa-squarespace"></i>
                              </span>

                              {((user.roles[0] ===
                                _global.allRoles.technician &&
                                user.lastName === "Jamous") ||
                                (user.roles[0] === _global.allRoles.admin &&
                                  departments[0].name === "QC")) && (
                                  <span
                                    className="c-primary"
                                    onClick={(e) => editCase(item._id)}
                                  >
                                    <i class="fas fa-edit"></i>
                                  </span>
                                )}
                              {(user.firstName === "Fake" ||
                                user.roles[0] === _global.allRoles.admin) && (
                                  <span
                                    data-bs-toggle="modal"
                                    data-bs-target="#deleteCaseModal"
                                    onClick={() => {
                                      setBuffCase(item);
                                    }}
                                  >
                                    <i className="fa-solid fa-trash-can"></i>
                                  </span>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {user.roles[0] === _global.allRoles.admin && (
                        <>
                          <tr>
                            <td className="f-bold c-success" colSpan={6}>
                              <b>Total of Pieces</b>
                            </td>
                            <td
                              className="bg-success p-2 text-dark bg-opacity-50"
                              colSpan={2}
                            >
                              <b>{sumOfTeethNumbersLength("ForAssign")}</b>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={8}>
                              <div className="summary-teeth-cases">
                                {groupCasesTeethNumbersByName("ForAssign")?.map(
                                  (item) => (
                                    <p className="mb-0">
                                      <span>{item.name}:</span>
                                      <b className="badge text-bg-success">
                                        {item.count}
                                      </b>
                                    </p>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {forAssignCases.length <= 0 && (
                <div className="no-content">No Cases For Assign!</div>
              )}
            </div>
            {/* In Process */}
            <div
              // class="tab-pane fade "
              className={`tab-pane fade ${activeTab === 2 ? "show active" : ""
                }`}
              id="home-tab-pane"
              role="tabpanel"
              aria-labelledby="home-tab"
              tabIndex="2"
            >
              <div className="form-group">
                <input
                  type="text"
                  name="searchText"
                  className="form-control"
                  placeholder="Search by name | case number | case type "
                  value={searchText}
                  onChange={(e) => searchByName(e.target.value, "inProccess")}
                />
              </div>
              {inProcessCases.length > 0 && (
                <table className="table table-responsive text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>
                        Doctor Name {renderSortIcon("doctorName")}
                      </th>
                      <th scope="col">Patient Name</th>
                      {/* <th scope="col">Type</th> */}
                      <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>
                        In {renderSortIcon("dateIn")}
                      </th>
                      <th scope="col">Due</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inProcessCases.map((item, index) => (
                      // className={checkCaseDate(item)}
                      <tr
                        key={item._id}
                      //  className={(item.receptionPacking.status.isEnd === false && item.delivering.status.isEnd === false ? "table-warning" : "") }
                      >
                        <td>{item.caseNumber}</td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        {/* <td>{item.caseType}</td> */}
                        <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                        <td>
                          {item.dateOut &&
                            _global.formatDateToYYYYMMDD(item.dateOut)}
                        </td>
                        <td>
                          <div className="actions-btns">
                            <span
                              className="c-success"
                              // onClick={() => viewCaseHandle(item, "view")}
                              onClick={() => {
                                buffCaseHandle(item);
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#viewModal"
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCaseHandle(item, "process")}
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
                            {((user.roles[0] === _global.allRoles.technician &&
                              user.lastName === "Jamous") ||
                              (user.roles[0] === _global.allRoles.admin &&
                                departments[0].name === "QC")) && (
                                <span
                                  className="c-primary"
                                  onClick={(e) => editCase(item._id)}
                                >
                                  <i class="fas fa-edit"></i>
                                </span>
                              )}
                            {/* <span onClick={(e) => deleteCase(item._id)}>
                              <i className="fa-solid fa-trash-can"></i>
                            </span> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {inProcessCases.length <= 0 && (
                <div className="no-content">No Cases Added yet!</div>
              )}
            </div>
            {/* In Holding */}
            <div
              // class="tab-pane fade"
              className={`tab-pane fade ${activeTab === 3 ? "show active" : ""
                }`}
              id="profile-tab-pane"
              role="tabpanel"
              aria-labelledby="profile-tab"
              tabIndex="2"
            >
              <div
                class="tab-pane fade show active"
                id="home-tab-pane"
                role="tabpanel"
                aria-labelledby="home-tab"
                tabIndex="3"
              >
                <div className="form-group">
                  <input
                    type="text"
                    name="searchText"
                    className="form-control"
                    placeholder="Search by name | case number | case type "
                    value={searchText}
                    onChange={(e) => searchByName(e.target.value, "holing")}
                  />
                </div>
                {holdingCases.length > 0 && (
                  <table className="table table-responsive text-center table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">#Case</th>
                        <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>
                          Doctor Name {renderSortIcon("doctorName")}
                        </th>
                        <th scope="col">Patient Name</th>
                        {/* <th scope="col">Type</th> */}
                        <th className="td-phone" scope="col">
                          #Unites
                        </th>
                        <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>
                          In {renderSortIcon("dateIn")}
                        </th>
                        <th scope="col">Due</th>
                        <th scope="col">Holding Info</th>
                        <th scope="col" onClick={() => handleSort("holdBy")} style={{ cursor: "pointer" }}>
                          Hold By {renderSortIcon("holdBy")}
                        </th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdingCases.map((item, index) => (
                        <tr key={item._id}>
                          <td>{item.caseNumber}</td>
                          <td>{item.dentistObj.name}</td>
                          <td>{item.patientName}</td>
                          {/* <td>{item.caseType}</td> */}
                          <td
                            className={`${item.teethNumbers.length <= 0
                              ? "bg-danger"
                              : "bg-white"
                              } td-phone`}
                          >
                            {item.teethNumbers.length}
                          </td>
                          <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                          <td>
                            {item.dateOut &&
                              _global.formatDateToYYYYMMDD(item.dateOut)}
                          </td>
                          <td>
                            <div className="text-start">
                              {item.historyHolding && item.historyHolding.length > 0 && (() => {
                                const lastHold = item.historyHolding[item.historyHolding.length - 1];
                                return (
                                  <>
                                    {lastHold && (
                                      <div className="mb-1">
                                        <strong>Reason:</strong> {lastHold.msg}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                              {(!item.historyHolding || item.historyHolding.length === 0) && "-"}
                            </div>
                          </td>
                          <td>
                            <div className="text-start">
                              {item.historyHolding && item.historyHolding.length > 0 && (() => {
                                const lastHold = item.historyHolding[item.historyHolding.length - 1];
                                return (
                                  <>
                                    {lastHold && (
                                      <div>
                                        <strong>By:</strong> {lastHold.name}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                              {(!item.historyHolding || item.historyHolding.length === 0) && "-"}
                            </div>
                          </td>
                          <td>
                            <div className="actions-btns">
                              <span
                                className="c-success"
                                // onClick={() => viewCaseHandle(item, "view")}
                                onClick={() => {
                                  buffCaseHandle(item);
                                }}
                                data-bs-toggle="modal"
                                data-bs-target="#viewModal"
                              >
                                <i class="fa-solid fa-eye"></i>
                              </span>
                              <span
                                className="c-success"
                                onClick={() => viewCaseHandle(item, "process")}
                              >
                                <i class="fa-brands fa-squarespace"></i>
                              </span>
                              {/* <span onClick={(e) => deleteCase(item._id)}>
                                <i className="fa-solid fa-trash-can"></i>
                              </span> */}
                              {(user.roles[0] === _global.allRoles.admin ||
                                (user.roles[0] ===
                                  _global.allRoles.technician &&
                                  departments[0].name === "CadCam") ||
                                (user.roles[0] ===
                                  _global.allRoles.technician &&
                                  user.lastName === "Jamous")) && (
                                  <span
                                    data-bs-toggle="modal"
                                    data-bs-target="#caseHoldModal"
                                    onClick={() => {
                                      setIsHoldCase(false);
                                      setBuffCase(item);
                                    }}
                                  >
                                    <i class="fa-solid fa-arrow-rotate-left"></i>
                                  </span>
                                )}
                              {item?.historyHolding?.length > 0 &&
                                (user.roles[0] === _global.allRoles.admin ||
                                  (user.roles[0] ===
                                    _global.allRoles.technician &&
                                    departments[0].name === "CadCam") ||
                                  (user.roles[0] ===
                                    _global.allRoles.technician &&
                                    user.lastName === "Jamous")) && (
                                  <span
                                    className="c-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#caseHoldHistoryModal"
                                    onClick={() => {
                                      setBuffCase(item);
                                    }}
                                  >
                                    <i class="fas fa-history"></i>
                                  </span>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {user.roles[0] === _global.allRoles.admin && (
                        <>
                          <tr>
                            <td className="f-bold c-success" colSpan={5}>
                              <b>Total of Pieces</b>
                            </td>
                            <td
                              className="bg-success p-2 text-dark bg-opacity-50"
                              colSpan={2}
                            >
                              <b>{sumOfTeethNumbersLength("holding")}</b>
                            </td>
                          </tr>
                          {/* {user.roles[0] === _global.allRoles.admin && (
                          <tr>
                            <td className="f-bold c-success" colSpan={5}>
                              <b>Total Without Study</b>
                            </td>
                            <td
                              className="bg-success p-2 text-dark bg-opacity-50"
                              colSpan={2}
                            >
                              <b>
                                {sumOfTeethNumbersLength("Start") -
                                  getStudyCases(
                                    groupCasesTeethNumbersByName("Start")
                                  )}
                              </b>
                            </td>
                          </tr>
                        )} */}
                          <tr>
                            <td colSpan={7}>
                              <div className="summary-teeth-cases">
                                {groupCasesTeethNumbersByName("holding")?.map(
                                  (item) => (
                                    <p className="mb-0">
                                      <span>{item.name}:</span>
                                      <b className="badge text-bg-success">
                                        {item.count}
                                      </b>
                                    </p>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                )}
                {holdingCases.length <= 0 && (
                  <div className="no-content">No Cases Holding yet!</div>
                )}
              </div>
            </div>
            {/* In Finished */}
            {/* <div
              class="tab-pane fade"
              className={`tab-pane fade ${
                activeTab === 4 ? "show active" : ""
              }`}
              id="contact-tab-pane"
              role="tabpanel"
              aria-labelledby="contact-tab"
              tabIndex="4"
            >
              <div className="form-group">
                <input
                  type="text"
                  name="searchText"
                  className="form-control"
                  placeholder="Search by name | case number | case type "
                  value={searchText}
                  onChange={(e) => searchByName(e.target.value, "finished")}
                />
              </div>

              {finishedCases.length > 0 && (
                <table className="table table-responsive text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col">Doctor Name</th>
                      <th scope="col">Patient Name</th>
                      <th scope="col">In</th>
                      <th scope="col">Due</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finishedCases.map((item, index) => (
                      <tr key={item._id}>
                        <td>{item.caseNumber}</td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                        <td>
                          {item.dateOut &&
                            _global.formatDateToYYYYMMDD(item.dateOut)}
                        </td>
                        <td>
                          <div className="actions-btns">
                            <span
                              className="c-success"
                              onClick={() => {
                                buffCaseHandle(item);
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#viewModal"
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCaseHandle(item, "process")}
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
                        
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {finishedCases.length <= 0 && (
                <div className="no-content">No Cases Finished yet!</div>
              )}
            </div> */}
            {/* In Delay */}
            {((user.roles[0] === _global.allRoles.admin &&
              departments[0].name === "QC") ||
              user.roles[0] === _global.allRoles.Reception) && (
                <div
                  // class="tab-pane fade"
                  className={`tab-pane fade ${activeTab === 5 ? "show active" : ""
                    }`}
                  id="delay-tab-pane"
                  role="tabpanel"
                  aria-labelledby="delay-tab"
                  tabIndex="5"
                >
                  <div className="form-group">
                    <input
                      type="text"
                      name="searchText"
                      className="form-control"
                      placeholder="Search by name | case number | case type "
                      value={searchText}
                      onChange={(e) => searchByName(e.target.value, "delay")}
                    />
                  </div>
                  <div className="col-lg-12">
                    {delayCases?.length > 0 &&
                      user.roles[0] === _global.allRoles.Reception && (
                        <div className="col-12 mb-3 print-btn">
                          <button
                            className="btn btn-sm btn-primary "
                            onClick={() => handlePrint()}
                          >
                            {" "}
                            <i class="fas fa-print"></i> print
                          </button>
                        </div>
                      )}
                  </div>
                  <div ref={userRef}>
                    {delayCases.length > 0 && (
                      <table className="table table-responsive text-center table-bordered">
                        <thead>
                          <tr className="table-secondary">
                            <th scope="col">#Case</th>
                            <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>
                              Doctor Name {renderSortIcon("doctorName")}
                            </th>
                            <th scope="col">Patient Name</th>
                            <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>
                              In {renderSortIcon("dateIn")}
                            </th>
                            <th scope="col">Due</th>
                            <th scope="col">#Unites</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {delayCases.map((item, index) => (
                            <tr key={item._id} className={checkCaseDate(item)}>
                              <td
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title={getReasonlate(item)}
                              >
                                {item.caseNumber}
                              </td>
                              <td>{item.dentistObj.name}</td>
                              <td>{item.patientName}</td>
                              {/* <td>{item.caseType}</td> */}
                              <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                              <td>
                                {item.dateOut &&
                                  _global.formatDateToYYYYMMDD(item.dateOut)}
                              </td>
                              <td>{item.teethNumbers.length}</td>
                              <td>
                                <div className="actions-btns non-print">
                                  <span
                                    className="c-success"
                                    // onClick={() => viewCaseHandle(item, "view")}
                                    onClick={() => {
                                      buffCaseHandle(item);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <i class="fa-solid fa-eye"></i>
                                  </span>
                                  <span
                                    className="c-success"
                                    onClick={() =>
                                      viewCaseHandle(item, "process")
                                    }
                                  >
                                    <i class="fa-brands fa-squarespace"></i>
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  {delayCases.length <= 0 && (
                    <div className="no-content">No Cases Delay Cases yet!</div>
                  )}
                </div>
              )}
            {/* Urgent Cases */}
            <div
              // class="tab-pane fade"
              className={`tab-pane fade ${activeTab === 6 ? "show active" : ""
                }`}
              id="urgent-tab-pane"
              role="tabpanel"
              aria-labelledby="urgent-tab"
              tabIndex="6"
            >
              <div className="row">
                <div class="col-lg-10">
                  <div className="form-group">
                    <input
                      type="text"
                      name="searchText"
                      className="form-control"
                      placeholder="Search by name | case number | case type "
                      value={searchText}
                      onChange={(e) => searchByName(e.target.value, "urgent")}
                    />
                  </div>
                </div>
                <div className="col-lg-2">
                  <button
                    className="btn btn-sm btn-primary w-100 p-2"
                    onClick={() => handlePrintUrgentCases()}
                  >
                    {" "}
                    <i class="fas fa-print"></i> print
                  </button>
                </div>
              </div>
              {urgentCases.length > 0 && (
                <table
                  className="table table-responsive text-center table-bordered"
                  ref={casesRefUrgent}
                >
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>
                        Doctor Name {renderSortIcon("doctorName")}
                      </th>
                      <th scope="col">Patient Name</th>
                      <th scope="col">#Unites</th>
                      {/* <th scope="col">Type</th> */}
                      <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>
                        In {renderSortIcon("dateIn")}
                      </th>
                      <th scope="col">Due</th>
                      <th scope="col" className="td-phone">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {urgentCases.map((item, index) => (
                      <tr key={item._id}>
                        <td>{item.caseNumber}</td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        <td
                          className={`${item.teethNumbers.length <= 0
                            ? "bg-danger"
                            : "bg-white"
                            } `}
                        >
                          {item.teethNumbers.length}
                        </td>
                        {/* <td>{item.caseType}</td> */}
                        <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                        <td>
                          {item.dateOut &&
                            _global.formatDateToYYYYMMDD(item.dateOut)}
                        </td>
                        <td className="td-phone">
                          <div className="actions-btns">
                            <span
                              className="c-success"
                              // onClick={() => viewCaseHandle(item, "view")}
                              onClick={() => {
                                buffCaseHandle(item);
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#viewModal"
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCaseHandle(item, "process")}
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
                            {
                              // user.roles[0] === _global.allRoles.admin ||
                              (user.roles[0] === _global.allRoles.Reception ||
                                (user.roles[0] ===
                                  _global.allRoles.technician &&
                                  user.lastName === "Jamous")) && (
                                <span
                                  className="c-success "
                                  data-bs-toggle="modal"
                                  data-bs-target="#caseUrgentModal"
                                  onClick={() => {
                                    setIsUrgentCase(false);
                                    setBuffCase(item);
                                  }}
                                >
                                  <i class="far fa-calendar-times"></i>
                                </span>
                              )
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {urgentCases.length <= 0 && (
                <div className="no-content">No Cases Urgent yet!</div>
              )}
            </div>
            {/* Study Cases */}
            <div
              // class="tab-pane fade"
              className={`tab-pane fade ${activeTab === 7 ? "show active" : ""
                }`}
              id="study-tab-pane"
              role="tabpanel"
              aria-labelledby="study-tab"
              tabIndex="7"
            >
              <div className="row">
                <div class="col-lg-12">
                  <div className="form-group">
                    <input
                      type="text"
                      name="searchText"
                      className="form-control"
                      placeholder="Search by name | case number | case type "
                      value={searchText}
                      onChange={(e) => searchByName(e.target.value, "study")}
                    />
                  </div>
                </div>
                <div className="col-lg-12">

                  {user.roles[0] === _global.allRoles.admin && selectedCases.length > 0 && (
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          setBuffCase(null); // Clear single case selection
                          setAssignmentAction("assign");
                          setSelectedAssignUsers({});
                          // Load users if not already loaded
                          if (assignUsers.length === 0) {
                            axios
                              .get(`${_global.BASE_URL}users`)
                              .then((res) => {
                                const list = (res.data || []).filter(
                                  (u) => u.active === true
                                );
                                setAssignUsers(list);
                                const usersByDept = {};
                                list.forEach((u) => {
                                  if (Array.isArray(u.departments)) {
                                    u.departments.forEach((d) => {
                                      if (
                                        allowedAssignDepartments.has(d.name)
                                      ) {
                                        if (!usersByDept[d.name])
                                          usersByDept[d.name] = [];
                                        usersByDept[d.name].push(u);
                                      }
                                    });
                                  }
                                });
                                setAssignUsersByDept(usersByDept);
                              })
                              .catch((error) => {
                                console.error("Error fetching users:", error);
                              });
                          }
                        }}
                        data-bs-toggle="modal"
                        data-bs-target="#assignUserModal"
                      >
                        <i class="fa-solid fa-user-plus me-1"></i>
                        Assign
                      </button>
                      {/* <button
                          className="btn btn-warning btn-sm"
                          onClick={() => {
                            setBuffCase(null);
                            setAssignmentAction('reassign');
                            setSelectedAssignUsers({});
                            // Load users if not already loaded
                            if (assignUsers.length === 0) {
                              axios
                                .get(`${_global.BASE_URL}users`)
                                .then((res) => {
                                  const list = (res.data || []).filter((u) => u.active === true);
                                  setAssignUsers(list);
                                  const usersByDept = {};
                                  list.forEach((u) => {
                                    if (Array.isArray(u.departments)) {
                                      u.departments.forEach((d) => {
                                        if (allowedAssignDepartments.has(d.name)) {
                                          if (!usersByDept[d.name]) usersByDept[d.name] = [];
                                          usersByDept[d.name].push(u);
                                        }
                                      });
                                    }
                                  });
                                  setAssignUsersByDept(usersByDept);
                                })
                                .catch((error) => {
                                  console.error("Error fetching users:", error);
                                });
                            }
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#assignUserModal"
                        >
                          <i class="fa-solid fa-user-edit me-1"></i>
                          Reassign
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setBuffCase(null);
                            setAssignmentAction('unassign');
                            setSelectedAssignUsers({});
                            // Load users if not already loaded
                            if (assignUsers.length === 0) {
                              axios
                                .get(`${_global.BASE_URL}users`)
                                .then((res) => {
                                  const list = (res.data || []).filter((u) => u.active === true);
                                  setAssignUsers(list);
                                  const usersByDept = {};
                                  list.forEach((u) => {
                                    if (Array.isArray(u.departments)) {
                                      u.departments.forEach((d) => {
                                        if (allowedAssignDepartments.has(d.name)) {
                                          if (!usersByDept[d.name]) usersByDept[d.name] = [];
                                          usersByDept[d.name].push(u);
                                        }
                                      });
                                    }
                                  });
                                  setAssignUsersByDept(usersByDept);
                                })
                                .catch((error) => {
                                  console.error("Error fetching users:", error);
                                });
                            }
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#assignUserModal"
                        >
                          <i class="fa-solid fa-user-minus me-1"></i>
                          Unassign
                        </button> */}
                    </div>
                  )}
                  {/* <div className="col-lg-2">
                    <button
                      className="btn btn-sm btn-primary w-100 p-2"
                      onClick={() => handlePrintUrgentCases()}
                    >
                      {" "}
                      <i class="fas fa-print"></i> print
                    </button>
                  </div> */}
                </div>

              </div>
              {studyCases.length > 0 && (
                <table className="table table-responsive text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      {user.roles[0] === _global.allRoles.admin && <th scope="col">Select</th>}
                      <th scope="col">#Case</th>
                      <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>
                        Doctor Name {renderSortIcon("doctorName")}
                      </th>
                      <th scope="col">Patient Name</th>
                      <th scope="col" onClick={() => handleSort("technicianName")} style={{ cursor: "pointer" }}>
                        Technician {renderSortIcon("technicianName")}
                      </th>
                      {/* <th scope="col">Assigned To</th> */}
                      <th scope="col">#Unites</th>
                      {/* <th scope="col">Type</th> */}
                      <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>
                        In {renderSortIcon("dateIn")}
                      </th>
                      <th scope="col">Due</th>
                      <th scope="col" className="td-phone">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {studyCases.map((item, index) => (
                      <tr key={item._id}>
                        {user.roles[0] === _global.allRoles.admin && <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={
                              item.isAssignedCadCam ||
                              selectedCases.includes(item._id)
                            }
                            disabled={item.isAssignedCadCam}
                            onChange={(e) =>
                              handleCaseSelection(item._id, e.target.checked)
                            }
                            title={
                              isAssignedToCadCam(item)
                                ? "Case is assigned to CadCam - cannot be selected"
                                : "Select case for assignment"
                            }
                          />
                        </td>}
                        <td>{item.caseNumber}</td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        <td>
                          {item.assignmentHistory &&
                            item.assignmentHistory.length > 0 &&
                            item.assignmentHistory[
                              item.assignmentHistory.length - 1
                            ].newAssignment &&
                            item.assignmentHistory[
                              item.assignmentHistory.length - 1
                            ].newAssignment.length > 0
                            ? item.assignmentHistory[
                              item.assignmentHistory.length - 1
                            ].newAssignment[
                              item.assignmentHistory[
                                item.assignmentHistory.length - 1
                              ].newAssignment.length - 1
                            ].userName
                            : "-"}
                        </td>
                        {/* <td>
                          <div className="text-start small">
                            {(() => {
                              const assignments = getCadCamAndCeramicAssignments(item);
                              return (
                                <>
                                  {assignments.cadCam && (
                                    <div><strong>CadCam:</strong> {assignments.cadCam}</div>
                                  )}
                                  {assignments.ceramic && (
                                    <div><strong>Ceramic:</strong> {assignments.ceramic}</div>
                                  )}
                                  {!assignments.cadCam && !assignments.ceramic && "-"}
                                </>
                              );
                            })()}
                          </div>
                        </td> */}
                        <td
                          className={`${item.teethNumbers.length <= 0
                            ? "bg-danger"
                            : "bg-white"
                            } `}
                        >
                          {item.teethNumbers.length}
                        </td>
                        {/* <td>{item.caseType}</td> */}
                        <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                        <td>
                          {item.dateOut &&
                            _global.formatDateToYYYYMMDD(item.dateOut)}
                        </td>
                        <td className="td-phone">
                          <div className="actions-btns">


                            {item.isAssignedCadCam && user.roles[0] === _global.allRoles.admin && (
                              <>
                                <span
                                  className="c-warning"
                                  onClick={() =>
                                    openAssignModal(item, "reassign")
                                  }
                                  data-bs-toggle="modal"
                                  data-bs-target="#assignUserModal"
                                  title="Reassign User"
                                >
                                  <i class="fa-solid fa-user-edit"></i>
                                </span>
                                <span
                                  className="c-danger"
                                  onClick={() =>
                                    openAssignModal(item, "unassign")
                                  }
                                  data-bs-toggle="modal"
                                  data-bs-target="#assignUserModal"
                                  title="Unassign User"
                                >
                                  <i class="fa-solid fa-user-minus"></i>
                                </span>
                              </>
                            )}


                            <span
                              className="c-success"
                              // onClick={() => viewCaseHandle(item, "view")}
                              onClick={() => {
                                buffCaseHandle(item);
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#viewModal"
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCaseHandle(item, "process")}
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
                            <span
                              className={item.isTopPriority ? "c-danger" : "c-warning"}
                              onClick={() => togglePriority(item)}
                              title="Top Priority"
                            >
                              {item.isTopPriority ? <i className="fa-solid fa-star"></i> : <i className="fa-regular fa-star"></i>}
                            </span>
                            <span
                              className=" c-primary  "
                              onClick={() => {
                                setBuffCase(item);
                                // setScheduleDate(new Date(item.dateOut || new Date())); // Optional: prefill
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#scheduleModal"
                              title="Schedule"
                            >
                              <i className="fa-regular fa-calendar"></i>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {user.roles[0] === _global.allRoles.admin && (
                      <>
                        <tr>
                          <td className="f-bold c-success" colSpan={5}>
                            <b>Total of Pieces</b>
                          </td>
                          <td
                            className="bg-success p-2 text-dark bg-opacity-50"
                            colSpan={2}
                          >
                            <b>{sumOfTeethNumbersLength("study")}</b>
                          </td>
                        </tr>
                        {/* {user.roles[0] === _global.allRoles.admin && (
                          <tr>
                            <td className="f-bold c-success" colSpan={5}>
                              <b>Total Without Study</b>
                            </td>
                            <td
                              className="bg-success p-2 text-dark bg-opacity-50"
                              colSpan={2}
                            >
                              <b>
                                {sumOfTeethNumbersLength("Start") -
                                  getStudyCases(
                                    groupCasesTeethNumbersByName("Start")
                                  )}
                              </b>
                            </td>
                          </tr>
                        )} */}
                        <tr>
                          <td colSpan={7}>
                            <div className="summary-teeth-cases">
                              {groupCasesTeethNumbersByName("study")?.map(
                                (item) => (
                                  <p className="mb-0">
                                    <span>{item.name}:</span>
                                    <b className="badge text-bg-success">
                                      {item.count}
                                    </b>
                                  </p>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              )}
              {studyCases?.length <= 0 && (
                <div className="no-content">No Cases Study yet!</div>
              )}
            </div>
            {/* Packing Cases */}
            <div
              // class="tab-pane fade"
              className={`tab-pane fade ${activeTab === 8 ? "show active" : ""
                }`}
              id="packing-tab-pane"
              role="tabpanel"
              aria-labelledby="packing-tab"
              tabIndex="8"
            >
              <div className="row">
                <div class="col-lg-12">
                  <div className="form-group">
                    <input
                      type="text"
                      name="searchText"
                      className="form-control"
                      placeholder="Search by name | case number | case type "
                      value={searchText}
                      onChange={(e) => searchByName(e.target.value, "packing")}
                    />
                  </div>
                </div>
                {/* <div className="col-lg-2">
                    <button
                      className="btn btn-sm btn-primary w-100 p-2"
                      onClick={() => handlePrintUrgentCases()}
                    >
                      {" "}
                      <i class="fas fa-print"></i> print
                    </button>
                  </div> */}
              </div>
              {packingCases.length > 0 && (
                <table className="table table-responsive text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>
                        Doctor Name {renderSortIcon("doctorName")}
                      </th>
                      <th scope="col">Patient Name</th>
                      <th scope="col">#Unites</th>
                      {/* <th scope="col">Type</th> */}
                      <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>
                        In {renderSortIcon("dateIn")}
                      </th>
                      {/* <th scope="col">Due</th> */}
                      <th scope="col" className="td-phone">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {packingCases.map((item, index) => (
                      <tr key={item._id}>
                        <td>{item.caseNumber}</td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        <td
                          className={`${item.teethNumbers.length <= 0
                            ? "bg-danger"
                            : "bg-white"
                            } `}
                        >
                          {item.teethNumbers.length}
                        </td>
                        {/* <td>{item.caseType}</td> */}
                        <td>
                          {_global.formatDateToYYYYMMDD(
                            item.receptionPacking?.actions?.[
                              item.receptionPacking?.actions?.length - 1
                            ]?.dateEnd
                          )}
                        </td>
                        {/* <td>
                          {item.dateOut &&
                            _global.formatDateToYYYYMMDD(item.dateOut)}
                        </td> */}
                        <td className="td-phone">
                          <div className="actions-btns">
                            <span
                              className="c-success"
                              // onClick={() => viewCaseHandle(item, "view")}
                              onClick={() => {
                                buffCaseHandle(item);
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#viewModal"
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCaseHandle(item, "process")}
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {user.roles[0] === _global.allRoles.admin && (
                      <>
                        <tr>
                          <td className="f-bold c-success" colSpan={5}>
                            <b>Total of Pieces</b>
                          </td>
                          <td
                            className="bg-success p-2 text-dark bg-opacity-50"
                            colSpan={2}
                          >
                            <b>{sumOfTeethNumbersLength("packing")}</b>
                          </td>
                        </tr>
                        {/* {user.roles[0] === _global.allRoles.admin && (
                          <tr>
                            <td className="f-bold c-success" colSpan={5}>
                              <b>Total Without Study</b>
                            </td>
                            <td
                              className="bg-success p-2 text-dark bg-opacity-50"
                              colSpan={2}
                            >
                              <b>
                                {sumOfTeethNumbersLength("Start") -
                                  getStudyCases(
                                    groupCasesTeethNumbersByName("Start")
                                  )}
                              </b>
                            </td>
                          </tr>
                        )} */}
                        <tr>
                          <td colSpan={7}>
                            <div className="summary-teeth-cases">
                              {groupCasesTeethNumbersByName("packing")?.map(
                                (item) => (
                                  <p className="mb-0">
                                    <span>{item.name}:</span>
                                    <b className="badge text-bg-success">
                                      {item.count}
                                    </b>
                                  </p>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              )}
              {packingCases?.length <= 0 && (
                <div className="no-content">No Cases in Packing yet!</div>
              )}
            </div>
            {/* For Work  */}
            <div
              // class="tab-pane fade "
              className={`tab-pane fade ${activeTab === 9 ? "show active" : ""
                }`}
              id="work-tab-pane"
              role="tabpanel"
              aria-labelledby="work-tab"
              tabIndex="1"
            >
              {/* <div className="form-group">
                <input
                  type="text"
                  name="searchText"
                  className="form-control"
                  placeholder="Search by name | case number | case type "
                  value={searchText}
                  onChange={(e) => searchByName(e.target.value, "forWork")}
                />
              </div> */}
              {forWorkCases.length > 0 && (
                <table className="table table-responsive shipping-table  table-bordered">
                  <thead>
                    <tr className="table-secondary ">
                      <th scope="col">Clinic</th>
                      <th scope="col" className="text-center">
                        Doctor Cases
                      </th>
                      {/* <th scope="col">Cad Cam</th>
                        <th scope="col">Fitting</th>
                        <th scope="col">For Ceramic</th>
                        <th scope="col">Ceramic</th>
                        <th scope="col">Packing</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {forWorkCases.map((item) => (
                      <tr key={item.clinicName}>
                        <td className="clinic-name">{item.clinicName}</td>
                        <td>
                          <table className="table table-responsive working-table  table-bordered">
                            <thead>
                              <tr className="table-info">
                                <th scope="col">#</th>
                                <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>
                                  Dr.Name {renderSortIcon("doctorName")}
                                </th>
                                <th scope="col">Pt.Name</th>
                                <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>
                                  DateIn {renderSortIcon("dateIn")}
                                </th>
                                <th scope="col">DateOut</th>
                                <th scope="col">#Unites</th>
                              </tr>
                            </thead>
                            {item.dentists?.length > 0 ? (
                              item.dentists.map((dentistItem) => (
                                <tbody>
                                  {dentistItem.cases.length > 0 &&
                                    dentistItem.cases.map((caseItem, j) => (
                                      <tr>
                                        <td>
                                          <span>{caseItem.caseNumber}</span>
                                        </td>
                                        <td>
                                          <strong>
                                            <span>
                                              {" "}
                                              Dr.{" "}
                                              {extractName(
                                                caseItem?.dentistObj?.name
                                              )}
                                            </span>
                                          </strong>
                                        </td>
                                        <td>
                                          <span key={j}>
                                            {" "}
                                            Pt. {caseItem.patientName}
                                          </span>
                                        </td>
                                        <td>
                                          {_global.formatDateToYYYYMMDD(
                                            caseItem.dateIn
                                          )}
                                        </td>
                                        <td>
                                          {_global.formatDateToYYYYMMDD(
                                            caseItem.dateIn
                                          )}
                                        </td>
                                        <td
                                          className={`${caseItem?.teethNumbers?.length <= 0
                                            ? "bg-danger"
                                            : "bg-white"
                                            } `}
                                        >
                                          {caseItem.teethNumbers.length}
                                        </td>
                                      </tr>
                                      // </div>
                                    ))}
                                </tbody>
                              ))
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </table>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {forWorkCases.length <= 0 && (
                <div className="no-content">No Cases Not Start yet!</div>
              )}
            </div>
            {/* For shipments  */}
            <div
              // class="tab-pane fade "
              className={`tab-pane fade ${activeTab === 10 ? "show active" : ""
                }`}
              id="shipment-tab-pane"
              role="tabpanel"
              aria-labelledby="shipment-tab"
              tabIndex="1"
            >
              <div className="form-group  d-flex justify-content-end">
                {/* <input
                  type="text"
                  name="searchText"
                  className="form-control"
                  placeholder="Search by name | case number | case type "
                  value={searchText}
                  onChange={(e) => searchByName(e.target.value, "forWork")}
                /> */}
                <button
                  className="btn btn-sm btn-primary "
                  onClick={(e) => printSelectedItemsShippment()}
                >
                  Print
                </button>
              </div>
              <div ref={userRef2}>
                {forShipments.length > 0 && (
                  <table className="table table-responsive shipping-table  table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">Clinic</th>
                        <th scope="col">Not Start</th>
                        <th scope="col">Cad Cam</th>
                        <th scope="col">Fitting</th>
                        <th scope="col">For Ceramic</th>
                        <th scope="col">Ceramic</th>
                        <th scope="col">Packing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forShipments.map((item) => (
                        <tr key={item.clinicName}>
                          <td className="clinic-name">{item.clinicName}</td>
                          <td>
                            {item.allClinicCases?.NotStatCases?.length > 0 ? (
                              item.allClinicCases?.NotStatCases?.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment 
                                    ${caseItem.isUrgent ? "text-bg-danger" : ""
                                      } 
                                    ${caseItem.isStudy ? "bgc-study" : ""}`}
                                    key={caseItem._id}
                                    onClick={() => {
                                      buffCaseHandle(caseItem);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <strong className="d-flex justify-content-between">
                                      Dr.{" "}
                                      {extractName(caseItem.dentistObj.name)}
                                      <span>{caseItem.caseNumber}</span>
                                      {/* <span>{caseItem.caseNumber}</span> */}
                                    </strong>
                                    <span>
                                      {" "}
                                      Pt. {caseItem.patientName} (
                                      {caseItem.teethNumbers.length})
                                    </span>
                                    <span>
                                      <b className="c-primary font-bold">
                                        CrAt:{" "}
                                      </b>
                                      {_global.formatDateToYYYYMMDD(
                                        caseItem.dateReceivedInEmail
                                      )}
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          <td>
                            {item.allClinicCases?.cadCamCases?.length > 0 ? (
                              item.allClinicCases.cadCamCases.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment ${caseItem.isUrgent ? "text-bg-danger" : ""
                                      }`}
                                    key={caseItem._id}
                                    onClick={() => {
                                      buffCaseHandle(caseItem);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <strong className="d-flex justify-content-between">
                                      Dr.{" "}
                                      {extractName(caseItem.dentistObj.name)}
                                      <span>{caseItem.caseNumber}</span>
                                      {/* <span>{caseItem.caseNumber}</span> */}
                                    </strong>
                                    <span>
                                      {" "}
                                      Pt. {caseItem.patientName} (
                                      {caseItem.teethNumbers.length})
                                    </span>
                                    <span>
                                      <b className="c-primary font-bold">
                                        CrAt:{" "}
                                      </b>
                                      {_global.formatDateToYYYYMMDD(
                                        caseItem.dateReceivedInEmail
                                      )}
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          <td>
                            {item.allClinicCases?.fittingCases?.length > 0 ? (
                              item.allClinicCases.fittingCases.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment ${caseItem.isUrgent ? "text-bg-danger" : ""
                                      }`}
                                    key={caseItem._id}
                                    onClick={() => {
                                      buffCaseHandle(caseItem);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <strong className="d-flex justify-content-between">
                                      Dr.{" "}
                                      {extractName(caseItem.dentistObj.name)}
                                      <span>{caseItem.caseNumber}</span>
                                      {/* <span>{caseItem.caseNumber}</span> */}
                                    </strong>
                                    <span>
                                      {" "}
                                      Pt. {caseItem.patientName} (
                                      {caseItem.teethNumbers.length})
                                    </span>
                                    <span>
                                      <b className="c-primary font-bold">
                                        CrAt:{" "}
                                      </b>
                                      {_global.formatDateToYYYYMMDD(
                                        caseItem.dateReceivedInEmail
                                      )}
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          <td>
                            {item.allClinicCases?.forCeramicCases?.length >
                              0 ? (
                              item.allClinicCases.forCeramicCases.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment ${caseItem.isUrgent ? "text-bg-danger" : ""
                                      }`}
                                    key={caseItem._id}
                                    onClick={() => {
                                      buffCaseHandle(caseItem);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <strong className="d-flex justify-content-between">
                                      Dr.{" "}
                                      {extractName(caseItem.dentistObj.name)}
                                      <span>{caseItem.caseNumber}</span>
                                      {/* <span>{caseItem.caseNumber}</span> */}
                                    </strong>
                                    <span>
                                      {" "}
                                      Pt. {caseItem.patientName} (
                                      {caseItem.teethNumbers.length})
                                    </span>
                                    <span>
                                      <b className="c-primary font-bold">
                                        CrAt:{" "}
                                      </b>
                                      {_global.formatDateToYYYYMMDD(
                                        caseItem.dateReceivedInEmail
                                      )}
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          <td>
                            {item.allClinicCases?.ceramicCases?.length > 0 ? (
                              item.allClinicCases.ceramicCases.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment ${caseItem.isUrgent ? "text-bg-danger" : ""
                                      }`}
                                    key={caseItem._id}
                                    onClick={() => {
                                      buffCaseHandle(caseItem);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <strong className="d-flex justify-content-between">
                                      Dr.{" "}
                                      {extractName(caseItem.dentistObj.name)}
                                      <span>{caseItem.caseNumber}</span>
                                      {/* <span>{caseItem.caseNumber}</span> */}
                                    </strong>
                                    <span>
                                      {" "}
                                      Pt. {caseItem.patientName} (
                                      {caseItem.teethNumbers.length})
                                    </span>
                                    <span>
                                      <b className="c-primary font-bold">
                                        CrAt:{" "}
                                      </b>
                                      {_global.formatDateToYYYYMMDD(
                                        caseItem.dateReceivedInEmail
                                      )}
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          <td>
                            {item.dentists?.length > 0 ? (
                              item.dentists.map((dentistItem) => (
                                <div key={dentistItem.dentistId}>
                                  {dentistItem.cases.length > 0 &&
                                    dentistItem.cases.map((caseItem, j) => (
                                      <div
                                        className={`case-item-shipment position-relative ${caseItem.isUrgent
                                          ? "text-bg-danger"
                                          : "text-bg-success"
                                          }`}
                                        onClick={() => {
                                          buffCaseHandle(caseItem);
                                        }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#viewModal"
                                      >
                                        {caseItem?.isApprove && (
                                          <span class="badge badge-success">
                                            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill ">
                                              <i class="fas fa-check-circle fa-3x c-primary"></i>
                                            </span>
                                          </span>
                                        )}
                                        <strong className="d-flex justify-content-between">
                                          <span>
                                            {" "}
                                            Dr.{" "}
                                            {extractName(
                                              caseItem?.dentistObj?.name
                                            )}
                                          </span>
                                          <span>{caseItem.caseNumber}</span>
                                        </strong>
                                        <span key={j}>
                                          {" "}
                                          Pt. {caseItem.patientName} (
                                          {caseItem.teethNumbers.length})
                                        </span>
                                        <span>
                                          <b className="label-shipping">Pk: </b>
                                          {_global.formatDateToYYYYMMDD(
                                            caseItem.receptionPacking
                                              ?.actions?.[
                                              caseItem.receptionPacking?.actions
                                                ?.length - 1
                                            ]?.dateEnd
                                          )}
                                        </span>
                                        <span>
                                          <b className="label-shipping">
                                            CrAt:{" "}
                                          </b>
                                          {_global.formatDateToYYYYMMDD(
                                            caseItem.dateReceivedInEmail
                                          )}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              ))
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {forShipments.length <= 0 && (
                <div className="no-content">No Cases for Shipments yet!</div>
              )}
            </div>
            {/* In Redo */}
            <div
              // class="tab-pane fade"
              className={`tab-pane fade ${activeTab === 11 ? "show active" : ""
                }`}
              id="redo-tab-pane"
              role="tabpanel"
              aria-labelledby="redo-tab"
              tabIndex="11"
            >
              <div
                class="tab-pane fade show active"
                id="redo-tab-pane"
                role="tabpanel"
                aria-labelledby="redo-tab"
                tabIndex="11"
              >
                <div className="row">
                  {isTableView && (
                    <div className="col-lg-10">
                      <div className="form-group">
                        <input
                          type="text"
                          name="searchText"
                          className="form-control"
                          placeholder="Search by name | case number | case type "
                          value={searchText}
                          onChange={(e) => searchByName(e.target.value, "redo")}
                        />
                      </div>
                    </div>
                  )}
                  <div className="col-lg-2 ml-auto mb-2">
                    <div className="icons-view">
                      <span
                        onClick={() => {
                          setIsTableView(true);
                        }}
                      >
                        <i
                          className={`fas fa-table ${isTableView
                            ? "primary-text-color"
                            : "text-secondary"
                            }`}
                        ></i>
                      </span>
                      <span
                        onClick={() => {
                          setIsTableView(false);
                        }}
                      >
                        <i
                          className={`fas fa-list ${!isTableView
                            ? "primary-text-color"
                            : "text-secondary"
                            }`}
                        ></i>
                      </span>
                    </div>
                  </div>
                </div>
                {/* Table Redo View */}
                {isTableView && redoCases.length > 0 && (
                  <table className="table text-center table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">#Case</th>
                        <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>
                          Doctor Name {renderSortIcon("doctorName")}
                        </th>
                        <th scope="col">Patient Name</th>
                        {/* <th scope="col">Type</th> */}
                        <th className="td-phone" scope="col">
                          #Unites
                        </th>
                        <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>
                          In {renderSortIcon("dateIn")}
                        </th>
                        <th scope="col">Due</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redoCases.map((item, index) => (
                        <tr key={item._id}>
                          <td>{item.caseNumber}</td>
                          <td>{item.dentistObj.name}</td>
                          <td>{item.patientName}</td>
                          {/* <td>{item.caseType}</td> */}
                          <td
                            className={`${item.teethNumbers.length <= 0
                              ? "bg-danger"
                              : "bg-white"
                              } td-phone`}
                          >
                            {item.teethNumbers.length}
                          </td>
                          <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                          <td>
                            {item.dateOut &&
                              _global.formatDateToYYYYMMDD(item.dateOut)}
                          </td>
                          <td>
                            <div className="actions-btns">
                              <span
                                className="c-success"
                                // onClick={() => viewCaseHandle(item, "view")}
                                onClick={() => {
                                  buffCaseHandle(item);
                                }}
                                data-bs-toggle="modal"
                                data-bs-target="#viewModal"
                              >
                                <i class="fa-solid fa-eye"></i>
                              </span>
                              <span
                                className="c-success"
                                onClick={() => viewCaseHandle(item, "process")}
                              >
                                <i class="fa-brands fa-squarespace"></i>
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {user.roles[0] === _global.allRoles.admin && (
                        <>
                          <tr>
                            <td className="f-bold c-success" colSpan={5}>
                              <b>Total of Pieces</b>
                            </td>
                            <td
                              className="bg-success p-2 text-dark bg-opacity-50"
                              colSpan={2}
                            >
                              <b>{sumOfTeethNumbersLength("redo")}</b>
                            </td>
                          </tr>
                          {user.roles[0] === _global.allRoles.admin && (
                            <tr>
                              <td className="f-bold c-success" colSpan={5}>
                                <b>Total Without Study</b>
                              </td>
                              <td
                                className="bg-success p-2 text-dark bg-opacity-50"
                                colSpan={2}
                              >
                                <b>
                                  {sumOfTeethNumbersLength("redo") -
                                    getStudyCases(
                                      groupCasesTeethNumbersByName("redo")
                                    )}
                                </b>
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={7}>
                              <div className="summary-teeth-cases">
                                {groupCasesTeethNumbersByName("redo")?.map(
                                  (item) => (
                                    <p className="mb-0">
                                      <span>{item.name}:</span>
                                      <b className="badge text-bg-success">
                                        {item.count}
                                      </b>
                                    </p>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                )}
                {/* Clinics Table Redo View */}
                {!isTableView && redoCases.length > 0 && (
                  <table className="table table-responsive shipping-table  table-bordered">
                    <thead>
                      <tr className="table-secondary ">
                        <th scope="col">Clinic</th>
                        <th scope="col" className="text-center">
                          Doctor Cases
                        </th>
                        {/* <th scope="col">Cad Cam</th>
                        <th scope="col">Fitting</th>
                        <th scope="col">For Ceramic</th>
                        <th scope="col">Ceramic</th>
                        <th scope="col">Packing</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {redoCasesInClinics.map((item) => (
                        <tr key={item.clinicName}>
                          <td className="clinic-name">
                            {item.clinicName} ({extractAllCases(item)?.length}){" "}
                          </td>
                          <td>
                            <table className="table working-table table-responsive  table-bordered mb-0">
                              <thead>
                                <tr className="table-info">
                                  <th scope="col">#</th>
                                  <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>
                                    Dr.Name {renderSortIcon("doctorName")}
                                  </th>
                                  <th scope="col">Pt.Name</th>
                                  <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>
                                    DateIn {renderSortIcon("dateIn")}
                                  </th>
                                  <th scope="col">DateOut</th>
                                  <th scope="col">#Unites</th>
                                </tr>
                              </thead>

                              {item.dentists?.length > 0 ? (
                                item.dentists.map((dentistItem) => (
                                  <tbody>
                                    {dentistItem.cases.length > 0 &&
                                      dentistItem.cases.map((caseItem, j) => (
                                        <tr
                                          onClick={() => {
                                            buffCaseHandle(caseItem);
                                          }}
                                          data-bs-toggle="modal"
                                          data-bs-target="#viewModal"
                                        >
                                          <td>
                                            <span>{caseItem.caseNumber}</span>
                                          </td>
                                          <td>
                                            <strong>
                                              <span>
                                                {" "}
                                                Dr.{" "}
                                                {extractName(
                                                  caseItem?.dentistObj?.name
                                                )}
                                              </span>
                                            </strong>
                                          </td>
                                          <td>
                                            <span key={j}>
                                              {" "}
                                              Pt. {caseItem.patientName}
                                            </span>
                                          </td>
                                          <td>
                                            {_global.formatDateToYYYYMMDD(
                                              caseItem.dateIn
                                            )}
                                          </td>
                                          <td>
                                            {_global.formatDateToYYYYMMDD(
                                              caseItem.dateIn
                                            )}
                                          </td>
                                          <td
                                            className={`${caseItem?.teethNumbers?.length <=
                                              0
                                              ? "bg-danger"
                                              : "bg-white"
                                              } `}
                                          >
                                            {caseItem.teethNumbers.length}
                                          </td>
                                        </tr>
                                        // </div>
                                      ))}
                                  </tbody>
                                ))
                              ) : (
                                <span className="case-item-shipment w-fit">
                                  No cases
                                </span>
                              )}
                            </table>
                            <div>
                              {user.roles[0] === _global.allRoles.admin && (
                                <table className="table table-responsive  working-table  mb-1">
                                  <tbody>
                                    <tr>
                                      <td className="f-bold c-success w-75">
                                        <b>Total of Pieces</b>
                                      </td>
                                      <td
                                        className="bg-success p-2 text-dark bg-opacity-50 w-25"
                                      // colSpan={2}
                                      >
                                        <b>
                                          {extractAllCases(item).reduce(
                                            (total, caseItem) => {
                                              return (
                                                total +
                                                (caseItem.teethNumbers
                                                  ?.length || 0)
                                              );
                                            },
                                            0
                                          )}
                                        </b>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {redoCases.length <= 0 && (
                  <div className="no-content">No Cases Redo yet!</div>
                )}
              </div>
            </div>
            {/*  Clinics  */}
            <div
              // class="tab-pane fade "
              className={`tab-pane fade ${activeTab === 13 ? "show active" : ""
                }`}
              id="clinics-tab-pane"
              role="tabpanel"
              aria-labelledby="clinics-tab"
              tabIndex="1"
            >
              <div className="row">
                {/* <div className="form-group  d-flex justify-content-end"> */}
                <div className="col-lg-6">
                  <CountryDropdown
                    className="form-control mb-3"
                    value={countryFilter}
                    onChange={(val) => searchByCountry(val)}
                  />
                </div>
                <div className="col-lg-6">
                  <button
                    className="btn btn-sm w-100 pb-2 pt-2 btn-primary "
                    onClick={(e) => printSelectedItemsClinics()}
                  >
                    Print
                  </button>
                </div>
                {/* </div> */}
              </div>

              <div ref={userRef3}>
                {allCasesInClinics.length > 0 && (
                  <table className="table  table-responsive shipping-table  table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">Clinic</th>
                        <th scope="col">Not Start</th>
                        <th scope="col">Holding</th>
                        <th scope="col">Cad Cam</th>
                        <th scope="col">Fitting</th>
                        <th scope="col">For Ceramic</th>
                        <th scope="col">Ceramic</th>
                        <th scope="col">Packing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCasesInClinics.map((item) => (
                        <tr key={item.clinicName}>
                          <td className="clinic-name">{item.clinicName}</td>
                          <td>
                            {item.allClinicCases?.NotStatCases?.length > 0 ? (
                              item.allClinicCases?.NotStatCases?.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment 
                                    ${caseItem.isUrgent ? "text-bg-danger" : ""
                                      } 
                                    ${caseItem.isStudy ? "bgc-study" : ""}`}
                                    key={caseItem._id}
                                    onClick={() => {
                                      buffCaseHandle(caseItem);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <strong className="d-flex justify-content-between">
                                      Dr.{" "}
                                      {extractName(caseItem.dentistObj.name)}
                                      <span>{caseItem.caseNumber}</span>
                                      {/* <span>{caseItem.caseNumber}</span> */}
                                    </strong>
                                    <span>
                                      {" "}
                                      Pt. {caseItem.patientName} (
                                      {caseItem.teethNumbers.length})
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          <td>
                            {item.allClinicCases?.Holding?.length > 0 ? (
                              item.allClinicCases?.Holding?.map((caseItem) => (
                                <div
                                  className={`case-item-shipment 
                                   text-bg-danger`}
                                  key={caseItem._id}
                                  onClick={() => {
                                    buffCaseHandle(caseItem);
                                  }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#viewModal"
                                >
                                  <strong className="d-flex justify-content-between">
                                    Dr. {extractName(caseItem.dentistObj.name)}
                                    <span>{caseItem.caseNumber}</span>
                                    {/* <span>{caseItem.caseNumber}</span> */}
                                  </strong>
                                  <span>
                                    {" "}
                                    Pt. {caseItem.patientName} (
                                    {caseItem.teethNumbers.length})
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          <td>
                            {item.allClinicCases?.cadCamCases?.length > 0 ? (
                              item.allClinicCases.cadCamCases.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment ${caseItem.isUrgent ? "text-bg-danger" : ""
                                      }`}
                                    key={caseItem._id}
                                    onClick={() => {
                                      buffCaseHandle(caseItem);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <strong className="d-flex justify-content-between">
                                      Dr.{" "}
                                      {extractName(caseItem.dentistObj.name)}
                                      <span>{caseItem.caseNumber}</span>
                                      {/* <span>{caseItem.caseNumber}</span> */}
                                    </strong>
                                    <span>
                                      {" "}
                                      Pt. {caseItem.patientName} (
                                      {caseItem.teethNumbers.length})
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          <td>
                            {item.allClinicCases?.fittingCases?.length > 0 ? (
                              item.allClinicCases.fittingCases.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment ${caseItem.isUrgent ? "text-bg-danger" : ""
                                      }`}
                                    key={caseItem._id}
                                    onClick={() => {
                                      buffCaseHandle(caseItem);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <strong className="d-flex justify-content-between">
                                      Dr.{" "}
                                      {extractName(caseItem.dentistObj.name)}
                                      <span>{caseItem.caseNumber}</span>
                                      {/* <span>{caseItem.caseNumber}</span> */}
                                    </strong>
                                    <span>
                                      {" "}
                                      Pt. {caseItem.patientName} (
                                      {caseItem.teethNumbers.length})
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          <td>
                            {item.allClinicCases?.forCeramicCases?.length >
                              0 ? (
                              item.allClinicCases.forCeramicCases.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment ${caseItem.isUrgent ? "text-bg-danger" : ""
                                      }`}
                                    key={caseItem._id}
                                    onClick={() => {
                                      buffCaseHandle(caseItem);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <strong className="d-flex justify-content-between">
                                      Dr.{" "}
                                      {extractName(caseItem.dentistObj.name)}
                                      <span>{caseItem.caseNumber}</span>
                                      {/* <span>{caseItem.caseNumber}</span> */}
                                    </strong>
                                    <span>
                                      {" "}
                                      Pt. {caseItem.patientName} (
                                      {caseItem.teethNumbers.length})
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          <td>
                            {item.allClinicCases?.ceramicCases?.length > 0 ? (
                              item.allClinicCases.ceramicCases.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment ${caseItem.isUrgent ? "text-bg-danger" : ""
                                      }`}
                                    key={caseItem._id}
                                    onClick={() => {
                                      buffCaseHandle(caseItem);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <strong className="d-flex justify-content-between">
                                      Dr.{" "}
                                      {extractName(caseItem.dentistObj.name)}
                                      <span>{caseItem.caseNumber}</span>
                                      {/* <span>{caseItem.caseNumber}</span> */}
                                    </strong>
                                    <span>
                                      {" "}
                                      Pt. {caseItem.patientName} (
                                      {caseItem.teethNumbers.length})
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          <td>
                            {item.allClinicCases?.receptionPacking?.length >
                              0 ? (
                              item.allClinicCases.receptionPacking.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment ${caseItem.isUrgent
                                      ? "text-bg-danger"
                                      : "text-bg-success"
                                      }`}
                                    key={caseItem._id}
                                    onClick={() => {
                                      buffCaseHandle(caseItem);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewModal"
                                  >
                                    <strong className="d-flex justify-content-between">
                                      Dr.{" "}
                                      {extractName(caseItem.dentistObj.name)}
                                      <span>{caseItem.caseNumber}</span>
                                      {/* <span>{caseItem.caseNumber}</span> */}
                                    </strong>
                                    <span>
                                      {" "}
                                      Pt. {caseItem.patientName} (
                                      {caseItem.teethNumbers.length})
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td>
                          {/* <td>
                            {item.dentists?.length > 0 ? (
                              item.dentists.map((dentistItem) => (
                                <div key={dentistItem.dentistId}>
                                  {dentistItem.cases.length > 0 &&
                                    dentistItem.cases.map((caseItem, j) => (
                                      <div
                                        className={`case-item-shipment ${
                                          caseItem.isUrgent
                                            ? "text-bg-danger"
                                            : "text-bg-success"
                                        }`}
                                      >
                                        <strong className="d-flex justify-content-between">
                                          <span>
                                            {" "}
                                            Dr.{" "}
                                            {extractName(
                                              caseItem?.dentistObj?.name
                                            )}
                                          </span>
                                          <span>{caseItem.caseNumber}</span>
                                        </strong>
                                        <span key={j}>
                                          {" "}
                                          Pt. {caseItem.patientName} (
                                          {caseItem.teethNumbers.length})
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              ))
                            ) : (
                              <span className="case-item-shipment w-fit">
                                No cases
                              </span>
                            )}
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {allCasesInClinics.length <= 0 && (
                <div className="no-content">No Cases for Clinics yet!</div>
              )}
            </div>
            {/* Implants Cases */}
            <div
              className={`tab-pane fade ${activeTab === 14 ? "show active" : ""
                }`}
              id="implantCases-tab-pane"
              role="tabpanel"
              aria-labelledby="implants-tab"
              tabIndex="1">
              {allCasesImplants.length > 0 && (
                <table
                  className="table table-responsive text-center table-bordered"
                >
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>
                        Doctor Name {renderSortIcon("doctorName")}
                      </th>
                      <th scope="col">Patient Name</th>
                      <th scope="col">#Unites</th>
                      {/* <th scope="col">Type</th> */}
                      <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>
                        In {renderSortIcon("dateIn")}
                      </th>
                      <th scope="col">Due</th>
                      <th scope="col" className="td-phone">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCasesImplants.map((item, index) => (
                      <tr key={item._id}>
                        <td>{item.caseNumber}</td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        <td
                          className={`${item.teethNumbers.length <= 0
                            ? "bg-danger"
                            : "bg-white"
                            } `}
                        >
                          {item.teethNumbers.length}
                        </td>
                        {/* <td>{item.caseType}</td> */}
                        <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                        <td>
                          {item.dateOut &&
                            _global.formatDateToYYYYMMDD(item.dateOut)}
                        </td>
                        <td className="td-phone">
                          <div className="actions-btns">
                            <span
                              className="c-success"
                              // onClick={() => viewCaseHandle(item, "view")}
                              onClick={() => {
                                buffCaseHandle(item);
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#viewModal"
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCaseHandle(item, "process")}
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
                            {
                              // user.roles[0] === _global.allRoles.admin ||
                              (user.roles[0] === _global.allRoles.Reception ||
                                (user.roles[0] ===
                                  _global.allRoles.technician &&
                                  user.lastName === "Jamous")) && (
                                <span
                                  className="c-success "
                                  data-bs-toggle="modal"
                                  data-bs-target="#caseUrgentModal"
                                  onClick={() => {
                                    setIsUrgentCase(false);
                                    setBuffCase(item);
                                  }}
                                >
                                  <i class="far fa-calendar-times"></i>
                                </span>
                              )
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {allCasesImplants.length <= 0 && (
                <div className="no-content">No Cases Implants yet!</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal Hold Case */}
      <div
        class="modal fade"
        id="caseHoldModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div
              class={`modal-header  text-white ${isHoldCase ? "bg-danger" : "bg-success"
                }`}
            >
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Case Number # {buffCase?.caseNumber}
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div>
                <h6 className="mb-3">
                  Are you sure from{" "}
                  {isHoldCase ? <span>Hold</span> : <span> UnHold</span>} this
                  case?
                </h6>
                <input
                  className="form-control"
                  type="text"
                  name="holdText"
                  value={holdText}
                  placeholder="Write a reason"
                  onChange={(e) => setHoldText(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm bg-light" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                disabled={holdText === ""}
                className={
                  isHoldCase
                    ? "btn btn-sm btn-danger"
                    : "btn btn-sm btn-success"
                }
                data-bs-dismiss="modal"
                onClick={(e) => holdCase(buffCase)}
              >
                {isHoldCase ? "Hold" : "UnHold"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Urgent Case */}
      <div
        class="modal fade"
        id="caseUrgentModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel_3"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div
              class={`modal-header  text-white ${isUrgentCase ? "bg-danger" : "bg-success"
                }`}
            >
              <h1 class="modal-title fs-5" id="exampleModalLabel_3">
                Case Number # {buffCase?.caseNumber}
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div>
                <h6 className="mb-3 mt-2 text-center">
                  Are you sure this case is marked as{" "}
                  {isUrgentCase ? (
                    <span>Urgent</span>
                  ) : (
                    <span> Non-Urgent</span>
                  )}{" "}
                  ?
                </h6>
              </div>
              <div>
                {/* <h6 className="mt-4 mb-3">History:</h6> */}
                {buffCase?.historyUrgent?.map((item, index) => (
                  <p
                    key={index}
                    className={
                      item.isUrgent ? "bg-history-danger" : "bg-history-success"
                    }
                  >
                    {item.isUrgent ? (
                      <span className="c-danger">Urgent </span>
                    ) : (
                      <span className="c-success"> Non-Urgent </span>
                    )}
                    Case By {item.name} in{" "}
                    <span className={item.isUrgent ? "c-danger" : "c-success"}>
                      {_global.getFormateDate(item.date)}
                    </span>
                    {/* , Because {item.msg}{" "} */}
                  </p>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm bg-light" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                className={
                  isUrgentCase
                    ? "btn btn-sm btn-danger"
                    : "btn btn-sm btn-success"
                }
                data-bs-dismiss="modal"
                onClick={(e) => urgentCase(buffCase)}
              >
                {isUrgentCase ? "Urgent" : "Non-Urgent"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Hold History Case */}
      <div
        class="modal fade"
        id="caseHoldHistoryModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class={`modal-header  text-white bg-primary`}>
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Case History # {buffCase?.caseNumber}
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div>
                {buffCase?.historyHolding?.map((item, index) => (
                  <p
                    key={index}
                    className={
                      item.isHold ? "bg-history-danger" : "bg-history-success"
                    }
                  >
                    {item.isHold ? (
                      <span className="c-danger">Hold </span>
                    ) : (
                      <span className="c-success"> UnHold </span>
                    )}
                    {item.name} in
                    <span className={item.isHold ? "c-danger" : "c-success"}>
                      {_global.getFormateDate(item.date)}
                    </span>
                    , Because {item.msg}{" "}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Hold History Case */}
      <div
        class="modal fade"
        id="deleteCaseModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class={`modal-header  text-white bg-danger`}>
              <h4 class="modal-title fs-5" id="exampleModalLabel">
                Case Number # {buffCase?.caseNumber}
              </h4>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div className="mx-4 text-center">
                <p>Are you sure from delete this case?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-sm bg-danger text-light"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm bg-light"
                  data-bs-dismiss="modal"
                  onClick={(e) => deleteCase(buffCase._id)}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal View Case */}
      {allCases.length > 0 && (
        <div
          class="modal fade"
          id="viewModal"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          tabindex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class={`modal-header  text-white bg-primary`}>
                <h1 class="modal-title fs-5" id="exampleModalLabel">
                  Case Information # {buffCase?.caseNumber}
                </h1>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                {buffCase && <ViewCase caseModel={buffCase} />}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Assign User Modal */}
      <div
        class="modal fade"
        id="assignUserModal"
        tabindex="-1"
        aria-labelledby="assignUserModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <div>
                <h1 class="modal-title fs-5 fw-bold" id="assignUserModalLabel">
                  {selectedCases.length > 0
                    ? `${assignmentAction === "assign"
                      ? "Assign"
                      : assignmentAction === "reassign"
                        ? "Reassign"
                        : "Unassign"
                    } Users to ${selectedCases.length} Case(s)`
                    : `${assignmentAction === "assign"
                      ? "Assign"
                      : assignmentAction === "reassign"
                        ? "Reassign"
                        : "Unassign"
                    } User to Case #${buffCase?.caseNumber || ""}`}
                </h1>
                {/* {selectedCases.length > 0 && (
                  <div class="fs-6 opacity-75">
                    Bulk{" "}
                    {assignmentAction === "assign"
                      ? "Assignment"
                      : assignmentAction === "reassign"
                      ? "Reassignment"
                      : "Unassignment"}{" "}
                    Mode
                  </div>
                )} */}
                {selectedCases.length === 0 && buffCase && (
                  <div class="fs-6 opacity-75">
                    Current Status: {getAssignmentStatusText(buffCase)}
                  </div>
                )}
              </div>
              <button
                type="button"
                class="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              {/* Action Selector */}
              {/* {selectedCases.length === 0 && (
                <div className="card mb-4 border-info">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 text-info fw-bold">
                      <i class="fas fa-cogs me-2"></i>Assignment Action
                    </h6>
                  </div>
                  <div className="card-body py-3">
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="assignmentAction"
                        id="actionAssign"
                        value="assign"
                        checked={assignmentAction === "assign"}
                        onChange={(e) => setAssignmentAction(e.target.value)}
                      />
                      <label
                        className="btn btn-outline-success"
                        htmlFor="actionAssign"
                      >
                        <i class="fas fa-user-plus me-2"></i>Assign
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="assignmentAction"
                        id="actionReassign"
                        value="reassign"
                        checked={assignmentAction === "reassign"}
                        onChange={(e) => setAssignmentAction(e.target.value)}
                        disabled={!hasAssignments(buffCase)}
                      />
                      <label
                        className="btn btn-outline-warning"
                        htmlFor="actionReassign"
                      >
                        <i class="fas fa-user-edit me-2"></i>Reassign
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="assignmentAction"
                        id="actionUnassign"
                        value="unassign"
                        checked={assignmentAction === "unassign"}
                        onChange={(e) => setAssignmentAction(e.target.value)}
                        disabled={!hasAssignments(buffCase)}
                      />
                      <label
                        className="btn btn-outline-danger"
                        htmlFor="actionUnassign"
                      >
                        <i class="fas fa-user-minus me-2"></i>Unassign
                      </label>
                    </div>
                    {!hasAssignments(buffCase) && (
                      <div className="mt-2 text-muted small">
                        <i class="fas fa-info-circle me-1"></i>
                        Reassign and Unassign are only available for cases with
                        existing assignments
                      </div>
                    )}
                    {assignmentAction === "unassign" &&
                      hasAssignments(buffCase) && (
                        <div className="mt-3 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                          <h6 className="text-warning mb-2">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Will Unassign From:
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {Object.entries(
                              getCurrentAssignments(buffCase)
                            ).map(([deptName, userId]) => {
                              if (userId && userId !== "assigned") {
                                const user = assignUsers.find(
                                  (u) => u._id === userId
                                );
                                return (
                                  <span
                                    key={deptName}
                                    className="badge bg-warning text-dark"
                                  >
                                    {deptName}:{" "}
                                    {user
                                      ? `${user.firstName} ${user.lastName}`
                                      : "Unknown User"}
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )} */}

              {/* Case Information */}
              {buffCase && (
                <div className="card mb-4 border-primary">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 text-primary fw-bold">
                      <i class="fas fa-info-circle me-2"></i>Case Information
                    </h6>
                  </div>
                  <div className="card-body py-3">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong className="text-muted">Doctor:</strong>
                          <div className="fw-semibold text-dark">
                            {buffCase.dentistObj?.name || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong className="text-muted">Patient:</strong>
                          <div className="fw-semibold text-dark">
                            {buffCase.patientName || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CadCam and Ceramic Assignments */}
              {buffCase && (
                <div className="card mb-4 border-primary">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 text-primary fw-bold">
                      <i className="fas fa-users-cog me-2"></i>Current Department Assignments
                    </h6>
                  </div>
                  <div className="card-body py-3">
                    <div className="row">
                      {(() => {
                        const { cadCam, ceramic } = getCadCamAndCeramicAssignments(buffCase);
                        return (
                          <>
                            <div className="col-md-6">
                              <div className="mb-2">
                                <strong className="text-muted">CadCam:</strong>
                                <div className="fw-semibold text-dark">
                                  {cadCam && buffCase.isAssignedCadCam ? (
                                    <span className="badge bg-info text-dark">{cadCam}</span>
                                  ) : (
                                    <span className="text-muted fst-italic">Not Assigned</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-2">
                                <strong className="text-muted">Ceramic:</strong>
                                <div className="fw-semibold text-dark">
                                  {ceramic && buffCase.isAssignedCeramic ? (
                                    <span className="badge bg-info text-dark">{ceramic}</span>
                                  ) : (
                                    <span className="text-muted fst-italic">Not Assigned</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Section */}
              <div className="mb-3">
                <label className="form-label fw-bold">Search Users</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                />
              </div>

              {/* User Selection Section */}
              {Object.keys(filteredUsersByDept()).length <= 0 ? (
                <div className="text-center py-4">
                  <i
                    class="fas fa-users text-muted mb-2"
                    style={{ fontSize: "2rem" }}
                  ></i>
                  <p className="text-muted mb-0">
                    No users found matching your search
                  </p>
                </div>
              ) : (
                <div>
                  <label className="form-label fw-bold mb-3">
                    Select User by Department
                  </label>
                  {Object.entries(filteredUsersByDept()).map(
                    ([deptName, usersList]) => (
                      <div className="mb-3" key={deptName}>
                        <label className="form-label text-primary fw-semibold">
                          {deptName} Department ({usersList.length} users)
                        </label>
                        <select
                          className="form-select"
                          value={selectedAssignUsers[deptName] || ""}
                          onChange={(e) =>
                            setSelectedAssignUsers((prev) => ({
                              ...prev,
                              [deptName]: e.target.value,
                            }))
                          }
                        >
                          <option value="">
                            -- Select user from {deptName} --
                          </option>
                          {usersList.map((u) => (
                            <option value={u._id} key={u._id}>
                              {u.firstName} {u.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Selected Users Preview */}
              {Object.keys(selectedAssignUsers).some(
                (dept) => selectedAssignUsers[dept]
              ) && (
                  <div className="mt-3">
                    <div className="alert alert-success">
                      <div className="d-flex align-items-center mb-2">
                        <i class="fas fa-check-circle me-2"></i>
                        <strong>Selected Users:</strong>
                      </div>
                      <div>
                        {Object.entries(selectedAssignUsers).map(
                          ([deptName, userId]) => {
                            if (!userId) return null;
                            const allUsers = Object.values(
                              filteredUsersByDept()
                            ).flat();
                            const selectedUser = allUsers.find(
                              (u) => u._id === userId
                            );
                            return selectedUser ? (
                              <div key={deptName} className="mb-1">
                                <span className="badge bg-primary me-2">
                                  {deptName}
                                </span>
                                {selectedUser.firstName} {selectedUser.lastName}
                              </div>
                            ) : null;
                          }
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>

              {/* Dynamic action button based on current mode */}
              <button
                type="button"
                class={`btn ${assignmentAction === "assign"
                  ? "btn-success"
                  : assignmentAction === "reassign"
                    ? "btn-warning"
                    : "btn-danger"
                  }`}
                onClick={
                  selectedCases.length > 0
                    ? assignmentAction === "assign"
                      ? bulkAssignUsersToCases
                      : assignmentAction === "reassign"
                        ? bulkReassignUsersToCases
                        : bulkUnassignUsersFromCases
                    : handleAssignmentAction
                }
                disabled={(() => {
                  const assignDisabled =
                    assignmentAction === "assign" &&
                    Object.values(selectedAssignUsers).every((id) => !id);
                  const reassignDisabled =
                    assignmentAction === "reassign" &&
                    !Object.values(selectedAssignUsers).some((id) => id);
                  // For unassign, enable if users are selected (same as assign and reassign)
                  const unassignDisabled =
                    assignmentAction === "unassign" &&
                    Object.values(selectedAssignUsers).every((id) => !id);
                  const loadingDisabled = isAssignLoading;

                  const isDisabled =
                    assignDisabled ||
                    reassignDisabled ||
                    unassignDisabled ||
                    loadingDisabled;

                  return isDisabled;
                })()}
                data-bs-dismiss={isAssignLoading ? undefined : "modal"}
              >
                {isAssignLoading ? (
                  <>
                    <span
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {assignmentAction === "assign"
                      ? "Assigning..."
                      : assignmentAction === "reassign"
                        ? "Reassigning..."
                        : "Unassigning..."}
                  </>
                ) : selectedCases.length > 0 ? (
                  `${assignmentAction === "assign"
                    ? "Assign"
                    : assignmentAction === "reassign"
                      ? "Reassign"
                      : "Unassign"
                  } to All Cases`
                ) : assignmentAction === "assign" ? (
                  "Assign"
                ) : assignmentAction === "reassign" ? (
                  "Reassign"
                ) : (
                  "Unassign"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Process Case */}
      {/* {allCases.length > 0 &&
      <div
            class="modal fade"
            id="ProcessModal"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog modal-lg">
              <div class="modal-content">
                <div class={`modal-header  text-white bg-primary`}>
                  <h1 class="modal-title fs-5" id="exampleModalLabel">
                    Case Information # {buffCase?.caseNumber}
                  </h1>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                <CaseProcess caseModel={buffCase} />
                </div>
              </div>
            </div>
      </div>
       } */}
      {/* Print Cases */}
      <div ref={userRef1}>
        <div className="row mt-0 pt-0 row-gap-1 page-cases  " id="casesPrint">
          {selectedItems.map((item, index) => (
            <div key={index} className=" ">
              {/* <div className=" box card px-3 min-vh-50 "> */}
              {/* <div className="box card px-3 min-vh-50"> */}
              <div
                className={`box border border-black card px-3 min-vh-50 ${item.isUrgent ? "bgc-print-danger" : ""
                  }`}
              >
                {/* <div className="d-flex justify-content-center align-items-center mb-0 mt-2">
                  <h5 className="border p-2 border-success  rounded">
                    {item.caseNumber}
                  </h5>
              </div> */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="f-18">
                    <b>Country: </b>{" "}
                    <span> {getDoctorCountry(item.dentistObj.id)}</span>
                  </div>
                  <h5 className="border p-2 border-success  rounded f-20">
                    {item.caseNumber}
                  </h5>
                  {/* <div> */}
                  <img src="../images/arak-2.png" className=" w-25" />
                  {/* </div> */}
                </div>
                <div className="mb-2">
                  <h2 className="c-success">Doctor Name: </h2>
                  <h3 className="border border-danger rounded border-customized p-1">
                    {" "}
                    {item.dentistObj.name}
                  </h3>
                </div>
                <div className="mb-4">
                  <div className=" d-flex justify-content-between align-items-center ">
                    <h2 className="c-success">Patient Name: </h2>
                    <div class="form-check  text-right">
                      <input
                        class="form-check-input check-input-print"
                        type="checkbox"
                        value=""
                        id="have-photo"
                      />
                      <label class="form-check-label f-18" for="have-photo">
                        Dark Die
                      </label>
                    </div>
                  </div>
                  <h3 className="border border-danger rounded border-customized">
                    {" "}
                    {item.patientName}
                  </h3>
                </div>
                <div className=" d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <b className="f-18">Shade: </b>{" "}
                    <span className="border border-danger rounded border-customized p-1">
                      {" "}
                      {item.shadeCase.shade !== ""
                        ? item.shadeCase.shade
                        : "None"}
                    </span>
                  </div>
                  <div className="mb-1">
                    <div>
                      <b className="f-18">#Unites: </b>{" "}
                      <span className="border border-danger rounded  border-customized">
                        {" "}
                        {item.teethNumbers.length > 0
                          ? item.teethNumbers.length
                          : "0"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* <div className="d-flex justify-content-between align-items-center mb-2">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value=""
                      id="have-photo"
                    />
                    <label class="form-check-label c-success" for="have-photo">
                      Have Photo
                    </label>
                  </div>
                  {item.caseType === "Digital" &&
                   <div>
                    <b>Received Date:</b>{" "}
                    <span>
                      {" "}
                      {item.dateIn
                        ? _global.formatDateToYYYYMMDD(item.dateReceivedInEmail)
                        : "-"}
                    </span>
                  </div>
                  }
                </div> */}
                <div className="d-flex justify-content-between align-items-center mb-4 f-18">
                  <div>
                    <b>Date In: </b>{" "}
                    <span>{_global.formatDateToYYYYMMDD(item.dateIn)}</span>
                  </div>
                  <div>
                    <b>Due Date: </b>{" "}
                    <span
                      className={`${item.isUrgent ? "border border-danger rounded p-1" : ""
                        }`}
                    >
                      {" "}
                      <span>
                        {item.dateOut
                          ? _global.formatDateToYYYYMMDD(item.dateOut)
                          : "Unknown"}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="mb-3 f-18">
                  <b>Cad Cam: </b>{" "}
                  <span>
                    {" "}
                    _______ <span>Date</span>______
                  </span>
                </div>
                <div className="mb-3 f-18">
                  <b>Fitting: </b>{" "}
                  <span>
                    {" "}
                    _______ <span>Date</span>_______
                  </span>
                </div>
                <div className="mb-3 f-18">
                  <b>Ceramic: </b>{" "}
                  <span>
                    {" "}
                    _______ <span>Date</span>_______
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2 f-18">
                  <div class="form-check">
                    <input
                      class="form-check-input check-input-print"
                      type="checkbox"
                      value=""
                      id="email"
                    />
                    <label class="form-check-label" for="email">
                      Email
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input check-input-print"
                      type="checkbox"
                      value=""
                      id="whatsapp"
                    />
                    <label class="form-check-label" for="whatsapp">
                      Whatsapp
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input check-input-print"
                      type="checkbox"
                      value=""
                      id="telgram"
                    />
                    <label class="form-check-label" for="telgram">
                      Telgram
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input check-input-print"
                      type="checkbox"
                      value=""
                      id="itero"
                    />
                    <label class="form-check-label" for="itero">
                      Other
                    </label>
                  </div>
                </div>
                <div className="mb-3 p-2 h-100 border border rounded border-warning-subtle f-18">
                  <b>Notes/ Details: </b>
                  <small className="">{item.jobDescription}</small>

                  <br />
                  <br />
                  <br />
                </div>
                <div className="d-flex justify-content-between gap-3 align-items-center mb-2 f-18">
                  <div class="form-check">
                    <input
                      class="form-check-input check-input-print"
                      type="checkbox"
                      value=""
                      id="zoho"
                    />
                    <label class="form-check-label " for="zoho">
                      Zoho
                    </label>
                  </div>
                  <div class="form-check ">
                    <input
                      class="form-check-input check-input-print"
                      type="checkbox"
                      value=""
                      id="alameen"
                    />
                    <label class="form-check-label" for="alameen">
                      Al Ameen
                    </label>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center f-18">
                  <div class="form-check">
                    <input
                      class="form-check-input check-input-print"
                      type="checkbox"
                      value=""
                      id="photo"
                    />
                    <label class="form-check-label" for="photo">
                      Photo
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input check-input-print"
                      type="checkbox"
                      value=""
                      id="Invoice"
                    />
                    <label class="form-check-label" for="Invoice">
                      Invoice
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input check-input-print"
                      type="checkbox"
                      value=""
                      id="Email"
                    />
                    <label class="form-check-label" for="Email">
                      Email
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Modal */}
      <div
        className="modal fade"
        id="scheduleModal"
        tabIndex="-1"
        aria-labelledby="scheduleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="scheduleModalLabel">Schedule </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-flex flex-column gap-3">
                {/* Cad Cam */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkCadCam"
                      checked={scheduleConfig.cadCam.selected}
                      onChange={(e) => setScheduleConfig(prev => ({ ...prev, cadCam: { ...prev.cadCam, selected: e.target.checked } }))}
                    />
                    <label className="form-check-label" htmlFor="checkCadCam">Cad Cam</label>
                  </div>
                  {scheduleConfig.cadCam.selected && (
                    <DatePicker
                      value={scheduleConfig.cadCam.date}
                      onChange={(date) => setScheduleConfig(prev => ({ ...prev, cadCam: { ...prev.cadCam, date } }))}
                      format="DD/MM/YYYY"
                      calendarPosition="bottom-center"
                      className="form-control"
                      containerStyle={{ width: "200px" }}
                      style={{ width: "100%", height: "35px" }}
                    />
                  )}
                </div>

                {/* Fitting */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkFitting"
                      checked={scheduleConfig.fitting.selected}
                      onChange={(e) => setScheduleConfig(prev => ({ ...prev, fitting: { ...prev.fitting, selected: e.target.checked } }))}
                    />
                    <label className="form-check-label" htmlFor="checkFitting">Fitting</label>
                  </div>
                  {scheduleConfig.fitting.selected && (
                    <DatePicker
                      value={scheduleConfig.fitting.date}
                      onChange={(date) => setScheduleConfig(prev => ({ ...prev, fitting: { ...prev.fitting, date } }))}
                      format="DD/MM/YYYY"
                      calendarPosition="bottom-center"
                      className="form-control"
                      containerStyle={{ width: "200px" }}
                      style={{ width: "100%", height: "35px" }}
                    />
                  )}
                </div>

                {/* Ceramic */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkCeramic"
                      checked={scheduleConfig.ceramic.selected}
                      onChange={(e) => setScheduleConfig(prev => ({ ...prev, ceramic: { ...prev.ceramic, selected: e.target.checked } }))}
                    />
                    <label className="form-check-label" htmlFor="checkCeramic">Ceramic</label>
                  </div>
                  {scheduleConfig.ceramic.selected && (
                    <DatePicker
                      value={scheduleConfig.ceramic.date}
                      onChange={(date) => setScheduleConfig(prev => ({ ...prev, ceramic: { ...prev.ceramic, date } }))}
                      format="DD/MM/YYYY"
                      calendarPosition="bottom-center"
                      className="form-control"
                      containerStyle={{ width: "200px" }}
                      style={{ width: "100%", height: "35px" }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                id="closeScheduleModalBtn"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleScheduleSave}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Cases;
