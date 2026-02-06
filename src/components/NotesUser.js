import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import * as _global from "../config/global";

const NotesUser =()=>{
 const { state } = useLocation();
 const [userData,setUserData]=useState(state)
 console.log(userData)
const [positiveNotes,setPositiveNotes] = useState(userData.notes.filter(n =>n.noteType === "Positive"))
const [negativeNotes,setNegativeNotes] = useState(userData.notes.filter(n =>n.noteType === "Negative"))
 const userRef = useRef();
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
    // Add more roles as needed
  };
  const handlePrint = useReactToPrint({
    content: () => userRef.current,
    documentTitle: `Name: ${userData?.firstName}   ${userData?.lastName}`,
  })
 return (
    <div className="content user-profile notes-user">
    <div className="card">
    <h6 class="card-title">
     <span >
    <small>{userData?.firstName} {userData?.lastName} </small>
     </span>
     <span >
        <small>Role:       
        {userData?.roles.map((roleId, index) => (
            <span className="text-capitalize c-success" key={index}>
            {Roles[roleId]}
            {index !== userData.roles.length - 1 && ", "}
            </span>
        ))}
        </small>
     </span>
    </h6>
    <div className="card-body">
    <div className="row">
    {userData?.notes.length > 0 && 
    <div className="col-12 mb-3 print-btn">
        <button className="btn btn-sm btn-primary " onClick={()=>handlePrint()}> <i class="fas fa-print"></i> print</button>
      </div>
   }
     {/* <div className="col-lg-6 ">
        <div className="form-group">
        <input
        type="text"
        name="searchText"
        className="form-control"
        placeholder="Search by name | case number | case type "
        value={searchText}
        onChange={(e) => searchByName(e.target.value)}
        />
        </div>
    </div>
    <div className="col-lg-3 ">
    <div className="form-group">
        <input
        type="date"
        className="form-control"
        placeholder="Start Date"
        onChange={(e) => searchByDate(e)}
        />
        </div>
    </div>
    <div className="col-lg-3 ">
    <div className="form-group">
        <input
        type="date"
        className="form-control"
        placeholder=" End Date"
        onChange={(e) => searchByEndDate(e)}
        />
        </div>
    </div> */}
    </div>
    <div ref={userRef} style={{width:"100%"}}>
    {userData?.notes.length > 0 &&
     <>
        <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
        <button
            class="nav-link active bgc-success"
            id="positive-tab"
            data-bs-toggle="tab"
            data-bs-target="#positive-tab-pane"
            type="button"
            role="tab"
            aria-controls="positive-tab-pane"
            aria-selected="false"
        >
            Positive <small>({positiveNotes.length})</small>
        </button>
        </li>
        <li
        class="nav-item"
        role="presentation"
        >
        <button
            class="nav-link  bgc-danger"
            id="negative-tab"
            data-bs-toggle="tab"
            data-bs-target="#negative-tab-pane"
            type="button"
            role="tab"
            aria-controls="negative-tab-pane"
            aria-selected="true"
        >
            Negative <small>({negativeNotes.length})</small>
        </button>
        </li>
        </ul>
        <div
          class="tab-content"
          id="myTabContent"
        >
          {/* Positive Notes */}
          <div
            class="tab-pane fade show active"
            id="positive-tab-pane"
            role="tabpanel"
            aria-labelledby="positive-tab"
            tabIndex="0"
          >
            {positiveNotes.length > 0 && (
            <table className="table text-center table-bordered">
            <thead>
                <tr className="table-secondary">
                <th scope="col">#Case</th>
                <th scope="col">Content</th>
                <th scope="col">Date</th>
                <th scope="col">Type</th>
                </tr>
            </thead>
            <tbody>
                {positiveNotes.map((item) => (
                <tr key={item.id} className={item.noteType === "Negative" ? "table-danger" : "table-success"}>
                    <td>
                    {item.caseNumber}
                    </td>
                    <td >
                    {item.title}
                    </td>
                    <td className="w-25">
                        {_global.formatDateToYYYYMMDD(item.date)}
                    </td>
                    <td>
                    {item.noteType}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            )}
            {positiveNotes.length <= 0 && (
              <div className="no-content">No Positive Notes Added yet!</div>
            )}
          </div>
          {/* negative Notes*/}
          <div
            class="tab-pane fade "
            id="negative-tab-pane"
            role="tabpanel"
            aria-labelledby="negative-tab"
            tabIndex="0"
          >
            {negativeNotes.length > 0 && (
                <table className="table text-center table-bordered">
                <thead>
                    <tr className="table-secondary">
                    <th scope="col">#Case</th>
                    <th scope="col">Content</th>
                    <th scope="col">Date</th>
                    <th scope="col">Type</th>
                    </tr>
                </thead>
                <tbody>
                    {negativeNotes.map((item) => (
                    <tr key={item.id} className={item.noteType === "Negative" ? "table-danger" : "table-success"}>
                        <td>
                        {item.caseNumber}
                        </td>
                        <td >
                        {item.title}
                        </td>
                        <td className="w-25">
                            {_global.formatDateToYYYYMMDD(item.date)}
                        </td>
                        <td>
                        {item.noteType}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
            {negativeNotes.length <= 0 && (
              <div className="no-content">No Negative Notes Added yet!</div>
            )}
          </div>
        </div>
    </>
    }
    </div>
    {
    userData?.notes.length <= 0 && 
    <div className="text-center">
    <h6>No have Notes </h6>
    </div>
    }
    </div>
    </div>
</div>
)
}

export default NotesUser