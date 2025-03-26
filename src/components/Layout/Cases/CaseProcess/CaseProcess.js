import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import './CaseProcess.css'
import * as _global from "../../../../config/global";
import axios from "axios";
import { showToastMessage } from "../../../../helper/toaster";
import { is } from "date-fns/locale";
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
  const [study, setStudy] = useState("");
  const [notePause, setNotePause] = useState("");
  const [isStudy, setIsStudy] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);
  const changeStatus = (id, type, actionName) => {
    console.log(actionName);
    let isUrgent = caseData.isUrgent
    let isStudy = caseData.isStudy
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
     buffObj.study = study 
    }
    if(caseData[type].namePhase === 'Delivering' &&  actionName === "end" ) {
      isUrgent = false
      isStudy = false
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
  isUrgent : isUrgent,
  isStudy : isStudy
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
          window.history.back()
        }
        showToastMessage("Updated Case successfully", "success");
      })
      .catch((error) => {
        showToastMessage("Updated Case successfully", "error");
        console.error("Error Updating  case:", error);
      });
  };
  useEffect(()=>{
    setIsStudy(getStudyCases(groupCasesTeethNumbersByName()) > 0 ? true : false)
    setIsTemporary(getTemporaryCases(groupCasesTeethNumbersByName()) > 0 ? true : false)
    console.log(isTemporary)
  },[])
  const getFinishedDate = (item)=>{
    if(item){
      if(item.status.isEnd) {
        return item.actions.find(i=> i.dateEnd)?.dateEnd
      }
      else{
        return ""
      }
    } 
    return ""
  }
  function groupCasesTeethNumbersByName() {
    const result = {};
      state.teethNumbers.forEach((teethNumber) => {
      const { name } = teethNumber;
      if (!result[name]) {
        result[name] = 0;
      }
      result[name]++;
    });
    return Object.entries(result).map(([name, count]) => ({ name, count }));
  }
    const  getStudyCases = (data) => {
    return data.find((r) => r.name === "Study")
      ? data.find((r) => r.name === "Study")?.count
      : 0;
  };
  const  getTemporaryCases = (data) => {
    return data.find((r) => r.name === "Temporary")
      ? data.find((r) => r.name === "Temporary")?.count
      : 0;
  };
  const backHistory = ()=>{
    window.history.back()
  }
  return (
    <div className="content view-case">
      <div className="card">
        <h5 class="card-title">
          <span>
            <span
              className="back-step"
              onClick={() => backHistory()}
              // onClick={() => navigate("/layout/cases")}
            >
              <i class="fa-solid fa-arrow-left-long"></i>
            </span>
            Case <span className="c-case-number">Number</span>: #<strong>{caseData.caseNumber}</strong>
          </span>
          <span className="case-type">
            Case Type: <strong>{caseData.caseType}</strong>
          </span>
          <span>
            Deadline:{" "}
            <strong>{_global.formatDateToYYYYMMDD(caseData.dateOut)}</strong>
          </span>
        </h5>
        <div className="card-body">
          <div class="row mb-3">
          {caseData.caseType === "Physical" && (
              <div className="col-lg-4">
                <div  className={`card-case ${caseData.plaster.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                  <h6>Plaster</h6>
                  {caseData?.plaster.status.isEnd &&   <span className="finished-date">
                    <span>Finished at:</span> <small  >{_global.getFormateDate( getFinishedDate(caseData?.plaster), true)}</small>
                    </span>
                  }
                   <div className="btn-actions">
                   {(user.roles[0] ===  _global.allRoles.technician && departments[0].name === "Plaster" || user.roles[0] ===  _global.allRoles.super_admin  ) &&
                   <>
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
                    </>}
                    <button
                      className="btn btn-sm btn-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#chooseNaturalModal"
                     onClick={() => setPhaseModel(caseData.plaster)}
                    >
                      History
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="col-lg-4">
              <div className={`card-case ${caseData.cadCam.status.isEnd ? 'bgc-success':'bgc-danger'}`} >
                <h6>Cad Cam</h6>
                {caseData?.cadCam.status.isEnd &&  <span className="finished-date">
                  <span>Finished at:</span> <small  >{_global.getFormateDate( getFinishedDate(caseData?.cadCam), true)}</small>
                </span>
                }
                <div className="btn-actions">
                {(user.roles[0] ===  _global.allRoles.technician && departments[0].name === "CadCam" ||  user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" ||  user.roles[0] ===  _global.allRoles.super_admin)&& 
                 <>
                 <button
                    className="btn btn-sm btn-success"
                    disabled={!caseData.cadCam.status.isStart || caseData.isHold }
                    onClick={() => changeStatus(state._id, "cadCam", "start")}
                  >
                    Start
                  </button>
                  {/* <button
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
                  </button> */}
                  <button
                    className="btn btn-sm btn-danger"
                     data-bs-toggle="modal"
                    data-bs-target="#cadCamObjModal"
                    disabled={caseData.cadCam.status.isEnd || caseData.isHold}
                       onClick={() => {
                      setPhaseName('cadCam')
                      setBuffActionName('end')
                     }}
                  >
                    End
                  </button>
                  </>
                   }
                <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                    onClick={() => setPhaseModel(caseData.cadCam)}
                  >
                    History
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div  className={`card-case ${caseData.fitting.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                <h6>Fitting</h6>
                {caseData?.fitting.status.isEnd && <span className="finished-date">
                  <span>Finished at:</span> <small  >{_global.getFormateDate( getFinishedDate(caseData?.fitting), true)}</small>
                </span>
                }
               <div className="btn-actions">
               {(user.roles[0] ===  _global.allRoles.technician && departments[0].name === "Fitting" || user.roles[0] ===  _global.allRoles.super_admin) &&  
               <>
                  <button
                    className="btn btn-sm btn-success"
                    disabled={!caseData.fitting.status.isStart || !caseData.cadCam.status.isEnd }
                    onClick={() => changeStatus(state._id, "fitting","start")}
                  >
                    Start
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    data-bs-toggle="modal"
                    data-bs-target="#notePauseModal"
                    disabled={!caseData.fitting.status.isPause || !caseData.cadCam.status.isEnd}
                     onClick={() => {
                      setPhaseName('fitting')
                      setBuffActionName('pause')
                     }}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={caseData.fitting.status.isEnd || !caseData.cadCam.status.isEnd}
                      onClick={() => changeStatus(state._id, "fitting","end")}
                  >
                    End
                  </button>
                  </>
                  }
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                   onClick={() => setPhaseModel(caseData.fitting)}
                  >
                    History
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className={`card-case ${caseData.ceramic.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                <h6>Ceramic</h6>
                {caseData?.ceramic.status.isEnd && <span className="finished-date">
                  <span>Finished at:</span> <small  >{_global.getFormateDate( getFinishedDate(caseData?.ceramic), true)}</small>
                </span>
                }
              
              <div className="btn-actions">
              {(user.roles[0] ===  _global.allRoles.technician && departments[0].name === "Caramic" || user.roles[0] ===  _global.allRoles.super_admin ) &&
              <>
                  <button
                    className="btn btn-sm btn-success"
                    disabled={
                      !caseData.ceramic.status.isStart || !caseData.fitting.status.isEnd
                    }
                    onClick={() => changeStatus(state._id, "ceramic", "start")}
                  >
                    Start
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                      data-bs-toggle="modal"
                    data-bs-target="#notePauseModal"
                    disabled={!caseData.ceramic.status.isPause || !caseData.fitting.status.isEnd}
                     onClick={() => {
                      setPhaseName('ceramic')
                      setBuffActionName('pause')
                     }}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={caseData.ceramic.status.isEnd || !caseData.fitting.status.isEnd}
                    onClick={() => changeStatus(state._id, "ceramic", "end")}
                  >
                    End
                  </button>
                  </>}
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                     onClick={() => setPhaseModel(caseData.ceramic)}
                  >
                    History
                  </button>
              </div>
              </div>
            </div>
            {/* <div className="col-lg-4">
              <div  className={`card-case ${caseData.qualityControl.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                <h6>Quality Control</h6>
                {caseData?.qualityControl.status.isEnd && <span className="finished-date">
                  <span>Finished at:</span> <small  >{_global.getFormateDate( getFinishedDate(caseData?.qualityControl), true)}</small>
                </span>
               }
                 <div className="btn-actions">
                 {user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC" || user.roles[0] ===  _global.allRoles.super_admin &&
                 <>
                  <button
                    className="btn btn-sm btn-success"
                    disabled={
                      !caseData.qualityControl.status.isStart || !caseData.ceramic.status.isEnd 
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
                    disabled={!caseData.qualityControl.status.isPause || !caseData.ceramic.status.isEnd}
                     onClick={() => {
                      setPhaseName('qualityControl')
                      setBuffActionName('pause')
                     }}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={caseData.qualityControl.status.isEnd || !caseData.ceramic.status.isEnd}
                    onClick={() =>
                      changeStatus(state._id, "qualityControl", "end")
                    }
                  >
                    End
                  </button>
                  </>}
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                     onClick={() => setPhaseModel(caseData.qualityControl)}
                  >
                    History
                  </button>
                </div>
              </div>
            </div> */}
            {/* <div className="col-lg-4">
              <div className={`card-case ${caseData.designing.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                <h6>Photographing</h6>
                {caseData?.designing.status.isEnd &&  <span className="finished-date">
                  <span>Finished at:</span> <small  >{_global.getFormateDate( getFinishedDate(caseData?.designing), true)}</small>
                </span>
                }
                 <div className="btn-actions">
                 {(user.roles[0] ===  _global.allRoles.graphic_design && departments[0].name === "Marketing")&&
                 <>
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
                  </>
                  }
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                    onClick={() => setPhaseModel(caseData.designing)}
                  >
                    History
                  </button>
                </div>
              </div>
            </div> */}
            <div className="col-lg-4">
              <div  className={`card-case ${caseData.receptionPacking.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                <h6>Reception(Packing)</h6>
                {caseData?.receptionPacking.status.isEnd && <span className="finished-date">
                  <span>Finished at:</span> <small  >{_global.getFormateDate( getFinishedDate(caseData?.receptionPacking), true)}</small>
                </span>
                }
                <div className="btn-actions">
                {(user.roles[0] ===  _global.allRoles.Reception && departments[0].name === "Reception" || user.roles[0] ===  _global.allRoles.super_admin )&&
                <>
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
                    disabled={!caseData.receptionPacking.status.isPause }
                     onClick={() => {
                      setPhaseName('receptionPacking')
                      setBuffActionName('pause')
                     }}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    // || (!caseData.ceramic.status.isEnd && !isStudy) 
                    disabled={caseData.receptionPacking.status.isEnd  }
                    onClick={() =>
                      changeStatus(state._id, "receptionPacking", "end")
                    }
                  >
                    End
                  </button>
                  </>
                 }
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                    onClick={() => setPhaseModel(caseData.receptionPacking)}
                  >
                    History
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div  className={`card-case ${caseData.delivering.status.isEnd ? 'bgc-success':'bgc-danger'}`}>
                <h6>Delivering</h6>
                {caseData?.delivering.status.isEnd && <span className="finished-date">
                  <span>Finished at:</span> <small  >{_global.getFormateDate( getFinishedDate(caseData?.delivering), true)}</small>
                </span>
                }
                <div className="btn-actions">
                {(user.roles[0] ===  _global.allRoles.Reception && departments[0].name === "Reception" || user.roles[0] ===  _global.allRoles.super_admin || user.roles[0] ===  _global.allRoles.Driver)&&
                <>
                  <button
                    className="btn btn-sm btn-success"
                    disabled={
                      !caseData.delivering.status.isStart || !caseData.receptionPacking.status.isEnd
                    }
                    onClick={() =>
                      changeStatus(state._id, "delivering", "start")
                    }
                  >
                    Start
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    data-bs-toggle="modal"
                    data-bs-target="#notePauseModal"
                    disabled={!caseData.delivering.status.isPause || !caseData.receptionPacking.status.isEnd}
                     onClick={() => {
                      setPhaseName('delivering')
                      setBuffActionName('pause')
                     }}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={caseData.delivering.status.isEnd || !caseData.receptionPacking.status.isEnd }
                    onClick={() =>
                      changeStatus(state._id, "delivering", "end")
                    }
                  >
                    End
                  </button>
                  </>
                }
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                    onClick={() => setPhaseModel(caseData.delivering)}
                  >
                    History
                  </button>
                </div>
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
               {caseData?.historyHolding.length > 0 && (user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.technician && departments[0].name === "CadCam" || user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" ) && <div className="mt-3"> 
                <h6 className="mb-2">Holding History</h6>
                {caseData?.historyHolding.map((item,index) =>
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
             }
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
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Study</label>
                    <input type="text" className="form-control" value={study} onChange={(e)=>setStudy(e.target.value)} placeholder="Enter Study"  />
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
                disabled={implantName === "" && zirconName === "" && emaxName ==="" && study ===""}
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
