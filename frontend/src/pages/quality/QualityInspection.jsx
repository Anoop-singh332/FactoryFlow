import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Pencil,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
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
};

const initialForm = {
  inspectionReport: "",
  items: [{ ...emptyItem }],
  vendorName: "",
  qualityResult: "Pending",
  invoiceNumber: "",
  eWayBillNumber: "",
  weight: "",
  numberOfBags: "",
  deliveryChallan: "",
  remarks: "",
};

function QualityInspection() {
  const [form, setForm] = useState(initialForm);

  const [inspections, setInspections] = useState([]);

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
  // FETCH INSPECTIONS
  // =========================

  const fetchInspections = async () => {
    try {
      setFetching(true);
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/quality`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch quality inspections.");
      }

      setInspections(data.data || []);
    } catch (err) {
      console.error("Fetch Quality Inspections Error:", err);

      setError(err.message || "Unable to load quality inspections.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchInspections();
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
  // NEW INSPECTION
  // =========================

  const handleNewInspection = () => {
    resetForm();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

    if (!form.weight) {
      return "Weight is required.";
    }

    if (form.numberOfBags === "") {
      return "Number of bags is required.";
    }

    if (!form.deliveryChallan.trim()) {
      return "Delivery challan is required.";
    }

    if (!form.items.length) {
      return "At least one item is required.";
    }

    for (let i = 0; i < form.items.length; i++) {
      if (!form.items[i].itemName) {
        return `Please select item ${i + 1}.`;
      }

      if (!form.items[i].quantity || Number(form.items[i].quantity) < 1) {
        return `Please enter a valid quantity for item ${i + 1}.`;
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

      const payload = {
        inspectionReport: form.inspectionReport.trim(),

        items: form.items.map((item) => ({
          itemName: item.itemName,
          quantity: Number(item.quantity),
        })),

        vendorName: form.vendorName.trim(),

        qualityResult: form.qualityResult,

        invoiceNumber: form.invoiceNumber.trim(),

        eWayBillNumber: form.eWayBillNumber.trim(),

        weight: Number(form.weight),

        numberOfBags: Number(form.numberOfBags),

        deliveryChallan: form.deliveryChallan.trim(),

        remarks: form.remarks.trim(),
      };

      const url = editingId
        ? `${API_URL}/quality/${editingId}`
        : `${API_URL}/quality`;

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
        throw new Error(data.message || "Failed to save quality inspection.");
      }

      setSuccess(
        editingId
          ? "Quality inspection updated successfully."
          : "Quality inspection created successfully.",
      );

      resetForm();

      await fetchInspections();
    } catch (err) {
      console.error("Save Quality Inspection Error:", err);

      setError(err.message || "Unable to save quality inspection.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (inspection) => {
    setEditingId(inspection._id);

    setForm({
      inspectionReport: inspection.inspectionReport || "",

      items:
        inspection.items?.length > 0
          ? inspection.items.map((item) => ({
              itemName: item.itemName || "",
              quantity: item.quantity || "",
            }))
          : [{ ...emptyItem }],

      vendorName: inspection.vendorName || "",

      qualityResult: inspection.qualityResult || "Pending",

      invoiceNumber: inspection.invoiceNumber || "",

      eWayBillNumber: inspection.eWayBillNumber || "",

      weight: inspection.weight ?? "",

      numberOfBags: inspection.numberOfBags ?? "",

      deliveryChallan: inspection.deliveryChallan || "",

      remarks: inspection.remarks || "",
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
      "Are you sure you want to delete this quality inspection?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await fetch(`${API_URL}/quality/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete quality inspection.");
      }

      setSuccess("Quality inspection deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await fetchInspections();
    } catch (err) {
      console.error("Delete Quality Inspection Error:", err);

      setError(err.message || "Unable to delete quality inspection.");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredInspections = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return inspections;
    }

    return inspections.filter((inspection) => {
      const itemsText =
        inspection.items?.map((item) => item.itemName).join(" ") || "";

      return (
        inspection.inspectionReport?.toLowerCase().includes(searchValue) ||
        inspection.vendorName?.toLowerCase().includes(searchValue) ||
        inspection.invoiceNumber?.toLowerCase().includes(searchValue) ||
        inspection.qualityResult?.toLowerCase().includes(searchValue) ||
        itemsText.toLowerCase().includes(searchValue)
      );
    });
  }, [inspections, search]);

  // =========================
  // STATISTICS
  // =========================

  const totalInspections = inspections.length;

  const passedInspections = inspections.filter(
    (inspection) => inspection.qualityResult === "Passed",
  ).length;

  const failedInspections = inspections.filter(
    (inspection) => inspection.qualityResult === "Failed",
  ).length;

  const pendingInspections = inspections.filter(
    (inspection) => inspection.qualityResult === "Pending",
  ).length;

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

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusClasses = (status) => {
    switch (status) {
      case "Passed":
        return "border-lime-300/20 bg-lime-300/10 text-lime-300";

      case "Failed":
        return "border-red-400/20 bg-red-400/10 text-red-300";

      case "Partially Passed":
        return "border-amber-300/20 bg-amber-300/10 text-amber-300";

      default:
        return "border-white/10 bg-white/5 text-white/50";
    }
  };

  return (
    <div className="space-y-8">
      {/* =========================
          PAGE HEADER
      ========================= */}

      <PageHeader
        eyebrow="Quality Control"
        title="Quality Inspection"
        description="Inspect incoming materials, record quality results, and maintain inspection history."
        action="New Inspection"
        actionIcon={Plus}
        onAction={handleNewInspection}
      />

      {/* =========================
          ALERTS
      ========================= */}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-lime-300/20 bg-lime-300/[0.07] px-4 py-3 text-sm text-lime-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* =========================
          STATS
      ========================= */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-white/35">
              Total Inspections
            </p>

            <ClipboardCheck className="h-4 w-4 text-white/30" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {totalInspections}
          </p>
        </div>

        <div className="rounded-2xl border border-lime-300/10 bg-lime-300/[0.025] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-white/35">
              Passed
            </p>

            <CheckCircle2 className="h-4 w-4 text-lime-300/60" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-lime-300">
            {passedInspections}
          </p>
        </div>

        <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.025] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-white/35">
              Failed
            </p>

            <XCircle className="h-4 w-4 text-red-300/60" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-red-300">
            {failedInspections}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-300/10 bg-amber-300/[0.025] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-white/35">
              Pending
            </p>

            <Clock3 className="h-4 w-4 text-amber-300/60" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-amber-300">
            {pendingInspections}
          </p>
        </div>
      </div>

      {/* =========================
          FORM
      ========================= */}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-black/10 sm:p-6"
      >
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-sm font-semibold text-white">
              {editingId ? "Edit Inspection" : "Inspection Details"}
            </p>

            <p className="mt-1 text-xs text-white/35">
              Record the quality inspection details for incoming materials.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-white/40 transition hover:text-white"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* =========================
            BASIC DETAILS
        ========================= */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label="Inspection Report"
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

          <Select
            label="Quality Result"
            name="qualityResult"
            value={form.qualityResult}
            onChange={handleChange}
            options={[
              {
                label: "Pending",
                value: "Pending",
              },
              {
                label: "Passed",
                value: "Passed",
              },
              {
                label: "Failed",
                value: "Failed",
              },
              {
                label: "Partially Passed",
                value: "Partially Passed",
              },
            ]}
          />
        </div>

        {/* =========================
            ITEMS
        ========================= */}

        <div className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Inspected Items
              </p>

              <p className="mt-1 text-xs text-white/35">
                Add one or more materials included in this inspection.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-lime-300/20 bg-lime-300/[0.06] px-3 py-2 text-xs font-medium text-lime-200 transition hover:border-lime-300/40 hover:bg-lime-300/[0.1]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {form.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-black/10 p-3 sm:grid-cols-[1fr_180px_auto]"
              >
                <Select
                  label={`Item ${index + 1}`}
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

                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) =>
                    handleItemChange(index, "quantity", event.target.value)
                  }
                  placeholder="Enter quantity"
                />

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={form.items.length === 1}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-400/10 bg-red-400/[0.04] px-3 text-xs text-red-300/70 transition hover:border-red-400/25 hover:bg-red-400/[0.08] disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sm:hidden">Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================
            LOGISTICS
        ========================= */}

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Input
            label="E-Way Bill Number"
            name="eWayBillNumber"
            value={form.eWayBillNumber}
            onChange={handleChange}
            placeholder="EWB-123456789"
          />

          <Input
            label="Weight"
            name="weight"
            type="number"
            min="0"
            value={form.weight}
            onChange={handleChange}
            placeholder="Enter weight"
            required
          />

          <Input
            label="Number of Bags"
            name="numberOfBags"
            type="number"
            min="0"
            value={form.numberOfBags}
            onChange={handleChange}
            placeholder="Enter number of bags"
            required
          />

          <div className="md:col-span-2 lg:col-span-3">
            <Input
              label="Delivery Challan"
              name="deliveryChallan"
              value={form.deliveryChallan}
              onChange={handleChange}
              placeholder="DC-2026-001"
              required
            />
          </div>
        </div>

        {/* =========================
            REMARKS
        ========================= */}

        <div className="mt-6">
          <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/40">
            Remarks
          </label>

          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows="4"
            placeholder="Enter inspection remarks..."
            className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-lime-300/30 focus:ring-1 focus:ring-lime-300/10"
          />
        </div>

        {/* =========================
            FORM ACTIONS
        ========================= */}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={resetForm}>
            Reset
          </Button>

          <Button type="submit" disabled={loading}>
            {loading
              ? editingId
                ? "Updating..."
                : "Saving..."
              : editingId
                ? "Update Inspection"
                : "Save Inspection"}
          </Button>
        </div>
      </form>

      {/* =========================
          HISTORY HEADER
      ========================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-300/70">
            Inspection Records
          </p>

          <h2 className="mt-2 text-xl font-bold text-white">
            Inspection History
          </h2>

          <p className="mt-1 text-xs text-white/35">
            Review previously recorded quality inspections.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search inspections..."
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.025] pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/20 focus:border-lime-300/30"
            />
          </div>

          <button
            type="button"
            onClick={fetchInspections}
            disabled={fetching}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 text-xs text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-40"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${fetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* =========================
          HISTORY TABLE
      ========================= */}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        {fetching && inspections.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-white/30">
            Loading inspection records...
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center">
            <ClipboardCheck className="h-8 w-8 text-white/15" />

            <p className="mt-3 text-sm text-white/40">
              No quality inspections found.
            </p>

            <p className="mt-1 text-xs text-white/20">
              Create your first inspection using the form above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/25">
                  <th className="px-5 py-4 font-medium">Inspection</th>

                  <th className="px-5 py-4 font-medium">Vendor</th>

                  <th className="px-5 py-4 font-medium">Items</th>

                  <th className="px-5 py-4 font-medium">Result</th>

                  <th className="px-5 py-4 font-medium">Weight</th>

                  <th className="px-5 py-4 font-medium">Bags</th>

                  <th className="px-5 py-4 font-medium">Date</th>

                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInspections.map((inspection) => (
                  <tr
                    key={inspection._id}
                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-xs font-medium text-white">
                          {inspection.inspectionReport}
                        </p>

                        <p className="mt-1 text-[11px] text-white/25">
                          {inspection.invoiceNumber}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-white/60">
                      {inspection.vendorName}
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {inspection.items?.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="text-white/60">
                              {item.itemName}
                            </span>

                            <span className="text-white/25">×</span>

                            <span className="text-white/40">
                              {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${getStatusClasses(
                          inspection.qualityResult,
                        )}`}
                      >
                        {inspection.qualityResult}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-white/50">
                      {inspection.weight}
                    </td>

                    <td className="px-5 py-4 text-xs text-white/50">
                      {inspection.numberOfBags}
                    </td>

                    <td className="px-5 py-4 text-xs text-white/40">
                      {formatDate(inspection.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(inspection)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/40 transition hover:border-lime-300/20 hover:text-lime-300"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(inspection._id)}
                          disabled={deletingId === inspection._id}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/40 transition hover:border-red-400/20 hover:text-red-300 disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

export default QualityInspection;
