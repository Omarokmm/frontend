import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../../helper/toaster";
import { format } from "date-fns";
import * as _global from "../../config/global";
import Select from "react-select";

const Users = () => {
  const user = JSON.parse(localStorage.getItem("user"))
  const [users, setUsers] = useState([]);
  const [casesUser, setCasesUser] = useState([]);
  const [buffUsers, setBuffUsers] = useState([]);
  const [searchText, setSearchText] = useState([]);
  const [buffUser, setBuffUser] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("");
  const [joiningDate, setJoiningDate] = useState(null);
  const [licenseExpireDate, setLicenseExpireDate] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [noteUser, setNoteUser] = useState("");
  const [allCases, setAllCases] = useState([]);
  const [allBufferCases, setAllBufferCases] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [noteType, setNoteType] = useState("");
  const navigate = useNavigate();
  const roles = [0, 1, 2, 3, 4, 5, 6,7,8];
  const Roles = {
    0: "admin",
    1: "manager",
    2: "teamleader",
    3: "technician",
    4: "Reception",
    5: "Driver",
    6: "Graphic Design",
    7: "Software Engineer",
    8: "Super Admin"
    // Add more roles as needed
  };
  useEffect(() => {
    axios
      .get(`${_global.BASE_URL}users`)
      .then((res) => {
        const result = res.data;
        setUsers(result);
        setBuffUsers(result);
        console.log(result);
          // get cases
          axios
          .get(`${_global.BASE_URL}cases`)
          .then((res) => {
            const result = res.data;
            setAllBufferCases(result);
            console.log("result",result)
            setAllCases(result.map((c) => {
              return {
                label: `D:${c.dentistObj.name}, P:${c.patientName} (${c.caseNumber})`,
                _id: c._id,
              };
            }));
          })
          .catch((error) => {
            console.error("Error fetching cases:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
    axios
      .get(`${_global.BASE_URL}departments`)
      .then((res) => {
        const result = res.data;
        setDepartments(result);
        console.log(result);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, []);
  const deleteUser = (id) => {
    axios
      .delete(`${_global.BASE_URL}users/${id}`)
      .then((res) => {
        const result = res.data;
        const filteredUsers = users.filter((user) => user._id !== result._id);
        setUsers(filteredUsers);
        showToastMessage("deleted User successfully", "success");
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };
  const getCasesByUserId = (id) => {
    axios
      .get(`${_global.BASE_URL}users/actions/${id}`)
      .then((res) => {
        const result = res.data;
        console.log('result',res)
        setCasesUser(result);
        groupCasesTeethNumbersByName()
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };
  const onAddUser = async () => {
    // e.preventDefault();
    const userModel = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword: password,
      phone,
      gender,
      dateOfBirth,
      roles: [Number(role)],
      address: {
        street: "",
        city: city,
        state: "",
        zipCode: "",
        country: country,
      },
      notes: [],
      joiningDate,
      licenseExpireDate,
      departments: [department],
      photo: "https://example.com/photo.jpg",
      active: true,
    };
    console.log(userModel);
    const response = await fetch(`${_global.BASE_URL}users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userModel),
    });
    const json = await response.json();
    if (response.ok) {
      showToastMessage("Added User successfully", "success");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setGender("");
      setDateOfBirth("");
      setRole("");
      setCountry("");
      setCity("");
      setDepartment("");
      setJoiningDate("");
      setLicenseExpireDate();
      setEmptyFields([]);
    }
    if (!response.ok) {
      console.log(json);
      showToastMessage("Added User successfully", "error");
      const newUsers = [...users, JSON.parse(JSON.stringify(json.data))];
      setUsers(newUsers);
      setEmptyFields(json.emptyFields);
    }
  };
  const onAddNote = async () => {
    // e.preventDefault();
    const buffCase = allBufferCases.find(
      (c) => c._id === caseId
    );
    buffUser.notes.push(
      {
        title: noteUser,
        caseId: caseId,
        caseNumber: caseNumber,
        noteType: noteType,
        doctorName:buffCase.dentistObj.name,
        patientName:buffCase.patientName,
        numOfTooth:buffCase.teethNumbers.length,
        date: new Date(),
        addedBy:`${user.firstName}, ${user.lastName}`,
        id:user._id
      }
    );
    console.log(buffUser);
    console.log(noteUser);
    const response = await fetch(
     `${_global.BASE_URL}users/` + buffUser._id,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buffUser),
      }
    );
    const json = await response.json();
    if (response.ok) {
      setNoteUser("");
      showToastMessage("Added note to successfully", "success");
    }
    if (!response.ok) {
      console.log(json);
      const newUsers = [...users, JSON.parse(JSON.stringify(json.data))];
      setUsers(newUsers);
      setEmptyFields(json.emptyFields);
    }
  };
  const searchByName = (searchText) => {
    setSearchText(searchText);
    console.log(searchText);

    if (searchText !== "") {
      const filteredUsers = buffUsers.filter(
        (item) =>
          item.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.lastName.toLowerCase().includes(searchText.toLowerCase())
      );
      setUsers(filteredUsers);
    } else {
      setUsers(buffUsers);
    }
  };
  function sumOfTeethNumbersLength() {
    let totalLength = 0;
    casesUser.forEach(caseItem => {
        totalLength += caseItem.teethNumbers.length;
    });
    return totalLength;
}

function groupTeethNumbersByName(teethNumbers) {
  const result = {};

  teethNumbers.forEach(teethNumber => {
    const { name } = teethNumber;

    if (!result[name]) {
      result[name] = 0;
    }

    result[name]++;
  });
console.log(Object.entries(result).map(([name, count]) => ({ name, count })))
  return Object.entries(result).map(([name, count]) => ({ name, count }));
}
function groupCasesTeethNumbersByName() {
  const result = {};

  casesUser.forEach(singleCase => {
    singleCase.teethNumbers.forEach(teethNumber => {
      const { name } = teethNumber;
  
      if (!result[name]) {
        result[name] = 0;
      }
  
      result[name]++;
    });
  });
  console.log("cases by name",Object.entries(result).map(([name, teethNumbers]) => ({ name, teethNumbers })))
  return Object.entries(result).map(([name, count]) => ({ name, count }));
}
const handleChangeSelect = (event) => {
  setCaseId(event._id)
  setCaseNumber(event.label)
};
// function groupTeethNumbersByType() {
//   const result = {};

//   // Iterate over each case
//   casesUser.forEach(caseItem => {
//     // Initialize an object to store teethNumbers grouped by name
//     const teethNumbersByType = {};

//     // Iterate over each teethNumber in the current case
//     caseItem.teethNumbers.forEach(teethNumber => {
//       const { name, teethNumber: number } = teethNumber;

//       // Check if the name already exists in teethNumbersByType, if not create an empty array
//       if (!teethNumbersByType[name]) {
//         teethNumbersByType[name] = [];
//       }

//       // Push the teethNumber into the array
//       teethNumbersByType[name].push(number);
//     });

//     // Add the teethNumbersByType to the result object with the caseNumber as key
//     result[caseItem.caseNumber] = teethNumbersByType;
//   });

//   return result;
// }
  return (
    <>
      <div className="content">
        <div className="card">
          <h5 class="card-title">
            <span>
              Users <small>({users.length})</small>
            </span>
            {(user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.manager || user.roles[0] ===  _global.allRoles.super_admin) &&
            <span className="add-user-icon">
              <a data-bs-toggle="modal" data-bs-target="#exampleModal">
                {" "}
                <i class="fa-solid fa-circle-plus"></i>
              </a>
            </span>
            }
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
            {users.length > 0 && (
              <table className="table text-center table-bordered">
                <thead>
                  <tr className="table-secondary">
                    <th scope="col">Name</th>
                    <th className="td-phone" scope="col">Email</th>
                    <th className="td-phone" scope="col">Phone</th>
                    <th scope="col">Role</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    // <tr key={item._id}>
                    // <tr
                    //   key={item._id}
                    //   className={` ${
                    //     item.notes.length > 0 ? "table-danger" : "table-default"
                    //   }`}
                    // >
                    <tr
                      key={item._id}
                      className={`${
                        item.notes.length > 3 ? "table-danger" : "table-default"
                      }`}
                    >
                      <td>
                        {item.firstName} {item.lastName}
                      </td>
                      <td className="td-phone">
                        {item.email} 
                      </td>
                      <td className="td-phone">{item.phone}</td>
                      <td>
                        {item.roles.map((roleId, index) => (
                          <span className="text-capitalize" key={index}>
                            {Roles[roleId]}
                            {index !== item.roles.length - 1 && ", "}
                          </span>
                        ))}
                      </td>
                      <td>
                        <div className="actions-btns">
                          <span
                            data-bs-toggle="modal"
                            data-bs-target="#addNoteModal"
                            onClick={() => setBuffUser(item)}
                          >
                            <i class="fa-solid fa-circle-plus c-success"></i>
                          </span>
                          {/* <span onClick={(e) => deleteUser(item._id)}>
                            <i className="fa-solid fa-trash-can"></i>
                          </span> */}
                                 <span
                            onClick={() => navigate('/layout/user-notes',{ state: { ...item } })}
                          >
                            <i class="fa-solid fa-eye c-success"></i>

                          </span>
                         {(user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.manager || user.roles[0] ===  _global.allRoles.super_admin) && <span   
                         onClick={()=>navigate("/layout/user-profile", { state: { ...item, isAdmin:true } })}
                        //  data-bs-toggle="modal"
                        //     data-bs-target="#casesUserModal"
                        //      onClick={(e) => {
                        //       setBuffUser(item)
                        //       getCasesByUserId(item._id)}}
                              >
                            <i class="fa-solid fa-chart-column c-success"></i>
                          </span>
                        }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {users.length <= 0 && (
              <div className="no-content">No Users Added yet!</div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <div
        class="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                New User
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
                  <div className="col-lg-4">
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
                  <div className="col-lg-4">
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
                  <div className="col-lg-4">
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
                  </div>
                  <div className="col-lg-4">
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
                  </div>
                  <div className="col-lg-4">
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
                      <label htmlFor="dateOfBirth"> Date Of Birth </label>{" "}
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        className={`form-control ${
                          emptyFields.includes("dateOfBirth") ? "error" : ""
                        }`}
                        onChange={(e) => {
                          setDateOfBirth(e.target.value);
                        }}
                        value={dateOfBirth}
                        placeholder="Enter date of Birth"
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
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="role"> Role </label>{" "}
                      <select
                        className={`form-select ${
                          emptyFields.includes("roles") ? "error" : ""
                        }`}
                        aria-label="Default select example"
                        onChange={(e) => {
                          setRole(e.target.value);
                        }}
                        value={role}
                      >
                        <option selected>Select Role</option>
                        <option value="0">Admin</option>
                        <option value="1">Manager</option>
                        <option value="2">Team Leader</option>
                        <option value="3">Technician</option>
                        <option value="4">Reception</option>
                        <option value="5">Driver</option>
                        <option value="6">Graphic Design</option>
                        <option value="7">Software Engineer</option>
                        <option value="8">Super Admin</option>
                      </select>
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="department"> Department </label>{" "}
                      <select
                        className={`form-select ${
                          emptyFields.includes("department") ? "error" : ""
                        }`}
                        aria-label="Default select example"
                        onChange={(e) => {
                          console.log(e.target.value);
                          setDepartment(e.target.value);
                        }}
                        value={department}
                      >
                        <option selected>Select department</option>
                        {departments.map((dep, index) => (
                          <option key={dep._id} value={dep._id}>
                            {dep.name}
                          </option>
                        ))}
                      </select>
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="joiningDate"> Joining Date </label>{" "}
                      <input
                        type="date"
                        id="joiningDate"
                        name="joiningDate"
                        className={`form-control ${
                          emptyFields.includes("joiningDate") ? "error" : ""
                        }`}
                        onChange={(e) => {
                          setJoiningDate(e.target.value);
                        }}
                        value={joiningDate}
                        placeholder="Enter date of joining date"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="licenseExpireDate">
                        {" "}
                        License Expire Date{" "}
                      </label>{" "}
                      <input
                        type="date"
                        id="licenseExpireDate"
                        name="licenseExpireDate"
                        className={`form-control ${
                          emptyFields.includes("licenseExpireDate")
                            ? "error"
                            : ""
                        }`}
                        onChange={(e) => {
                          setLicenseExpireDate(e.target.value);
                        }}
                        value={licenseExpireDate}
                        placeholder="Enter date of license expire date"
                      />
                    </div>{" "}
                  </div>
                </div>
                {/* {error && (
                  <div className="error">
                    <span> {error} </span>{" "}
                  </div>
                )}{" "} */}
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
                onClick={(e) => onAddUser()}
                class="btn btn-success"
                data-bs-dismiss="modal"
              >
                Add
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
                {buffUser.firstName} {buffUser.lastName}
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
                <div className="col-lg-12 mb-1">
                  <div className="form-group">
                    <label>Case Number </label>
                      {/* <select class="form-select" aria-label="Default select example">
                        <option selected>Open this select menu</option>
                        {console.log("allCases",allCases)}
                        {allCases.map((item,index)=>
                          <option key={index} value={item._id}>{item.caseNumber}</option>
                        )}
                      </select> */}
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isLoading={true}
                        // isClearable={true}
                        onChange={(e) => handleChangeSelect(e)}
                        isSearchable={true}
                        name="color"
                        options={allCases}
                     />
                  </div>
                </div> 
                <div className="col-lg-12 mb-1">
                <div className="form-group">
                    <label>Type </label>
                  <select class="form-select" onChange={(e)=>setNoteType(e.target.value)} aria-label="Default select example">
                      <option  disabled selected>Type of Note</option>
                      <option value="Positive">Positive</option>
                      <option value="Negative">Negative</option>
                    </select>
                  </div>
              </div> 
                <div className="col-lg-12">
                  <div className="form-group">
                    <label htmlFor="noteUser"> Note </label>{" "}
                    <textarea
                      type="text"
                      rows={3}
                      id="noteUser"
                      name="noteUser"
                      className={`form-control`}
                      onChange={(e) => {
                        setNoteUser(e.target.value);
                      }}
                      value={noteUser}
                      placeholder="Enter note "
                    ></textarea>
                  </div>{" "}
                </div>
                {/* <div className="col-lg-12">
                  <h6 className="old-notes">Previous Notes()</h6>

                  {buffUser?.notes?.length <= 0 && (
                    <div className="text-center mt-4 mb-4">
                      No notes have been added yet!
                    </div>
                  )}

                  {buffUser?.notes?.length > 0 && (
                    <ol>
                      {buffUser?.notes?.map((noteItem, index) => (
                        <li key={index}>
                          <div className="note-view">
                            <span>{noteItem.title}</span>
                            <span>{format(noteItem.date, "MMMM do yyyy")}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div> */}
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
      {/* Cases By User Modal */}
      <div
        class="modal fade"
        id="casesUserModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content ">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                {buffUser.firstName} {buffUser.lastName}
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              {casesUser.length > 0 &&
                <table className="table text-center table-bordered">
                        <thead>
                          <tr className="table-secondary">
                            <th scope="col">Case Number</th>
                            <th scope="col">Doctor</th>
                            <th scope="col">Patient</th>
                            <th scope="col">#teeth</th>
                          </tr>
                        </thead>
                        <tbody>
                          {casesUser.map((item) => (
                            <tr key={item._id}>
                              <td>
                                {item.caseNumber}
                              </td>
                              <td>{item?.dentistObj?.name}</td>
                              <td>
                                {item.patientName}
                              </td>
                              <td className="teeth-pieces">
                              {
                              groupTeethNumbersByName(item.teethNumbers)?.map((item)=>
                                <p className="mb-0">
                                    <span>{item.name}:</span> 
                                    <b className="badge text-bg-light">{item.count}</b>
                                </p>
                                )
                              }
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td  className="f-bold c-success" colSpan={3}>
                              <b>Total of Pieces</b>
                            </td>
                            <td className="bg-success p-2 text-dark bg-opacity-50">
                               <b>{
                              sumOfTeethNumbersLength()
                              }</b> 
                              </td>
                          </tr>
                          <tr>
                            <td   colSpan={4}>
                            
                              <div className="summary-teeth-cases">
                              {groupCasesTeethNumbersByName()?.map((item)=>
                                  <p className="mb-0">
                                    <span>{item.name}:</span> 
                                    <b className="badge text-bg-success">{item.count}</b>
                                </p>
                                )}
                              </div>
                            </td>
                          
                          </tr>
                        </tbody>
                </table>
              }
              {casesUser.length <= 0 && 
              <div className="text-center">
                <h6>No have Works Yet!</h6>
              </div>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;
