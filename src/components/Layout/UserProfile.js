import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as _global from "../../config/global";
import ReactToPrint, { useReactToPrint } from "react-to-print";
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
  const [userData, setUserData] = useState(state ? state : user);
  const [searchText, setSearchText] = useState("");
  const [searchTextStart, setSearchTextStart] = useState("");
  const [searchTextHold, setSearchTextHold] = useState("");
  const [studyModel, setStudyModel] = useState({});
  const [printText, setPrintText] = useState("");
  const [startDate, setStartDat] = useState(new Date());
  const [pauseDate, setPauseDate] = useState(new Date());
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
        // Cases Ended
        setCasesUser(sortCases(result.casesEnd));
        setBuffCasesUser(sortCases(result.casesEnd));
        console.log("hloding", result);
        // Starting Cases
        if (
          userData.isAdmin
            ? userData.departments[0].name === "CadCam"
            : departments[0].name === "CadCam"
        ) {
          setStartCases(
            result.casesStart.filter(
              (item) =>
                !item.isHold && // Ensure isHold is false
                item.cadCam.actions.length > 0 && // Ensure actions array is not empty
                item.cadCam.actions[item.cadCam.actions.length - 1].prfeix ===
                  "start" && // Ensure last action's prfeix is "start"
                !item.cadCam.status.isStart // Ensure status isStart is false
            )
          );
          setBuffStartingCasesUser(
            result.casesStart.filter(
              (item) =>
                !item.isHold && // Ensure isHold is false
                item.cadCam.actions.length > 0 && // Ensure actions array is not empty
                item.cadCam.actions[item.cadCam.actions.length - 1].prfeix ===
                  "start" && // Ensure last action's prfeix is "start"
                !item.cadCam.status.isStart // Ensure status isStart is false
            )
          );
          // Pauseing Cases
          setPauseCases(result.casesHolding);
          setBuffCasesHoldingUser(result.casesHolding);
        } else {
          setStartCases(result.casesStart);
          setBuffStartingCasesUser(result.casesStart);
          // Pauseing Cases
          console.log("pausing", result.casesPause);
          setPauseCases(result.casesPause);
          setBuffCasesHoldingUser(result.casesPause);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);
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
        console.log("FITTING CAD CAM");
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
  return (
    <div className="content user-profile">
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
                   className={`nav-link bgc-primary ${activeTab === 0 ? "active " : ""}`}      
                  id="startCases-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#startCases-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="startCases-tab-pane"
                  onClick={() => {
                    handleTabChange(0)
                    searchByName("", "Start")
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
                  className={`nav-link bgc-danger ${activeTab === 1 ? "active " : ""}`}     
                  id="holdCases-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#holdCases-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="holdCases-tab-pane"
                  aria-selected="true"
                  onClick={() => {
                    handleTabChange(1)
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
                  className={`nav-link bgc-success ${activeTab === 2 ? "active " : ""}`}     
                  id="endCases-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#endCases-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="endCases-tab-pane"
                  aria-selected="true"
                  onClick={() => {
                    handleTabChange(2)
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
            }}
          >
            <div
              id="startCases-tab-pane"
              role="tabpanel"
              aria-labelledby="startCases-tab"
              tabIndex="0"
              className={`tab-pane fade ${activeTab === 0 ? "show active" : ""}`}
            >
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
                      onChange={(e) => searchStartByDate(e)}
                    />
                  </div>
                </div>
                <div className="col-lg-2 mb-3 print-btn">
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
                </div>
              </div>
              <div ref={userRef1} style={{ width: "100%" }}>
                {startCases?.length > 0 && (
                  <table className="table text-center table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">#</th>
                        <th scope="col">StartedAt</th>
                        <th scope="col">Doctor</th>
                        <th scope="col">Patient</th>
                        <th scope="col">#teeth</th>
                        <th>Actions</th>
                        {/* <th scope="col">Actions</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {startCases.map((item) => (
                        <tr key={item._id} className="c-pointer">
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
                                onClick={() => viewCase(item, "view")}
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
              className={`tab-pane fade ${activeTab === 1 ? "show active" : ""}`}
              id="holdCases-tab-pane"
              role="tabpanel"
              aria-labelledby="holdCases-tab"
              tabIndex="0"
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
                        <th scope="col">Doctor</th>
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
                          onClick={() => viewCase(item, "view")}
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
                                onClick={() => viewCase(item, "view")}
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
              className={`tab-pane fade ${activeTab === 2 ? "show active" : ""}`}
              id="endCases-tab-pane"
              role="tabpanel"
              aria-labelledby="endCases-tab"
              tabIndex="0"
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
                        <th scope="col">Doctor</th>
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
                          onClick={() => viewCase(item, "view")}
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
    </div>
  );
};
export default UserProfile;
