import React, { useEffect, useState } from "react";
import { showSuccess, showError } from "../../utils/sweetAlert";

const OPERATIONS_STORAGE_KEY = "factoryflow_operations";
const ITEMS_STORAGE_KEY = "factoryflow_items";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const emptyForm = {
  itemName: "",
  totalNumberOfItems: "",
  requiredNumberOfItems: "",
  rawMaterialShape: "",
  rawMaterialSize: "",
  rawMaterialWeight: "",
  rawMaterialLength: "",
  numberOfProcesses: "",
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeName = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/aluminium/g, "aluminum")
    .replace(/[\s_-]+/g, "");
};

const getItemName = (record) => {
  return (
    record?.materialItemName ||
    record?.itemName ||
    record?.finalItemName ||
    record?.name ||
    ""
  ).trim();
};

const getMaterialWeight = (record) => {
  const value = String(record?.materialWeight || "")
    .replace(/,/g, "")
    .match(/-?\d+(?:\.\d+)?/);

  const weight = value ? Number(value[0]) : 0;

  return Number.isFinite(weight) && weight > 0 ? weight : 0;
};

/* =========================================================
   COMPONENT
========================================================= */

const Items = () => {
  const [formData, setFormData] = useState({
    ...emptyForm,
  });

  const [inwardItems, setInwardItems] = useState([]);
  const [loadingInwardItems, setLoadingInwardItems] =
    useState(true);

  const [operations, setOperations] = useState([]);
  const [processes, setProcesses] = useState([]);

  const [document, setDocument] = useState(null);
  const [showDocumentWarning, setShowDocumentWarning] =
    useState(false);

  /* =======================================================
     LOAD OPERATIONS
  ======================================================= */

  const loadOperations = () => {
    try {
      const savedOperations = JSON.parse(
        localStorage.getItem(OPERATIONS_STORAGE_KEY) || "[]",
      );

      setOperations(
        Array.isArray(savedOperations)
          ? savedOperations
          : [],
      );
    } catch (error) {
      console.error("Load operations error:", error);
      setOperations([]);
    }
  };

  /* =======================================================
     LOAD INWARD SUPPLY

     Example:

     RV Bush   408 Kg
     RV Bush   318.2 Kg
     RV Bush   319.6 Kg

     Total = 1045.8
  ======================================================= */

  const loadInwardItems = async () => {
    try {
      setLoadingInwardItems(true);

      const token = localStorage.getItem(
        "factoryflow_token",
      );

      if (!token) {
        throw new Error(
          "Login session expired. Please login again.",
        );
      }

      const response = await fetch(
        `${API_URL}/inward`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load inward records.",
        );
      }

      const records = Array.isArray(data?.data)
        ? data.data
        : [];

      const itemsMap = new Map();

      records.forEach((record) => {
        const itemName = getItemName(record);

        if (!itemName) {
          return;
        }

        const key = normalizeName(itemName);

        if (!key) {
          return;
        }

        // For now, Total Number of Items means total material weight in Kg.
        // We intentionally do NOT use numberOfItems from the backend here.
        const totalKg = getMaterialWeight(record);

        /* ================================================
           FIRST RECORD
        ================================================= */

        if (!itemsMap.has(key)) {
          itemsMap.set(key, {
            key,
            itemName,

            totalNumberOfItems: totalKg,
            totalMaterialWeight: totalKg,

            materialType:
              record?.materialType || "",

            materialSize:
              record?.materialSize || "",

            materialWeight:
              record?.materialWeight || "",

            createdAt:
              record?.createdAt || "",

            inwardRecord: record,
          });

          return;
        }

        /* ================================================
           SAME ITEM AGAIN

           ADD QUANTITY
        ================================================= */

        const existing = itemsMap.get(key);

        existing.totalNumberOfItems += totalKg;
        existing.totalMaterialWeight += totalKg;

        /* ================================================
           KEEP LATEST MATERIAL INFORMATION
        ================================================= */

        const oldDate = existing.createdAt
          ? new Date(existing.createdAt).getTime()
          : 0;

        const newDate = record?.createdAt
          ? new Date(record.createdAt).getTime()
          : 0;

        if (newDate >= oldDate) {
          existing.itemName = itemName;

          existing.materialType =
            record?.materialType ||
            existing.materialType ||
            "";

          existing.materialSize =
            record?.materialSize ||
            existing.materialSize ||
            "";

          existing.materialWeight =
            record?.materialWeight ||
            existing.materialWeight ||
            "";

          existing.createdAt =
            record?.createdAt ||
            existing.createdAt ||
            "";

          existing.inwardRecord = record;
        }
      });

      setInwardItems(
        Array.from(itemsMap.values()),
      );
    } catch (error) {
      console.error(
        "Load inward items error:",
        error,
      );

      setInwardItems([]);

      showError(
        "Unable to Load Items",
        error.message ||
          "Could not load items from Inward Supply.",
      );
    } finally {
      setLoadingInwardItems(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadOperations();
    loadInwardItems();
  }, []);

  /* =======================================================
     REFRESH WHEN PAGE GETS FOCUS
  ======================================================= */

  useEffect(() => {
    const handleFocus = () => {
      loadOperations();
      loadInwardItems();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus,
      );
    };
  }, []);

  /* =======================================================
     BASIC FORM CHANGE
  ======================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    /* =====================================================
       TOTAL NUMBER OF ITEMS IS AUTOMATIC

       NEVER allow manual editing.
    ===================================================== */

    if (name === "totalNumberOfItems") {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    /* =====================================================
       NUMBER OF PROCESSES
    ===================================================== */

    if (name === "numberOfProcesses") {
      const count = Number(value);

      setProcesses(
        Array.from(
          {
            length:
              Number.isFinite(count) && count > 0
                ? count
                : 0,
          },
          (_, index) => ({
            id: index + 1,
            name: "",
            parameters: [],
          }),
        ),
      );
    }
  };

  /* =======================================================
     ITEM CHANGE

     VERY IMPORTANT:

     When user selects an item:

     TOTAL = automatic

     REQUIRED = ALWAYS EMPTY

     REQUIRED IS NEVER COPIED FROM ANYWHERE.
  ======================================================= */

  const handleItemChange = (e) => {
    const selectedKey = e.target.value;

    const selectedItem = inwardItems.find(
      (item) => item.key === selectedKey,
    );

    /* =====================================================
       NO ITEM
    ===================================================== */

    if (!selectedItem) {
      setFormData({
        ...emptyForm,
      });

      setProcesses([]);

      return;
    }

    /* =====================================================
       ITEM SELECTED
    ===================================================== */

    setFormData((previous) => ({
      ...previous,

      /* ================================================
         ITEM NAME
      ================================================= */

      itemName: selectedItem.itemName,

      /* ================================================
         TOTAL NUMBER OF ITEMS

         AUTOMATIC FROM INWARD
      ================================================= */

      totalNumberOfItems:
        selectedItem.totalNumberOfItems,

      /* ================================================
         IMPORTANT

         REQUIRED NUMBER OF ITEMS
         MUST ALWAYS BE EMPTY.
      ================================================= */

      requiredNumberOfItems: "",

      /* ================================================
         MATERIAL TYPE
      ================================================= */

      rawMaterialShape:
        selectedItem.materialType || "",

      /* ================================================
         MATERIAL SIZE
      ================================================= */

      rawMaterialSize:
        selectedItem.materialSize || "",

      /* ================================================
         MATERIAL WEIGHT
      ================================================= */

      rawMaterialWeight: String(
        selectedItem.totalMaterialWeight ??
          selectedItem.totalNumberOfItems ??
          "",
      ),
    }));

    /*
     * Reset processes when changing item.
     */
    setProcesses([]);

    /*
     * IMPORTANT:
     * We are NOT setting:
     *
     * requiredNumberOfItems
     *
     * from localStorage.
     *
     * It stays empty.
     */
  };

  /* =======================================================
     PROCESS CHANGE
  ======================================================= */

  const handleProcessChange = (
    index,
    value,
  ) => {
    const selectedOperation =
      operations.find(
        (operation) =>
          operation.operationName === value,
      );

    const parameters =
      Array.isArray(
        selectedOperation?.parameters,
      )
        ? selectedOperation.parameters
            .filter(
              (parameter) =>
                typeof parameter ===
                  "string" &&
                parameter.trim() !== "",
            )
            .map((parameter) => ({
              name: parameter.trim(),
              value: "",
            }))
        : [];

    setProcesses((previous) =>
      previous.map(
        (process, processIndex) =>
          processIndex === index
            ? {
                ...process,
                name: value,
                parameters,
              }
            : process,
      ),
    );
  };

  /* =======================================================
     PARAMETER CHANGE
  ======================================================= */

  const handleParameterChange = (
    processIndex,
    parameterIndex,
    value,
  ) => {
    setProcesses((previous) =>
      previous.map(
        (process, currentProcessIndex) => {
          if (
            currentProcessIndex !==
            processIndex
          ) {
            return process;
          }

          return {
            ...process,

            parameters:
              process.parameters.map(
                (
                  parameter,
                  currentParameterIndex,
                ) =>
                  currentParameterIndex ===
                  parameterIndex
                    ? {
                        ...parameter,
                        value,
                      }
                    : parameter,
              ),
          };
        },
      ),
    );
  };

  /* =======================================================
     DOCUMENT
  ======================================================= */

  const handleDocumentChange = (e) => {
    const file =
      e.target.files?.[0] || null;

    setDocument(file);
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    const total = Number(
      formData.totalNumberOfItems,
    );

    const required = Number(
      formData.requiredNumberOfItems,
    );

    /* =====================================================
       ITEM REQUIRED
    ===================================================== */

    if (!formData.itemName) {
      showError(
        "Item Required",
        "Please select an item.",
      );

      return;
    }

    /* =====================================================
       TOTAL REQUIRED
    ===================================================== */

    if (
      !Number.isFinite(total) ||
      total <= 0
    ) {
      showError(
        "No Inward Material",
        "This item does not have any material weight in Inward Supply.",
      );

      return;
    }

    /* =====================================================
       REQUIRED NUMBER MUST BE MANUAL
    ===================================================== */

    if (
      !Number.isInteger(required) ||
      required <= 0
    ) {
      showError(
        "Required Quantity",
        "Please enter the Required Number of Items.",
      );

      return;
    }

    /* =====================================================
       DOCUMENT
    ===================================================== */

    if (!document) {
      setShowDocumentWarning(true);
      return;
    }

    saveItem();
  };

  /* =======================================================
     SAVE ITEM
  ======================================================= */

  const saveItem = () => {
    const itemData = {
      ...formData,

      totalNumberOfItems: Number(
        formData.totalNumberOfItems,
      ),

      requiredNumberOfItems: Number(
        formData.requiredNumberOfItems,
      ),

      processes: processes.map(
        (process) => ({
          id: process.id,
          name: process.name,
          parameters:
            Array.isArray(
              process.parameters,
            )
              ? process.parameters.map(
                  (parameter) => ({
                    name:
                      parameter.name,
                    value:
                      parameter.value,
                  }),
                )
              : [],
        }),
      ),

      documentName: document
        ? document.name
        : null,

      normalizedItemName:
        normalizeName(
          formData.itemName,
        ),

      createdAt:
        new Date().toISOString(),
    };

    let existingItems = [];

    try {
      existingItems = JSON.parse(
        localStorage.getItem(
          ITEMS_STORAGE_KEY,
        ) || "[]",
      );

      if (
        !Array.isArray(
          existingItems,
        )
      ) {
        existingItems = [];
      }
    } catch {
      existingItems = [];
    }

    const normalizedName =
      normalizeName(
        formData.itemName,
      );

    const existingIndex =
      existingItems.findIndex(
        (item) => {
          const existingName =
            item?.itemName ||
            item?.finalItemName ||
            item?.name ||
            "";

          return (
            normalizeName(
              existingName,
            ) === normalizedName
          );
        },
      );

    let updatedItems;

    if (existingIndex !== -1) {
      updatedItems =
        existingItems.map(
          (item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  ...itemData,
                }
              : item,
        );
    } else {
      updatedItems = [
        ...existingItems,
        itemData,
      ];
    }

    localStorage.setItem(
      ITEMS_STORAGE_KEY,
      JSON.stringify(
        updatedItems,
      ),
    );

    showSuccess(
      "Item Saved",
      existingIndex !== -1
        ? "Item updated successfully."
        : "Item saved successfully.",
    );

    /* =====================================================
       RESET

       THIS ALSO CLEARS REQUIRED FIELD.
    ===================================================== */

    setFormData({
      ...emptyForm,
    });

    setProcesses([]);
    setDocument(null);
    setShowDocumentWarning(false);

    const fileInput =
      window.document.getElementById(
        "item-document",
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  /* =======================================================
     UPLOAD DOCUMENT FROM WARNING
  ======================================================= */

  const handleUploadFromWarning = () => {
    setShowDocumentWarning(false);

    setTimeout(() => {
      window.document
        .getElementById(
          "item-document",
        )
        ?.click();
    }, 100);
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-full p-3 sm:p-4">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="mb-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-lime-600">
          Management / Items
        </p>

        <h1 className="mt-1 text-xl font-bold tracking-tight text-black">
          Items
        </h1>

        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
          Create and manage finished
          items and their production
          requirements.
        </p>
      </div>

      {/* ===================================================
          FORM
      =================================================== */}

      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >

        {/* =================================================
            FORM TITLE
        ================================================= */}

        <div className="mb-3">
          <div className="flex items-center gap-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-lime-200 bg-lime-50">
              <span className="text-sm font-bold text-lime-600">
                +
              </span>
            </div>

            <div>
              <h2 className="text-sm font-bold text-black">
                Item Information
              </h2>

              <p className="text-[10px] font-medium text-slate-500">
                Item information is
                automatically taken from
                Inward Supply.
              </p>
            </div>

          </div>
        </div>

        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">

          {/* ITEM NAME */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Item Name
              <span className="ml-1 text-lime-600">
                *
              </span>
            </label>

            <select
              value={
                inwardItems.find(
                  (item) =>
                    normalizeName(
                      item.itemName,
                    ) ===
                    normalizeName(
                      formData.itemName,
                    ),
                )?.key || ""
              }
              onChange={
                handleItemChange
              }
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            >
              <option value="">
                {loadingInwardItems
                  ? "Loading items..."
                  : inwardItems.length ===
                      0
                    ? "No inward items"
                    : "Select Item"}
              </option>

              {inwardItems.map(
                (item) => (
                  <option
                    key={item.key}
                    value={item.key}
                  >
                    {item.itemName}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* TOTAL ITEMS */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Total Number of Items
              <span className="ml-1 text-lime-600">
                *
              </span>
            </label>

            <input
              type="number"
              name="totalNumberOfItems"
              value={
                formData.totalNumberOfItems
              }
              readOnly
              tabIndex={-1}
              placeholder="Select item"
              className="h-9 w-full cursor-not-allowed rounded-lg border border-lime-200 bg-lime-50 px-3 text-xs font-bold text-black outline-none"
            />

            <p className="mt-1 text-[9px] font-medium text-slate-500">
              Automatically calculated as total material
              weight from Inward Supply (Kg).
            </p>
          </div>

          {/* REQUIRED ITEMS */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Required Number of Items
              <span className="ml-1 text-lime-600">
                *
              </span>
            </label>

            <input
              type="number"
              name="requiredNumberOfItems"
              value={
                formData.requiredNumberOfItems
              }
              onChange={
                handleChange
              }
              min="1"
              step="1"
              placeholder="Example: 700"
              autoComplete="off"
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            />

            <p className="mt-1 text-[9px] font-medium text-slate-500">
              Enter this manually.
            </p>
          </div>

          {/* RAW MATERIAL SHAPE */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Required Raw Material Shape
              <span className="ml-1 text-lime-600">
                *
              </span>
            </label>

            <input
              type="text"
              name="rawMaterialShape"
              value={
                formData.rawMaterialShape
              }
              onChange={
                handleChange
              }
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            />
          </div>

          {/* RAW MATERIAL SIZE */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Required Raw Material Size
              <span className="ml-1 text-lime-600">
                *
              </span>
            </label>

            <input
              type="text"
              name="rawMaterialSize"
              value={
                formData.rawMaterialSize
              }
              onChange={
                handleChange
              }
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            />
          </div>

          {/* RAW MATERIAL WEIGHT */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Required Raw Material Weight
              <span className="ml-1 text-lime-600">
                *
              </span>
            </label>

            <div className="flex h-9 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">

              <input
                type="number"
                name="rawMaterialWeight"
                value={
                  formData.rawMaterialWeight
                }
                onChange={
                  handleChange
                }
                min="0"
                step="any"
                required
                className="min-w-0 flex-1 bg-transparent px-3 text-xs font-medium text-black outline-none"
              />

              <div className="flex items-center border-l border-slate-200 bg-white px-2.5 text-[10px] font-bold">
                Kg
              </div>

            </div>
          </div>

          {/* LENGTH */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Required Raw Material Length
              <span className="ml-1 text-lime-600">
                *
              </span>
            </label>

            <input
              type="text"
              name="rawMaterialLength"
              value={
                formData.rawMaterialLength
              }
              onChange={
                handleChange
              }
              placeholder="Example: 1000 mm"
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            />
          </div>

          {/* NUMBER OF PROCESSES */}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-black">
              Number of Processes
              <span className="ml-1 text-lime-600">
                *
              </span>
            </label>

            <select
              name="numberOfProcesses"
              value={
                formData.numberOfProcesses
              }
              onChange={
                handleChange
              }
              required
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-black outline-none focus:border-lime-500 focus:bg-white focus:ring-2 focus:ring-lime-100"
            >
              <option value="">
                Select processes
              </option>

              {Array.from(
                { length: 20 },
                (_, index) =>
                  index + 1,
              ).map(
                (number) => (
                  <option
                    key={number}
                    value={number}
                  >
                    {number}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        {/* =================================================
            PROCESSES
        ================================================= */}

        {processes.length > 0 && (
          <div className="mt-4">

            <div className="mb-2">
              <h2 className="text-xs font-bold text-black">
                Production Processes
              </h2>

              <p className="text-[10px] text-slate-500">
                Select operations and
                enter their parameters.
              </p>
            </div>

            <div className="space-y-2">

              {processes.map(
                (
                  process,
                  index,
                ) => (
                  <div
                    key={process.id}
                    className="flex flex-col gap-2 lg:flex-row lg:items-end"
                  >

                    <div className="w-full lg:w-[260px]">
                      <label className="mb-1 block text-[11px] font-semibold">
                        Process{" "}
                        {index + 1}
                      </label>

                      <select
                        value={
                          process.name
                        }
                        onChange={(e) =>
                          handleProcessChange(
                            index,
                            e.target
                              .value,
                          )
                        }
                        required
                        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-lime-500"
                      >
                        <option value="">
                          Select Operation
                        </option>

                        {operations.map(
                          (
                            operation,
                          ) => (
                            <option
                              key={
                                operation.id
                              }
                              value={
                                operation.operationName
                              }
                            >
                              {
                                operation.operationName
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {process.parameters?.map(
                      (
                        parameter,
                        parameterIndex,
                      ) => (
                        <div
                          key={
                            parameterIndex
                          }
                          className="flex-1"
                        >
                          <label className="mb-1 block text-[9px] font-bold text-slate-600">
                            {
                              parameter.name
                            }
                          </label>

                          <input
                            type="text"
                            value={
                              parameter.value
                            }
                            onChange={(
                              e,
                            ) =>
                              handleParameterChange(
                                index,
                                parameterIndex,
                                e.target
                                  .value,
                              )
                            }
                            placeholder={`Enter ${parameter.name}`}
                            className="h-9 w-full rounded-lg border border-lime-200 bg-lime-50 px-3 text-xs outline-none focus:border-lime-500"
                          />
                        </div>
                      ),
                    )}

                  </div>
                ),
              )}

            </div>
          </div>
        )}

        {/* =================================================
            DOCUMENT
        ================================================= */}

        <div className="mt-4">

          <div className="mb-1.5">
            <h2 className="text-xs font-bold text-black">
              Item Document
            </h2>

            <p className="text-[10px] text-slate-500">
              Upload drawing,
              specification or related
              document.
            </p>
          </div>

          <label
            htmlFor="item-document"
            className="flex min-h-[58px] cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 hover:border-lime-400 hover:bg-lime-50"
          >

            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-100">
              <span className="font-bold text-lime-700">
                ↑
              </span>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-black">
                {document
                  ? document.name
                  : "Click to upload document"}
              </p>

              <p className="text-[9px] text-slate-500">
                PDF, DOC, DOCX, JPG
                or PNG
              </p>
            </div>

          </label>

          <input
            id="item-document"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={
              handleDocumentChange
            }
            className="hidden"
          />

          {document && (
            <div className="mt-1.5 flex items-center justify-between rounded-lg border border-lime-200 bg-lime-50 px-3 py-1.5">

              <p className="truncate text-[10px] font-semibold">
                {document.name}
              </p>

              <button
                type="button"
                onClick={() => {
                  setDocument(null);

                  const input =
                    window.document.getElementById(
                      "item-document",
                    );

                  if (input) {
                    input.value = "";
                  }
                }}
                className="ml-3 text-[10px] font-bold text-red-500"
              >
                Remove
              </button>

            </div>
          )}
        </div>

        {/* =================================================
            SAVE
        ================================================= */}

        <div className="mt-4 flex justify-end">

          <button
            type="submit"
            className="rounded-lg bg-lime-500 px-5 py-2 text-xs font-bold text-black shadow-sm hover:bg-lime-400"
          >
            Save Item
          </button>

        </div>

      </form>

      {/* ===================================================
          DOCUMENT WARNING
      =================================================== */}

      {showDocumentWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-50">
              <span className="font-bold text-lime-600">
                !
              </span>
            </div>

            <h3 className="mt-4 text-base font-bold">
              Document Not Uploaded
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              You have not selected a
              document. Do you want
              to upload one before
              saving?
            </p>

            <div className="mt-5 flex justify-end gap-2">

              <button
                type="button"
                onClick={() => {
                  setShowDocumentWarning(
                    false,
                  );

                  saveItem();
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold"
              >
                Save Without Document
              </button>

              <button
                type="button"
                onClick={
                  handleUploadFromWarning
                }
                className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-bold"
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