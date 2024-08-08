
import axios from "axios";
import { useEffect, useState } from "react";
import * as _global from "../../../config/global";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../../../helper/toaster";
import Select from "react-select";
import './Shipments.css'
const initialData = {
    courierCompany: "",
    trackingNumber: "",
    shipmentType: "",
    sentDate: "",
    dentistObj: {
        id: "",
        name: "",
    },
    estimatedDeliveryDate: "",
    deliveryDate: "",
    status :"",
    casesIds :  [],
    remarks :  "",
    notes :  "",
    logs:  [],
  };

const Shipments = ()=>{
  const departments = JSON.parse(localStorage.getItem("departments"))
  const user = JSON.parse(localStorage.getItem("user"))
 const [shipmentModel, setShipmentModel] = useState(initialData);
const [doctors, setDoctors] = useState([]);
const [doctorsOptions, setDoctorsOptions] = useState([]);
const [dentistObj, setDentistObj] = useState({
    id: "",
    name: "",
  });

  useEffect(() => {
    // get Shipments
    axios
      .get(`${_global.BASE_URL}shipments`)
      .then((res) => {
        const result = res.data;
        console.log(result);
      })
      .catch((error) => {
        console.error("Error fetching cases:", error);
      });

    //   get Doctors 
    axios
    .get(`${_global.BASE_URL}doctors`)
    .then((res) => {
      const result = res.data;
      setDoctors(result);
          setDoctorsOptions(
            res.data.map((c) => {
              return {
                label: `${c.firstName} ${c.lastName}(${c.clinicName})`,
                _id: c._id,
              };
            })
          );
      console.log(result);
    })
    .catch((error) => {
      console.error("Error fetching doctors:", error);
    });
  }, []);
  const handleChange = (event) => {
    const { name, value } = event.target;
    setShipmentModel((prevFormData) => ({ ...prevFormData, [name]: value }));
  }; 
  // delete Shipment
//   const deleteShipment = (id) => {
//     axios
//       .delete(`${_global.BASE_URL}shipments/${id}`)
//       .then((res) => {
//         const result = res.data;
//         const filteredCases = allCases.filter(
//           (user) => user._id !== result._id
//         );
//         setAllCases(filteredCases);
//         showToastMessage("deleted Shipments successfully", "success");
//       })
//       .catch((error) => {
//         console.error("Error fetching cases:", error);
//       });
//   };

//   const searchByName = (searchText, name) => {
//     setSearchText(searchText);
//     if (name === "allCases") {
//       if (searchText !== "") {
//         const filteredAllCases = allCases.filter(
//           (item) =>
//             item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
//             item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
//             item.dentistObj?.name
//               .toLowerCase()
//               .includes(searchText.toLowerCase()) ||
//             item?.patientName.toLowerCase().includes(searchText.toLowerCase())
//         );
//         setAllCases(filteredAllCases);
//       } else {
//         setAllCases(buffAllCases);
//       }
//     }
//     if (name === "inProccess") {
//       if (searchText !== "") {
//         const filteredAllCases = inProcessCases.filter(
//           (item) =>
//             item.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
//             item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
//             item.dentistObj.name
//               .toLowerCase()
//               .includes(searchText.toLowerCase()) ||
//             item.patientName.toLowerCase().includes(searchText.toLowerCase())
//         );
//         setInProcessCases(filteredAllCases);
//       } else {
//         setInProcessCases(
//           buffAllCases.filter(
//             (r) =>
//               r.cadCam.status.isStart === true &&
//               r.ceramic.status.isEnd === false
//           )
//         );
//       }
//     }
//     if (name === "holing") {
//       if (searchText !== "") {
//         const filteredAllCases = holdingCases.filter(
//           (item) =>
//             item.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
//             item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
//             item.dentistObj.name
//               .toLowerCase()
//               .includes(searchText.toLowerCase()) ||
//             item.patientName.toLowerCase().includes(searchText.toLowerCase())
//         );
//         setHoldingCases(filteredAllCases);
//       } else {
//         setHoldingCases(buffAllCases.filter((r) => r.isHold === true));
//       }
//     }
//     if (name === "finished") {
//       if (searchText !== "") {
//         const filteredAllCases = finishedCases.filter(
//           (item) =>
//             item?.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
//             item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
//             item?.dentistObj.name
//               .toLowerCase()
//               .includes(searchText.toLowerCase()) ||
//             item?.patientName.toLowerCase().includes(searchText.toLowerCase())
//         );
//         setFinishedCases(filteredAllCases);
//       } else {
//         setFinishedCases(
//           buffAllCases.filter((r) => r?.ceramic?.status?.isEnd === true)
//         );
//       }
//     }
//     if (name === "delay") {
//       if (searchText !== "") {
//         const filteredAllCases = delayCases.filter(
//           (item) =>
//             item?.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
//             item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
//             item?.dentistObj.name
//               .toLowerCase()
//               .includes(searchText.toLowerCase()) ||
//             item?.patientName.toLowerCase().includes(searchText.toLowerCase())
//         );
//         setDelayCases(filteredAllCases);
//       } else {
//         setDelayCases(buffDelayCases);
//       }
//     }
//   };
const handleChangeSelect = (event) => {
    const doctor = doctors.find((d) => d._id === event._id);
    setDentistObj((prevFormData) => ({
    ...prevFormData,
    id: event._id,
    name:event.label
    }));
  };
  return (
    <div className="content shipments">
      <div className="card">
        <h5 class="card-title">
          <span>Shipments</span>
          <span className="add-user-icon">
            {(user.roles[0] === _global.allRoles.admin) && 
            <span   data-bs-toggle="modal"
              data-bs-target="#caseHoldModal">
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
                All <small></small>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
            //   onClick={() => setSearchText("")}
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
                In Progress <small></small>
              </button>
            </li>
          </ul>
          <div
            class="tab-content"
            id="myTabContent"
            // onClick={() => setSearchText("")}
          >
            {/* All Cases */}
            {/* <div
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
            </div> */}
            {/* In Process */}
            {/* <div
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
            </div> */}
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
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div
              class={`modal-header  text-white bg-primary`}
            >
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                 New  Shipment
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div className="">
                <form>
                    <div className="row">
                    <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="courier_company">Courier Company</label>
                          <select className={`form-select`} name="courierCompany" onChange={handleChange} >
                            <option disabled selected>Select Courier</option>
                            <option value="DHL">DHL</option>
                            <option value="UPS">UPS</option>
                          </select>
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="form-group">
                          <label htmlFor="trackingNumber">Doctor Name </label>
                          <Select
                            className="basic-single"
                            classNamePrefix="select"
                            isLoading={true}
                            // isClearable={true}
                            onChange={(e) => handleChangeSelect(e)}
                            isSearchable={true}
                            name="color"
                            options={doctorsOptions}
                            />
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="sentDate">Sent Date</label>
                          <input type="date" id="sentDate" name="sentDate" onChange={handleChange} className="form-control" />
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="form-group">
                          <label htmlFor="trackingNumber">Tracking Number </label>
                          <input type="text" id="trackingNumber" name="trackingNumber" onChange={handleChange}  className="form-control" />
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</label>
                          <input type="date" id="estimatedDeliveryDate" name="estimatedDeliveryDate" onChange={handleChange} className="form-control" />
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="deliveryDate">Delivery Date</label>
                          <input type="date" id="deliveryDate" name="deliveryDate" onChange={handleChange} className="form-control" />
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="status">Status</label>
                          <select className={`form-select`} id="status" name="status" onChange={handleChange} >
                            <option disabled selected>Select Status</option>
                            <option value="OnTheWay">On The Way</option>
                            <option value="Hold">Hold</option>
                            <option value="Delivery">Delivery</option>
                          </select>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="form-group">
                          <label htmlFor="Notes">Notes</label>
                          <textarea type="text" id="Notes" name="notes" onChange={handleChange} rows={3} className="form-control"></textarea>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="form-group">
                          <label htmlFor="remarks">Remarks</label>
                          <textarea type="text" id="remarks" name="remarks" onChange={handleChange} rows={3} className="form-control"></textarea>
                        </div>
                    </div>
                    </div>
                </form>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm bg-light" data-bs-dismiss="modal">
                Cancel
              </button>
              <button className="btn btn-sm btn-success" data-bs-dismiss="modal" >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Shipments;
