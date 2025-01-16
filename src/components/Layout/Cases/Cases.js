import axios from "axios";
import { useEffect, useRef, useState } from "react";
import * as _global from "../../../config/global";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../../../helper/toaster";
import { useReactToPrint } from "react-to-print";
import SEARCH_FIELDS from "../../../enum/searchFieldEnum";
import DatePicker, { Calendar, DateObject } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
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
  const casesRefUrgent = useRef();
  const departments = JSON.parse(localStorage.getItem("departments"));
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [buffCase, setBuffCase] = useState(null);
  const [isHoldCase, setIsHoldCase] = useState(false);
  const [isUrgentCase, setIsUrgentCase] = useState(false);
  const [docotrs, seDoctors] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [inProcessCases, setInProcessCases] = useState([]);
  const [holdingCases, setHoldingCases] = useState([]);
  const [urgentCases, setUrgentCases] = useState([]);
  const [finishedCases, setFinishedCases] = useState([]);
  const [notStartCases, setNotStartCases] = useState([]);
  const [buffAllCases, setBuffAllCases] = useState([]);
  const [buffUrgentCases, setBuffUrgentCases] = useState([]);
  const [delayCases, setDelayCases] = useState([]);
  const [buffDelayCases, setBuffDelayCases] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [holdText, setHoldText] = useState("");
  const [filterBy, setFilterBy] = useState(SEARCH_FIELDS.CASE_NUMBER);
  const [values, setValues] = useState([
    new DateObject().subtract(0, "days"),
    new DateObject().add(0, "days"),
  ]);

  useEffect(() => {
    // get cases
    axios
      .get(`${_global.BASE_URL}cases/cases-by-month`)
      .then((res) => {
        const result = res.data.cases;
        const holdingCases = res.data.holdingCases
        const urgentCases = res.data.urgentCases
        setBuffUrgentCases(urgentCases)
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
              r.isHold === false
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
        setHoldingCases(holdingCases);
        setUrgentCases(urgentCases)
        console.log('Urgeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeent Cases',urgentCases)
        console.log(
          "Holding Cases",
          result.holdingCases
        );
        const delayCasesfilter = result.filter((c) => filterDaley(c));
        console.log(delayCasesfilter);
        setDelayCases(delayCasesfilter);
        setBuffDelayCases(delayCasesfilter);
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
      })
      .catch((error) => {});
  }, []);
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
          msg: ' Case is marked as urgent',
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
              r.isHold === false
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
        setHoldingCases(buffAllCases.holdingCases);
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
              r.isHold === false
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
  const editCase = (id) => {
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
  })
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
                class="nav-link active bgc-primary"
                id="allCases-tab"
                data-bs-toggle="tab"
                data-bs-target="#allCases-tab-pane"
                type="button"
                role="tab"
                aria-controls="allCases-tab-pane"
                aria-selected="false"
              >
                All <small>({allCases.length})</small>
              </button>
            </li>
            {((user.roles[0] === _global.allRoles.admin &&
              departments[0].name === "QC") ||
              user.roles[0] === _global.allRoles.Reception) && (
              <li
                class="nav-item"
                role="presentation"
                onClick={() => {
                  setSearchText("");
                  setAllCases(buffAllCases);
                }}
              >
                <button
                  class="nav-link  bgc-info"
                  id="notStart-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#notStart-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="notStart-tab-pane"
                  aria-selected="true"
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
                class="nav-link  bgc-warning"
                id="home-tab"
                data-bs-toggle="tab"
                data-bs-target="#home-tab-pane"
                type="button"
                role="tab"
                aria-controls="home-tab-pane"
                aria-selected="true"
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
                class="nav-link bgc-danger"
                id="profile-tab"
                data-bs-toggle="tab"
                data-bs-target="#profile-tab-pane"
                type="button"
                role="tab"
                aria-controls="profile-tab-pane"
                aria-selected="false"
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
                class="nav-link bgc-success"
                id="contact-tab"
                data-bs-toggle="tab"
                data-bs-target="#contact-tab-pane"
                type="button"
                role="tab"
                aria-controls="contact-tab-pane"
                aria-selected="false"
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
                class="nav-link bgc-danger"
                id="delay-tab"
                data-bs-toggle="tab"
                data-bs-target="#delay-tab-pane"
                type="button"
                role="tab"
                aria-controls="delay-tab-pane"
                aria-selected="false"
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
                class="nav-link bgc-danger_1 animate-me"
                id="urgent-tab"
                data-bs-toggle="tab"
                data-bs-target="#urgent-tab-pane"
                type="button"
                role="tab"
                aria-controls="urgent-tab-pane"
                aria-selected="false"
              >
                Urgent <small>({urgentCases?.length})</small>
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
              class="tab-pane fade show active"
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
                      onClick={()=>searchbyIcon()}
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
                      <tr role="alert"
                        className={ 
                          (item.isHold ? "table-danger" : "") || (item.isUrgent ? "urgent-case animate-me" : "") ||
                          checkCaseDate(item)
                        }
                        key={item._id}
                      >
                        <td >
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
                            >
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span
                              className="c-success"
                              onClick={() => viewCase(item, "process")}
                            >
                              <i class="fa-brands fa-squarespace"></i>
                            </span>
                            {user.firstName == "Fake" && (
                              <span onClick={(e) => deleteCase(item._id)}>
                                <i className="fa-solid fa-trash-can"></i>
                              </span>
                            )}
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
                              <span
                                className="c-primary ml-3"
                                onClick={(e) => editCase(item._id)}
                              >
                                <i class="fas fa-edit"></i>
                              </span>
                            )}
                            {(!item.isUrgent && 
                               (
                                // user.roles[0] === _global.allRoles.admin ||
                                (user.roles[0] === _global.allRoles.Reception ||
                                  (user.roles[0] === _global.allRoles.technician && user.lastName === "Jamous")) ||
                                user.roles[0] ===
                                  _global.allRoles.receptionPacking) && 
                                       <span
                                  data-bs-toggle="modal"
                                  data-bs-target="#caseUrgentModal"
                                  onClick={() => {
                                    setIsUrgentCase(true);
                                    setBuffCase(item);
                                  }}
                                >
                                  <span className="c-danger" >
                                 <i class="far fa-calendar-check"></i>
                                  </span>
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
              class="tab-pane fade "
              id="notStart-tab-pane"
              role="tabpanel"
              aria-labelledby="notStart-tab"
              tabIndex="0"
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
              {notStartCases.length <= 0 && (
                <div className="no-content">No Cases Not Start yet!</div>
              )}
            </div>
            {/* In Process */}
            <div
              class="tab-pane fade "
              id="home-tab-pane"
              role="tabpanel"
              aria-labelledby="home-tab"
              tabIndex="0"
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
              class="tab-pane fade"
              id="profile-tab-pane"
              role="tabpanel"
              aria-labelledby="profile-tab"
              tabIndex="0"
            >
              <div
                class="tab-pane fade show active"
                id="home-tab-pane"
                role="tabpanel"
                aria-labelledby="home-tab"
                tabIndex="0"
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
              id="contact-tab-pane"
              role="tabpanel"
              aria-labelledby="contact-tab"
              tabIndex="0"
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
                class="tab-pane fade"
                id="delay-tab-pane"
                role="tabpanel"
                aria-labelledby="delay-tab"
                tabIndex="0"
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
              class="tab-pane fade"
              id="urgent-tab-pane"
              role="tabpanel"
              aria-labelledby="urgent-tab"
              tabIndex="0"
            >
             {urgentCases.length > 0 && <div className="row">
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
              <button className="btn btn-sm btn-primary w-100 p-2" onClick={()=>handlePrintUrgentCases()}> <i class="fas fa-print"></i> print</button>
              </div>
              </div>
            }
              {urgentCases.length > 0 && (
                <table className="table text-center table-bordered" ref={casesRefUrgent}>
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#Case</th>
                      <th scope="col">Doctor Name</th>
                      <th scope="col">Patient Name</th>
                      <th  scope="col">
                        #tooth
                      </th>
                      {/* <th scope="col">Type</th> */}
                      <th scope="col">In</th>
                      <th scope="col">Due</th>
                      <th scope="col" className="td-phone">Actions</th>
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
                                (user.roles[0] === _global.allRoles.technician && user.lastName === "Jamous"))&& (
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
                              )}
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

          </div>
        </div>
      </div>
      {/* Modal Hold Case */}
      <div
        class="modal fade"
        id="caseHoldModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
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
        tabindex="-1"
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
                Are you sure this case is marked as {" "} 
                  {isUrgentCase ? <span>Urgent</span> : <span> Non-Urgent</span>} ?
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
                    Case By {" "}
                    {item.name} in {" "}
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
        tabindex="-1"
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
    </div>
  );
};
export default Cases;
