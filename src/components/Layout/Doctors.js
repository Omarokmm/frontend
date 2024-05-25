import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../../helper/toaster";
import { format } from "date-fns";
import * as _global from "../../config/global";
const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [buffDoctor, setBuffDoctor] = useState([]);
  const [buffDoctors, setBuffDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("");
  const [joiningDate, setJoiningDate] = useState(null);
  const [licenseExpireDate, setLicenseExpireDate] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [searchText, setSearchText] = useState([]);
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [noteDoctor, setNoteDoctor] = useState("");
  const navigate = useNavigate();
  const roles = [0, 1, 2, 3, 4, 5, 6];
  const Roles = {
    0: "admin",
    1: "manager",
    2: "teamleader",
    3: "technician",
    // Add more roles as needed
  };
  useEffect(() => {
    axios
      .get(`${_global.BASE_URL}doctors`)
      .then((res) => {
        const result = res.data;
        setDoctors(result);
        setBuffDoctors(result);
        console.log(result);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
      });
  }, []);
  const deleteDoctor = (id) => {
    axios
      .delete(`${_global.BASE_URL}doctors/${id}`)
      .then((res) => {
        const result = res.data;
        const filteredDoctors = doctors.filter(
          (doctor) => doctor._id !== result._id
        );
        setDoctors(filteredDoctors);
        showToastMessage("Deleted Doctor successfully", "success");
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
      });
  };
  const onAddDoctor = async () => {
    // e.preventDefault();
    const doctorModel = {
      firstName,
      lastName,
      email,
      password: `${firstName}123@@`,
      confirmPassword: `${firstName}123@@`,
      phone,
      gender:"Male",
      address: {
        street: "",
        city: city,
        state: "",
        zipCode: "",
        country: country,
      },
      clinicName,
      specialization,
      registrationNumber,
      notes: [],
      photo: "https://example.com/photo.jpg",
      active: true,
    };
    console.log(doctorModel);
    const response = await fetch(`${_global.BASE_URL}doctors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(doctorModel),
    });
    const json = await response.json();
    if (response.ok) {
      showToastMessage("Added Doctor successfully", "success");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setGender("");
      setCountry("");
      setCity("");
      setEmptyFields([]);
    }
    if (!response.ok) {
      console.log(json);
      showToastMessage("Added User successfully", "error");
      const newDoctors = [...doctors, JSON.parse(JSON.stringify(json.data))];
      setDoctors(newDoctors);
      setEmptyFields(json.emptyFields);
    }
  };
  const onAddNote = async () => {
    // e.preventDefault();
    buffDoctor.notes.push({
        title: noteDoctor,
        date: new Date(),
        addedBy:"Admin"
    });
    console.log(buffDoctor);
    console.log(noteDoctor);
    const response = await fetch(`${_global.BASE_URL}doctors/${buffDoctor._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buffDoctor),
    });
    const json = await response.json();
    if (response.ok) {
      setNoteDoctor("");
      showToastMessage("Added note to successfully", "success");
    }
    // if (!response.ok) {
    //   console.log(json);
    //   const newUsers = [...users, JSON.parse(JSON.stringify(json.data))];
    //   setUsers(newUsers);
    //   setEmptyFields(json.emptyFields);
    // }
  };
  const onUpdateDoctor = async () => {
  const response = await fetch(`${_global.BASE_URL}doctors/${buffDoctor._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buffDoctor),
  });
  const json = await response.json();
  if (response.ok) {
    setNoteDoctor("");
    showToastMessage("Updated note to successfully", "success");
  }
  // if (!response.ok) {
  //   console.log(json);
  //   const newUsers = [...users, JSON.parse(JSON.stringify(json.data))];
  //   setUsers(newUsers);
  //   setEmptyFields(json.emptyFields);
  // }
};
    const searchByName = (searchText) => {
      setSearchText(searchText);
      console.log(searchText);

      if (searchText !== "") {
        const filteredDoctor = buffDoctors.filter(
          (item) =>
            item.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.lastName.toLowerCase().includes(searchText.toLowerCase())
        );
        setDoctors(filteredDoctor);
      } else {
        setDoctors(buffDoctors);
      }
    };
  return (
    <>
      <div className="content">
        <div className="card">
          <h5 class="card-title">
            <span>
              Doctors <small>({doctors.length})</small>
            </span>
            <span className="add-user-icon">
              <a data-bs-toggle="modal" data-bs-target="#exampleModal">
                {" "}
                <i class="fa-solid fa-circle-plus"></i>
              </a>
            </span>
          </h5>
          <div className="card-body">
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
            {doctors.length > 0 && (
              <table className="table text-center table-bordered">
                <thead>
                  <tr className="table-secondary">
                    <th scope="col">Name</th>
                    <th scope="col">Clinic Name</th>
                    <th scope="col">Country</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((item) => (
                    <tr
                      key={item._id}
                      className={`${
                        item.notes.length > 3 ? "table-danger" : "table-default"
                      }`}
                    >
                      <td>
                        {item.firstName} {item.lastName}
                      </td>
                      <td>{item.clinicName}</td>
                      <td>{item?.address?.country}</td>
                      <td>
                        <div className="actions-btns">
                          <span
                            data-bs-toggle="modal"
                            data-bs-target="#addNoteModal"
                            onClick={() => setBuffDoctor(item)}
                          >
                            <i class="fa-solid fa-circle-plus"></i>
                          </span>
                            <span
                            data-bs-toggle="modal"
                            data-bs-target="#updateDoctorModal"
                            onClick={() => {setBuffDoctor(item) }}
                          >
                         <i class="fa-solid fa-pen-to-square"></i>
                          </span>
                          {/* <span onClick={(e) => deleteDoctor(item._id)}>
                              <i className="fa-solid fa-trash-can"></i>
                            </span> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {(doctors.length <= 0 || searchByName === "") && (
              <div className="no-content">Doctor Not Found</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      <div
        class="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                New Doctor
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
                      <label htmlFor="firstName"> First Name </label>{" "}
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className={`form-control ${
                          emptyFields.includes("firstName") ? "error" : ""
                        }`}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                        }}
                        value={firstName}
                        placeholder="Enter First Name"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="lastName"> Last Name </label>{" "}
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className={`form-control ${
                          emptyFields.includes("lastName") ? "error" : ""
                        }`}
                        onChange={(e) => {
                          setLastName(e.target.value);
                        }}
                        value={lastName}
                        placeholder="Enter Last Name "
                      />
                    </div>{" "}
                  </div>
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
                        onChange={(e) => {
                          setClinicName(e.target.value);
                        }}
                        value={clinicName}
                        placeholder="Enter Clinic Name "
                      />
                    </div>{" "}
                  </div>
                  {/* <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="email"> Email </label>{" "}
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-control ${
                          emptyFields.includes("email") ? "error" : ""
                        }`}
                        onChange={(e) => {
                          setEmail(e.target.value);
                        }}
                        value={email}
                        placeholder="Enter Email"
                      />
                    </div>{" "}
                  </div> */}
                  {/* <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="password"> Password </label>{" "}
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className={`form-control ${
                          emptyFields.includes("password") ? "error" : ""
                        }`}
                        onChange={(e) => {
                          setPassword(e.target.value);
                        }}
                        value={password}
                        placeholder="Enter Password"
                      />
                    </div>{" "}
                  </div> */}
                  {/* <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="phone"> Phone </label>{" "}
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        className={`form-control ${
                          emptyFields.includes("phone") ? "error" : ""
                        }`}
                        onChange={(e) => {
                          setPhone(e.target.value);
                        }}
                        value={phone}
                        placeholder="Enter Phone"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="country"> Country </label>{" "}
                      <input
                        type="text"
                        id="country"
                        name="country"
                        className={`form-control ${
                          emptyFields.includes("country") ? "error" : ""
                        }`}
                        onChange={(e) => {
                          setCountry(e.target.value);
                        }}
                        value={country}
                        placeholder="Enter Country"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="city"> City </label>{" "}
                      <input
                        type="text"
                        id="city"
                        name="city"
                        className={`form-control ${
                          emptyFields.includes("city") ? "error" : ""
                        }`}
                        onChange={(e) => {
                          setCity(e.target.value);
                        }}
                        value={city}
                        placeholder="Enter City"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="gender"> Gender </label>{" "}
                      <select
                        className={`form-select ${
                          emptyFields.includes("gender") ? "error" : ""
                        }`}
                        aria-label="Default select example"
                        onChange={(e) => {
                          setGender(e.target.value);
                        }}
                        value={gender}
                      >
                        <option selected>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>{" "}
                  </div> */}
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
                onClick={(e) => onAddDoctor()}
                class="btn btn-success"
                data-bs-dismiss="modal"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Doctor Modal */}
      <div
        class="modal fade"
        id="updateDoctorModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Update Doctor
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
                      <label htmlFor="firstName"> First Name </label>{" "}
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="form-control"
                        disabled={true}
                        value={buffDoctor.firstName}
                        placeholder="Enter First Name"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="lastName"> Last Name </label>{" "}
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="form-control"
                        disabled={true}
                         value={buffDoctor.lastName}
                        placeholder="Enter Last Name "
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="clinicName"> Clinic Name </label>{" "}
                      <input
                        type="text"
                        id="clinicName"
                        name="clinicName"
                        className="form-control"
                        disabled={true}
                        value={buffDoctor.clinicName}
                        placeholder="Enter Clinic Name "
                      />
                    </div>{" "}
                  </div>
                     <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="country"> Country </label>{" "}
                      <input
                        type="text"
                        id="country"
                        name="country"
                        className="form-control"
                        value={buffDoctor?.address?.country}
                        onChange={(e)=>{
                                const updatedDoctor = { ...buffDoctor };
                                updatedDoctor.address.country = e.target.value; // Replace with your desired country
                                setBuffDoctor(updatedDoctor);
                        }}
                        placeholder="Enter Country "
                      />
                    </div>{" "}
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
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => onUpdateDoctor()}
                class="btn btn-success"
                data-bs-dismiss="modal"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Add Note Modal */}
      <div
        class="modal fade"
        id="addNoteModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                {buffDoctor.firstName} {buffDoctor.lastName}
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div className="col-lg-12">
                <div className="form-group">
                  <label htmlFor="noteUser"> New Note </label>{" "}
                  <input
                    type="text"
                    id="noteUser"
                    name="noteUser"
                    className={`form-control`}
                    onChange={(e) => {
                      setNoteDoctor(e.target.value);
                    }}
                    value={noteDoctor}
                    placeholder="Enter note "
                  />
                </div>{" "}
              </div>
              <div className="col-lg-12">
                <h6 className="old-notes">Previous Notes</h6>

                {buffDoctor?.notes?.length <= 0 && (
                  <div className="text-center mt-4 mb-4">
                    No notes have been added yet!
                  </div>
                )}

                {buffDoctor?.notes?.length > 0 && (
                  <ol>
                    {buffDoctor?.notes?.map((noteItem, index) => (
                      <li key={index}>
                        <div className="note-view">
                          <span>{noteItem.title}</span>
                          <span>{format(noteItem.date, "MMMM do yyyy")}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
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
                onClick={(e) => onAddNote()}
                class="btn btn-success"
                data-bs-dismiss="modal"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doctors;
