import { useState } from "react";
import { FileText, PackageCheck, Plus, Upload, X } from "lucide-react";

import PageHeader from "../../components/PageHeader";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const API_URL = "http://localhost:5000/api";

const vendors = [
  {
    value: "ABC Metals",
    label: "ABC Metals",
  },
  {
    value: "Sharma Industries",
    label: "Sharma Industries",
  },
  {
    value: "Global Steel Pvt Ltd",
    label: "Global Steel Pvt Ltd",
  },
];

const materialTypes = [
  {
    value: "Raw Material",
    label: "Raw Material",
  },
  {
    value: "Semi Finished",
    label: "Semi Finished",
  },
  {
    value: "Consumable",
    label: "Consumable",
  },
];

const materialItems = [
  {
    value: "Steel Rod",
    label: "Steel Rod",
  },
  {
    value: "Steel Sheet",
    label: "Steel Sheet",
  },
  {
    value: "Aluminium Pipe",
    label: "Aluminium Pipe",
  },
  {
    value: "Copper Wire",
    label: "Copper Wire",
  },
];

function InwardSupply() {
  const [form, setForm] = useState({
    vendorName: "",
    invoiceNumber: "",
    materialWeight: "",
    materialSize: "",
    materialType: "",
    materialItemName: "",
    receivedBy: "",
  });

  const [documents, setDocuments] = useState([]);

  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // =========================
  // HANDLE FORM CHANGE
  // =========================

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setError("");
    setSaved(false);
  };

  // =========================
  // HANDLE DOCUMENTS
  // =========================

  const handleDocuments = (event) => {
    const files = Array.from(event.target.files || []);

    setDocuments((previous) => [...previous, ...files]);

    setError("");
  };

  // =========================
  // REMOVE DOCUMENT
  // =========================

  const removeDocument = (index) => {
    setDocuments((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm({
      vendorName: "",
      invoiceNumber: "",
      materialWeight: "",
      materialSize: "",
      materialType: "",
      materialItemName: "",
      receivedBy: "",
    });

    setDocuments([]);
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
      const token = localStorage.getItem("factoryflow_token");

      if (!token) {
        setError("You are not logged in. Please login again.");

        setLoading(false);
        return;
      }

      // Create FormData
      const formData = new FormData();

      formData.append("vendorName", form.vendorName);

      formData.append("invoiceNumber", form.invoiceNumber);

      formData.append("materialWeight", form.materialWeight);

      formData.append("materialSize", form.materialSize);

      formData.append("materialType", form.materialType);

      formData.append("materialItemName", form.materialItemName);

      formData.append("receivedBy", form.receivedBy);

      // Backend currently accepts one document
      if (documents.length > 0) {
        formData.append("document", documents[0]);
      }

      // Send request
      const response = await fetch(`${API_URL}/inward`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save inward supply.");
      }

      // Success
      setSaved(true);

      resetForm();

      // Hide success message
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Create Inward Supply Error:", error);

      setError(
        error.message || "Something went wrong while saving the record.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Process Management / Material In"
        title="Inward Supply"
        description="Record incoming material, vendor information and supporting documents."
        action="New Entry"
        actionIcon={Plus}
      />

      {/* =========================
          SUCCESS MESSAGE
      ========================= */}

      {saved && (
        <div className="mb-5 rounded-xl border border-lime-300/20 bg-lime-300/[0.06] px-4 py-3 text-sm text-lime-200">
          Inward supply record saved successfully.
        </div>
      )}

      {/* =========================
          ERROR MESSAGE
      ========================= */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* =========================
              MATERIAL RECEIPT
          ========================= */}

          <div className="ff-card rounded-2xl p-5 sm:p-7">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-300/10 bg-lime-300/[0.06]">
                <PackageCheck className="h-5 w-5 text-lime-300" />
              </div>

              <div>
                <h2 className="ff-section-title">Material Receipt</h2>

                <p className="mt-1 text-xs text-white/30">
                  Enter the details of received material.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Vendor Name"
                name="vendorName"
                value={form.vendorName}
                onChange={handleChange}
                options={vendors}
                required
              />

              <Input
                label="Invoice Number"
                name="invoiceNumber"
                value={form.invoiceNumber}
                onChange={handleChange}
                placeholder="INV-2026-0001"
                required
              />

              <Input
                label="Material Weight"
                name="materialWeight"
                type="number"
                value={form.materialWeight}
                onChange={handleChange}
                placeholder="Enter weight"
                required
              />

              <Input
                label="Material Size"
                name="materialSize"
                value={form.materialSize}
                onChange={handleChange}
                placeholder="e.g. 25mm × 6m"
                required
              />

              <Select
                label="Material Type"
                name="materialType"
                value={form.materialType}
                onChange={handleChange}
                options={materialTypes}
                required
              />

              <Select
                label="Material Item Name"
                name="materialItemName"
                value={form.materialItemName}
                onChange={handleChange}
                options={materialItems}
                required
              />

              <div className="sm:col-span-2">
                <Input
                  label="Received By"
                  name="receivedBy"
                  value={form.receivedBy}
                  onChange={handleChange}
                  placeholder="Employee / receiver name"
                  required
                />
              </div>
            </div>
          </div>

          {/* =========================
              DOCUMENTS
          ========================= */}

          <div className="space-y-5">
            <div className="ff-card rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
                  <FileText className="h-4 w-4 text-white/50" />
                </div>

                <div>
                  <h3 className="ff-section-title">Documents</h3>

                  <p className="mt-1 text-[10px] text-white/30">
                    Upload invoices or supporting documents.
                  </p>
                </div>
              </div>

              <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-4 text-center transition hover:border-lime-300/30 hover:bg-lime-300/[0.02]">
                <Upload className="h-6 w-6 text-lime-300/70" />

                <p className="mt-3 text-xs font-medium text-white/60">
                  Upload documents
                </p>

                <p className="mt-1 text-[10px] text-white/25">
                  PDF, JPG, PNG or DOC
                </p>

                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={handleDocuments}
                />
              </label>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-lime-300/70" />

                      <p className="min-w-0 flex-1 truncate text-[11px] text-white/55">
                        {file.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="rounded-lg p-1 text-white/25 hover:bg-white/5 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* =========================
                ENTRY STATUS
            ========================= */}

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                Entry status
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-lime-300" />

                <span className="text-xs text-white/55">
                  {loading ? "Saving record..." : "Ready to receive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            ACTION BUTTONS
        ========================= */}

        <div className="mt-5 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={resetForm}
            disabled={loading}
          >
            Clear
          </Button>

          <Button type="submit" disabled={loading}>
            <PackageCheck className="h-4 w-4" />

            {loading ? "Saving..." : "Save Inward Record"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default InwardSupply;
