import React, { useEffect, useState } from "react";

import {
  Building2,
  Mail,
  Phone,
  FileText,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gstNo: "",
    address: "",
  });

  // =========================
  // TOKEN
  // =========================

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token") || "";

  // =========================
  // FETCH VENDORS
  // =========================

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(`${API_URL}/vendors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch vendors.");
      }

      setVendors(data.data || []);
    } catch (error) {
      console.error("Fetch Vendors Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // =========================
  // INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // RESET
  // =========================

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      gstNo: "",
      address: "",
    });

    setEditingId(null);
  };

  // =========================
  // SAVE / UPDATE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.gstNo.trim() ||
      !form.address.trim()
    ) {
      alert("Please fill all vendor fields.");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const url = editingId
        ? `${API_URL}/vendors/${editingId}`
        : `${API_URL}/vendors`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save vendor.");
      }

      resetForm();

      await fetchVendors();
    } catch (error) {
      console.error("Save Vendor Error:", error);

      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (vendor) => {
    setEditingId(vendor._id);

    setForm({
      name: vendor.name || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      gstNo: vendor.gstNo || "",
      address: vendor.address || "",
    });
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vendor?",
    );

    if (!confirmed) return;

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/vendors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete vendor.");
      }

      await fetchVendors();
    } catch (error) {
      console.error("Delete Vendor Error:", error);

      alert(error.message);
    }
  };

  // =========================
  // INPUT CLASS
  // =========================

  const inputClass =
    "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100";

  // =========================
  // UI
  // =========================

  return (
    <div className="mx-auto flex h-[calc(100vh-85px)] min-h-0 max-w-[1400px] flex-col overflow-hidden px-4 py-2 md:px-6">
      {/* ================= HEADER ================= */}

      <div className="mb-2 flex shrink-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-lime-200 bg-lime-50">
          <Building2 className="h-4 w-4 text-lime-600" />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-black">
            Vendor Management
          </h1>

          <p className="text-[10px] font-medium text-black">
            Manage vendor information and business details.
          </p>
        </div>
      </div>

      {/* ================= ADD VENDOR ================= */}

      <div className="mb-2 shrink-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        {/* FORM HEADER */}

        <div className="mb-2.5 flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div>
            <h2 className="text-sm font-bold text-black">
              {editingId ? "Edit Vendor" : "Add New Vendor"}
            </h2>

            <p className="text-[9px] font-medium text-black">
              Enter the complete vendor information.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-medium text-black transition hover:bg-slate-50"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {/* NAME */}

            <div>
              <label className="mb-1 flex items-center gap-1 text-[9px] font-bold text-black">
                <Building2 className="h-2.5 w-2.5 text-lime-600" />
                Vendor Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter vendor name"
                className={inputClass}
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-1 flex items-center gap-1 text-[9px] font-bold text-black">
                <Mail className="h-2.5 w-2.5 text-lime-600" />
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={inputClass}
              />
            </div>

            {/* PHONE */}

            <div>
              <label className="mb-1 flex items-center gap-1 text-[9px] font-bold text-black">
                <Phone className="h-2.5 w-2.5 text-lime-600" />
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={inputClass}
              />
            </div>

            {/* GST */}

            <div>
              <label className="mb-1 flex items-center gap-1 text-[9px] font-bold text-black">
                <FileText className="h-2.5 w-2.5 text-lime-600" />
                GST No.
              </label>

              <input
                type="text"
                name="gstNo"
                value={form.gstNo}
                onChange={handleChange}
                placeholder="Enter GST number"
                className={`${inputClass} uppercase`}
              />
            </div>

            {/* ADDRESS */}

            <div className="col-span-2">
              <label className="mb-1 flex items-center gap-1 text-[9px] font-bold text-black">
                <MapPin className="h-2.5 w-2.5 text-lime-600" />
                Address
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter complete vendor address"
                rows={1}
                className="h-9 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              />
            </div>
          </div>

          {/* SAVE */}

          <div className="mt-2.5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-lime-500 px-4 text-xs font-bold text-black shadow-sm transition hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editingId ? (
                <Save className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}

              {saving
                ? "Saving..."
                : editingId
                  ? "Update Vendor"
                  : "Save Vendor"}
            </button>
          </div>
        </form>
      </div>

      {/* ================= SAVED VENDORS ================= */}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2.5">
          <div>
            <h2 className="text-sm font-bold text-black">Saved Vendors</h2>

            <p className="text-[9px] font-medium text-black">
              {vendors.length} vendor
              {vendors.length !== 1 ? "s" : ""} registered
            </p>
          </div>

          <div className="flex h-6 min-w-6 items-center justify-center rounded-md bg-lime-50 px-2 text-[10px] font-bold text-black">
            {vendors.length}
          </div>
        </div>

        {/* TABLE */}

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {loading && (
            <div className="py-6 text-center text-xs font-medium text-black">
              Loading vendors...
            </div>
          )}

          {!loading && vendors.length === 0 && (
            <div className="py-8 text-center">
              <Building2 className="mx-auto mb-2 h-6 w-6 text-slate-300" />

              <p className="text-xs font-semibold text-black">
                No vendors found.
              </p>
            </div>
          )}

          {!loading && vendors.length > 0 && (
            <table className="w-full table-fixed border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className="w-[20%] px-4 py-2 text-[8px] font-bold uppercase tracking-wider text-black">
                    Vendor
                  </th>

                  <th className="w-[21%] px-4 py-2 text-[8px] font-bold uppercase tracking-wider text-black">
                    Email
                  </th>

                  <th className="w-[14%] px-4 py-2 text-[8px] font-bold uppercase tracking-wider text-black">
                    Phone
                  </th>

                  <th className="w-[15%] px-4 py-2 text-[8px] font-bold uppercase tracking-wider text-black">
                    GST No.
                  </th>

                  <th className="w-[20%] px-4 py-2 text-[8px] font-bold uppercase tracking-wider text-black">
                    Address
                  </th>

                  <th className="w-[10%] px-4 py-2 text-[8px] font-bold uppercase tracking-wider text-black">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {vendors.map((vendor) => (
                  <tr
                    key={vendor._id}
                    className="h-[45px] border-b border-slate-100 transition hover:bg-lime-50/40"
                  >
                    {/* VENDOR */}

                    <td className="px-4 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-lime-50">
                          <Building2 className="h-3 w-3 text-lime-600" />
                        </div>

                        <span
                          className="truncate text-[11px] font-bold text-black"
                          title={vendor.name}
                        >
                          {vendor.name}
                        </span>
                      </div>
                    </td>

                    {/* EMAIL */}

                    <td className="px-4 py-2">
                      <span
                        className="block truncate text-[10px] font-medium text-black"
                        title={vendor.email}
                      >
                        {vendor.email}
                      </span>
                    </td>

                    {/* PHONE */}

                    <td className="px-4 py-2">
                      <span className="block truncate text-[10px] font-medium text-black">
                        {vendor.phone}
                      </span>
                    </td>

                    {/* GST */}

                    <td className="px-4 py-2">
                      <span
                        className="block truncate text-[10px] font-medium text-black"
                        title={vendor.gstNo}
                      >
                        {vendor.gstNo}
                      </span>
                    </td>

                    {/* ADDRESS */}

                    <td className="px-4 py-2">
                      <span
                        className="block truncate text-[10px] font-medium text-black"
                        title={vendor.address}
                      >
                        {vendor.address}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(vendor)}
                          className="rounded-md border border-slate-200 p-1.5 text-black transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700"
                          title="Edit vendor"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(vendor._id)}
                          className="rounded-md border border-slate-200 p-1.5 text-black transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          title="Delete vendor"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vendors;
