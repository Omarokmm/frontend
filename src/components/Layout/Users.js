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
  // Edit user state
  const [editUserId, setEditUserId] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editDateOfBirth, setEditDateOfBirth] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editJoiningDate, setEditJoiningDate] = useState("");
  const [editLicenseExpireDate, setEditLicenseExpireDate] = useState("");
  const [editEmptyFields, setEditEmptyFields] = useState([]);
  const [hrNoteInput, setHrNoteInput] = useState("");
  const [hrSaving, setHrSaving] = useState(false);
  const [hrDeletingKey, setHrDeletingKey] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const navigate = useNavigate();
  const roles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
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
  const changeUserPassword = async () => {
    if (!buffUser?._id) return;
    if (!newPassword || isChangingPassword) return;
    setIsChangingPassword(true);
    try {
      const response = await fetch(`${_global.BASE_URL}users/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: editEmail || buffUser.email, newPassword }),
      });
      const json = await response.json();
      if (response.ok) {
        showToastMessage("Password changed successfully", "success");
        setNewPassword("");
      } else {
        showToastMessage(json?.message || "Error changing password", "error");
      }
    } catch (e) {
      showToastMessage("Network error changing password", "error");
    } finally {
      setIsChangingPassword(false);
    }
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
          .get(`${_global.BASE_URL}cases/cases-by-month`)
          .then((res) => {
            const result = res.data.cases;
            setAllBufferCases(result);
            console.log("result", result)
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
        console.log('result', res)
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
  const deleteHrNote = async (note) => {
    if (!buffUser?._id || !note || hrSaving) return;
    const key = new Date(note.date).getTime();
    setHrDeletingKey(key);
    const existingNotes = Array.isArray(buffUser.notes) ? buffUser.notes : [];
    const filteredNotes = existingNotes.filter((n) => {
      if (n.noteType !== "HR") return true;
      const nKey = new Date(n.date).getTime();
      const same = nKey === key && (n.title || "") === (note.title || "") && (n.addedBy || "") === (note.addedBy || "");
      return !same;
    });
    // Optimistic update
    const optimisticUser = { ...buffUser, notes: filteredNotes };
    setBuffUser(optimisticUser);
    const optimisticList = users.map((u) => (u._id === optimisticUser._id ? optimisticUser : u));
    setUsers(optimisticList);
    setBuffUsers(optimisticList);

    const payload = { notes: filteredNotes };
    const response = await fetch(`${_global.BASE_URL}users/` + buffUser._id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (response.ok) {
      showToastMessage("HR note deleted", "success");
      const updatedUser = { ...optimisticUser, ...json };
      setBuffUser(updatedUser);
      const updated = users.map((u) => (u._id === updatedUser._id ? updatedUser : u));
      setUsers(updated);
      setBuffUsers(updated);
      setHrDeletingKey(null);
    } else {
      showToastMessage("Error deleting HR note", "error");
      // Revert
      const revertedUser = { ...buffUser, notes: existingNotes };
      setBuffUser(revertedUser);
      const reverted = users.map((u) => (u._id === revertedUser._id ? revertedUser : u));
      setUsers(reverted);
      setBuffUsers(reverted);
      setHrDeletingKey(null);
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
        doctorName: buffCase.dentistObj.name,
        patientName: buffCase.patientName,
        numOfTooth: buffCase.teethNumbers.length,
        date: new Date(),
        addedBy: `${user.firstName}, ${user.lastName}`,
        id: user._id
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
  const openEditModal = (u) => {
    setBuffUser(u);
    setEditUserId(u._id);
    setEditFirstName(u.firstName || "");
    setEditLastName(u.lastName || "");
    setEditEmail(u.email || "");
    setEditPhone(u.phone || "");
    setEditGender(u.gender || "");
    setEditDateOfBirth(u.dateOfBirth ? _global.formatDateToYYYYMMDD(u.dateOfBirth) : "");
    setEditRole(Array.isArray(u.roles) && u.roles.length > 0 ? String(u.roles[0]) : "");
    setEditCountry(u.address?.country || "");
    setEditCity(u.address?.city || "");
    const dep = Array.isArray(u.departments) && u.departments.length > 0 ? (u.departments[0]?._id || u.departments[0]) : "";
    setEditDepartment(dep);
    setEditJoiningDate(u.joiningDate ? _global.formatDateToYYYYMMDD(u.joiningDate) : "");
    setEditLicenseExpireDate(u.licenseExpireDate ? _global.formatDateToYYYYMMDD(u.licenseExpireDate) : "");
    setEditEmptyFields([]);

  };
  const onUpdateUser = async () => {
    const userModel = {
      firstName: editFirstName,
      lastName: editLastName,
      email: editEmail,
      phone: editPhone,
      gender: editGender,
      dateOfBirth: editDateOfBirth,
      roles: editRole !== "" ? [Number(editRole)] : undefined,
      address: {
        street: buffUser?.address?.street || "",
        city: editCity,
        state: buffUser?.address?.state || "",
        zipCode: buffUser?.address?.zipCode || "",
        country: editCountry,
      },
      joiningDate: editJoiningDate || null,
      licenseExpireDate: editLicenseExpireDate || null,
      departments: editDepartment ? [editDepartment] : undefined,
    };
    const response = await fetch(`${_global.BASE_URL}users/` + editUserId, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userModel),
    });
    const json = await response.json();
    if (response.ok) {
      showToastMessage("Updated User successfully", "success");
      // update list locally
      const updated = users.map((u) =>
        u._id === editUserId ? { ...u, ...json } : u
      );
      setUsers(updated);
      setBuffUsers(updated);
      setEditEmptyFields([]);
    } else {
      setEditEmptyFields(json.emptyFields || []);
      showToastMessage("Error updating user", "error");
    }
  };
  const addHrNote = async () => {
    if (!buffUser?._id || !hrNoteInput.trim() || hrSaving) return;
    setHrSaving(true);
    const existingNotes = Array.isArray(buffUser.notes) ? buffUser.notes : [];
    const newNote = {
      title: hrNoteInput.trim(),
      noteType: "HR",
      date: new Date(),
      addedBy: `${user.firstName} ${user.lastName}`,
      id: user._id,
    };
    // Optimistic update
    const optimisticUser = { ...buffUser, notes: [...existingNotes, newNote] };
    setBuffUser(optimisticUser);
    const optimisticList = users.map((u) => (u._id === optimisticUser._id ? optimisticUser : u));
    setUsers(optimisticList);
    setBuffUsers(optimisticList);
    setHrNoteInput("");

    const payload = { notes: optimisticUser.notes };
    const response = await fetch(`${_global.BASE_URL}users/` + buffUser._id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (response.ok) {
      showToastMessage("HR note added", "success");
      // Replace with server version if returned
      const updatedUser = { ...optimisticUser, ...json };
      setBuffUser(updatedUser);
      const updated = users.map((u) => (u._id === updatedUser._id ? updatedUser : u));
      setUsers(updated);
      setBuffUsers(updated);
      setHrSaving(false);
    } else {
      showToastMessage("Error adding HR note", "error");
      // Revert optimistic change
      const revertedUser = { ...buffUser, notes: existingNotes };
      setBuffUser(revertedUser);
      const reverted = users.map((u) => (u._id === revertedUser._id ? revertedUser : u));
      setUsers(reverted);
      setBuffUsers(reverted);
      setHrSaving(false);
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
    console.log("cases by name", Object.entries(result).map(([name, teethNumbers]) => ({ name, teethNumbers })))
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
            {(user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.manager || user.roles[0] === _global.allRoles.super_admin) &&
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
                      className={`${item.notes.length > 3 ? "table-danger" : "table-default"
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
                          {(user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.manager || user.roles[0] === _global.allRoles.super_admin) && (
                            <span
                              data-bs-toggle="modal"
                              data-bs-target="#editUserModal"
                              onClick={() => openEditModal(item)}
                            >
                              <i class="fa-solid fa-pen-to-square c-primary"></i>
                            </span>
                          )}
                          {/* <span onClick={(e) => deleteUser(item._id)}>
                            <i className="fa-solid fa-trash-can"></i>
                          </span> */}
                          <span
                            onClick={() => navigate('/layout/user-notes', { state: { ...item } })}
                          >
                            <i class="fa-solid fa-eye c-success"></i>
                          </span>

                          {item.roles.includes(_global.allRoles.Reception) && item.active &&(
                            <span
                              onClick={() => navigate('/layout/assigned-doctors', { state: { ...item } })}
                              title="Assigned Doctors"
                            >
                              <i className="fa-solid fa-user-doctor c-primary"></i>
                            </span>
                          )}

                          {(user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.manager || user.roles[0] === _global.allRoles.super_admin) && <span
                            onClick={() => navigate("/layout/user-profile", { state: { ...item, isAdmin: true } })}
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
                <div className="accordion mb-3" id="hrAccordion">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="hrHeading">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#hrCollapse"
                        aria-expanded="true"
                        aria-controls="hrCollapse"
                      >
                        HR Details
                      </button>
                    </h2>
                    <div
                      id="hrCollapse"
                      className="accordion-collapse collapse show"
                      aria-labelledby="hrHeading"
                      data-bs-parent="#hrAccordion"
                    >
                      <div className="accordion-body">
                        <div class="row">
                          <div className="col-lg-12">
                            <div className="form-group">
                              <label>Previous HR Notes</label>
                              {Array.isArray(buffUser?.notes) && buffUser.notes.filter((n) => n.noteType === "HR").length > 0 ? (
                                <div className="old-notes">
                                  <ol>
                                    {buffUser.notes
                                      .filter((n) => n.noteType === "HR")
                                      .map((n, idx) => (
                                        <li key={idx}>
                                          <div className="note-view">
                                            <span>
                                              {n.title || "-"}
                                              {typeof n.salary !== "undefined" && (
                                                <>
                                                  {" "}| Salary: <b>{n.salary}</b>
                                                </>
                                              )}
                                              {typeof n.vacationBalance !== "undefined" && (
                                                <>
                                                  {" "}| Vacation: <b>{n.vacationBalance}</b>
                                                </>
                                              )}
                                            </span>
                                            <span>{_global.formatDateToYYYYMMDD(n.date)}</span>
                                          </div>
                                        </li>
                                      ))}
                                  </ol>
                                </div>
                              ) : (
                                <div className="text-muted">No HR notes yet.</div>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="firstName"> First Name </label>{" "}
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className={`form-control ${emptyFields.includes("firstName") ? "error" : ""
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
                        className={`form-control ${emptyFields.includes("lastName") ? "error" : ""
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
                        className={`form-control ${emptyFields.includes("email") ? "error" : ""
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
                        className={`form-control ${emptyFields.includes("password") ? "error" : ""
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
                        className={`form-control ${emptyFields.includes("phone") ? "error" : ""
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
                        className={`form-control ${emptyFields.includes("dateOfBirth") ? "error" : ""
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
                        className={`form-control ${emptyFields.includes("country") ? "error" : ""
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
                        className={`form-control ${emptyFields.includes("city") ? "error" : ""
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
                        className={`form-select ${emptyFields.includes("gender") ? "error" : ""
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
                        className={`form-select ${emptyFields.includes("roles") ? "error" : ""
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
                        className={`form-select ${emptyFields.includes("department") ? "error" : ""
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
                        className={`form-control ${emptyFields.includes("joiningDate") ? "error" : ""
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
                        className={`form-control ${emptyFields.includes("licenseExpireDate")
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
                    <select class="form-select" onChange={(e) => setNoteType(e.target.value)} aria-label="Default select example">
                      <option disabled selected>Type of Note</option>
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
      {/* Edit User Modal */}
      <div
        class="modal fade"
        id="editUserModal"
        tabindex="-1"
        aria-labelledby="editUserModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5 mb-0" id="editUserModalLabel">
                Edit User {buffUser?.firstName || ""} {buffUser?.lastName || ""}
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

                {/* <div className="card mb-3">
                  <div className="card-header">Change Password</div>
                  <div className="card-body">
                    <div className="row g-2 align-items-start">
                      <div className="col-lg-10">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="col-lg-2 d-grid">
                        <label className="form-label" style={{ visibility: "hidden" }}>.</label>
                        <button
                          className="btn btn-warning"
                          type="button"
                          onClick={changeUserPassword}
                          disabled={!newPassword || isChangingPassword}
                        >
                          {isChangingPassword ? "Changing..." : "Change Password"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div> */}


                <div class="row">
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="editFirstName"> First Name </label>{" "}
                      <input
                        type="text"
                        id="editFirstName"
                        name="editFirstName"
                        className={`form-control ${editEmptyFields.includes("firstName") ? "error" : ""
                          }`}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        value={editFirstName}
                        placeholder="Enter First Name"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="editLastName"> Last Name </label>{" "}
                      <input
                        type="text"
                        id="editLastName"
                        name="editLastName"
                        className={`form-control ${editEmptyFields.includes("lastName") ? "error" : ""
                          }`}
                        onChange={(e) => setEditLastName(e.target.value)}
                        value={editLastName}
                        placeholder="Enter Last Name "
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="editEmail"> Email </label>{" "}
                      <input
                        type="email"
                        id="editEmail"
                        name="editEmail"
                        className={`form-control ${editEmptyFields.includes("email") ? "error" : ""
                          }`}
                        onChange={(e) => setEditEmail(e.target.value)}
                        value={editEmail}
                        placeholder="Enter Email"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="editPhone"> Phone </label>{" "}
                      <input
                        type="text"
                        id="editPhone"
                        name="editPhone"
                        className={`form-control ${editEmptyFields.includes("phone") ? "error" : ""
                          }`}
                        onChange={(e) => setEditPhone(e.target.value)}
                        value={editPhone}
                        placeholder="Enter Phone"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="editDateOfBirth"> Date Of Birth </label>{" "}
                      <input
                        type="date"
                        id="editDateOfBirth"
                        name="editDateOfBirth"
                        className={`form-control ${editEmptyFields.includes("dateOfBirth") ? "error" : ""
                          }`}
                        onChange={(e) => setEditDateOfBirth(e.target.value)}
                        value={editDateOfBirth}
                        placeholder="Enter date of Birth"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="editCountry"> Country </label>{" "}
                      <input
                        type="text"
                        id="editCountry"
                        name="editCountry"
                        className={`form-control ${editEmptyFields.includes("country") ? "error" : ""
                          }`}
                        onChange={(e) => setEditCountry(e.target.value)}
                        value={editCountry}
                        placeholder="Enter Country"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="editCity"> City </label>{" "}
                      <input
                        type="text"
                        id="editCity"
                        name="editCity"
                        className={`form-control ${editEmptyFields.includes("city") ? "error" : ""
                          }`}
                        onChange={(e) => setEditCity(e.target.value)}
                        value={editCity}
                        placeholder="Enter City"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="editGender"> Gender </label>{" "}
                      <select
                        className={`form-select ${editEmptyFields.includes("gender") ? "error" : ""
                          }`}
                        aria-label="Default select example"
                        onChange={(e) => setEditGender(e.target.value)}
                        value={editGender}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="editRole"> Role </label>{" "}
                      <select
                        className={`form-select ${editEmptyFields.includes("roles") ? "error" : ""
                          }`}
                        aria-label="Default select example"
                        onChange={(e) => setEditRole(e.target.value)}
                        value={editRole}
                      >
                        <option value="">Select Role</option>
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
                      <label htmlFor="editDepartment"> Department </label>{" "}
                      <select
                        className={`form-select ${editEmptyFields.includes("department") ? "error" : ""
                          }`}
                        aria-label="Default select example"
                        onChange={(e) => setEditDepartment(e.target.value)}
                        value={editDepartment}
                      >
                        <option value="">Select department</option>
                        {departments.map((dep) => (
                          <option key={dep._id} value={dep._id}>
                            {dep.name}
                          </option>
                        ))}
                      </select>
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="editJoiningDate"> Joining Date </label>{" "}
                      <input
                        type="date"
                        id="editJoiningDate"
                        name="editJoiningDate"
                        className={`form-control ${editEmptyFields.includes("joiningDate") ? "error" : ""
                          }`}
                        onChange={(e) => setEditJoiningDate(e.target.value)}
                        value={editJoiningDate}
                        placeholder="Enter date of joining date"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-4">
                    <div className="form-group">
                      <label htmlFor="editLicenseExpireDate">
                        {" "}
                        License Expire Date{" "}
                      </label>{" "}
                      <input
                        type="date"
                        id="editLicenseExpireDate"
                        name="editLicenseExpireDate"
                        className={`form-control ${editEmptyFields.includes("licenseExpireDate")
                            ? "error"
                            : ""
                          }`}
                        onChange={(e) => setEditLicenseExpireDate(e.target.value)}
                        value={editLicenseExpireDate}
                        placeholder="Enter date of license expire date"
                      />
                    </div>{" "}
                  </div>

                </div>
                <div className="card mb-3">
                  <div className="card-header">HR Notes</div>
                  <div className="card-body">
                    <div className="row g-2 align-items-start">
                      <div className="col-lg-10">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Write an HR note..."
                          value={hrNoteInput}
                          onChange={(e) => setHrNoteInput(e.target.value)}
                        />
                      </div>
                      <div className="col-lg-2 d-grid">
                        <button
                          className="btn btn-success"
                          type="button"
                          onClick={addHrNote}
                          disabled={!hrNoteInput.trim() || hrSaving}
                        >
                          {hrSaving ? "Saving..." : "Add Note"}
                        </button>
                      </div>
                      <div className="col-12 mt-3">
                        {Array.isArray(buffUser?.notes) && buffUser.notes.filter((n) => n.noteType === "HR").length > 0 ? (
                          <ol className="mb-0 ps-3">
                            {buffUser.notes
                              .filter((n) => n.noteType === "HR")
                              .slice()
                              .reverse()
                              .map((n, idx) => {
                                const nKey = new Date(n.date).getTime();
                                const isDeleting = hrDeletingKey === nKey;
                                return (
                                  <li key={idx}>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span>{n.title || "-"}</span>
                                      <div className="d-flex align-items-center gap-2">
                                        <span className="text-muted small">{_global.formatDateToYYYYMMDD(n.date)}</span>
                                        {/* <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => deleteHrNote(n)}
                                          disabled={isDeleting}
                                        >
                                          {isDeleting ? "Deleting..." : "Delete"}
                                        </button> */}
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                          </ol>
                        ) : (
                          <div className="text-muted">No HR notes yet.</div>
                        )}
                      </div>
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
                onClick={(e) => onUpdateUser()}
                class="btn btn-success"
                data-bs-dismiss="modal"
              >
                Update
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
                            groupTeethNumbersByName(item.teethNumbers)?.map((item) =>
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
                      <td className="f-bold c-success" colSpan={3}>
                        <b>Total of Pieces</b>
                      </td>
                      <td className="bg-success p-2 text-dark bg-opacity-50">
                        <b>{
                          sumOfTeethNumbersLength()
                        }</b>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4}>

                        <div className="summary-teeth-cases">
                          {groupCasesTeethNumbersByName()?.map((item) =>
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
