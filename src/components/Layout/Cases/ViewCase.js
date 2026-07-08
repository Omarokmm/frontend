import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import * as _global from "../../../config/global";
import { format } from "date-fns";

import axios from "axios";
const ViewCase = ({ caseModel }) => {
  console.log("caseModelLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL", caseModel);
  const numOfTeeth = _global.numOfTeeth;
  const navigate = useNavigate();
  // const { state } = caseModel.caseModel;
  // console.log('stateeeeeeeeeeeeeeeeeeeeee111111111111111',state);

  // const [caseModel, setcaseModel] = useState(caseModel);
  // const [historyData, setHistoryData] = useState(null);
  // const [teethNumbers, setTeethNumbers] = useState(caseModel.teethNumbers);
  const [teethData, setTeethData] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  // const [naturalOfWorks, setNaturalOfWorks] = useState(_global.naturalOfWorks);
  // const [naturalOfWork, setNaturalOfWork] = useState(null);
  useEffect(() => {
    console.log("ViewCase got new data:", caseModel);
  }, [caseModel]);
  console.log("stateeeeeeeeeeeeeeeeeeeeee22222222222", caseModel);
  //  useEffect(() => {
  //    // get cases
  //    axios
  //      .get(`${_global.BASE_URL}cases/${state._id}`)
  //      .then((res) => {
  //        const result = res.data;
  //        setcaseModel(result);
  //      })
  //      .catch((error) => {
  //        console.error("Error fetching case:", error);
  //      });
  //  }, []);
  const chooseTeeth = (item, natural, type) => {
    // setNaturalOfWork(natural)
    console.log(natural);
    setTeethData(item);
    console.log(item, type);
  };
  const getFinishedDate = (item) => {
    if (item) {
      if (item.status.isEnd) {
        console.log(
          "item.actions.find(i=> i.dateEnd)?.dateEnd",
          item.namePhase,
          item.actions.find((i) => i.dateEnd)?.dateEnd
        );
        return item.actions.find((i) => i.dateEnd)?.dateEnd;
      } else {
        return "";
      }
    }
    return "";
  };
  const getFinishedName = (item) => {
    if (item) {
      if (item.status.isEnd) {
        return item.actions.find((i) => i.dateEnd)?.technicianName;
      } else {
        return "";
      }
    }
    return "";
  };
  const getStartedName = (item) => {
    if (item) {
      if (!item.status.isStart && !item.status.isEnd && item.status.isPause) {
        return item.actions.find((i) => i.dateStart)?.technicianName;
      } else {
        return "";
      }
    }
    return "";
  };
  const getStartedDate = (item) => {
    if (item) {
      if (!item.status.isStart && !item.status.isEnd && item.status.isPause) {
        return item.actions.find((i) => i.dateStart)?.dateStart;
      } else {
        return "";
      }
    }
    return "";
  };
  const backHistory = () => {
    window.history.back();
  };
  return (
    <div className="content  px-0 pt-0 view-case">
      <div className="card">
        <h5 class="card-title">
          <span>
            {/* <span className="back-step" onClick={() => backHistory()}>
              <i class="fa-solid fa-arrow-left-long"></i>
            </span> */}
            Case <span className="c-case-number">Number</span>: #
            <strong>{caseModel.caseNumber}</strong>
          </span>
          <span>
            <i
              class="fa-solid fa-truck"
              style={{
                color: caseModel?.delivering.status.isEnd
                  ? "#2ba51c "
                  : "rgb(255 63 63) ",
              }}
            ></i>
            {caseModel?.delivering?.status?.isEnd ? (
              <small className="delivering-icon">
                {_global.getFormateDate(
                  getFinishedDate(caseModel?.delivering),
                  true
                )}
              </small>
            ) : (
              <small> Not Delivered</small>
            )}
          </span>
          <span className="c-case-number">
            Case Type: <strong>{caseModel.caseType}</strong>
          </span>
          {/* <span>
          Deadline:{" "}
          <strong>
            {caseModel.deadline
              ? _global.formatDateToYYYYMMDD(caseModel.deadline)
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
                  <span>{_global.formatDateToYYYYMMDD(caseModel.dateIn)}</span>
                </div>
                <div className="date-in">
                  {" "}
                  <strong>Email:</strong>
                  <span>
                    {_global.formatDateToYYYYMMDD(
                      caseModel.dateReceivedInEmail
                    )}
                  </span>
                </div>
                <div className="date-out">
                  {" "}
                  <strong>Due Date:</strong>
                  <span>
                    {caseModel.dateOut
                      ? _global.formatDateToYYYYMMDD(caseModel.dateOut)
                      : "Unknown"}
                  </span>
                </div>
                {/* <div className="time">
                {" "}
                <strong>TIME:</strong>
                <span>
                  {caseModel.dateOut
                    ? _global.timeFromDate(caseModel.dateOut)
                    : "Unknown"}
                </span>
              </div> */}
              </div>
            </div>
            <div className="col-lg-12 mt-4">
              <strong>Case Status</strong>
              <div className="all-phases">
                {caseModel.caseType === "Physical" && (
                  <div className="phase-view">
                    <div
                      className="phaseName"
                      style={{
                        backgroundColor: caseModel?.plaster.status.isStart
                          ? "rgb(255 63 63) "
                          : caseModel?.plaster.status.isPause
                            ? "#2993df"
                            : caseModel?.plaster.status.isEnd
                              ? "#2ba51c"
                              : "red",
                      }}
                    >
                      <span className="tooltip-phase-name">
                        {getFinishedName(caseModel?.plaster)}
                      </span>
                      Plaster
                      <span className="tooltip-phase">
                        {caseModel?.plaster.status.isStart && (
                          <i class="fa-solid fa-circle-xmark c-danger"></i>
                        )}
                        {caseModel?.plaster.status.isPause && (
                          <i class="fa-solid fa-hourglass-half c-primary"></i>
                        )}
                        {caseModel?.plaster.status.isEnd && (
                          <i class="fa-solid fa-circle-check c-success"></i>
                        )}
                      </span>
                    </div>
                    <span class="arrow-right"></span>
                    <span class="arrow-right-phone">
                      <i class="fa-solid fa-right-long"></i>
                    </span>
                    <span className="tooltip-phase-date">
                      {_global.getFormateDate(
                        getFinishedDate(caseModel?.plaster),
                        true
                      )}
                    </span>
                  </div>
                )}
                <div className="phase-view">
                  <div
                    className="phaseName"
                    style={{
                      backgroundColor: caseModel?.cadCam.status.isStart
                        ? "rgb(255 63 63) "
                        : caseModel?.cadCam.status.isPause
                          ? "#2993df"
                          : caseModel?.cadCam.status.isEnd
                            ? "#2ba51c"
                            : "red",
                    }}
                  >
                    {caseModel?.cadCam.status.isEnd && <span className="tooltip-phase-name">
                      {getFinishedName(caseModel?.cadCam)}
                    </span>}
                    {!caseModel?.cadCam.status.isEnd && !caseModel?.cadCam.isStart && caseModel?.cadCam.status.isPause && <span className="tooltip-phase-name">
                      {getStartedName(caseModel?.cadCam)}
                    </span>}
                    Cad Cam
                    <span className="tooltip-phase">
                      {caseModel?.cadCam.status.isStart && (
                        <i class="fa-solid fa-circle-xmark c-danger"></i>
                      )}
                      {caseModel?.cadCam.status.isPause && (
                        <i class="fa-solid fa-hourglass-half c-primary"></i>
                      )}
                      {caseModel?.cadCam.status.isEnd && (
                        <i class="fa-solid fa-circle-check c-success"></i>
                      )}
                    </span>
                    {caseModel?.cadCam.status.isEnd && <span className="tooltip-phase-date">
                      {_global.getFormateDate(
                        getFinishedDate(caseModel?.cadCam),
                        true
                      )}
                    </span>}

                    {!caseModel?.cadCam.status.isEnd && !caseModel?.cadCam.isStart && caseModel?.cadCam.status.isPause && <span className="tooltip-phase-date">
                      {_global.getFormateDate(
                        getStartedDate(caseModel?.cadCam),
                        true
                      )}
                    </span>}
                  </div>
                  <span class="arrow-right"></span>
                  <span class="arrow-right-phone">
                    <i class="fa-solid fa-right-long"></i>
                  </span>
                </div>
                <div className="phase-view">
                  <div
                    className="phaseName"
                    style={{
                      backgroundColor: caseModel?.fitting.status.isStart
                        ? "rgb(255 63 63) "
                        : caseModel?.fitting.status.isPause
                          ? "#2993df"
                          : caseModel?.fitting.status.isEnd
                            ? "#2ba51c"
                            : "red",
                    }}
                  >
                    <span className="tooltip-phase-name">
                      {caseModel?.fitting.status.isEnd && getFinishedName(caseModel?.fitting)}
                      {!caseModel?.fitting.status.isEnd && !caseModel?.fitting.isStart && caseModel?.fitting.status.isPause && getStartedName(caseModel?.fitting)}
                    </span>
                    Fitting
                    <span className="tooltip-phase">
                      {caseModel?.fitting.status.isStart && (
                        <i class="fa-solid fa-circle-xmark c-danger"></i>
                      )}
                      {caseModel?.fitting.status.isPause && (
                        <i class="fa-solid fa-hourglass-half c-primary"></i>
                      )}
                      {caseModel?.fitting.status.isEnd && (
                        <i class="fa-solid fa-circle-check c-success"></i>
                      )}
                    </span>
                  </div>
                  <span class="arrow-right"></span>
                  {caseModel.caseType === "Digital" && (
                    <span class="arrow-right-phone ">
                      <i class="fa-solid fa-right-long"></i>
                    </span>
                  )}
                  {caseModel.caseType === "Physical" && (
                    <span class="arrow-right-phone t-90">
                      <i class="fa-solid fa-right-long"></i>
                    </span>
                  )}
                  <span className="tooltip-phase-date">
                    {caseModel?.fitting.status.isEnd && _global.getFormateDate(
                      getFinishedDate(caseModel?.fitting),
                      true
                    )}
                    {!caseModel?.fitting.status.isEnd && !caseModel?.fitting.isStart && caseModel?.fitting.status.isPause && _global.getFormateDate(
                      getStartedDate(caseModel?.fitting),
                      true
                    )}
                  </span>
                </div>
                <div className="phase-view">
                  <div
                    className="phaseName"
                    style={{
                      backgroundColor: caseModel?.ceramic.status.isStart
                        ? "rgb(255 63 63) "
                        : caseModel?.ceramic.status.isPause
                          ? "#2993df"
                          : caseModel?.ceramic.status.isEnd
                            ? "#2ba51c"
                            : "red",
                    }}
                  >
                    <span className="tooltip-phase-name">
                      {caseModel?.ceramic.status.isEnd && getFinishedName(caseModel?.ceramic)}
                      {!caseModel?.ceramic.status.isEnd && !caseModel?.ceramic.isStart && caseModel?.ceramic.status.isPause && getStartedName(caseModel?.ceramic)}
                    </span>
                    Ceramic
                    <span className="tooltip-phase">
                      {caseModel?.ceramic.status.isStart && (
                        <i class="fa-solid fa-circle-xmark c-danger"></i>
                      )}
                      {caseModel?.ceramic.status.isPause && (
                        <i class="fa-solid fa-hourglass-half c-primary"></i>
                      )}
                      {caseModel?.ceramic.status.isEnd && (
                        <i class="fa-solid fa-circle-check c-success"></i>
                      )}
                      {caseModel.caseType === "Digital" && (
                        <span class="arrow-right-phone t-90">
                          <i class="fa-solid fa-right-long"></i>
                        </span>
                      )}
                    </span>
                    <span className="tooltip-phase-date">
                      {caseModel?.ceramic.status.isEnd && _global.getFormateDate(
                        getFinishedDate(caseModel?.ceramic),
                        true
                      )}
                      {!caseModel?.ceramic.status.isEnd && !caseModel?.ceramic.isStart && caseModel?.ceramic.status.isPause && _global.getFormateDate(
                        getStartedDate(caseModel?.ceramic),
                        true
                      )}
                    </span>
                  </div>
                  <span class="arrow-right"></span>
                </div>
                <div className="phase-view">
                  <div
                    className="phaseName"
                    style={{
                      backgroundColor: caseModel?.receptionPacking.status
                        .isStart
                        ? "rgb(255 63 63) "
                        : caseModel?.receptionPacking.status.isPause
                          ? "#2993df"
                          : caseModel?.receptionPacking.status.isEnd
                            ? "#2ba51c"
                            : "red",
                    }}
                  >
                    <span className="tooltip-phase-name">
                      {caseModel?.receptionPacking.status.isEnd && getFinishedName(caseModel?.receptionPacking)}
                      {!caseModel?.receptionPacking.status.isEnd && !caseModel?.receptionPacking.isStart && caseModel?.receptionPacking.status.isPause && getStartedName(caseModel?.receptionPacking)}
                    </span>
                    Packing
                    <span className="tooltip-phase">
                      {caseModel?.receptionPacking.status.isStart && (
                        <i class="fa-solid fa-circle-xmark c-danger"></i>
                      )}
                      {caseModel?.receptionPacking.status.isPause && (
                        <i class="fa-solid fa-hourglass-half c-primary"></i>
                      )}
                      {caseModel?.receptionPacking.status.isEnd && (
                        <i class="fa-solid fa-circle-check c-success"></i>
                      )}
                    </span>
                    <span class="arrow-right-phone t-180">
                      <i class="fa-solid fa-right-long"></i>
                    </span>
                    <span className="tooltip-phase-date">
                      {caseModel?.receptionPacking.status.isEnd && _global.getFormateDate(
                        getFinishedDate(caseModel?.receptionPacking),
                        true
                      )}
                      {!caseModel?.receptionPacking.status.isEnd && !caseModel?.receptionPacking.isStart && caseModel?.receptionPacking.status.isPause && _global.getFormateDate(
                        getStartedDate(caseModel?.receptionPacking),
                        true
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="wrapper-case-item mt-3">
                <div className="case-item">
                  <strong>Clinic/Dentist's Name:</strong>
                  <span>{caseModel.dentistObj.name}</span>
                </div>
                {/* <div className="case-item">
                <strong>Telephone:</strong>
                <span>{caseModel.dentistObj.phone}</span>
              </div> */}
              </div>
            </div>
            {caseModel?.cadCam.obj && (
              <div className="col-lg-12">
                <div className="case-item">
                  <strong>Block Name:</strong>
                  <span>
                    {caseModel.cadCam.obj?.zirconName}{" "}
                    {caseModel.cadCam.obj?.emaxName}{" "}
                    {caseModel.cadCam.obj?.implantName}{" "}
                    {caseModel.cadCam.obj?.study}
                  </span>
                </div>
              </div>
            )}
            <div className="col-lg-4">
              <div className="case-item">
                <strong>Patient's Name:</strong>
                <span>{caseModel.patientName}</span>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="wrapper-case-item">
                <div className="case-item">
                  <strong>Gender:</strong>
                  <span>{caseModel.gender}</span>
                </div>
                <div className="case-item">
                  <strong>Age:</strong>
                  <span>{caseModel.age}</span>
                </div>
                {/* <div className="case-item">
                <strong>Mob:</strong>
                <span>{caseModel.patientPhone}</span>
              </div> */}
              </div>
            </div>
            <div className="col-lg-12">
              <div className="wrapper-case-item">
                <div className="case-item">
                  <strong>Shade:</strong>
                  <span>
                    {caseModel.shadeCase.shade
                      ? caseModel.shadeCase.shade
                      : "undefined"}
                  </span>
                </div>
                <div className="case-item">
                  <strong>Stump Shade:</strong>
                  <span>
                    {caseModel.shadeCase.stumpShade
                      ? caseModel.shadeCase.stumpShade
                      : "undefined"}
                  </span>
                </div>
                <div className="case-item">
                  <strong>Ging Shade:</strong>
                  <span>
                    {caseModel.shadeCase.gingShade
                      ? caseModel.shadeCase.gingShade
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
                    {caseModel.occlusalStaining
                      ? caseModel.occlusalStaining
                      : "undefined"}
                  </span>
                </div>
                <div className="case-item">
                  <strong>Translucency:</strong>
                  <span>
                    {caseModel.translucency
                      ? caseModel.translucency
                      : "undefined"}
                  </span>
                </div>
                <div className="case-item">
                  <strong>Texture:</strong>
                  <span>
                    {caseModel.texture ? caseModel.texture : "undefined"}
                  </span>
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
                      // data-bs-toggle="modal"
                      // data-bs-target="#chooseNaturalModal"
                      className="teeth-item"
                      // onClick={() => chooseTeeth(item, caseModel.teethNumbers.find((t) => t.teethNumber === item.name),"teeth_bottom_left")}
                      style={{
                        backgroundColor: caseModel.teethNumbers.find(
                          (t) => t.teethNumber === item.name
                        )
                          ? caseModel.teethNumbers?.find(
                            (t) => t.teethNumber === item.name
                          ).color
                          : "#fff",
                      }}
                    >
                      {item.name}
                      {caseModel.teethNumbers.find(
                        (t) => t.teethNumber === item.name
                      ) && (
                          <button
                            type="button"
                            className="teeth-sup"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            data-bs-target="#staticBackdrop"
                            title={
                              caseModel.teethNumbers.find(
                                (t) => t.teethNumber === item.name
                              )
                                ? caseModel.teethNumbers.find(
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
                    // data-bs-toggle="modal"
                    // data-bs-target="#chooseNaturalModal"
                    className="teeth-item"
                    // onClick={() => chooseTeeth(item, caseModel.teethNumbers.find((t) => t.teethNumber === item.name) ,"teeth_bottom_left")}
                    style={{
                      backgroundColor: caseModel.teethNumbers.find(
                        (t) => t.teethNumber === item.name
                      )
                        ? caseModel.teethNumbers.find(
                          (t) => t.teethNumber === item.name
                        ).color
                        : "#fff",
                    }}
                  >
                    {item.name}
                    {caseModel.teethNumbers.find(
                      (t) => t.teethNumber === item.name
                    ) && (
                        <button
                          type="button"
                          className="teeth-sup"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title={
                            caseModel.teethNumbers.find(
                              (t) => t.teethNumber === item.name
                            )
                              ? caseModel.teethNumbers.find(
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
                      // data-bs-toggle="modal"
                      // data-bs-target="#chooseNaturalModal"
                      className="teeth-item"
                      // onClick={() => chooseTeeth(item, caseModel.teethNumbers.find((t) => t.teethNumber === item.name),"teeth_bottom_left")}
                      style={{
                        backgroundColor: caseModel.teethNumbers.find(
                          (t) => t.teethNumber === item.name
                        )
                          ? caseModel.teethNumbers.find(
                            (t) => t.teethNumber === item.name
                          ).color
                          : "#fff",
                      }}
                    >
                      {item.name}
                      {caseModel.teethNumbers.find(
                        (t) => t.teethNumber === item.name
                      ) && (
                          <button
                            type="button"
                            className="teeth-sup"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title={
                              caseModel.teethNumbers.find(
                                (t) => t.teethNumber === item.name
                              )
                                ? caseModel.teethNumbers.find(
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
                    // data-bs-toggle="modal"
                    // data-bs-target="#chooseNaturalModal"
                    className="teeth-item"
                    // onClick={() => chooseTeeth(item, caseModel.teethNumbers.find((t) => t.teethNumber === item.name),"teeth_bottom_left")}
                    style={{
                      backgroundColor: caseModel.teethNumbers.find(
                        (t) => t.teethNumber === item.name
                      )
                        ? caseModel.teethNumbers.find(
                          (t) => t.teethNumber === item.name
                        ).color
                        : "#fff",
                    }}
                  >
                    {item.name}
                    {caseModel.teethNumbers.find(
                      (t) => t.teethNumber === item.name
                    ) && (
                        <button
                          type="button"
                          className="teeth-sup"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title={
                            caseModel.teethNumbers.find(
                              (t) => t.teethNumber === item.name
                            )
                              ? caseModel.teethNumbers.find(
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
                <div
                  className="form-control mt-3 p-3 bg-light text-dark"
                  style={{ minHeight: '150px' }}
                  dangerouslySetInnerHTML={{ __html: caseModel.jobDescription }}
                />
              </div>
            </div>

            {caseModel.isRedo && caseModel.redoReason && (
              <div className="col-lg-12">
                <div className="job-description mt-3">
                  <strong>Redo Reason:</strong>
                  <div
                    className="form-control mt-3 p-3 bg-light border-danger text-dark"
                    style={{ minHeight: '100px' }}
                    dangerouslySetInnerHTML={{ __html: caseModel.redoReason }}
                  />
                </div>
              </div>
            )}

            <div className="col-lg-12 mt-4 text-start">
              <div className="card shadow-sm border-0 bg-light rounded-3">
                <div className="card-body p-3">
                  <h6 className="card-title fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                    <i className="fa-solid fa-paperclip text-primary"></i>
                    Attachments & Case Media ({caseModel.photos ? caseModel.photos.length : 0})
                  </h6>

                  {caseModel.photos && caseModel.photos.length > 0 ? (
                    <div className="d-flex flex-wrap gap-3 mt-2">
                      {caseModel.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="position-relative border bg-white rounded shadow-sm overflow-hidden"
                          style={{ width: '140px', height: '140px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                          onClick={() => setActivePhotoIndex(index)}
                          onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.15)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          {/* Play overlay for video */}
                          {photo && photo.resourceType === 'video' && (
                            <div className="position-absolute top-50 start-50 translate-middle bg-dark bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', zIndex: 2 }}>
                              <i className="fa-solid fa-play text-white ms-1" style={{ fontSize: '0.9rem' }}></i>
                            </div>
                          )}
                          {photo && photo.resourceType === 'video' ? (
                            <video src={photo.url} className="w-100 h-100 object-fit-cover" muted />
                          ) : (
                            <img src={photo && photo.url ? photo.url : photo} alt="Case Attachment Thumbnail" className="w-100 h-100 object-fit-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border rounded bg-white text-muted">
                      <i className="fa-regular fa-image mb-2 text-secondary" style={{ fontSize: '2rem' }}></i>
                      <p className="mb-0 small fw-medium">No media or documentation files attached</p>
                      <small className="text-muted text-xs">Edit this case to upload photos or videos</small>
                    </div>
                  )}
                </div>
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
              {caseModel.naturalOfWorks.map((item, index) => (
                <div
                  className="natural-item"
                  style={{
                    backgroundColor:
                      item.name === caseModel.naturalOfWork?.name
                        ? "rgb(242 242 242)"
                        : "",
                  }}
                >
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

      {/* Lightbox Modal Overlay */}
      {activePhotoIndex !== null && caseModel.photos && caseModel.photos[activePhotoIndex] && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            transition: 'opacity 0.25s'
          }}
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Close button */}
          <button
            type="button"
            className="btn text-white position-absolute top-0 end-0 m-4"
            style={{ fontSize: '2rem', border: 'none', background: 'none' }}
            onClick={() => setActivePhotoIndex(null)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          {/* Navigation Controls */}
          {caseModel.photos.length > 1 && (
            <>
              <button
                type="button"
                className="btn text-white position-absolute start-0 m-4 shadow-none"
                style={{ fontSize: '2.5rem', border: 'none', background: 'none', top: '50%', transform: 'translateY(-50%)', zIndex: 10000 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((prevIndex) => (prevIndex === 0 ? caseModel.photos.length - 1 : prevIndex - 1));
                }}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                type="button"
                className="btn text-white position-absolute end-0 m-4 shadow-none"
                style={{ fontSize: '2.5rem', border: 'none', background: 'none', top: '50%', transform: 'translateY(-50%)', zIndex: 10000 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((prevIndex) => (prevIndex === caseModel.photos.length - 1 ? 0 : prevIndex + 1));
                }}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </>
          )}

          {/* Active item Container */}
          <div className="d-flex flex-column align-items-center justify-content-center p-3" style={{ maxWidth: '85%', maxHeight: '75%', zIndex: 9998 }} onClick={(e) => e.stopPropagation()}>
            {caseModel.photos[activePhotoIndex].resourceType === 'video' ? (
              <video
                src={caseModel.photos[activePhotoIndex].url}
                className="img-fluid rounded shadow-lg"
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
                controls
                autoPlay
              />
            ) : (
              <img
                src={caseModel.photos[activePhotoIndex].url || caseModel.photos[activePhotoIndex]}
                alt="Case Media Large"
                className="img-fluid rounded shadow-lg"
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
              />
            )}

            {/* Legend / Info bar */}
            <div className="text-white mt-3 text-center small opacity-75">
              <span>File {activePhotoIndex + 1} of {caseModel.photos.length}</span>
              {caseModel.photos[activePhotoIndex].size && (
                <span className="ms-3">({(caseModel.photos[activePhotoIndex].size / 1024).toFixed(1)} KB)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ViewCase;
