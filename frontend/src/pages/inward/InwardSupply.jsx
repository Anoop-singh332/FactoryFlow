import { useEffect, useRef, useState } from "react";

import {
  FileText,
  PackageCheck,
  Upload,
  X,
  ChevronDown,
  Trash2,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import Button from "../../components/ui/Button";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const defaultMaterialTypes = [
  "Raw Material",
  "Semi Finished",
  "Consumable",
];

const defaultMaterialItems = [
  "Steel Rod",
  "Steel Sheet",
  "Aluminium Pipe",
  "Copper Wire",
];

function TypeableDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  onDelete,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  const filteredOptions = options.filter((option) =>
    option
      .toLowerCase()
      .includes(value.toLowerCase()),
  );

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <label className="mb-1.5 block text-xs font-semibold text-black">
        {label}

        {required && (
          <span className="ml-1 text-lime-600">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          required={required}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm font-medium text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
        />

        <button
          type="button"
          onClick={() =>
            setOpen((previous) => !previous)
          }
          className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-slate-500 transition hover:text-lime-600"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="max-h-44 overflow-y-auto p-1.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className="flex items-center rounded-lg transition hover:bg-lime-50"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    className="flex-1 px-3 py-2 text-left text-xs font-medium text-black hover:text-black"
                  >
                    {option}
                  </button>

                  {onDelete && (
                    <button
                      type="button"
                      onClick={() =>
                        onDelete(option)
                      }
                      className="mr-1 rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-2.5 text-xs font-medium text-black">
                No saved option found.
              </div>
            )}
          </div>

          {value.trim() &&
            !options.some(
              (option) =>
                option.toLowerCase() ===
                value.trim().toLowerCase(),
            ) && (
              <div className="border-t border-slate-200 bg-lime-50 px-3 py-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-black">
                  New value
                </p>

                <p className="mt-0.5 text-xs font-semibold text-lime-700">
                  {value}
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function FixedUnitInput({
  label,
  value,
  onChange,
  unit,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-black">
        {label}

        <span className="ml-1 text-lime-600">
          *
        </span>
      </label>

      <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-lime-500 focus-within:ring-2 focus-within:ring-lime-100">
        <input
          type="number"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          min="0"
          step="any"
          required
          className="min-w-0 flex-1 bg-transparent px-3.5 text-sm font-medium text-black outline-none placeholder:text-slate-400"
        />

        <div className="flex min-w-[55px] items-center justify-center border-l border-slate-200 bg-slate-50 px-2 text-xs font-bold text-black">
          {unit}
        </div>
      </div>
    </div>
  );
}

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

  const [vendors, setVendors] = useState([]);

  const [materialTypes, setMaterialTypes] =
    useState(defaultMaterialTypes);

  const [materialItems, setMaterialItems] =
    useState(defaultMaterialItems);

  const [documents, setDocuments] = useState([]);

  const [saved, setSaved] = useState(false);
  const [savedBatchNo, setSavedBatchNo] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedTypes = localStorage.getItem(
      "factoryflow_material_types",
    );

    if (savedTypes) {
      try {
        const parsed = JSON.parse(savedTypes);

        if (Array.isArray(parsed)) {
          setMaterialTypes(parsed);
        }
      } catch (error) {
        console.error(
          "Error loading material types:",
          error,
        );
      }
    }

    const savedItems = localStorage.getItem(
      "factoryflow_material_items",
    );

    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems);

        if (Array.isArray(parsed)) {
          setMaterialItems(parsed);
        }
      } catch (error) {
        console.error(
          "Error loading material items:",
          error,
        );
      }
    }
  }, []);

  const fetchVendors = async () => {
    try {
      const token =
        localStorage.getItem(
          "factoryflow_token",
        );

      const response = await fetch(
        `${API_URL}/vendors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setVendors(data.data || []);
      }
    } catch (error) {
      console.error(
        "Fetch Vendors Error:",
        error,
      );
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]:
        event.target.value,
    }));

    setError("");
    setSaved(false);
  };

  const handleDocuments = (event) => {
    const files = Array.from(
      event.target.files || [],
    );

    setDocuments((previous) => [
      ...previous,
      ...files,
    ]);

    event.target.value = "";
    setError("");
  };

  const removeDocument = (index) => {
    setDocuments((previous) =>
      previous.filter(
        (_, fileIndex) =>
          fileIndex !== index,
      ),
    );
  };

  const saveMaterialType = (value) => {
    const newValue = value.trim();

    if (!newValue) return;

    const exists = materialTypes.some(
      (item) =>
        item.toLowerCase() ===
        newValue.toLowerCase(),
    );

    if (!exists) {
      const updated = [
        ...materialTypes,
        newValue,
      ];

      setMaterialTypes(updated);

      localStorage.setItem(
        "factoryflow_material_types",
        JSON.stringify(updated),
      );
    }
  };

  const saveMaterialItem = (value) => {
    const newValue = value.trim();

    if (!newValue) return;

    const exists = materialItems.some(
      (item) =>
        item.toLowerCase() ===
        newValue.toLowerCase(),
    );

    if (!exists) {
      const updated = [
        ...materialItems,
        newValue,
      ];

      setMaterialItems(updated);

      localStorage.setItem(
        "factoryflow_material_items",
        JSON.stringify(updated),
      );
    }
  };

  const deleteMaterialType = (value) => {
    const updated = materialTypes.filter(
      (item) => item !== value,
    );

    setMaterialTypes(updated);

    localStorage.setItem(
      "factoryflow_material_types",
      JSON.stringify(updated),
    );

    if (form.materialType === value) {
      setForm((previous) => ({
        ...previous,
        materialType: "",
      }));
    }
  };

  const deleteMaterialItem = (value) => {
    const updated = materialItems.filter(
      (item) => item !== value,
    );

    setMaterialItems(updated);

    localStorage.setItem(
      "factoryflow_material_items",
      JSON.stringify(updated),
    );

    if (
      form.materialItemName === value
    ) {
      setForm((previous) => ({
        ...previous,
        materialItemName: "",
      }));
    }
  };

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
    setError("");
    setSaved(false);
    setSavedBatchNo("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSaved(false);
    setSavedBatchNo("");

    try {
      const token =
        localStorage.getItem(
          "factoryflow_token",
        );

      if (!token) {
        setError(
          "You are not logged in. Please login again.",
        );

        return;
      }

      if (
        !form.vendorName.trim() ||
        !form.invoiceNumber.trim() ||
        !form.materialWeight ||
        !form.materialSize ||
        !form.materialType.trim() ||
        !form.materialItemName.trim() ||
        !form.receivedBy.trim()
      ) {
        setError(
          "All required fields must be filled.",
        );

        return;
      }

      const existingVendor = vendors.find(
        (vendor) =>
          vendor.name
            .trim()
            .toLowerCase() ===
          form.vendorName
            .trim()
            .toLowerCase(),
      );

      if (!existingVendor) {
        setError(
          "Vendor not found. Please create the vendor from the Vendors tab first.",
        );

        return;
      }

      saveMaterialType(
        form.materialType,
      );

      saveMaterialItem(
        form.materialItemName,
      );

      const formData = new FormData();

      formData.append(
        "vendorName",
        form.vendorName.trim(),
      );

      formData.append(
        "invoiceNumber",
        form.invoiceNumber.trim(),
      );

      formData.append(
        "materialWeight",
        form.materialWeight,
      );

      formData.append(
        "materialSize",
        form.materialSize,
      );

      formData.append(
        "materialType",
        form.materialType.trim(),
      );

      formData.append(
        "materialItemName",
        form.materialItemName.trim(),
      );

      formData.append(
        "receivedBy",
        form.receivedBy.trim(),
      );

      if (documents.length > 0) {
        formData.append(
          "document",
          documents[0],
        );
      }

      const response = await fetch(
        `${API_URL}/inward`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save inward supply.",
        );
      }

      const generatedBatchNo =
        data?.data?.batchNo || "";

      setSavedBatchNo(
        generatedBatchNo,
      );

      await fetchVendors();

      setSaved(true);

      resetForm();

      setSaved(true);
      setSavedBatchNo(
        generatedBatchNo,
      );

      setTimeout(() => {
        setSaved(false);
        setSavedBatchNo("");
      }, 5000);
    } catch (error) {
      console.error(
        "Create Inward Supply Error:",
        error,
      );

      setError(
        error.message ||
          "Something went wrong while saving the record.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-85px)] min-h-0 max-w-[1400px] flex-col overflow-hidden">

      {/* ================= PAGE HEADER ================= */}

      <div className="shrink-0">
        <PageHeader
          eyebrow="Process Management / Material In"
          title="Inward Supply"
          description="Record incoming material, vendor information and supporting documents."
        />
      </div>

      {/* ================= SUCCESS MESSAGE ================= */}

      {saved && (
        <div className="mb-2 shrink-0 rounded-xl border border-lime-200 bg-lime-50 px-4 py-2 text-xs font-medium text-black">
          <div className="flex items-center gap-2">

            <span>
              Inward supply record saved successfully.
            </span>

            {savedBatchNo && (
              <span className="font-bold text-lime-700">
                Batch No: {savedBatchNo}
              </span>
            )}

          </div>
        </div>
      )}

      {/* ================= ERROR MESSAGE ================= */}

      {error && (
        <div className="mb-2 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="min-h-0 flex-1 overflow-hidden"
      >
        <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1fr_290px]">

          {/* ================= LEFT - MATERIAL RECEIPT ================= */}

          <div className="h-fit overflow-visible rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lime-200 bg-lime-50">
                <PackageCheck className="h-4 w-4 text-lime-600" />
              </div>

              <div>
                <h2 className="text-base font-bold text-black">
                  Material Receipt
                </h2>

                <p className="mt-0.5 text-[10px] font-medium text-black">
                  Enter received material details.
                </p>
              </div>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              {/* ================= VENDOR ================= */}

              <TypeableDropdown
                label="Vendor Name"
                value={form.vendorName}
                onChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    vendorName: value,
                  }))
                }
                options={vendors.map(
                  (vendor) => vendor.name,
                )}
                placeholder="Type or select vendor"
                required
              />

              {/* ================= INVOICE ================= */}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-black">
                  Invoice Number

                  <span className="ml-1 text-lime-600">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="invoiceNumber"
                  value={
                    form.invoiceNumber
                  }
                  onChange={handleChange}
                  placeholder="INV-2026-0001"
                  required
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />
              </div>

              {/* ================= WEIGHT ================= */}

              <FixedUnitInput
                label="Material Weight"
                value={
                  form.materialWeight
                }
                onChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    materialWeight: value,
                  }))
                }
                unit="Kg"
                placeholder="Enter weight"
              />

              {/* ================= SIZE ================= */}

              <FixedUnitInput
                label="Material Size"
                value={
                  form.materialSize
                }
                onChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    materialSize: value,
                  }))
                }
                unit="mm"
                placeholder="Enter size"
              />

              {/* ================= MATERIAL TYPE ================= */}

              <TypeableDropdown
                label="Material Type"
                value={
                  form.materialType
                }
                onChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    materialType: value,
                  }))
                }
                options={materialTypes}
                placeholder="Type or select material type"
                required
                onDelete={
                  deleteMaterialType
                }
              />

              {/* ================= MATERIAL ITEM ================= */}

              <TypeableDropdown
                label="Material Item Name"
                value={
                  form.materialItemName
                }
                onChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    materialItemName:
                      value,
                  }))
                }
                options={materialItems}
                placeholder="Type or select material item"
                required
                onDelete={
                  deleteMaterialItem
                }
              />

              {/* ================= RECEIVED BY ================= */}

              <div className="sm:col-span-2">

                <label className="mb-1.5 block text-xs font-semibold text-black">
                  Received By

                  <span className="ml-1 text-lime-600">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="receivedBy"
                  value={
                    form.receivedBy
                  }
                  onChange={handleChange}
                  placeholder="Employee / receiver name"
                  required
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />

              </div>

            </div>
          </div>

          {/* ================= RIGHT SIDE ================= */}

          <div className="flex min-h-0 flex-col gap-3">

            {/* ================= DOCUMENTS ================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

              <div className="flex items-center gap-2.5">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-50">
                  <FileText className="h-4 w-4 text-lime-600" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black">
                    Documents
                  </h3>

                  <p className="mt-0.5 text-[9px] font-medium text-black">
                    Upload supporting documents.
                  </p>
                </div>

              </div>

              <label className="mt-3 flex h-[105px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-center transition hover:border-lime-400 hover:bg-lime-50">

                <Upload className="h-5 w-5 text-lime-600" />

                <p className="mt-2 text-[11px] font-semibold text-black">
                  Upload documents
                </p>

                <p className="mt-0.5 text-[9px] font-medium text-black">
                  PDF, JPG, PNG or DOC
                </p>

                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={
                    handleDocuments
                  }
                />
              </label>

              {documents.length > 0 && (
                <div className="mt-2 max-h-20 space-y-1 overflow-y-auto">

                  {documents.map(
                    (file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5"
                      >

                        <FileText className="h-3.5 w-3.5 shrink-0 text-lime-600" />

                        <p className="min-w-0 flex-1 truncate text-[10px] font-medium text-black">
                          {file.name}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeDocument(
                              index,
                            )
                          }
                          className="rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>

                      </div>
                    ),
                  )}

                </div>
              )}

            </div>

            {/* ================= STATUS ================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black">
                Entry status
              </p>

              <div className="mt-2 flex items-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-lime-500" />

                <span className="text-[11px] font-semibold text-black">
                  {loading
                    ? "Saving record..."
                    : "Ready to receive"}
                </span>

              </div>

            </div>

            {/* ================= BUTTONS ================= */}

            <div className="flex justify-end gap-2">

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
                <PackageCheck className="h-4 w-4" />

                {loading
                  ? "Saving..."
                  : "Save Inward Record"}
              </Button>

            </div>

          </div>
        </div>
      </form>
    </div>
  );
}

export default InwardSupply;