import { useEffect, useState } from "react";
import * as _global from "../../config/global";
import WorkoutDetails from "../../components/WorkoutDetails";
import WorkoutFrom from "../../components/WorkoutFrom";
import jsonData from "../../data/csvjson.json";
import * as Papa from "papaparse";
import Navbar from "../../components/Layout/Navbar";
import Sidebar from "../../components/Layout/Sidebar";
import { Outlet } from "react-router-dom";
const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <Outlet />
      {/* <Content/> */}
    </div>
  );
};

export default Layout;
