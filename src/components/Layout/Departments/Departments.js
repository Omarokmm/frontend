import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../../../helper/toaster";
// import { Roles } from "../../config/global";
import * as _global from "../../../config/global";
const Departments = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([]);
  const [emptyFields, setEmptyFields] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [buffDepartment, setBuffDepartment] = useState([]);
 const Roles = {
  0: "admin",
  1: "manager",
  2: "teamleader",
  3: "technician",
  4: "Reception",
  5: "Driver",
  6: "graphic_design",
  7: "software_Engineer",
  8: "Super Admin"
 };
  useEffect(() => {
    axios
      .get(`${_global.BASE_URL}departments`)
      .then((res) => {
        const result = res.data;
        user.firstName === "Mustafa" ? setDepartments(result.filter(r=>r.name === 'CadCam')) : setDepartments(result);
        console.log(result);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, []);
  const deleteDepartment = (id) => {
    axios
      .delete(`${_global.BASE_URL}departments/${id}`)
      .then((res) => {
        const result = res.data;
        const filteredDepartment = departments.filter(
          (department) => department._id !== result._id
        );
        setDepartments(filteredDepartment);
        showToastMessage("Deleted department successfully", "success");
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };
  const onAddDepartment = async () => {
    const departmentModel = {
      name,
      description,
      photo: "https://example.com/CadCam.jpg",
      head: "664233a5e6f91a4e1d0b752c",
      active: true,
      sections: [],
    };
    console.log(departmentModel);
      const response = await fetch(`${_global.BASE_URL}departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(departmentModel),
    });
    const json = await response.json();
    if (response.ok) {
      setName("");
      setDescription("");
      setEmptyFields([]);
      showToastMessage("Added department successfully", "success");
    }
    if (!response.ok) {
      console.log(json);
      const newDepartments = [...departments, JSON.parse(JSON.stringify(json.data))];
      setDepartments(newDepartments);
      setEmptyFields(json.emptyFields);
      showToastMessage("Error in add department, Please try agin", "error");
    }
  };
  const viewCases = (item)=>{ 
    navigate("/layout/cases-in-departments",{ state: {...item, isAdmin:true } })
  }
  const getUsersByDepartment = (department)=>{
    setBuffDepartment(department)
 axios
   .get(
     `${_global.BASE_URL}departments/users-in-departments/${department._id}`
   )
   .then((res) => {
     const result = res.data;
     setUsers(result);
     console.log(result); 
   })
   .catch((error) => {
     console.error("Error fetching departments:", error);
   });
  }
  // const onAddNote = async () => {
  //   // e.preventDefault();
  //   buffUser.notes.push(noteUser);
  //   console.log(buffUser);
  //   console.log(noteUser);
  //   const response = await fetch(
  //     "http://localhost:4000/api/users/" + buffUser._id,
  //     {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(buffUser),
  //     }
  //   );
  //   const json = await response.json();
  //   if (response.ok) {
  //     setNoteUser("");
  //   }
  //   // if (!response.ok) {
  //   //   console.log(json);
  //   //   const newUsers = [...users, JSON.parse(JSON.stringify(json.data))];
  //   //   setUsers(newUsers);
  //   //   setEmptyFields(json.emptyFields);
  //   // }
  // };
  return (
    <>
      <div className="content">
        <div className="card">
          <h5 class="card-title">
            <span>Departments</span>
            <span className="add-user-icon">
              <a data-bs-toggle="modal" data-bs-target="#exampleModal">
                {" "}
                <i class="fa-solid fa-circle-plus"></i>
              </a>
            </span>
          </h5>
          <div className="card-body">
           {departments.length > 0 &&  <table className="table text-center table-bordered">
              <thead>
                <tr className="table-secondary">
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  {/* <th scope="col">Role</th> */}
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>
                      <div className="actions-btns">
                      <span
                              className="c-success"
                              onClick={() => viewCases(item)}
                            >
                              <i class="fa-solid fa-eye"></i>
                        </span>
                        <span
                          data-bs-toggle="modal"
                          data-bs-target="#userInDepartmentModal"
                          onClick={() => getUsersByDepartment(item)}
                        >
                          <i class="fa-solid fa-users"></i>
                        </span>
                        {/* <span
                          onClick={(e) => setBuffDepartment(item)}
                          data-bs-toggle="modal"
                          data-bs-target="#deleteDepartmentModal"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </span> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
}
            {departments.length <= 0 && (
              <div className="no-content">No Departments Added yet!</div>
            )}
          </div>
        </div>
      </div>
      {/* Add Department Modal */}
      <div
        class="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                New Department
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
                      <label htmlFor="name"> Department Name </label>{" "}
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className={`form-control ${
                          emptyFields.includes("name") ? "error" : ""
                        }`}
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                        value={name}
                        placeholder="Enter Department name"
                      />
                    </div>{" "}
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="description"> Description </label>{" "}
                      <input
                        type="text"
                        id="description"
                        name="description"
                        className={`form-control ${
                          emptyFields.includes("description") ? "error" : ""
                        }`}
                        onChange={(e) => {
                          setDescription(e.target.value);
                        }}
                        value={description}
                        placeholder="Enter description "
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
                Close
              </button>
              <button
                type="button"
                onClick={(e) => onAddDepartment()}
                class="btn btn-success"
                data-bs-dismiss="modal"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      {/*  Users in Departments Modal */}
      <div
        class="modal fade"
        id="userInDepartmentModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                {buffDepartment.name} Department
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
                {users.length > 0 && (
                  <table className="table text-center table-bordered">
                    <thead>
                      <tr className="table-secondary">
                        <th scope="col">Name</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item._id}>
                          <td>
                            {item.firstName} {item.lastName}
                          </td>
                          <td>{item.phone}</td>
                          <td>
                            {item.roles.map((roleId, index) => (
                              <span className="text-capitalize" key={index}>
                                {Roles[roleId]}
                                {index !== item.roles.length - 1 && ", "}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {users.length <= 0 && (
                  <div className="no-content">
                    No users in this department yet!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Delete Department Modal */}
      <div
        class="modal fade"
        id="deleteDepartmentModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog ">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Confirmation
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="text-center">
                Are you sure from delete {buffDepartment.name} department may
                contains users ?
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
                onClick={(e) => deleteDepartment(buffDepartment._id)}
                class="btn btn-success"
                data-bs-dismiss="modal"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Departments;
