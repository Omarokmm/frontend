
import axios, { all } from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../../../helper/toaster";
import * as _global from "../../../config/global";
import Select from "react-select";
import './Shipments.css'
import { useReactToPrint } from "react-to-print";
const initialData = {
  courierCompany: "",
  trackingNumber: "",
  shipmentType: "",
  sentDate: "",
  dentistObj: [],
  estimatedDeliveryDate: "",
  deliveryDate: "",
  status: "",
  casesIds: [],
  remarks: "",
  notes: "",
  logs: [],
};

const Shipments = () => {
  const userRef = useRef();
  const userRef1 = useRef();
  const userRef2 = useRef();
  const userRef3 = useRef();
  const userRefShipping = useRef();
  const departments = JSON.parse(localStorage.getItem("departments"))
  const user = JSON.parse(localStorage.getItem("user"))
  const [shipmentModel, setShipmentModel] = useState(initialData);
  const [allShipments, setAllShipments] = useState([]);
  const [buffAllShipments, setBuffAllShipments] = useState([]);
  const [onTheWayShipments, setOnTheWayShipments] = useState([]);
  const [holdShipments, setHoldShipments] = useState([]);
  const [deliveredShipments, setDeliveredShipments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorsOptions, setDoctorsOptions] = useState([]);
  const [casesOptions, setCasesOptions] = useState([]);
  const [searchText, setSearchText] = useState([]);
  const [buffShipment, setBuffShipment] = useState({});
  const [defaultValueDoctor, setDefaultValueDoctor] = useState("");
  const [cases, setCases] = useState([]);
  const [dentistObj, setDentistObj] = useState({
    id: "",
    name: "",
  });
  const [selectedOption, setSelectedOption] = useState([]);
  const [selectedOptionDentists, setSelectedOptionDentists] = useState([]);
  useEffect(() => {
    // get Shipments
    axios
      .get(`${_global.BASE_URL}shipments`)
      .then((res) => {
        const result = res.data;
        console.log("result Shipments", result);
        setAllShipments(result)
        setBuffAllShipments(result)
        setOnTheWayShipments(result.filter(r => r.status === "On The Way"))
        setHoldShipments(result.filter(r => r.status === "Hold"))
        setDeliveredShipments(result.filter(r => r.status === "Delivered"))
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
              // label: `${c.firstName} ${c.lastName}(${c.clinicName})`,
              // _id: c._id,
              label: `${c.firstName} ${c.lastName}(${c.clinicName})`,
              value: c._id,
            };
          })
        );
        console.log(result);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
      });
    //  get cases 
    axios
      .get(`${_global.BASE_URL}cases`)
      .then((res) => {
        const result = res.data;
        setCases(result)
        setCasesOptions(
          res.data.map((c) => {
            return {
              label: `${c.caseNumber}`,
              value: c._id,
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
  const handleUpdateChange = (event) => {
    const { name, value } = event.target;
    setBuffShipment((prevFormData) => ({ ...prevFormData, [name]: value }));
  };
  const searchByName = (searchText, name) => {
    setSearchText(searchText);
    if (name === "allShipments") {
      if (searchText !== "") {
        const filteredAllshipments = allShipments.filter(
          (item) =>
            item.trackingNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase())
        );
        setAllShipments(filteredAllshipments);
      } else {
        setAllShipments(buffAllShipments);
      }
    }
    if (name === "onTheWay") {
      if (searchText !== "") {
        const filteredAllshipments = onTheWayShipments.filter(
          (item) =>
            item.trackingNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase())
        );
        setOnTheWayShipments(filteredAllshipments);
      } else {
        setOnTheWayShipments(buffAllShipments.filter(r => r.status === "On The Way"));
      }
    }
    if (name === "holding") {
      if (searchText !== "") {
        const filteredAllshipments = holdShipments.filter(
          (item) =>
            item.trackingNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase())
        );
        setHoldShipments(filteredAllshipments);
      } else {
        setHoldShipments(
          buffAllShipments.filter(r => r.status === "Hold")
        );
      }
    }
    if (name === "delivered") {
      if (searchText !== "") {
        const filteredAllshipments = deliveredShipments.filter(
          (item) =>
            item.trackingNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase())
        );
        setDeliveredShipments(filteredAllshipments);
      } else {
        setDeliveredShipments(buffAllShipments.filter(r => r.status === "Delivered"));
      }
    }
  };
  const updateShipment = async () => {
    let model = buffShipment
    buffShipment.logs.push({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      date: new Date(),
      msg: `Update Shipment by ${user.firstName} ${user.lastName} to ${buffShipment.notes}`,
    })
    const response = await fetch(`${_global.BASE_URL}shipments/${buffShipment._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(model),
    });
    if (response.ok) {
      showToastMessage("Updated Shipment successfully", "success");
    }
    if (!response.ok) {
      showToastMessage("Error Updated Case", "error");
    }
  }
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
  //         const filteredAllshipments = allCases.filter(
  //           (item) =>
  //             item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
  //             item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
  //             item.dentistObj?.name
  //               .toLowerCase()
  //               .includes(searchText.toLowerCase()) ||
  //             item?.patientName.toLowerCase().includes(searchText.toLowerCase())
  //         );
  //         setAllCases(filteredAllshipments);
  //       } else {
  //         setAllCases(buffAllShipments);
  //       }
  //     }
  //     if (name === "inProccess") {
  //       if (searchText !== "") {
  //         const filteredAllshipments = inProcessCases.filter(
  //           (item) =>
  //             item.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
  //             item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
  //             item.dentistObj.name
  //               .toLowerCase()
  //               .includes(searchText.toLowerCase()) ||
  //             item.patientName.toLowerCase().includes(searchText.toLowerCase())
  //         );
  //         setInProcessCases(filteredAllshipments);
  //       } else {
  //         setInProcessCases(
  //           buffAllShipments.filter(
  //             (r) =>
  //               r.cadCam.status.isStart === true &&
  //               r.ceramic.status.isEnd === false
  //           )
  //         );
  //       }
  //     }
  //     if (name === "holing") {
  //       if (searchText !== "") {
  //         const filteredAllshipments = holdingCases.filter(
  //           (item) =>
  //             item.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
  //             item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
  //             item.dentistObj.name
  //               .toLowerCase()
  //               .includes(searchText.toLowerCase()) ||
  //             item.patientName.toLowerCase().includes(searchText.toLowerCase())
  //         );
  //         setHoldingCases(filteredAllshipments);
  //       } else {
  //         setHoldingCases(buffAllShipments.filter((r) => r.isHold === true));
  //       }
  //     }
  //     if (name === "finished") {
  //       if (searchText !== "") {
  //         const filteredAllshipments = finishedCases.filter(
  //           (item) =>
  //             item?.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
  //             item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
  //             item?.dentistObj.name
  //               .toLowerCase()
  //               .includes(searchText.toLowerCase()) ||
  //             item?.patientName.toLowerCase().includes(searchText.toLowerCase())
  //         );
  //         setFinishedCases(filteredAllshipments);
  //       } else {
  //         setFinishedCases(
  //           buffAllShipments.filter((r) => r?.ceramic?.status?.isEnd === true)
  //         );
  //       }
  //     }
  //     if (name === "delay") {
  //       if (searchText !== "") {
  //         const filteredAllshipments = delayCases.filter(
  //           (item) =>
  //             item?.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
  //             item?.caseType?.toLowerCase().includes(searchText.toLowerCase()) ||
  //             item?.dentistObj.name
  //               .toLowerCase()
  //               .includes(searchText.toLowerCase()) ||
  //             item?.patientName.toLowerCase().includes(searchText.toLowerCase())
  //         );
  //         setDelayCases(filteredAllshipments);
  //       } else {
  //         setDelayCases(buffDelayCases);
  //       }
  //     }
  //   };
  const handleChangeSelect = (event) => {
    console.log("event,", event)
    setSelectedOptionDentists(event)
    console.log("selectdentists,", selectedOptionDentists)
  };
  const handleChangeCases = (selected) => {
    setSelectedOption(selected); // 'selected' is an array when 'isMulti' is true
  };
  const handleUpdateChangeCases = (selected) => {
    setBuffShipment((prevFormData) => ({ ...prevFormData, casesIds: selected }));
  };
  const AddShipment = async () => {
    let model = {
      courierCompany: shipmentModel.courierCompany,
      shippingName: shipmentModel.shippingName,
      trackingNumber: shipmentModel.trackingNumber,
      shipmentType: shipmentModel.shipmentType,
      sentDate: shipmentModel.sentDate,
      dentistObj: selectedOptionDentists,
      estimatedDeliveryDate: shipmentModel.estimatedDeliveryDate,
      deliveryDate: shipmentModel.deliveryDate,
      status: shipmentModel.status,
      casesIds: selectedOption,
      remarks: shipmentModel.notes,
      notes: shipmentModel.remarks,
      logs:
        [
          {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            date: new Date(),
            msg: `Create Shipment by`,
          }]
    }
    console.log(model)
    if (selectedOptionDentists.length > 0) {
      const response = await fetch(`${_global.BASE_URL}shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(model),
      });
      if (response.ok) {
        showToastMessage("Added Shipments successfully", "success");
      }
      if (!response.ok) {
        showToastMessage("Error Added Case", "error");
      }
    }
    else {
      showToastMessage("Please fill All fields have *", "error");
    }
  }
  const getLastItem = (arr) => {
    // Check if the array is not empty
    if (arr.length === 0) {
      return undefined; // or you could return null, a specific message, etc.
    }
    // Return the last item
    return arr[arr.length - 1];
  }
  const handlePrint = useReactToPrint({
    content: () => userRef.current,
    documentTitle: `Shippments`,
  })
  const handlePrintShipping = useReactToPrint({
    content: () => userRefShipping.current,
    documentTitle: `Shipping Number: # ${buffShipment.trackingNumber}, Shipping Company:  ${buffShipment.courierCompany}`,
  })
  const editBuffShipment = (item) => {
    setBuffShipment(item)
    setDefaultValueDoctor({
      label: item.dentistObj.name,
      _id: item.dentistObj.id,
    })
    console.log('DEFULT', item.dentistObj)

  }
  const groupCasesByDentist = (dentistId, casesIds) => {

    // Convert casesIds to a Set of _id values for efficient lookup
    const caseIdsSet = new Set(casesIds.map(caseItem => caseItem.value));
    // Filter and group cases based on the given conditions
    const groupedCases = cases.filter(caseItem =>
      caseIdsSet.has(caseItem._id) && dentistId === caseItem.dentistObj.id
    );
    console.log("groupedCases", groupedCases);
    return groupedCases;
  }
  return (
    <div className="content shipments">
      <div className="card">
        <h5 class="card-title">
          <span>Shipments</span>
          <span className="add-user-icon">
            {(user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.super_admin || user.roles[0] === _global.allRoles.Reception) &&
              <span data-bs-toggle="modal"
                data-bs-target="#addNewShipmentModal">
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
                All ({allShipments.length}) <small></small>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                class="nav-link  bgc-warning"
                id="onetheway-tab"
                data-bs-toggle="tab"
                data-bs-target="#onetheway-tab-pane"
                type="button"
                role="tab"
                aria-controls="onetheway-tab-pane"
                aria-selected="true"
              >
                On The Way({onTheWayShipments.length})  <small></small>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                class="nav-link  bgc-danger"
                id="hold-tab"
                data-bs-toggle="tab"
                data-bs-target="#hold-tab-pane"
                type="button"
                role="tab"
                aria-controls="hold-tab-pane"
                aria-selected="true"
              >
                Hold ({holdShipments.length}) <small></small>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
              onClick={() => setSearchText("")}
            >
              <button
                class="nav-link  bgc-success"
                id="delivered-tab"
                data-bs-toggle="tab"
                data-bs-target="#delivered-tab-pane"
                type="button"
                role="tab"
                aria-controls="delivered-tab-pane"
                aria-selected="true"
              >
                Delivered ({deliveredShipments.length}) <small></small>
              </button>
            </li>
          </ul>
          <div
            class="tab-content"
            id="myTabContent"
            onClick={() => setSearchText("")}
          >
            {/* All Shipments */}
            <div
              class="tab-pane fade show active"
              id="allCases-tab-pane"
              role="tabpanel"
              aria-labelledby="allCases-tab"
              tabIndex="0"
            >
              {allShipments.length > 0 &&
                <div className="col-12 mb-3 print-btn">
                  <button className="btn btn-sm btn-primary " onClick={() => handlePrint()}> <i class="fas fa-print"></i> print</button>
                </div>
              }
              <div className="form-group">
                <input
                  type="text"
                  name="searchText"
                  className="form-control"
                  placeholder="Search by truck number "
                  value={searchText}
                  onChange={(e) => searchByName(e.target.value, "allShipments")}
                />
              </div>

              {allShipments.length > 0 && (
                <table ref={userRef} className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">Courier</th>
                      <th scope="col">Name </th>
                      <th scope="col">#Trucking</th>
                      <th scope="col">Sent</th>
                      <th scope="col">Status</th>
                      <th scope="col">Notes</th>
                      <th scope="col">Estimated</th>
                      <th scope="col">Remarks</th>
                      <th className="non-print" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allShipments.map((item, index) => (
                      <tr key={item._id} className={item.status == "Hold" ? "urgent-case animate-me" : "" || item.status == "Delivered" ? "table-success" : ""}>
                        <td> {item.courierCompany}</td>
                        <td>{item.shippingName}</td>
                        <td>{item.trackingNumber}</td>
                        <td>{_global.formatDateToYYYYMMDD(item.sentDate)}</td>
                        <td>
                          {item.status === "On The Way" ? (
                            <i className="fas fa-plane-departure c-primary"></i>
                          ) : item.status === "Hold" ? (
                            <i className="fas fa-pause-circle c-danger"></i>
                          ) : item.status === "Delivered" ? (
                            <i className="fas fa-check-square c-success"></i>
                          ) : null}
                        </td>
                        <td>
                          {item.notes ?
                            <details>
                              <summary>See Notes</summary>
                              <p>{item.notes}</p>
                            </details>
                            :
                            " - "
                          }
                        </td>
                        <td>{_global.formatDateToYYYYMMDD(item.estimatedDeliveryDate)}</td>
                        <td>
                          {item.remarks ?
                            <details>
                              <summary>See Remarks</summary>
                              <p>{item.remarks}</p>
                            </details>
                            :
                            " - "
                          }
                        </td>
                        <td className="non-print">
                          <div className="actions-btns">
                            <span className="c-success" data-bs-toggle="modal" data-bs-target="#viewModal" onClick={() => editBuffShipment(item)}>
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span className="c-primary ml-3" data-bs-toggle="modal" data-bs-target="#updatShipmentModal" onClick={() => editBuffShipment(item)}>
                              <i class="fas fa-edit"></i>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {allShipments.length <= 0 && (
                <div className="no-content">No Shipments Added yet!</div>
              )}
            </div>
            {/* On the Way */}
            <div
              class="tab-pane fade show "
              id="onetheway-tab-pane"
              role="tabpanel"
              aria-labelledby="onetheway-tab"
              tabIndex="0"
            >
              {/* {onTheWayShipments.length > 0 &&
                <div className="col-12 mb-3 print-btn">
                  <button className="btn btn-sm btn-primary " onClick={() => handlePrint()}> <i class="fas fa-print"></i> print</button>
                </div>
              } */}
              <div className="form-group">
                <input
                  type="text"
                  name="searchText"
                  className="form-control"
                  placeholder="Search by truck number "
                  value={searchText}
                  onChange={(e) => searchByName(e.target.value, "onTheWay")}
                />
              </div>
              {onTheWayShipments.length > 0 && (
                <table ref={userRef1} className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">Courier</th>
                      <th scope="col">Name </th>
                      <th scope="col">#Trucking</th>
                      <th scope="col">Sent</th>
                      <th scope="col">Status</th>
                      <th scope="col">Notes</th>
                      <th scope="col">Estimated</th>
                      <th scope="col">Remarks</th>
                      <th className="non-print" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onTheWayShipments.map((item, index) => (
                      <tr key={item._id}>
                        <td> {item.courierCompany}</td>
                        <td>{item.shippingName}</td>
                        <td>{item.trackingNumber}</td>
                        <td>{_global.formatDateToYYYYMMDD(item.sentDate)}</td>
                        <td>
                          {item.status === "On The Way" ? (
                            <i className="fas fa-plane-departure c-primary"></i>
                          ) : item.status === "Hold" ? (
                            <i className="fas fa-pause-circle c-danger"></i>
                          ) : item.status === "Delivered" ? (
                            <i className="fas fa-check-square c-success"></i>
                          ) : null}
                        </td>
                        <td>
                          {item.notes ?
                            <details>
                              <summary>See Notes</summary>
                              <p>{item.notes}</p>
                            </details>
                            :
                            " - "
                          }
                        </td>
                        <td>{_global.formatDateToYYYYMMDD(item.estimatedDeliveryDate)}</td>
                        <td>
                          {item.remarks ?
                            <details>
                              <summary>See Remarks</summary>
                              <p>{item.remarks}</p>
                            </details>
                            :
                            " - "
                          }
                        </td>                        <td className="non-print">
                          <div className="actions-btns">
                            <span className="c-success" data-bs-toggle="modal" data-bs-target="#viewModal" onClick={() => editBuffShipment(item)}>
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span className="c-primary ml-3" data-bs-toggle="modal" data-bs-target="#updatShipmentModal" onClick={() => editBuffShipment(item)}>
                              <i class="fas fa-edit"></i>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {onTheWayShipments.length <= 0 && (
                <div className="no-content">No Shipments  on The Way  yet!</div>
              )}
            </div>
            {/* hold */}
            <div
              class="tab-pane fade show "
              id="hold-tab-pane"
              role="tabpanel"
              aria-labelledby="hold-tab"
              tabIndex="0"
            >
              {/* {holdShipments.length > 0 &&
                <div className="col-12 mb-3 print-btn">
                  <button className="btn btn-sm btn-primary " onClick={() => handlePrint()}> <i class="fas fa-print"></i> print</button>
                </div>
              } */}
              <div className="form-group">
                <input
                  type="text"
                  name="searchText"
                  className="form-control"
                  placeholder="Search by truck number "
                  value={searchText}
                  onChange={(e) => searchByName(e.target.value, "holding")}
                />
              </div>
              {holdShipments.length > 0 && (
                <table ref={userRef2} className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">Courier</th>
                      <th scope="col">Name </th>
                      <th scope="col">#Trucking</th>
                      <th scope="col">Sent</th>
                      <th scope="col">Status</th>
                      <th scope="col">Notes</th>
                      <th scope="col">Estimated</th>
                      <th scope="col">Remarks</th>
                      <th className="non-print" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdShipments.map((item, index) => (
                      <tr key={item._id}>
                        <td> {item.courierCompany}</td>
                        <td>{item.shippingName}</td>
                        <td>{item.trackingNumber}</td>
                        <td>{_global.formatDateToYYYYMMDD(item.sentDate)}</td>
                        <td>
                          {item.status === "On The Way" ? (
                            <i className="fas fa-plane-departure c-primary"></i>
                          ) : item.status === "Hold" ? (
                            <i className="fas fa-pause-circle c-danger"></i>
                          ) : item.status === "Delivered" ? (
                            <i className="fas fa-check-square c-success"></i>
                          ) : null}
                        </td>
                        <td>
                          {item.notes ?
                            <details>
                              <summary>See Notes</summary>
                              <p>{item.notes}</p>
                            </details>
                            :
                            " - "
                          }
                        </td>
                        <td>{_global.formatDateToYYYYMMDD(item.estimatedDeliveryDate)}</td>
                        <td>
                          {item.remarks ?
                            <details>
                              <summary>See Remarks</summary>
                              <p>{item.remarks}</p>
                            </details>
                            :
                            " - "
                          }
                        </td>                        <td className="non-print">
                          <div className="actions-btns">
                            <span className="c-success" data-bs-toggle="modal" data-bs-target="#viewModal" onClick={() => editBuffShipment(item)}>
                              <i class="fa-solid fa-eye"></i>
                            </span>
                            <span className="c-primary ml-3" data-bs-toggle="modal" data-bs-target="#updatShipmentModal" onClick={() => editBuffShipment(item)}>
                              <i class="fas fa-edit"></i>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {holdShipments.length <= 0 && (
                <div className="no-content">No Shipments  Hold  yet!</div>
              )}
            </div>
            {/* Delivered */}
            <div
              class="tab-pane fade show "
              id="delivered-tab-pane"
              role="tabpanel"
              aria-labelledby="delivered-tab"
              tabIndex="0"
            >
              {/* {deliveredShipments.length > 0 &&
                <div className="col-12 mb-3 print-btn">
                  <button className="btn btn-sm btn-primary " onClick={() => handlePrint()}> <i class="fas fa-print"></i> print</button>
                </div>
              } */}
              <div className="form-group">
                <input
                  type="text"
                  name="searchText"
                  className="form-control"
                  placeholder="Search by truck number "
                  value={searchText}
                  onChange={(e) => searchByName(e.target.value, "delivered")}
                />
              </div>
              {deliveredShipments.length > 0 && (
                <table ref={userRef3} className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th scope="col">Courier</th>
                      <th scope="col">Name </th>
                      <th scope="col">#Trucking</th>
                      <th scope="col">Sent</th>
                      <th scope="col">Status</th>
                      <th scope="col">Notes</th>
                      <th scope="col">Estimated</th>
                      <th scope="col">Remarks</th>
                      <th className="non-print" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveredShipments.map((item, index) => (
                      <tr key={item._id}>
                        <td> {item.courierCompany}</td>
                        <td>{item.shippingName}</td>
                        <td>{item.trackingNumber}</td>
                        <td>{_global.formatDateToYYYYMMDD(item.sentDate)}</td>
                        <td>
                          {item.status === "On The Way" ? (
                            <i className="fas fa-plane-departure c-primary"></i>
                          ) : item.status === "Hold" ? (
                            <i className="fas fa-pause-circle c-danger"></i>
                          ) : item.status === "Delivered" ? (
                            <i className="fas fa-check-square c-success"></i>
                          ) : null}
                        </td>
                        <td>
                          {item.notes ?
                            <details>
                              <summary>See Notes</summary>
                              <p>{item.notes}</p>
                            </details>
                            :
                            " - "
                          }
                        </td>
                        <td>{_global.formatDateToYYYYMMDD(item.estimatedDeliveryDate)}</td>
                        <td>
                          {item.remarks ?
                            <details>
                              <summary>See Remarks</summary>
                              <p>{item.remarks}</p>
                            </details>
                            :
                            " - "
                          }
                        </td>                        <td className="non-print">
                          <div className="actions-btns">
                            <span className="c-success" data-bs-toggle="modal" data-bs-target="#viewModal" onClick={() => editBuffShipment(item)}>
                              <i class="fa-solid fa-eye"></i>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {deliveredShipments.length <= 0 && (
                <div className="no-content">No Shipments  Delivered yet!</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal to Add New Shipment */}
      <div
        class="modal fade"
        id="addNewShipmentModal"
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
                          <option value="Aramex">Aramex</option>
                          <option value="Person">To Person</option>
                          
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-8">
                      <div className="form-group">
                        <label htmlFor="shippingName">Shipping Name  </label>
                        <input type="text" id="shippingName" name="shippingName" onChange={handleChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label htmlFor="trackingNumber">Doctor Name </label>
                        <Select
                          isMulti
                          name="dentistObj"
                          className="basic-single"
                          classNamePrefix="select"
                          isLoading={true}
                          value={selectedOptionDentists}
                          // isClearable={true}
                          onChange={(e) => handleChangeSelect(e)}
                          isSearchable={true}
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
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label htmlFor="trackingNumber">Tracking Number </label>
                        <input type="text" id="trackingNumber" name="trackingNumber" onChange={handleChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label htmlFor="trackingNumber">Cases </label>
                        <Select
                          isMulti
                          name="casesId"
                          className="basic-multi-select"
                          classNamePrefix="select"
                          value={selectedOption}
                          onChange={handleChangeCases}
                          options={casesOptions}
                        />
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
                          <option value="On The Way">On The Way</option>
                          <option value="Hold">Hold</option>
                          <option value="Delivered">Delivered</option>
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
              <button className="btn btn-sm btn-success" data-bs-dismiss="modal"
                onClick={(e) => AddShipment()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal to Update  Shipment */}
      <div
        class="modal fade"
        id="updatShipmentModal"
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
                Shipment ({buffShipment.trackingNumber})
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
                        <select className={`form-select`} name="courierCompany" value={buffShipment.courierCompany} onChange={handleUpdateChange} >
                          <option disabled selected>Select Courier</option>
                          <option value="DHL">DHL</option>
                          <option value="UPS">UPS</option>
                          <option value="Aramex">Aramex</option>
                          <option value="Person">To Person</option>
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
                          isMulti={true} // Enables multi-select
                          value={buffShipment.dentistObj}
                          onChange={(e) => {
                            console.log(e.label,e._id,e)
                            // setDefaultValueDoctor({
                            //   label: e.label,
                            //   value: e._id,
                            // })
                            buffShipment.dentistObj = e
                            // buffShipment.dentistObj.id = e._id
                            // buffShipment.dentistObj.name = e.label
                          }}
                          isSearchable={true}
                          options={doctorsOptions}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label htmlFor="sentDate">Sent Date</label>
                        <input type="date" id="sentDate" name="sentDate" value={_global.formatDateToYYYYMMDD(buffShipment.sentDate)} onChange={handleUpdateChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label htmlFor="trackingNumber">Tracking Number </label>
                        <input type="text" id="trackingNumber" name="trackingNumber" value={buffShipment.trackingNumber} onChange={handleUpdateChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label htmlFor="trackingNumber">Cases </label>
                        <Select
                          isMulti
                          name="casesId"
                          className="basic-multi-select"
                          classNamePrefix="select"
                          value={buffShipment.casesIds}
                          onChange={handleUpdateChangeCases}
                          options={casesOptions}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</label>
                        <input type="date" id="estimatedDeliveryDate" name="estimatedDeliveryDate" value={_global.formatDateToYYYYMMDD(buffShipment.estimatedDeliveryDate)} onChange={handleUpdateChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label htmlFor="deliveryDate">Delivery Date</label>
                        <input type="date" id="deliveryDate" name="deliveryDate" value={buffShipment.deliveryDate ? _global.formatDateToYYYYMMDD(buffShipment.deliveryDate) : ''} onChange={handleUpdateChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select className={`form-select`} id="status" name="status" value={buffShipment.status} onChange={handleUpdateChange} >
                          <option disabled selected>Select Status</option>
                          <option value="On The Way">On The Way</option>
                          <option value="Hold">Hold</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label htmlFor="Notes">Notes</label>
                        <textarea type="text" id="Notes" name="notes" onChange={handleUpdateChange} value={buffShipment.notes} rows={3} className="form-control"></textarea>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label htmlFor="remarks">Remarks</label>
                        <textarea type="text" id="remarks" name="remarks" onChange={handleUpdateChange} value={buffShipment.remarks} rows={3} className="form-control"></textarea>
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
              <button className="btn btn-sm btn-success" data-bs-dismiss="modal"
                onClick={(e) => updateShipment()}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* View Shipping  */}
      <div
        class="modal fade"
        id="viewModal"
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
                Shipment ({buffShipment.trackingNumber})
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              {/* <div className="text-right">
               <button className="btn btn-sm btn-primary " onClick={()=>handlePrintShipping()}> <i class="fas fa-print"></i> print</button>
               </div> */}
              <div ref={userRefShipping}>
                {buffShipment?.dentistObj?.map((item, index) =>
                  <div className="doctor-item" >
                    <strong key={index}>Dr. {item.label}</strong>
                    <span>{groupCasesByDentist(item.value, buffShipment.casesIds).map(item =>
                      <ul className="mt-2">
                        <li> <i>Pt </i> . {item.patientName}</li>
                      </ul>
                    )}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm bg-light" data-bs-dismiss="modal">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Shipments;
