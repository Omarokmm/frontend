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
  const [buffDepartment, setBuffDepartment] = useState({});
  const [newsInput, setNewsInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState(null);

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
        user.firstName === "Mustafa" ? setDepartments(result.filter(r => r.name === 'CadCam')) : setDepartments(result);
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

  const viewCases = (item) => {
    navigate("/layout/cases-in-departments", { state: { ...item, isAdmin: true } })
  }

  const getUsersByDepartment = (department) => {
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

  const handleUploadMediaFiles = async (event, replaceIndex = null) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const uploadRes = await axios.post(`${_global.BASE_URL}departments/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const newMediaItems = uploadRes.data.urls;

      if (replaceIndex !== null) {
        const oldItem = buffDepartment.media[replaceIndex];
        if (oldItem) {
          try {
            await axios.post(`${_global.BASE_URL}departments/deleteFile`, {
              publicId: oldItem.publicId,
              resourceType: oldItem.resourceType
            });
          } catch (e) {
            console.error("Error deleting old file from Cloudinary:", e);
          }
        }

        const updatedMedia = [...(buffDepartment.media || [])];
        updatedMedia[replaceIndex] = newMediaItems[0];
        const updatedDept = { ...buffDepartment, media: updatedMedia };
        setBuffDepartment(updatedDept);
        setDepartments(departments.map(d => d._id === buffDepartment._id ? updatedDept : d));
        await axios.patch(`${_global.BASE_URL}departments/${buffDepartment._id}`, { media: updatedMedia });
        showToastMessage("Media replaced successfully", "success");
      } else {
        const updatedMedia = [...(buffDepartment.media || []), ...newMediaItems];
        const updatedDept = { ...buffDepartment, media: updatedMedia };
        setBuffDepartment(updatedDept);
        setDepartments(departments.map(d => d._id === buffDepartment._id ? updatedDept : d));
        await axios.patch(`${_global.BASE_URL}departments/${buffDepartment._id}`, { media: updatedMedia });
        showToastMessage("Media uploaded successfully", "success");
      }
    } catch (error) {
      console.error("Error uploading department media:", error);
      showToastMessage("Failed to upload files", "error");
    } finally {
      setUploading(false);
      setReplacingIndex(null);
    }
  };

  const handleDeleteMediaFile = async (index) => {
    const itemToDelete = buffDepartment.media[index];
    if (!itemToDelete) return;

    try {
      await axios.post(`${_global.BASE_URL}departments/deleteFile`, {
        publicId: itemToDelete.publicId,
        resourceType: itemToDelete.resourceType
      });

      const updatedMedia = buffDepartment.media.filter((_, idx) => idx !== index);
      const updatedDept = { ...buffDepartment, media: updatedMedia };
      setBuffDepartment(updatedDept);
      setDepartments(departments.map(d => d._id === buffDepartment._id ? updatedDept : d));
      await axios.patch(`${_global.BASE_URL}departments/${buffDepartment._id}`, { media: updatedMedia });
      showToastMessage("Media deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting file:", error);
      showToastMessage("Failed to delete file", "error");
    }
  };

  const handleUpdatePrimaryPhoto = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      const uploadRes = await axios.post(`${_global.BASE_URL}departments/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const photoUrl = uploadRes.data.urls[0].url;

      const updatedDept = { ...buffDepartment, photo: photoUrl };
      setBuffDepartment(updatedDept);
      setDepartments(departments.map(d => d._id === buffDepartment._id ? updatedDept : d));
      await axios.patch(`${_global.BASE_URL}departments/${buffDepartment._id}`, { photo: photoUrl });
      showToastMessage("Primary photo updated", "success");
    } catch (err) {
      console.error("Error uploading primary photo:", err);
      showToastMessage("Failed to update primary photo", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleAddNewsItem = async () => {
    if (!newsInput.trim()) return;
    try {
      const newNewsList = [...(buffDepartment.newsList || []), { text: newsInput, active: true }];
      const updatedDept = { ...buffDepartment, newsList: newNewsList };
      setBuffDepartment(updatedDept);
      setDepartments(departments.map(d => d._id === buffDepartment._id ? updatedDept : d));
      await axios.patch(`${_global.BASE_URL}departments/${buffDepartment._id}`, { newsList: newNewsList });
      setNewsInput("");
      showToastMessage("News announcement added", "success");
    } catch (error) {
      console.error("Error adding news item:", error);
      showToastMessage("Failed to add news item", "error");
    }
  };

  const handleToggleNewsActive = async (index) => {
    try {
      const newNewsList = buffDepartment.newsList.map((item, idx) =>
        idx === index ? { ...item, active: !item.active } : item
      );
      const updatedDept = { ...buffDepartment, newsList: newNewsList };
      setBuffDepartment(updatedDept);
      setDepartments(departments.map(d => d._id === buffDepartment._id ? updatedDept : d));
      await axios.patch(`${_global.BASE_URL}departments/${buffDepartment._id}`, { newsList: newNewsList });
      showToastMessage("News visibility updated", "success");
    } catch (error) {
      console.error("Error toggling news active state:", error);
      showToastMessage("Failed to update news visibility", "error");
    }
  };

  const handleDeleteNewsItem = async (index) => {
    try {
      const newNewsList = buffDepartment.newsList.filter((_, idx) => idx !== index);
      const updatedDept = { ...buffDepartment, newsList: newNewsList };
      setBuffDepartment(updatedDept);
      setDepartments(departments.map(d => d._id === buffDepartment._id ? updatedDept : d));
      await axios.patch(`${_global.BASE_URL}departments/${buffDepartment._id}`, { newsList: newNewsList });
      showToastMessage("News announcement deleted", "success");
    } catch (error) {
      console.error("Error deleting news item:", error);
      showToastMessage("Failed to delete news item", "error");
    }
  };

  return (
    <>
      <div className="content">
        <div className="card">
          <h5 className="card-title">
            <span>Departments</span>
            <span className="add-user-icon">
              <a data-bs-toggle="modal" data-bs-target="#exampleModal">
                {" "}
                <i className="fa-solid fa-circle-plus"></i>
              </a>
            </span>
          </h5>
          <div className="card-body">
            {departments.length > 0 && <table className="table text-center table-bordered">
              <thead>
                <tr className="table-secondary">
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
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
                          title="View cases"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </span>
                        <span
                          data-bs-toggle="modal"
                          data-bs-target="#userInDepartmentModal"
                          onClick={() => getUsersByDepartment(item)}
                          title="View members"
                        >
                          <i className="fa-solid fa-users"></i>
                        </span>
                        <span
                          data-bs-toggle="modal"
                          data-bs-target="#tvDisplayModal"
                          onClick={() => {
                            setBuffDepartment(item);
                            setNewsInput(item.newsBar || "");
                          }}
                          title="Configure TV Display"
                        >
                          <i className="fa-solid fa-tv text-primary"></i>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
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
                        className={`form-control ${emptyFields.includes("name") ? "error" : ""
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
                        className={`form-control ${emptyFields.includes("description") ? "error" : ""
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
        className="modal fade"
        id="deleteDepartmentModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog ">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Confirmation
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="text-center">
                Are you sure you want to delete {buffDepartment.name} department? It may contain users.
              </div>
            </div>
            <div className="modal-footer ">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                onClick={(e) => deleteDepartment(buffDepartment._id)}
                className="btn btn-success"
                data-bs-dismiss="modal"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TV Display Modal */}
      <div
        className="modal fade"
        id="tvDisplayModal"
        tabIndex="-1"
        aria-labelledby="tvDisplayModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h1 className="modal-title fs-5" id="tvDisplayModalLabel">
                Display Board Configuration - {buffDepartment.name}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-start">
              {/* Launcher */}
              <div className="mb-4 text-start p-3 alert alert-info d-flex align-items-center justify-content-between">
                <div>
                  <strong>Digital Signage:</strong> Turn any TV browser at the work station into a signage screen.
                </div>
                <a
                  href={`/department-tv/${buffDepartment._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary ms-3"
                >
                  <i className="fa-solid fa-desktop me-2"></i>Launch Display Screen
                </a>
              </div>

              {/* News / Ticker */}
              <div className="card mb-4">
                <div className="card-header bg-light"><strong>Scrolling News Banner Items</strong></div>
                <div className="card-body">
                  {/* Add News Item */}
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter horizontal scrolling announcements..."
                      value={newsInput}
                      onChange={(e) => setNewsInput(e.target.value)}
                    />
                    <button className="btn btn-success" onClick={handleAddNewsItem}>
                      Add News
                    </button>
                  </div>

                  {/* Display News Items list */}
                  {(!buffDepartment.newsList || buffDepartment.newsList.length === 0) ? (
                    <div className="text-muted small">No announcement items added yet. Added text will loop at the top of the TV.</div>
                  ) : (
                    <div className="list-group">
                      {buffDepartment.newsList.map((item, idx) => (
                        <div key={idx} className="list-group-item d-flex align-items-center justify-content-between p-2">
                          <div className="d-flex align-items-center gap-2 flex-grow-1">
                            <input
                              type="checkbox"
                              className="form-check-input ms-1"
                              checked={item.active}
                              onChange={() => handleToggleNewsActive(idx)}
                              style={{ cursor: "pointer", width: "18px", height: "18px" }}
                            />
                            <span className={item.active ? "text-dark" : "text-muted text-decoration-line-through"}>
                              {item.text}
                            </span>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger border-0"
                            onClick={() => handleDeleteNewsItem(idx)}
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Photo */}
              <div className="card mb-4">
                <div className="card-header bg-light"><strong>Department Cover Photo</strong></div>
                <div className="card-body d-flex align-items-center gap-3">
                  <img
                    src={buffDepartment.photo || "https://example.com/placeholder.jpg"}
                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ccc" }}
                    alt="Current primary"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/100x100?text=No+Photo";
                    }}
                  />
                  <div>
                    <label className="btn btn-outline-secondary mb-2 pointer" style={{ cursor: "pointer" }}>
                      <i className="fa-solid fa-camera me-2"></i>Change Cover Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleUpdatePrimaryPhoto}
                        disabled={uploading}
                      />
                    </label>
                    <div className="text-muted small">This is the default department preview image.</div>
                  </div>
                </div>
              </div>

              {/* Slideshow Reels */}
              <div className="card mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <strong>Department Media Carousel Slides</strong>
                  <label className="btn btn-sm btn-success mb-0 pointer" style={{ cursor: "pointer" }}>
                    <i className="fa-solid fa-plus me-1"></i>Add Media Slide
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="d-none"
                      onChange={handleUploadMediaFiles}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div className="card-body">
                  {uploading && (
                    <div className="text-center my-3 text-primary">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Processing media...
                    </div>
                  )}

                  {!buffDepartment.media || buffDepartment.media.length === 0 ? (
                    <p className="text-center text-muted py-3 m-0">No media slides added yet. Upload files to start the carousel.</p>
                  ) : (
                    <div className="row g-3">
                      {buffDepartment.media.map((file, index) => (
                        <div className="col-md-4 col-sm-6" key={index}>
                          <div className="card h-100 shadow-sm position-relative overflow-hidden">
                            {file.resourceType === "video" ? (
                              <div className="bg-dark d-flex align-items-center justify-content-center" style={{ height: "120px" }}>
                                <i className="fa-solid fa-circle-play text-white fa-2xl"></i>
                                <span className="position-absolute bottom-0 start-0 m-2 bg-dark text-white px-2 py-1 small rounded-pill opacity-75">
                                  Video
                                </span>
                              </div>
                            ) : (
                              <img
                                src={file.url}
                                style={{ height: "120px", objectFit: "cover" }}
                                alt="Slide thumbnail"
                                className="w-100"
                              />
                            )}
                            <div className="card-footer p-2 bg-white d-flex justify-content-between">
                              <label className="btn btn-sm btn-outline-primary mb-0 pointer" style={{ cursor: "pointer" }}>
                                <i className="fa-solid fa-rotate me-1"></i>Replace
                                <input
                                  type="file"
                                  accept={file.resourceType === "video" ? "video/*" : "image/*"}
                                  className="d-none"
                                  onChange={(e) => {
                                    setReplacingIndex(index);
                                    handleUploadMediaFiles(e, index);
                                  }}
                                  disabled={uploading}
                                />
                              </label>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteMediaFile(index)}
                                disabled={uploading}
                              >
                                <i className="fa-solid fa-trash-can me-1"></i>Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Departments;
