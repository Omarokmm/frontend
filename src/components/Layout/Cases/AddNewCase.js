import { useEffect, useState } from "react";
import './AddNewCase.css'
import axios from "axios";
import * as _global from "../../../config/global";
import { showToastMessage } from "../../../helper/toaster";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

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
  occlusalStaining: [],
  texture: "",
  jobDescription: "",
  teethNumbers: [],
  translucency: "",
  naturalOfWorks: [],
  isInvoice: false,
  isEmail: false,
  isPhoto: false,
  isHold: false,
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

const AddNewCase = () => {
  // const naturalOfWorks = _global.naturalOfWorks
 const navigate = useNavigate()
 const numOfTeeth = _global.numOfTeeth;
 const user = JSON.parse(localStorage.getItem("user"))
 const [caseModel, setCaseModel] = useState(initialData);
 const [buffCaseType, setBuffCaseType] = useState("Digital");
 const [teethData, setTeethData] = useState(null);
 const [teethNumbers, setTeethNumbers] = useState([]);
 const [dentistPhone, setDentistPhone] = useState(" ");
 const [occlusalStaining, setOcclusalStaining] = useState("");
 const [texture, setTexture] = useState("");
 const [naturalOfWorks, setNaturalOfWorks] = useState(_global.naturalOfWorks);
 const [dentistObj, setDentistObj] = useState({
   id: "",
   name: "",
   phone: "1",
 });
const [doctors, setDoctors] = useState([]);
const [doctorsOptions, setDoctorsOptions] = useState([]);
  useEffect(() => {
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
console.log(doctor)
setCaseModel((prevFormData) => ({
  ...prevFormData,
  address: doctor.address.country
}));
console.log(caseModel.address)
       setDentistObj((prevFormData) => ({
         ...prevFormData,
         id: event._id,
       }));
  };
  const handleSubmit = async() => {
  const buffDoctor = doctors.find(
    (doctor) => doctor._id === dentistObj.id
  );
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
    isInvoice: false,
    isEmail: false,
    isPhoto: false,
    isHold:false,
    teethNumbers: teethNumbers,
    naturalOfWorks: [],
    translucency: caseModel.translucency,
    photos: [],
    fitting: {
      namePhase: "Fitting",
      actions: [],
      status: {
        isStart: true,
        isPause: false,
        isEnd: false,
      },
      obj: {},
    },
    plaster: {
      namePhase: "Fitting",
      actions: [],
      status: {
        isStart: true,
        isPause: false,
        isEnd: false,
      },
      obj: {},
    },
    ceramic: {
      namePhase: "Ceramic",
      actions: [],
      status: {
        isStart: true,
        isPause: false,
        isEnd: false,
      },
      obj: {},
    },
    cadCam: {
      namePhase: "Cad Cam",
      actions: [],
      status: {
        isStart: true,
        isPause: false,
        isEnd: false,
      },
      obj: {},
    },
    designing: {
      namePhase: "Photo",
      actions: [],
      status: {
        isStart: true,
        isPause: false,
        isEnd: false,
      },
      obj: {},
    },
    qualityControl: {
      namePhase: "Quality Control",
      actions: [],
      status: {
        isStart: true,
        isPause: false,
        isEnd: false,
      },
      obj: {},
    },
    receptionPacking: {
      namePhase: "Reception Packing",
      actions: [],
      status: {
        isStart: true,
        isPause: false,
        isEnd: false,
      },
      obj: {},
    },
    logs: [
      {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        date: new Date(),
        msg: `Create Case by`,
      },
    ],
    deadline: caseModel.dateOut,
    dateReceived: new Date(),
    dateReceivedInEmail: caseModel.dateReceivedInEmail,
    notes: [],
  };
  console.log(model)
     const response = await fetch(`${_global.BASE_URL}cases`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(model),
     });
       if (response.ok) {
        navigate('/layout/cases')
           showToastMessage("Added Case successfully", "success");
       }
       if (!response.ok) {
         showToastMessage("Error Added Case", "error");
       }
  }
   const chooseTeeth = (item,type)=>{
    setNaturalOfWorks(_global.naturalOfWorks);
    setTeethData(item);
    console.log(item, type);
  }
  const handleChangeColor = (e) => {
      const item =  naturalOfWorks.find((item) =>
        item.name.toLowerCase().includes(e.target.value.toLowerCase())
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
    console.log(teethNumbers);
  };
  const resetTeeth = ()=>{
    const updatedTeethNumbers = [...teethNumbers];
     const afterUpdatedTeethNumbers = updatedTeethNumbers.filter(
       (item) => item.teethNumber !== teethData.name
     );
     setTeethNumbers(afterUpdatedTeethNumbers);
     console.log(teethNumbers);
  }
  return (
    <div className="content ">
      <div className="card">
        <h5 class="card-title">New Case</h5>
        <div className="card-body">
          <div class="row">
            <div className="col-lg-12">
              <label>Case Type</label>
              <div className="type-case">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    value="Physical"
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
                    value="Digital"
                    onChange={(e) => setBuffCaseType(e.target.value)}
                    id="flexRadioDefault2"
                    checked={buffCaseType === "Digital"}
                  />
                  <label class="form-check-label" for="flexRadioDefault2">
                    Digital{" "}
                  </label>
                </div>
              </div>
            </div>
            {/* date in */}
            <div className="col-lg-4">
              <div className="form-group">
                <label>DATE IN:</label>
                <input
                  type="date"
                  name="dateIn"
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="form-group">
                <label>DATE OUT:</label>
                <input
                  type="date"
                  name="dateOut"
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
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
            )}
            <div className="col-lg-8">
              <div className="form-group">
                <label>Doctor Name:</label>
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
              <label>Gender:</label>
              <select
                className={`form-select`}
                onChange={handleChange}
                name="gender"
              >
                <option selected>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Male">Female</option>
              </select>
            </div>
            <div className="col-lg-4">
              <div className="form-group">
                <label>Patient Name:</label>
                <input
                  type="text"
                  name="patientName"
                  placeholder="Enter Patient Name"
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="form-group">
                <label>Patient Age:</label>
                <input
                  type="text"
                  name="age"
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
                      id="flexCheckDefault1"
                      onChange={handleChangeOcclusal}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckDefault1"
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
                      id="flexCheckDefault2"
                      onChange={handleChangeOcclusal}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckDefault2"
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
                      id="flexCheckDefault1"
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckDefault1"
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
                      id="flexCheckDefault2"
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckDefault2"
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
                      id="flexCheckChecked"
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckChecked"
                    >
                      High
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <label>Teeth Numbers</label>
            </div>
            <div class="col-lg-6">
              <div class="p-3 text-center">
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
              <div class="text-center p-3">
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
              <div class="text-center p-3">
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
              <div class="text-center p-3">
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
            <div className="col-lg-12 mt-4">
              <div className="form-group">
                <label htmlFor="description"> Job Description: </label>{" "}
                <textarea
                  type="text"
                  id="description"
                  rows={5}
                  className="form-control"
                  name="jobDescription"
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            <div className="col-lg-12 btn-add-case">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
              >
                Add
              </button>
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
                      onChange={handleChangeColor}
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
export default AddNewCase;
