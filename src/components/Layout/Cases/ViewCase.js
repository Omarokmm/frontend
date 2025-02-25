import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import * as _global from "../../../config/global";
import { format } from "date-fns";

import axios from "axios";
const ViewCase = ()=>{
const numOfTeeth = _global.numOfTeeth;
const navigate = useNavigate()
const { state } = useLocation();
const [caseData, setCaseData] = useState(state);
const [historyData, setHistoryData] = useState(null);
const [teethNumbers, setTeethNumbers] = useState(state.teethNumbers);
const [teethData, setTeethData] = useState(null);
const [naturalOfWorks, setNaturalOfWorks] = useState(_global.naturalOfWorks);
const [naturalOfWork, setNaturalOfWork] = useState(null);

   console.log(state);
  //  useEffect(() => {
  //    // get cases
  //    axios
  //      .get(`${_global.BASE_URL}cases/${state._id}`)
  //      .then((res) => {
  //        const result = res.data;
  //        setCaseData(result);
  //      })
  //      .catch((error) => {
  //        console.error("Error fetching case:", error);
  //      });
  //  }, []);
  const chooseTeeth = (item,natural, type) => {
    setNaturalOfWork(natural)
    console.log(natural);
    setTeethData(item);
    console.log(item, type);
  };
  const getFinishedDate = (item)=>{
    if(item){
      if(item.status.isEnd) {
        console.log('item.actions.find(i=> i.dateEnd)?.dateEnd',item.namePhase,item.actions.find(i=> i.dateEnd)?.dateEnd)
        return item.actions.find(i=> i.dateEnd)?.dateEnd
      }
      else{
        return ""
      }
    } 
    return ""
  }
  const getFinishedName = (item)=>{
    if(item){
      if(item.status.isEnd) {
        return item.actions.find(i=> i.dateEnd)?.technicianName
      }
      else{
        return ""
      }
    } 
    return ""
  }
  const backHistory = ()=>{
    window.history.back()
  }
return (
  <div className="content view-case">
    <div className="card">
      <h5 class="card-title">
        <span>
          <span className="back-step" onClick={() => backHistory()}>
            <i class="fa-solid fa-arrow-left-long"></i>
          </span>
          Case <span className="c-case-number">Number</span>: #<strong>{caseData.caseNumber}</strong>
        </span>
        <span>
          <i class="fa-solid fa-truck" style={{
                  color: caseData?.delivering.status.isEnd
                    ? "#2ba51c "
                    : "rgb(255 63 63) "
                }}></i>
         {caseData?.delivering?.status?.isEnd ?
           <small className="delivering-icon">
            {_global.getFormateDate(getFinishedDate(caseData?.delivering), true)}
          </small>
          : 
          <small> Not Delivered</small>
         }
        </span>
        <span className="c-case-number">
          Case Type: <strong>{caseData.caseType}</strong>
        </span>
        {/* <span>
          Deadline:{" "}
          <strong>
            {caseData.deadline
              ? _global.formatDateToYYYYMMDD(caseData.deadline)
              : "Unknown"}
          </strong>
        </span> */}
        {/* <span onClick={()=>window.print()}>print</span> */}
      </h5>
      <div className="card-body">
        <div class="row">
          <div className="col-lg-12">
            <div className="date-in-out">
              <div className="date-in">
                {" "}
                <strong>DATE IN:</strong>
                <span>{_global.formatDateToYYYYMMDD(caseData.dateIn)}</span>
              </div>
              <div className="date-out">
                {" "}
                <strong>Due Date:</strong>
                <span> 
                  {caseData.dateOut
                    ?_global.formatDateToYYYYMMDD(caseData.dateOut)
                    : "Unknown"}
                </span>
              </div>
              {/* <div className="time">
                {" "}
                <strong>TIME:</strong>
                <span>
                  {caseData.dateOut
                    ? _global.timeFromDate(caseData.dateOut)
                    : "Unknown"}
                </span>
              </div> */}
            </div>
          </div>
          <div className="col-lg-12 mt-4">
            <strong>Case Status</strong>
            <div className="all-phases">
            {caseData.caseType === "Physical" && (    
              <div  className="phase-view">
              <div
                className="phaseName"
                style={{
                  backgroundColor: caseData?.plaster.status.isStart
                    ? "rgb(255 63 63) "
                    : caseData?.plaster.status.isPause
                    ? "#2993df"
                    : caseData?.plaster.status.isEnd
                    ? "#2ba51c"
                    : "red",
                }}
              >
                <span className="tooltip-phase-name" >{getFinishedName(caseData?.plaster)}</span>
                Plaster
                <span className="tooltip-phase">
                  {caseData?.plaster.status.isStart && (
                    <i class="fa-solid fa-circle-xmark c-danger"></i>
                  )}
                  {caseData?.plaster.status.isPause && (
                    <i class="fa-solid fa-hourglass-half c-primary"></i>
                  )}
                  {caseData?.plaster.status.isEnd && (
                    <i class="fa-solid fa-circle-check c-success"></i>
                  )}
                </span>
              </div>
              <span class="arrow-right"></span>
              <span class="arrow-right-phone">
              <i class="fa-solid fa-right-long"></i>
              </span>
              <span className="tooltip-phase-date" >{_global.getFormateDate( getFinishedDate(caseData?.plaster), true)}</span>
              </div>
            )}
              <div className="phase-view">
              <div
                className="phaseName"
                style={{
                  backgroundColor: caseData?.cadCam.status.isStart
                    ? "rgb(255 63 63) "
                    : caseData?.cadCam.status.isPause
                    ? "#2993df"
                    : caseData?.cadCam.status.isEnd
                    ? "#2ba51c"
                    : "red",
                }}
              >
                <span className="tooltip-phase-name" >{getFinishedName(caseData?.cadCam)}</span>
                Cad Cam
                <span className="tooltip-phase">
                  {caseData?.cadCam.status.isStart && (
                    <i class="fa-solid fa-circle-xmark c-danger"></i>
                  )}
                  {caseData?.cadCam.status.isPause && (
                    <i class="fa-solid fa-hourglass-half c-primary"></i>
                  )}
                  {caseData?.cadCam.status.isEnd && (
                    <i class="fa-solid fa-circle-check c-success"></i>
                  )}
                </span>
                <span className="tooltip-phase-date" >{_global.getFormateDate(getFinishedDate(caseData?.cadCam), true)}</span>
              </div>
              <span class="arrow-right"></span>
              <span class="arrow-right-phone">
              <i class="fa-solid fa-right-long"></i>
              </span>
              </div>
              <div  className="phase-view">
              <div
                className="phaseName"
                style={{
                  backgroundColor: caseData?.fitting.status.isStart
                    ? "rgb(255 63 63) "
                    : caseData?.fitting.status.isPause
                    ? "#2993df"
                    : caseData?.fitting.status.isEnd
                    ? "#2ba51c"
                    : "red",
                }}
              >
                <span className="tooltip-phase-name" >{getFinishedName(caseData?.fitting)}</span>
                Fitting
                <span className="tooltip-phase">
                  {caseData?.fitting.status.isStart && (
                    <i class="fa-solid fa-circle-xmark c-danger"></i>
                  )}
                  {caseData?.fitting.status.isPause && (
                    <i class="fa-solid fa-hourglass-half c-primary"></i>
                  )}
                  {caseData?.fitting.status.isEnd && (
                    <i class="fa-solid fa-circle-check c-success"></i>
                  )}
                </span>
              </div>
              <span class="arrow-right"></span>
              {caseData.caseType === "Digital" && <span class="arrow-right-phone ">
              <i class="fa-solid fa-right-long"></i>
              </span>
              } 
            {caseData.caseType === "Physical" && <span class="arrow-right-phone t-90">
              <i class="fa-solid fa-right-long"></i>
              </span>
              } 
              <span className="tooltip-phase-date" >{_global.getFormateDate( getFinishedDate(caseData?.fitting), true)}</span>
              </div>
              <div  className="phase-view">
              <div
                className="phaseName"
                style={{
                  backgroundColor: caseData?.ceramic.status.isStart
                    ? "rgb(255 63 63) "
                    : caseData?.ceramic.status.isPause
                    ? "#2993df"
                    : caseData?.ceramic.status.isEnd
                    ? "#2ba51c"
                    : "red",
                }}
              >
                <span className="tooltip-phase-name" >{getFinishedName(caseData?.ceramic)}</span>
                Ceramic
                <span className="tooltip-phase">
                  {caseData?.ceramic.status.isStart && (
                    <i class="fa-solid fa-circle-xmark c-danger"></i>
                  )}
                  {caseData?.ceramic.status.isPause && (
                    <i class="fa-solid fa-hourglass-half c-primary"></i>
                  )}
                  {caseData?.ceramic.status.isEnd && (
                    <i class="fa-solid fa-circle-check c-success"></i>
                  )}
            {caseData.caseType === "Digital" && <span class="arrow-right-phone t-90">
              <i class="fa-solid fa-right-long"></i>
              </span>
              } 
                </span>
                <span className="tooltip-phase-date" >{_global.getFormateDate(getFinishedDate(caseData?.ceramic), true)}</span>
              </div>
              <span class="arrow-right"></span>
              {/* <span class="arrow-right-phone t-90">
              <i class="fa-solid fa-right-long"></i>
              </span> */}
              {/* <span className="tooltip-phase-date" >{_global.getFormateDate(getFinishedDate(caseData?.ceramic), true)}</span> */}
              </div>
              {/* <div  className="phase-view">
              <div
                className="phaseName"
                style={{
                  backgroundColor: caseData?.qualityControl.status.isStart
                    ? "rgb(255 63 63) "
                    : caseData?.qualityControl.status.isPause
                    ? "#2993df"
                    : caseData?.qualityControl.status.isEnd
                    ? "#2ba51c"
                    : "red",
                }}
              >
                <span className="tooltip-phase-name" >{getFinishedName(caseData?.qualityControl)}</span>
                QC
                <span className="tooltip-phase">
                  {caseData?.qualityControl.status.isStart && (
                    <i class="fa-solid fa-circle-xmark c-danger"></i>
                  )}
                  {caseData?.qualityControl.status.isPause && (
                    <i class="fa-solid fa-hourglass-half c-primary"></i>
                  )}
                  {caseData?.qualityControl.status.isEnd && (
                    <i class="fa-solid fa-circle-check c-success"></i>
                  )}
                </span>
                <span class="arrow-right-phone t-180">
              <i class="fa-solid fa-right-long"></i>
              </span>
              </div>
              <span class="arrow-right"></span>
              <span className="tooltip-phase-date" >{_global.getFormateDate(getFinishedDate(caseData?.qualityControl), true)}</span>
              </div> */}
              {/* <div  className="phase-view">
              <div
                className="phaseName"
                style={{
                  backgroundColor: caseData?.designing.status.isStart
                    ? "rgb(255 63 63) "
                    : caseData?.designing.status.isPause
                    ? "#2993df"
                    : caseData?.designing.status.isEnd
                    ? "#2ba51c"
                    : "red",
                }}
              >
             <span className="tooltip-phase-name" >{getFinishedName(caseData?.designing)}</span>
                Photos
                <span className="tooltip-phase">
                  {caseData?.designing.status.isStart && (
                    <i class="fa-solid fa-circle-xmark c-danger"></i>
                  )}
                  {caseData?.designing.status.isPause && (
                    <i class="fa-solid fa-hourglass-half c-primary"></i>
                  )}
                  {caseData?.designing.status.isEnd && (
                    <i class="fa-solid fa-circle-check c-success"></i>
                  )}
                </span>
              </div>
              <span class="arrow-right"></span>
              <span class="arrow-right-phone t-180">
              <i class="fa-solid fa-right-long"></i>
              </span>
              <span className="tooltip-phase-date" >{_global.getFormateDate(getFinishedDate(caseData?.designing), true)}</span>
              </div> */}
              <div  className="phase-view">
              <div
                className="phaseName"
                style={{
                  backgroundColor: caseData?.receptionPacking.status.isStart
                    ? "rgb(255 63 63) "
                    : caseData?.receptionPacking.status.isPause
                    ? "#2993df"
                    : caseData?.receptionPacking.status.isEnd
                    ? "#2ba51c"
                    : "red",
                }}
              >
              <span className="tooltip-phase-name" >{getFinishedName(caseData?.receptionPacking)}</span>
                Packing
                <span className="tooltip-phase">
                  {caseData?.receptionPacking.status.isStart && (
                    <i class="fa-solid fa-circle-xmark c-danger"></i>
                  )}
                  {caseData?.receptionPacking.status.isPause && (
                    <i class="fa-solid fa-hourglass-half c-primary"></i>
                  )}
                  {caseData?.receptionPacking.status.isEnd && (
                    <i class="fa-solid fa-circle-check c-success"></i>
                  )}
                </span>
                <span class="arrow-right-phone t-180">
              <i class="fa-solid fa-right-long"></i>
              </span>
              <span className="tooltip-phase-date" >{_global.getFormateDate(getFinishedDate(caseData?.receptionPacking), true)}</span>
              </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="wrapper-case-item mt-3">
              <div className="case-item">
                <strong>Clinic/Dentist's Name:</strong>
                <span>{caseData.dentistObj.name}</span>
              </div>
              {/* <div className="case-item">
                <strong>Telephone:</strong>
                <span>{caseData.dentistObj.phone}</span>
              </div> */}
            </div>
          </div>
          {caseData?.cadCam.obj  &&
          <div className="col-lg-12">
            <div className="case-item">
              <strong>Block Name:</strong>
              <span>{caseData.cadCam.obj?.zirconName} {caseData.cadCam.obj?.emaxName} {caseData.cadCam.obj?.implantName} {caseData.cadCam.obj?.study}</span>
            </div>
          </div> 
          }
          <div className="col-lg-4">
            <div className="case-item">
              <strong>Patient's Name:</strong>
              <span>{caseData.patientName}</span>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="wrapper-case-item">
              <div className="case-item">
                <strong>Gender:</strong>
                <span>{caseData.gender}</span>
              </div>
              <div className="case-item">
                <strong>Age:</strong>
                <span>{caseData.age}</span>
              </div>
              {/* <div className="case-item">
                <strong>Mob:</strong>
                <span>{caseData.patientPhone}</span>
              </div> */}
            </div>
          </div>
          <div className="col-lg-12">
            <div className="wrapper-case-item">
              <div className="case-item">
                <strong>Shade:</strong>
                <span>
                  {caseData.shadeCase.shade
                    ? caseData.shadeCase.shade
                    : "undefined"}
                </span>
              </div>
              <div className="case-item">
                <strong>Stump Shade:</strong>
                <span>
                  {caseData.shadeCase.stumpShade
                    ? caseData.shadeCase.stumpShade
                    : "undefined"}
                </span>
              </div>
              <div className="case-item">
                <strong>Ging Shade:</strong>
                <span>
                  {caseData.shadeCase.gingShade
                    ? caseData.shadeCase.gingShade
                    : "undefined"}
                </span>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="wrapper-case-item">
              <div className="case-item">
                <strong>Occlusal Staining:</strong>
                <span>
                  {caseData.occlusalStaining
                    ? caseData.occlusalStaining
                    : "undefined"}
                </span>
              </div>
              <div className="case-item">
                <strong>Translucency:</strong>
                <span>
                  {caseData.translucency ? caseData.translucency : "undefined"}
                </span>
              </div>
              <div className="case-item">
                <strong>Texture:</strong>
                <span>{caseData.texture ? caseData.texture : "undefined"}</span>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="teeth-block">
              {numOfTeeth.teeth_top_left
                .slice()
                .reverse()
                .map((item, index) => (
                  <span
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                    className="teeth-item"
                    onClick={() => chooseTeeth(item, teethNumbers.find((t) => t.teethNumber === item.name),"teeth_bottom_left")}
                    style={{
                      backgroundColor: teethNumbers.find(
                        (t) => t.teethNumber === item.name
                      )
                        ? teethNumbers.find((t) => t.teethNumber === item.name)
                            .color
                        : "#fff",
                    }}
                  >
                    {item.name}
                    {teethNumbers.find((t) => t.teethNumber === item.name) && (
                      <button
                        type="button"
                        className="teeth-sup"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        data-bs-target="#staticBackdrop"
                        title={
                          teethNumbers.find((t) => t.teethNumber === item.name)
                            ? teethNumbers.find(
                                (t) => t.teethNumber === item.name
                              ).name
                            : ""
                        }
                      >
                        <i class="fa-solid fa-circle-info"></i>
                      </button>
                    )}
                  </span>
                ))}
            </div>
          </div>
          <div class="col-lg-6">
            <div class="teeth-block">
              {numOfTeeth.teeth_top_right.map((item, index) => (
                <span
                  data-bs-toggle="modal"
                  data-bs-target="#chooseNaturalModal"
                  className="teeth-item"
                  onClick={() => chooseTeeth(item, teethNumbers.find((t) => t.teethNumber === item.name) ,"teeth_bottom_left")}
                  style={{
                    backgroundColor: teethNumbers.find(
                      (t) => t.teethNumber === item.name
                    )
                      ? teethNumbers.find((t) => t.teethNumber === item.name)
                          .color
                      : "#fff",
                  }}
                >
                  {item.name}
                  {teethNumbers.find((t) => t.teethNumber === item.name) && (
                    <button
                      type="button"
                      className="teeth-sup"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title={
                        teethNumbers.find((t) => t.teethNumber === item.name)
                          ? teethNumbers.find(
                              (t) => t.teethNumber === item.name
                            ).name
                          : ""
                      }
                    >
                      <i class="fa-solid fa-circle-info"></i>
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
          <div class="col-lg-6">
            <div class="teeth-block">
              {numOfTeeth.teeth_bottom_left
                .slice()
                .reverse()
                .map((item, index) => (
                  <span
                    data-bs-toggle="modal"
                    data-bs-target="#chooseNaturalModal"
                    className="teeth-item"
                    onClick={() => chooseTeeth(item, teethNumbers.find((t) => t.teethNumber === item.name),"teeth_bottom_left")}
                    style={{
                      backgroundColor: teethNumbers.find(
                        (t) => t.teethNumber === item.name
                      )
                        ? teethNumbers.find((t) => t.teethNumber === item.name)
                            .color
                        : "#fff",
                    }}
                  >
                    {item.name}
                    {teethNumbers.find((t) => t.teethNumber === item.name) && (
                      <button
                        type="button"
                        className="teeth-sup"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={
                          teethNumbers.find((t) => t.teethNumber === item.name)
                            ? teethNumbers.find(
                                (t) => t.teethNumber === item.name
                              ).name
                            : ""
                        }
                      >
                        <i class="fa-solid fa-circle-info"></i>
                      </button>
                    )}
                  </span>
                ))}
            </div>
          </div>
          <div class="col-lg-6">
            <div class="teeth-block">
              {numOfTeeth.teeth_bottom_right.map((item, index) => (
                <span
                  data-bs-toggle="modal"
                  data-bs-target="#chooseNaturalModal"
                  className="teeth-item"
                  onClick={() => chooseTeeth(item, teethNumbers.find((t) => t.teethNumber === item.name),"teeth_bottom_left")}
                  style={{
                    backgroundColor: teethNumbers.find(
                      (t) => t.teethNumber === item.name
                    )
                      ? teethNumbers.find((t) => t.teethNumber === item.name)
                          .color
                      : "#fff",
                  }}
                >
                  {item.name}
                  {teethNumbers.find((t) => t.teethNumber === item.name) && (
                    <button
                      type="button"
                      className="teeth-sup"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title={
                        teethNumbers.find((t) => t.teethNumber === item.name)
                          ? teethNumbers.find(
                              (t) => t.teethNumber === item.name
                            ).name
                          : ""
                      }
                    >
                      <i class="fa-solid fa-circle-info"></i>
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
          <div className="col-lg-12">
            <div className="job-description mt-3">
              <strong>Job Description:</strong>
              {/* <p>{caseData.jobDescription}</p> */}
              <textarea className="form-control mt-3"  disabled={true} rows={6}>
                {caseData.jobDescription}
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Modal for Natural of works */}
    <div
      class="modal fade"
      id="chooseNaturalModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog ">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h1 class="modal-title fs-5" id="exampleModalLabel">
              Teeth {teethData?.name}
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            {naturalOfWorks.map((item, index) => (
              <div className="natural-item"   style = {{
                backgroundColor: item.name === naturalOfWork?.name ? 'rgb(242 242 242)' : ''
              }}>
                <div className="form-check">
                  <label className="form-check-label" htmlFor={item.name}>
                    {item.name}
                  </label>
                </div>
                <span
                  className="color-natural"
                  style={{ backgroundColor: item.color }}
                ></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
export default ViewCase