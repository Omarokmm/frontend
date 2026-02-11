import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as _global from "../../config/global";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import ViewCase from "./Cases/ViewCase";
import SEARCH_FIELDS from "../../enum/searchFieldEnum";
import { showToastMessage } from "../../helper/toaster";
import DatePicker from "react-multi-date-picker";
const UserProfile = () => {
  const userRef = useRef();
  const userRef1 = useRef();
  const userRef2 = useRef();
  const user = JSON.parse(localStorage.getItem("user"));
  const departments = JSON.parse(localStorage.getItem("departments"));
  const { state } = useLocation();
  console.log("stateeeeeee", state);
  const navigate = useNavigate();
  const [casesUser, setCasesUser] = useState([]);
  const [startCases, setStartCases] = useState([]);
  const [pauseCases, setPauseCases] = useState([]);
  const [HoldingCases, setHoldingCases] = useState([]);
  const [buffCasesUser, setBuffCasesUser] = useState([]);
  const [buffCasesStartingUser, setBuffStartingCasesUser] = useState([]);
  const [buffCasesHoldingUser, setBuffCasesHoldingUser] = useState([]);
  const [assignedCases, setAssignedCases] = useState([]);
  const [allAssignedCasesUnfiltered, setAllAssignedCasesUnfiltered] = useState([]);
  const [userData, setUserData] = useState(state ? state : user);
  const [searchText, setSearchText] = useState("");
  const [searchTextStart, setSearchTextStart] = useState("");
  const [searchTextHold, setSearchTextHold] = useState("");
  const [searchTextAssigned, setSearchTextAssigned] = useState("");
  const [searchCaseNumber, setSearchCaseNumber] = useState("");
  const [filterBy, setFilterBy] = useState(SEARCH_FIELDS.CASE_NUMBER);
  const [studyModel, setStudyModel] = useState({});
  const [printText, setPrintText] = useState("");
  const [startDate, setStartDat] = useState(new Date());
  const [pauseDate, setPauseDate] = useState(new Date());
  const [buffCase, setBuffCase] = useState(null);
  const [scheduleConfig, setScheduleConfig] = useState({
    cadCam: { selected: false, date: new Date() },
    fitting: { selected: false, date: new Date() },
    ceramic: { selected: false, date: new Date() },
  });

  console.log("User Data", userData);
  const [activeTab, setActiveTab] = useState(0);

  const Roles = {
    0: "admin",
    1: "manager",
    2: "teamleader",
    3: "technician",
    4: "Reception",
    5: "Driver",
    6: "graphic_design",
    7: "software_Engineer",
    8: "Super Admin",
    // Add more roles as needed
  };
  useEffect(() => {
    axios
      .get(`${_global.BASE_URL}users/actions/${state ? state._id : user._id}`)
      .then((res) => {
        const result = res.data;
        console.log("result", result);
        // const model = result.casesEnd.length > 0 ? result.casesEnd[0] : {} 
        // setBuffCase(model)
        // Cases Ended
        const casesEndData = sortCases(result.casesEnd);
        setCasesUser(casesEndData);
        setBuffCasesUser(casesEndData);
        console.log("hloding", result);

        // Starting Cases
        let startCasesData = [];
        let pauseCasesData = [];

        if (
          userData.isAdmin
            ? userData.departments[0].name === "CadCam"
            : departments[0].name === "CadCam"
        ) {
          startCasesData = result.casesStart.filter(
            (item) =>
              !item.isHold && // Ensure isHold is false
              item.cadCam.actions.length > 0 && // Ensure actions array is not empty
              item.cadCam.actions[item.cadCam.actions.length - 1].prfeix ===
              "start" && // Ensure last action's prfeix is "start"
              !item.cadCam.status.isStart // Ensure status isStart is false
          );
          setStartCases(startCasesData);
          setBuffStartingCasesUser(startCasesData);

          // Pauseing Cases
          pauseCasesData = result.casesHolding;
          setPauseCases(pauseCasesData);
          setBuffCasesHoldingUser(pauseCasesData);
        } else {
          startCasesData = result.casesStart;
          setStartCases(startCasesData);
          setBuffStartingCasesUser(startCasesData);

          // Pauseing Cases
          if (userData.lastName === "Jamous") {
            pauseCasesData = result.casesHolding;
            setPauseCases(pauseCasesData);
            setBuffCasesHoldingUser(pauseCasesData);
          } else {
            // Pauseing Cases
            console.log("pausing", result.casesPause);
            pauseCasesData = result.casesPause;
            setPauseCases(pauseCasesData);
            setBuffCasesHoldingUser(pauseCasesData);
          }
        }

        // Fetch assigned cases with filtering using the data we just processed
        fetchAssignedCases(startCasesData, pauseCasesData, casesEndData);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });


  }, []);


  const fetchAssignedCases = (startCasesData = [], pauseCasesData = [], casesUserData = []) => {
    const userId = state ? state._id : user._id;

    // Add null checks to prevent errors
    if (!userId) {
      console.error("No user ID available");
      setAssignedCases([]);
      return;
    }
    axios
      .get(`${_global.BASE_URL}cases/assigned/user/${userId}`)
      .then((res) => {
        console.log("Assigned cases response:", res);
        console.log("Assigned cases:", res.data.cases);

        // Get all assigned cases
        const allAssignedCases = res.data.data.cases || [];

        // Use provided data or fallback to state arrays
        const startCasesToUse = startCasesData.length > 0 ? startCasesData : startCases;
        const pauseCasesToUse = pauseCasesData.length > 0 ? pauseCasesData : pauseCases;
        const casesUserToUse = casesUserData.length > 0 ? casesUserData : casesUser;

        // Get IDs from other arrays to filter out
        const startCaseIds = startCasesToUse.map(caseItem => caseItem._id);
        const pauseCaseIds = pauseCasesToUse.map(caseItem => caseItem._id);
        const casesUserIds = casesUserToUse.map(caseItem => caseItem._id);

        // Combine all IDs to exclude
        const excludeIds = [...startCaseIds, ...pauseCaseIds, ...casesUserIds];

        // Filter out cases that exist in other arrays
        const filteredAssignedCases = allAssignedCases.filter((caseItem) => {
          // 1. Existing exclusion logic
          if (excludeIds.includes(caseItem._id)) return false;

          // 2. Exclude hold cases
          if (caseItem.isHold === true) return false;

          // 3. Strict filter: deadlineCadCam OR isTopPriority OR isUrgent
          const hasDeadline = caseItem.deadlineCadCam;
          const isPriority = caseItem.isTopPriority === true;
          const isUrgent = caseItem.isUrgent === true;

          return isPriority || hasDeadline || isUrgent;
        });

        // For admin: also store all assigned cases without priority/deadline filter
        const allCasesWithoutStatusFilter = allAssignedCases.filter((caseItem) => {
          // Exclude cases in other arrays
          if (excludeIds.includes(caseItem._id)) return false;

          // Exclude hold cases
          if (caseItem.isHold === true) return false;

          return true;
        });

        console.log("Filtered assigned cases:", filteredAssignedCases);
        console.log("All assigned cases (unfiltered):", allCasesWithoutStatusFilter);
        console.log("Excluded case IDs:", excludeIds);

        setAssignedCases(filteredAssignedCases);
        setAllAssignedCasesUnfiltered(allCasesWithoutStatusFilter);
      })
      .catch((error) => {
        console.error("Error fetching assigned cases:", error);
      });
  }

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
      } else if (key === "dateIn") {
        aValue = new Date(a.dateIn).getTime();
        bValue = new Date(b.dateIn).getTime();
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

  const handleSort = (key, listType) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    // Sort relevant lists depending on the tab or listType passed
    // Or we can just sort all lists to be safe/consistent
    setStartCases((prev) => sortData(prev, key, direction));
    setPauseCases((prev) => sortData(prev, key, direction));
    setCasesUser((prev) => sortData(prev, key, direction));
    setAssignedCases((prev) => sortData(prev, key, direction));
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

  // Function to refresh assigned cases when other arrays change
  const refreshAssignedCases = () => {
    fetchAssignedCases(startCases, pauseCases, casesUser);
  }

  // Function to fetch assigned cases for the user
  // const fetchAssignedCases = async () => {
  //   try {
  //     const userId = state ? state._id : user._id;

  //     // Add null checks to prevent errors
  //     if (!userId) {
  //       console.error("No user ID available");
  //       setAssignedCases([]);
  //       return;
  //     }

  //     const department = userData.isAdmin 
  //       ? (userData.departments && userData.departments[0] ? userData.departments[0].name : null)
  //       : (departments && departments[0] ? departments[0].name : null);

  //     if (!department) {
  //       console.error("No department available");
  //       setAssignedCases([]);
  //       return;
  //     }


  //     const response = await axios.get(
  //       `${_global.BASE_URL}cases/assigned/user/${userId}`
  //     );

  //     console.log("Assigned cases response:", response.data);
  //     setAssignedCases(response.data || []);
  //   } catch (error) {
  //     console.error("Error fetching assigned cases:", error);
  //     setAssignedCases([]);
  //   }
  /* Priority & Schedule Handlers */
  const togglePriority = async (item) => {
    const newPriority = !item.isTopPriority;

    // Optimistic Update
    const updateList = (list) => list.map(c => c._id === item._id ? { ...c, isTopPriority: newPriority } : c);
    setAllAssignedCasesUnfiltered(prev => updateList(prev));
    setAssignedCases(prev => updateList(prev));

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
      // Revert optimistic update
      const revertList = (list) => list.map(c => c._id === item._id ? { ...c, isTopPriority: item.isTopPriority } : c);
      setAllAssignedCasesUnfiltered(prev => revertList(prev));
      setAssignedCases(prev => revertList(prev));
    }
  };

  const handleScheduleSave = async () => {
    // Determine target(s)
    let targets = [];
    if (buffCase) {
      targets = [buffCase._id];
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

      setAllAssignedCasesUnfiltered(prev => updateStateList(prev));
      setAssignedCases(prev => updateStateList(prev));

      showToastMessage("Cases scheduled successfully", "success");
      setBuffCase(null); // Clear buffer

      const closeBtn = document.getElementById("closeScheduleModalBtn");
      if (closeBtn) closeBtn.click();
    } catch (error) {
      console.error("Error scheduling cases:", error);
      showToastMessage("Error scheduling cases", "error");
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
  function groupCasesTeethNumbersByName(type) {
    const result = {};
    if (type === "End") {
      casesUser.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    } else if (type === "Start") {
      startCases.forEach((singleCase) => {
        singleCase.teethNumbers.forEach((teethNumber) => {
          const { name } = teethNumber;
          if (!result[name]) {
            result[name] = 0;
          }
          result[name]++;
        });
      });
    } else if (type === "Pause") {
      pauseCases.forEach((singleCase) => {
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
  function sumOfTeethNumbersLength(type) {
    let totalLength = 0;
    if (type === "Start") {
      startCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    } else if (type === "Pause") {
      pauseCases.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    } else if (type === "End") {
      casesUser.forEach((caseItem) => {
        totalLength += caseItem.teethNumbers.length;
      });
      return totalLength;
    }
  }
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      searchByNameOrNumber(searchCaseNumber, "startCases");
    }
  };

  const searchbyIcon = () => {
    if (searchCaseNumber !== "") {
      searchByNameOrNumber(searchCaseNumber, "startCases");
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
          console.log("result", result);
          if (type === "startCases") {
            setStartCases(result);
          }
        })
        .catch((error) => {
          console.error("Search error:", error);
        });
    } else {
      setStartCases(buffCasesStartingUser);
    }
  };

  const searchByName = (searchText, type) => {
    console.log(searchText, type);
    if (type === "Start") {
      setSearchTextStart(searchText);
      if (searchTextStart !== "") {
        const filteredCases = buffCasesStartingUser.filter(
          (item) =>
            item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setStartCases(filteredCases);
      } else {
        setStartCases(buffCasesStartingUser);
      }
    }
    if (type === "Pause") {
      setSearchTextHold(searchText);
      if (searchTextHold !== "") {
        const filteredCases = buffCasesHoldingUser.filter(
          (item) =>
            item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setPauseCases(filteredCases);
      } else {
        setPauseCases(buffCasesHoldingUser);
      }
    }
    if (type === "End") {
      setSearchText(searchText);
      if (searchText !== "") {
        const filteredCases = buffCasesUser.filter(
          (item) =>
            item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setCasesUser(filteredCases);
      } else {
        setCasesUser(buffCasesUser);
      }
    }
    if (type === "Assigned") {
      setSearchTextAssigned(searchText);
      if (searchText !== "") {
        const filteredCases = assignedCases.filter(
          (item) =>
            item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setAssignedCases(filteredCases);
      } else {
        // Reset to original assigned cases when search is cleared
        // fetchAssignedCases();
      }
    }
  };
  const searchByDate = (e) => {
    const date = e.target.value;
    setStartDat(date);
    if (date != "") {
      console.log("date");
      if (
        userData.isAdmin
          ? userData.departments[0].name === "CadCam"
          : departments[0].name === "CadCam"
      ) {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.cadCam.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });
        setCasesUser(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Fitting" &&
          userData.lastName === "Jamous"
          : departments[0].name === "Fitting" && userData.lastName === "Jamous"
      ) {
        const filteredCases = buffCasesUser.filter((item) => {

          if (item.cadCam.actions.length > 0) {
            console.log('item.cadCam.actions', item.cadCam.actions.length, item.caseNumber)
            return (
              _global.formatDateToYYYYMMDD(
                item.cadCam.actions.find((i) => i.dateEnd)?.dateEnd
              ) === date
            );
          }
        });
        setCasesUser(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Caramic"
          : departments[0].name === "Caramic"
      ) {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.ceramic.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });
        setCasesUser(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Fitting"
          : departments[0].name === "Fitting"
      ) {
        const filteredCases = buffCasesUser.filter((item) => {
          if (item.fitting.actions.length > 0)
            return (
              _global.formatDateToYYYYMMDD(
                item.fitting.actions.find((i) => i.dateEnd).dateEnd
              ) === date
            );
        });

        setCasesUser(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Plaster"
          : departments[0].name === "Plaster"
      ) {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.plaster.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });

        setCasesUser(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Reception"
          : departments[0].name === "Reception"
      ) {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.receptionPacking.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });

        setCasesUser(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Marketing"
          : departments[0].name === "Marketing"
      ) {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.designing.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });

        setCasesUser(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "QC"
          : departments[0].name === "QC"
      ) {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.qualityControl.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });

        setCasesUser(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Drivers"
          : departments[0].name === "Drivers"
      ) {
        const filteredCases = buffCasesUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.delivering.actions.find((i) => i.dateEnd).dateEnd
            ) === date
          );
        });

        setCasesUser(filteredCases);
      }
    } else {
      setCasesUser(buffCasesUser);
    }
  };
  const searchStartByDate = (e) => {
    const date = e.target.value;
    setStartDat(date);
    if (date != "") {
      console.log("date");
      if (
        userData.isAdmin
          ? userData.departments[0].name === "CadCam"
          : departments[0].name === "CadCam"
      ) {
        const filteredCases = buffCasesStartingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.cadCam.actions[item.cadCam.actions.length - 1]?.dateStart
            ) === date
          );
        });
        setStartCases(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Caramic"
          : departments[0].name === "Caramic"
      ) {
        const filteredCases = buffCasesStartingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.ceramic.actions[item.ceramic.actions.length - 1]?.dateStart
            ) === date
          );
        });
        setStartCases(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Fitting"
          : departments[0].name === "Fitting"
      ) {
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
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Plaster"
          : departments[0].name === "Plaster"
      ) {
        const filteredCases = buffCasesStartingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.plaster.actions[item.plaster.actions.length - 1]?.dateStart
            ) === date
          );
        });

        setStartCases(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Reception"
          : departments[0].name === "Reception"
      ) {
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
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Marketing"
          : departments[0].name === "Marketing"
      ) {
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
      if (
        userData.isAdmin
          ? userData.departments[0].name === "QC"
          : departments[0].name === "QC"
      ) {
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
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Drivers"
          : departments[0].name === "Drivers"
      ) {
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
      if (
        userData.isAdmin
          ? userData.departments[0].name === "CadCam"
          : departments[0].name === "CadCam"
      ) {
        const filteredCases = buffCasesHoldingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.cadCam.actions[item.cadCam.actions.length - 1]?.dateStart
            ) === date
          );
        });
        setPauseCases(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Caramic"
          : departments[0].name === "Caramic"
      ) {
        const filteredCases = buffCasesHoldingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.ceramic.actions[item.ceramic.actions.length - 1]?.dateStart
            ) === date
          );
        });
        setPauseCases(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Fitting"
          : departments[0].name === "Fitting"
      ) {
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
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Plaster"
          : departments[0].name === "Plaster"
      ) {
        const filteredCases = buffCasesHoldingUser.filter((item) => {
          return (
            _global.formatDateToYYYYMMDD(
              item.plaster.actions[item.plaster.actions.length - 1]?.dateStart
            ) === date
          );
        });

        setPauseCases(filteredCases);
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Reception"
          : departments[0].name === "Reception"
      ) {
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
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Marketing"
          : departments[0].name === "Marketing"
      ) {
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
      if (
        userData.isAdmin
          ? userData.departments[0].name === "QC"
          : departments[0].name === "QC"
      ) {
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
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Drivers"
          : departments[0].name === "Drivers"
      ) {
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
    const start = _global.formatDateToYYYYMMDD(startDate);
    const end = _global.formatDateToYYYYMMDD(date);
    if (date != "") {
      const filteredCases = buffCasesUser.filter((item) => {
        let endDateStr = "";
        if (
          userData.isAdmin
            ? userData.departments[0].name === "CadCam"
            : departments[0].name === "CadCam"
        ) {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.cadCam.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (
          userData.isAdmin
            ? userData.departments[0].name === "Caramic"
            : departments[0].name === "Caramic"
        ) {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.ceramic.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (
          userData.isAdmin
            ? userData.departments[0].name === "Fitting"
            : departments[0].name === "Fitting"
        ) {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.fitting.actions.find((i) => i.dateEnd)?.dateEnd
          );
        }
        if (
          userData.isAdmin
            ? userData.departments[0].name === "Plaster"
            : departments[0].name === "Plaster"
        ) {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.plaster.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (
          userData.isAdmin
            ? userData.departments[0].name === "Reception"
            : departments[0].name === "Reception"
        ) {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.receptionPacking.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (
          userData.isAdmin
            ? userData.departments[0].name === "Marketing"
            : departments[0].name === "Marketing"
        ) {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.designing.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (
          userData.isAdmin
            ? userData.departments[0].name === "QC"
            : departments[0].name === "QC"
        ) {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.qualityControl.actions.find((i) => i.dateEnd).dateEnd
          );
        }
        if (
          userData.isAdmin
            ? userData.departments[0].name === "Drivers"
            : departments[0].name === "Drivers"
        ) {
          endDateStr = _global.formatDateToYYYYMMDD(
            item.delivering.actions.find((i) => i.dateEnd).dateEnd
          );
        }

        return endDateStr >= start && endDateStr <= end;
      });
      setCasesUser(filteredCases);
    } else {
      setCasesUser(buffCasesUser);
    }
  };
  const sortCases = (result) => {
    if (
      userData.isAdmin
        ? userData.departments[0].name === "CadCam"
        : departments[0].name === "CadCam"
    ) {
      return result.sort((a, b) => {
        // Find the latest `dateEnd` in `cadCam` actions for each case
        const getDateEnd = (obj) => {
          const actions = obj.cadCam.actions;
          if (!actions || actions.length === 0) return null;
          const endActions = actions.filter((action) => action.dateEnd);
          if (endActions.length === 0) return null;
          return new Date(
            Math.max(...endActions.map((action) => new Date(action.dateEnd)))
          );
        };
        const dateEndA = getDateEnd(a);
        const dateEndB = getDateEnd(b);
        // Sort by `dateEnd`, descending (newest first)
        if (dateEndA && dateEndB) {
          return dateEndA - dateEndB;
        } else if (dateEndA) {
          return -1; // a should come before b
        } else if (dateEndB) {
          return 1; // b should come before a
        } else {
          return 0; // no dateEnd for both
        }
      });
    }
    if (
      userData.isAdmin
        ? userData.departments[0].name === "Caramic"
        : departments[0].name === "Caramic"
    ) {
      return result.sort((a, b) => {
        // Find the latest `dateEnd` in `ceramic` actions for each case
        const getDateEnd = (obj) => {
          const actions = obj.ceramic.actions;
          if (!actions || actions.length === 0) return null;
          const endActions = actions.filter((action) => action.dateEnd);
          if (endActions.length === 0) return null;
          return new Date(
            Math.max(...endActions.map((action) => new Date(action.dateEnd)))
          );
        };
        const dateEndA = getDateEnd(a);
        const dateEndB = getDateEnd(b);
        // Sort by `dateEnd`, descending (newest first)
        if (dateEndA && dateEndB) {
          return dateEndA - dateEndB;
        } else if (dateEndA) {
          return -1; // a should come before b
        } else if (dateEndB) {
          return 1; // b should come before a
        } else {
          return 0; // no dateEnd for both
        }
      });
    }
    if (
      userData.isAdmin
        ? userData.departments[0].name === "Fitting"
        : departments[0].name === "Fitting"
    ) {
      return result.sort((a, b) => {
        // Find the latest `dateEnd` in `Fitting` actions for each case
        const getDateEnd = (obj) => {
          const actions = obj.fitting.actions;
          if (!actions || actions.length === 0) return null;
          const endActions = actions.filter((action) => action.dateEnd);
          if (endActions.length === 0) return null;
          return new Date(
            Math.max(...endActions.map((action) => new Date(action.dateEnd)))
          );
        };
        const dateEndA = getDateEnd(a);
        const dateEndB = getDateEnd(b);
        // Sort by `dateEnd`, descending (newest first)
        if (dateEndA && dateEndB) {
          return dateEndA - dateEndB;
        } else if (dateEndA) {
          return -1; // a should come before b
        } else if (dateEndB) {
          return 1; // b should come before a
        } else {
          return 0; // no dateEnd for both
        }
      });
    }
    if (
      userData.isAdmin
        ? userData.departments[0].name === "Plaster"
        : departments[0].name === "Plaster"
    ) {
      return result.sort((a, b) => {
        // Find the latest `dateEnd` in `plaster` actions for each case
        const getDateEnd = (obj) => {
          const actions = obj.plaster.actions;
          if (!actions || actions.length === 0) return null;
          const endActions = actions.filter((action) => action.dateEnd);
          if (endActions.length === 0) return null;
          return new Date(
            Math.max(...endActions.map((action) => new Date(action.dateEnd)))
          );
        };
        const dateEndA = getDateEnd(a);
        const dateEndB = getDateEnd(b);
        // Sort by `dateEnd`, descending (newest first)
        if (dateEndA && dateEndB) {
          return dateEndA - dateEndB;
        } else if (dateEndA) {
          return -1; // a should come before b
        } else if (dateEndB) {
          return 1; // b should come before a
        } else {
          return 0; // no dateEnd for both
        }
      });
    }
    if (
      userData.isAdmin
        ? userData.departments[0].name === "Reception"
        : departments[0].name === "Reception"
    ) {
      return result.sort((a, b) => {
        // Find the latest `dateEnd` in `Reception` actions for each case
        const getDateEnd = (obj) => {
          const actions = obj.receptionPacking.actions;
          if (!actions || actions.length === 0) return null;
          const endActions = actions.filter((action) => action.dateEnd);
          if (endActions.length === 0) return null;
          return new Date(
            Math.max(...endActions.map((action) => new Date(action.dateEnd)))
          );
        };
        const dateEndA = getDateEnd(a);
        const dateEndB = getDateEnd(b);
        // Sort by `dateEnd`, descending (newest first)
        if (dateEndA && dateEndB) {
          return dateEndA - dateEndB;
        } else if (dateEndA) {
          return -1; // a should come before b
        } else if (dateEndB) {
          return 1; // b should come before a
        } else {
          return 0; // no dateEnd for both
        }
      });
    }
    if (
      userData.isAdmin
        ? userData.departments[0].name === "Marketing"
        : departments[0].name === "Marketing"
    ) {
      return result.sort((a, b) => {
        // Find the latest `dateEnd` in `designing` actions for each case
        const getDateEnd = (obj) => {
          const actions = obj.designing.actions;
          if (!actions || actions.length === 0) return null;
          const endActions = actions.filter((action) => action.dateEnd);
          if (endActions.length === 0) return null;
          return new Date(
            Math.max(...endActions.map((action) => new Date(action.dateEnd)))
          );
        };
        const dateEndA = getDateEnd(a);
        const dateEndB = getDateEnd(b);
        // Sort by `dateEnd`, descending (newest first)
        if (dateEndA && dateEndB) {
          return dateEndA - dateEndB;
        } else if (dateEndA) {
          return -1; // a should come before b
        } else if (dateEndB) {
          return 1; // b should come before a
        } else {
          return 0; // no dateEnd for both
        }
      });
    }
    if (
      userData.isAdmin
        ? userData.departments[0].name === "Drivers"
        : departments[0].name === "Drivers"
    ) {
      return result.sort((a, b) => {
        // Find the latest `dateEnd` in `delivering` actions for each case
        const getDateEnd = (obj) => {
          const actions = obj.delivering.actions;
          if (!actions || actions.length === 0) return null;
          const endActions = actions.filter((action) => action.dateEnd);
          if (endActions.length === 0) return null;
          return new Date(
            Math.max(...endActions.map((action) => new Date(action.dateEnd)))
          );
        };
        const dateEndA = getDateEnd(a);
        const dateEndB = getDateEnd(b);
        // Sort by `dateEnd`, descending (newest first)
        if (dateEndA && dateEndB) {
          return dateEndA - dateEndB;
        } else if (dateEndA) {
          return -1; // a should come before b
        } else if (dateEndB) {
          return 1; // b should come before a
        } else {
          return 0; // no dateEnd for both
        }
      });
    }
  };
  const getFinisheingDate = (item) => {
    if (item) {
      let endDateStr = "";
      if (
        userData.isAdmin
          ? userData.departments[0].name === "CadCam"
          : departments[0].name === "CadCam"
      ) {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.cadCam.actions.find((i) => i.dateEnd).dateEnd
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Fitting" &&
          userData.lastName === "Jamous"
          : departments[0].name === "Fitting" && userData.lastName === "Jamous"
      ) {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.cadCam.actions.find((i) => i.dateEnd)?.dateEnd
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Caramic"
          : departments[0].name === "Caramic"
      ) {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.ceramic.actions.find((i) => i.dateEnd).dateEnd
        );
      }
      if (
        (userData.isAdmin
          ? userData.departments[0].name === "Fitting"
          : departments[0].name === "Fitting") &&
        item.fitting.actions?.length > 0
      ) {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.fitting.actions.find((i) => i.dateEnd)?.dateEnd
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Plaster"
          : departments[0].name === "Plaster"
      ) {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.plaster.actions.find((i) => i.dateEnd).dateEnd
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Reception"
          : departments[0].name === "Reception"
      ) {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.receptionPacking.actions.find((i) => i.dateEnd)?.dateEnd
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Marketing"
          : departments[0].name === "Marketing"
      ) {
        endDateStr = _global.formatDateToYYYYMMDD(
          item.designing.actions.find((i) => i.dateEnd).dateEnd
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Drivers"
          : departments[0].name === "Drivers"
      ) {
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
        userData.isAdmin
          ? userData.departments[0].name === "CadCam"
          : departments[0].name === "CadCam"
      ) {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.cadCam.actions[item.cadCam.actions.length - 1]?.dateStart
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Fitting" &&
          userData.lastName === "Jamous"
          : departments[0].name === "Fitting" && userData.lastName === "Jamous"
      ) {
        console.log("FITTING CAD CAM");
        startDateStr = _global.formatDateToYYYYMMDD(
          item.cadCam.actions[item.cadCam.actions.length - 1]?.dateStart
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Caramic"
          : departments[0].name === "Caramic"
      ) {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.ceramic.actions[item.ceramic.actions.length - 1]?.dateStart
        );
      }
      if (
        (userData.isAdmin
          ? userData.departments[0].name === "Fitting"
          : departments[0].name === "Fitting") &&
        item.fitting.actions?.length > 0
      ) {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.fitting.actions[item.fitting.actions.length - 1]?.dateStart
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Plaster"
          : departments[0].name === "Plaster"
      ) {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.plaster.actions[item.plaster.actions.length - 1]?.dateStart
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Reception"
          : departments[0].name === "Reception"
      ) {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.receptionPacking.actions[
            item.receptionPacking.actions.length - 1
          ]?.dateStart
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Marketing"
          : departments[0].name === "Marketing"
      ) {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.designing.actions[item.designing.actions.length - 1]?.dateStart
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Drivers"
          : departments[0].name === "Drivers"
      ) {
        startDateStr = _global.formatDateToYYYYMMDD(
          item.delivering.actions[item.delivering.actions.length - 1]?.dateStart
        );
      }
      return startDateStr;
    } else {
      return "-";
    }
  };
  const getHoldingDate = (item) => {
    if (item) {
      let pauseDateStr = "";
      if (
        userData.isAdmin
          ? userData.departments[0].name === "CadCam"
          : departments[0].name === "CadCam"
      ) {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item?.historyHolding[item.historyHolding.length - 1]?.date
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Fitting" &&
          userData.lastName === "Jamous"
          : departments[0].name === "Fitting" && userData.lastName === "Jamous"
      ) {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item?.historyHolding[item.historyHolding.length - 1]?.date
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Caramic"
          : departments[0].name === "Caramic"
      ) {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item.ceramic.actions[item.ceramic.actions.length - 1]?.datePause
        );
      }
      if (
        (userData.isAdmin
          ? userData.departments[0].name === "Fitting"
          : departments[0].name === "Fitting") &&
        item.fitting.actions?.length > 0
      ) {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item.fitting.actions[item.fitting.actions.length - 1]?.datePause
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Plaster"
          : departments[0].name === "Plaster"
      ) {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item.plaster.actions[item.plaster.actions.length - 1]?.datePause
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Reception"
          : departments[0].name === "Reception"
      ) {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item.receptionPacking.actions[
            item.receptionPacking.actions.length - 1
          ]?.datePause
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Marketing"
          : departments[0].name === "Marketing"
      ) {
        pauseDateStr = _global.formatDateToYYYYMMDD(
          item.designing.actions[item.designing.actions.length - 1]?.datePause
        );
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Drivers"
          : departments[0].name === "Drivers"
      ) {
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
      if (
        userData.isAdmin
          ? userData.departments[0].name === "CadCam"
          : departments[0].name === "CadCam"
      ) {
        reason = item?.historyHolding[item.historyHolding.length - 1]?.msg;
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Fitting" &&
          userData.lastName === "Jamous"
          : departments[0].name === "Fitting" && userData.lastName === "Jamous"
      ) {
        reason = item?.historyHolding[item.historyHolding.length - 1]?.msg;
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Caramic"
          : departments[0].name === "Caramic"
      ) {
        reason = item.ceramic.actions[item.ceramic.actions.length - 1]?.msg
          .replace(/.*\bbecause\b\s*/, "")
          .trim();
      }
      if (
        (userData.isAdmin
          ? userData.departments[0].name === "Fitting"
          : departments[0].name === "Fitting") &&
        item.fitting.actions?.length > 0
      ) {
        reason = item.fitting.actions[item.fitting.actions.length - 1]?.msg
          .replace(/.*\bbecause\b\s*/, "")
          .trim();
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Plaster"
          : departments[0].name === "Plaster"
      ) {
        reason = item.plaster.actions[item.plaster.actions.length - 1]?.msg
          .replace(/.*\bbecause\b\s*/, "")
          .trim();
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Reception"
          : departments[0].name === "Reception"
      ) {
        reason = item.receptionPacking.actions[
          item.receptionPacking.actions.length - 1
        ]?.msg
          .replace(/.*\bbecause\b\s*/, "")
          .trim();
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Marketing"
          : departments[0].name === "Marketing"
      ) {
        reason = item.designing.actions[item.designing.actions.length - 1]?.msg
          .replace(/.*\bbecause\b\s*/, "")
          .trim();
      }
      if (
        userData.isAdmin
          ? userData.departments[0].name === "Drivers"
          : departments[0].name === "Drivers"
      ) {
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
  const handlePrint = useReactToPrint({
    content: () => userRef.current,
    documentTitle: ` ${userData.firstName}   ${userData.lastName} (Finished Cases)`,
  });
  const handlePrint1 = useReactToPrint({
    content: () => userRef1.current,
    documentTitle: ` ${userData.firstName}   ${userData.lastName} (Starting Cases)`,
  });
  const handlePrint2 = useReactToPrint({
    content: () => userRef2.current,
    documentTitle: `${userData.firstName}   ${userData.lastName} (Holding Cases)`,
  });
  const editCase = (id) => {
    navigate(`/layout/edit-case/${id}`);
  };
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
  const handleClick = (text) => {
    setPrintText(text);
  };
  // Handle tab change and update URL
  const handleTabChange = (index, callback) => {
    setActiveTab(index);
    navigate(`?tab=${index}`); // Update the URL with the active tab index
    if (callback) callback();
  };
  const buffCaseHandle = (item) => {
    const newItem = JSON.parse(JSON.stringify(item)); // Deep clone = new object ref
    setBuffCase(newItem);
  };
  return (
    <div className="content user-profile-page">
      <div className="card">
        <h6 class="card-title">
          <span>
            {/* <span className="back-step" onClick={() => navigate("/layout/users")}>
            <i class="fa-solid fa-arrow-left-long"></i>
             </span> */}
            <small>
              {userData.firstName} {userData.lastName} ({casesUser?.length})
            </small>
          </span>
          <span>
            <small>
              Role:
              {userData.roles.map((roleId, index) => (
                <span className="text-capitalize c-success" key={index}>
                  {Roles[roleId]}
                  {index !== userData.roles.length - 1 && ", "}
                </span>
              ))}
            </small>
          </span>
        </h6>
        <div className="card-body">
          <div className="row"></div>
          <div>
            <ul class="nav nav-tabs" id="myTab" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  className={`nav-link bgc-info ${activeTab === 0 ? "active " : ""}`}
                  id="assignedCases-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#assignedCases-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="assignedCases-tab-pane"
                  aria-selected="false"
                // onClick={() => {
                //   handleTabChange(3, () => fetchAssignedCases())
                // }}
                >
                  Assigned Cases <small>({assignedCases?.length})</small>
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  className={`nav-link bgc-primary ${activeTab === 1 ? "active " : ""}`}
                  id="startCases-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#startCases-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="startCases-tab-pane"
                  onClick={() => {
                    handleTabChange(1)
                    setSearchCaseNumber("")
                    setStartCases(buffCasesStartingUser)
                  }}
                  aria-selected={activeTab === 0}
                >
                  Start <small>({startCases.length})</small>
                </button>
              </li>
              <li
                class="nav-item"
                role="presentation"
                onClick={() => searchByName("", "Pause")}
              >
                <button
                  className={`nav-link bgc-danger ${activeTab === 2 ? "active " : ""}`}
                  id="holdCases-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#holdCases-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="holdCases-tab-pane"
                  aria-selected="true"
                  onClick={() => {
                    handleTabChange(2)
                    searchByName("", "Pause")
                  }}
                >
                  Hold <small>({pauseCases.length})</small>
                </button>
              </li>
              <li
                class="nav-item"
                role="presentation"
                onClick={() => searchByName("", "End")}
              >
                <button
                  className={`nav-link bgc-success ${activeTab === 3 ? "active " : ""}`}
                  id="endCases-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#endCases-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="endCases-tab-pane"
                  aria-selected="true"
                  onClick={() => {
                    handleTabChange(3)
                    searchByName("", "End")
                  }}
                >
                  End <small>({casesUser?.length})</small>
                </button>
              </li>

            </ul>
          </div>
          <div
            class="tab-content"
            id="myTabContent"
            onClick={() => {
              setSearchText("");
              setSearchTextHold("");
              setSearchTextStart("");
              setSearchTextAssigned("");
              setSearchCaseNumber("");
              setStartCases(buffCasesStartingUser);
            }}
          >

            {/* Assigned Cases */}
            <div
              className={`tab-pane fade ${activeTab === 0 ? "show active" : ""}`}
              id="assignedCases-tab-pane"
              role="tabpanel"
              aria-labelledby="assignedCases-tab"
              tabIndex="0"
            >
              <div className="row">
                <div className="col-lg-12 mb-3">
                  <input
                    type="text"
                    name="searchTextAssigned"
                    className="form-control"
                    placeholder="Search by case number, doctor name, or patient name..."
                    value={searchTextAssigned}
                    onChange={(e) => searchByName(e.target.value, "Assigned")}
                  />
                </div>
              </div>

              {userData.isAdmin ? (
                <>
                  {/* Priority/Deadline Cases Table */}
                  {assignedCases?.length > 0 && (
                    <>
                      <h6 className="text-danger fw-bold mb-3">
                        <i className="fa-solid fa-star me-2"></i>
                        Priority & Deadline Cases ({assignedCases.length})
                      </h6>
                      <table className="table table-responsive text-center table-bordered mb-4">
                        <thead>
                          <tr className="table-secondary">
                            <th scope="col">#Case</th>
                            <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>Doctor Name {renderSortIcon("doctorName")}</th>
                            <th scope="col">Patient Name</th>
                            <th scope="col">#Unites</th>
                            <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>In {renderSortIcon("dateIn")}</th>
                            <th scope="col">Due</th>
                            <th scope="col">Deadline CadCam</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedCases.map((item, index) => (
                            <tr key={item._id}
                              className={
                                item.isTopPriority ? "urgent-case animate-me" :
                                  (item.isStudy ? "bgc-study" : "") ||
                                  (item.isUrgent ? "urgent-case animate-me" : "")
                              }>
                              <td>{item.caseNumber}</td>
                              <td>{item.dentistObj?.name}</td>
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
                                {item.isUrgent ? <span className="fw-bold text-danger">Urgent</span> : (item.isTopPriority ? <span className="fw-bold text-danger">Top Priority</span> : (item.deadlineCadCam ? _global.formatDateToYYYYMMDD(item.deadlineCadCam) : "-"))}
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
                                    title="View Case"
                                  >
                                    <i class="fa-solid fa-eye"></i>
                                  </span>
                                  <span
                                    className="c-success"
                                    onClick={() => viewCase(item, "process")}
                                    title="Process Case"
                                  >
                                    <i class="fa-brands fa-squarespace"></i>
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  {/* All Assigned Cases Table (Admin Only) */}
                  {allAssignedCasesUnfiltered?.length > 0 && (
                    <>
                      <h6 className="text-primary fw-bold mb-3 mt-4">
                        <i className="fa-solid fa-list me-2"></i>
                        All Assigned Cases ({allAssignedCasesUnfiltered.length})
                      </h6>
                      <table className="table table-responsive text-center table-bordered">
                        <thead>
                          <tr className="table-secondary">
                            <th scope="col">#Case</th>
                            <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>Doctor Name {renderSortIcon("doctorName")}</th>
                            <th scope="col">Patient Name</th>
                            <th scope="col">#Unites</th>
                            <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>In {renderSortIcon("dateIn")}</th>
                            <th scope="col">Due</th>
                            <th scope="col">Deadline CadCam</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allAssignedCasesUnfiltered.map((item, index) => (
                            <tr key={item._id}
                              className={
                                item.isTopPriority ? "urgent-case animate-me" :
                                  (item.isStudy ? "bgc-study" : "") ||
                                  (item.isUrgent ? "urgent-case animate-me" : "")
                              }>
                              <td>{item.caseNumber}</td>
                              <td>{item.dentistObj?.name}</td>
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
                                {item.isUrgent ? <span className="fw-bold text-danger">Urgent</span> : (item.isTopPriority ? <span className="fw-bold text-danger">Top Priority</span> : (item.deadlineCadCam ? _global.formatDateToYYYYMMDD(item.deadlineCadCam) : "-"))}
                              </td>
                              <td>
                                <div className="actions-btns">
                                  <span
                                    className={item.isTopPriority ? "c-danger" : "c-warning"}
                                    onClick={() => togglePriority(item)}
                                    title="Top Priority"
                                  >
                                    {item.isTopPriority ? <i className="fa-solid fa-star"></i> : <i className="fa-regular fa-star"></i>}
                                  </span>
                                  <span
                                    className="c-primary"
                                    onClick={() => {
                                      setBuffCase(item);
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#scheduleModal"
                                    title="Schedule"
                                  >
                                    <i className="fa-regular fa-calendar"></i>
                                  </span>
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
                                    onClick={() => viewCase(item, "process")}
                                    title="Process Case"
                                  >
                                    <i class="fa-brands fa-squarespace"></i>
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  {assignedCases?.length <= 0 && allAssignedCasesUnfiltered?.length <= 0 && (
                    <div className="text-center">
                      <h6>No Assigned Cases</h6>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Non-Admin: Only Priority/Deadline Cases */}
                  {assignedCases?.length > 0 && (
                    <table className="table table-responsive text-center table-bordered">
                      <thead>
                        <tr className="table-secondary">
                          <th scope="col">#Case</th>
                          <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>Doctor Name {renderSortIcon("doctorName")}</th>
                          <th scope="col">Patient Name</th>
                          <th scope="col">#Unites</th>
                          <th scope="col" onClick={() => handleSort("dateIn")} style={{ cursor: "pointer" }}>In {renderSortIcon("dateIn")}</th>
                          <th scope="col">Due</th>
                          <th scope="col">Deadline CadCam</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedCases.map((item, index) => (
                          <tr key={item._id}
                            className={
                              item.isTopPriority ? "urgent-case animate-me" :
                                (item.isStudy ? "bgc-study" : "") ||
                                (item.isUrgent ? "urgent-case animate-me" : "")
                            }>
                            <td>{item.caseNumber}</td>
                            <td>{item.dentistObj?.name}</td>
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
                              {item.isUrgent ? <span className="fw-bold text-danger">Urgent</span> : (item.isTopPriority ? <span className="fw-bold text-danger">Top Priority</span> : (item.deadlineCadCam ? _global.formatDateToYYYYMMDD(item.deadlineCadCam) : "-"))}
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
                                  title="View Case"
                                >
                                  <i class="fa-solid fa-eye"></i>
                                </span>
                                <span
                                  className="c-success"
                                  onClick={() => viewCase(item, "process")}
                                  title="Process Case"
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
                  {assignedCases?.length <= 0 && (
                    <div className="text-center">
                      <h6>No Assigned Cases</h6>
                    </div>
                  )}
                </>
              )}
            </div>
            <div
              id="startCases-tab-pane"
              role="tabpanel"
              aria-labelledby="startCases-tab"
              tabIndex="1"
              className={`tab-pane fade ${activeTab === 1 ? "show active" : ""}`}
            >
              <div className="row">
                <div className="col-md-9">
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      name="searchCaseNumber"
                      className="form-control"
                      placeholder="Search by name | case number | case type "
                      onKeyDown={handleKeyDown}
                      onChange={(e) => setSearchCaseNumber(e.target.value)}
                      value={searchCaseNumber}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      id="button-addon2"
                      onClick={() => searchbyIcon()}
                    >
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <select
                    className="form-select"
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                  >
                    <option value={SEARCH_FIELDS.CASE_NUMBER}>Case Number</option>
                    <option value={SEARCH_FIELDS.DOCTOR}>Doctor</option>
                    <option value={SEARCH_FIELDS.PATIENT}>Patient</option>
                  </select>
                </div>
                {/* Start Date */}
                {/* <div className="col-lg-3 ">
                  <div className="form-group">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Select Date"
                      onChange={(e) => searchStartByDate(e)}
                    />
                  </div>
                </div> */}
                {/* <div className="col-lg-2 mb-3 print-btn">
                  <button
                    className="btn btn-sm btn-primary "
                    onClick={() => {
                      handleClick("Starting Cases");
                      handlePrint1();
                    }}
                  >
                    {" "}
                    <i class="fas fa-print"></i> print
                  </button>
                </div> */}
              </div>
              <div ref={userRef1} style={{ width: "100%" }}>
                {startCases?.length > 0 && (
                  <table className="table text-center table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">#</th>
                        <th scope="col">StartedAt</th>
                        <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>Doctor {renderSortIcon("doctorName")}</th>
                        <th scope="col">Patient</th>
                        <th scope="col">#teeth</th>
                        <th>Actions</th>
                        {/* <th scope="col">Actions</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {startCases.map((item) => (
                        <tr key={item._id} className={` c-pointer ${(item.isStudy ? "bgc-study" : "") ||
                          (item.isUrgent ? "urgent-case animate-me" : "")
                          }`}>
                          <td>{item.caseNumber}</td>
                          <td>{getStartingDate(item)}</td>
                          <td>{item?.dentistObj?.name}</td>
                          <td>{item.patientName}</td>
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
                          {/* <td>
                { (user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" || user.roles[0] ===  _global.allRoles.technician && departments[0].name === "CadCam" ||  user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&&
                    <span className="c-primary ml-3" onClick={(e) => editCase(item._id)}>
                    <i class="fas fa-edit"></i>
                    </span>
                }
                </td> */}
                          <td>
                            <div className="actions-btns">
                              <span
                                className="c-success"
                                onClick={() => viewCase(item, "process")}
                              >
                                <i class="fa-brands fa-squarespace"></i>
                              </span>
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
                            </div>
                          </td>
                        </tr>
                      ))}
                      {userData.isAdmin && (
                        <>
                          <tr>
                            <td className="f-bold c-success" colSpan={4}>
                              <b>Total of Pieces</b>
                            </td>
                            <td
                              className="bg-success p-2 text-dark bg-opacity-50"
                              colSpan={2}
                            >
                              <b>{sumOfTeethNumbersLength("Start")}</b>
                            </td>
                          </tr>
                          {((userData.isAdmin &&
                            userData.departments[0].name === "CadCam") ||
                            (userData.isAdmin &&
                              userData.departments[0].name === "Fitting")) && (
                              <tr>
                                <td className="f-bold c-success" colSpan={4}>
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
                            )}
                          <tr>
                            <td colSpan={5}>
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
              {startCases?.length <= 0 && (
                <div className="text-center">
                  <h6>No Starting Cases Yet! </h6>
                </div>
              )}
            </div>
            {/* Holding Cases */}
            <div
              className={`tab-pane fade ${activeTab === 2 ? "show active" : ""}`}
              id="holdCases-tab-pane"
              role="tabpanel"
              aria-labelledby="holdCases-tab"
              tabIndex="2"
            >
              <div className="row">
                <div className="col-7 mb-3 ">
                  <input
                    type="text"
                    name="searchTextHold"
                    className="form-control"
                    placeholder="Search by name | case number | case type "
                    value={searchTextHold}
                    onChange={(e) => searchByName(e.target.value, "Pause")}
                  />
                </div>
                <div className="col-lg-3 ">
                  <div className="form-group">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Select Date"
                      onChange={(e) => searchPauseByDate(e)}
                    />
                  </div>
                </div>
                <div className="col-2 mb-3 print-btn">
                  <button
                    className="btn btn-sm btn-primary "
                    onClick={() => {
                      handleClick("Holding Cases");
                      handlePrint2();
                    }}
                  >
                    {" "}
                    <i class="fas fa-print"></i> print
                  </button>
                </div>
              </div>
              <div ref={userRef2} style={{ width: "100%" }}>
                {pauseCases?.length > 0 && (
                  <table className="table text-center table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">#</th>
                        <th scope="col">HeldAt</th>
                        <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>Doctor {renderSortIcon("doctorName")}</th>
                        <th scope="col">Patient</th>
                        <th scope="col">Reason</th>
                        <th scope="col">#teeth</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pauseCases.map((item) => (
                        <tr
                          key={item._id}
                          className="c-pointer"
                        // onClick={() => viewCase(item, "view")}
                        >
                          <td>{item.caseNumber}</td>
                          <td>{getHoldingDate(item)}</td>
                          <td>{item?.dentistObj?.name}</td>
                          <td>{item.patientName}</td>
                          <td>{getHoldingreason(item)}</td>
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
                          <td>
                            <div className="actions-btns">
                              <span
                                className="c-success"
                                onClick={() => viewCase(item, "process")}
                              >
                                <i class="fa-brands fa-squarespace"></i>
                              </span>
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
                            </div>
                          </td>
                        </tr>
                      ))}
                      {userData.isAdmin && (
                        <>
                          <tr>
                            <td className="f-bold c-success" colSpan={5}>
                              <b>Total of Pieces</b>
                            </td>
                            <td className="bg-success p-2 text-dark bg-opacity-50" colSpan={2}>
                              <b>{sumOfTeethNumbersLength("Pause")}</b>
                            </td>
                          </tr>
                          {((userData.isAdmin &&
                            userData.departments[0].name === "CadCam") ||
                            (userData.isAdmin &&
                              userData.departments[0].name === "Fitting")) && (
                              <tr>
                                <td className="f-bold c-success" colSpan={5}>
                                  <b>Total Without Study</b>
                                </td>
                                <td className="bg-success p-2 text-dark bg-opacity-50" colSpan={2}>
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
                            <td colSpan={7}>
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
              {pauseCases?.length <= 0 && (
                <div className="text-center">
                  <h6>No pauseing Cases Yet! </h6>
                </div>
              )}
            </div>
            {/* Finished Cases */}
            <div
              className={`tab-pane fade ${activeTab === 3 ? "show active" : ""}`}
              id="endCases-tab-pane"
              role="tabpanel"
              aria-labelledby="endCases-tab"
              tabIndex="3"
            >
              <div className="row">
                {/* Search Input */}
                <div className="col-lg-6 ">
                  <div className="form-group">
                    <input
                      type="text"
                      name="searchText"
                      className="form-control"
                      placeholder="Search by name | case number | case type "
                      value={searchText}
                      onChange={(e) => searchByName(e.target.value, "End")}
                    />
                  </div>
                </div>
                {/* Start Date */}
                <div className="col-lg-3 ">
                  <div className="form-group">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Start Date"
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
                      onChange={(e) => searchByEndDate(e)}
                    />
                  </div>
                </div>
                {casesUser?.length > 0 && (
                  <div className="col-12 mb-3 print-btn">
                    <button
                      className="btn btn-sm btn-primary "
                      onClick={() => {
                        handleClick("Finished Cases");
                        handlePrint();
                      }}
                    >
                      {" "}
                      <i class="fas fa-print"></i> print
                    </button>
                  </div>
                )}
              </div>
              <div ref={userRef} style={{ width: "100%" }}>
                {casesUser?.length > 0 && (
                  <table className="table text-center table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">#</th>
                        <th scope="col">FinishedAt</th>
                        <th scope="col" onClick={() => handleSort("doctorName")} style={{ cursor: "pointer" }}>Doctor {renderSortIcon("doctorName")}</th>
                        <th scope="col">Patient</th>
                        {userData.isAdmin && <th scope="col">#teeth</th>}
                        {/* <th scope="col">Actions</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {casesUser.map((item) => (
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
                          <td>{getFinisheingDate(item)}</td>
                          <td>{item?.dentistObj?.name}</td>
                          <td>{item.patientName}</td>
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
                            <td className="f-bold c-success" colSpan={4}>
                              <b>Total of Pieces</b>
                            </td>
                            <td className="bg-success p-2 text-dark bg-opacity-50">
                              <b>{sumOfTeethNumbersLength("End")}</b>
                            </td>
                          </tr>
                          {((userData.isAdmin &&
                            userData.departments[0].name === "CadCam") ||
                            (userData.isAdmin &&
                              userData.departments[0].name === "Fitting")) && (
                              <tr>
                                <td className="f-bold c-success" colSpan={4}>
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
                            <td colSpan={5}>
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
              {casesUser?.length <= 0 && (
                <div className="text-center">
                  <h6>No have Cases </h6>
                </div>
              )}
            </div>

          </div>
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
              <h5 className="modal-title" id="scheduleModalLabel">Schedule Cases</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeScheduleModalBtn"
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
      {casesUser?.length > 0 &&
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
                {console.log('buffCase', buffCase)}
                {buffCase && <ViewCase caseModel={buffCase} />}
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
};
export default UserProfile;