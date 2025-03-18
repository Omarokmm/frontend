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
  const [holdingCases, setHoldingCases] = useState([]);
  const [holdingBuffCases, setHoldingBuffCases] = useState([]);
  const [urgentCases, setUrgentCases] = useState([]);
  const [studyCases, setStudyCases] = useState([]);
  const [finishedCases, setFinishedCases] = useState([]);
  const [notStartCases, setNotStartCases] = useState([]);
  const [buffAllCases, setBuffAllCases] = useState([]);
  const [buffUrgentCases, setBuffUrgentCases] = useState([]);
  const [buffStudyCases, setBuffStudyCases] = useState([]);
  const [delayCases, setDelayCases] = useState([]);
  const [packingCases, setPackingCases] = useState([]);
  const [redoCases, setRedoCases] = useState([]);
  const [redoBuffCases, setRedobuffCases] = useState([]);
  const [buffPackingCases, setBuffPackingCases] = useState([]);
  const [forWorkCases, setForWorkCases] = useState([]);
  const [buffForWorkCases, setBuffForWorkCases] = useState([]);
  const [buffDelayCases, setBuffDelayCases] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [holdText, setHoldText] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [filterBy, setFilterBy] = useState(SEARCH_FIELDS.CASE_NUMBER);
  const [values, setValues] = useState([
    new DateObject().subtract(0, "days"),
    new DateObject().add(0, "days"),
  ]);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => {
    // get cases
    axios
      .get(`${_global.BASE_URL}cases/cases-by-month`)
      .then((res) => {
        const result = res.data.cases;
        const holdingCases = res.data.holdingCases;
        const urgentCases = res.data.urgentCases;
        const redoCases = res.data.redoCases;
        const studyCases = res.data.studyCases.filter(
          (s) => s.cadCam.actions.length <= 0
        );
        setBuffUrgentCases(urgentCases);
        setRedoCases(redoCases);
        setRedobuffCases(redoCases);
        setBuffStudyCases(studyCases.filter((s) => !s.isHold));
        setAllCases(result);
        console.log(result);
        setBuffAllCases(result);
        setFinishedCases(
          result.filter((r) => r.delivering.status.isEnd === true)
        );
        const packingCasesbuff = result.filter(
          (r) =>
            r.receptionPacking.status.isEnd === true &&
            r.delivering.status.isEnd === false
        );
        console.log("packingCasesbuff", packingCasesbuff);
        setPackingCases(_global.groupAndSortCases(packingCasesbuff));
        setBuffPackingCases(_global.groupAndSortCases(packingCasesbuff));
        // console.log('packingCases',packingCases)
        // && r.delivering.status.isEnd === false
        setNotStartCases(
          result.filter(
            (r) =>
              r.cadCam.actions.length <= 0 &&
              r.delivering.status.isEnd === false &&
              r.delivering.status.isEnd === false &&
              r.isHold === false &&
              r.isStudy === false
          )
        );
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
          result.filter(
            (r) =>
              // r.cadCam.status.isStart === true &&
              r.delivering.status.isEnd === false &&
              r.isHold === false &&
              r.cadCam.actions.length > 0
          )
        );
        setHoldingCases(holdingCases);
        setHoldingBuffCases(holdingCases);
        setUrgentCases(urgentCases);
        setStudyCases(studyCases.filter((s) => !s.isHold));
        console.log("Holding Cases", result.holdingCases);
        const delayCasesfilter = result.filter((c) => filterDaley(c));
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
            setForWorkCases(
              getClinicsWithActiveCasesNotStart(
                resultClinics,
                result.filter(
                  (r) =>
                    r.cadCam.actions.length <= 0 &&
                    r.delivering.status.isEnd === false &&
                    r.delivering.status.isEnd === false &&
                    r.isHold === false &&
                    r.isStudy === false
                )
              )
            );
            console.log(
              "ForWork",
              getClinicsWithActiveCasesNotStart(
                resultClinics,
                result.filter(
                  (r) =>
                    r.cadCam.actions.length <= 0 &&
                    r.delivering.status.isEnd === false &&
                    r.delivering.status.isEnd === false &&
                    r.isHold === false &&
                    r.isStudy === false
                )
              )
            );
          })
          .catch((error) => {});
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
      .catch((error) => {});
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
        .then((res) => {})
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
  const viewCase = (item, type) => {
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
          buffAllCases.filter(
            (r) =>
              // r.cadCam.status.isStart === true &&
              r.delivering.status.isEnd === false &&
              r.isHold === false &&
              r.cadCam.actions.length > 0
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
        setDelayCases(buffAllCases.filter((c) => filterDaley(c)));
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
        setRedoCases(
          redoBuffCases
        );
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
        .catch((error) => {});
    } else {
      setAllCases(buffAllCases);
    }
  };
  const getCasesByRangeDate = () => {
    axios
      .get(
        `${
          _global.BASE_URL
        }cases/cases-by-month?startDate=${values[0].format()}&endDate=${
          values[1] ? values[1].format() : values[0].format()
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
          result.filter(
            (r) =>
              r.cadCam.actions.length <= 0 &&
              r.delivering.status.isEnd === false &&
              r.delivering.status.isEnd === false &&
              r.isHold === false &&
              r.isStudy === false
          )
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
          result.filter(
            (r) =>
              // r.cadCam.status.isStart === true &&
              r.delivering.status.isEnd === false &&
              r.isHold === false &&
              r.cadCam.actions.length > 0
          )
        );
        setHoldingCases(result.filter((r) => r.isHold === true));
        console.log(
          "Holding Cases",
          result.filter((r) => r.isHold === true)
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
  const editCase = (id,isRedo) => {
    // navigate(`/layout/edit-case/${id}`);
    navigate(`/layout/edit-case/${id}`, { state: { isRedo: isRedo } });
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
              !caseItem.ceramic?.status?.isEnd
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
  const getClinicsWithActiveCasesNotStart = (clinics, cases) => {
    console.log("casesNOTSTART", cases, clinics);
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
    }
    else if (type === "redo") {
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
    }
    else if (type === "redo") {
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
                className={`nav-link bgc-primary ${
                  activeTab === 0 ? "active " : ""
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
              user.roles[0] === _global.allRoles.Reception ||  user.lastName === "Jamous")  && (
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
                  className={`nav-link bgc-info ${
                    activeTab === 1 ? "active " : ""
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
            <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                id="home-tab"
                className={`nav-link bgc-warning ${
                  activeTab === 2 ? "active bgc-warning" : ""
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
                className={`nav-link bgc-danger ${
                  activeTab === 3 ? "active " : ""
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
            <li
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
            </li>
            <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                // class="nav-link bgc-danger"
                className={`nav-link bgc-danger ${
                  activeTab === 5 ? "active " : ""
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
                className={`nav-link animate-me bgc-danger_1 ${
                  activeTab === 6 ? "active  " : ""
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
                className={`nav-link bgc-study ${
                  activeTab === 7 ? "active  " : ""
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
                className={`nav-link bgc-primary ${
                  activeTab === 8 ? "active  " : ""
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
                className={`nav-link bgc-work ${
                  activeTab === 9 ? "active  " : ""
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
                className={`nav-link text-bg-success ${
                  activeTab === 10 ? "active  " : ""
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
            <li
              class="nav-item"
              role="redo"
              onClick={() => setSearchText("")}
            >
              <button
                className={`nav-link bgc-redo ${
                  activeTab === 10 ? "active  " : ""
                }`}
                id="redo-tab"
                data-bs-toggle="tab"
                data-bs-target="#redo-tab-pane"
                type="button"
                role="tab"
                aria-controls="redo-tab-pane"
                aria-selected={activeTab === 11}
                onClick={() => handleTabChange(11)}
              >
                Redo <small>({redoCases?.length})</small>
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
              className={`tab-pane  fade ${
                activeTab === 0 ? "show active" : ""
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
                <table className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      {(user.roles[0] === _global.allRoles.admin ||
                        user.lastName === "Jamous") && (
                        <th scope="col">
                          <span onClick={() => printSelectedItems()}>
                            <i class="fas fa-print"></i>
                          </span>
                        </th>
                      )}
                      <th scope="col">#</th>
                      <th scope="col">Doctor </th>
                      <th scope="col">Patient</th>
                      <th className="td-phone" scope="col">
                        #tooth
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
                        <td
                          className={`${
                            item.teethNumbers.length <= 0
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
                              onClick={() => viewCase(item, "view")}
                              // data-bs-toggle="modal"
                              // data-bs-target="#viewModal"
                              // onClick={() => {
                              //   setBuffCase(item);
                              // }}
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCase(item, "process")}
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
                                onClick={(e) => editCase(item._id,false)}
                              >
                                <i class="fas fa-edit"></i>
                              </span>
                                   <span
                                   className="c-success"
                                   onClick={(e) => editCase(item._id,true)}
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
                            {(user.firstName === "Fake" || (user.roles[0] === _global.allRoles.technician &&
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
              className={`tab-pane fade ${
                activeTab === 1 ? "show active" : ""
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
              {notStartCases.length > 0 && (
                <table className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col">Doctor Name</th>
                      <th scope="col">Patient Name</th>
                      {/* <th scope="col">Type</th> */}
                      <th className="td-phone" scope="col">
                        #tooth
                      </th>
                      <th scope="col">In</th>
                      <th scope="col">Due</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notStartCases.map((item, index) => (
                      <tr key={item._id} className={checkNotStartDelay(item)}>
                        <td>{item.caseNumber}</td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        {/* <td>{item.caseType}</td> */}
                        <td
                          className={`${
                            item.teethNumbers.length <= 0
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
                              onClick={() => viewCase(item, "view")}
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCase(item, "process")}
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
                            {((user.roles[0] === _global.allRoles.technician &&
                              user.lastName === "Jamous") ||
                              (user.roles[0] === _global.allRoles.admin &&
                                departments[0].name === "QC")) && (
                              <span
                                className="c-primary"
                                onClick={(e) => editCase(item._id,false)}
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
            {/* In Process */}
            <div
              // class="tab-pane fade "
              className={`tab-pane fade ${
                activeTab === 2 ? "show active" : ""
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
                <table className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col">Doctor Name</th>
                      <th scope="col">Patient Name</th>
                      {/* <th scope="col">Type</th> */}
                      <th scope="col">In</th>
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
                              onClick={() => viewCase(item, "view")}
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCase(item, "process")}
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
                            {((user.roles[0] === _global.allRoles.technician &&
                              user.lastName === "Jamous") ||
                              (user.roles[0] === _global.allRoles.admin &&
                                departments[0].name === "QC")) && (
                              <span
                                className="c-primary"
                                onClick={(e) => editCase(item._id,false)}
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
              className={`tab-pane fade ${
                activeTab === 3 ? "show active" : ""
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
                  <table className="table text-center table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">#Case</th>
                        <th scope="col">Doctor Name</th>
                        <th scope="col">Patient Name</th>
                        {/* <th scope="col">Type</th> */}
                        <th className="td-phone" scope="col">
                          #tooth
                        </th>
                        <th scope="col">In</th>
                        <th scope="col">Due</th>
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
                            className={`${
                              item.teethNumbers.length <= 0
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
                                onClick={() => viewCase(item, "view")}
                              >
                                <i class="fa-solid fa-eye"></i>
                              </span>
                              <span
                                className="c-success"
                                onClick={() => viewCase(item, "process")}
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
            <div
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
                <table className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col">Doctor Name</th>
                      <th scope="col">Patient Name</th>
                      {/* <th scope="col">Type</th> */}
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
                              onClick={() => viewCase(item, "view")}
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCase(item, "process")}
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
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
              {finishedCases.length <= 0 && (
                <div className="no-content">No Cases Finished yet!</div>
              )}
            </div>
            {/* In Delay */}
            {((user.roles[0] === _global.allRoles.admin &&
              departments[0].name === "QC") ||
              user.roles[0] === _global.allRoles.Reception) && (
              <div
                // class="tab-pane fade"
                className={`tab-pane fade ${
                  activeTab === 5 ? "show active" : ""
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
                    <table className="table text-center table-bordered">
                      <thead>
                        <tr className="table-secondary">
                          <th scope="col">#Case</th>
                          <th scope="col">Doctor Name</th>
                          <th scope="col">Patient Name</th>
                          {/* <th scope="col">Type</th> */}
                          <th scope="col">In</th>
                          <th scope="col">Due</th>
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
                            <td>
                              <div className="actions-btns non-print">
                                <span
                                  className="c-success"
                                  onClick={() => viewCase(item, "view")}
                                >
                                  <i class="fa-solid fa-eye"></i>
                                </span>
                                <span
                                  className="c-success"
                                  onClick={() => viewCase(item, "process")}
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
              className={`tab-pane fade ${
                activeTab === 6 ? "show active" : ""
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
                  className="table text-center table-bordered"
                  ref={casesRefUrgent}
                >
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col">Doctor Name</th>
                      <th scope="col">Patient Name</th>
                      <th scope="col">#tooth</th>
                      {/* <th scope="col">Type</th> */}
                      <th scope="col">In</th>
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
                          className={`${
                            item.teethNumbers.length <= 0
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
                              onClick={() => viewCase(item, "view")}
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCase(item, "process")}
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
              className={`tab-pane fade ${
                activeTab === 7 ? "show active" : ""
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
              {studyCases.length > 0 && (
                <table className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col">Doctor Name</th>
                      <th scope="col">Patient Name</th>
                      <th scope="col">#tooth</th>
                      {/* <th scope="col">Type</th> */}
                      <th scope="col">In</th>
                      <th scope="col">Due</th>
                      <th scope="col" className="td-phone">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {studyCases.map((item, index) => (
                      <tr key={item._id}>
                        <td>{item.caseNumber}</td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        <td
                          className={`${
                            item.teethNumbers.length <= 0
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
                              onClick={() => viewCase(item, "view")}
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCase(item, "process")}
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
              className={`tab-pane fade ${
                activeTab === 8 ? "show active" : ""
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
                <table className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col">Doctor Name</th>
                      <th scope="col">Patient Name</th>
                      <th scope="col">#tooth</th>
                      {/* <th scope="col">Type</th> */}
                      <th scope="col">In</th>
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
                          className={`${
                            item.teethNumbers.length <= 0
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
                              onClick={() => viewCase(item, "view")}
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCase(item, "process")}
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
              className={`tab-pane fade ${
                activeTab === 9 ? "show active" : ""
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
                <table className="table shipping-table  table-bordered">
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
                          <table className="table working-table  table-bordered">
                            <thead>
                              <tr className="table-info">
                                <th scope="col">#</th>
                                <th scope="col">Dr.Name</th>
                                <th scope="col">Pt.Name</th>
                                <th scope="col">DateIn</th>
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
                                          className={`${
                                            caseItem?.teethNumbers?.length <= 0
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
              className={`tab-pane fade ${
                activeTab === 10 ? "show active" : ""
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
                  <table className="table shipping-table  table-bordered">
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
                                    ${
                                      caseItem.isUrgent ? "text-bg-danger" : ""
                                    } 
                                    ${caseItem.isStudy ? "bgc-study" : ""}`}
                                    key={caseItem._id}
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
                            {item.allClinicCases?.cadCamCases?.length > 0 ? (
                              item.allClinicCases.cadCamCases.map(
                                (caseItem) => (
                                  <div
                                    className={`case-item-shipment ${
                                      caseItem.isUrgent ? "text-bg-danger" : ""
                                    }`}
                                    key={caseItem._id}
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
                                    className={`case-item-shipment ${
                                      caseItem.isUrgent ? "text-bg-danger" : ""
                                    }`}
                                    key={caseItem._id}
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
                                    className={`case-item-shipment ${
                                      caseItem.isUrgent ? "text-bg-danger" : ""
                                    }`}
                                    key={caseItem._id}
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
                                    className={`case-item-shipment ${
                                      caseItem.isUrgent ? "text-bg-danger" : ""
                                    }`}
                                    key={caseItem._id}
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
              className={`tab-pane fade ${
                activeTab === 11 ? "show active" : ""
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
                {redoCases.length > 0 && (
                  <table className="table text-center table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">#Case</th>
                        <th scope="col">Doctor Name</th>
                        <th scope="col">Patient Name</th>
                        {/* <th scope="col">Type</th> */}
                        <th className="td-phone" scope="col">
                          #tooth
                        </th>
                        <th scope="col">In</th>
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
                            className={`${
                              item.teethNumbers.length <= 0
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
                                onClick={() => viewCase(item, "view")}
                              >
                                <i class="fa-solid fa-eye"></i>
                              </span>
                              <span
                                className="c-success"
                                onClick={() => viewCase(item, "process")}
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
                {redoCases.length <= 0 && (
                  <div className="no-content">No Cases Redo yet!</div>
                )}
              </div>
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
              class={`modal-header  text-white ${
                isHoldCase ? "bg-danger" : "bg-success"
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
              class={`modal-header  text-white ${
                isUrgentCase ? "bg-danger" : "bg-success"
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
      {/* {allCases.length > 0 &&
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
              {console.log('buffCase',buffCase)}
            <ViewCase caseModel={buffCase} />
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
                className={`box border border-black card px-3 min-vh-50 ${
                  item.isUrgent ? "bgc-print-danger" : ""
                }`}
              >
                {/* <div className="d-flex justify-content-center align-items-center mb-0 mt-2">
                  <h5 className="border p-2 border-success  rounded">
                    {item.caseNumber}
                  </h5>
              </div> */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="f-18">
                    <b>Contry: </b>{" "}
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
                        class="form-check-input"
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
                      className={`${
                        item.isUrgent ? "border border-danger rounded p-1" : ""
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
                    _________ <span>Date</span>____________
                  </span>
                </div>
                <div className="mb-3 f-18">
                  <b>Fitting: </b>{" "}
                  <span>
                    {" "}
                    ___________ <span>Date</span>____________
                  </span>
                </div>
                <div className="mb-3 f-18">
                  <b>Ceramic: </b>{" "}
                  <span>
                    {" "}
                    _________ <span>Date</span>____________
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2 f-18">
                  <div class="form-check">
                    <input
                      class="form-check-input"
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
                      class="form-check-input"
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
                      class="form-check-input"
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
                      class="form-check-input"
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
                  {/* <small>
                    Patient Name: Yaimet Prieto Doctor: Dr. Laura Pérez Case
                    Type: Lower Final Impression & Upper and Lower Provisionals
                    Please use the following shade selection: Cervical OM3 and
                    Body OM2. Please Incorporate high translucency for a very
                    natural and refined look. Ensure well-defined mamelons with
                    detailed surface textures. Maintain open embrasures for a
                    clean and elegant finish. For the lowers, ensure the 4
                    central incisors are slightly longer than the canines.
                    Alternatively, adjust to make the central incisors just
                    slightly shorter, or match the length of the canines evenly,
                    depending on the final aesthetics. Pay close attention to
                    adjustments made from the mock-up to provisionals for
                    symmetry, adjustments, and proper sizing to match the
                    desired look. Additionally, tooth #9 has an unfavorable prep
                    shade, so please block out the color during porcelain
                    application. Prioritize natural transitions and harmony with
                    the mock-up. The overall style preference is Duval-style
                    embrassures, translucency and natural design. Thank you for
                    your attention to detail and craftsmanship. Let me know if
                    you have any questions! Dr. Laura Perez
                  </small> */}
                  <br />
                  <br />
                  <br />
                </div>
                <div className="d-flex justify-content-between gap-3 align-items-center mb-2 f-18">
                  <div class="form-check">
                    <input
                      class="form-check-input"
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
                      class="form-check-input"
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
                      class="form-check-input"
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
                      class="form-check-input"
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
                      class="form-check-input"
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
    </div>
  );
};
export default Cases;
