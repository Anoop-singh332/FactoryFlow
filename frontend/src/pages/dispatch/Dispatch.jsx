import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Plus,
  Trash2,
  Pencil,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Printer,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { items } from "../../data/items";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const emptyItem = {
  itemName: "",
  quantity: "",
  weight: "",
  numberOfBags: "",
};

const initialForm = {
  inspectionReport: "",
  items: [{ ...emptyItem }],
  vendorName: "",
  invoiceNumber: "",
  eWayBillNumber: "",
  deliveryChallan: "",
};

function Dispatch() {
  const [form, setForm] = useState(initialForm);

  const [dispatches, setDispatches] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [fetching, setFetching] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  // =========================
  // GET TOKEN
  // =========================

  const getToken = () => {
    return localStorage.getItem("factoryflow_token");
  };

  // =========================
  // FETCH DISPATCHES
  // =========================

  const fetchDispatches = async () => {
    try {
      setFetching(true);
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/dispatch`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch dispatch records.");
      }

      setDispatches(data.data || []);
    } catch (err) {
      console.error("Fetch Dispatches Error:", err);

      setError(err.message || "Unable to load dispatch records.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // =========================
  // ITEM CHANGE
  // =========================

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const updatedItems = [...prev.items];

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      return {
        ...prev,
        items: updatedItems,
      };
    });

    setSuccess("");
    setError("");
  };

  // =========================
  // ADD ITEM
  // =========================

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...emptyItem,
        },
      ],
    }));
  };

  // =========================
  // REMOVE ITEM
  // =========================

  const removeItem = (index) => {
    if (form.items.length === 1) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm({
      ...initialForm,
      items: [{ ...emptyItem }],
    });

    setEditingId(null);
    setSuccess("");
    setError("");
  };

  // =========================
  // NEW DISPATCH
  // =========================

  const handleNewDispatch = () => {
    resetForm();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // CALCULATE TOTALS
  // =========================

  const getTotalWeight = () => {
    return form.items.reduce(
      (total, item) => total + Number(item.weight || 0),
      0,
    );
  };

  const getTotalBags = () => {
    return form.items.reduce(
      (total, item) => total + Number(item.numberOfBags || 0),
      0,
    );
  };

  // =========================
  // VALIDATION
  // =========================

  const validateForm = () => {
    if (!form.inspectionReport.trim()) {
      return "Inspection report number is required.";
    }

    if (!form.vendorName.trim()) {
      return "Vendor name is required.";
    }

    if (!form.invoiceNumber.trim()) {
      return "Invoice number is required.";
    }

    if (!form.deliveryChallan.trim()) {
      return "Delivery challan is required.";
    }

    if (!form.items.length) {
      return "At least one item is required.";
    }

    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];

      if (!item.itemName) {
        return `Please select item ${i + 1}.`;
      }

      if (!item.quantity || Number(item.quantity) < 1) {
        return `Please enter a valid quantity for item ${i + 1}.`;
      }

      if (item.weight === "" || Number(item.weight) <= 0) {
        return `Please enter a valid weight for item ${i + 1}.`;
      }

      if (item.numberOfBags === "" || Number(item.numberOfBags) < 0) {
        return `Please enter a valid number of bags for item ${i + 1}.`;
      }
    }

    return null;
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      const totalWeight = getTotalWeight();

      const totalBags = getTotalBags();

      const payload = {
        inspectionReport: form.inspectionReport.trim(),

        items: form.items.map((item) => ({
          itemName: item.itemName,
          quantity: Number(item.quantity),
          weight: Number(item.weight),
          numberOfBags: Number(item.numberOfBags),
        })),

        vendorName: form.vendorName.trim(),

        invoiceNumber: form.invoiceNumber.trim(),

        eWayBillNumber: form.eWayBillNumber.trim(),

        weight: totalWeight,

        numberOfBags: totalBags,

        deliveryChallan: form.deliveryChallan.trim(),
      };

      const url = editingId
        ? `${API_URL}/dispatch/${editingId}`
        : `${API_URL}/dispatch`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save dispatch.");
      }

      setSuccess(
        editingId
          ? "Dispatch updated successfully."
          : "Dispatch created successfully.",
      );

      resetForm();

      await fetchDispatches();
    } catch (err) {
      console.error("Save Dispatch Error:", err);

      setError(err.message || "Unable to save dispatch.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (dispatch) => {
    setEditingId(dispatch._id);

    setForm({
      inspectionReport: dispatch.inspectionReport || "",

      items:
        dispatch.items?.length > 0
          ? dispatch.items.map((item) => ({
              itemName: item.itemName || "",

              quantity: item.quantity || "",

              weight: item.weight ?? "",

              numberOfBags: item.numberOfBags ?? "",
            }))
          : [
              {
                ...emptyItem,
              },
            ],

      vendorName: dispatch.vendorName || "",

      invoiceNumber: dispatch.invoiceNumber || "",

      eWayBillNumber: dispatch.eWayBillNumber || "",

      deliveryChallan: dispatch.deliveryChallan || "",
    });

    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this dispatch?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await fetch(`${API_URL}/dispatch/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete dispatch.");
      }

      setSuccess("Dispatch deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await fetchDispatches();
    } catch (err) {
      console.error("Delete Dispatch Error:", err);

      setError(err.message || "Unable to delete dispatch.");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // REAL PRINT
  // =========================

  const handlePrint = (dispatch) => {
    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) {
      alert("Please allow pop-ups in your browser to print the dispatch.");
      return;
    }

    const escapeHtml = (value) => {
      if (value === null || value === undefined) {
        return "-";
      }

      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const printDate = dispatch.createdAt
      ? new Date(dispatch.createdAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

    const itemRows =
      dispatch.items
        ?.map(
          (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(item.itemName)}</td>
              <td>${escapeHtml(item.quantity)}</td>
              <td>${escapeHtml(item.weight)} Kg</td>
              <td>${escapeHtml(item.numberOfBags)}</td>
            </tr>
          `,
        )
        .join("") ||
      `
        <tr>
          <td colspan="5">
            No items
          </td>
        </tr>
      `;

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>

          <meta charset="UTF-8" />

          <title>
            Dispatch - ${escapeHtml(dispatch.invoiceNumber || "Record")}
          </title>

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 30px;
              background: #ffffff;
              color: #111111;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
            }

            .page {
              max-width: 900px;
              margin: 0 auto;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #84cc16;
              padding-bottom: 18px;
              margin-bottom: 22px;
            }

            .company-name {
              font-size: 28px;
              font-weight: 800;
              margin: 0;
            }

            .document-title {
              font-size: 18px;
              font-weight: 700;
              margin-top: 5px;
            }

            .print-date {
              text-align: right;
              font-size: 11px;
              color: #666666;
            }

            .section {
              margin-top: 22px;
            }

            .section-title {
              font-size: 14px;
              font-weight: 800;
              padding-bottom: 8px;
              margin-bottom: 12px;
              border-bottom: 1px solid #d1d5db;
            }

            .details {
              display: grid;
              grid-template-columns:
                1fr 1fr;
              gap: 10px;
            }

            .detail {
              border: 1px solid #d1d5db;
              border-radius: 6px;
              padding: 10px;
              min-height: 58px;
            }

            .label {
              font-size: 9px;
              color: #6b7280;
              text-transform: uppercase;
              font-weight: 700;
              margin-bottom: 5px;
            }

            .value {
              font-size: 13px;
              font-weight: 600;
              word-break: break-word;
            }

            table {
              width: 100%;
              border-collapse:
                collapse;
            }

            th {
              background: #f3f4f6;
              font-size: 11px;
              font-weight: 800;
              text-align: left;
            }

            th,
            td {
              border: 1px solid #d1d5db;
              padding: 9px;
              font-size: 11px;
            }

            .footer {
              display: flex;
              justify-content: space-between;
              margin-top: 40px;
              padding-top: 12px;
              border-top: 1px solid #d1d5db;
              color: #6b7280;
              font-size: 10px;
            }

            @media print {

              @page {
                size: A4;
                margin: 12mm;
              }

              body {
                padding: 0;
              }

              .page {
                max-width: none;
              }

            }

          </style>

        </head>

        <body>

          <div class="page">

            <div class="header">

              <div>
                <h1 class="company-name">
                  FactoryFlow
                </h1>

                <div class="document-title">
                  Dispatch Record
                </div>
              </div>

              <div class="print-date">
                <strong>
                  Dispatch Date
                </strong>
                <br />

                ${escapeHtml(printDate)}
              </div>

            </div>

            <div class="section">

              <div class="section-title">
                Dispatch Information
              </div>

              <div class="details">

                <div class="detail">
                  <div class="label">
                    Quality Inspection Report
                  </div>

                  <div class="value">
                    ${escapeHtml(dispatch.inspectionReport)}
                  </div>
                </div>

                <div class="detail">
                  <div class="label">
                    Vendor Name
                  </div>

                  <div class="value">
                    ${escapeHtml(dispatch.vendorName)}
                  </div>
                </div>

                <div class="detail">
                  <div class="label">
                    Invoice Number
                  </div>

                  <div class="value">
                    ${escapeHtml(dispatch.invoiceNumber)}
                  </div>
                </div>

                <div class="detail">
                  <div class="label">
                    E-Way Bill Number
                  </div>

                  <div class="value">
                    ${escapeHtml(dispatch.eWayBillNumber || "-")}
                  </div>
                </div>

                <div class="detail">
                  <div class="label">
                    Delivery Challan
                  </div>

                  <div class="value">
                    ${escapeHtml(dispatch.deliveryChallan)}
                  </div>
                </div>

                <div class="detail">
                  <div class="label">
                    Total Weight
                  </div>

                  <div class="value">
                    ${escapeHtml(dispatch.weight)}
                    Kg
                  </div>
                </div>

                <div class="detail">
                  <div class="label">
                    Total Number of Bags
                  </div>

                  <div class="value">
                    ${escapeHtml(dispatch.numberOfBags)}
                  </div>
                </div>

              </div>

            </div>

            <div class="section">

              <div class="section-title">
                Dispatch Items
              </div>

              <table>

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Weight</th>
                    <th>Number of Bags</th>
                  </tr>
                </thead>

                <tbody>
                  ${itemRows}
                </tbody>

              </table>

            </div>

            <div class="footer">

              <span>
                FactoryFlow
              </span>

              <span>
                Printed on:
                ${escapeHtml(new Date().toLocaleString("en-IN"))}
              </span>

            </div>

          </div>

          <script>

            window.onload = function () {
              window.focus();
              window.print();
            };

          </script>

        </body>

      </html>
    `);

    printWindow.document.close();
  };

  // =========================
  // SEARCH
  // =========================

  const filteredDispatches = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return dispatches;
    }

    return dispatches.filter((dispatch) => {
      const itemsText =
        dispatch.items?.map((item) => item.itemName).join(" ") || "";

      return (
        dispatch.inspectionReport?.toLowerCase().includes(searchValue) ||
        dispatch.vendorName?.toLowerCase().includes(searchValue) ||
        dispatch.invoiceNumber?.toLowerCase().includes(searchValue) ||
        itemsText.toLowerCase().includes(searchValue)
      );
    });
  }, [dispatches, search]);

  // =========================
  // STATISTICS
  // =========================

  const totalDispatches = dispatches.length;

  const totalWeight = dispatches.reduce(
    (total, dispatch) => total + Number(dispatch.weight || 0),
    0,
  );

  const totalBags = dispatches.reduce(
    (total, dispatch) => total + Number(dispatch.numberOfBags || 0),
    0,
  );

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* =========================
          PAGE HEADER
      ========================= */}

      <PageHeader
        eyebrow="Dispatch Management"
        title="Dispatch"
        description="Manage quality-approved materials and maintain dispatch records."
      />

      {/* =========================
          ALERTS
      ========================= */}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-lime-200 bg-lime-50 px-3 py-2 text-xs font-medium text-lime-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* =========================
          STATS
      ========================= */}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Total Dispatches
            </p>

            <Truck className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <p className="mt-1 text-xl font-bold text-black">{totalDispatches}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Total Weight
          </p>

          <p className="mt-1 text-xl font-bold text-black">{totalWeight} Kg</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Total Bags
          </p>

          <p className="mt-1 text-xl font-bold text-black">{totalBags}</p>
        </div>
      </div>

      {/* =========================
          FORM
      ========================= */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4"
      >
        {/* FORM HEADER */}

        <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-bold text-black">
              {editingId ? "Edit Dispatch" : "Dispatch Details"}
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-slate-500">
              Record the materials being dispatched.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-[10px] font-semibold text-slate-500 transition hover:text-black"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* =========================
            BASIC DETAILS
        ========================= */}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Quality Inspection Report"
            name="inspectionReport"
            value={form.inspectionReport}
            onChange={handleChange}
            placeholder="QIR-2026-001"
            required
          />

          <Input
            label="Vendor Name"
            name="vendorName"
            value={form.vendorName}
            onChange={handleChange}
            placeholder="Enter vendor name"
            required
          />

          <Input
            label="Invoice Number"
            name="invoiceNumber"
            value={form.invoiceNumber}
            onChange={handleChange}
            placeholder="INV-2026-001"
            required
          />

          <Input
            label="E-Way Bill Number"
            name="eWayBillNumber"
            value={form.eWayBillNumber}
            onChange={handleChange}
            placeholder="EWB-123456789"
          />
        </div>

        {/* =========================
            DISPATCH ITEMS
        ========================= */}

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-black">Dispatch Items</p>

              <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                Add item, quantity, weight and number of bags.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 rounded-lg border border-lime-200 bg-lime-50 px-2.5 py-1.5 text-[10px] font-bold text-lime-700 transition hover:border-lime-300 hover:bg-lime-100"
            >
              <Plus className="h-3 w-3" />
              Add Item
            </button>
          </div>

          {/* TABLE HEADER */}

          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 rounded-t-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500 lg:grid">
            <span>Item</span>

            <span>Quantity</span>

            <span>Weight (Kg)</span>

            <span>No. of Bags</span>

            <span>Action</span>
          </div>

          {/* ITEM ROWS */}

          <div className="space-y-2 lg:space-y-0">
            {form.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end lg:rounded-none lg:border-t-0"
              >
                {/* ITEM */}

                <div>
                  <label className="mb-1 block text-[9px] font-semibold text-slate-600 lg:hidden">
                    Item {index + 1}
                  </label>

                  <Select
                    value={item.itemName}
                    onChange={(event) =>
                      handleItemChange(index, "itemName", event.target.value)
                    }
                    options={[
                      {
                        label: "Select item",
                        value: "",
                      },

                      ...items.map((product) => ({
                        label: product.name || product.itemName || product,

                        value: product.name || product.itemName || product,
                      })),
                    ]}
                  />
                </div>

                {/* QUANTITY */}

                <div>
                  <label className="mb-1 block text-[9px] font-semibold text-slate-600 lg:hidden">
                    Quantity
                  </label>

                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                      handleItemChange(index, "quantity", event.target.value)
                    }
                    placeholder="Quantity"
                  />
                </div>

                {/* WEIGHT */}

                <div>
                  <label className="mb-1 block text-[9px] font-semibold text-slate-600 lg:hidden">
                    Weight (Kg)
                  </label>

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.weight}
                    onChange={(event) =>
                      handleItemChange(index, "weight", event.target.value)
                    }
                    placeholder="Weight"
                  />
                </div>

                {/* BAGS */}

                <div>
                  <label className="mb-1 block text-[9px] font-semibold text-slate-600 lg:hidden">
                    Number of Bags
                  </label>

                  <Input
                    type="number"
                    min="0"
                    value={item.numberOfBags}
                    onChange={(event) =>
                      handleItemChange(
                        index,
                        "numberOfBags",
                        event.target.value,
                      )
                    }
                    placeholder="Bags"
                  />
                </div>

                {/* DELETE */}

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={form.items.length === 1}
                    className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 text-[10px] font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-30 lg:w-9"
                    title="Remove Item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />

                    <span className="lg:hidden">Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* TOTALS */}

          <div className="mt-2 flex flex-wrap justify-end gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase text-slate-400">
                Total Weight
              </p>

              <p className="text-xs font-bold text-black">
                {getTotalWeight()} Kg
              </p>
            </div>

            <div className="text-right">
              <p className="text-[9px] font-bold uppercase text-slate-400">
                Total Bags
              </p>

              <p className="text-xs font-bold text-black">{getTotalBags()}</p>
            </div>
          </div>
        </div>

        {/* =========================
            DELIVERY CHALLAN
        ========================= */}

        <div className="mt-4">
          <Input
            label="Delivery Challan"
            name="deliveryChallan"
            value={form.deliveryChallan}
            onChange={handleChange}
            placeholder="DC-2026-001"
            required
          />
        </div>

        {/* =========================
            FORM ACTIONS
        ========================= */}

        <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={resetForm}>
            Reset
          </Button>

          {/* PRINT BUTTON */}

          <button
            type="button"
            onClick={() => {
              const validationError = validateForm();

              if (validationError) {
                setError(validationError);
                return;
              }

              const previewDispatch = {
                ...form,

                weight: getTotalWeight(),

                numberOfBags: getTotalBags(),

                createdAt: new Date().toISOString(),
              };

              handlePrint(previewDispatch);
            }}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>

          {/* SAVE */}

          <Button type="submit" disabled={loading}>
            {loading
              ? editingId
                ? "Updating..."
                : "Saving..."
              : editingId
                ? "Update Dispatch"
                : "Save Dispatch"}
          </Button>
        </div>
      </form>

      {/* =========================
          HISTORY HEADER
      ========================= */}

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-lime-600">
            Dispatch Records
          </p>

          <h2 className="mt-1 text-lg font-bold text-black">
            Dispatch History
          </h2>

          <p className="mt-0.5 text-[10px] font-medium text-slate-500">
            Review previously recorded dispatches.
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search dispatches..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-[10px] font-medium text-black outline-none placeholder:text-slate-400 transition focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
            />
          </div>

          <button
            type="button"
            onClick={fetchDispatches}
            disabled={fetching}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-black disabled:opacity-40"
          >
            <RefreshCw
              className={`h-3 w-3 ${fetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* =========================
          HISTORY TABLE
      ========================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {fetching && dispatches.length === 0 ? (
          <div className="flex min-h-36 items-center justify-center text-xs font-medium text-slate-500">
            Loading dispatch records...
          </div>
        ) : filteredDispatches.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center px-5 text-center">
            <Truck className="h-7 w-7 text-slate-300" />

            <p className="mt-2 text-xs font-semibold text-slate-600">
              No dispatch records found.
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
              Create your first dispatch using the form above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2.5 font-bold">Inspection</th>

                  <th className="px-3 py-2.5 font-bold">Vendor</th>

                  <th className="px-3 py-2.5 font-bold">Items</th>

                  <th className="px-3 py-2.5 font-bold">Invoice</th>

                  <th className="px-3 py-2.5 font-bold">E-Way Bill</th>

                  <th className="px-3 py-2.5 font-bold">Weight</th>

                  <th className="px-3 py-2.5 font-bold">Bags</th>

                  <th className="px-3 py-2.5 font-bold">Date</th>

                  <th className="px-3 py-2.5 text-right font-bold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDispatches.map((dispatch) => (
                  <tr
                    key={dispatch._id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-3 py-2.5">
                      <div>
                        <p className="text-[10px] font-semibold text-black">
                          {dispatch.inspectionReport}
                        </p>

                        <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                          {dispatch.deliveryChallan}
                        </p>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-[10px] font-medium text-slate-600">
                      {dispatch.vendorName}
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="space-y-0.5">
                        {dispatch.items?.map((item, index) => (
                          <div key={item._id || index} className="text-[10px]">
                            <span className="font-medium text-slate-600">
                              {item.itemName}
                            </span>

                            <span className="mx-1 text-slate-300">×</span>

                            <span className="font-semibold text-slate-500">
                              {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-[10px] font-medium text-slate-500">
                      {dispatch.invoiceNumber}
                    </td>

                    <td className="px-3 py-2.5 text-[10px] font-medium text-slate-500">
                      {dispatch.eWayBillNumber || "-"}
                    </td>

                    <td className="px-3 py-2.5 text-[10px] font-medium text-slate-500">
                      {dispatch.weight} Kg
                    </td>

                    <td className="px-3 py-2.5 text-[10px] font-medium text-slate-500">
                      {dispatch.numberOfBags}
                    </td>

                    <td className="px-3 py-2.5 text-[10px] font-medium text-slate-500">
                      {formatDate(dispatch.createdAt)}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        {/* PRINT */}

                        <button
                          type="button"
                          onClick={() => handlePrint(dispatch)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700"
                          title="Print Dispatch"
                        >
                          <Printer className="h-3 w-3" />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() => handleEdit(dispatch)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700"
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() => handleDelete(dispatch._id)}
                          disabled={deletingId === dispatch._id}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dispatch;
