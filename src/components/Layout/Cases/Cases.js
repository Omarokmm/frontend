import axios from "axios";
import { useEffect, useState } from "react";
import * as _global from "../../../config/global";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../../../helper/toaster";
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

const Cases = ()=>{
  const departments = JSON.parse(localStorage.getItem("departments"))
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate();
  const [buffCase, setBuffCase] = useState(null);
  const [isHoldCase, setIsHoldCase] = useState(false);
  const [docotrs, seDoctors] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [inProcessCases, setInProcessCases] = useState([]);
  const [holdingCases, setHoldingCases] = useState([]);
  const [finishedCases, setFinishedCases] = useState([]);
  const [buffAllCases, setBuffAllCases] = useState([]);
  const [delayCases, setDelayCases] = useState([]);
  const [buffDelayCases, setBuffDelayCases] = useState([]);
  const [searchText, setSearchText] = useState([]);

  useEffect(() => {
    // get cases
    axios
      .get(`${_global.BASE_URL}cases`)
      .then((res) => {
        const result = res.data;
        setAllCases(result);
        console.log(result);
        setBuffAllCases(result);
        setFinishedCases(result.filter((r) => r.receptionPacking.status.isEnd === true));
        setInProcessCases(
          result.filter(
            (r) =>
              // r.cadCam.status.isStart === true &&
              r.delivering.status.isEnd === false
          )
        );
        setHoldingCases(result.filter((r) => r.isHold === true));
        const delayCasesfilter =  result.filter(c => filterDaley(c))
        console.log(delayCasesfilter)
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
   let logs =  [
       ...buffCase.logs,
       {
         id: user._id,
         name: `${user.firstName}, ${user.lastName}`,
         date: new Date(),
         msg: isHoldCase ? 'Hold by ' : 'UnHold by'
       },
     ]
   ;
    axios
      .put(`${_global.BASE_URL}cases/${buffCase._id}/hold/${isHoldCase}`, logs)
      .then((res) => {
        const result = res.data;
        console.log(result);
          if(isHoldCase){
              const filteredAllCases = allCases.map(item => {
          if (item._id === result._id) {
            return {
              ...item,
              isHold: true
            };
          }
          return item;
        });
        const filteredHoldCases = [result, ...holdingCases];
        setAllCases(filteredAllCases);
        setHoldingCases(filteredHoldCases);
        showToastMessage("Held Case successfully", "success");
        }
        else{
    //       const filteredAllCases = allCases.map(item => {
    //   if (item._id === result._id) {
    //     return {
    //       ...item,
    //       isHold: false
    //     };
    //   }
    //   return item;
    // });
    const filteredAllCases = allCases.map(item => {
      if (item._id === result._id) {
        return {
          ...item,
          isHold: false
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
  const viewCase = (item, type) => {
    if (type === "view") {
      navigate("/layout/view-case", { state: { ...item , type:'cases'} });
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
    if (name === "inProccess") {
      if (searchText !== "") {
        const filteredAllCases = inProcessCases.filter(
          (item) =>
            item.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setInProcessCases(filteredAllCases);
      } else {
        setInProcessCases(
          buffAllCases.filter(
            (r) =>
              r.cadCam.status.isStart === true &&
              r.ceramic.status.isEnd === false
          )
        );
      }
    }
    if (name === "holing") {
      if (searchText !== "") {
        const filteredAllCases = holdingCases.filter(
          (item) =>
            item.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setHoldingCases(filteredAllCases);
      } else {
        setHoldingCases(buffAllCases.filter((r) => r.isHold === true));
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
          buffAllCases.filter((r) => r?.ceramic?.status?.isEnd === true)
        );
      }
    }
    if (name === "delay") {
      if (searchText !== "") {
        const filteredAllCases = delayCases.filter(
          (item) =>
            item?.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.dentistObj.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase())
        );
        setDelayCases(filteredAllCases);
      } else {
        setDelayCases(buffDelayCases);
      }
    }
  };
  const editCase = (id)=>{
    navigate(`/layout/edit-case/${id}`)
  }
  const addItemToDelayCases = (item) => {
    setDelayCases(prevDelayCases => [...prevDelayCases, item]);
  };
  const filterDaley=(item)=>{
  let teethNumbersByName = groupTeethNumbersByName(item.teethNumbers)
  const days = _global.getDaysfromTowDates(item.dateIn,new Date())
  if(teethNumbersByName.length > 0){
    const implant = teethNumbersByName.find(te => te.name === "Screw Retain Crown")
    const zircon = teethNumbersByName.find(t => t.name === "Zircon")
    const veneer = teethNumbersByName.find(tee => tee.name === "Veneer")
    const emax = teethNumbersByName.find(tee => tee.name === "E-Max / Inlay/ Onlay")
    const emaxCrown = teethNumbersByName.find(tee => tee.name === "E-Max Crown")
    const study = teethNumbersByName.find(tee => tee.name === "Study")
    if(
      (implant && implant?.count >= 4 && implant?.count <= 5 && days >= 4  && !item.receptionPacking.status.isEnd) || 
      (implant && implant?.count >= 7 && days > 7 && !item.receptionPacking.status.isEnd) || 
      ((zircon && zircon?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd ) || (veneer && veneer?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd)) || 
      ((zircon && zircon?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd ) || (veneer && veneer?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd)) || 
      ((emax && emax?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd) || (emax && emax?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd) ) || 
      ((emaxCrown && emaxCrown?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd) || (emaxCrown && emaxCrown?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd)) || 
      ((study && study?.count >= 1 && days >= 3 && !item.receptionPacking.status.isEnd))
    
    ) {
      return item
    }
  }
}
  const checkCaseDate=(item)=>{
    let response = "" 
    if(user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC"){
      let teethNumbersByName = groupTeethNumbersByName(item.teethNumbers)
      const days = _global.getDaysfromTowDates(item.dateIn,new Date())
      if(teethNumbersByName.length > 0){
        const implant = teethNumbersByName.find(te => te.name === "Screw Retain Crown")
        const zircon = teethNumbersByName.find(t => t.name === "Zircon")
        const veneer = teethNumbersByName.find(tee => tee.name === "Veneer")
        const emax = teethNumbersByName.find(tee => tee.name === "E-Max / Inlay/ Onlay")
        const emaxCrown = teethNumbersByName.find(tee => tee.name === "E-Max Crown")
        const study = teethNumbersByName.find(tee => tee.name === "Study")
        if(implant && implant?.count >= 4 && implant?.count <= 5 && days >= 4  && !item.receptionPacking.status.isEnd) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if(implant && implant?.count >= 7 && days > 7 && !item.receptionPacking.status.isEnd) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if((zircon && zircon?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd ) || (veneer && veneer?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd) ) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if((zircon && zircon?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd ) || (veneer && veneer?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd) ) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if((emax && emax?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd) || (emax && emax?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd)) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if((emaxCrown && emaxCrown?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd) || (emaxCrown && emaxCrown?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd)) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
        if((study && study?.count >= 1 && days >= 3 && !item.receptionPacking.status.isEnd)) {
          response = "table-danger";
          // addItemToDelayCases(item)
        }
      }
    }
    else if(user.roles[0] ===  _global.allRoles.technician && departments[0].name === "CadCam" && !item.cadCam.status.isEnd){
      response = "table-warning"
    }
    else if(user.roles[0] ===  _global.allRoles.Reception && departments[0].name === "Reception" && item.receptionPacking.status.isEnd && !item.delivering.status.isEnd){
      response = "table-success"
    }

  return response ; 
  }
  function groupTeethNumbersByName(teethNumbers) {
    const result = {};
    teethNumbers.forEach(teethNumber => {
      const { name } = teethNumber;
      if (!result[name]) {
        result[name] = 0;
      }
  
      result[name]++;
    });
    return Object.entries(result).map(([name, count]) => ({ name, count }));
  }
  const getReasonlate=(item)=>{
  let msg = "" 
  let teethNumbersByName = groupTeethNumbersByName(item.teethNumbers)
  const days = _global.getDaysfromTowDates(item.dateIn,new Date())
  if(teethNumbersByName.length > 0){
    const implant = teethNumbersByName.find(te => te.name === "Screw Retain Crown")
    const zircon = teethNumbersByName.find(t => t.name === "Zircon")
    const veneer = teethNumbersByName.find(tee => tee.name === "Veneer")
    const emax = teethNumbersByName.find(tee => tee.name === "E-Max / Inlay/ Onlay")
    const emaxCrown = teethNumbersByName.find(tee => tee.name === "E-Max Crown")
    const study = teethNumbersByName.find(tee => tee.name === "Study")
    if(implant && implant?.count >= 4 && implant?.count <= 5 && days >= 4  ) {
      msg = "4,5 unites implants and more than 4 days";
    }
    if(implant && implant?.count >= 7 && days > 7  ) {
      msg = "more than 7 unites implants and more than 7 days";
    }
    if(zircon && zircon?.count === 4 && days > 3) {
      msg = "4 unites Zircon and more than 3 days";
    }
    if(zircon && zircon?.count > 4 && days > 7) {
      msg = "more than 4 unites Zircon and more than 7 days";
    }
    if(veneer && veneer?.count === 4 && days > 3) {
      msg = "4 unites Veneer and more than 3 days";
    }
    if(veneer && veneer?.count > 4 && days > 7) {
      msg = "more than 4 unites Veneer and more than 7 days";
    }
    if(emax && emax?.count === 4 && days > 3) {
      msg = "4 unites E-Max / Inlay/ Onlay and more than 3 days";
    }
    if(emax && emax?.count > 4 && days > 7) {
      msg = "more than 4 unites E-Max / Inlay/ Onlay and more than 7 days";
    }
    if(emaxCrown && emaxCrown?.count === 4 && days > 3) {
      msg = "4 unites Emax Crown and more than 3 days";
    }
    if(emaxCrown && emaxCrown?.count > 4 && days > 7) {
      msg = "more than 4 unites Emax Crown and more than 7 days";
    }
    if((study && study?.count >= 1 && days >= 3 )) {
      msg = "study and more than 3 days";
    }
  }
  return msg ; 
  }
  return (
    <div className="content">
      <div className="card">
        <h5 class="card-title">
          <span>Cases</span>
          <span className="add-user-icon">
            {(user.roles[0] === _global.allRoles.admin || user.lastName === "Jamous") && 
            <span onClick={() => navigate("/layout/add-case")}>
              {" "}
              <i class="fa-solid fa-circle-plus "></i>
            </span>
            }
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
                Holding <small>({holdingCases.length})</small>
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
              <div className="form-group">
                <input
                  type="text"
                  name="searchText"
                  className="form-control"
                  placeholder="Search by name | case number | case type "
                  value={searchText}
                  onChange={(e) => searchByName(e.target.value, "allCases")}
                />
              </div>
              {allCases.length > 0 && (
                <table className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">#</th>
                      <th scope="col">Doctor </th>
                      <th scope="col">Patient</th>
                      <th className="td-phone" scope="col">#tooth</th>
                      <th scope="col">In</th>
                      <th scope="col">Due</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCases.map((item, index) => (
                      <tr
                        className={(item.isHold? "table-danger" : "" ) || checkCaseDate(item)}
                        key={item._id}
                      >
                        <td>
                          <span data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title={getReasonlate(item)}>{item.caseNumber}
                          </span></td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        <td  className={`${item.teethNumbers.length <=0 ? "bg-danger" : "bg-white"} td-phone`}>{item.teethNumbers.length}</td>
                        {/* <td>{item.caseType}</td> */}
                        <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                        <td>{item.dateOut && _global.formatDateToYYYYMMDD(item.dateOut)} 
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
                            {!item.isHold &&
                              user.roles[0] === _global.allRoles.admin && (
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
                            {/* { (user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" || user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&& */}
                            { (user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" ||  user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&&
                            <span className="c-primary ml-3" onClick={(e) => editCase(item._id)}>
                            <i class="fas fa-edit"></i>
                            </span>
                           }
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
                      <tr key={item._id}>
                        <td>{item.caseNumber}</td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        {/* <td>{item.caseType}</td> */}
                        <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                        <td>{item.dateOut && _global.formatDateToYYYYMMDD(item.dateOut)}</td>
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
                           { (user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" || user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&&
                            <span className="c-primary" onClick={(e) => editCase(item._id)}>
                            <i class="fas fa-edit"></i>
                            </span>
                           }
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
                          <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                          <td>{item.dateOut && _global.formatDateToYYYYMMDD(item.dateOut)}</td>
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
                              {user.roles[0] === _global.allRoles.admin && (
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
                        <td>{item.dateOut && _global.formatDateToYYYYMMDD(item.dateOut)}</td>
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
                      <tr key={item._id} className={(item.isHold? "table-danger" : "" ) || checkCaseDate(item)}>
                        <td data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title={getReasonlate(item)}>{item.caseNumber}</td>
                        <td>{item.dentistObj.name}</td>
                        <td>{item.patientName}</td>
                        {/* <td>{item.caseType}</td> */}
                        <td>{_global.formatDateToYYYYMMDD(item.dateIn)}</td>
                        <td>{item.dateOut && _global.formatDateToYYYYMMDD(item.dateOut)}</td>
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
              {delayCases.length <= 0 && (
                <div className="no-content">No Cases Delay Cases yet!</div>
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
              <div className="text-center">
                <h6>
                  Are you sure from{" "}
                  {isHoldCase ? <span>Hold</span> : <span> UnHold</span>} this
                  case?
                </h6>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm bg-light" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
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
    </div>
  );
}
export default Cases;