import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as _global from "../../config/global";
import axios from "axios";

const DocotrCases = ()=> {
    const departments = JSON.parse(localStorage.getItem("departments"))
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const {state} = useLocation()
    const [allCases, setAllCases] = useState([]);
    const [inProcessCases, setInProcessCases] = useState([]);
    const [finishedCases, setFinishedCases] = useState([]);
    const [buffAllCases, setBuffAllCases] = useState([]);
    const [notStartCases, setNotStartCases] = useState([]);
    const [searchText, setSearchText] = useState([]);
  const [buffCase, setBuffCase] = useState(null);

    console.log(state)
    const [doctorCases,setDoctorCases] = useState()
    useEffect(() => {
        // get cases
        axios
          .get(`${_global.BASE_URL}doctors/casesbydoctor/${state._id}`)
          .then((res) => {
            const result = res.data;
            console.log(result)
            setDoctorCases(result);
            setAllCases(result);
            setBuffAllCases(result);
            setFinishedCases(result.filter((r) => r.delivering.status.isEnd === true));
            setNotStartCases(result.filter((r) => r.cadCam.actions.length <= 0 &&  r.delivering.status.isEnd === false && r.delivering.status.isEnd === false && r.isHold === false ) );
            setInProcessCases(
              result.filter(
                (r) =>
                  // r.cadCam.status.isStart === true &&
                  r.delivering.status.isEnd === false && r.cadCam.actions.length > 0
              )
            );
          })
          .catch((error) => {
            console.error("Error fetching cases:", error);
          });
      }, []);
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
          console.log("notStart",searchText)
          if (searchText !== "") {
            const filteredAllCases = notStartCases.filter(
              (item) =>
                item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
                item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.dentistObj?.name
                  .toLowerCase()
                  .includes(searchText.toLowerCase()) ||
                item?.patientName.toLowerCase().includes(searchText.toLowerCase())
            );
            setNotStartCases(filteredAllCases);
          } else {
            setNotStartCases(buffAllCases);
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
      };
      const viewCase = (item, type) => {
        if (type === "view") {
          navigate("/layout/view-case", { state: { ...item } });
        } else if (type === "process") {
          navigate("/layout/process-case", { state: { ...item } });
        }
      };
      const checkCaseDate=(item)=>{
        // console.log("groupTeethNumbersByName",groupTeethNumbersByName(item.teethNumbers))
      let response = "" 
      let teethNumbersByName = groupTeethNumbersByName(item.teethNumbers)
      const days = _global.getDaysfromTowDates(item.dateIn,new Date())
      if(teethNumbersByName.length > 0){
        const implant = teethNumbersByName.find(te => te.name === "Screw Retain Crown")
        const zircon = teethNumbersByName.find(t => t.name === "Zircon")
        const veneer = teethNumbersByName.find(tee => tee.name === "Veneer")
        const emax = teethNumbersByName.find(tee => tee.name === "E-Max / Inlay/ Onlay")
        const emaxCrown = teethNumbersByName.find(tee => tee.name === "E-Max Crown")
        const study = teethNumbersByName.find(tee => tee.name === "Study")
        if(implant && implant?.count >= 4 && implant?.count <= 5 && days >= 4 && !item.receptionPacking.status.isEnd) {
          response = "table-danger";
        }
        if(implant && implant?.count >= 7 && days > 7 && !item.receptionPacking.status.isEnd ) {
          response = "table-danger";
        }
        if((zircon && zircon?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd ) || (veneer && veneer?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd)  ) {
          response = "table-danger";
        }
        if((zircon && zircon?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd ) || (veneer && veneer?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd) ) {
          response = "table-danger";
        }
        if((emax && emax?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd) || (emax && emax?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd)) {
          response = "table-danger";
        }
        if((emaxCrown && emaxCrown?.count > 4 && days > 7 && !item.receptionPacking.status.isEnd) || (emaxCrown && emaxCrown?.count === 4 && days > 3 && !item.receptionPacking.status.isEnd)) {
          response = "table-danger";
        }
        if((study && study?.count >= 1 && days >= 3 && !item.receptionPacking.status.isEnd)) {
          response = "table-danger";
        }
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
        if(zircon && zircon?.count === 4 && days > 3 ) {
          msg = "4 unites Zircon and more than 3 days";
        }
        if(zircon && zircon?.count > 4 && days > 7 ) {
          msg = "more than 4 unites Zircon and more than 7 days";
        }
        if(veneer && veneer?.count === 4 && days > 3 ) {
          msg = "4 unites Veneer and more than 3 days";
        }
        if(veneer && veneer?.count > 4 && days > 7 ) {
          msg = "more than 4 unites Veneer and more than 7 days";
        }
        if(emax && emax?.count === 4 && days > 3 ) {
          msg = "4 unites E-Max / Inlay/ Onlay and more than 3 days";
        }
        if(emax && emax?.count > 4 && days > 7 ) {
          msg = "more than 4 unites E-Max / Inlay/ Onlay and more than 7 days";
        }
        if(emaxCrown && emaxCrown?.count === 4 && days > 3 ) {
          msg = "4 unites Emax Crown and more than 3 days";
        }
        if(emaxCrown && emaxCrown?.count > 4 && days > 7 ) {
          msg = "more than 4 unites Emax Crown and more than 7 days";
        }
        if((study && study?.count >= 1 && days >= 3 )) {
          msg = "study than 3 days";
        }
      }
      console.log(item.caseNumber,msg)
      return msg ; 
      }
      const checkNotStartDelay=(item)=>{
        if(item.cadCam.actions.length <= 0 && item.delivering.status.isEnd === true){
          return 'table-info'
        }
      }
    return (
      <>
    <div className="content cases-doctors">
    <div className="card">
      <h5 class="card-title">
        <span>Cases({state.firstName} {state.lastName})</span>
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
                      <td data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={getReasonlate(item)}>
                        <span >{item.caseNumber}
                        </span>
                        </td>
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
                          {item?.historyHolding?.length > 0 && user.roles[0] === _global.allRoles.admin  && (
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
                          {/* <span
                            className="c-success"
                            onClick={() => viewCase(item, "process")}
                          >
                            <i class="fa-brands fa-squarespace"></i>
                          </span> */}
                          {/* <span onClick={(e) => deleteCase(item._id)}>
                              <i className="fa-solid fa-trash-can"></i>
                            </span> */}
                          {/* { (user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" || user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&& */}
                          {/* { (user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" ||  user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&&
                          <span className="c-primary ml-3" onClick={(e) => editCase(item._id)}>
                          <i class="fas fa-edit"></i>
                          </span>
                         } */}
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
                        <td>{item.dateOut && _global.formatDateToYYYYMMDD(item.dateOut)}</td>
                        <td>
                          <div className="actions-btns">
                            <span
                              className="c-success"
                              onClick={() => viewCase(item, "view")}
                            >
                              <i class="fa-solid fa-eye"></i>
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
                    <tr key={item._id}  className={(item.isHold? "table-danger" : "" ) }>
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
                          {/* <span
                            className="c-success"
                            onClick={() => viewCase(item, "process")}
                          >
                            <i class="fa-brands fa-squarespace"></i>
                          </span> */}
                         {/* { (user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" || user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&&
                          <span className="c-primary" onClick={(e) => editCase(item._id)}>
                          <i class="fas fa-edit"></i>
                          </span>
                         } */}
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
                          {/* <span
                            className="c-success"
                            onClick={() => viewCase(item, "process")}
                          >
                            <i class="fa-brands fa-squarespace"></i>
                          </span> */}
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
            <div
              class={`modal-header  text-white bg-primary`}
            >
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
                {buffCase?.historyHolding.map((item,index)=>
                  <p key={index} className={
                    item.isHold
                  ? "bg-history-danger"
                  : "bg-history-success"
              }>
                    {item.isHold ? <span className="c-danger">Hold </span> : <span className="c-success"> UnHold  </span>}
                     {item.name}  in 
                     <span className={
                      item.isHold
                    ? "c-danger"
                    : "c-success"
                }>{_global.getFormateDate(item.date)}</span>, Because {item.msg} </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
</>
);
}

export default DocotrCases