import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../../../helper/toaster";
import { format } from "date-fns";
import * as _global from "../../../config/global";
import { useReactToPrint } from "react-to-print";
import {
  CountryDropdown,
  RegionDropdown,
  CountryRegionData,
} from "react-country-region-selector";
import Select from "react-select";
let initialClinic = {
  clinicName: "",
  dentistsIds: [],
  email: "",
  phone: "",
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  },
  specialization: "",
  registrationNumber: "",
  active: true,
  notes: [],
};

const Clinics = () => {
  const clinicsRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));
  const [clinics, setClinics] = useState([]);
  const [clinic, setClinic] = useState(initialClinic);
  const [buffClinic, setBuffClinic] = useState({});
  const [buffClinics, setBuffClinics] = useState([]);
  const [emptyFields, setEmptyFields] = useState([]);
  const [searchText, setSearchText] = useState([]);
  const [country, setCountry] = useState("");
  const [countryUpdate, setCountryUpdate] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [cityUpdate, setCityUpdate] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [doctorsOptions, setDoctorsOptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedOptionDentists, setSelectedOptionDentists] = useState([]);
  const navigate = useNavigate();
 
  useEffect(() => {
    axios
      .get(`${_global.BASE_URL}clinics`)
      .then((res) => {
        const result = res.data;
        setClinics(result);
        setBuffClinics(result);
        console.log(result);
      })
      .catch((error) => {
        console.error("Error fetching clinics:", error);
      });

    axios
      .get(`${_global.BASE_URL}doctors`)
      .then((res) => {
        const result = res.data;
        setDoctors(result);
        setDoctorsOptions(
          res.data.map((c) => {
            return {
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
  }, []);
  // Handle input changes for normal fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setClinic((prevClinic) => ({
      ...prevClinic,
      [name]: value,
    }));
  };
  // Handle input changes update for normal fields
  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setBuffClinic((prevClinic) => ({
      ...prevClinic,
      [name]: value,
    }));
  };
  const onAddClinic = async () => {
    const clincModel = {
      clinicName: clinic.clinicName,
      email: clinic.email,
      phone: clinic.phone,
      dentistsIds: [],
      address: {
        street: "",
        city: city,
        state: "",
        zipCode: "",
        country: country,
      },
      specialization: clinic.specialization,
      registrationNumber: clinic.registrationNumber,
      active: clinic.active,
      notes: clinic.notes,
    };
    console.log(clincModel);
    const response = await fetch(`${_global.BASE_URL}clinics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clincModel),
    });
    const json = await response.json();
    if (response.ok) {
      showToastMessage("Added clinic successfully", "success");
      setClinic(initialClinic);
      setCity("");
      setCountry("");
      setEmptyFields([]);
    }
    if (!response.ok) {
      console.log(json);
      showToastMessage("Added Clinic successfully", "error");
      const newClinics = [...clinics, JSON.parse(JSON.stringify(json.data))];
      setClinics(newClinics);
      setEmptyFields(json.emptyFields);
    }
  };
  const onUpdateClinic = async () => {
    const updatedClincModel = {
      clinicName:buffClinic.clinicName,
      email:buffClinic.email,
      phone:buffClinic.phone,
      dentistsIds:selectedOptionDentists,
      address:buffClinic.address,
      specialization:buffClinic.specialization,
      registrationNumber:buffClinic.registrationNumber,
      active:buffClinic.active,
      notes:buffClinic.notes,
    };
    const response = await fetch(
      `${_global.BASE_URL}clinics/${buffClinic._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedClincModel),
      }
    );
    const json = await response.json();
    if (response.ok) {
      showToastMessage("Updated clinic to successfully", "success");
    }
  };
  const searchByName = (searchText) => {
    setSearchText(searchText);
    setCountryFilter("");
    setRegionFilter("");
    if (searchText !== "") {
      const filteredclinics = buffClinics.filter((item) =>
        item.clinicName.toLowerCase().includes(searchText.toLowerCase())
      );
      setClinics(filteredclinics);
    } else {
      setClinics(buffClinics);
    }
  };
  const searchByCountry = (searchText) => {
    setCountryFilter(searchText);
    if (searchText !== "") {
      const filteredClinic = buffClinics.filter((item) =>
        item.address.country.toLowerCase().includes(searchText.toLowerCase())
      );
      setClinics(filteredClinic);
    } else {
      setClinics(buffClinics);
    }
  };
  const searchByCity = (searchText) => {
    setCountryFilter(countryFilter);
    setRegionFilter(searchText);
    if (searchText !== "") {
      const filteredClinics = buffClinics.filter(
        (item) =>
          item.address.country
            .toLowerCase()
            .includes(countryFilter.toLowerCase()) &&
          item.address.city.toLowerCase().includes(searchText.toLowerCase())
      );
      setClinics(filteredClinics);
    } else {
      setClinics(buffClinics);
    }
  };
  const handlePrint = useReactToPrint({
    content: () => clinicsRef.current,
    documentTitle: `List of Clinics`,
  });
  const selectCountry = (val) => {
    setCountry(val);
  };
  const selectRegion = (val) => {
    setRegion(val);
    setCityUpdate(val);
  };
  const handleChangeSelect = (event) => {
    console.log("selectdentists,", selectedOptionDentists);
    setSelectedOptionDentists(event)
  };
  return (
    <>
      <div className="content">
        <div className="card">
          <h5 class="card-title">
            <span>
              Clinics <small>({clinics.length})</small>
            </span>
            {(user.roles[0] === _global.allRoles.admin ||
              user.roles[0] === _global.allRoles.super_admin) && (
              <span className="add-user-icon">
                <a data-bs-toggle="modal" data-bs-target="#exampleModal">
                  {" "}
                  <i class="fa-solid fa-circle-plus"></i>
                </a>
              </span>
            )}
          </h5>
          <div className="card-body">
            <div className="row mb-2">
              <div className="col-lg-4">
                <div className="form-group">
                  <input
                    type="text"
                    name="searchText"
                    className="form-control"
                    placeholder="Search by name"
                    value={searchText}
                    onChange={(e) => searchByName(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <CountryDropdown
                  className="form-control mb-3"
                  value={countryFilter}
                  onChange={(val) => searchByCountry(val)}
                />
              </div>
              <div className="col-lg-4">
                <RegionDropdown
                  className="form-control mb-3"
                  country={countryFilter}
                  value={regionFilter}
                  onChange={(val) => searchByCity(val)}
                />
              </div>
              <div className="col-lg-2 ml-auto mb-2">
                <button
                  className="btn btn-sm btn-primary p-2 w-100"
                  onClick={() => handlePrint()}
                >
                  {" "}
                  <i class="fas fa-print"></i> print
                </button>
              </div>
            </div>
            <div ref={clinicsRef} style={{ width: "100%" }}>
              {clinics.length > 0 && (
                <table className="table text-center table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      {/* <th scope="col">Name</th> */}
                      <th scope="col">Clinic Name</th>
                      <th scope="col">Country</th>
                      {(user.roles[0] === _global.allRoles.admin ||
                        user.roles[0] === _global.allRoles.Reception ||
                        user.roles[0] === _global.allRoles.super_admin) && (
                        <th scope="col" className="non-print">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {clinics.map((item) => (
                      <tr
                        key={item._id}
                        className={`${
                          item.notes.length > 3
                            ? "table-danger"
                            : "table-default"
                        }`}
                      >
                        <td>{item.clinicName}</td>
                        <td>
                          {item?.address?.country}{" "}
                          {`${
                            item?.address?.city
                              ? "(" + item?.address?.city + ")"
                              : ""
                          }`}
                        </td>
                        <td className="non-print">
                          <div className="actions-btns ">
                            {(user.roles[0] === _global.allRoles.admin ||
                              user.roles[0] ===
                                _global.allRoles.super_admin) && (
                              <>
                                {/* <span
                            data-bs-toggle="modal"
                            data-bs-target="#addNoteModal"
                            onClick={() => setBuffClinic(item)}
                          >
                            <i class="fa-solid fa-circle-plus"></i>
                          </span> */}
                                <span
                                  data-bs-toggle="modal"
                                  data-bs-target="#updateClinicModal"
                                  onClick={() => {
                                    setBuffClinic(item);
                                    setSelectedOptionDentists(item.dentistsIds)
                                  }}
                                >
                                  <i class="fa-solid fa-pen-to-square"></i>
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {(clinics.length <= 0 || searchByName === "") && (
              <div className="no-content">Clinic Not Found</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Clinic Modal */}
      <div
        class="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                New Clinic
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="clinicName"> Clinic Name </label>{" "}
                      <input
                        type="text"
                        id="clinicName"
                        name="clinicName"
                        className={`form-control ${
                          emptyFields.includes("clinicName") ? "error" : ""
                        }`}
                        onChange={handleChange} // ✅ Uses handleChange
                        value={clinic.clinicName}
                        placeholder="Enter Clinic Name "
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="email"> Email </label>{" "}
                      <input
                        type="text"
                        id="email"
                        name="email"
                        className={`form-control ${
                          emptyFields.includes("email") ? "error" : ""
                        }`}
                        onChange={handleChange} // ✅ Uses handleChange
                        value={clinic.email}
                        placeholder="Enter Email "
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="phone"> Phone </label>{" "}
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        className={`form-control ${
                          emptyFields.includes("phone") ? "error" : ""
                        }`}
                        onChange={handleChange} // ✅ Uses handleChange
                        value={clinic.phone}
                        placeholder="Enter phone "
                      />
                    </div>{" "}
                  </div>
                  <div className="form-group">
                    <label htmlFor="country"> Country </label>{" "}
                    <div>
                      <CountryDropdown
                        className="form-control"
                        value={country}
                        onChange={(val) => selectCountry(val)}
                      />
                    </div>
                  </div>{" "}
                  <div className="form-group">
                    <label>City</label>
                    <div>
                      <RegionDropdown
                        className="form-control"
                        country={country}
                        value={region}
                        onChange={(val) => selectRegion(val)}
                      />
                    </div>
                  </div>
                </div>
              </form>{" "}
            </div>
            <div class="modal-footer ">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                onClick={(e) => onAddClinic()}
                class="btn btn-success"
                data-bs-dismiss="modal"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Clinic Modal */}
      <div
        class="modal fade"
        id="updateClinicModal"
        tabIndex="-1"
        aria-labelledby="updateClinicModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Update {buffClinic.clinicName} Clinic
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="clinicName"> Clinic Name </label>{" "}
                      <input
                        type="text"
                        id="clinicName"
                        name="clinicName"
                        className={`form-control ${
                          emptyFields.includes("clinicName") ? "error" : ""
                        }`}
                        onChange={handleChangeUpdate} // ✅ Uses handleChange
                        value={buffClinic.clinicName}
                        placeholder="Enter Clinic Name "
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label>
                        Doctor Name: <span className="required">*</span>
                      </label>
                      <Select
                        isMulti
                        name="dentistsIds"
                        className="basic-single"
                        classNamePrefix="select"
                        isLoading={true}
                        value={selectedOptionDentists}
                        isClearable={true}
                        onChange={(e) => handleChangeSelect(e)}
                        isSearchable={true}
                        options={doctorsOptions}
                      />
                      {/* <select
                  className={`form-select`}
                  onChange={handleChangeDentist}
                  name="id"
                >
                  <option selected>Select Doctor Name</option>
                  {doctors.map((doctor, index) => (
                    <option key={index} value={doctor._id}>
                      {doctor.fullName} {doctor.lastName ? doctor.lastName : ""}{" "}
                      ({doctor.clinicName ? doctor.clinicName : ""})
                    </option>
                  ))}
                </select> */}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="email"> Email </label>{" "}
                      <input
                        type="text"
                        id="email"
                        name="email"
                        className={`form-control ${
                          emptyFields.includes("email") ? "error" : ""
                        }`}
                        onChange={handleChangeUpdate} // ✅ Uses handleChange
                        value={buffClinic.email}
                        placeholder="Enter Email "
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="phone"> Phone </label>{" "}
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        className={`form-control ${
                          emptyFields.includes("phone") ? "error" : ""
                        }`}
                        onChange={handleChangeUpdate} // ✅ Uses handleChange
                        value={buffClinic.phone}
                        placeholder="Enter phone "
                      />
                    </div>{" "}
                  </div>
                  <div className="form-group">
                    <label htmlFor="country"> Country </label>{" "}
                    <div>
                      {console.log("countryUpdate", countryUpdate)}
                      <CountryDropdown
                        className="form-control"
                        value={buffClinic?.address?.country}
                        onChange={(val) => {
                          const updatedClinic = { ...buffClinic };
                          updatedClinic.address.country = val; // Replace with your desired country
                          setBuffClinic(updatedClinic);
                        }}
                      />
                    </div>
                  </div>{" "}
                  <div className="form-group">
                    <label>City</label>
                    <div>
                      {console.log("cityUpdate", cityUpdate)}
                      <RegionDropdown
                        className="form-control"
                        country={buffClinic?.address?.country}
                        value={buffClinic?.address?.city}
                        onChange={(val) => {
                          const updatedClinic = { ...buffClinic };
                          updatedClinic.address.city = val; // Replace with your desired country
                          setBuffClinic(updatedClinic);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </form>{" "}
            </div>
            <div class="modal-footer ">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                onClick={(e) => onUpdateClinic()}
                class="btn btn-success"
                data-bs-dismiss="modal"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Clinics;
