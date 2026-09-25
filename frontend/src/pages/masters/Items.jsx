import React, { useState } from "react";

const Items = () => {
  const [formData, setFormData] = useState({
    itemName: "",
    totalNumberOfItems: "",
    requiredNumberOfItems: "",
    rawMaterialShape: "",
    rawMaterialSize: "",
    rawMaterialWeight: "",
    rawMaterialLength: "",
    numberOfProcesses: "",
  });

  const [processes, setProcesses] = useState([]);
  const [document, setDocument] = useState(null);
  const [showDocumentWarning, setShowDocumentWarning] = useState(false);

  // ================= HANDLE FORM CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Dynamically create process fields
    if (name === "numberOfProcesses") {
      const count = Number(value);

      setProcesses(
        Array.from({ length: count }, (_, index) => ({
          id: index + 1,
          name: "",
        })),
      );
    }
  };

  // ================= HANDLE PROCESS CHANGE =================

  const handleProcessChange = (index, value) => {
    setProcesses((previous) =>
      previous.map((process, processIndex) =>
        processIndex === index
          ? {
              ...process,
              name: value,
            }
          : process,
      ),
    );
  };

  // ================= DOCUMENT =================

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0] || null;
    setDocument(file);
  };

  // ================= SUBMIT =================

  const handleSubmit = (e) => {
    e.preventDefault();

    // Required items cannot be more than total items
    if (
      Number(formData.requiredNumberOfItems) >
      Number(formData.totalNumberOfItems)
    ) {
      alert(
        "Required Number of Items cannot be greater than Total Number of Items.",
      );
      return;
    }

    // If document is not selected, show warning
    if (!document) {
      setShowDocumentWarning(true);
      return;
    }

    saveItem();
  };

  // ================= SAVE ITEM =================

  const saveItem = () => {
    const itemData = {
      ...formData,
      processes,
      documentName: document ? document.name : null,
    };

    // Get existing items
    const existingItems = JSON.parse(
      localStorage.getItem("factoryflow_items") || "[]",
    );

    // Add new item
    const updatedItems = [...existingItems, itemData];

    // Save items
    localStorage.setItem("factoryflow_items", JSON.stringify(updatedItems));

    console.log("Item Data:", itemData);

    alert("Item saved successfully.");

    // Reset form
    setFormData({
      itemName: "",
      totalNumberOfItems: "",
      requiredNumberOfItems: "",
      rawMaterialShape: "",
      rawMaterialSize: "",
      rawMaterialWeight: "",
      rawMaterialLength: "",
      numberOfProcesses: "",
    });

    setProcesses([]);
    setDocument(null);
    setShowDocumentWarning(false);

    const fileInput = window.document.getElementById("item-document");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // ================= UPLOAD FROM WARNING =================

  const handleUploadFromWarning = () => {
    setShowDocumentWarning(false);

    setTimeout(() => {
      window.document.getElementById("item-document")?.click();
    }, 100);
  };

  // ================= UI =================

  return (
    <div className="min-h-full p-3 sm:p-4">
      {/* ================= HEADER ================= */}

      <div className="mb-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-lime-600">
          Management / Items
        </p>

        <h1 className="mt-1 text-xl font-bold tracking-tight text-black">
          Items
        </h1>

        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
          Create and manage finished items and their production requirements.
        </p>
      </div>

      {/* ================= MAIN FORM ================= */}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        {/* ================= ITEM INFORMATION ================= */}

        <div className="mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-lime-200 bg-lime-50">
              <span className="text-sm font-bold text-lime-600">+</span>
            </div>

            <div>
              <h2 className="text-sm font-bold text-black">Item Information</h2>

              <p className="text-[10px] font-medium text-slate-500">
                Enter item details and raw material requirements.
              </p>
            </div>
          </div>
        </div>

        {/* ================= BASIC FIELDS ================= */}

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          {/* ================= ITEM NAME ================= */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Item Name
              <span className="ml-1 text-lime-600">*</span>
            </label>

            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              placeholder="Example: Shaft 25mm"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
              required
            />
          </div>

          {/* ================= TOTAL NUMBER OF ITEMS ================= */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Total Number of Items
              <span className="ml-1 text-lime-600">*</span>
            </label>

            <input
              type="number"
              name="totalNumberOfItems"
              value={formData.totalNumberOfItems}
              onChange={handleChange}
              placeholder="Example: 1000"
              min="1"
              step="1"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
              required
            />
          </div>

          {/* ================= REQUIRED NUMBER OF ITEMS ================= */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Required Number of Items
              <span className="ml-1 text-lime-600">*</span>
            </label>

            <input
              type="number"
              name="requiredNumberOfItems"
              value={formData.requiredNumberOfItems}
              onChange={handleChange}
              placeholder="Example: 700"
              min="1"
              step="1"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
              required
            />
          </div>

          {/* ================= RAW MATERIAL SHAPE ================= */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Required Raw Material Shape
              <span className="ml-1 text-lime-600">*</span>
            </label>

            <input
              type="text"
              name="rawMaterialShape"
              value={formData.rawMaterialShape}
              onChange={handleChange}
              placeholder="Round, Square, Sheet"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
              required
            />
          </div>

          {/* ================= RAW MATERIAL SIZE ================= */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Required Raw Material Size
              <span className="ml-1 text-lime-600">*</span>
            </label>

            <input
              type="text"
              name="rawMaterialSize"
              value={formData.rawMaterialSize}
              onChange={handleChange}
              placeholder="Example: 25 mm"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
              required
            />
          </div>

          {/* ================= RAW MATERIAL WEIGHT ================= */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Required Raw Material Weight
              <span className="ml-1 text-lime-600">*</span>
            </label>

            <div className="flex h-9 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition focus-within:border-lime-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-lime-100">
              <input
                type="number"
                name="rawMaterialWeight"
                value={formData.rawMaterialWeight}
                onChange={handleChange}
                placeholder="Example: 50"
                min="0"
                step="any"
                className="min-w-0 flex-1 bg-transparent px-3 text-xs font-medium text-black outline-none placeholder:text-slate-400"
                required
              />

              <div className="flex items-center border-l border-slate-200 bg-white px-2.5 text-[10px] font-bold text-black">
                Kg
              </div>
            </div>
          </div>

          {/* ================= RAW MATERIAL LENGTH ================= */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Required Raw Material Length
              <span className="ml-1 text-lime-600">*</span>
            </label>

            <input
              type="text"
              name="rawMaterialLength"
              value={formData.rawMaterialLength}
              onChange={handleChange}
              placeholder="Example: 1000 mm"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
              required
            />
          </div>

          {/* ================= NUMBER OF PROCESSES ================= */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Number of Processes
              <span className="ml-1 text-lime-600">*</span>
            </label>

            <select
              name="numberOfProcesses"
              value={formData.numberOfProcesses}
              onChange={handleChange}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none transition hover:border-slate-300 hover:bg-white focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
              required
            >
              <option value="">Select processes</option>

              {Array.from({ length: 20 }, (_, index) => index + 1).map(
                (number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        {/* ================= PRODUCTION PROCESSES ================= */}

        {processes.length > 0 && (
          <div className="mt-4">
            <div className="mb-2">
              <h2 className="text-xs font-bold text-black">
                Production Processes
              </h2>

              <p className="text-[10px] font-medium text-slate-500">
                Enter each production process in order.
              </p>
            </div>

            {/* ONE COLUMN */}

            <div className="space-y-2">
              {processes.map((process, index) => (
                <div key={process.id} className="w-full lg:w-1/2">
                  <label className="mb-1 block text-[11px] font-semibold text-black">
                    Process {index + 1}
                    <span className="ml-1 text-lime-600">*</span>
                  </label>

                  <input
                    type="text"
                    value={process.name}
                    onChange={(e) => handleProcessChange(index, e.target.value)}
                    placeholder={`Enter process ${index + 1}`}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= DOCUMENT ================= */}

        <div className="mt-4">
          <div className="mb-1.5">
            <h2 className="text-xs font-bold text-black">Item Document</h2>

            <p className="text-[10px] font-medium text-slate-500">
              Upload drawing, specification or related document.
            </p>
          </div>

          <label
            htmlFor="item-document"
            className="flex min-h-[58px] cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-center transition hover:border-lime-400 hover:bg-lime-50"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime-100">
              <span className="text-sm font-bold text-lime-700">↑</span>
            </div>

            <div className="min-w-0 text-left">
              <p className="truncate text-[11px] font-semibold text-black">
                {document ? document.name : "Click to upload document"}
              </p>

              <p className="mt-0.5 text-[9px] font-medium text-slate-500">
                PDF, DOC, DOCX, JPG or PNG
              </p>
            </div>
          </label>

          <input
            id="item-document"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleDocumentChange}
            className="hidden"
          />

          {document && (
            <div className="mt-1.5 flex items-center justify-between rounded-lg border border-lime-200 bg-lime-50 px-3 py-1.5">
              <p className="min-w-0 truncate text-[10px] font-semibold text-black">
                Selected: {document.name}
              </p>

              <button
                type="button"
                onClick={() => {
                  setDocument(null);

                  const fileInput =
                    window.document.getElementById("item-document");

                  if (fileInput) {
                    fileInput.value = "";
                  }
                }}
                className="ml-3 shrink-0 text-[10px] font-bold text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* ================= SAVE BUTTON ================= */}

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-lime-500 px-5 py-2 text-xs font-bold text-black shadow-sm transition hover:bg-lime-400 hover:shadow-md"
          >
            Save Item
          </button>
        </div>
      </form>

      {/* ================= DOCUMENT WARNING ================= */}

      {showDocumentWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-50">
              <span className="text-lg font-bold text-lime-600">!</span>
            </div>

            <h3 className="mt-4 text-base font-bold text-black">
              Document Not Uploaded
            </h3>

            <p className="mt-2 text-xs font-medium leading-5 text-slate-600">
              You have not selected a document. Do you want to upload a document
              before saving this item?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              {/* SAVE WITHOUT DOCUMENT */}

              <button
                type="button"
                onClick={saveItem}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-slate-50"
              >
                Cancel
              </button>

              {/* UPLOAD DOCUMENT */}

              <button
                type="button"
                onClick={handleUploadFromWarning}
                className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-lime-400"
              >
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
