import { useEffect, useState } from "react";

import {
  PackageCheck,
  Upload,
  X,
  Save,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function InwardSupply() {
  const [formData, setFormData] = useState({
    vendorName: "",
    invoiceNumber: "",
    numberOfItems: "",
    materialWeight: "",
    materialSize: "",
    materialType: "",
    materialItemName: "",
    receivedBy: "",
  });

  const [vendors, setVendors] = useState([]);

  const [documentFile, setDocumentFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [loadingVendors, setLoadingVendors] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =========================================================
  // LOAD VENDORS
  // =========================================================

  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoadingVendors(true);

        const token =
          localStorage.getItem(
            "factoryflow_token"
          );

        const response = await fetch(
          `${API_URL}/vendors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load vendors."
          );
        }

        setVendors(
          Array.isArray(data?.data)
            ? data.data
            : []
        );
      } catch (err) {
        console.error(
          "Load vendors error:",
          err
        );
      } finally {
        setLoadingVendors(false);
      }
    };

    loadVendors();
  }, []);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // DOCUMENT
  // =========================================================

  const handleDocumentChange = (e) => {
    const file =
      e.target.files?.[0] || null;

    setDocumentFile(file);

    setError("");
    setSuccess("");
  };

  // =========================================================
  // RESET
  // =========================================================

  const resetForm = () => {
    setFormData({
      vendorName: "",
      invoiceNumber: "",
      numberOfItems: "",
      materialWeight: "",
      materialSize: "",
      materialType: "",
      materialItemName: "",
      receivedBy: "",
    });

    setDocumentFile(null);

    const input =
      window.document.getElementById(
        "inward-document"
      );

    if (input) {
      input.value = "";
    }

    setError("");
    setSuccess("");
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!formData.vendorName.trim()) {
      setError("Please select a vendor.");
      return;
    }

    if (!formData.invoiceNumber.trim()) {
      setError(
        "Please enter invoice number."
      );
      return;
    }

    if (
      !formData.numberOfItems ||
      Number(formData.numberOfItems) <= 0
    ) {
      setError(
        "Please enter a valid number of items."
      );
      return;
    }

    if (!formData.materialWeight.trim()) {
      setError(
        "Please enter material weight."
      );
      return;
    }

    if (!formData.materialSize.trim()) {
      setError(
        "Please enter material size."
      );
      return;
    }

    if (!formData.materialType.trim()) {
      setError(
        "Please enter material type."
      );
      return;
    }

    if (!formData.materialItemName.trim()) {
      setError(
        "Please enter material item name."
      );
      return;
    }

    if (!formData.receivedBy.trim()) {
      setError(
        "Please enter received by."
      );
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          "factoryflow_token"
        );

      const body = new FormData();

      body.append(
        "vendorName",
        formData.vendorName.trim()
      );

      body.append(
        "invoiceNumber",
        formData.invoiceNumber.trim()
      );

      body.append(
        "numberOfItems",
        formData.numberOfItems
      );

      body.append(
        "materialWeight",
        formData.materialWeight.trim()
      );

      body.append(
        "materialSize",
        formData.materialSize.trim()
      );

      body.append(
        "materialType",
        formData.materialType.trim()
      );

      body.append(
        "materialItemName",
        formData.materialItemName.trim()
      );

      body.append(
        "receivedBy",
        formData.receivedBy.trim()
      );

      if (documentFile) {
        body.append(
          "document",
          documentFile
        );
      }

      const response = await fetch(
        `${API_URL}/inward`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to create inward supply."
        );
      }

      setSuccess(
        data?.message ||
          "Inward supply created successfully."
      );

      resetForm();
    } catch (err) {
      console.error(
        "Create inward supply error:",
        err
      );

      setError(
        err.message ||
          "Unable to create inward supply."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-full p-3 sm:p-4">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-3">

        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-lime-600">
          Process Management / Material In
        </p>

        <h1 className="mt-1 text-xl font-bold tracking-tight text-black">
          Inward Supply
        </h1>

        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
          Create and manage received material
          records.
        </p>

      </div>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="mb-3 rounded-lg border border-lime-200 bg-lime-50 px-3 py-2 text-[11px] font-semibold text-lime-700">
          {success}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >

        {/* ===================================================
            FORM TITLE
        =================================================== */}

        <div className="mb-3">

          <div className="flex items-center gap-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-lime-200 bg-lime-50">

              <PackageCheck className="h-4 w-4 text-lime-600" />

            </div>

            <div>

              <h2 className="text-sm font-bold text-black">
                Inward Supply Information
              </h2>

              <p className="text-[10px] font-medium text-slate-500">
                Enter received material details.
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">

          {/* =================================================
              VENDOR
          ================================================= */}

          <div>

            <label className="mb-1 block text-[11px] font-semibold text-black">

              Vendor Name

              <span className="ml-1 text-lime-600">
                *
              </span>

            </label>

            <select
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              required
              disabled={loadingVendors}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            >

              <option value="">
                {loadingVendors
                  ? "Loading vendors..."
                  : "Select Vendor"}
              </option>

              {vendors.map((vendor) => (
                <option
                  key={
                    vendor._id ||
                    vendor.id ||
                    vendor.vendorName ||
                    vendor.name
                  }
                  value={
                    vendor.vendorName ||
                    vendor.name ||
                    ""
                  }
                >
                  {vendor.vendorName ||
                    vendor.name ||
                    "-"}
                </option>
              ))}

            </select>

          </div>

          {/* =================================================
              INVOICE
          ================================================= */}

          <div>

            <label className="mb-1 block text-[11px] font-semibold text-black">

              Invoice Number

              <span className="ml-1 text-lime-600">
                *
              </span>

            </label>

            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              placeholder="Enter invoice number"
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            />

          </div>

          {/* =================================================
              NUMBER OF ITEMS
          ================================================= */}

          <div>

            <label className="mb-1 block text-[11px] font-semibold text-black">

              Number of Items

              <span className="ml-1 text-lime-600">
                *
              </span>

            </label>

            <input
              type="number"
              name="numberOfItems"
              value={formData.numberOfItems}
              onChange={handleChange}
              min="1"
              step="1"
              placeholder="Example: 100"
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            />

          </div>

          {/* =================================================
              MATERIAL WEIGHT
          ================================================= */}

          <div>

            <label className="mb-1 block text-[11px] font-semibold text-black">

              Material Weight

              <span className="ml-1 text-lime-600">
                *
              </span>

            </label>

            <div className="flex h-9 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">

              <input
                type="number"
                name="materialWeight"
                value={formData.materialWeight}
                onChange={handleChange}
                min="0"
                step="any"
                placeholder="Enter weight"
                required
                className="min-w-0 flex-1 bg-transparent px-3 text-xs font-medium text-black outline-none placeholder:text-slate-400"
              />

              <div className="flex items-center border-l border-slate-200 bg-white px-2.5 text-[10px] font-bold text-black">
                Kg
              </div>

            </div>

          </div>

          {/* =================================================
              MATERIAL SIZE
          ================================================= */}

          <div>

            <label className="mb-1 block text-[11px] font-semibold text-black">

              Material Size

              <span className="ml-1 text-lime-600">
                *
              </span>

            </label>

            <div className="flex h-9 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">

              <input
                type="text"
                name="materialSize"
                value={formData.materialSize}
                onChange={handleChange}
                placeholder="Enter size"
                required
                className="min-w-0 flex-1 bg-transparent px-3 text-xs font-medium text-black outline-none placeholder:text-slate-400"
              />

              <div className="flex items-center border-l border-slate-200 bg-white px-2.5 text-[10px] font-bold text-black">
                mm
              </div>

            </div>

          </div>

          {/* =================================================
              MATERIAL TYPE
          ================================================= */}

          <div>

            <label className="mb-1 block text-[11px] font-semibold text-black">

              Material Type

              <span className="ml-1 text-lime-600">
                *
              </span>

            </label>

            <input
              type="text"
              name="materialType"
              value={formData.materialType}
              onChange={handleChange}
              placeholder="Example: Hex 17"
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            />

          </div>

          {/* =================================================
              ITEM NAME
          ================================================= */}

          <div>

            <label className="mb-1 block text-[11px] font-semibold text-black">

              Material Item Name

              <span className="ml-1 text-lime-600">
                *
              </span>

            </label>

            <input
              type="text"
              name="materialItemName"
              value={
                formData.materialItemName
              }
              onChange={handleChange}
              placeholder="Example: RV Bush"
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            />

          </div>

          {/* =================================================
              RECEIVED BY
          ================================================= */}

          <div>

            <label className="mb-1 block text-[11px] font-semibold text-black">

              Received By

              <span className="ml-1 text-lime-600">
                *
              </span>

            </label>

            <input
              type="text"
              name="receivedBy"
              value={formData.receivedBy}
              onChange={handleChange}
              placeholder="Enter receiver name"
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            />

          </div>

        </div>

        {/* ===================================================
            DOCUMENT
        =================================================== */}

        <div className="mt-4">

          <div className="mb-1.5">

            <h2 className="text-xs font-bold text-black">
              Inward Document
            </h2>

            <p className="text-[10px] text-slate-500">
              Upload invoice, drawing or related
              material document.
            </p>

          </div>

          <label
            htmlFor="inward-document"
            className="flex min-h-[58px] cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 transition hover:border-lime-400 hover:bg-lime-50"
          >

            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-100">

              <Upload className="h-3.5 w-3.5 text-lime-700" />

            </div>

            <div>

              <p className="text-[11px] font-semibold text-black">

                {documentFile
                  ? documentFile.name
                  : "Click to upload document"}

              </p>

              <p className="text-[9px] text-slate-500">
                PDF, DOC, DOCX, JPG or PNG
              </p>

            </div>

          </label>

          <input
            id="inward-document"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={
              handleDocumentChange
            }
            className="hidden"
          />

          {documentFile && (
            <div className="mt-1.5 flex items-center justify-between rounded-lg border border-lime-200 bg-lime-50 px-3 py-1.5">

              <p className="truncate text-[10px] font-semibold text-black">
                {documentFile.name}
              </p>

              <button
                type="button"
                onClick={() => {
                  setDocumentFile(null);

                  const input =
                    window.document.getElementById(
                      "inward-document"
                    );

                  if (input) {
                    input.value = "";
                  }
                }}
                className="ml-3 flex items-center gap-1 text-[10px] font-bold text-red-500"
              >
                <X className="h-3 w-3" />
                Remove
              </button>

            </div>
          )}

        </div>

        {/* ===================================================
            SAVE
        =================================================== */}

        <div className="mt-4 flex justify-end gap-2">

          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-lime-500 px-5 py-2 text-xs font-bold text-black shadow-sm transition hover:bg-lime-400 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />

            {loading
              ? "Saving..."
              : "Save Inward Supply"}

          </button>

        </div>

      </form>

    </div>
  );
}

export default InwardSupply;