import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as _global from "../../config/global";

const UserProfile = ()=>{
   const { state } = useLocation();
   const navigate = useNavigate();
  const [casesUser, setCasesUser] = useState([]);
  const [buffCasesUser, setBuffCasesUser] = useState([]);
   const [userData, setUserData] = useState(state);
  const [searchText, setSearchText] = useState([]);
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
    .get(`${_global.BASE_URL}users/actions/${state._id}`)
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
    const date = e.target.value
    if(date != "")
    {
    const filteredCases = buffCasesUser.filter((item) => {
        return  _global.formatDateToYYYYMMDD(item.dateCreated) === date;
    });
        setCasesUser(filteredCases);
    }
    else {
        setCasesUser(buffCasesUser);
    }

      
};
    return (
    <div className="content user-profile">
    <div className="card">
    <h6 class="card-title">
     <span >
     <span className="back-step" onClick={() => navigate("/layout/users")}>
            <i class="fa-solid fa-arrow-left-long"></i>
     </span>
    <small>{userData.firstName} {userData.lastName}</small>
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
     <div className="col-lg-8 ">
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
    <div className="col-lg-4 ">
    <div className="form-group">
        <input
        type="date"
        className="form-control"
        placeholder="Date"
        onChange={(e) => searchByDate(e)}
        />
        </div>
    </div>
    </div>
    {casesUser.length > 0 &&
    <table className="table text-center table-bordered">
    <thead>
        <tr className="table-secondary">
        <th scope="col">#</th>
        <th scope="col">CreatedAt</th>
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
            <td >
            {_global.formatDateToYYYYMMDD(item.dateCreated)}
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