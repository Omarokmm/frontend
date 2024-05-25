import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import './CaseProcess.css'
import * as _global from "../../../../config/global";
import axios from "axios";
import { showToastMessage } from "../../../../helper/toaster";
const getFormateDateToday = () => {
  let date = new Date();
  // Extract year, month, day, and hour
  let year = date.getFullYear();
  let month = ("0" + (date.getMonth() + 1)).slice(-2); // Month is zero-based, so we add 1
  let day = ("0" + date.getDate()).slice(-2);
  let hour = ("0" + date.getHours()).slice(-2);
  let minutes = ("0" + date.getMinutes()).slice(-2);
  let ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  // Return formatted date string
  return `${year}-${month}-${day} ${hour}:${minutes} ${ampm}`;
};

const CaseProcess = () => {
  const user = JSON.parse(localStorage.getItem("user"))
  const departments = JSON.parse(localStorage.getItem("departments"))
  console.log('departments',departments)
   const { state } = useLocation();
   console.log(state);
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(state);
  const [historyData, setHistoryData] = useState(null);
  const [phaseModel, setPhaseModel] = useState(null);
  const [buffActionName, setBuffActionName] = useState("");
  const [phaseName, setPhaseName] = useState("");
  const [zirconName, setZirconName] = useState("");
  const [emaxName, setEmaxName] = useState("");
  const [implantName, setImplantName] = useState("");
  const [notePause, setNotePause] = useState("");
  const changeStatus = (id, type, actionName) => {
    console.log(actionName);
    let model;
    let action;
  
  if (actionName === "start") {
    action = {
      technicianName: `${user.firstName}, ${user.lastName}`,
      technicianId: user._id,
      dateStart: new Date(),
      notes: "some note",
      prfeix:"start",
      prfeixMsg : "Start by  ",
      msg: `${user.firstName}, ${user.lastName} at ${getFormateDateToday()}`,
    };
  }
    if (actionName === "pause") {
      action = {
        technicianName: `${user.firstName}, ${user.lastName}`,
        technicianId: user._id,
        datePause: new Date(),
        notes: notePause,
        prfeix:"pause",
       prfeixMsg : "Puase by  ",
      msg: `${user.firstName} ${user.lastName} at ${getFormateDateToday()}${notePause ? ' because ' + notePause : ''}`
      };
    }
      if (actionName === "end") {
        action = {
          technicianName: `${user.firstName}, ${user.lastName}`,
          technicianId: user._id,
          dateEnd: new Date(),
          notes: "some note",
          prfeix:"end",
          prfeixMsg : "Finished by  ",
          msg: `${user.firstName}, ${user.lastName} at ${getFormateDateToday()}`,
        };
      }
 
const logs = [...caseData[type].actions];
logs.push(action);
  let buffObj = {}
    if(caseData[type].namePhase === 'Cad Cam' &&  actionName === "end" ) {
     buffObj.zirconName = zirconName 
     buffObj.emaxName = emaxName 
     buffObj.implantName = implantName 
    }
let newModel = {
  namePhase: caseData[type].namePhase,
  actions: logs,
  status: {
    isStart:
      actionName === "start" || actionName === "end"
        ? false
        : actionName === "pause"
        ? true
        : caseData[type].status.isStart,
    isPause:
      actionName === "pause" || actionName === "end"
        ? false
        : actionName === "start"
        ? true
        : caseData[type].status.isPause,
    isEnd: actionName === "end" ? true : caseData[type].status.isEnd,
  },
  obj: buffObj,
};
console.log("newModel",newModel);
    axios
      .put(`${_global.BASE_URL}cases/${id}/${type}`, newModel)
      .then((res) => {
        const result = res.data;
        setCaseData(result);
        setNotePause("")
        setImplantName("")
        setEmaxName("")
        setZirconName("")
        console.log(buffActionName)
        if(actionName === 'end'){
          navigate('/layout/cases')
        }
        showToastMessage("Updated Case successfully", "success");
      })
      .catch((error) => {
        showToastMessage("Updated Case successfully", "error");
        console.error("Error Updating  case:", error);
      });
  };
  return (
    <div className="content view-case">
      <div className="card">
        <h5 class="card-title">
          <span>
            <span
              className="back-step"
              onClick={() => navigate("/layout/cases")}
            >
              <i class="fa-solid fa-arrow-left-long"></i>
            </span>
            Case Number: #<strong>{caseData.caseNumber}</strong>
          </span>
          <span>
            Case Type: <strong>{caseData.caseType}</strong>
          </span>
          <span>
            Deadline:{" "}
            <strong>{_global.getFormateDate(caseData.dateOut,false)}</strong>
          </span>
        </h5>
        <div className="card-body">
          <div class="row mb-3">
            <div className="col-lg-4">
              <div className={`card-case ${caseData.cadCam.status.isEnd ? 'bgc-success':'bgc-danger'}`} >
                <h6>Cad Cam</h6>
                {(user.roles[0] ===  _global.allRoles.technician && departments[0].name === "CadCam" || user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&& <div className="btn-actions">
                  <button
                    className="btn btn-sm btn-success"
                    disabled={!caseData.cadCam.status.isStart}
                    onClick={() => changeStatus(state._id, "cadCam", "start")}
                  >
                    Start
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                      data-bs-toggle="modal"
                    data-bs-target="#notePauseModal"
                    disabled={!caseData.cadCam.status.isPause}
                     onClick={() => {
                      setPhaseName('cadCam')
                      setBuffActionName('pause')
                     }}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                     data-bs-toggle="modal"
                    data-bs-target="#cadCamObjModal"
                    disabled={caseData.cadCam.status.isEnd}
                       onClick={() => {
                      setPhaseName('cadCam')
                      setBuffActionName('end')
                     }}
                  >
                    End
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                    onClick={() => setPhaseModel(caseData.cadCam)}
                  >
                    History
                  </button>
                </div>
                }
              </div>
            </div>
            {caseData.caseType === "Physical" && (
              <div className="col-lg-4">
                <div  className={`card-case ${caseData.plaster.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                  <h6>Plaster</h6>
                 {(user.roles[0] ===  _global.allRoles.technician && departments[0].name === "Plaster" || user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC") &&  <div className="btn-actions">
                    <button
                      className="btn btn-sm btn-success"
                      disabled={
                        !caseData.plaster.status.isStart
                      }
                      onClick={() => changeStatus(state._id, "plaster", "start")}
                    >
                      Start
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                           data-bs-toggle="modal"
                         data-bs-target="#notePauseModal"
                         disabled={!caseData.plaster.status.isPause}
                        onClick={() => {
                      setPhaseName('plaster')
                      setBuffActionName('pause')
                     }}
                      // onClick={() =>
                      //   changeStatus(state._id, "plaster", "pause")
                      // }
                    >
                      Pause
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={caseData.plaster.status.isEnd}
                      onClick={() => changeStatus(state._id, "plaster", "end")}
                    >
                      End
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#chooseNaturalModal"
                     onClick={() => setPhaseModel(caseData.plaster)}
                    >
                      History
                    </button>
                  </div>
}
                </div>
              </div>
            )}
            <div className="col-lg-4">
              <div  className={`card-case ${caseData.fitting.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                <h6>Fitting</h6>
               {(user.roles[0] ===  _global.allRoles.technician && departments[0].name === "Fitting"|| user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC") &&  <div className="btn-actions">
                  <button
                    className="btn btn-sm btn-success"
                    disabled={!caseData.fitting.status.isStart}
                    onClick={() => changeStatus(state._id, "fitting","start")}
                  >
                    Start
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    data-bs-toggle="modal"
                    data-bs-target="#notePauseModal"
                    disabled={!caseData.fitting.status.isPause}
                     onClick={() => {
                      setPhaseName('fitting')
                      setBuffActionName('pause')
                     }}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={caseData.fitting.status.isEnd}
                      onClick={() => changeStatus(state._id, "fitting","end")}
                  >
                    End
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                   onClick={() => setPhaseModel(caseData.fitting)}
                  >
                    History
                  </button>
                </div>
}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={`card-case ${caseData.ceramic.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                <h6>Ceramic</h6>
             {(user.roles[0] ===  _global.allRoles.technician && departments[0].name === "Ceramic" || user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&&    <div className="btn-actions">
                  <button
                    className="btn btn-sm btn-success"
                    disabled={
                      !caseData.ceramic.status.isStart
                    }
                    onClick={() => changeStatus(state._id, "ceramic", "start")}
                  >
                    Start
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                      data-bs-toggle="modal"
                    data-bs-target="#notePauseModal"
                    disabled={!caseData.ceramic.status.isPause}
                     onClick={() => {
                      setPhaseName('ceramic')
                      setBuffActionName('pause')
                     }}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={caseData.ceramic.status.isEnd}
                    onClick={() => changeStatus(state._id, "ceramic", "end")}
                  >
                    End
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                     onClick={() => setPhaseModel(caseData.ceramic)}
                  >
                    History
                  </button>
                </div>
}
              </div>
            </div>
            <div className="col-lg-4">
              <div  className={`card-case ${caseData.qualityControl.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                <h6>Quality Control</h6>
                {user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC" &&  <div className="btn-actions">
                  <button
                    className="btn btn-sm btn-success"
                    disabled={
                      !caseData.qualityControl.status.isStart 
                    }
                    onClick={() =>
                      changeStatus(state._id, "qualityControl", "start")
                    }
                  >
                    Start
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                      data-bs-toggle="modal"
                    data-bs-target="#notePauseModal"
                    disabled={!caseData.qualityControl.status.isPause}
                     onClick={() => {
                      setPhaseName('qualityControl')
                      setBuffActionName('pause')
                     }}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={caseData.qualityControl.status.isEnd}
                    onClick={() =>
                      changeStatus(state._id, "qualityControl", "end")
                    }
                  >
                    End
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                     onClick={() => setPhaseModel(caseData.qualityControl)}
                  >
                    History
                  </button>
                </div>
}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={`card-case ${caseData.designing.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                <h6>Photographing</h6>
             {(user.roles[0] ===  _global.allRoles.graphic_design && departments[0].name === "Marketing"  || user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&&   <div className="btn-actions">
                  <button
                    className="btn btn-sm btn-success"
                    disabled={
                      !caseData.designing.status.isStart 
                    }
                    onClick={() => changeStatus(state._id, "designing", "start")}
                  >
                    Start
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                     data-bs-toggle="modal"
                    data-bs-target="#notePauseModal"
                    disabled={!caseData.designing.status.isPause}
                     onClick={() => {
                      setPhaseName('designing')
                      setBuffActionName('pause')
                     }}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={caseData.designing.status.isEnd}
                    onClick={() => changeStatus(state._id, "designing", "end")}
                  >
                    End
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                    onClick={() => setPhaseModel(caseData.designing)}
                  >
                    History
                  </button>
                </div>
}
              </div>
            </div>
            <div className="col-lg-4">
              <div  className={`card-case ${caseData.receptionPacking.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                <h6>Reception(Packing)</h6>
               {(user.roles[0] ===  _global.allRoles.Reception && departments[0].name === "Reception" || user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&& <div className="btn-actions">
                  <button
                    className="btn btn-sm btn-success"
                    disabled={
                      !caseData.receptionPacking.status.isStart
                    }
                    onClick={() =>
                      changeStatus(state._id, "receptionPacking", "start")
                    }
                  >
                    Start
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    data-bs-toggle="modal"
                    data-bs-target="#notePauseModal"
                    disabled={!caseData.receptionPacking.status.isPause}
                     onClick={() => {
                      setPhaseName('receptionPacking')
                      setBuffActionName('pause')
                     }}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={caseData.receptionPacking.status.isEnd}
                    onClick={() =>
                      changeStatus(state._id, "receptionPacking", "end")
                    }
                  >
                    End
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                    onClick={() => setPhaseModel(caseData.receptionPacking)}
                  >
                    History
                  </button>
                </div>
}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal History */}
      <div
        class="modal fade"
        id="chooseNaturalModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                {phaseModel?.namePhase} History
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              {console.log(historyData?.items)}
              {phaseModel?.actions.length <= 0 && (
                <h6 className=" text-center m-3">No have history Yet!</h6>
              )}
              {phaseModel?.actions.length > 0 &&
                phaseModel?.actions.map((item, index) => (
                  <span className="history-item">
                    <span style={{ color: item?.prfeix === 'start' ? 'green' : item?.prfeix === 'pause' ? '#a5671a' : 'red' }}>
                       <span className="pl-3">{item?.prfeixMsg}</span>
                    </span>
                    {item?.msg}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

        {/* Modal Cad Cam Object */}
      <div
        class="modal fade"
        id="cadCamObjModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                {phaseModel?.namePhase} History
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
                <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Zircon Block Name</label>
                    <input type="text" className="form-control" value={zirconName} onChange={(e)=>setZirconName(e.target.value)} placeholder="Enter Block Name"  />
                  </div>
                </div>
                     <div className="col-lg-12">
                  <div className="form-group">
                    <label>E-Max</label>
                    <input type="text" className="form-control" value={emaxName} onChange={(e)=>setEmaxName(e.target.value)} placeholder="Enter E-Max Name"  />
                  </div>
                </div>
                     <div className="col-lg-12">
                  <div className="form-group">
                    <label>Implant</label>
                    <input type="text" className="form-control" value={implantName} onChange={(e)=>setImplantName(e.target.value)} placeholder="Enter Implant Name"  />
                  </div>
                </div>
                </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm bg-light"  
                data-bs-dismiss="modal"
              >Cancel</button>
              <button className="btn btn-sm btn-success"
                data-bs-dismiss="modal"
                disabled={implantName === "" && zirconName === "" && emaxName ===""}
              onClick={() => changeStatus(state._id, "cadCam", "end")}>Finish</button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Note Pause */}
      <div
        class="modal fade"
        id="notePauseModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Add Note
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
                <div className="row">
                     <div className="col-lg-12">
                  <div className="form-group">
                    <label>Note</label>
                    <input type="text" className="form-control" value={notePause} onChange={(e)=>setNotePause(e.target.value)} placeholder="Enter your Note"  />
                  </div>
                </div>
                </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm bg-light"  
                data-bs-dismiss="modal"
              >Cancel</button>
              <button className="btn btn-sm btn-success"
                data-bs-dismiss="modal"
                disabled={notePause === "" }
              onClick={() => changeStatus(state._id, phaseName, buffActionName)}>Puase</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CaseProcess;