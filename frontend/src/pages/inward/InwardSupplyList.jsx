import { useEffect, useState } from "react";

import {
  PackageCheck,
  Search,
  RefreshCw,
  Trash2,
  FileText,
  Pencil,
  X,
  Save,
  ArrowUpDown,
  Upload,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function InwardSupplyList() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortOrder, setSortOrder] = useState("newest");

  const [editingRecord, setEditingRecord] = useState(null);

  const [selectedDocument, setSelectedDocument] = useState(null);

  const [savingEdit, setSavingEdit] = useState(false);

  const [editForm, setEditForm] = useState({
    vendorName: "",
    invoiceNumber: "",
    materialWeight: "",
    materialSize: "",
    materialType: "",
    materialItemName: "",
    receivedBy: "",
  });

  // =========================
  // FETCH RECORDS
  // =========================

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("factoryflow_token");

      const response = await fetch(`${API_URL}/inward`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch inward supplies.");
      }

      setRecords(data.data || []);
    } catch (error) {
      console.error("Fetch Inward Supplies Error:", error);

      setError(error.message || "Unable to load inward supplies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // =========================
  // BATCH SEQUENCE
  // =========================

  const getBatchSequence = (record) => {
    if (!record?.batchNo) return 0;

    const match = String(record.batchNo).match(/^B-\d{4}-(\d+)$/);

    if (!match) return 0;

    const number = Number(match[1]);

    return Number.isFinite(number) ? number : 0;
  };

  // =========================
  // EDIT
  // =========================

  const openEdit = (record) => {
    setEditingRecord(record);
    setSelectedDocument(null);
    setError("");

    setEditForm({
      vendorName: record.vendorName || "",
      invoiceNumber: record.invoiceNumber || "",
      materialWeight: record.materialWeight || "",
      materialSize: record.materialSize || "",
      materialType: record.materialType || "",
      materialItemName: record.materialItemName || "",
      receivedBy: record.receivedBy || "",
    });
  };

  const closeEdit = () => {
    if (savingEdit) return;

    setEditingRecord(null);
    setSelectedDocument(null);

    setEditForm({
      vendorName: "",
      invoiceNumber: "",
      materialWeight: "",
      materialSize: "",
      materialType: "",
      materialItemName: "",
      receivedBy: "",
    });
  };

  const handleEditChange = (event) => {
    setEditForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

    setError("");
  };

  // =========================
  // UPDATE
  // =========================

  const updateRecord = async (event) => {
    event.preventDefault();

    if (!editingRecord) return;

    try {
      setSavingEdit(true);
      setError("");

      const token = localStorage.getItem("factoryflow_token");

      const formData = new FormData();

      formData.append("vendorName", editForm.vendorName.trim());

      formData.append("invoiceNumber", editForm.invoiceNumber.trim());

      formData.append("materialWeight", editForm.materialWeight);

      formData.append("materialSize", editForm.materialSize);

      formData.append("materialType", editForm.materialType.trim());

      formData.append("materialItemName", editForm.materialItemName.trim());

      formData.append("receivedBy", editForm.receivedBy.trim());

      if (selectedDocument) {
        formData.append("document", selectedDocument);
      }

      const response = await fetch(`${API_URL}/inward/${editingRecord._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update record.");
      }

      setRecords((previous) =>
        previous.map((record) =>
          record._id === editingRecord._id ? data.data : record,
        ),
      );

      closeEdit();
    } catch (error) {
      console.error("Update Inward Supply Error:", error);

      setError(error.message || "Unable to update record.");
    } finally {
      setSavingEdit(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteRecord = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this inward supply record?",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("factoryflow_token");

      const response = await fetch(`${API_URL}/inward/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete record.");
      }

      setRecords((previous) => previous.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Delete Inward Supply Error:", error);

      setError(error.message || "Unable to delete record.");
    }
  };

  // =========================
  // FILTER + SORT
  // =========================

  const filteredRecords = records
    .filter((record) => {
      const searchText = search.toLowerCase().trim();

      if (!searchText) return true;

      return (
        record.batchNo?.toLowerCase().includes(searchText) ||
        record.vendorName?.toLowerCase().includes(searchText) ||
        record.invoiceNumber?.toLowerCase().includes(searchText) ||
        record.materialType?.toLowerCase().includes(searchText) ||
        record.materialItemName?.toLowerCase().includes(searchText) ||
        record.receivedBy?.toLowerCase().includes(searchText)
      );
    })
    .sort((a, b) => {
      const batchA = getBatchSequence(a);

      const batchB = getBatchSequence(b);

      if (sortOrder === "newest") {
        return batchB - batchA;
      }

      return batchA - batchB;
    });

  // =========================
  // FORMAT
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatWeight = (value) => {
    if (!value) return "-";

    const stringValue = String(value).trim();

    if (/kg$/i.test(stringValue)) {
      return stringValue;
    }

    return `${stringValue} Kg`;
  };

  const formatSize = (value) => {
    if (!value) return "-";

    const stringValue = String(value).trim();

    if (/mm$/i.test(stringValue)) {
      return stringValue;
    }

    return `${stringValue} mm`;
  };

const getDocumentUrl = (documentPath) => {
  if (!documentPath) return "";

  return `${API_URL.replace("/api", "")}${documentPath}`;
};
  return (
    <div className="flex h-[calc(100vh-64px)] min-h-0 flex-col overflow-hidden">
      {/* ================= PAGE HEADER ================= */}

      <div className="shrink-0">
        <PageHeader
          eyebrow="Process Management / Material In"
          title="Inward Supply List"
          description="View and manage all received material records."
        />
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mx-auto mb-3 w-full max-w-[1500px] shrink-0">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* ================= MAIN CARD ================= */}

      <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm max-h-[calc(100vh-235px)]">
        {/* ================= CARD HEADER ================= */}

        <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lime-200 bg-lime-50">
              <PackageCheck className="h-5 w-5 text-lime-600" />
            </div>

            <div>
              <h2 className="text-[17px] font-bold leading-tight text-black">
                Inward Records
              </h2>

              <p className="mt-1 text-xs font-medium text-black">
                {records.length} total records
              </p>
            </div>
          </div>

          {/* ================= CONTROLS ================= */}

          <div className="flex shrink-0 items-center gap-2">
            {/* SEARCH */}

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search records..."
                className="h-10 w-[230px] rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
              />
            </div>

            {/* SORT */}

            <button
              type="button"
              onClick={() =>
                setSortOrder((previous) =>
                  previous === "newest" ? "oldest" : "newest",
                )
              }
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-black shadow-sm transition hover:border-lime-300 hover:bg-lime-50"
              title="Change batch sorting"
            >
              <ArrowUpDown className="h-4 w-4 text-lime-600" />

              {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </button>

            {/* REFRESH */}

            <button
              type="button"
              onClick={fetchRecords}
              disabled={loading}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-black shadow-sm transition hover:border-lime-300 hover:bg-lime-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 text-lime-600 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ================= TABLE AREA ================= */}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-[9%]" />
                <col className="w-[11%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[7%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[9%]" />
                <col className="w-[5%]" />
                <col className="w-[8%]" />
              </colgroup>

              {/* ================= STICKY HEADER ================= */}

              <thead className="sticky top-0 z-20">
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                    "Batch No",
                    "Vendor",
                    "Invoice",
                    "Weight",
                    "Size",
                    "Material Type",
                    "Item",
                    "Received By",
                    "Date",
                    "Doc",
                    "Action",
                  ].map((heading, index) => (
                    <th
                      key={heading}
                      className={`px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-black ${
                        index >= 9 ? "text-center" : "text-left"
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* ================= BODY ================= */}

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-4 py-12 text-center text-sm font-medium text-black"
                    >
                      Loading inward records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-4 py-12 text-center text-sm font-medium text-black"
                    >
                      {search
                        ? "No matching records found."
                        : "No inward supply records found."}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr
                      key={record._id}
                      className="border-b border-slate-100 transition hover:bg-lime-50/40"
                    >
                      {/* BATCH */}

                      <td className="truncate px-3 py-3.5 text-[12px] font-bold text-lime-700">
                        {record.batchNo || "-"}
                      </td>

                      {/* VENDOR */}

                      <td
                        className="max-w-0 truncate px-3 py-3.5 text-[12px] font-semibold text-black"
                        title={record.vendorName}
                      >
                        {record.vendorName || "-"}
                      </td>

                      {/* INVOICE */}

                      <td
                        className="max-w-0 truncate px-3 py-3.5 text-[12px] font-medium text-black"
                        title={record.invoiceNumber}
                      >
                        {record.invoiceNumber || "-"}
                      </td>

                      {/* WEIGHT */}

                      <td className="truncate px-3 py-3.5 text-[12px] font-medium text-black">
                        {formatWeight(record.materialWeight)}
                      </td>

                      {/* SIZE */}

                      <td className="truncate px-3 py-3.5 text-[12px] font-medium text-black">
                        {formatSize(record.materialSize)}
                      </td>

                      {/* MATERIAL TYPE */}

                      <td
                        className="max-w-0 truncate px-3 py-3.5 text-[12px] font-medium text-black"
                        title={record.materialType}
                      >
                        {record.materialType || "-"}
                      </td>

                      {/* ITEM */}

                      <td
                        className="max-w-0 truncate px-3 py-3.5 text-[12px] font-medium text-black"
                        title={record.materialItemName}
                      >
                        {record.materialItemName || "-"}
                      </td>

                      {/* RECEIVED BY */}

                      <td
                        className="max-w-0 truncate px-3 py-3.5 text-[12px] font-medium text-black"
                        title={record.receivedBy}
                      >
                        {record.receivedBy || "-"}
                      </td>

                      {/* DATE */}

                      <td className="truncate px-3 py-3.5 text-[11px] font-medium text-black">
                        {formatDate(record.createdAt)}
                      </td>

                      {/* DOCUMENT */}

                      <td className="px-3 py-3.5 text-center">
                        {record.document ? (
                          <a
                            href={getDocumentUrl(record.document)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-lime-600 transition hover:bg-lime-50 hover:text-lime-700"
                            title="View document"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* ACTION */}

                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(record)}
                            className="rounded-lg p-1.5 text-black transition hover:bg-lime-50 hover:text-lime-700"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteRecord(record._id)}
                            className="rounded-lg p-1.5 text-black transition hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ================= TABLE FOOTER ================= */}

          {!loading && (
            <div className="flex h-9 shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-3">
              <span className="text-[11px] font-medium text-black">
                Showing {filteredRecords.length} of {records.length} records
              </span>

              <span className="text-[10px] font-medium text-black">
                Scroll inside table to view more
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}

      {editingRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-black">
                  Edit Inward Supply
                </h2>

                <p className="mt-1 text-xs font-medium text-black">
                  Update the inward supply details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={savingEdit}
                className="rounded-lg p-2 text-black transition hover:bg-slate-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL FORM */}

            <form onSubmit={updateRecord} className="p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* VENDOR */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-black">
                    Vendor Name
                    <span className="ml-1 text-lime-600">*</span>
                  </label>

                  <input
                    type="text"
                    name="vendorName"
                    value={editForm.vendorName}
                    onChange={handleEditChange}
                    required
                    className="h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                  />
                </div>

                {/* INVOICE */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-black">
                    Invoice Number
                    <span className="ml-1 text-lime-600">*</span>
                  </label>

                  <input
                    type="text"
                    name="invoiceNumber"
                    value={editForm.invoiceNumber}
                    onChange={handleEditChange}
                    required
                    className="h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                  />
                </div>

                {/* WEIGHT */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-black">
                    Material Weight
                    <span className="ml-1 text-lime-600">*</span>
                  </label>

                  <div className="flex h-[44px] overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-lime-500 focus-within:ring-2 focus-within:ring-lime-100">
                    <input
                      type="text"
                      name="materialWeight"
                      value={editForm.materialWeight}
                      onChange={handleEditChange}
                      required
                      className="min-w-0 flex-1 bg-transparent px-4 text-sm font-medium text-black outline-none"
                    />

                    <span className="flex items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-bold text-black">
                      Kg
                    </span>
                  </div>
                </div>

                {/* SIZE */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-black">
                    Material Size
                    <span className="ml-1 text-lime-600">*</span>
                  </label>

                  <div className="flex h-[44px] overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-lime-500 focus-within:ring-2 focus-within:ring-lime-100">
                    <input
                      type="text"
                      name="materialSize"
                      value={editForm.materialSize}
                      onChange={handleEditChange}
                      required
                      className="min-w-0 flex-1 bg-transparent px-4 text-sm font-medium text-black outline-none"
                    />

                    <span className="flex items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-bold text-black">
                      mm
                    </span>
                  </div>
                </div>

                {/* MATERIAL TYPE */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-black">
                    Material Type
                    <span className="ml-1 text-lime-600">*</span>
                  </label>

                  <input
                    type="text"
                    name="materialType"
                    value={editForm.materialType}
                    onChange={handleEditChange}
                    required
                    className="h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                  />
                </div>

                {/* ITEM */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-black">
                    Material Item Name
                    <span className="ml-1 text-lime-600">*</span>
                  </label>

                  <input
                    type="text"
                    name="materialItemName"
                    value={editForm.materialItemName}
                    onChange={handleEditChange}
                    required
                    className="h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                  />
                </div>

                {/* RECEIVED BY */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-black">
                    Received By
                    <span className="ml-1 text-lime-600">*</span>
                  </label>

                  <input
                    type="text"
                    name="receivedBy"
                    value={editForm.receivedBy}
                    onChange={handleEditChange}
                    required
                    className="h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                  />
                </div>

                {/* DOCUMENT */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-black">
                    Document
                  </label>

                  <div className="flex items-center gap-2">
                    {editingRecord.document && (
                      <a
                        href={getDocumentUrl(editingRecord.document)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-black transition hover:border-lime-300 hover:bg-lime-50"
                      >
                        <FileText className="h-4 w-4 text-lime-600" />
                        View
                      </a>
                    )}

                    <label className="flex h-[44px] flex-1 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-black transition hover:border-lime-300 hover:bg-lime-50">
                      <Upload className="h-4 w-4 text-lime-600" />

                      <span className="truncate">
                        {selectedDocument
                          ? selectedDocument.name
                          : "Upload / Replace"}
                      </span>

                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(event) =>
                          setSelectedDocument(event.target.files?.[0] || null)
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* MODAL BUTTONS */}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={savingEdit}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-2 rounded-xl bg-lime-500 px-5 py-2.5 text-sm font-bold text-black shadow-sm transition hover:bg-lime-400 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />

                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InwardSupplyList;
