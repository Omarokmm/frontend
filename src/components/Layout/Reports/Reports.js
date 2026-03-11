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

  // Cases data
  const [allCases, setAllCases] = useState([]);

  useEffect(() => {
    // Fetch cases for lookup once
    axios.get(`${_global.BASE_URL}cases/cases-by-month`)
      .then((res) => {
        setAllCases(res.data.cases || []);
      })
      .catch((err) => console.error("Error fetching cases", err));
  }, []);

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

    const newItem = {
      caseId: caseId,
      caseNumber: foundCase?.caseNumber || caseId,
      doctorName: foundCase?.dentistObj?.name || "-",
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
        <h2 className="text-primary m-0"><i className="fas fa-file-invoice me-2"></i> Daily Department Reports</h2>
        <button
          className="btn btn-success btn-lg shadow-sm"
          onClick={handleSaveAndPrint}
          disabled={!printSelection.cadCam && !printSelection.fitting && !printSelection.ceramic}
        >
          <i className="fas fa-print me-2"></i> Print Selected
        </button>
      </div>

      <div className="row">
        <div className="col-12">
          {renderSection(cadCamTitle, setCadCamTitle, cadCamItems, setCadCamItems, newCadCam, setNewCadCam, 'cadCam')}
          {renderSection(fittingTitle, setFittingTitle, fittingItems, setFittingItems, newFitting, setNewFitting, 'fitting')}
          {renderSection(ceramicTitle, setCeramicTitle, ceramicItems, setCeramicItems, newCeramic, setNewCeramic, 'ceramic')}
        </div>
      </div>

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

          {[{ key: 'cadCam', title: cadCamTitle, items: cadCamItems },
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
