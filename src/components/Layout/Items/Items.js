import { useEffect, useState } from "react";
import axios from "axios";
import * as _global from "../../../config/global";
import { showToastMessage } from "../../../helper/toaster";

const Items = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.roles[0] === _global.allRoles.super_admin || user?.roles[0] === _global.allRoles.admin;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ itemId: "", name: "", value: "", category: "" });
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${_global.BASE_URL}items/all`);
      setItems(res.data);
    } catch (err) {
      showToastMessage("Failed to load items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ itemId: "", name: "", value: "", category: "" });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ itemId: item.itemId, name: item.name, value: item.value, category: item.category || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.itemId.trim() || !formData.name.trim()) {
      showToastMessage("ID and Name are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await axios.put(`${_global.BASE_URL}items/${editingItem._id}`, {
          name: formData.name,
          value: Number(formData.value) || 0,
          category: formData.category,
        });
        showToastMessage("Item updated", "success");
      } else {
        await axios.post(`${_global.BASE_URL}items`, {
          itemId: formData.itemId,
          name: formData.name,
          value: Number(formData.value) || 0,
          category: formData.category,
        });
        showToastMessage("Item added", "success");
      }
      setShowForm(false);
      fetchItems();
    } catch (err) {
      showToastMessage(err?.response?.data?.message || "Error saving item", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await axios.put(`${_global.BASE_URL}items/${item._id}`, { isActive: !item.isActive });
      showToastMessage(`Item ${!item.isActive ? "activated" : "deactivated"}`, "success");
      fetchItems();
    } catch {
      showToastMessage("Error updating item", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${_global.BASE_URL}items/${id}`);
      showToastMessage("Item deleted", "success");
      setDeletingId(null);
      fetchItems();
    } catch {
      showToastMessage("Error deleting item", "error");
    }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.itemId.toLowerCase().includes(search.toLowerCase()) ||
    (i.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content">
      <div className="card">
        <h5 className="card-title d-flex align-items-center justify-content-between">
          <span>
            <i className="fa-solid fa-boxes-stacked me-2"></i>
            Items Management
          </span>
          {isAdmin && (
            <button className="btn btn-sm btn-primary" onClick={openAdd}>
              <i className="fa-solid fa-plus me-1"></i> Add Item
            </button>
          )}
        </h5>
        <div className="card-body">
          {/* Search */}
          <div className="mb-3" style={{ maxWidth: "320px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search by ID, name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="alert alert-info">No items found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Value (Price)</th>
                    <th>Status</th>
                    {isAdmin && <th style={{ width: "160px" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item._id} className={!item.isActive ? "opacity-50" : ""}>
                      <td>
                        <span className="badge bg-secondary">{item.itemId}</span>
                      </td>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.category || <span className="text-muted">—</span>}</td>
                      <td>
                        <span className="text-success fw-semibold">
                          {item.value > 0 ? `$${item.value.toFixed(2)}` : <span className="text-muted">—</span>}
                        </span>
                      </td>
                      <td>
                        {item.isActive
                          ? <span className="badge bg-success">Active</span>
                          : <span className="badge bg-danger">Inactive</span>}
                      </td>
                      {isAdmin && (
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            title="Edit"
                            onClick={() => openEdit(item)}
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            className={`btn btn-sm me-1 ${item.isActive ? "btn-outline-warning" : "btn-outline-success"}`}
                            title={item.isActive ? "Deactivate" : "Activate"}
                            onClick={() => handleToggleActive(item)}
                          >
                            <i className={`fa-solid ${item.isActive ? "fa-eye-slash" : "fa-eye"}`}></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() => setDeletingId(item._id)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.4)" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {editingItem ? "Edit Item" : "Add New Item"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-6">
                    <div className="form-group mb-3">
                      <label className="fw-semibold">Item ID <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. ZRC-001"
                        value={formData.itemId}
                        disabled={!!editingItem}
                        onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                      />
                      {editingItem && <small className="text-muted">ID cannot be changed</small>}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group mb-3">
                      <label className="fw-semibold">Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Zircon Block A1"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group mb-3">
                      <label className="fw-semibold">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Zircon"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group mb-3">
                      <label className="fw-semibold">Value / Price ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      />
                      <small className="text-muted">Shown to accountants only</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-sm btn-light" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : editingItem ? "Update" : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingId && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.4)" }} tabIndex="-1">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Delete Item</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setDeletingId(null)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to <strong>permanently delete</strong> this item?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-sm btn-light" onClick={() => setDeletingId(null)}>Cancel</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(deletingId)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
