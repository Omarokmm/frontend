import { useEffect, useState } from "react";
import "./AddNewCase.css";
import axios from "axios";
import * as _global from "../../../config/global";
import { showToastMessage } from "../../../helper/toaster";
import {useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { Patch } from "react-axios";

const initialData = {
  caseNumber: "",
  caseType: "Digital",
  name: "",
  dateIn: "",
  dateOut: "",
  dentistObj: {
    id: "",
    name: "",
    phone: "",
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
  translucency: "",
  naturalOfWorks: [],
  isInvoice: false,
  isEmail: false,
  isPhoto: false,
  isHold: false,
  isRedo: false,
  oldCaseIds: [],
  redoReason:'',
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

const EditCase = () => {
  const { id } = useParams();
  console.log(id);
  const navigate = useNavigate();
  const numOfTeeth = _global.numOfTeeth;
  const user = JSON.parse(localStorage.getItem("user"));
  const [caseModel, setCaseModel] = useState(initialData);
  const [buffCaseType, setBuffCaseType] = useState(caseModel.buffCaseType);
  const [teethData, setTeethData] = useState(null);
  const [teethNumbers, setTeethNumbers] = useState([]);
  const [dentistPhone, setDentistPhone] = useState(" ");
  const [occlusalStaining, setOcclusalStaining] = useState(
    caseModel.occlusalStaining
  );
  const [texture, setTexture] = useState("");
  const [naturalOfTeeth, setNaturalOfTeeth] = useState("");
  const [defaultValueDoctor, setDefaultValueDoctor] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [naturalOfWorks, setNaturalOfWorks] = useState(_global.naturalOfWorks);
  const [dentistObj, setDentistObj] = useState({
    id: "",
    name: "",
    phone: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [doctorsOptions, setDoctorsOptions] = useState([]);
  useEffect(() => {
    // Get Case by id
    axios
      .get(`${_global.BASE_URL}cases/${id}`)
      .then((res) => {
        const result = res.data;
        console.log("case by id ", result);
        //   setDoctors(result);
        //       setDoctorsOptions(
        //         res.data.map((c) => {
        //           return {
        //             label: `${c.firstName} ${c.lastName}(${c.clinicName})`,
        //             _id: c._id,
        //           };
        //         })
        //       );
        setCaseModel(res.data);
        setBuffCaseType(result.caseType);
        setOcclusalStaining(result.occlusalStaining);
        setTexture(result.texture);
        console.log(result);
        setDentistObj(result.dentistObj);
        console.log("dentistObj", dentistObj);
        setDefaultValueDoctor({
          label: result.dentistObj.name,
          _id: result.dentistObj.id,
        });
        setTeethNumbers(result.teethNumbers);
        console.log("defaultValueDoctor", defaultValueDoctor);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
      });

    // get All Doctors
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
    setCaseModel((prevFormData) => ({ ...prevFormData, [name]: value }));
  };
  const handleChangeShade = (event) => {
    const { name, value } = event.target;
    setCaseModel((prevFormData) => ({
      ...prevFormData, // Keep the rest of the form data
      shadeCase: {
        ...prevFormData.shadeCase, // Keep the previous shadeCase properties
        [name]: value, // Update the specific shadeCase property
      },
    }));
  };
  const handleChangeOcclusal = (event) => {
    setOcclusalStaining(event.target.value);
    //  const { value, checked } = event.target;
    //  if (checked) {
    //    setOcclusalStaining((prevValues) => [...prevValues, value]); // Add value to array
    //  } else {
    //    setOcclusalStaining((prevValues) =>
    //      prevValues.filter((item) => item !== value)
    //    ); // Remove value from array
    //  }
  };
  const handleChangeTexture = (event) => {
    setTexture(event.target.value);
    // const { value, checked } = event.target;
    // if (checked) {
    //   setTexture((prevValues) => [...prevValues, value]); // Add value to array
    // } else {
    //   setTexture((prevValues) => prevValues.filter((item) => item !== value)); // Remove value from array
    // }
  };
  const handleChangeDentist = (event) => {
    const { name, value } = event.target;
    setDentistObj((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const handleChangeSelect = (event) => {
    const doctor = doctors.find((d) => d._id === event._id);
    console.log(doctor);
    setCaseModel((prevFormData) => ({
      ...prevFormData,
      address: `${doctor.address.country} ${
        doctor.address.city ? ", " + doctor.address.city : ""
      }`,
    }));
    console.log(caseModel.address);
    setDentistObj((prevFormData) => ({
      ...prevFormData,
      id: event._id,
    }));
    setDefaultValueDoctor({
      label: event.label,
      _id: event._id,
    });
  };
  const handleSubmit = async () => {
    setIsSubmit(true);
    if (dentistObj.id !== "") {
      const buffDoctor = doctors.find((doctor) => doctor._id === dentistObj.id);
      let model = {
        caseType: buffCaseType,
        dateIn: caseModel.dateIn,
        dateOut: caseModel.dateOut,
        dentistObj: {
          id: dentistObj.id,
          name: `${buffDoctor.firstName}, ${buffDoctor.lastName}, (${buffDoctor.clinicName})`,
          phone: dentistPhone,
        },
        address: caseModel.address,
        patientName: caseModel.patientName,
        age: caseModel.age,
        gender: caseModel.gender,
        patientPhone: caseModel.patientPhone,
        shadeCase: caseModel.shadeCase,
        occlusalStaining: occlusalStaining,
        texture: texture,
        jobDescription: caseModel.jobDescription,
        isInvoice: caseModel.isInvoice,
        isEmail: caseModel.isEmail,
        isPhoto: caseModel.isPhoto,
        isHold: caseModel.isHold,
        isStudy: caseModel.isStudy,
        isUrgent: caseModel.isUrgent,
        isRedo: caseModel.isRedo,
        oldCaseIds: caseModel.oldCaseIds || [],
        teethNumbers: teethNumbers,
        naturalOfWorks: caseModel.naturalOfWorks,
        redoReason: caseModel.redoReason ? caseModel.redoReason : "",
        translucency: caseModel.translucency,
        photos: caseModel.photos,
        fitting: caseModel.fitting,
        plaster: caseModel.plaster,
        ceramic: caseModel.ceramic,
        cadCam: caseModel.cadCam,
        designing: caseModel.designing,
        qualityControl: caseModel.qualityControl,
        receptionPacking: caseModel.receptionPacking,
        delivering: caseModel.delivering,
        logs: caseModel.logs.push({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          date: new Date(),
          msg: "Updated Case by",
        }
      ),
        deadline: caseModel.dateOut,
        dateReceived: caseModel.dateReceived,
        dateReceivedInEmail: caseModel.dateReceivedInEmail,
        notes: caseModel.notes,
      };
     
       const response = await fetch(`${_global.BASE_URL}cases/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(model),
        });
        if (response.ok) {
          setIsSubmit(false);
          navigate("/layout/cases");
          showToastMessage("Updated Case successfully", "success");
        }
        if (!response.ok) {
          setIsSubmit(false);
          showToastMessage("Error Updated Case", "error");
        }
    } else {
      setIsSubmit(false);
      showToastMessage("Please fill All fields have *", "error");
    }
  };
  const chooseTeeth = (item, type) => {
    setNaturalOfWorks(_global.naturalOfWorks);
    setTeethData(item);
    console.log(item, type);
  };
  const handleChangeColor = (color) => {
    console.log("color", color);
    setNaturalOfTeeth(color);
    console.log("naturalOfTeeth", naturalOfTeeth);
    const item = naturalOfWorks.find((item) =>
      item.name.toLowerCase().includes(naturalOfTeeth.toLowerCase())
    );
    console.log(teethNumbers);
    console.log("teethData.name", teethData);
    console.log("teethNumbers", teethNumbers);
    const teethNumIndex = teethNumbers.findIndex(
      (t) => t.teethNumber === teethData.name
    );
    console.log(teethNumIndex);
    if (teethNumIndex !== -1) {
      const updatedTeethNumbers = [...teethNumbers];
      // If item already exists, update its color
      console.log("item", item);
      console.log(
        "updatedTeethNumbers[teethNumIndex]",
        updatedTeethNumbers[teethNumIndex]
      );
      updatedTeethNumbers[teethNumIndex].color = item.color;
      updatedTeethNumbers[teethNumIndex].natural = item;
      updatedTeethNumbers[teethNumIndex].name = item.name;
      setTeethNumbers(updatedTeethNumbers);
    } else {
      const updatedTeethNumbers = [...teethNumbers];
      updatedTeethNumbers.push({
        natural: item,
        name: item.name,
        teethNumber: teethData.name,
        color: item.color,
      });
      setTeethNumbers(updatedTeethNumbers);
    }
  };
  const chooseColor = () => {
    handleChangeColor(naturalOfTeeth);
  };
  const resetTeeth = () => {
    const updatedTeethNumbers = [...teethNumbers];
    const afterUpdatedTeethNumbers = updatedTeethNumbers.filter(
      (item) => item.teethNumber !== teethData.name
    );
    setTeethNumbers(afterUpdatedTeethNumbers);
    console.log(teethNumbers);
  };
  const backHistory = () => {
    window.history.back();
  };
  return (
    <div className="content ">
      <div className="card">
        <h5 class="card-title edit-case-title">
          <span className="back-step" onClick={() => backHistory()}>
            <i class="fa-solid fa-arrow-left-long"></i>
          </span>
          <span>
            Edit Case <b>#{caseModel.caseNumber} </b>
          </span>
        </h5>
        <div className="card-body">
          <div class="row">
            {/* <div className="col-lg-12">
              <label>Case Type</label>
              <div className="type-case">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    value={caseModel.caseType}
                    name="caseType"
                    onChange={(e) => setBuffCaseType(e.target.value)}
                    id="flexRadioDefault1"
                    checked={buffCaseType === "Physical"}
                  />
                  <label class="form-check-label" for="flexRadioDefault1">
                    Physical{" "}
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="caseType"
                    value={caseModel.caseType}
                    onChange={(e) => setBuffCaseType(e.target.value)}
                    id="flexRadioDefault2"
                    checked={buffCaseType === "Digital"}
                  />
                  <label class="form-check-label" for="flexRadioDefault2">
                    Digital{" "}
                  </label>
                </div>
              </div>
            </div> */}
            {/* date in */}
            <div className="col-lg-4">
              <div className="form-group">
                <label>
                  DATE IN: <span className="required">*</span>
                </label>
                <input
                  type="date"
                  value={_global.formatDateToYYYYMMDD(caseModel.dateIn)}
                  name="dateIn"
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="form-group">
                <label>
                  Due To: <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="dateOut"
                  value={_global.formatDateToYYYYMMDD(caseModel.dateOut)}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            {/* <div className="col-lg-4">
              <div className="form-group">
                <label>Deadline:</label>
                <input
                  type="date"
                  name="deadline"
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div> */}
            {buffCaseType === "Digital" && (
              <div className="col-lg-4">
                <div className="form-group">
                  <label>Date Received In Email:</label>
                  <input
                    type="date"
                    name="dateReceivedInEmail"
                    value={_global.formatDateToYYYYMMDD(
                      caseModel.dateReceivedInEmail
                    )}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
            )}
            <div className="col-lg-8">
              <div className="form-group">
                <label>
                  Doctor Name: <span className="required">*</span>
                </label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  value={defaultValueDoctor}
                  isLoading={true}
                  // isClearable={true}
                  onChange={(e) => handleChangeSelect(e)}
                  isSearchable={true}
                  name="color"
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
            {/* <div className="col-lg-4">
              <div className="form-group">
                <label>Doctor Phone:</label>
                <input
                  type="text"
                  placeholder="Enter Phone"
                  onChange={(e) => setDentistPhone(e.target.value)}
                  className="form-control"
                />
              </div>
            </div> */}
            <div className="col-lg-4">
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  name="address"
                  value={caseModel?.address}
                  placeholder="Enter Address"
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="form-group">
                <label>
                  Patient Name: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={caseModel.patientName}
                  name="patientName"
                  placeholder="Enter Patient Name"
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="form-group">
                <label>Gender: </label>
                <select
                  className={`form-select`}
                  value={caseModel.gender}
                  onChange={handleChange}
                  name="gender"
                >
                  <option disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="form-group">
                <label>Patient Age: </label>
                <input
                  type="text"
                  name="age"
                  value={caseModel.age}
                  placeholder="Enter Patient Age"
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            {/* <div className="col-lg-4">
              <div className="form-group">
                <label>Patient Mob:</label>
                <input
                  type="text"
                  name="patientPhone"
                  placeholder="Enter Patient Mobile "
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div> */}
            <div className="col-lg-4">
              <div className="form-group">
                <label>Shade:</label>
                <input
                  type="text"
                  name="shade"
                  value={caseModel.shadeCase.shade}
                  placeholder="Enter Shade"
                  onChange={handleChangeShade}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="form-group">
                <label>Stump Shade:</label>
                <input
                  type="text"
                  value={caseModel.shadeCase.stumpShade}
                  name="stumpShade"
                  placeholder="Enter Stump Shade"
                  onChange={handleChangeShade}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="form-group">
                <label>Ging Shade:</label>
                <input
                  type="text"
                  name="gingShade"
                  value={caseModel.shadeCase.gingShade}
                  placeholder="Enter Stump Shade "
                  onChange={handleChangeShade}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="form-group checks-box">
                <label> Occlusal Staining:</label>
                <div className="d-flex ">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="None"
                      name="occlusalStaining"
                      id="flexCheckDefaultn"
                      onChange={handleChangeOcclusal}
                      checked={occlusalStaining === "None"}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckDefaultn"
                    >
                      None
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="occlusalStaining"
                      value="Light"
                      id="flexCheckDefaultli"
                      onChange={handleChangeOcclusal}
                      checked={occlusalStaining === "Light"}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckDefaultli"
                    >
                      Light
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="occlusalStaining"
                      value="Dark"
                      id="flexCheckChecked"
                      checked={occlusalStaining === "Dark"}
                      onChange={handleChangeOcclusal}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckChecked"
                    >
                      Dark
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="form-group checks-box">
                <label> Texture:</label>
                <div className="d-flex ">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="Smooth"
                      name="texture"
                      id="smooth_id"
                      onChange={handleChangeTexture}
                      checked={texture === "Smooth"}
                    />
                    <label className="form-check-label" htmlFor="smooth_id">
                      Smooth
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="Moderate"
                      name="texture"
                      id="moderate_id"
                      onChange={handleChangeTexture}
                      checked={texture === "Moderate"}
                    />
                    <label className="form-check-label" htmlFor="moderate_id">
                      Moderate
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="Heavy"
                      name="texture"
                      id="heavy_id"
                      onChange={handleChangeTexture}
                      checked={texture === "Heavy"}
                    />
                    <label className="form-check-label" htmlFor="heavy_id">
                      Heavy
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="form-group checks-box">
                <label> Translucency:</label>
                <div className="d-flex ">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="Normal"
                      name="translucency"
                      id="flexCheckDefaultnor"
                      onChange={handleChange}
                      checked={caseModel.translucency === "Normal"}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckDefaultnor"
                    >
                      Normal
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="translucency"
                      value="Cloudy"
                      id="flexCheckDefaultclo"
                      onChange={handleChange}
                      checked={caseModel.translucency === "Cloudy"}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckDefaultclo"
                    >
                      Cloudy
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="translucency"
                      value="high"
                      id="flexCheckCheckedhi"
                      onChange={handleChange}
                      checked={caseModel.translucency === "high"}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckCheckedhi"
                    >
                      High
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <label>Teeth Numbers </label>
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
                      style={{
                        backgroundColor: teethNumbers.find(
                          (t) => t.teethNumber === item.name
                        )
                          ? teethNumbers.find(
                              (t) => t.teethNumber === item.name
                            ).color
                          : "#fff",
                      }}
                      onClick={() => chooseTeeth(item, "teeth_bottom_left")}
                    >
                      {item.name}
                      {teethNumbers.find(
                        (t) => t.teethNumber === item.name
                      ) && (
                        <button
                          type="button"
                          className="teeth-sup"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-target="#staticBackdrop"
                          title={
                            teethNumbers.find(
                              (t) => t.teethNumber === item.name
                            )
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
                    style={{
                      backgroundColor: teethNumbers.find(
                        (t) => t.teethNumber === item.name
                      )
                        ? teethNumbers.find((t) => t.teethNumber === item.name)
                            .color
                        : "#fff",
                    }}
                    onClick={() => chooseTeeth(item, "teeth_bottom_left")}
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

                    {/* <span
                      className="teeth-sup"
                      data-toggle="tooltip"
                      data-placement="right"
                      title={
                        teethNumbers.find((t) => t.teethNumber === item.name)
                          ? teethNumbers.find(
                              (t) => t.teethNumber === item.name
                            ).name
                          : ""
                      }
                    >
                      {teethNumbers.find((t) => t.teethNumber === item.name)
                        ? teethNumbers.find((t) => t.teethNumber === item.name)
                            .name
                        : ""}
                    </span> */}
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
                      style={{
                        backgroundColor: teethNumbers.find(
                          (t) => t.teethNumber === item.name
                        )
                          ? teethNumbers.find(
                              (t) => t.teethNumber === item.name
                            ).color
                          : "#fff",
                      }}
                      onClick={() => chooseTeeth(item, "teeth_bottom_left")}
                    >
                      {item.name}
                      {teethNumbers.find(
                        (t) => t.teethNumber === item.name
                      ) && (
                        <button
                          type="button"
                          className="teeth-sup"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title={
                            teethNumbers.find(
                              (t) => t.teethNumber === item.name
                            )
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
                    style={{
                      backgroundColor: teethNumbers.find(
                        (t) => t.teethNumber === item.name
                      )
                        ? teethNumbers.find((t) => t.teethNumber === item.name)
                            .color
                        : "#fff",
                    }}
                    onClick={() => chooseTeeth(item, "teeth_bottom_left")}
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
            <div className={caseModel.isRedo ? "col-lg-6 mt-4" : "col-12 mt-4"}>
              <div className="d-flex justify-content-between">
                <label htmlFor="description">
                  {" "}
                  Job Description: <span className="required">*</span>{" "}
                </label>{" "}
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    name="isStudy"
                    role="switch"
                    checked={caseModel.isStudy} // Ensure controlled component behavior
                    onChange={(e) =>
                      setCaseModel((prev) => ({
                        ...prev,
                        ["isStudy"]: e.target.checked, // Updates `isStudy` as true/false
                      }))
                    }
                    id="flexSwitchCheckDefault"
                  />
                  <label class="form-check-label" for="flexSwitchCheckDefault">
                    Study Case
                  </label>
                </div>
              </div>
              <div className="form-group">
                <textarea
                  type="text"
                  id="description"
                  rows={5}
                  value={caseModel.jobDescription}
                  className="form-control"
                  name="jobDescription"
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          {caseModel.isRedo &&  <div className={caseModel.isRedo ? "col-lg-6 mt-4" : "col-12 mt-4"}>
              <div className="d-flex justify-content-between">
                <label htmlFor="description">
                  {" "}
                  Redo Reason: <span className="required">*</span>{" "}
                </label>{" "}
              </div>
              <div className="form-group">
                <textarea
                  type="text"
                  id="redoReason"
                  rows={5}
                  value={caseModel.redoReason}
                  className="form-control"
                  name="redoReason"
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            }
            <div className="col-lg-12 btn-add-case">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
                // disabled={isSubmit}
              >
                Update
              </button>
            </div>
            <div className="col-lg-12 ">
              <small className="required-note">
                <span className="required">Note: </span>
                <span>
                  All fields marked with an asterisk (
                  <span className="required">* </span> ) are required.
                </span>
              </small>
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
        tabindex="-1"
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
                onClick={(e) => resetTeeth()}
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              {naturalOfWorks.map((item, index) => (
                <div className="natural-item">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="color"
                      value={item.name}
                      id={item.name}
                      onChange={(e) => handleChangeColor(e.target.value)}
                    />
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
            <div class="modal-footer ">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={(e) => resetTeeth()}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={(e) => chooseColor()}
                class="btn btn-success"
                data-bs-dismiss="modal"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EditCase;
