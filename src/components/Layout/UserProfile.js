import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as _global from "../../config/global";
import ReactToPrint, { useReactToPrint } from 'react-to-print';
const UserProfile = ()=>{
  const userRef = useRef();
  const user  = JSON.parse(localStorage.getItem("user"))
  const departments = JSON.parse(localStorage.getItem("departments"))
   const { state } = useLocation();
   console.log("stateeeeeee",state)
   const navigate = useNavigate();
  const [casesUser, setCasesUser] = useState([]);
  const [buffCasesUser, setBuffCasesUser] = useState([]);
   const [userData, setUserData] = useState(state ? state : user );
  const [searchText, setSearchText] = useState([]);
  const [startDate, setStartDat] = useState(new Date());
  console.log('User Data',userData)

   const Roles = {
    0: "admin",
    1: "manager",
    2: "teamleader",
    3: "technician",
    4: "Reception",
    5: "Driver",
    6: "graphic_design",
    7: "software_Engineer"
    // Add more roles as needed
  };
  useEffect(()=>{
    
    axios
    .get(`${_global.BASE_URL}users/actions/${state ? state._id : user._id}`)
    .then((res) => {
      const result = res.data;
      setCasesUser(result);
      console.log('casesUser',result)
      setBuffCasesUser(result);
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
    });
  },[])
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
  function sumOfTeethNumbersLength() {
    let totalLength = 0;
    casesUser.forEach(caseItem => {
        totalLength += caseItem.teethNumbers.length;
    });
    return totalLength;
}
const searchByName = (searchText) => {
    setSearchText(searchText);
    if (searchText !== "") {
      const filteredCases = buffCasesUser.filter(
        (item) =>
            item.caseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.dentistObj?.name
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            item?.patientName.toLowerCase().includes(searchText.toLowerCase()) 
      );
      setCasesUser(filteredCases);
    } else {
     setCasesUser(buffCasesUser);
    }
};
const searchByDate = (e) => {
  console.log("userData.departments[0]",userData.departments[0])
    const date = e.target.value
    setStartDat(date)
    if(date != "")
    {
      console.log("date")
      if(userData.isAdmin ? userData.departments[0].name === "CadCam" : departments[0].name === "CadCam"){
        const filteredCases = buffCasesUser.filter((item) => {
          return  _global.formatDateToYYYYMMDD(item.cadCam.actions.find(i=>i.dateEnd).dateEnd) === date;
      });
          setCasesUser(filteredCases);
      }
      if(userData.isAdmin ? userData.departments[0].name === "Caramic" : departments[0].name === "Caramic"){
        const filteredCases = buffCasesUser.filter((item) => {
          return  _global.formatDateToYYYYMMDD(item.ceramic.actions.find(i=>i.dateEnd).dateEnd) === date;
      });
          setCasesUser(filteredCases);
      }
      if(userData.isAdmin ? userData.departments[0].name === "Fitting" : departments[0].name === "Fitting"){
        const filteredCases = buffCasesUser.filter((item) => {
          return  _global.formatDateToYYYYMMDD(item.fitting.actions.find(i=>i.dateEnd).dateEnd) === date;
      });
      
          setCasesUser(filteredCases);
      }
      if(userData.isAdmin ? userData.departments[0].name === "Plaster" : departments[0].name === "Plaster"){
        const filteredCases = buffCasesUser.filter((item) => {
          return  _global.formatDateToYYYYMMDD(item.plaster.actions.find(i=>i.dateEnd).dateEnd) === date;
      });
      
          setCasesUser(filteredCases);
      } 
      if(userData.isAdmin ? userData.departments[0].name === "Reception" : departments[0].name === "Reception"){
        const filteredCases = buffCasesUser.filter((item) => {
          return  _global.formatDateToYYYYMMDD(item.receptionPacking.actions.find(i=>i.dateEnd).dateEnd) === date;
      });
      
          setCasesUser(filteredCases);
      }
      if(userData.isAdmin ? userData.departments[0].name === "Marketing" : departments[0].name === "Marketing"){
        const filteredCases = buffCasesUser.filter((item) => {
          return  _global.formatDateToYYYYMMDD(item.designing.actions.find(i=>i.dateEnd).dateEnd) === date;
      });
      
          setCasesUser(filteredCases);
      }
      if(userData.isAdmin ? userData.departments[0].name === "QC" : departments[0].name === "QC"){
        const filteredCases = buffCasesUser.filter((item) => {
          return  _global.formatDateToYYYYMMDD(item.qualityControl.actions.find(i => i.dateEnd).dateEnd) === date;
      });
      
          setCasesUser(filteredCases);
      }
      if(userData.isAdmin ? userData.departments[0].name === "Drivers" : departments[0].name === "Drivers"){
        const filteredCases = buffCasesUser.filter((item) => {
          return  _global.formatDateToYYYYMMDD(item.delivering.actions.find(i=>i.dateEnd).dateEnd) === date;
      });
      
          setCasesUser(filteredCases);
      }
    }
    else {
        setCasesUser(buffCasesUser);
    }
}
const searchByEndDate = (e) => {
  const date = e.target.value
  const start = _global.formatDateToYYYYMMDD(startDate);
  const end = _global.formatDateToYYYYMMDD(date);
  if(date != "")
  {
    const filteredCases = buffCasesUser.filter((item) => {
      let endDateStr = "";
      if (userData.isAdmin ? userData.departments[0].name === "CadCam" : departments[0].name === "CadCam") {
          endDateStr = _global.formatDateToYYYYMMDD(item.cadCam.actions.find(i => i.dateEnd).dateEnd);
      }
      if (userData.isAdmin ? userData.departments[0].name === "Caramic" : departments[0].name === "Caramic") {
          endDateStr = _global.formatDateToYYYYMMDD(item.ceramic.actions.find(i => i.dateEnd).dateEnd);
      }
      if (userData.isAdmin ? userData.departments[0].name === "Fitting" : departments[0].name === "Fitting") {
          endDateStr = _global.formatDateToYYYYMMDD(item.fitting.actions.find(i => i.dateEnd).dateEnd);
      }
      if (userData.isAdmin ? userData.departments[0].name === "Plaster" : departments[0].name === "Plaster") {
          endDateStr = _global.formatDateToYYYYMMDD(item.plaster.actions.find(i => i.dateEnd).dateEnd);
      }
      if (userData.isAdmin ? userData.departments[0].name === "Reception" : departments[0].name === "Reception") {
          endDateStr = _global.formatDateToYYYYMMDD(item.receptionPacking.actions.find(i => i.dateEnd).dateEnd);
      }
      if (userData.isAdmin ? userData.departments[0].name === "Marketing" : departments[0].name === "Marketing") {
          endDateStr = _global.formatDateToYYYYMMDD(item.designing.actions.find(i => i.dateEnd).dateEnd);
      }
      if (userData.isAdmin ? userData.departments[0].name === "QC" : departments[0].name === "QC") {
        endDateStr = _global.formatDateToYYYYMMDD(item.qualityControl.actions.find(i => i.dateEnd).dateEnd);
    }
      if (userData.isAdmin ? userData.departments[0].name === "Drivers" : departments[0].name === "Drivers") {
          endDateStr = _global.formatDateToYYYYMMDD(item.delivering.actions.find(i => i.dateEnd).dateEnd);
      }

      return endDateStr >= start && endDateStr <= end;
  });
  setCasesUser(filteredCases);
  }
  else {
      setCasesUser(buffCasesUser);
  }
}
const getFinisheingDate = (item) => {
  if (item) {
    let endDateStr = "";
    if (userData.departments[0].name === "CadCam") {
        endDateStr = _global.formatDateToYYYYMMDD(item.cadCam.actions.find(i => i.dateEnd).dateEnd);
    }
    if (userData.departments[0].name === "Caramic") {
        endDateStr = _global.formatDateToYYYYMMDD(item.ceramic.actions.find(i => i.dateEnd).dateEnd);
    }
    if (userData.departments[0].name === "Fitting") {
        endDateStr = _global.formatDateToYYYYMMDD(item.fitting.actions.find(i => i.dateEnd).dateEnd);
    }
    if (userData.departments[0].name === "Plaster") {
        endDateStr = _global.formatDateToYYYYMMDD(item.plaster.actions.find(i => i.dateEnd).dateEnd);
    }
    if (userData.departments[0].name === "Reception") {
        endDateStr = _global.formatDateToYYYYMMDD(item.receptionPacking.actions.find(i => i.dateEnd).dateEnd);
    }
    if (userData.departments[0].name === "Marketing") {
        endDateStr = _global.formatDateToYYYYMMDD(item.designing.actions.find(i => i.dateEnd).dateEnd);
    }
    if (userData.departments[0].name === "Drivers") {
        endDateStr = _global.formatDateToYYYYMMDD(item.delivering.actions.find(i => i.dateEnd).dateEnd);
    }
     return endDateStr
  } else {
    return '-';
  }
};

  const handlePrint = useReactToPrint({
    content: () => userRef.current,
    documentTitle: `Name: ${userData.firstName}   ${userData.lastName}`,
  })
  const editCase = (id)=>{
    navigate(`/layout/edit-case/${id}`)
  }
    return (
    <div className="content user-profile">
    <div className="card">
    <h6 class="card-title">
     <span >
     {/* <span className="back-step" onClick={() => navigate("/layout/users")}>
            <i class="fa-solid fa-arrow-left-long"></i>
     </span> */}
    <small>{userData.firstName} {userData.lastName} ({casesUser.length })</small>
     </span>
     <span >
        <small>Role:       
        {userData.roles.map((roleId, index) => (
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
    {casesUser.length > 0 && 
    <div className="col-12 mb-3 print-btn">
        <button className="btn btn-sm btn-primary " onClick={()=>handlePrint()}> <i class="fas fa-print"></i> print</button>
      </div>
   }
   {/* Search Input */}
     <div className="col-lg-6 ">
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
    {/* Start Date */}
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
    {/* End Date */}
    <div className="col-lg-3 ">
    <div className="form-group">
        <input
        type="date"
        className="form-control"
        placeholder=" End Date"
        onChange={(e) => searchByEndDate(e)}
        />
        </div>
    </div>
    </div>
    <div ref={userRef} style={{width:"100%"}}>
    {casesUser.length > 0 &&
    <table className="table text-center table-bordered">
    <thead>
        <tr className="table-secondary">
        <th scope="col">#</th>
        <th scope="col">FinishedAt</th>
        <th scope="col">Doctor</th>
        <th scope="col">Patient</th>
        <th scope="col">#teeth</th>
        <th scope="col">Actions</th>
        </tr>
    </thead>
    <tbody>
        {casesUser.map((item) => (
        <tr key={item._id}>
            <td>
            {item.caseNumber}
            </td>
            <td >
            {getFinisheingDate(item)}
            </td>
            <td>{item?.dentistObj?.name}</td>
            <td>
            {item.patientName}
            </td>
            <td className="teeth-pieces">
            {
            groupTeethNumbersByName(item.teethNumbers)?.map((item)=>
            <p className="teeth-piece">
                <span>{item.name}:</span> 
                <b className="badge text-bg-light">{item.count}</b>
            </p>
            )
            }
            </td>
            <td>
            { (user.roles[0] ===  _global.allRoles.technician && user.lastName === "Jamous" || user.roles[0] ===  _global.allRoles.technician && departments[0].name === "CadCam" ||  user.roles[0] ===  _global.allRoles.admin && departments[0].name === "QC")&&
                <span className="c-primary ml-3" onClick={(e) => editCase(item._id)}>
                <i class="fas fa-edit"></i>
                </span>
            }
            </td>
        </tr>
        ))}
        <tr>
        <td  className="f-bold c-success" colSpan={4}>
            <b>Total of Pieces</b>
        </td>
        <td className="bg-success p-2 text-dark bg-opacity-50">
            <b>{
            sumOfTeethNumbersLength()
            }</b> 
            </td>
        </tr>
        <tr>
        <td   colSpan={5}>
        
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
    </div>
    {
    casesUser.length <= 0 && 
    <div className="text-center">
    <h6>No have Cases </h6>
    </div>
    }
    </div>
    </div>
</div>
)
}
export default UserProfile