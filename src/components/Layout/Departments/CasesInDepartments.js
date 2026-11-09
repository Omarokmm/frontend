import axios from "axios";
import { useEffect, useRef, useState } from "react";
import * as _global from "../../../config/global";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { showToastMessage } from "../../../helper/toaster";
import ViewCase from "../Cases/ViewCase";

const CasesInDepartments = () => {
  const userRef2 = useRef();
  const userRef1 = useRef();
  const userRef = useRef();
  const userRef3 = useRef();
  const navigate = useNavigate();
  const { state } = useLocation();
  console.log(state);
  const user = JSON.parse(localStorage.getItem("user"));
  const departments = JSON.parse(localStorage.getItem("departments"));
  const [userData, setUserData] = useState(state ? state : user);
  const [FinishedCases, setFinishedCases] = useState([]);
  const [startCases, setStartCases] = useState([]);
  const [pauseCases, setPauseCases] = useState([]);
  const [department, setdepartment] = useState(state || (departments && departments[0]) || {});
  const [startDate, setStartDate] = useState(new Date());
  const [pauseDate, setPauseDate] = useState(new Date());
  const [startFinishDate, setStartFinishDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [buffCasesUser, setBuffCasesUser] = useState([]);
  const [buffCasesStartingUser, setBuffStartingCasesUser] = useState([]);
  const [buffCasesHoldingUser, setBuffCasesHoldingUser] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchTextStart, setSearchTextStart] = useState("");
  const [searchTextHold, setSearchTextHold] = useState("");
  const [buffCase, setBuffCase] = useState(null);
  const [selectedStartCases, setSelectedStartCases] = useState([]);
  const [docotrs, seDoctors] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [doctorToAssign, setDoctorToAssign] = useState(null);
  const [selectedReceptionUser, setSelectedReceptionUser] = useState("");

  // Receptionist filter toggle – persisted in localStorage
  const [filterByMe, setFilterByMe] = useState(
    () =>
      localStorage.getItem("cases_dept_filterByMe") === "true" ||
      localStorage.getItem("cases_filterByMe") === "true"
  );

  // Note Modal States
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteCase, setCurrentNoteCase] = useState(null);
  const [newNoteText, setNewNoteText] = useState("");

  const handleSelectStartCase = (caseId) => {
    if (selectedStartCases.includes(caseId)) {
      setSelectedStartCases(selectedStartCases.filter((id) => id !== caseId));
    } else {
      setSelectedStartCases([...selectedStartCases, caseId]);
    }
  };

  useEffect(() => {
    if (state?.shortDescription) {
      axios
        .get(
          `${_global.BASE_URL}departments/casesInDepartment/${state?.shortDescription}`
        )
        .then((res) => {
          const result = res.data;
          // setBuffCase(result.casesEnd[0])
          setStartCases(result.casesStart || []);
          setBuffStartingCasesUser(result.casesStart || []);
          setFinishedCases(result.casesEnd || []);
          setBuffCasesUser(result.casesEnd || []);
          if (department?.shortDescription === "cadCam" || state?.shortDescription === "cadCam") {
            setPauseCases(result.casesHolding || []);
            setBuffCasesHoldingUser(result.casesHolding || []);
          } else {
            setPauseCases(result.casesPause || []);
            setBuffCasesHoldingUser(result.casesPause || []);
          }
        })
        .catch((error) => {
          console.error("Error fetching departments:", error);
        });
    }

    axios
      .get(`${_global.BASE_URL}doctors`)
      .then((res) => {
        seDoctors(res.data || []);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
      });

    axios
      .get(`${_global.BASE_URL}users`)
      .then((res) => {
        setUsersList(res.data || []);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

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
      } else if (key === "assignedTo") {
        const idA = a.dentistObj?.id || a.dentistObj?._id || a.dentist?._id || (typeof a.dentist === "string" ? a.dentist : null);
        const idB = b.dentistObj?.id || b.dentistObj?._id || b.dentist?._id || (typeof b.dentist === "string" ? b.dentist : null);
        aValue = (getDoctorAssignedToName(idA) || "").toLowerCase();
        bValue = (getDoctorAssignedToName(idB) || "").toLowerCase();
      } else if (key === "dateIn") {
        aValue = new Date(a.dateIn).getTime();
        bValue = new Date(b.dateIn).getTime();
      } else if (key === "ceramic") {
        aValue = getCeramicName(a);
        bValue = getCeramicName(b);
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

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    setStartCases((prev) => sortData(prev, key, direction));
    setPauseCases((prev) => sortData(prev, key, direction));
    setFinishedCases((prev) => sortData(prev, key, direction));
  };

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <i className="fas fa-sort ms-1" style={{ opacity: 0.3 }}></i>;
    }
    return sortConfig.direction === "asc" ? (
      <i className="fas fa-sort-up ms-1 "></i>
    ) : (
      <i className="fas fa-sort-down ms-1 "></i>
    );
  };

  const getHoldingDate = (item) => {
    if (item) {
      let pauseDateStr = "";
      if (department.shortDescription === "cadCam") {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item?.historyHolding[item.historyHolding.length - 1]?.date
        );
      }
      if (
        department.shortDescription === "fitting" &&
        userData.lastName === "Jamous"
      ) {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item?.historyHolding[item.historyHolding.length - 1]?.date
        );
      }
      if (department.shortDescription === "ceramic") {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item.ceramic.actions[item.ceramic.actions.length - 1]?.datePause
        );
      }
      if (department.shortDescription === "fitting") {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item.fitting.actions[item.fitting.actions.length - 1]?.datePause
        );
      }
      if (department.shortDescription === "plaster") {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item.plaster.actions[item.plaster.actions.length - 1]?.datePause
        );
      }
      if (department.shortDescription === "receptionPacking") {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item.receptionPacking.actions[
            item.receptionPacking.actions.length - 1
          ]?.datePause
        );
      }
      if (department.shortDescription === "designing") {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item.designing.actions[item.designing.actions.length - 1]?.datePause
        );
      }
      if (department.shortDescription === "delivering") {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item.delivering.actions[item.delivering.actions.length - 1]?.datePause
        );
      }
      return pauseDateStr;
    } else {
      return "-";
    }
  };
  const getHoldingreason = (item) => {
    if (item) {
      let reason = "";
      if (department.shortDescription === "cadCam") {
        reason = item?.historyHolding[item.historyHolding.length - 1]?.msg;
      }
      if (
        department.shortDescription === "fitting" &&
        userData.lastName === "Jamous"
      ) {
        reason = item?.historyHolding[item.historyHolding.length - 1]?.msg;
      }
      if (department.shortDescription === "ceramic") {
        reason = item.ceramic.actions[item.ceramic.actions.length - 1]?.msg
          .replace(/.*\bbecause\b\s*/, "")
          .trim();
      }
      if (department.shortDescription === "fitting") {
        reason = item.fitting.actions[item.fitting.actions.length - 1]?.msg
          .replace(/.*\bbecause\b\s*/, "")
          .trim();
      }
      if (department.shortDescription === "plaster") {
        reason = item.plaster.actions[item.plaster.actions.length - 1]?.msg
          .replace(/.*\bbecause\b\s*/, "")
          .trim();
      }
      if (department.shortDescription === "receptionPacking") {
        reason = item.receptionPacking.actions[
          item.receptionPacking.actions.length - 1
        ]?.msg
          .replace(/.*\bbecause\b\s*/, "")
          .trim();
      }
      if (department.shortDescription === "designing") {
        reason = item.designing.actions[item.designing.actions.length - 1]?.msg
          .replace(/.*\bbecause\b\s*/, "")
          .trim();
      }
      if (department.shortDescription === "delivering") {
        reason = item.delivering.actions[
          item.delivering.actions.length - 1
        ]?.msg
          .replace(/.*\bbecause\b\s*/, "")
          .trim();
      }
      return reason;
    } else {
      return "-";
    }
  };

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

  const getCeramicName = (item) => {
    const assignments = getCadCamAndCeramicAssignments(item);
    return assignments?.ceramic && item?.isAssignedCeramic
      ? assignments.ceramic.toLowerCase()
      : "";
  };

  const getDoctorAssignedToName = (dentistId) => {
    if (!dentistId) return "";
    const doctor = docotrs.find((d) => d._id === dentistId);
    if (!doctor) return "";

    if (doctor.assignmentDetails?.isAssigned) {
      const assignedToUser = doctor.assignmentDetails.assignedToUser;
      const assignedUserId =
        typeof assignedToUser === "object" && assignedToUser !== null
          ? assignedToUser?._id || assignedToUser?.id
          : assignedToUser;
      if (assignedUserId) {
        const assignedUser = usersList.find((u) => u._id === assignedUserId);
        if (assignedUser) {
          return `${assignedUser.firstName || ""} ${assignedUser.lastName || ""}`.trim();
        }
      }
      if (doctor.assignmentDetails.assignedToUserName) {
        return doctor.assignmentDetails.assignedToUserName;
      }
    }

    if (Array.isArray(doctor.assignments)) {
      const receptionAssignment = doctor.assignments.find(
        (a) => a.department === "Reception"
      );
      if (receptionAssignment) {
        const uid = receptionAssignment.userId || receptionAssignment.user;
        if (uid) {
          const assignedUser = usersList.find((u) => u._id === uid);
          if (assignedUser) {
            return `${assignedUser.firstName || ""} ${assignedUser.lastName || ""}`.trim();
          }
        }
        if (receptionAssignment.userName) return receptionAssignment.userName;
      }
    }

    return "";
  };

  const getDoctorAssignmentInfo = (dentistId) => {
    const name = getDoctorAssignedToName(dentistId);
    if (!dentistId || !name) {
      return { name: "", assignedAt: "" };
    }
    const doctor = docotrs.find((d) => d._id === dentistId);
    const receptionAssignment = Array.isArray(doctor?.assignments)
      ? doctor.assignments.find((a) => a.department === "Reception")
      : null;
    const assignedAt =
      doctor?.assignmentDetails?.assignedAt ||
      receptionAssignment?.assignedAt ||
      "";
    return { name, assignedAt };
  };

  // Returns true if the doctor of this case is assigned to the currently logged-in user (by ID)
  const isDoctorAssignedToCurrentUser = (dentistId) => {
    if (!dentistId) return false;
    const myId = user?._id || user?.id; // cover both formats
    if (!myId) return false;

    const doctor = docotrs.find((d) => d._id === dentistId);
    if (!doctor) return false;

    // Path 1: via assignmentDetails (same as getDoctorAssignedToName)
    if (doctor.assignmentDetails?.isAssigned) {
      const assignedToUser = doctor.assignmentDetails.assignedToUser;
      const assignedUserId =
        typeof assignedToUser === "object" && assignedToUser !== null
          ? assignedToUser?._id || assignedToUser?.id
          : assignedToUser;

      // Try direct match
      if (assignedUserId && String(assignedUserId) === String(myId)) return true;

      // Try resolving through usersList
      if (assignedUserId) {
        const resolvedUser = usersList.find((u) => String(u._id) === String(assignedUserId));
        if (resolvedUser && String(resolvedUser._id) === String(myId)) return true;
      }
    }

    // Path 2: via doctor.assignments array (Reception department)
    if (Array.isArray(doctor.assignments)) {
      const receptionAssignment = doctor.assignments.find(
        (a) => a.department === "Reception"
      );
      if (receptionAssignment) {
        const uid = receptionAssignment.userId || receptionAssignment.user;
        if (uid && String(uid) === String(myId)) return true;
      }
    }

    return false;
  };

  // Apply "Filter by Me" – returns the list filtered by current user's assigned doctors
  const applyMyFilter = (list) => {
    if (!filterByMe || !Array.isArray(list)) return list || [];
    return list.filter((item) => {
      const dentistId =
        item?.dentistObj?.id ||
        item?.dentistObj?._id ||
        item?.dentist?._id ||
        (typeof item?.dentist === "string" ? item?.dentist : null);
      return isDoctorAssignedToCurrentUser(dentistId);
    });
  };

  const canAssignDoctorToReception =
    user?.roles?.[0] === _global.allRoles.admin ||
    user?.roles?.[0] === _global.allRoles.super_admin;

  const receptionUsers = usersList.filter(
    (u) => Array.isArray(u.roles) && u.roles.includes(_global.allRoles.Reception) && u.active
  );

  const openAssignDoctorModal = (item) => {
    const dentistId =
      item?.dentistObj?.id ||
      item?.dentistObj?._id ||
      item?.dentist?._id ||
      (typeof item?.dentist === "string" ? item?.dentist : null);
    const doctor = docotrs.find((d) => d._id === dentistId);
    setDoctorToAssign(
      doctor || {
        _id: dentistId,
        firstName: item?.dentistObj?.name || "",
        lastName: "",
      }
    );
    setSelectedReceptionUser("");
  };

  const handleAssignDoctorToReception = async () => {
    if (!doctorToAssign?._id || !selectedReceptionUser) {
      showToastMessage("Select a receptionist", "error");
      return;
    }
    const receptionist = usersList.find((u) => u._id === selectedReceptionUser);
    if (!receptionist) {
      showToastMessage("Receptionist not found", "error");
      return;
    }
    const assignment = {
      department: "Reception",
      userId: selectedReceptionUser,
      userName: `${receptionist.firstName} ${receptionist.lastName}`,
      assignedBy: `${user?.firstName || ""} ${user?.lastName || ""}`,
      assignedById: user?._id,
      assignedAt: new Date(),
      doctorIds: [doctorToAssign._id],
      action: "assign",
    };
    try {
      await fetch(`${_global.BASE_URL}doctors/assign-doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment),
      });
      seDoctors((prev) =>
        prev.map((d) =>
          d._id === doctorToAssign._id
            ? {
              ...d,
              assignmentDetails: {
                ...d.assignmentDetails,
                isAssigned: true,
                assignedToUser: selectedReceptionUser,
                assignedToUserName: assignment.userName,
                assignedBy: assignment.assignedBy,
                assignedById: user?._id,
                assignedAt: assignment.assignedAt,
              },
            }
            : d
        )
      );
      showToastMessage("Assigned successfully", "success");
      setDoctorToAssign(null);
      setSelectedReceptionUser("");
    } catch (error) {
      console.error("Assignment error", error);
      showToastMessage("Error assigning doctor", "error");
    }
  };

  const renderAssignedCell = (item) => {
    const dentistId =
      item?.dentistObj?.id ||
      item?.dentistObj?._id ||
      item?.dentist?._id ||
      (typeof item?.dentist === "string" ? item?.dentist : null);
    const doctor = docotrs.find((d) => d._id === dentistId);
    const isAssigned =
      !!doctor?.assignmentDetails?.isAssigned ||
      (Array.isArray(doctor?.assignments) &&
        doctor.assignments.some((a) => a.department === "Reception"));
    const { name } = getDoctorAssignmentInfo(dentistId);
    if (!isAssigned || !name) {
      if (!canAssignDoctorToReception || !dentistId) {
        return (
          <td
            className="text-center"
            onClick={() => {
              buffCaseHandle(item);
            }}
            data-bs-toggle="modal"
            data-bs-target="#viewModal"
          >
            -
          </td>
        );
      }
      return (
        <td className="text-center" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            data-bs-toggle="modal"
            data-bs-target="#assignDoctorReceptionModal"
            onClick={() => openAssignDoctorModal(item)}
            title="Assign doctor to receptionist"
          >
            <i className="fa-solid fa-user-plus me-1"></i>
          </button>
        </td>
      );
    }

    return (
      <td
        className="text-start"
        onClick={() => {
          buffCaseHandle(item);
        }}
        data-bs-toggle="modal"
        data-bs-target="#viewModal"
      >
        <div className="d-flex align-items-center justify-content-between">
          <span className="badge bg-light text-dark border me-1">
            <i className="fa-solid fa-user-check text-success me-1"></i>
            {name}
          </span>
          {canAssignDoctorToReception && (
            <button
              type="button"
              className="btn btn-xs btn-link p-0 text-muted"
              onClick={(e) => {
                e.stopPropagation();
                openAssignDoctorModal(item);
              }}
              title="Change assignment"
            >
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
          )}
        </div>
      </td>
    );
  };

  function groupTeethNumbersByName(teethNumbers) {
    const result = {};
    if (!teethNumbers || !Array.isArray(teethNumbers)) return [];
    teethNumbers.forEach((teethNumber) => {
      const { name } = teethNumber;
      if (!result[name]) {
        result[name] = 0;
      }
      result[name]++;
    });
    return Object.entries(result).map(([name, count]) => ({ name, count }));
  }

  function groupCasesTeethNumbersByName(type) {
    const result = {};
    const casesToUse =
      type === "End"
        ? applyMyFilter(FinishedCases)
        : type === "Start"
          ? applyMyFilter(startCases)
          : applyMyFilter(pauseCases);

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
  function sumOfTeethNumbersLength(type) {
    let totalLength = 0;
    const casesToUse =
      type === "Start"
        ? applyMyFilter(startCases)
        : type === "Pause"
          ? applyMyFilter(pauseCases)
          : applyMyFilter(FinishedCases);

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
  const viewCase = (item, type) => {
    if (type === "view") {
      navigate("/layout/view-case", { state: { ...item, type: "cases" } });
    } else if (type === "process") {
      navigate("/layout/process-case", { state: { ...item } });
    }
  };
  const getFinisheingDate = (item) => {
    if (item) {
      let endDateStr = "";
      if (department.shortDescription === "cadCam") {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.cadCam.actions.find((i) => i.dateEnd).dateEnd
        );
      }
      if (
        department.shortDescription === "fitting" &&
        userData.lastName === "Jamous"
      ) {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.cadCam.actions.find((i) => i.dateEnd)?.dateEnd
        );
      }
      if (department.shortDescription === "ceramic") {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.ceramic.actions.find((i) => i.dateEnd).dateEnd
        );
      }
      if (department.shortDescription === "fitting") {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.fitting.actions.find((i) => i.dateEnd)?.dateEnd
        );
      }
      if (department.shortDescription === "plaster") {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.plaster.actions.find((i) => i.dateEnd).dateEnd
        );
      }
      if (department.shortDescription === "receptionPacking") {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.receptionPacking.actions.find((i) => i.dateEnd).dateEnd
        );
      }
      if (department.shortDescription === "designing") {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.designing.actions.find((i) => i.dateEnd).dateEnd
        );
      }
      if (department.shortDescription === "delivering") {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.delivering.actions.find((i) => i.dateEnd).dateEnd
        );
      }
      return endDateStr;
    } else {
      return "-";
    }
  };
  const getStartingDate = (item) => {
    if (item) {
      let startDateStr = "";
      if (
        state.shortDescription === "cadCam" &&
        item.cadCam.actions.length > 1
      ) {
        const starts = item.cadCam.actions.filter(
          (item) => item.prfeix === "start"
        );
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = _global.formatDateToYYYYMMDD(lastStart?.dateStart);
      }
      if (
        state.shortDescription === "ceramic" &&
        item.ceramic.actions.length > 1
      ) {
        const starts = item.ceramic.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = _global.formatDateToYYYYMMDD(lastStart?.dateStart);
      }
      if (
        state.shortDescription === "fitting" &&
        item.fitting.actions.length > 1
      ) {
        const starts = item.fitting.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = _global.formatDateToYYYYMMDD(lastStart?.dateStart);
      }
      if (
        state.shortDescription === "plaster" &&
        item.plaster.actions.length > 1
      ) {
        const starts = item.plaster.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = _global.formatDateToYYYYMMDD(lastStart?.dateStart);
      }
      if (
        state.shortDescription === "receptionPacking" &&
        item.receptionPacking.actions.length > 1
      ) {
        const starts = item.receptionPacking.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = _global.formatDateToYYYYMMDD(lastStart?.dateStart);
      }
      if (
        state.shortDescription === "designing" &&
        item.designing.actions.length > 1
      ) {
        const starts = item.designing.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = _global.formatDateToYYYYMMDD(lastStart?.dateStart);
      }
      if (
        state.shortDescription === "delivering" &&
        item.delivering.actions.length > 1
      ) {
        const starts = item.delivering.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = _global.formatDateToYYYYMMDD(lastStart?.dateStart);
      }
      return startDateStr;
    } else {
      return "-";
    }
  };
  const getFullFinisheingDate = (item) => {
    if (item) {
      let endDateStr = "";
      if (department.shortDescription === "cadCam") {
        endDateStr = item.cadCam.actions.find((i) => i.dateEnd).dateEnd;
      }
      if (
        department.shortDescription === "fitting" &&
        userData.lastName === "Jamous"
      ) {
        endDateStr = item.cadCam.actions.find((i) => i.dateEnd)?.dateEnd;
      }
      if (department.shortDescription === "ceramic") {
        endDateStr = item.ceramic.actions.find((i) => i.dateEnd).dateEnd;
      }
      if (department.shortDescription === "fitting") {
        endDateStr = item.fitting.actions.find((i) => i.dateEnd)?.dateEnd;
      }
      if (department.shortDescription === "plaster") {
        endDateStr = item.plaster.actions.find((i) => i.dateEnd).dateEnd;
      }
      if (department.shortDescription === "receptionPacking") {
        endDateStr = item.receptionPacking.actions.find((i) => i.dateEnd).dateEnd;
      }
      if (department.shortDescription === "designing") {
        endDateStr = item.designing.actions.find((i) => i.dateEnd).dateEnd;
      }
      if (department.shortDescription === "delivering") {
        endDateStr = item.delivering.actions.find((i) => i.dateEnd).dateEnd;
      }
      return endDateStr;
    } else {
      return "-";
    }
  };
  const getFullStartingDate = (item) => {
    if (item) {
      let startDateStr = "";
      if (
        state.shortDescription === "cadCam" &&
        item.cadCam.actions.length > 1
      ) {
        const starts = item.cadCam.actions.filter(
          (item) => item.prfeix === "start"
        );
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = lastStart?.dateStart;
      }
      if (
        state.shortDescription === "ceramic" &&
        item.ceramic.actions.length > 1
      ) {
        const starts = item.ceramic.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = lastStart?.dateStart;
      }
      if (
        state.shortDescription === "fitting" &&
        item.fitting.actions.length > 1
      ) {
        const starts = item.fitting.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = lastStart?.dateStart;
      }
      if (
        state.shortDescription === "plaster" &&
        item.plaster.actions.length > 1
      ) {
        const starts = item.plaster.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = lastStart?.dateStart;
      }
      if (
        state.shortDescription === "receptionPacking" &&
        item.receptionPacking.actions.length > 1
      ) {
        const starts = item.receptionPacking.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = lastStart?.dateStart;
      }
      if (
        state.shortDescription === "designing" &&
        item.designing.actions.length > 1
      ) {
        const starts = item.designing.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = lastStart?.dateStart;
      }
      if (
        state.shortDescription === "delivering" &&
        item.delivering.actions.length > 1
      ) {
        const starts = item.delivering.actions.filter(
          (item) => item.prfeix === "start"
        );
        // console.log("starts",starts)
        // Get the last (most recent) start by comparing dateStart
        let lastStart = null;
        if (starts.length > 0) {
          lastStart = starts.reduce((latest, current) => {
            return new Date(current.dateStart) > new Date(latest.dateStart)
              ? current
              : latest;
          });
        }
        startDateStr = lastStart?.dateStart;
      }
      return startDateStr;
    } else {
      return "-";
    }
  };
  const handleCalculate = (startDate, endDate) => {
    // console.log("startDate",startDate,"endDate",endDate)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const diffMs = end - start;

      if (diffMs < 0) return "-";

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      return `${days}d ${hours}h ${minutes}m`;
    } else {
      return "-";
    }
  };
  const getStartingDate1 = (item) => {
    if (item) {
      let startDateStr = "";
      if (state.shortDescription === 'cadCam') {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.cadCam.actions[item.cadCam.actions.length - 1]?.dateStart
        );
      }
      if (state.shortDescription === 'ceramic') {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.ceramic.actions[item.ceramic.actions.length - 1]?.dateStart
        );
      }
      if (state.shortDescription === 'fitting') {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.fitting.actions[item.fitting.actions.length - 1]?.dateStart
        );
      }
      if (state.shortDescription === 'plaster') {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.plaster.actions[item.plaster.actions.length - 1]?.dateStart
        );
      }
      if (state.shortDescription === 'receptionPacking') {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.receptionPacking.actions[
            item.receptionPacking.actions.length - 1
          ]?.dateStart
        );
      }
      if (state.shortDescription === 'designing') {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.designing.actions[item.designing.actions.length - 1]?.dateStart
        );
      }
      if (state.shortDescription === 'delivering') {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.delivering.actions[item.delivering.actions.length - 1]?.dateStart
        );
      }
      return startDateStr;
    } else {
      return "-";
    }
  };
  const getTechnicainName = (item) => {
    if (item) {
      let technicainName = "";
      if (state.shortDescription === "cadCam") {
        technicainName =
          item.cadCam.actions[item.cadCam.actions.length - 1]?.technicianName;
      }
      if (state.shortDescription === "ceramic") {
        technicainName =
          item.ceramic.actions[item.ceramic.actions.length - 1]?.technicianName;
      }
      if (state.shortDescription === "fitting") {
        technicainName =
          item.fitting.actions[item.fitting.actions.length - 1]?.technicianName;
      }
      if (state.shortDescription === "plaster") {
        technicainName =
          item.plaster.actions[item.plaster.actions.length - 1]?.technicianName;
      }
      if (state.shortDescription === "receptionPacking") {
        technicainName =
          item.receptionPacking.actions[
            item.receptionPacking.actions.length - 1
          ]?.technicianName;
      }
      if (state.shortDescription === "designing") {
        technicainName =
          item.designing.actions[item.designing.actions.length - 1]
            ?.technicianName;
      }
      if (state.shortDescription === "delivering") {
        technicainName =
          item.delivering.actions[item.delivering.actions.length - 1]
            ?.technicianName;
      }
      return technicainName;
    } else {
      return "-";
    }
  };
  const searchByName = (searchText, type) => {
    const s = searchText.toLowerCase();
    const matchCase = (item) => {
      const dentistId =
        item.dentistObj?.id ||
        item.dentistObj?._id ||
        item.dentist?._id ||
        (typeof item.dentist === "string" ? item.dentist : null);
      const assignedName = getDoctorAssignedToName(dentistId);

      return (
        item.caseNumber?.toLowerCase().includes(s) ||
        item.dentistObj?.name?.toLowerCase().includes(s) ||
        item?.patientName?.toLowerCase().includes(s) ||
        assignedName?.toLowerCase().includes(s)
      );
    };

    if (type === "Start") {
      setSearchTextStart(searchText);
      if (searchText !== "") {
        const filteredCases = buffCasesStartingUser.filter(matchCase);
        setStartCases(filteredCases);
      } else {
        setStartCases(buffCasesStartingUser);
      }
    }
    if (type === "Pause") {
      setSearchTextHold(searchText);
      if (searchText !== "") {
        const filteredCases = buffCasesHoldingUser.filter(matchCase);
        setPauseCases(filteredCases);
      } else {
        setPauseCases(buffCasesHoldingUser);
      }
    }
    if (type === "End") {
      setSearchText(searchText);
      if (searchText !== "") {
        const filteredCases = buffCasesUser.filter(matchCase);
        setFinishedCases(filteredCases);
      } else {
        setFinishedCases(buffCasesUser);
      }
    }
  };
  const searchStartByDate = (e) => {
    const date = e.target.value;
    setStartDate(date);
    if (date != "") {
      console.log("date");
      if (department.name === "CadCam") {
        const filteredCases = buffCasesStartingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.cadCam.actions[item.cadCam.actions.length - 1]?.dateStart
            ) === date
          );
        });
        setStartCases(filteredCases);
      }
      if (department.name === "Caramic") {
        const filteredCases = buffCasesStartingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.ceramic.actions[item.ceramic.actions.length - 1]?.dateStart
            ) === date
          );
        });
        setStartCases(filteredCases);
      }
      if (department.name === "Fitting") {
        const filteredCases = buffCasesStartingUser.filter((item) => {
          if (item.fitting.actions.length > 0)
            return (
              _global.formatDateToYYYYMMDD(
                item.fitting.actions[item.fitting.actions.length - 1]?.dateStart
              ) === date
            );
        });

        setStartCases(filteredCases);
      }
      if (department.name === "Plaster") {
        const filteredCases = buffCasesStartingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.plaster.actions[item.plaster.actions.length - 1]?.dateStart
            ) === date
          );
        });

        setStartCases(filteredCases);
      }
      if (department.name === "Reception") {
        const filteredCases = buffCasesStartingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.receptionPacking.actions[
                item.receptionPacking.actions.length - 1
              ]?.dateStart
            ) === date
          );
        });

        setStartCases(filteredCases);
      }
      if (department.name === "Marketing") {
        const filteredCases = buffCasesStartingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.designing.actions[item.designing.actions.length - 1]
                ?.dateStart
            ) === date
          );
        });

        setStartCases(filteredCases);
      }
      if (department.name === "QC") {
        const filteredCases = buffCasesStartingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.qualityControl.actions[
                item.qualityControl.actions.length - 1
              ]?.dateStart
            ) === date
          );
        });

        setStartCases(filteredCases);
      }
      if (department.name === "Drivers") {
        const filteredCases = buffCasesStartingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.delivering.actions[item.delivering.actions.length - 1]
                ?.dateStart
            ) === date
          );
        });

        setStartCases(filteredCases);
      }
    } else {
      setStartCases(buffCasesStartingUser);
    }
  };
  const searchPauseByDate = (e) => {
    const date = e.target.value;
    setPauseDate(date);
    if (date != "") {
      console.log("date");
      if (department.name === "CadCam") {
        const filteredCases = buffCasesHoldingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.cadCam.actions[item.cadCam.actions.length - 1]?.dateStart
            ) === date
          );
        });
        setPauseCases(filteredCases);
      }
      if (department.name === "Caramic") {
        const filteredCases = buffCasesHoldingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.ceramic.actions[item.ceramic.actions.length - 1]?.dateStart
            ) === date
          );
        });
        setPauseCases(filteredCases);
      }
      if (department.name === "Fitting") {
        const filteredCases = buffCasesHoldingUser.filter((item) => {
          if (item.fitting.actions.length > 0)
            return (
              _global.formatDateToYYYYMMDD(
                item.fitting.actions[item.fitting.actions.length - 1]?.dateStart
              ) === date
            );
        });

        setPauseCases(filteredCases);
      }
      if (department.name === "Plaster") {
        const filteredCases = buffCasesHoldingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.plaster.actions[item.plaster.actions.length - 1]?.dateStart
            ) === date
          );
        });

        setPauseCases(filteredCases);
      }
      if (department.name === "Reception") {
        const filteredCases = buffCasesHoldingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.receptionPacking.actions[
                item.receptionPacking.actions.length - 1
              ]?.dateStart
            ) === date
          );
        });

        setPauseCases(filteredCases);
      }
      if (department.name === "Marketing") {
        const filteredCases = buffCasesHoldingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.designing.actions[item.designing.actions.length - 1]
                ?.dateStart
            ) === date
          );
        });

        setPauseCases(filteredCases);
      }
      if (department.name === "QC") {
        const filteredCases = buffCasesHoldingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.qualityControl.actions[
                item.qualityControl.actions.length - 1
              ]?.dateStart
            ) === date
          );
        });

        setPauseCases(filteredCases);
      }
      if (department.name === "Drivers") {
        const filteredCases = buffCasesHoldingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.delivering.actions[item.delivering.actions.length - 1]
                ?.dateStart
            ) === date
          );
        });

        setPauseCases(filteredCases);
      }
    } else {
      setPauseCases(buffCasesStartingUser);
    }
  };
  const searchByEndDate = (e) => {
    const date = e.target.value;
    const start = _global.formatDateToYYYYMMDD(startFinishDate);
    const end = _global.formatDateToYYYYMMDD(date);
    setEndDate(date);
    if (date != "") {
      const filteredCases = buffCasesUser.filter((item) => {
        let endDateStr = "";
        if (department.name === "CadCam") {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.cadCam.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (department.name === "Caramic") {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.ceramic.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (department.name === "Fitting") {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.fitting.actions.find((i) => i.dateEnd)?.dateEnd
          );
        }
        if (department.name === "Plaster") {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.plaster.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (department.name === "Reception") {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.receptionPacking.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (department.name === "Marketing") {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.designing.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (department.name === "QC") {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.qualityControl.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (department.name === "Drivers") {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.delivering.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        return endDateStr >= start && endDateStr <= end;
      });
      setFinishedCases(filteredCases);
    } else {
      setFinishedCases(buffCasesUser);
    }
  };
  const searchByDate = (e) => {
    const date = e.target.value;
    setStartFinishDate(date);
    if (date != "") {
      console.log("date");
      if (department.name === "CadCam") {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.cadCam.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });
        setFinishedCases(filteredCases);
      }
      if (department.name === "Caramic") {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.ceramic.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });
        setFinishedCases(filteredCases);
      }
      if (department.name === "Fitting") {
        const filteredCases = buffCasesUser.filter((item) => {
          if (item.fitting.actions.length > 0)
            return (
              _global.formatDateToYYYYMMDD(
                item.fitting.actions.find((i) => i.dateEnd).dateEnd
              ) === date
            );
        });

        setFinishedCases(filteredCases);
      }
      if (department.name === "Plaster") {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.plaster.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });

        setFinishedCases(filteredCases);
      }
      if (department.name === "Reception") {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.receptionPacking.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });

        setFinishedCases(filteredCases);
      }
      if (department.name === "Marketing") {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.designing.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });

        setFinishedCases(filteredCases);
      }
      if (department.name === "QC") {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.qualityControl.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });

        setFinishedCases(filteredCases);
      }
      if (department.name === "Drivers") {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.delivering.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });

        setFinishedCases(filteredCases);
      }
    } else {
      setFinishedCases(buffCasesUser);
    }
  };
  const handlePrint = useReactToPrint({
    content: () => userRef.current,
    documentTitle: ` ${department.name} (Finished Cases)`,
  });
  const handlePrint1 = useReactToPrint({
    content: () => userRef1.current,
    documentTitle: ` ${department.name} (Starting Cases)`,
  });
  const handlePrint2 = useReactToPrint({
    content: () => userRef2.current,
    documentTitle: `${department.name} (Holding Cases)`,
  });
  const handlePrintSelected = useReactToPrint({
    content: () => userRef3.current,
    documentTitle: `${department.name} (Selected Starting Cases)`,
  });
  function sortCasesByTechnacianName(cases, type) {
    const sortingCases = [...cases].sort((a, b) => {
      const nameA = getTechnicainName(a).toLowerCase(); // Convert names to lower case for case-insensitive comparison
      const nameB = getTechnicainName(b).toLowerCase(); // Convert names to lower case for case-insensitive comparison

      if (nameA < nameB) {
        return -1; // a should come before b
      }
      if (nameA > nameB) {
        return 1; // b should come before a
      }
      return 0; // names are equal
    });
    const deepClonedCases = JSON.parse(JSON.stringify(sortingCases));
    if (type === "Start") {
      setStartCases(deepClonedCases);
    }
    if (type === "Hold") {
      setPauseCases(deepClonedCases);
    }
    if (type === "End") {
      setFinishedCases(deepClonedCases);
    }
  }
  const buffCaseHandle = (item) => {
    const newItem = JSON.parse(JSON.stringify(item)); // Deep clone = new object ref
    setBuffCase(newItem);
  };
  return (
    <div className="content user-profile">
      <div className="card">
        <h5 className="card-title d-flex justify-content-between align-items-center">
          <span>
            {department?.name} Cases{" "}

          </span>
          {(user?.roles?.[0] === _global.allRoles.Reception ||
            (Array.isArray(user?.roles) && user.roles.includes(_global.allRoles.Reception)) ||
            user?.roles?.[0] === _global.allRoles.admin ||
            user?.roles?.[0] === _global.allRoles.super_admin) && (
              <button
                type="button"
                className={`btn btn-sm ms-3 ${filterByMe ? "btn-primary" : "btn-outline-primary"
                  }`}
                onClick={() =>
                  setFilterByMe((prev) => {
                    const next = !prev;
                    localStorage.setItem("cases_dept_filterByMe", next);
                    localStorage.setItem("cases_filterByMe", next);
                    return next;
                  })
                }
                title="Show only cases with doctors assigned to me"
              >
                <i className="fa-solid fa-user-check me-1"></i>
                {filterByMe ? "My Cases (On)" : "My Cases"}
              </button>
            )}
        </h5>
        <div className="card-body">
          {/* Tabs  */}
          <ul class="nav nav-tabs" id="myTab" role="tablist">
            <li class="nav-item" role="presentation">
              <button
                class="nav-link active bgc-primary"
                id="startCases-tab"
                data-bs-toggle="tab"
                data-bs-target="#startCases-tab-pane"
                type="button"
                role="tab"
                aria-controls="startCases-tab-pane"
                aria-selected="false"
                onClick={() => {
                  searchByName("", "Start");
                  setStartDate("");
                }}
              >
                Start <small>({applyMyFilter(startCases).length})</small>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
            // onClick={() => searchByName("", "Pause")}
            >
              <button
                class="nav-link  bgc-danger"
                id="holdCases-tab"
                data-bs-toggle="tab"
                data-bs-target="#holdCases-tab-pane"
                type="button"
                role="tab"
                aria-controls="holdCases-tab-pane"
                onClick={() => {
                  searchByName("", "Pause");
                  setPauseDate("");
                }}
                aria-selected="true"
              >
                Hold <small>({applyMyFilter(pauseCases).length})</small>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
            // onClick={() => searchByName("", "End")}
            >
              <button
                class="nav-link  bgc-success"
                id="endCases-tab"
                data-bs-toggle="tab"
                data-bs-target="#endCases-tab-pane"
                type="button"
                role="tab"
                aria-controls="endCases-tab-pane"
                onClick={() => {
                  searchByName("", "End");
                  setStartFinishDate("");
                  setEndDate("");
                }}
                aria-selected="true"
              >
                End <small>({applyMyFilter(FinishedCases)?.length})</small>
              </button>
            </li>
          </ul>
          {/* Tabs Contents */}
          {/* Starting Cases */}
          <div
            class="tab-content"
            id="myTabContent"
          // onClick={() => {
          //   setSearchText("");
          //   setSearchTextHold("");
          //   setSearchTextStart("");
          // }}
          >
            <div
              class="tab-pane fade show active"
              id="startCases-tab-pane"
              role="tabpanel"
              aria-labelledby="startCases-tab"
              tabIndex="0"
            >
              {/* Starting  */}
              <div>
                <div className="row">
                  <div className="col-lg-7 mb-3 ">
                    <input
                      type="text"
                      name="searchTextStart"
                      className="form-control"
                      placeholder="Search by name | case number | case type "
                      value={searchTextStart}
                      onChange={(e) => searchByName(e.target.value, "Start")}
                    />
                  </div>
                  {/* Start Date */}
                  <div className="col-lg-3 ">
                    <div className="form-group">
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Select Date"
                        value={startDate}
                        onChange={(e) => searchStartByDate(e)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-2 mb-3 print-btn">
                    <button
                      className="btn btn-sm btn-primary "
                      onClick={() => {
                        handlePrint1();
                      }}
                    >
                      {" "}
                      <i class="fas fa-print"></i> print
                    </button>
                    {/* {department.shortDescription === "receptionPacking" && ( */}
                    <button
                      className="btn btn-sm btn-success ms-2"
                      onClick={() => {
                        handlePrintSelected();
                      }}
                      disabled={selectedStartCases.length === 0}
                    >
                      <i className="fas fa-print"></i> Print Selected
                    </button>
                    {/* )} */}
                  </div>
                </div>
                {applyMyFilter(startCases)?.length > 0 && (
                  <table
                    ref={userRef1}
                    style={{ width: "100%" }}
                    className="table text-center table-bordered"
                  >
                    <thead>
                      <tr className="table-secondary">
                        {/* {department.shortDescription === "receptionPacking" && ( */}
                        <th scope="col">Print</th>
                        {/* )} */}
                        <th scope="col">#</th>
                        <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>StartedAt {renderSortIcon("dateIn")}</th>
                        <th
                          scope="col"
                          onClick={() =>
                            sortCasesByTechnacianName(startCases, "Start")
                          }
                        >
                          Technacian
                        </th>
                        <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>Doctor {renderSortIcon("doctorName")}</th>
                        <th scope="col">Patient</th>
                        <th scope="col" onClick={() => handleSort("assignedTo")} style={{ cursor: "pointer" }} className="text-start">
                          Assigned {renderSortIcon("assignedTo")}
                        </th>
                        <th scope="col" onClick={() => handleSort("ceramic")} style={{ cursor: "pointer" }}>Ceramic {renderSortIcon("ceramic")}</th>
                        <th scope="col">Notes</th>
                        <th scope="col">#teeth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applyMyFilter(startCases).map((item) => (
                        <tr
                          key={item._id}
                          className={` c-pointer ${(item.isStudy ? "bgc-study" : "") ||
                            (item.isUrgent ? "urgent-case animate-me" : "")
                            }`}

                        >
                          {/* {department.shortDescription === "receptionPacking" && department.shortDescription === "Admin" && ( */}
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="form-check d-flex justify-content-center">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={selectedStartCases.includes(item._id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelectStartCase(item._id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </td>

                          <td onClick={() => {
                            buffCaseHandle(item);
                          }}
                            data-bs-toggle="modal"
                            data-bs-target="#viewModal">{item.caseNumber}</td>
                          <td onClick={() => {
                            buffCaseHandle(item);
                          }}
                            data-bs-toggle="modal"
                            data-bs-target="#viewModal">{getStartingDate1(item)}</td>
                          <td onClick={() => {
                            buffCaseHandle(item);
                          }}
                            data-bs-toggle="modal"
                            data-bs-target="#viewModal">{getTechnicainName(item)}</td>
                          <td onClick={() => {
                            buffCaseHandle(item);
                          }}
                            data-bs-toggle="modal"
                            data-bs-target="#viewModal">{item?.dentistObj?.name}</td>
                          <td onClick={() => {
                            buffCaseHandle(item);
                          }}
                            data-bs-toggle="modal"
                            data-bs-target="#viewModal">{item.patientName}</td>
                          {renderAssignedCell(item)}
                          <td onClick={() => {
                            buffCaseHandle(item);
                          }}
                            data-bs-toggle="modal"
                            data-bs-target="#viewModal">
                            <div className="text-start small">
                              {(() => {
                                const assignments = getCadCamAndCeramicAssignments(item);
                                return (
                                  <>
                                    {/* <strong>{assignments.ceramic}</strong> */}
                                    {/* {assignments.cadCam && (
                                              <div><strong>CadCam:</strong> {assignments.cadCam}</div>
                                          )} */}
                                    {assignments.ceramic && item.isAssignedCeramic && (
                                      <div className="text-center"><strong>{assignments.ceramic ? assignments.ceramic : "-"}</strong></div>
                                    )}
                                    {!assignments.ceramic && (
                                      <div className="text-center"><strong>-</strong></div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                          <td onClick={(e) => {
                            e.stopPropagation();
                            setCurrentNoteCase(item);
                            setShowNoteModal(true);
                          }}>
                            <button className="btn btn-sm btn-info text-white">
                              <i className="fas fa-comment-dots"></i> {item.notes?.length || 0}
                            </button>
                          </td>
                          {userData.isAdmin && (
                            <td className="teeth-pieces">
                              {groupTeethNumbersByName(item.teethNumbers)?.map(
                                (item) => (
                                  <p className="teeth-piece">
                                    <span>{item.name}:</span>
                                    <b className="badge text-bg-light">
                                      {item.count}
                                    </b>
                                  </p>
                                )
                              )}
                            </td>
                          )}
                          {/* <td>
                            <div className="actions-btns">
                              <span
                                className="c-success"
                                onClick={() => viewCase(item, "process")}
                              >
                                <i class="fa-brands fa-squarespace"></i>
                              </span>
                              <span
                                className="c-success"
                                onClick={() => viewCase(item, "view")}
                              >
                                <i class="fa-solid fa-eye"></i>
                              </span>
                            </div>
                          </td> */}
                        </tr>
                      ))}
                      {userData.isAdmin && (
                        <>
                          <tr>
                            <td className="f-bold c-success" colSpan={9}>
                              <b>Total of Pieces</b>
                            </td>
                            <td className="bg-success p-2 text-dark bg-opacity-50">
                              <b>{sumOfTeethNumbersLength("Start")}</b>
                            </td>
                          </tr>
                          {userData.isAdmin && (
                            <tr>
                              <td className="f-bold c-success" colSpan={9}>
                                <b>Total Without Study</b>
                              </td>
                              <td className="bg-success p-2 text-dark bg-opacity-50">
                                <b>
                                  {sumOfTeethNumbersLength("Start") -
                                    getStudyCases(
                                      groupCasesTeethNumbersByName("Start")
                                    )}
                                </b>
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={10}>
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
              </div>
              {applyMyFilter(startCases)?.length <= 0 && (
                <div className="text-center">
                  <h6>No Starting Cases Yet! </h6>
                </div>
              )}
            </div>
          </div>
          {/* Pauseing Cases */}
          <div
            class="tab-pane fade "
            id="holdCases-tab-pane"
            role="tabpanel"
            aria-labelledby="holdCases-tab"
            tabIndex="0"
          >
            <div>
              <div className="row">
                <div className="col-lg-7 mb-3 ">
                  <input
                    type="text"
                    name="searchTextStart"
                    className="form-control"
                    placeholder="Search by name | case number | case type "
                    value={searchTextHold}
                    onChange={(e) => searchByName(e.target.value, "Pause")}
                  />
                </div>
                {/* Paus Date */}
                <div className="col-lg-3 ">
                  <div className="form-group">
                    <input
                      type="text"
                      name="searchTextStart"
                      className="form-control"
                      placeholder="Search by name | case number | case type "
                      value={searchTextHold}
                      onChange={(e) => searchByName(e.target.value, "Pause")}
                    />
                  </div>
                  {/* Paus Date */}
                  <div className="col-lg-3 ">
                    <div className="form-group">
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Select Date"
                        value={pauseDate}
                        onChange={(e) => searchPauseByDate(e)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-2 mb-3 print-btn">
                    <button
                      className="btn btn-sm btn-primary "
                      onClick={() => {
                        handlePrint2();
                      }}
                    >
                      {" "}
                      <i class="fas fa-print"></i> print
                    </button>
                  </div>
                </div>
                {applyMyFilter(pauseCases)?.length > 0 && (
                  <table
                    ref={userRef2}
                    style={{ width: "100%" }}
                    className="table text-center table-bordered"
                  >
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">#</th>
                        <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>HeldAt {renderSortIcon("dateIn")}</th>
                        <th
                          scope="col"
                          onClick={() =>
                            sortCasesByTechnacianName(pauseCases, "Hold")
                          }
                        >
                          Technacian
                        </th>
                        <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>Doctor {renderSortIcon("doctorName")}</th>
                        <th scope="col">Patient</th>
                        <th scope="col" onClick={() => handleSort("assignedTo")} style={{ cursor: "pointer" }} className="text-start">
                          Assigned {renderSortIcon("assignedTo")}
                        </th>
                        <th scope="col">Reason holding</th>
                        <th scope="col">Notes</th>
                        <th scope="col">#teeth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applyMyFilter(pauseCases).map((item) => (
                        <tr
                          key={item._id}
                          className="c-pointer"
                          // onClick={() => viewCase(item, "view")}
                          onClick={() => {
                            buffCaseHandle(item);
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#viewModal"
                        >
                          <td>{item.caseNumber}</td>
                          <td>{getHoldingDate(item)}</td>
                          <td>{getTechnicainName(item)}</td>
                          <td>{item?.dentistObj?.name}</td>
                          <td>{item.patientName}</td>
                          {renderAssignedCell(item)}
                          <td>{getHoldingreason(item)}</td>
                          <td onClick={(e) => {
                            e.stopPropagation();
                            setCurrentNoteCase(item);
                            setShowNoteModal(true);
                          }}>
                            <button className="btn btn-sm btn-info text-white">
                              <i className="fas fa-comment-dots"></i> {item.notes?.length || 0}
                            </button>
                          </td>
                          {userData.isAdmin && (
                            <td className="teeth-pieces">
                              {groupTeethNumbersByName(item.teethNumbers)?.map(
                                (item) => (
                                  <p className="teeth-piece">
                                    <span>{item.name}:</span>
                                    <b className="badge text-bg-light">
                                      {item.count}
                                    </b>
                                  </p>
                                )
                              )}
                            </td>
                          )}
                          {/* <td>
                { (user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" || user.roles[0] ===  _global.allRoles.technician && departments[0].name === "CadCam" ||  user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&&
                    <span className="c-primary ml-3" onClick={(e) => editCase(item._id)}>
                    <i class="fas fa-edit"></i>
                    </span>
                }
                </td> */}
                        </tr>
                      ))}
                      {userData.isAdmin && (
                        <>
                          <tr>
                            <td className="f-bold c-success" colSpan={8}>
                              <b>Total of Pieces</b>
                            </td>
                            <td className="bg-success p-2 text-dark bg-opacity-50">
                              <b>{sumOfTeethNumbersLength("Pause")}</b>
                            </td>
                          </tr>
                          {(departments[0].name === "cadCam" ||
                            departments[0].name === "fitting") && (
                              <tr>
                                <td className="f-bold c-success" colSpan={8}>
                                  <b>Total Without Study</b>
                                </td>
                                <td className="bg-success p-2 text-dark bg-opacity-50">
                                  <b>
                                    {sumOfTeethNumbersLength("Pause") -
                                      getStudyCases(
                                        groupCasesTeethNumbersByName("Pause")
                                      )}
                                  </b>
                                </td>
                              </tr>
                            )}
                          <tr>
                            <td colSpan={9}>
                              <div className="summary-teeth-cases">
                                {groupCasesTeethNumbersByName("Pause")?.map(
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
              </div>
              {applyMyFilter(pauseCases)?.length <= 0 && (
                <div className="text-center">
                  <h6>No pauseing Cases Yet! </h6>
                </div>
              )}
            </div>
          </div>
          {/* Finished Cases */}
          <div
            class="tab-pane fade "
            id="endCases-tab-pane"
            role="tabpanel"
            aria-labelledby="endCases-tab"
            tabIndex="0"
          >
            <div>
              <div className="row">
                <div className="col-lg-6 mb-3 ">
                  <input
                    type="text"
                    name="searchTextStart"
                    className="form-control"
                    placeholder="Search by name | case number | case type "
                    value={searchText}
                    onChange={(e) => searchByName(e.target.value, "End")}
                  />
                </div>
                {/* Start Date */}
                <div className="col-lg-3 ">
                  <div className="form-group">
                    <input
                      type="text"
                      name="searchTextStart"
                      className="form-control"
                      placeholder="Search by name | case number | case type "
                      value={searchText}
                      onChange={(e) => searchByName(e.target.value, "End")}
                    />
                  </div>
                  {/* Start Date */}
                  <div className="col-lg-3 ">
                    <div className="form-group">
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Start Date"
                        value={startFinishDate}
                        onChange={(e) => searchByDate(e)}
                      />
                    </div>
                  </div>
                  {/* End Date */}
                  <div className="col-lg-3 ">
                    <div className="form-group">
                      <input
                        type="date"
                        className="form-control"
                        placeholder=" End Date"
                        value={endDate}
                        onChange={(e) => searchByEndDate(e)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12 mb-3 print-btn">
                    <button
                      className="btn btn-sm btn-primary "
                      onClick={() => {
                        handlePrint();
                      }}
                    >
                      {" "}
                      <i class="fas fa-print"></i> print
                    </button>
                  </div>
                </div>
                {applyMyFilter(FinishedCases)?.length > 0 && (
                  <table
                    ref={userRef}
                    style={{ width: "100%" }}
                    className="table text-center table-bordered"
                  >
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">#</th>
                        <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>StartedAtAt {renderSortIcon("dateIn")}</th>
                        <th scope="col">FinishedAt</th>
                        <th scope="col">day(s)</th>
                        <th
                          scope="col"
                          onClick={() =>
                            sortCasesByTechnacianName(FinishedCases, "End")
                          }
                        >
                          Technacian
                        </th>
                        <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>Doctor {renderSortIcon("doctorName")}</th>
                        <th scope="col">Patient</th>
                        <th scope="col" onClick={() => handleSort("assignedTo")} style={{ cursor: "pointer" }} className="text-start">
                          Assigned {renderSortIcon("assignedTo")}
                        </th>
                        <th scope="col" onClick={() => handleSort("ceramic")} style={{ cursor: "pointer" }}>Ceramic {renderSortIcon("ceramic")}</th>
                        {/* <th scope="col">Notes</th> */}
                        <th scope="col">#teeth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applyMyFilter(FinishedCases).map((item) => (
                        <tr
                          className="c-pointer"
                          key={item._id}
                          // onClick={() => viewCase(item, "view")}
                          onClick={() => {
                            buffCaseHandle(item);
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#viewModal"
                        >
                          <td>{item.caseNumber}</td>
                          <td>{getStartingDate(item)}</td>
                          <td>{getFinisheingDate(item)}</td>
                          <td>
                            {handleCalculate(
                              getFullStartingDate(item),
                              getFullFinisheingDate(item)
                            )}
                          </td>
                          <td>{getTechnicainName(item)}</td>
                          <td>{item?.dentistObj?.name}</td>
                          <td>{item.patientName}</td>
                          {renderAssignedCell(item)}
                          <td>
                            <div className="text-start small">
                              {(() => {
                                const assignments = getCadCamAndCeramicAssignments(item);
                                return (
                                  <>
                                    {/* <strong>{assignments.ceramic}</strong> */}
                                    {/* {assignments.cadCam && (
                                      <div><strong>CadCam:</strong> {assignments.cadCam}</div>
                                    )} */}
                                    {assignments.ceramic && item.isAssignedCeramic && (
                                      <div className="text-center"><strong>{assignments.ceramic ? assignments.ceramic : "-"}</strong></div>
                                    )}
                                    {!assignments.ceramic && (
                                      <div className="text-center"><strong>-</strong></div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                          {/* <td onClick={(e) => {
                            e.stopPropagation();
                            setCurrentNoteCase(item);
                            setShowNoteModal(true);
                          }}>
                            <button className="btn btn-sm btn-info text-white">
                              <i className="fas fa-comment-dots"></i> {item.notes?.length || 0}
                            </button>
                          </td> */}
                          {userData.isAdmin && (
                            <td className="teeth-pieces">
                              {groupTeethNumbersByName(item.teethNumbers)?.map(
                                (item) => (
                                  <p className="teeth-piece">
                                    <span>{item.name}:</span>
                                    <b className="badge text-bg-light">
                                      {item.count}
                                    </b>
                                  </p>
                                )
                              )}
                            </td>
                          )}
                          {/* <td>
                { (user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" || user.roles[0] ===  _global.allRoles.technician && departments[0].name === "CadCam" ||  user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&&
                    <span className="c-primary ml-3" onClick={(e) => editCase(item._id)}>
                    <i class="fas fa-edit"></i>
                    </span>
                }
                </td> */}
                        </tr>
                      ))}
                      {userData.isAdmin && (
                        <>
                          <tr>
                            <td className="f-bold c-success" colSpan={9}>
                              <b>Total of Pieces</b>
                            </td>
                            <td className="bg-success p-2 text-dark bg-opacity-50">
                              <b>{sumOfTeethNumbersLength("End")}</b>
                            </td>
                          </tr>
                          {(departments[0].name === "cadCam" ||
                            departments[0].name === "fitting") && (
                              <tr>
                                <td className="f-bold c-success" colSpan={9}>
                                  <b>Total Without Study</b>
                                </td>
                                <td className="bg-success p-2 text-dark bg-opacity-50">
                                  <b>
                                    {sumOfTeethNumbersLength("End") -
                                      getStudyCases(
                                        groupCasesTeethNumbersByName("End")
                                      )}
                                  </b>
                                </td>
                              </tr>
                            )}
                          <tr>
                            <td colSpan={10}>
                              <div className="summary-teeth-cases">
                                {groupCasesTeethNumbersByName("End")?.map(
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
              </div>
              {applyMyFilter(FinishedCases)?.length <= 0 && (
                <div className="text-center">
                  <h6>No have Cases </h6>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {(applyMyFilter(FinishedCases).length > 0 || applyMyFilter(startCases).length > 0 || applyMyFilter(pauseCases).length > 0 || buffCase) && (
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
                {console.log("buffCase", buffCase)}
                {buffCase && <ViewCase caseModel={buffCase} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Doctor to Reception Modal */}
      <div
        className="modal fade"
        id="assignDoctorReceptionModal"
        tabIndex="-1"
        aria-labelledby="assignDoctorReceptionModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-light">
              <h5 className="modal-title" id="assignDoctorReceptionModalLabel">
                Assign Doctor
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-3">
                <strong>Doctor:</strong>{" "}
                {doctorToAssign
                  ? `${doctorToAssign.firstName || ""} ${doctorToAssign.lastName || ""}`.trim()
                  : "-"}
              </p>
              <label className="form-label">Users</label>
              <select
                className="form-select"
                value={selectedReceptionUser}
                onChange={(e) => setSelectedReceptionUser(e.target.value)}
              >
                <option value="">Choose user...</option>
                {receptionUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                disabled={!selectedReceptionUser}
                onClick={handleAssignDoctorToReception}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Notes for Case #{currentNoteCase?.caseNumber}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowNoteModal(false);
                    setCurrentNoteCase(null);
                    setNewNoteText("");
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "15px" }}>
                  {currentNoteCase?.notes && currentNoteCase.notes.length > 0 ? (
                    currentNoteCase.notes.map((note, index) => (
                      <div key={index} className="mb-3 p-2 border rounded bg-light">
                        <div className="d-flex justify-content-between text-muted small mb-1">
                          <strong>{note.author || note.name}</strong>
                          <span>{new Date(note.date).toLocaleString()}</span>
                        </div>
                        <div>{note.text || note.msg}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted">No notes yet.</p>
                  )}
                </div>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Type a new note here..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowNoteModal(false);
                    setCurrentNoteCase(null);
                    setNewNoteText("");
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    if (!newNoteText.trim()) return;
                    try {
                      const newNote = {
                        author: user.firstName + " " + user.lastName,
                        name: user.firstName + " " + user.lastName,
                        date: new Date().toISOString(),
                        text: newNoteText,
                        msg: newNoteText
                      };

                      const updatedNotes = [...(currentNoteCase.notes || []), newNote];

                      await axios.patch(`${_global.BASE_URL}cases/${currentNoteCase._id}`, {
                        notes: updatedNotes
                      });

                      // Update local state
                      setCurrentNoteCase({
                        ...currentNoteCase,
                        notes: updatedNotes
                      });

                      // Also correctly update the tracking lists
                      const updateList = (list) => list.map((c) =>
                        c._id === currentNoteCase._id ? { ...c, notes: updatedNotes } : c
                      );

                      setStartCases(updateList(startCases));
                      setPauseCases(updateList(pauseCases));
                      setFinishedCases(updateList(FinishedCases));
                      setBuffStartingCasesUser(updateList(buffCasesStartingUser));
                      setBuffCasesHoldingUser(updateList(buffCasesHoldingUser));
                      setBuffCasesUser(updateList(buffCasesUser));

                      setNewNoteText("");
                    } catch (err) {
                      console.error("Error adding note", err);
                      alert("Failed to add note.");
                    }
                  }}
                  disabled={!newNoteText.trim()}
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Area */}
      <div style={{ display: "none" }}>
        <div ref={userRef3} style={{ padding: "20px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <strong>Printed by:</strong> ___________________
            </div>
            <h4 className="text-center m-0"> {department.name === "Ceramic" ? "Invoices" : "Cases"} </h4>
            <div>
              <strong>Date:</strong> {new Date().toLocaleString()}
            </div>
          </div>
          <div className="row">
            {applyMyFilter(startCases)
              .filter((c) => selectedStartCases.includes(c._id))
              .map((item, index) => (
                <div className="col-6 mb-4" key={index}>
                  <div style={{ border: "2px solid #fd0d91ff", borderRadius: "8px", padding: "15px", height: "100%", fontSize: "14px", pageBreakInside: "avoid" }}>
                    <p className="mb-2"><strong style={{ color: "#2a0580ff" }}>Case Number:</strong> {item.caseNumber}</p>
                    <p className="mb-2"><strong style={{ color: "#2a0580ff" }}>StartedAt:</strong> {getStartingDate1(item) || "-"}</p>
                    <p className="mb-2"><strong style={{ color: "#2a0580ff" }}>Technician Name:</strong> {getTechnicainName(item) || "-"}</p>
                    <p className="mb-2"><strong style={{ color: "#2a0580ff" }}>shade:</strong> </p>
                    <p className="mb-2"><strong style={{ color: "#2a0580ff" }}>Dr. Name:</strong> {item.dentistObj?.name || "-"}</p>
                    <p className="mb-2"><strong style={{ color: "#2a0580ff" }}>Pt. Name:</strong> {item.patientName || "-"}</p>
                    <p className="mb-2"><strong style={{ color: "#2a0580ff" }}>Assigned:</strong> {getDoctorAssignedToName(item.dentistObj?.id || item.dentistObj?._id) || "-"}</p>
                    <div className="mb-1">
                      <strong style={{ color: "#2a0580ff" }}>Items:</strong>
                      {item.cadCam?.obj?.selectedItems?.length > 0 ? (
                        <ul className="mb-0 mt-1" style={{ paddingLeft: "18px" }}>
                          {item.cadCam.obj.selectedItems.map((si, idx) => (
                            <li key={idx} style={{ fontSize: "13px" }}>
                              <strong>{si.name}</strong> &times; {si.qty}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div style={{ minHeight: "60px" }}></div>
                      )}
                    </div>
                    {item.cadCam?.obj?.notes && (
                      <p className="mb-1">
                        <strong style={{ color: "#2a0580ff" }}>Notes:</strong>{" "}
                        <span style={{ fontStyle: "italic" }}>{item.cadCam.obj.notes}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CasesInDepartments;
