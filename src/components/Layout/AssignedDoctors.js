import { useEffect, useState } from "react";
import axios from "axios";
import { showToastMessage } from "../../helper/toaster";
import * as _global from "../../config/global";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import ViewCase from "./Cases/ViewCase";

const AssignedDoctors = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const location = useLocation();

    // Determine which user's assignments we are viewing
    // Priority: 1. Navigation state (from Users page) 2. Logged-in user if Receptionist
    const [viewingUser, setViewingUser] = useState(location.state || (user?.roles?.[0] === _global.allRoles.Reception ? user : null));

    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [receptionUsers, setReceptionUsers] = useState([]);
    const [selectedAssignUser, setSelectedAssignUser] = useState("");
    const [doctorToUnassign, setDoctorToUnassign] = useState(null);
    const [isUnassignLoading, setIsUnassignLoading] = useState(false);
    const [selectedDoctorForReassign, setSelectedDoctorForReassign] = useState(null);

    // Detail View State (from DoctorCases.js)
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorCases, setDoctorCases] = useState([]);
    const [allCases, setAllCases] = useState([]);
    const [inProcessCases, setInProcessCases] = useState([]);
    const [holdingCases, setHoldingCases] = useState([]);
    const [finishedCases, setFinishedCases] = useState([]);
    const [notStartCases, setNotStartCases] = useState([]);
    const [buffAllCases, setBuffAllCases] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isCasesLoading, setIsCasesLoading] = useState(false);
    const [buffCase, setBuffCase] = useState(null);

    useEffect(() => {
        fetchAssignedDoctors();
        fetchReceptionUsers();
    }, []);

    useEffect(() => {
        if (selectedDoctor) {
            fetchDoctorCases(selectedDoctor._id);
        }
    }, [selectedDoctor]);

    const fetchAssignedDoctors = async () => {
        if (!viewingUser?._id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const res = await axios.get(`${_global.BASE_URL}doctors/assigned/${viewingUser._id}`);
            const data = res.data.data || [];
            setAssignments(data);
            if (data.length > 0 && !selectedDoctor) {
                setSelectedDoctor(data[0].doctorId);
            }
        } catch (error) {
            console.error("Error fetching assigned doctors:", error);
            showToastMessage("Error fetching assigned doctors", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDoctorCases = async (doctorId) => {
        setIsCasesLoading(true);
        try {
            const res = await axios.get(`${_global.BASE_URL}doctors/casesbydoctor/${doctorId}`);
            const result = res.data;
            setDoctorCases(result);
            setAllCases(result);
            setBuffAllCases(result);
            setFinishedCases(result.filter((r) => r.delivering.status.isEnd === true));
            setHoldingCases(result.filter((r) => r.isHold));
            setNotStartCases(
                result.filter(
                    (r) =>
                        r.cadCam.actions.length <= 0 &&
                        r.delivering.status.isEnd === false &&
                        r.isHold === false
                )
            );
            setInProcessCases(
                result.filter(
                    (r) =>
                        r.delivering.status.isEnd === false &&
                        r.cadCam.actions.length > 0 &&
                        !r.isHold
                )
            );
        } catch (error) {
            console.error("Error fetching cases:", error);
        } finally {
            setIsCasesLoading(false);
        }
    };

    const fetchReceptionUsers = async () => {
        try {
            const res = await axios.get(`${_global.BASE_URL}users`);
            const receptionists = res.data.filter((u) => u.roles.includes(_global.allRoles.Reception) && u.active);
            setReceptionUsers(receptionists);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Filters and Search (Replicated from DoctorCases.js)
    // Filters and Search
    const handleFilterChange = (casesType, filterType) => {
        const filter = (cases, type) => {
            if (type === "all") return cases;
            return _global.filterCasesByDate(cases, type);
        };

        const baseNotStart = buffAllCases.filter(r => r.cadCam.actions.length <= 0 && !r.delivering.status.isEnd && !r.isHold);
        const baseInProcess = buffAllCases.filter(r => r.delivering.status.isEnd === false && r.cadCam.actions.length > 0 && !r.isHold);
        const baseFinished = buffAllCases.filter(r => r.delivering.status.isEnd);
        const baseHolding = buffAllCases.filter(r => r.isHold);

        setAllCases(filter(buffAllCases, filterType));
        setNotStartCases(filter(baseNotStart, filterType));
        setInProcessCases(filter(baseInProcess, filterType));
        setFinishedCases(filter(baseFinished, filterType));
        setHoldingCases(filter(baseHolding, filterType));
    };

    const searchByName = (val) => {
        setSearchText(val);
        const filterFn = (item) =>
            item.caseNumber?.toLowerCase().includes(val.toLowerCase()) ||
            item?.caseType?.toLowerCase().includes(val.toLowerCase()) ||
            item.dentistObj?.name.toLowerCase().includes(val.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(val.toLowerCase());

        const baseNotStart = buffAllCases.filter(r => r.cadCam.actions.length <= 0 && !r.delivering.status.isEnd && !r.isHold);
        const baseInProcess = buffAllCases.filter(r => r.delivering.status.isEnd === false && r.cadCam.actions.length > 0 && !r.isHold);
        const baseFinished = buffAllCases.filter(r => r.delivering.status.isEnd);
        const baseHolding = buffAllCases.filter(r => r.isHold);

        setAllCases(val ? buffAllCases.filter(filterFn) : buffAllCases);
        setNotStartCases(val ? baseNotStart.filter(filterFn) : baseNotStart);
        setInProcessCases(val ? baseInProcess.filter(filterFn) : baseInProcess);
        setFinishedCases(val ? baseFinished.filter(filterFn) : baseFinished);
        setHoldingCases(val ? baseHolding.filter(filterFn) : baseHolding);
    };

    const handleUnassign = async () => {
        if (!doctorToUnassign) return;
        setIsUnassignLoading(true);
        const payload = {
            doctorIds: [doctorToUnassign._id],
            action: "unassign",
            department: "Reception",
            userId: viewingUser._id,
        };
        try {
            await axios.post(`${_global.BASE_URL}doctors/assign-doctors`, payload);
            showToastMessage("Unassigned successfully", "success");
            const updated = assignments.filter(item => item.doctorId._id !== doctorToUnassign._id);
            setAssignments(updated);
            if (selectedDoctor?._id === doctorToUnassign._id) {
                setSelectedDoctor(updated.length > 0 ? updated[0].doctorId : null);
            }
            setDoctorToUnassign(null);
        } catch (error) {
            showToastMessage("Error unassigning", "error");
        } finally {
            setIsUnassignLoading(false);
        }
    };

    const handleReassign = async () => {
        if (!selectedDoctorForReassign || !selectedAssignUser) return;
        const receptionist = receptionUsers.find(u => u._id === selectedAssignUser);
        const payload = {
            department: "Reception",
            userId: selectedAssignUser,
            userName: `${receptionist.firstName} ${receptionist.lastName}`,
            assignedBy: `${user.firstName} ${user.lastName}`,
            assignedById: user._id,
            assignedAt: new Date(),
            doctorIds: [selectedDoctorForReassign._id],
            action: "reassign",
            previousUserId: viewingUser._id
        };
        try {
            await axios.post(`${_global.BASE_URL}doctors/assign-doctors`, payload);
            showToastMessage("Reassigned successfully", "success");
            const updated = assignments.filter(item => item.doctorId._id !== selectedDoctorForReassign._id);
            setAssignments(updated);
            if (selectedDoctor?._id === selectedDoctorForReassign._id) {
                setSelectedDoctor(updated.length > 0 ? updated[0].doctorId : null);
            }
            setSelectedDoctorForReassign(null);
            setSelectedAssignUser("");
        } catch (error) {
            showToastMessage("Error reassigning doctor", "error");
        }
    };

    // Replicated Logic from DoctorCases.js
    const checkCaseDate = (item) => {
        let response = "";
        let teethNumbersByName = groupTeethNumbersByName(item.teethNumbers);
        const days = _global.getDaysfromTowDates(item.dateIn, new Date());
        if (teethNumbersByName.length > 0) {
            const implant = teethNumbersByName.find(te => te.name === "Screw Retain Crown");
            const zircon = teethNumbersByName.find(t => t.name === "Zircon");
            const veneer = teethNumbersByName.find(tee => tee.name === "Veneer");
            const emax = teethNumbersByName.find(tee => tee.name === "E-Max / Inlay/ Onlay");
            const emaxCrown = teethNumbersByName.find(tee => tee.name === "E-Max Crown");
            const study = teethNumbersByName.find(tee => tee.name === "Study");
            if (implant && implant?.count >= 4 && implant?.count <= 5 && days >= 4 && !item.receptionPacking.status.isEnd) response = "table-danger";
            if (implant && implant?.count >= 7 && days > 7 && !item.receptionPacking.status.isEnd) response = "table-danger";
            if (((zircon && zircon?.count === 4 && days > 3) || (veneer && veneer?.count === 4 && days > 3)) && !item.receptionPacking.status.isEnd) response = "table-danger";
            if (((zircon && zircon?.count > 4 && days > 7) || (veneer && veneer?.count > 4 && days > 7)) && !item.receptionPacking.status.isEnd) response = "table-danger";
            if (((emax && emax?.count > 4 && days > 7) || (emax && emax?.count === 4 && days > 3)) && !item.receptionPacking.status.isEnd) response = "table-danger";
            if (((emaxCrown && emaxCrown?.count > 4 && days > 7) || (emaxCrown && emaxCrown?.count === 4 && days > 3)) && !item.receptionPacking.status.isEnd) response = "table-danger";
            if (study && study?.count >= 1 && days >= 3 && !item.receptionPacking.status.isEnd) response = "table-danger";
        }
        return response;
    };

    const groupTeethNumbersByName = (teethNumbers) => {
        const result = {};
        teethNumbers.forEach(tn => {
            result[tn.name] = (result[tn.name] || 0) + 1;
        });
        return Object.entries(result).map(([name, count]) => ({ name, count }));
    };

    const groupCasesTeethNumbersByName = (cases) => {
        const result = {};
        cases.forEach(c => {
            c.teethNumbers.forEach(tn => {
                result[tn.name] = (result[tn.name] || 0) + 1;
            });
        });
        return Object.entries(result).map(([name, count]) => ({ name, count }));
    };

    const getReasonlate = (item) => {
        let msg = "";
        let teethNumbersByName = groupTeethNumbersByName(item.teethNumbers);
        const days = _global.getDaysfromTowDates(item.dateIn, new Date());
        if (teethNumbersByName.length > 0) {
            const implant = teethNumbersByName.find(te => te.name === "Screw Retain Crown");
            const zircon = teethNumbersByName.find(t => t.name === "Zircon");
            const veneer = teethNumbersByName.find(tee => tee.name === "Veneer");
            const study = teethNumbersByName.find(tee => tee.name === "Study");
            if (implant && implant?.count >= 4 && implant?.count <= 5 && days >= 4) msg = "4,5 units implants and more than 4 days";
            if (implant && implant?.count >= 7 && days > 7) msg = "more than 7 units implants and more than 7 days";
            if (zircon && zircon?.count === 4 && days > 3) msg = "4 units Zircon and more than 3 days";
            if (study && study?.count >= 1 && days >= 3) msg = "study than 3 days";
        }
        return msg;
    };

    const renderTable = (data, searchKey) => (
        <div className="table-responsive">
            <table className="table premium-table align-middle mb-0">
                <thead>
                    <tr>
                        <th >Case ID</th>
                        <th>Patient</th>
                        <th>In Date</th>
                        <th >Due Date</th>
                        <th className="text-center" style={{ width: '80px' }}>Units</th>
                        <th className="text-center" style={{ width: '80px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item._id} className={(item.isHold ? "table-danger" : "") || checkCaseDate(item)}>
                            <td>
                                <span className="fw-bold text-dark" title={getReasonlate(item)}>
                                    {item.caseNumber}
                                </span>
                                {item.isHold && <span className="badge badge-light-danger ms-2">Hold</span>}
                            </td>
                            <td>
                                <div className="fw-medium text-dark">{item.patientName}</div>
                                <div className="small text-muted">{item.caseType || "General"}</div>
                            </td>
                            <td>
                                <div className="small">{_global.formatDateToYYYYMMDD(item.dateIn)}</div>
                            </td>
                            <td>
                                <div className={`small ${item.dateOut ? "text-dark" : "text-muted"}`}>
                                    {item.dateOut ? _global.formatDateToYYYYMMDD(item.dateOut) : "-"}
                                </div>
                            </td>
                            <td className="text-center">
                                <span className={`status-badge ${item.teethNumbers.length <= 0 ? "badge-light-danger" : "badge-light-primary"}`}>
                                    {item.teethNumbers.length}
                                </span>
                            </td>
                            <td className="text-center">
                                <div className="action-btn-group">
                                    <button className="btn btn-sm btn-light text-primary rounded-circle shadow-sm" style={{ width: '32px', height: '32px' }} onClick={() => setBuffCase(item)} data-bs-toggle="modal" data-bs-target="#viewModal" title="View Details">
                                        <i className="fa-solid fa-eye small"></i>
                                    </button>
                                    {item?.historyHolding?.length > 0 && (
                                        <button className="btn btn-sm btn-light text-primary rounded-circle shadow-sm ms-1" style={{ width: '32px', height: '32px' }} onClick={() => setBuffCase(item)} data-bs-toggle="modal" data-bs-target="#caseHoldHistoryModal" title="History">
                                            <i className="fas fa-history small"></i>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {(user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.super_admin) && data.length > 0 && (
                        <tr className="bg-light fw-bold text-dark">
                            <td colSpan={4} className="text-end pe-4 text-uppercase small text-muted">Total Units:</td>
                            <td className="text-center">
                                <span className="badge bg-primary rounded-pill px-3 py-2">{data.reduce((acc, c) => acc + c.teethNumbers.length, 0)}</span>
                            </td>
                            <td></td>
                        </tr>
                    )}
                </tbody>
            </table>

            {(user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.super_admin) && data.length > 0 && (
                <div className="mt-4 p-4 bg-white border rounded-3 shadow-sm">
                    <h6 className="fw-bold text-dark mb-3 small text-uppercase">Units Breakdown</h6>
                    <div className="d-flex flex-wrap gap-2">
                        {groupCasesTeethNumbersByName(data).map(item => (
                            <div key={item.name} className="d-flex align-items-center bg-light px-3 py-2 rounded-pill border">
                                <span className="small text-secondary me-2 fw-medium">{item.name}</span>
                                <span className="badge bg-white text-dark border shadow-sm rounded-circle" style={{ minWidth: '24px' }}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.length === 0 && (
                <div className="text-center py-5">
                    <div className="mb-3 text-light-grey opacity-25">
                        <i className="fa-solid fa-box-open fa-3x"></i>
                    </div>
                    <p className="text-muted mb-0">No cases found matching your criteria.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="container-fluid p-0 h-100 bg-light assinged-doctor-page">
            <style>{`
                /* Premium Layout & Container */
                .assinged-doctor-page{
                    margin-top: 5rem;
                }
                .master-detail-wrapper {
                    display: flex;
                    height: calc(100vh - 120px); /* Adjusted for active margin-top */
                    background: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
                    // margin: 20px;
                    // margin-top: 30px; /* Specific top margin as requested */
                    border: 1px solid rgba(0,0,0,0.04);
                }

                /* Master List (Left Panel) */
                .master-panel {
                    width: 380px;
                    background: #fff;
                    border-right: 1px solid #dee2e6; /* Darker border */
                    display: flex;
                    flex-direction: column;
                    z-index: 2;
                }

                .master-header {
                    padding: 24px;
                    background: #fff;
                    border-bottom: 1px solid #dee2e6;
                }

                .doctor-list-item {
                    padding: 18px 24px;
                    border-bottom: 1px solid #f8f9fa;
                }

                .doctor-list-item:hover {
                    background: #fcfcfc;
                }

                .doctor-list-item.active {
                    background: #f0f7ff;
                }

                .doctor-list-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background: #0d6efd;
                    border-top-right-radius: 4px;
                    border-bottom-right-radius: 4px;
                }

                .avatar-initials {
                    width: 45px;
                    height: 45px;
                    background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
                    color: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 16px;
                    margin-right: 16px;
                    box-shadow: 0 4px 10px rgba(13, 110, 253, 0.2);
                }

                /* Detail View (Right Panel) */
                .detail-panel {
                    flex-grow: 1;
                    background: #fafafa; /* Slightly off-white for contrast */
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #adb5bd;
                    text-align: center;
                }

                .detail-header {
                    background: #fff;
                    padding: 20px 30px;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                }

                .detail-content {
                    padding: 30px;
                    overflow-y: auto;
                    height: 100%;
                }

                /* Tabs Styling - Colorful View */
                .nav-pills-premium {
                    background: #fff;
                    padding: 4px;
                    border-radius: 12px;
                    display: inline-flex;
                    gap: 8px; /* Increased gap */
                    border: none; /* Removed border for cleaner look */
                }

                .nav-pills-premium .nav-link {
                    border-radius: 8px;
                    padding: 8px 18px;
                    font-weight: 600; /* Bolder text */
                    font-size: 13px;
                    transition: all 0.2s ease-in-out;
                    border: 1px solid transparent;
                    color: #64748b;
                    background: #f8f9fa; /* Default background */
                }

                .nav-pills-premium .nav-link:hover {
                    transform: translateY(-1px);
                }

                /* Specific Colors for each tab state (Default & Active) */
                
                /* All Cases - Blue */
                .nav-pills-premium .nav-link[data-bs-target="#all"] { color: #0d6efd; background: #e7f1ff; border-color: #e7f1ff; }
                .nav-pills-premium .nav-link[data-bs-target="#all"]:hover { background: #d0e4ff; }
                .nav-pills-premium .nav-link[data-bs-target="#all"].active { background: #0d6efd; color: white; box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3); }

                /* Not Start - Info/Cyan */
                .nav-pills-premium .nav-link[data-bs-target="#notStart"] { color: #0dcaf0; background: #e0faff; border-color: #e0faff; }
                .nav-pills-premium .nav-link[data-bs-target="#notStart"]:hover { background: #cff4fc; }
                .nav-pills-premium .nav-link[data-bs-target="#notStart"].active { background: #0dcaf0; color: white; box-shadow: 0 4px 10px rgba(13, 202, 240, 0.3); }

                /* Processing - Warning/Yellow */
                .nav-pills-premium .nav-link[data-bs-target="#inProcess"] { color: #bca105; background: #fff9d6; border-color: #fff9d6; } /* Darker yellow text for contrast */
                .nav-pills-premium .nav-link[data-bs-target="#inProcess"]:hover { background: #fff3cd; }
                .nav-pills-premium .nav-link[data-bs-target="#inProcess"].active { background: #ffc107; color: #000; box-shadow: 0 4px 10px rgba(255, 193, 7, 0.3); }

                /* Hold - Danger/Red */
                .nav-pills-premium .nav-link[data-bs-target="#holding"] { color: #dc3545; background: #fce8eb; border-color: #fce8eb; }
                .nav-pills-premium .nav-link[data-bs-target="#holding"]:hover { background: #fad2d6; }
                .nav-pills-premium .nav-link[data-bs-target="#holding"].active { background: #dc3545; color: white; box-shadow: 0 4px 10px rgba(220, 53, 69, 0.3); }

                /* Finished - Success/Green */
                .nav-pills-premium .nav-link[data-bs-target="#finished"] { color: #198754; background: #d1e7dd; border-color: #d1e7dd; }
                .nav-pills-premium .nav-link[data-bs-target="#finished"]:hover { background: #badbcc; }
                .nav-pills-premium .nav-link[data-bs-target="#finished"].active { background: #198754; color: white; box-shadow: 0 4px 10px rgba(25, 135, 84, 0.3); }

                /* Table Styling - With Borders */
                .premium-table {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    border: 1px solid #dee2e6; /* Outer border */
                    margin-top: 20px;
                }
                
                .premium-table thead {
                    background: #f8f9fa;
                }

                .premium-table th {
                    font-weight: 600;
                    color: #495057;
                    padding: 16px;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 2px solid #dee2e6; /* Stronger header border */
                    border-right: 1px solid #dee2e6; /* Vertical borders */
                }
                .premium-table th:last-child { border-right: none; }

                .premium-table td {
                    padding: 16px;
                    border-bottom: 1px solid #dee2e6; /* Row borders */
                    border-right: 1px solid #dee2e6; /* Vertical borders */
                    color: #333;
                    font-size: 14px;
                }
                .premium-table td:last-child { border-right: none; }

                .premium-table tr:last-child td {
                    border-bottom: none;
                }

                .premium-table tr:hover td {
                    background-color: #fafafe;
                }

                /* Badges & Utilities */
                .status-badge {
                    padding: 6px 12px;
                    border-radius: 30px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .badge-light-primary { background: #e7f1ff; color: #0d6efd; }
                .badge-light-danger { background: #fff2f2; color: #dc3545; }
                .badge-light-success { background: #e6f8eb; color: #198754; }
                .badge-light-warning { background: #fff8e1; color: #ffc107; }

                .action-btn-group {
                    opacity: 0.8; /* Make visible by default to reduce friction */
                }

                /* Search Input */
                .search-wrapper {
                    position: relative;
                }
                .search-wrapper input {
                    padding-left: 40px;
                    border-radius: 10px;
                    border: 1px solid #ced4da; /* Slightly stronger border */
                    background: #fff;
                }
                .search-wrapper input:focus {
                    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
                    border-color: #0d6efd;
                }
                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6c757d;
                }

            `}</style>

            <div className="master-detail-wrapper">
                {/* Master Panel: Doctors List */}
                <div className="master-panel">
                    <div className="master-header">
                        <h5 className="fw-bold mb-1 text-dark">
                            Assigned Doctors
                            {viewingUser && viewingUser._id !== user._id && (
                                <small className="text-primary ms-2 d-block" style={{ fontSize: '12px' }}>
                                    Viewing: {viewingUser.firstName} {viewingUser.lastName}
                                </small>
                            )}
                        </h5>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="badge bg-light text-secondary border rounded-pill px-3">
                                {assignments.length} Total
                            </span>
                        </div>
                    </div>

                    <div className="overflow-auto flex-grow-1">
                        {isLoading ? (
                            <div className="d-flex justify-content-center align-items-center h-50">
                                <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                                <span className="text-muted small">Loading...</span>
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="fa-regular fa-folder-open fa-2x mb-3 opacity-25"></i>
                                <p className="mb-0 small">No doctors assigned</p>
                            </div>
                        ) : (
                            assignments.map((item) => {
                                const docName = `${item.doctorId.firstName} ${item.doctorId.lastName}`;
                                const initials = `${item.doctorId.firstName?.[0] || ""}${item.doctorId.lastName?.[0] || ""}`;
                                return (
                                    <div
                                        key={item._id}
                                        className={`doctor-list-item d-flex align-items-center ${selectedDoctor?._id === item.doctorId._id ? "active" : ""}`}
                                        onClick={() => setSelectedDoctor(item.doctorId)}
                                    >
                                        <div className="avatar-initials flex-shrink-0">
                                            {initials.toUpperCase()}
                                        </div>
                                        <div className="flex-grow-1 min-w-0">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <h6 className="mb-0 fw-bold text-dark text-truncate">{docName}</h6>
                                                <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                                                    <button className="btn btn-link btn-sm p-0 text-muted opacity-50" data-bs-toggle="dropdown">
                                                        <i className="fa-solid fa-ellipsis"></i>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2 rounded-3">
                                                        <li>
                                                            <button className="dropdown-item rounded-2 small mb-1" onClick={() => setSelectedDoctorForReassign(item.doctorId)} data-bs-toggle="modal" data-bs-target="#reassignModal">
                                                                <i className="fa-solid fa-user-pen me-2 text-primary"></i>Reassign
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item rounded-2 small text-danger" onClick={() => setDoctorToUnassign(item.doctorId)} data-bs-toggle="modal" data-bs-target="#unassignModal">
                                                                <i className="fa-solid fa-user-xmark me-2"></i>Unassign
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="small text-muted text-truncate mt-1">
                                                <i className="fa-solid fa-clinic-medical me-1 opacity-50"></i> {item.doctorId.clinicName}
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between mt-2">
                                                <span className="badge bg-light text-muted border border-light small fw-normal py-1 px-2" style={{ fontSize: '10px' }}>
                                                    <i className="fa-regular fa-calendar me-1"></i>
                                                    {format(new Date(item.assignedAt), "MMM dd")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Detail Panel: Cases View */}
                <div className="detail-panel">
                    {selectedDoctor ? (
                        <>
                            {/* Header */}
                            <div className="detail-header sticky-top">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <h4 className="fw-bold mb-1 text-dark">{selectedDoctor.firstName} {selectedDoctor.lastName}</h4>
                                        <div className="d-flex text-muted small gap-3">
                                            <span><i className="fa-solid fa-location-dot me-1 text-primary"></i> {selectedDoctor.address?.city || "N/A"}</span>
                                            <span><i className="fa-solid fa-phone me-1 text-primary"></i> {selectedDoctor.phone || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-2">
                                    <ul className="nav nav-pills-premium mb-0">
                                        <li className="nav-item">
                                            <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#all">All Cases</button>
                                        </li>
                                        <li className="nav-item">
                                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#notStart">Not Start ({notStartCases.length})</button>
                                        </li>
                                        <li className="nav-item">
                                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#inProcess">Processing ({inProcessCases.length})</button>
                                        </li>
                                        <li className="nav-item">
                                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#holding">Hold ({holdingCases.length})</button>
                                        </li>
                                        <li className="nav-item">
                                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#finished">Finished ({finishedCases.length})</button>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="detail-content bg-light">
                                {/* Search & Filter Bar */}
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="search-wrapper w-50">
                                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by patient, case #..."
                                            value={searchText}
                                            onChange={(e) => searchByName(e.target.value)}
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <select
                                            className="form-select border-0 shadow-sm text-secondary"
                                            style={{ width: '180px' }}
                                            onChange={(e) => handleFilterChange("allCases", e.target.value)}
                                        >
                                            <option value="all">All Dates</option>
                                            <option value="currentMonth">This Month</option>
                                            <option value="previousMonth">Last Month</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Tab Content */}
                                <div className="tab-content">
                                    <div className="tab-pane fade show active" id="all">{renderTable(allCases, "allCases")}</div>
                                    <div className="tab-pane fade" id="notStart">{renderTable(notStartCases, "notStart")}</div>
                                    <div className="tab-pane fade" id="inProcess">{renderTable(inProcessCases, "inProccess")}</div>
                                    <div className="tab-pane fade" id="holding">{renderTable(holdingCases, "holding")}</div>
                                    <div className="tab-pane fade" id="finished">{renderTable(finishedCases, "finished")}</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="bg-white p-5 rounded-circle shadow-sm mb-4" style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa-solid fa-user-doctor fa-3x text-primary opacity-50"></i>
                            </div>
                            <h4 className="fw-bold text-dark">Select a Doctor</h4>
                            <p className="text-muted">Choose a doctor from the list to view their assigned cases details.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals - Keeping funcionality same but ensuring they work */}
            {/* viewModal - Always render to prevent Bootstrap 'backdrop' error */}
            <div className="modal fade" id="viewModal" tabIndex="-1">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        {buffCase ? (
                            <>
                                <div className="modal-header bg-light border-bottom py-3">
                                    <h5 className="modal-title fw-bold text-dark"><i className="fa-solid fa-folder-open me-2 text-primary"></i>Case #{buffCase.caseNumber}</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div className="modal-body p-0">
                                    <ViewCase caseModel={buffCase} />
                                </div>
                            </>
                        ) : (
                            <div className="modal-body p-5 text-center">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reassign Modal */}
            {/* Modal Hold History Case */}
            <div
                className="modal fade"
                id="caseHoldHistoryModal"
                tabIndex="-1"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="modal-header bg-light border-0 py-3 px-4">
                            <h5 className="modal-title fw-bold text-dark">
                                <i className="fas fa-history me-2 text-primary"></i>
                                Case History #{buffCase?.caseNumber}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="d-flex flex-column gap-3">
                                {buffCase?.historyHolding?.length > 0 ? (
                                    buffCase.historyHolding.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-3 border ${item.isHold
                                                    ? "bg-light-danger border-danger border-opacity-10"
                                                    : "bg-light-success border-success border-opacity-10"
                                                }`}
                                            style={{
                                                backgroundColor: item.isHold ? "#fff5f5" : "#f0fff4"
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className={`badge ${item.isHold ? "bg-danger" : "bg-success"} rounded-pill`}>
                                                    {item.isHold ? "Hold" : "UnHold"}
                                                </span>
                                                <span className="text-muted small fw-medium">
                                                    {item.date ? format(new Date(item.date), "dd MMM yyyy, HH:mm") : "-"}
                                                </span>
                                            </div>
                                            <div className="text-dark fw-medium small mb-1">
                                                By: {item.name || "Unknown"}
                                            </div>
                                            <div className="text-muted small">
                                                <strong>Reason:</strong> {item.msg || "No message provided"}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-muted small fst-italic">
                                        No history records found
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer border-0 p-4 pt-0 bg-transparent">
                            <button
                                type="button"
                                className="btn btn-light rounded-pill px-4"
                                data-bs-dismiss="modal"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reassign Modal */}
            <div className="modal fade" id="reassignModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="modal-header bg-light border-0 py-3 px-4">
                            <h5 className="modal-title fw-bold text-dark">User Assignment</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold text-uppercase mb-2">Assigning Doctor</label>
                                <div className="d-flex align-items-center p-3 border rounded-3 bg-white shadow-sm">
                                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold me-3" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                                        {selectedDoctorForReassign?.firstName?.[0]}{selectedDoctorForReassign?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold text-dark">{selectedDoctorForReassign?.firstName} {selectedDoctorForReassign?.lastName}</h6>
                                        <div className="small text-muted">{selectedDoctorForReassign?.clinicName || "Clinic"}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="form-label text-muted small fw-bold text-uppercase mb-2">Select New Assignee</label>
                                <div className="position-relative">
                                    <i className="fa-solid fa-user-check position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                                    <select
                                        className="form-select form-select-lg ps-5 border-2 shadow-none"
                                        style={{ fontSize: '15px' }}
                                        value={selectedAssignUser}
                                        onChange={(e) => setSelectedAssignUser(e.target.value)}
                                    >
                                        <option value="">Choose permitted user...</option>
                                        {receptionUsers.filter(u => u._id !== user._id).map(u => (
                                            <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-0 p-4 pt-0 bg-transparent">
                            <button className="btn btn-light rounded-pill px-4 fw-medium" data-bs-dismiss="modal">Cancel</button>
                            <button
                                className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm"
                                onClick={handleReassign}
                                data-bs-dismiss="modal"
                                disabled={!selectedAssignUser}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unassign Modal */}
            <div className="modal fade" id="unassignModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-sm">
                    <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                        <div className="modal-body text-center p-4">
                            <div className="mb-3 mx-auto rounded-circle bg-light-danger d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', background: '#ffebee' }}>
                                <i className="fa-solid fa-user-xmark fa-xl text-danger"></i>
                            </div>
                            <h5 className="fw-bold mb-2">Unassign Doctor?</h5>
                            <p className="text-muted small mb-4">Are you sure you want to remove <strong>{doctorToUnassign?.firstName}</strong> from your list? This cannot be undone.</p>
                            <div className="d-grid gap-2">
                                <button className="btn btn-danger rounded-pill shadow-sm" onClick={handleUnassign} data-bs-dismiss="modal">Yes, Unassign</button>
                                <button className="btn btn-light rounded-pill" data-bs-dismiss="modal">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignedDoctors;
