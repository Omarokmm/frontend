import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import * as _global from "../../../config/global";
import { showToastMessage } from "../../../helper/toaster";
import "./Reports.css";

const Reports = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const REPORTS_CACHE_VERSION = 1;
  const REPORTS_CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
  const REPORTS_CACHE_KEY = `reports_cache_v${REPORTS_CACHE_VERSION}_${user?._id || "anon"}`;

  const safeJsonParse = (value, fallback = null) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const isCacheValid = (cache) => {
    if (!cache || typeof cache !== "object") return false;
    if (cache.version !== REPORTS_CACHE_VERSION) return false;
    if (!cache.savedAt || typeof cache.savedAt !== "number") return false;
    return Date.now() - cache.savedAt <= REPORTS_CACHE_TTL_MS;
  };

  // Cases data
  const [allCases, setAllCases] = useState([]);

  useEffect(() => {
    // Fetch cases for lookup once
    axios.get(`${_global.BASE_URL}cases/cases-by-month`)
      .then((res) => {
        setAllCases(res.data.cases || []);
      })
      .catch((err) => console.error("Error fetching cases", err));

    // Fetch technicians
    axios.get(`${_global.BASE_URL}users`)
      .then((res) => {
        const list = (res.data || []).filter(u => u.active === true);
        setTechnicians(list);
      })
      .catch((err) => console.error("Error fetching technicians", err));
  }, []);

  const [activeReportTab, setActiveReportTab] = useState(0); // 0: Daily, 1: Departments

  // Department report states
  const [deptSections, setDeptSections] = useState([]); // [{ technicianName: "", items: [], print: true }]
  const [newTechName, setNewTechName] = useState("");
  const [sectionInputs, setSectionInputs] = useState({}); // { techIdx: { caseNumber: "", notes: "" } }
  const [technicians, setTechnicians] = useState([]);

  // States for section names
  const [cadCamTitle, setCadCamTitle] = useState("CadCam");
  const [fittingTitle, setFittingTitle] = useState("Fitting");
  const [ceramicTitle, setCeramicTitle] = useState("Ceramic");

  // States for table items
  const [cadCamItems, setCadCamItems] = useState([]);
  const [fittingItems, setFittingItems] = useState([]);
  const [ceramicItems, setCeramicItems] = useState([]);

  // States for new inputs
  const [newCadCam, setNewCadCam] = useState({ caseNumber: "", notes: "" });
  const [newFitting, setNewFitting] = useState({ caseNumber: "", notes: "" });
  const [newCeramic, setNewCeramic] = useState({ caseNumber: "", notes: "" });

  // Print selection
  const [printSelection, setPrintSelection] = useState({
    cadCam: true,
    fitting: true,
    ceramic: true,
  });

  // Column visibility for print per section
  const [printColumns, setPrintColumns] = useState({
    cadCam: { caseNumber: true, doctor: true, patient: true, units: true, cadCamCol: true, ceramicCol: true, dateIn: true, notes: true, addedBy: true, dateTime: true },
    fitting: { caseNumber: true, doctor: true, patient: true, units: true, cadCamCol: true, ceramicCol: true, dateIn: true, notes: true, addedBy: true, dateTime: true },
    ceramic: { caseNumber: true, doctor: true, patient: true, units: true, cadCamCol: true, ceramicCol: true, dateIn: true, notes: true, addedBy: true, dateTime: true }
  });

  const printColumnLabels = {
    caseNumber: '#',
    doctor: 'Doctor',
    patient: 'Patient',
    units: 'Units & Mat.',
    cadCamCol: 'CadCam',
    ceramicCol: 'Ceramic',
    dateIn: 'Date In',
    notes: 'Notes',
    addedBy: 'Added By',
    dateTime: 'Date & Time',
  };

  // Edit note state: { section, idx, text }
  const [editingNote, setEditingNote] = useState(null);

  // Sort state per section: { key: 'cadCam'|'ceramic', asc: true|false }
  const [sortConfig, setSortConfig] = useState({});
  const hasHydratedFromCacheRef = useRef(false);

  const toggleSort = (sectionKey, field) => {
    setSortConfig(prev => {
      const current = prev[sectionKey];
      if (current?.key === field) {
        return { ...prev, [sectionKey]: { key: field, asc: !current.asc } };
      }
      return { ...prev, [sectionKey]: { key: field, asc: true } };
    });
  };

  const getSortedItems = (items, sectionKey) => {
    const cfg = sortConfig[sectionKey];
    if (!cfg) return items;
    return [...items].sort((a, b) => {
      const getVal = (item) => {
        const asgn = getCadCamAndCeramicAssignments(item.caseData);
        return (cfg.key === 'cadCam' ? asgn.cadCam : asgn.ceramic) || '';
      };
      const valA = getVal(a).toLowerCase();
      const valB = getVal(b).toLowerCase();
      if (valA < valB) return cfg.asc ? -1 : 1;
      if (valA > valB) return cfg.asc ? 1 : -1;
      return 0;
    });
  };

  const saveNote = (itemsList, setItemsList) => {
    if (!editingNote) return;
    const updated = itemsList.map((item, i) =>
      i === editingNote.idx ? { ...item, notes: editingNote.text } : item
    );
    setItemsList(updated);
    setEditingNote(null);
  };

  const printRef = useRef();

  const triggerPrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Daily Report',
  });

  const handleSaveAndPrint = async () => {
    // Collect the checked sections to print & save
    const sectionsToSave = [];
    if (printSelection.cadCam && cadCamItems.length > 0) {
      sectionsToSave.push({ title: cadCamTitle, items: cadCamItems });
    }
    if (printSelection.fitting && fittingItems.length > 0) {
      sectionsToSave.push({ title: fittingTitle, items: fittingItems });
    }
    if (printSelection.ceramic && ceramicItems.length > 0) {
      sectionsToSave.push({ title: ceramicTitle, items: ceramicItems });
    }

    if (sectionsToSave.length === 0) {
      showToastMessage("No cases to save/print in selected sections.", "error");
      return;
    }

    const currentDateTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const generatedBy = `${user.firstName} ${user.lastName}`;

    try {
      // Build the single report payload with an array of Sections
      const reportData = {
        dateTime: currentDateTime,
        GeneratedBy: generatedBy,
        user: user._id,
        Sections: sectionsToSave.map(section => ({
          sectionName: section.title,
          Cases: section.items.map(item => ({
            caseId: item.caseData._id,
            notes: item.notes || "",
            AddedBy: item.user,
            DateTime: item.dateTime,
          }))
        }))
      };

      // await axios.post(`${_global.BASE_URL}reports`, reportData, {
      //   headers: {
      //     Authorization: `Bearer ${user.token}`,
      //   },
      // });

      showToastMessage("Report saved successfully!", "success");
      // After saving, trigger the print dialog
      triggerPrint();

    } catch (error) {
      console.error("Error saving report:", error);
      showToastMessage("Error saving report to backend.", "error");
    }
  };

  const groupTeethNumbersByName = (teethNumbers) => {
    if (!teethNumbers || !Array.isArray(teethNumbers)) return [];
    const result = {};
    teethNumbers.forEach((teethNumber) => {
      const { name } = teethNumber;
      if (!result[name]) {
        result[name] = 0;
      }
      result[name]++;
    });
    return Object.entries(result).map(([name, count]) => ({ name, count }));
  };

  const getUnitsAndMaterials = (c) => {
    const groupedTeeth = groupTeethNumbersByName(c.teethNumbers);

    return (
      <div className="summary-teeth-cases" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {groupedTeeth.map((item, idx) => (
          <p className="mb-0" key={idx}>
            <span>{item.name}:</span>
            <b className="badge text-bg-success ms-1">
              {item.count}
            </b>
          </p>
        ))}
      </div>
    );
  };

  const getCadCamAndCeramicAssignments = (caseItem) => {
    if (!caseItem?.assignmentHistory || caseItem.assignmentHistory.length === 0) {
      return { cadCam: null, ceramic: null };
    }
    let cadCamUser = null;
    let ceramicUser = null;
    for (let i = caseItem.assignmentHistory.length - 1; i >= 0; i--) {
      const historyEntry = caseItem.assignmentHistory[i];
      const assignments = historyEntry?.newAssignment || [];
      if (!cadCamUser) {
        const cadCam = assignments.find(a => a.department === "CadCam");
        if (cadCam) cadCamUser = cadCam.userName;
      }
      if (!ceramicUser) {
        const ceramic = assignments.find(a => a.department === "Caramic");
        if (ceramic) ceramicUser = ceramic.userName;
      }
      if (cadCamUser && ceramicUser) break;
    }
    return { cadCam: cadCamUser, ceramic: ceramicUser };
  };

  const formatDoctorName = (name) => {
    if (!name) return "-";
    const parts = name.split(",");
    if (parts.length >= 2) {
      return `${parts[0].trim()} , ${parts[1].trim()},`;
    }
    return name.split("(")[0].trim();
  };

  const buildDailyItemFromCase = (foundCase, notes = "", meta = {}) => {
    if (!foundCase) return null;
    return {
      caseId: String(foundCase?._id || foundCase?.caseNumber || "").trim(),
      caseNumber: foundCase?.caseNumber || "-",
      doctorName: formatDoctorName(foundCase?.dentistObj?.name),
      patientName: foundCase?.patientName || "-",
      unitsMaterials: getUnitsAndMaterials(foundCase),
      dateIn: foundCase?.dateIn ? new Date(foundCase.dateIn).toLocaleDateString() : "-",
      notes: notes || "",
      user: meta.user || `${user.firstName} ${user.lastName}`,
      dateTime: meta.dateTime || new Date().toLocaleString(),
      caseData: foundCase
    };
  };

  const buildDeptItemFromCase = (foundCase, notes = "", units, meta = {}) => {
    if (!foundCase) return null;
    return {
      caseNumber: foundCase.caseNumber,
      doctorName: formatDoctorName(foundCase?.dentistObj?.name),
      patientName: foundCase?.patientName || "-",
      units: units ?? (foundCase.teethNumbers?.length || 0),
      dateIn: foundCase?.dateIn ? new Date(foundCase.dateIn).toLocaleDateString() : "-",
      notes: notes || "",
      user: meta.user || `${user.firstName} ${user.lastName}`,
      dateTime: meta.dateTime || new Date().toLocaleString(),
      caseData: foundCase
    };
  };

  const handleAddItem = (section, item, setItemState, itemsList, setItemsList) => {
    console.log(item);
    if (!item.caseNumber) return;

    // The user input 'item.caseNumber' is expected to be the _id
    const caseId = String(item.caseNumber).trim();

    const foundCase = allCases.find(c => String(c.caseNumber) === item.caseNumber);

    if (!foundCase) {
      showToastMessage("Case not found or invalid ID", "error");
      return;
    }

    const newItem = buildDailyItemFromCase(foundCase, item.notes || "", {
      user: `${user.firstName} ${user.lastName}`,
      dateTime: new Date().toLocaleString(),
    }) || {
      caseId: caseId,
      caseNumber: foundCase?.caseNumber || caseId,
      doctorName: formatDoctorName(foundCase?.dentistObj?.name),
      patientName: foundCase?.patientName || "-",
      unitsMaterials: foundCase ? getUnitsAndMaterials(foundCase) : "-",
      dateIn: foundCase?.dateIn ? new Date(foundCase.dateIn).toLocaleDateString() : "-",
      notes: item.notes || "",
      user: `${user.firstName} ${user.lastName}`,
      dateTime: new Date().toLocaleString(),
      caseData: foundCase
    };

    setItemsList([...itemsList, newItem]);
    setItemState({ caseNumber: "", notes: "" });
  };

  const removeItem = (index, itemsList, setItemsList) => {
    const updatedList = itemsList.filter((_, i) => i !== index);
    setItemsList(updatedList);
  };

  const addTechSection = () => {
    if (!newTechName) {
      showToastMessage("Please select a technician", "error");
      return;
    }
    const exists = deptSections.some(s => s.technicianName === newTechName);
    if (exists) {
      showToastMessage("Technician section already exists", "error");
      return;
    }
    setDeptSections([...deptSections, {
      technicianName: newTechName,
      items: [],
      print: true,
      columns: { caseNumber: true, doctor: true, patient: true, units: true, dateIn: true, cadCam: true, notes: true, addedBy: true }
    }]);
    setNewTechName("");
  };

  const addCaseToSection = (techIdx) => {
    const inputs = sectionInputs[techIdx] || { caseNumber: "", notes: "" };
    if (!inputs.caseNumber) return;

    const duplicate = deptSections[techIdx].items.find(i => String(i.caseNumber) === String(inputs.caseNumber));
    if (duplicate) {
      showToastMessage("This case is already in this technician's list", "warning");
      return;
    }

    const foundCase = allCases.find(c => String(c.caseNumber) === inputs.caseNumber);

    if (!foundCase) {
      showToastMessage("Case not found or invalid Number", "error");
      return;
    }

    const newItem = buildDeptItemFromCase(foundCase, inputs.notes || "", foundCase.teethNumbers?.length, {
      user: `${user.firstName} ${user.lastName}`,
      dateTime: new Date().toLocaleString(),
    }) || {
      caseNumber: foundCase.caseNumber,
      doctorName: formatDoctorName(foundCase?.dentistObj?.name),
      patientName: foundCase?.patientName || "-",
      units: foundCase.teethNumbers.length,
      dateIn: foundCase?.dateIn ? new Date(foundCase.dateIn).toLocaleDateString() : "-",
      notes: inputs.notes || "",
      user: `${user.firstName} ${user.lastName}`,
      dateTime: new Date().toLocaleString(),
      caseData: foundCase
    };

    setDeptSections(prev => {
      const updated = [...prev];
      const techSection = updated[techIdx];

      // Secondary check within the functional update to prevent race conditions
      const isDuplicate = techSection.items.some(i => String(i.caseNumber) === String(newItem.caseNumber));
      if (isDuplicate) return prev;

      updated[techIdx] = {
        ...techSection,
        items: [...techSection.items, newItem]
      };
      return updated;
    });

    setSectionInputs({
      ...sectionInputs,
      [techIdx]: { caseNumber: "", notes: "" }
    });
  };

  // Hydrate cached report data once cases are available (so we can rebuild display fields).
  useEffect(() => {
    if (hasHydratedFromCacheRef.current) return;
    if (!user?._id) return;
    if (!Array.isArray(allCases) || allCases.length === 0) return;

    const raw = localStorage.getItem(REPORTS_CACHE_KEY);
    const cache = safeJsonParse(raw, null);
    if (!isCacheValid(cache)) {
      hasHydratedFromCacheRef.current = true;
      return;
    }

    try {
      if (cache.daily) {
        if (typeof cache.daily.cadCamTitle === "string") setCadCamTitle(cache.daily.cadCamTitle);
        if (typeof cache.daily.fittingTitle === "string") setFittingTitle(cache.daily.fittingTitle);
        if (typeof cache.daily.ceramicTitle === "string") setCeramicTitle(cache.daily.ceramicTitle);

        if (cache.daily.printSelection && typeof cache.daily.printSelection === "object") {
          setPrintSelection(prev => ({ ...prev, ...cache.daily.printSelection }));
        }
        if (cache.daily.printColumns && typeof cache.daily.printColumns === "object") {
          setPrintColumns(prev => ({ ...prev, ...cache.daily.printColumns }));
        }

        const rehydrateDailyList = (list) => {
          if (!Array.isArray(list)) return [];
          return list
            .map((x) => {
              const foundCase = allCases.find(c => String(c.caseNumber) === String(x.caseNumber));
              return buildDailyItemFromCase(foundCase, x.notes, { user: x.user, dateTime: x.dateTime });
            })
            .filter(Boolean);
        };

        setCadCamItems(rehydrateDailyList(cache.daily.cadCamItems));
        setFittingItems(rehydrateDailyList(cache.daily.fittingItems));
        setCeramicItems(rehydrateDailyList(cache.daily.ceramicItems));
      }

      if (Array.isArray(cache.deptSections)) {
        const rehydratedSections = cache.deptSections.map((s) => {
          const items = Array.isArray(s.items) ? s.items
            .map((x) => {
              const foundCase = allCases.find(c => String(c.caseNumber) === String(x.caseNumber));
              return buildDeptItemFromCase(foundCase, x.notes, x.units, { user: x.user, dateTime: x.dateTime });
            })
            .filter(Boolean) : [];
          return {
            technicianName: s.technicianName || "",
            items,
            print: s.print !== false,
            columns: typeof s.columns === "object" && s.columns ? s.columns : { caseNumber: true, doctor: true, patient: true, units: true, dateIn: true, cadCam: true, notes: true, addedBy: true }
          };
        }).filter(s => s.technicianName);

        setDeptSections(rehydratedSections);

        // Restore cached per-technician input boxes (caseNumber/notes) if present.
        if (cache.deptInputsByTechName && typeof cache.deptInputsByTechName === "object") {
          const rebuiltInputs = {};
          rehydratedSections.forEach((s, techIdx) => {
            const input = cache.deptInputsByTechName?.[s.technicianName];
            if (input && typeof input === "object") {
              rebuiltInputs[techIdx] = {
                caseNumber: input.caseNumber || "",
                notes: input.notes || ""
              };
            }
          });
          setSectionInputs(rebuiltInputs);
        }
      }

      if (cache.ui && typeof cache.ui === "object") {
        if (cache.ui.activeReportTab === 0 || cache.ui.activeReportTab === 1) {
          setActiveReportTab(cache.ui.activeReportTab);
        }
        if (typeof cache.ui.newTechName === "string") {
          setNewTechName(cache.ui.newTechName);
        }
      }
    } finally {
      hasHydratedFromCacheRef.current = true;
    }
  }, [allCases, user?._id]);

  // Persist report state locally (minimal primitives only).
  useEffect(() => {
    if (!user?._id) return;
    if (!hasHydratedFromCacheRef.current) return;

    const toDailyCache = (items) => (Array.isArray(items) ? items.map(i => ({
      caseNumber: i.caseNumber,
      notes: i.notes || "",
      user: i.user || "",
      dateTime: i.dateTime || ""
    })) : []);

    const deptInputsByTechName = Array.isArray(deptSections) ? deptSections.reduce((acc, s, techIdx) => {
      if (!s?.technicianName) return acc;
      const input = sectionInputs?.[techIdx];
      if (!input || (input.caseNumber || "") === "" && (input.notes || "") === "") return acc;
      acc[s.technicianName] = { caseNumber: input.caseNumber || "", notes: input.notes || "" };
      return acc;
    }, {}) : {};

    const payload = {
      version: REPORTS_CACHE_VERSION,
      savedAt: Date.now(),
      ui: {
        activeReportTab,
        newTechName
      },
      daily: {
        cadCamTitle,
        fittingTitle,
        ceramicTitle,
        cadCamItems: toDailyCache(cadCamItems),
        fittingItems: toDailyCache(fittingItems),
        ceramicItems: toDailyCache(ceramicItems),
        printSelection,
        printColumns,
      },
      deptSections: Array.isArray(deptSections) ? deptSections.map(s => ({
        technicianName: s.technicianName,
        print: s.print !== false,
        columns: s.columns,
        items: Array.isArray(s.items) ? s.items.map(i => ({
          caseNumber: i.caseNumber,
          units: i.units,
          notes: i.notes || "",
          user: i.user || "",
          dateTime: i.dateTime || ""
        })) : []
      })) : [],
      deptInputsByTechName
    };

    try {
      localStorage.setItem(REPORTS_CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      // If storage quota is exceeded or blocked, we fail silently (app continues without cache).
      console.warn("Failed to cache report data locally.", e);
    }
  }, [
    user?._id,
    activeReportTab,
    newTechName,
    sectionInputs,
    cadCamTitle, fittingTitle, ceramicTitle,
    cadCamItems, fittingItems, ceramicItems,
    printSelection, printColumns,
    deptSections
  ]);

  const removeDeptItem = (techIdx, itemIdx) => {
    setDeptSections(prev => {
      const updated = [...prev];
      updated[techIdx].items = updated[techIdx].items.filter((_, i) => i !== itemIdx);
      if (updated[techIdx].items.length === 0) {
        return updated.filter((_, i) => i !== techIdx);
      }
      return updated;
    });
  };

  const updateDeptItem = (techIdx, itemIdx, field, value) => {
    setDeptSections(prev => {
      const updated = [...prev];
      updated[techIdx].items[itemIdx][field] = value;
      return updated;
    });
  };

  const toggleDeptPrint = (techIdx) => {
    setDeptSections(prev => {
      const updated = [...prev];
      const section = { ...updated[techIdx] };
      section.print = !section.print;
      updated[techIdx] = section;
      return updated;
    });
  };

  const toggleDeptColumn = (techIdx, col) => {
    setDeptSections(prev => {
      const updated = [...prev];
      const section = { ...updated[techIdx] };
      section.columns = {
        ...section.columns,
        [col]: !section.columns[col]
      };
      updated[techIdx] = section;
      return updated;
    });
  };

  const deptColumnLabels = {
    caseNumber: '#',
    doctor: 'Doctor',
    patient: 'Patient',
    units: 'Units',
    dateIn: 'Date In',
    cadCam: 'CadCam',
    notes: 'Notes',
    addedBy: 'Added By',
  };

  const renderSection = (title, setTitle, items, setItems, newItem, setNewItem, printKey) => (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          {(user.roles[0] === _global.allRoles.Reception || user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.super_admin) ? (
            <>
              <input
                type="checkbox"
                className="form-check-input me-3 mt-0"
                style={{ width: "20px", height: "20px" }}
                checked={printSelection[printKey]}
                onChange={(e) => setPrintSelection({ ...printSelection, [printKey]: e.target.checked })}
                title="Include in Print"
              />
              <input
                type="text"
                className="form-control form-control-sm bg-primary text-white border-0 fw-bold fs-5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "auto", minWidth: "150px" }}
              />
              <i className="fas fa-edit ms-2"></i>
            </>
          ) : (
            <span className="fw-bold fs-5">{title}</span>
          )}
        </div>
        <span className="badge bg-light text-primary">{items.length} Cases</span>
      </div>
      {(user.roles[0] === _global.allRoles.Reception || user.roles[0] === _global.allRoles.admin || user.roles[0] === _global.allRoles.super_admin) && (
        <div className="bg-light p-2 border-bottom text-muted small">
          <strong className="me-2">Print Columns:</strong>
          {Object.keys(printColumnLabels).map(col => (
            <label key={col} className="form-check-label me-3" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                className="form-check-input me-1"
                checked={printColumns[printKey][col]}
                onChange={(e) => setPrintColumns({
                  ...printColumns,
                  [printKey]: { ...printColumns[printKey], [col]: e.target.checked }
                })}
              />
              {printColumnLabels[col]}
            </label>
          ))}
        </div>
      )}
      <div className="card-body">
        <div className="table-responsive mb-3">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Doctor</th>
                <th>Patient</th>
                <th>#units</th>
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(printKey, 'cadCam')}>
                  CadCam {sortConfig[printKey]?.key === 'cadCam' ? (sortConfig[printKey].asc ? '▲' : '▼') : ''}
                </th>
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(printKey, 'ceramic')}>
                  Ceramic {sortConfig[printKey]?.key === 'ceramic' ? (sortConfig[printKey].asc ? '▲' : '▼') : ''}
                </th>
                <th>dateIn</th>
                <th>notes</th>
                <th>Added By</th>
                <th>Date & Time</th>
                {user.roles[0] === _global.allRoles.Reception && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {getSortedItems(items, printKey).length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-3">No cases added to this section yet.</td>
                </tr>
              ) : (
                getSortedItems(items, printKey).map((item, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">{item.caseNumber}</td>
                    <td>{item.doctorName}</td>
                    <td>{item.patientName}</td>
                    <td>{item.unitsMaterials}</td>
                    <td>{(() => { const a = getCadCamAndCeramicAssignments(item.caseData); return a.cadCam || '-'; })()}</td>
                    <td>{(() => { const a = getCadCamAndCeramicAssignments(item.caseData); return a.ceramic || '-'; })()}</td>
                    <td>{item.dateIn}</td>
                    <td>
                      {editingNote?.section === printKey && editingNote?.idx === idx ? (
                        <div className="d-flex gap-1">
                          <input
                            className="form-control form-control-sm"
                            value={editingNote.text}
                            autoFocus
                            onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
                            onKeyPress={(e) => { if (e.key === 'Enter') saveNote(items, setItems); }}
                          />
                          <button className="btn btn-sm btn-success" onClick={() => saveNote(items, setItems)}>
                            <i className="fas fa-check"></i>
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={() => setEditingNote(null)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : item.notes}
                    </td>
                    <td>{item.user}</td>
                    <td className="small">{item.dateTime}</td>
                    {user.roles[0] === _global.allRoles.Reception && (
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            title="Edit Notes"
                            onClick={() => setEditingNote({ section: printKey, idx, text: item.notes || '' })}
                          >
                            <i className="fas fa-pen"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" title="Remove" onClick={() => removeItem(idx, items, setItems)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {user.roles[0] === _global.allRoles.Reception && <div className="row g-2 align-items-end bg-light p-3 rounded border">
          <div className="col-md-2">
            <label className="form-label small fw-bold">Case ID</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 64a7..."
              value={newItem.caseNumber}
              onChange={(e) => setNewItem({ ...newItem, caseNumber: e.target.value })}
            />
          </div>
          <div className="col-md-8">
            <label className="form-label small fw-bold">Notes</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter details..."
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem(title, newItem, setNewItem, items, setItems);
                }
              }}
            />
          </div>
          <div className="col-md-2 d-grid">
            <button
              className="btn btn-primary"
              disabled={!newItem.caseNumber}
              onClick={() => handleAddItem(title, newItem, setNewItem, items, setItems)}
            >
              <i className="fas fa-plus me-1"></i> Add
            </button>
          </div>
        </div>}
      </div>
    </div>
  );

  return (
    <div className="container-fluid pb-5" style={{ marginTop: "7rem" }}>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h2 className="text-primary m-0">
          <i className="fas fa-file-invoice me-2"></i>
          {activeReportTab === 0 ? "Daily Department Reports" : "Technicians Reports"}
        </h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-success btn-lg shadow-sm"
            onClick={activeReportTab === 0 ? handleSaveAndPrint : triggerPrint}
            disabled={activeReportTab === 0
              ? (!printSelection.cadCam && !printSelection.fitting && !printSelection.ceramic)
              : deptSections.length === 0}
          >
            <i className="fas fa-print me-2"></i> Print {activeReportTab === 0 ? "Selected" : "Report"}
          </button>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeReportTab === 0 ? 'active' : ''}`}
            onClick={() => setActiveReportTab(0)}
          >
            Daily Report
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeReportTab === 1 ? 'active' : ''}`}
            onClick={() => setActiveReportTab(1)}
          >
            Departments Report
          </button>
        </li>
      </ul>

      {activeReportTab === 0 ? (
        <div className="row">
          <div className="col-12">
            {renderSection(cadCamTitle, setCadCamTitle, cadCamItems, setCadCamItems, newCadCam, setNewCadCam, 'cadCam')}
            {renderSection(fittingTitle, setFittingTitle, fittingItems, setFittingItems, newFitting, setNewFitting, 'fitting')}
            {renderSection(ceramicTitle, setCeramicTitle, ceramicItems, setCeramicItems, newCeramic, setNewCeramic, 'ceramic')}
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            {/* Entry Form */}
            <div className="card shadow-sm mb-4 border-primary">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Select Technician to Start Report</h5>
              </div>
              <div className="card-body bg-light">
                <div className="row g-2 align-items-end">
                  <div className="col-md-10">
                    <label className="form-label small fw-bold">Technician Name</label>
                    <select
                      className="form-select"
                      value={newTechName}
                      onChange={(e) => setNewTechName(e.target.value)}
                    >
                      <option value="">Choose a Technician...</option>
                      {technicians.map(t => (
                        <option key={t._id} value={`${t.firstName} ${t.lastName}`}>
                          {t.firstName} {t.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2 d-grid">
                    <button className="btn btn-primary" onClick={addTechSection}>
                      <i className="fas fa-plus me-1"></i> Add Tech
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Technician Sections */}
            {deptSections.length === 0 ? (
              <div className="text-center py-5 bg-white border rounded">
                <i className="fas fa-users-cog text-muted mb-3" style={{ fontSize: "3rem" }}></i>
                <h5 className="text-muted">No Technician Reports started yet</h5>
                <p className="text-muted small">Select a technician above to create their daily report section.</p>
              </div>
            ) : (
              deptSections.map((section, techIdx) => (
                <div key={techIdx} className="card mb-4 shadow-sm border-dark">
                  <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <input
                        type="checkbox"
                        className="form-check-input me-3"
                        checked={section.print}
                        onChange={() => toggleDeptPrint(techIdx)}
                        style={{ width: "20px", height: "20px" }}
                      />
                      <h5 className="mb-0">Reports for: <span className="text-info">{section.technicianName}</span></h5>
                    </div>
                    <span className="badge bg-primary px-3">{section.items.length} Cases Added</span>
                  </div>
                  <div className="bg-light p-2 border-bottom text-muted small">
                    <strong className="me-2 ms-2">Print Columns:</strong>
                    {Object.keys(deptColumnLabels).map(col => (
                      <label key={col} className="form-check-label me-3" style={{ cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          className="form-check-input me-1"
                          checked={section.columns?.[col]}
                          onChange={() => toggleDeptColumn(techIdx, col)}
                        />
                        {deptColumnLabels[col]}
                      </label>
                    ))}
                  </div>
                  <div className="card-body">
                    {/* Inner Entry Form for this specific tech */}
                    <div className="row g-2 mb-4 p-3 bg-light border rounded shadow-sm align-items-end">
                      <div className="col-md-2">
                        <label className="form-label small fw-bold">Case Num</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Case #"
                          value={sectionInputs[techIdx]?.caseNumber || ""}
                          onChange={(e) => setSectionInputs({
                            ...sectionInputs,
                            [techIdx]: { ...(sectionInputs[techIdx] || {}), caseNumber: e.target.value }
                          })}
                        />
                      </div>
                      <div className="col-md-8">
                        <label className="form-label small fw-bold">Notes for this Case</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Describe work done..."
                          value={sectionInputs[techIdx]?.notes || ""}
                          onChange={(e) => setSectionInputs({
                            ...sectionInputs,
                            [techIdx]: { ...(sectionInputs[techIdx] || {}), notes: e.target.value }
                          })}
                          onKeyPress={(e) => { if (e.key === 'Enter') addCaseToSection(techIdx); }}
                        />
                      </div>
                      <div className="col-md-2 d-grid">
                        <button className="btn btn-dark" onClick={() => addCaseToSection(techIdx)}>
                          <i className="fas fa-plus me-1"></i> Add Case
                        </button>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-bordered table-hover align-middle text-center">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "8%" }}>#Case</th>
                            <th style={{ width: "15%" }}>Doctor</th>
                            <th style={{ width: "15%" }}>Patient</th>
                            <th style={{ width: "10%" }}>Units</th>
                            <th style={{ width: "10%" }}>CadCam</th>
                            <th style={{ width: "10%" }}>Date In</th>
                            <th style={{ width: "30%" }}>Notes</th>
                            <th style={{ width: "12%" }}>Added By</th>
                            <th style={{ width: "5%" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.items.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="text-center text-muted py-3 italic">Use the form above to add cases for {section.technicianName}</td>
                            </tr>
                          ) : (
                            section.items.map((item, itemIdx) => {
                              // consol.log("getCadCamAndCeramicAssignments()", item.caseData);

                              const asgn = getCadCamAndCeramicAssignments(item.caseData);
                              return (
                                <tr key={itemIdx}>
                                  <td className="fw-bold">{item.caseNumber}</td>
                                  <td>{item.doctorName}</td>
                                  <td>{item.patientName}</td>
                                  <td>
                                    <input
                                      type="text"
                                      className="form-control form-control-sm text-center"
                                      value={item.units}
                                      onChange={(e) => updateDeptItem(techIdx, itemIdx, 'units', e.target.value)}
                                    />
                                  </td>
                                  <td>{asgn.cadCam || '-'}</td>
                                  <td>{item.dateIn}</td>
                                  <td>
                                    <textarea
                                      className="form-control form-control-sm"
                                      rows="1"
                                      value={item.notes}
                                      onChange={(e) => updateDeptItem(techIdx, itemIdx, 'notes', e.target.value)}
                                      style={{ minHeight: "31px" }}
                                    ></textarea>
                                  </td>
                                  <td className="small text-muted">{item.user}<br />{item.dateTime}</td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => removeDeptItem(techIdx, itemIdx)}
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hidden Print Area */}
      <div style={{ display: "none" }}>
        <div ref={printRef} style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>

          <div style={{ borderBottom: "2px solid #333", paddingBottom: "10px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>Department Activity Report</h2>
              <p style={{ margin: "0", fontSize: "14px", color: "#555" }}>
                <strong>Generated By:</strong> {user.firstName} {user.lastName}
              </p>
            </div>
            <div style={{ textAlign: "right", fontSize: "14px", color: "#555" }}>
              <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Time:</strong> {new Date().toLocaleTimeString()}
            </div>
          </div>

          {activeReportTab === 0 ? (
            [{ key: 'cadCam', title: cadCamTitle, items: cadCamItems },
            { key: 'fitting', title: fittingTitle, items: fittingItems },
            { key: 'ceramic', title: ceramicTitle, items: ceramicItems }].map(section => (
              printSelection[section.key] && (
                <div key={section.key} style={{ marginBottom: "40px" }}>
                  <h3 style={{ color: "#0d6efd", borderBottom: "1px solid #ccc", paddingBottom: "5px", marginBottom: "15px" }}>{section.title}</h3>
                  {section.items.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8f9fa" }}>
                          {printColumns[section.key].caseNumber && <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left" }}>#</th>}
                          {printColumns[section.key].doctor && <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left" }}>Doctor</th>}
                          {printColumns[section.key].patient && <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left" }}>Patient</th>}
                          {printColumns[section.key].units && <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left" }}>Units & Mat.</th>}
                          {printColumns[section.key].cadCamCol && <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left" }}>CadCam</th>}
                          {printColumns[section.key].ceramicCol && <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left" }}>Ceramic</th>}
                          {printColumns[section.key].dateIn && <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left" }}>Date In</th>}
                          {printColumns[section.key].notes && <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left" }}>Notes</th>}
                          {printColumns[section.key].addedBy && <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left" }}>Added By</th>}
                          {printColumns[section.key].dateTime && <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left" }}>Time</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item, idx) => {
                          const asgn = getCadCamAndCeramicAssignments(item.caseData);
                          return (
                            <tr key={idx}>
                              {printColumns[section.key].caseNumber && <td style={{ border: "1px solid #dee2e6", padding: "6px", fontWeight: "bold" }}>{item.caseNumber}</td>}
                              {printColumns[section.key].doctor && <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{item.doctorName}</td>}
                              {printColumns[section.key].patient && <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{item.patientName}</td>}
                              {printColumns[section.key].units && <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{item.unitsMaterials}</td>}
                              {printColumns[section.key].cadCamCol && <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{asgn.cadCam || '-'}</td>}
                              {printColumns[section.key].ceramicCol && <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{asgn.ceramic || '-'}</td>}
                              {printColumns[section.key].dateIn && <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{item.dateIn}</td>}
                              {printColumns[section.key].notes && <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{item.notes}</td>}
                              {printColumns[section.key].addedBy && <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{item.user}</td>}
                              {printColumns[section.key].dateTime && <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{item.dateTime}</td>}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ fontStyle: "italic", color: "#777", fontSize: "14px" }}>No entries for this section.</p>
                  )}
                </div>
              )
            ))
          ) : (
            <div>
              {/* <h2 style={{ color: "#0d6efd", borderBottom: "2px solid #ccc", paddingBottom: "10px", marginBottom: "30px", textAlign: "center" }}>
                Daily Detailed Report
              </h2> */}
              {deptSections.map((section, idx) => (
                section.print && (
                  <div key={idx} style={{ marginBottom: "40px" }}>
                    <h3 style={{ color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "5px", marginBottom: "15px" }}>
                      <span style={{ color: "#0d6efd" }}>{section.technicianName}</span>
                    </h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8f9fa" }}>
                          {section.columns?.caseNumber && <th style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "left", width: "10%" }}>#Case</th>}
                          {section.columns?.doctor && <th style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "left", width: "15%" }}>Doctor</th>}
                          {section.columns?.patient && <th style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "left", width: "15%" }}>Patient</th>}
                          {section.columns?.units && <th style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "center", width: "10%" }}>Units</th>}
                          {section.columns?.dateIn && <th style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "left", width: "10%" }}>Date In</th>}
                          {section.columns?.cadCam && <th style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "left", width: "10%" }}>CadCam</th>}
                          {section.columns?.notes && <th style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "left", width: "30%" }}>Notes</th>}
                          {section.columns?.addedBy && <th style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "left", width: "10%" }}>Time</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item, itemIdx) => (
                          <tr key={itemIdx}>
                            {section.columns?.caseNumber && <td style={{ border: "1px solid #dee2e6", padding: "8px", fontWeight: "bold" }}>{item.caseNumber}</td>}
                            {section.columns?.doctor && <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{item.doctorName}</td>}
                            {section.columns?.patient && <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{item.patientName}</td>}
                            {section.columns?.units && <td style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "center" }}>{item.units}</td>}
                            {section.columns?.dateIn && <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{item.dateIn}</td>}
                            {section.columns?.cadCam && <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{getCadCamAndCeramicAssignments(item.caseData).cadCam || '-'}</td>}
                            {section.columns?.notes && <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{item.notes}</td>}
                            {section.columns?.addedBy && <td style={{ border: "1px solid #dee2e6", padding: "8px", fontSize: "9px" }}>{item.dateTime}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
