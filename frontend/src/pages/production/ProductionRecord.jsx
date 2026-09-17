import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Factory,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Pencil,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

import { items } from "../../data/items";

const API_URL = "http://localhost:5000/api";

function ProductionRecord() {
  const [form, setForm] = useState({
    itemName: "",
    process: "",
    pieces: "",
    operator: "",
    machine: "",
    productionDate: "",
    shift: "",
    notes: "",
  });

  const [productions, setProductions] = useState([]);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] =
    useState(true);

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);

  // =========================
  // SELECTED ITEM
  // =========================

  const selectedItem = useMemo(() => {
    return items.find(
      (item) => item.name === form.itemName
    );
  }, [form.itemName]);

  // =========================
  // PROCESS OPTIONS
  // =========================

  const processOptions = selectedItem
    ? selectedItem.processes.map((process) => ({
        value: process,
        label: process,
      }))
    : [];

  // =========================
  // ITEM OPTIONS
  // =========================

  const itemOptions = items.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  // =========================
  // FETCH RECORDS
  // =========================

  const fetchProductions = async () => {
    try {
      setLoadingRecords(true);
      setError("");

      const token = localStorage.getItem(
        "factoryflow_token"
      );

      if (!token) {
        setError(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/production`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load production records."
        );
      }

      setProductions(data.data || []);
    } catch (error) {
      console.error(
        "Fetch Production Error:",
        error
      );

      setError(
        error.message ||
          "Unable to load production records."
      );
    } finally {
      setLoadingRecords(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchProductions();
  }, []);

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => {
      if (name === "itemName") {
        return {
          ...previous,
          itemName: value,
          process: "",
        };
      }

      return {
        ...previous,
        [name]: value,
      };
    });

    setError("");
    setSaved(false);
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm({
      itemName: "",
      process: "",
      pieces: "",
      operator: "",
      machine: "",
      productionDate: "",
      shift: "",
      notes: "",
    });

    setEditingId(null);
    setError("");
  };

  // =========================
  // NEW PRODUCTION
  // =========================

  const handleNewProduction = () => {
    resetForm();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // SUBMIT FORM
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const token = localStorage.getItem(
        "factoryflow_token"
      );

      if (!token) {
        setError(
          "You are not logged in. Please login again."
        );

        return;
      }

      const payload = {
        itemName: form.itemName,

        productionProcess:
          form.process,

        numberOfPieces:
          Number(form.pieces),

        operator:
          form.operator,

        machine:
          form.machine,

        productionDate:
          form.productionDate,

        shift:
          form.shift,

        status:
          "In Progress",

        notes:
          form.notes,
      };

      const url = editingId
        ? `${API_URL}/production/${editingId}`
        : `${API_URL}/production`;

      const method = editingId
        ? "PUT"
        : "POST";

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
        throw new Error(
          data.message ||
            "Failed to save production record."
        );
      }

      setSaved(true);

      resetForm();

      await fetchProductions();

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Save Production Error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while saving the production record."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (production) => {
    setEditingId(production._id);

    setForm({
      itemName:
        production.itemName || "",

      process:
        production.productionProcess || "",

      pieces:
        production.numberOfPieces || "",

      operator:
        production.operator || "",

      machine:
        production.machine || "",

      productionDate:
        production.productionDate
          ? production.productionDate.slice(
              0,
              10
            )
          : "",

      shift:
        production.shift || "",

      notes:
        production.notes || "",
    });

    setSaved(false);
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
      "Are you sure you want to delete this production record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const token = localStorage.getItem(
        "factoryflow_token"
      );

      const response = await fetch(
        `${API_URL}/production/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete production record."
        );
      }

      await fetchProductions();
    } catch (error) {
      console.error(
        "Delete Production Error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete production record."
      );
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredProductions = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return productions;
    }

    return productions.filter(
      (production) =>
        production.itemName
          ?.toLowerCase()
          .includes(query) ||
        production.productionProcess
          ?.toLowerCase()
          .includes(query) ||
        production.operator
          ?.toLowerCase()
          .includes(query) ||
        production.machine
          ?.toLowerCase()
          .includes(query) ||
        production.shift
          ?.toLowerCase()
          .includes(query)
    );
  }, [productions, search]);

  // =========================
  // TOTAL PIECES
  // =========================

  const totalPieces = useMemo(() => {
    return productions.reduce(
      (total, production) =>
        total +
        Number(
          production.numberOfPieces || 0
        ),
      0
    );
  }, [productions]);

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* =========================
          HEADER
      ========================= */}

      <PageHeader
        eyebrow="Process Management / Manufacturing"
        title="Production Record"
        description="Record production output, processing stages, operators and machine activity."
        action="New Production"
        actionIcon={Plus}
        onAction={handleNewProduction}
      />

      {/* =========================
          SUCCESS
      ========================= */}

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-lime-300/20 bg-lime-300/[0.06] px-4 py-3 text-sm text-lime-200">
          <CheckCircle2 className="h-4 w-4" />

          Production record saved successfully.
        </div>
      )}

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* =========================
          FORM
      ========================= */}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="ff-card rounded-2xl p-5 sm:p-7">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-300/10 bg-lime-300/[0.06]">
                <Activity className="h-5 w-5 text-lime-300" />
              </div>

              <div>
                <h2 className="ff-section-title">
                  {editingId
                    ? "Edit Production"
                    : "Production Details"}
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  Select an item to load its available
                  processes.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Item Name"
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                options={itemOptions}
                placeholder="Select item"
                required
              />

              <Select
                label="Production Process"
                name="process"
                value={form.process}
                onChange={handleChange}
                options={processOptions}
                placeholder={
                  form.itemName
                    ? "Select process"
                    : "Select item first"
                }
                required
              />

              <Input
                label="Number of Pieces"
                name="pieces"
                type="number"
                min="1"
                value={form.pieces}
                onChange={handleChange}
                placeholder="Enter quantity"
                required
              />

              <Input
                label="Operator / Employee"
                name="operator"
                value={form.operator}
                onChange={handleChange}
                placeholder="Enter operator name"
                required
              />

              <Input
                label="Machine / Workstation"
                name="machine"
                value={form.machine}
                onChange={handleChange}
                placeholder="e.g. Machine 04"
              />

              <Input
                label="Production Date"
                name="productionDate"
                type="date"
                value={form.productionDate}
                onChange={handleChange}
                required
              />

              <Select
                label="Shift"
                name="shift"
                value={form.shift}
                onChange={handleChange}
                options={[
                  {
                    value: "Morning",
                    label: "Morning Shift",
                  },
                  {
                    value: "Evening",
                    label: "Evening Shift",
                  },
                  {
                    value: "Night",
                    label: "Night Shift",
                  },
                ]}
                placeholder="Select shift"
              />

              <div>
                <label className="ff-label">
                  Production Status
                </label>

                <div className="flex min-h-[46px] items-center gap-2 rounded-xl border border-lime-300/10 bg-lime-300/[0.035] px-4">
                  <span className="h-2 w-2 rounded-full bg-lime-300 ff-pulse" />

                  <span className="text-xs text-lime-200">
                    Active production
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="ff-label">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Add production notes..."
                  rows="4"
                  className="ff-input resize-none py-3"
                />
              </div>
            </div>
          </div>

          {/* =========================
              RIGHT SIDE
          ========================= */}

          <div className="space-y-5">
            <div className="ff-card rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
                  <Factory className="h-4 w-4 text-lime-300" />
                </div>

                <div>
                  <p className="ff-section-title">
                    Process Preview
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    Dynamic item workflow
                  </p>
                </div>
              </div>

              {selectedItem ? (
                <div className="mt-6">
                  <p className="text-xs text-white/35">
                    Selected item
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {selectedItem.name}
                  </p>

                  <p className="mt-1 text-[10px] text-white/25">
                    {selectedItem.type} •{" "}
                    {selectedItem.unit}
                  </p>

                  <div className="mt-5 space-y-2">
                    {selectedItem.processes.map(
                      (process, index) => (
                        <div
                          key={process}
                          className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-lime-300/10 text-[9px] font-bold text-lime-300">
                            {index + 1}
                          </div>

                          <span className="text-xs text-white/55">
                            {process}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-white/[0.07] p-5 text-center">
                  <p className="text-xs text-white/25">
                    Select an item to see its production
                    process.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-white/30" />

                <span className="text-xs text-white/45">
                  Production tracking
                </span>
              </div>

              <p className="mt-2 text-[10px] leading-5 text-white/25">
                Production stages can later be connected
                to machine status and real-time factory
                monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            BUTTONS
        ========================= */}

        <div className="mt-5 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          {editingId && (
            <Button
              type="button"
              variant="secondary"
              onClick={resetForm}
              disabled={loading}
            >
              Cancel Edit
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={resetForm}
            disabled={loading}
          >
            Clear
          </Button>

          <Button
            type="submit"
            disabled={loading}
          >
            <Activity className="h-4 w-4" />

            {loading
              ? "Saving..."
              : editingId
              ? "Update Production"
              : "Save Production Record"}
          </Button>
        </div>
      </form>

      {/* =========================
          PRODUCTION HISTORY
      ========================= */}

      <div className="mt-8 ff-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="ff-section-title">
              Production History
            </p>

            <p className="mt-1 text-xs text-white/30">
              Production records stored in MongoDB.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search production..."
                className="ff-input min-w-[230px] pl-9"
              />
            </div>

            <button
              type="button"
              onClick={fetchProductions}
              disabled={loadingRecords}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-xs text-white/50 transition hover:border-lime-300/20 hover:text-lime-300 disabled:opacity-40"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loadingRecords
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
              Total Records
            </p>

            <p className="mt-2 text-2xl font-bold">
              {productions.length}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
              Total Pieces
            </p>

            <p className="mt-2 text-2xl font-bold text-lime-300">
              {totalPieces.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* TABLE */}

        <div className="mt-5 overflow-x-auto rounded-xl border border-white/[0.06]">
          {loadingRecords ? (
            <div className="flex min-h-40 items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-white/30">
                <RefreshCw className="h-4 w-4 animate-spin" />

                Loading production records...
              </div>
            </div>
          ) : filteredProductions.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center px-5 text-center">
              <Activity className="h-7 w-7 text-white/15" />

              <p className="mt-3 text-xs text-white/30">
                {search
                  ? "No production records found."
                  : "No production records yet."}
              </p>
            </div>
          ) : (
            <table className="min-w-[1050px] w-full text-left">
              <thead className="border-b border-white/[0.06] bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-white/25">
                    Item
                  </th>

                  <th className="px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-white/25">
                    Process
                  </th>

                  <th className="px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-white/25">
                    Pieces
                  </th>

                  <th className="px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-white/25">
                    Operator
                  </th>

                  <th className="px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-white/25">
                    Machine
                  </th>

                  <th className="px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-white/25">
                    Date
                  </th>

                  <th className="px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-white/25">
                    Shift
                  </th>

                  <th className="px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-white/25">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-[9px] uppercase tracking-[0.12em] text-white/25">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {filteredProductions.map(
                  (production) => (
                    <tr
                      key={production._id}
                      className="transition hover:bg-white/[0.015]"
                    >
                      <td className="px-4 py-4">
                        <p className="text-xs font-medium text-white/70">
                          {production.itemName}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-lime-300/[0.06] px-2 py-1 text-[10px] text-lime-200">
                          {production.productionProcess}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold text-white/65">
                          {Number(
                            production.numberOfPieces
                          ).toLocaleString("en-IN")}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-xs text-white/45">
                          {production.operator}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-xs text-white/40">
                          {production.machine ||
                            "—"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-xs text-white/40">
                          {formatDate(
                            production.productionDate
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-xs text-white/40">
                          {production.shift ||
                            "—"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-lime-300/10 bg-lime-300/[0.05] px-2.5 py-1 text-[9px] text-lime-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />

                          {production.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                production
                              )
                            }
                            className="rounded-lg p-2 text-white/25 transition hover:bg-lime-300/[0.06] hover:text-lime-300"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                production._id
                              )
                            }
                            className="rounded-lg p-2 text-white/25 transition hover:bg-red-400/[0.06] hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================
// FORMAT DATE
// =========================

function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default ProductionRecord;