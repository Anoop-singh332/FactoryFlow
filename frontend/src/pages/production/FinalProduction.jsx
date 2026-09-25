import { useEffect, useMemo, useState } from "react";
import {
  Factory,
  Save,
  RotateCcw,
  ChevronDown,
  RefreshCw,
  Trash2,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function FinalProduction() {
  // ==========================================
  // FORM
  // ==========================================

  const [form, setForm] = useState({
    machineNumber: "",
    itemName: "",
    quantity: "",
    weight: "",
  });

  // ==========================================
  // ITEMS
  // ==========================================

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] =
    useState(false);

  // ==========================================
  // PRODUCTION RECORDS
  // ==========================================

  const [productionRecords, setProductionRecords] =
    useState([]);

  const [loadingProduction, setLoadingProduction] =
    useState(false);

  const [saving, setSaving] = useState(false);

  // ==========================================
  // MESSAGES
  // ==========================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // FETCH PRODUCTION RECORDS
  // ==========================================

  const fetchProductionRecords = async () => {
    try {
      setLoadingProduction(true);

      const token =
        localStorage.getItem(
          "factoryflow_token",
        );

      const response = await fetch(
        `${API_URL}/production`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load production records.",
        );
      }

      const records = Array.isArray(data.data)
        ? [...data.data]
        : [];

      // Newest first
      records.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0),
      );

      setProductionRecords(records);
    } catch (err) {
      console.error(
        "Fetch Production Error:",
        err,
      );

      setError(
        err.message ||
          "Unable to load production records.",
      );
    } finally {
      setLoadingProduction(false);
    }
  };

  // ==========================================
  // LOAD PRODUCTION RECORDS
  // ==========================================

  useEffect(() => {
    fetchProductionRecords();
  }, []);

  // ==========================================
  // LOAD ITEMS FROM ITEMS PAGE
  // ==========================================

  useEffect(() => {
    const loadItems = () => {
      try {
        setLoadingItems(true);

        const savedItems = JSON.parse(
          localStorage.getItem(
            "factoryflow_items",
          ) || "[]",
        );

        const validItems =
          savedItems.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              (
                item.itemName ||
                item.finalItemName
              ),
          );

        setItems(validItems);
      } catch (err) {
        console.error(
          "Load Items Error:",
          err,
        );

        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    loadItems();
  }, []);

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    // ========================================
    // MACHINE NUMBER
    // ========================================

    if (name === "machineNumber") {
      setForm((previous) => ({
        ...previous,
        machineNumber: value,
      }));

      setMessage("");
      setError("");

      return;
    }

    // ========================================
    // ITEM NAME
    // ========================================

    if (name === "itemName") {
      const selectedItem =
        items.find((item) => {
          const itemName =
            item.itemName ||
            item.finalItemName ||
            item.name ||
            "";

          return itemName === value;
        });

      // Get required number of items
      const quantity =
        selectedItem?.requiredNumberOfItems ??
        selectedItem?.requiredQuantity ??
        "";

      // Get raw material weight
      let weight =
        selectedItem?.rawMaterialWeight ??
        "";

      // Remove Kg if already present
      if (
        typeof weight === "string"
      ) {
        weight = weight
          .replace(
            /\s*Kg\s*$/i,
            "",
          )
          .trim();
      }

      setForm((previous) => ({
        ...previous,
        itemName: value,
        quantity: quantity,
        weight: weight,
      }));

      setMessage("");
      setError("");

      return;
    }
  };

  // ==========================================
  // RESET
  // ==========================================

  const resetForm = () => {
    setForm({
      machineNumber: "",
      itemName: "",
      quantity: "",
      weight: "",
    });

    setMessage("");
    setError("");
  };

  // ==========================================
  // SAVE FINAL PRODUCTION
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // Machine number
    if (
      !form.machineNumber.trim()
    ) {
      setError(
        "Please enter a machine number.",
      );
      return;
    }

    // Item
    if (!form.itemName) {
      setError(
        "Please select an item name.",
      );
      return;
    }

    // Quantity
    if (
      !form.quantity ||
      Number(form.quantity) <= 0
    ) {
      setError(
        "Quantity could not be loaded from the selected item.",
      );
      return;
    }

    // Weight
    if (
      !form.weight ||
      Number(form.weight) <= 0
    ) {
      setError(
        "Weight could not be loaded from the selected item.",
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem(
          "factoryflow_token",
        );

      const response = await fetch(
        `${API_URL}/production`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            machineNumber:
              form.machineNumber.trim(),

            itemName:
              form.itemName,

            productionCount:
              Number(form.quantity),

            weight:
              Number(form.weight),
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save final production.",
        );
      }

      setMessage(
        "Final production saved successfully.",
      );

      resetForm();

      await fetchProductionRecords();
    } catch (err) {
      console.error(
        "Final Production Error:",
        err,
      );

      setError(
        err.message ||
          "Unable to save final production.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE PRODUCTION
  // ==========================================

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this production record?",
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const token =
        localStorage.getItem(
          "factoryflow_token",
        );

      const response = await fetch(
        `${API_URL}/production/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete production record.",
        );
      }

      setMessage(
        "Production record deleted successfully.",
      );

      await fetchProductionRecords();
    } catch (err) {
      console.error(
        "Delete Production Error:",
        err,
      );

      setError(
        err.message ||
          "Unable to delete production record.",
      );
    }
  };

  // ==========================================
  // ITEM PLACEHOLDER
  // ==========================================

  const itemPlaceholder =
    useMemo(() => {
      if (loadingItems) {
        return "Loading items...";
      }

      if (items.length === 0) {
        return "No items available";
      }

      return "Select item name";
    }, [
      loadingItems,
      items,
    ]);

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(
        date,
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      );
    } catch {
      return "-";
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mx-auto w-full max-w-[1200px]">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <PageHeader
        eyebrow="Production Management"
        title="Final Production"
        description="Enter the machine number and select an item. Quantity and weight will be filled automatically."
      />

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {message && (
        <div className="mb-4 rounded-xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-semibold text-lime-700">
          {message}
        </div>
      )}

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* ======================================
          FORM CARD
      ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        {/* FORM HEADER */}

        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-200 bg-lime-50">
            <Factory className="h-5 w-5 text-lime-600" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              Final Production Entry
            </h2>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Enter machine number manually and
              select the item.
            </p>
          </div>

        </div>

        {/* ======================================
            FORM
        ====================================== */}

        <form onSubmit={handleSubmit}>

          <div className="grid gap-4 md:grid-cols-2">

            {/* ==================================
                MACHINE NUMBER
            ================================== */}

            <div>

              <label className="mb-1.5 block text-sm font-semibold text-black">
                Machine Number
                <span className="ml-1 text-lime-600">
                  *
                </span>
              </label>

              <input
                type="text"
                name="machineNumber"
                value={
                  form.machineNumber
                }
                onChange={
                  handleChange
                }
                placeholder="Enter machine number"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              />

              <p className="mt-1 text-[10px] font-medium text-slate-400">
                Enter machine number manually.
              </p>

            </div>

            {/* ==================================
                ITEM NAME
            ================================== */}

            <div>

              <label className="mb-1.5 block text-sm font-semibold text-black">
                Item Name
                <span className="ml-1 text-lime-600">
                  *
                </span>
              </label>

              <div className="relative">

                <select
                  name="itemName"
                  value={
                    form.itemName
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loadingItems ||
                    items.length === 0
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-black outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >

                  <option value="">
                    {
                      itemPlaceholder
                    }
                  </option>

                  {items.map(
                    (
                      item,
                      index,
                    ) => {
                      const itemName =
                        item.itemName ||
                        item.finalItemName ||
                        item.name ||
                        "";

                      return (
                        <option
                          key={`${itemName}-${index}`}
                          value={
                            itemName
                          }
                        >
                          {
                            itemName
                          }
                        </option>
                      );
                    },
                  )}

                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              </div>

            </div>

            {/* ==================================
                QUANTITY
            ================================== */}

            <div>

              <label className="mb-1.5 block text-sm font-semibold text-black">
                Required Number of Items
                <span className="ml-1 text-lime-600">
                  *
                </span>
              </label>

              <input
                type="number"
                name="quantity"
                value={
                  form.quantity
                }
                readOnly
                placeholder="Automatically filled"
                className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-black outline-none placeholder:text-slate-400"
              />

              <p className="mt-1 text-[10px] font-medium text-slate-400">
                Automatically taken from Items.
              </p>

            </div>

            {/* ==================================
                WEIGHT
            ================================== */}

            <div>

              <label className="mb-1.5 block text-sm font-semibold text-black">
                Weight
                <span className="ml-1 text-lime-600">
                  *
                </span>
              </label>

              <div className="flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

                <input
                  type="number"
                  name="weight"
                  value={
                    form.weight
                  }
                  readOnly
                  placeholder="Automatically filled"
                  className="min-w-0 flex-1 cursor-not-allowed bg-transparent px-4 text-sm font-medium text-black outline-none placeholder:text-slate-400"
                />

                <span className="flex items-center border-l border-slate-200 bg-white px-4 text-sm font-bold text-black">
                  Kg
                </span>

              </div>

              <p className="mt-1 text-[10px] font-medium text-slate-400">
                Automatically taken from Items.
              </p>

            </div>

          </div>

          {/* ======================================
              BUTTONS
          ====================================== */}

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={
                resetForm
              }
              disabled={
                saving
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="submit"
              disabled={
                saving
              }
              className="flex items-center gap-2 rounded-xl bg-lime-500 px-5 py-2.5 text-sm font-bold text-black shadow-sm transition hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />

              {saving
                ? "Saving..."
                : "Save Final Production"}
            </button>

          </div>

        </form>

      </div>

      {/* ======================================
          PRODUCTION TABLE
      ====================================== */}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

          <div>
            <h2 className="text-base font-bold text-black">
              Production Records
            </h2>

            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              Recently added production data
            </p>
          </div>

          <button
            type="button"
            onClick={
              fetchProductionRecords
            }
            disabled={
              loadingProduction
            }
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-black transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                loadingProduction
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>

        </div>

        {/* SCROLLABLE TABLE */}

        <div className="max-h-[280px] overflow-y-auto overflow-x-auto">

          <table className="w-full min-w-[700px] border-collapse">

            <thead className="sticky top-0 z-10">

              <tr className="border-b border-slate-200 bg-slate-100">

                <th className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  #
                </th>

                <th className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Machine
                </th>

                <th className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Item
                </th>

                <th className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Quantity
                </th>

                <th className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Weight
                </th>

                <th className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Date & Time
                </th>

                <th className="whitespace-nowrap px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {loadingProduction ? (

                <tr>

                  <td
                    colSpan="7"
                    className="px-3 py-8 text-center"
                  >
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin text-lime-500" />

                    <p className="mt-2 text-[11px] font-semibold text-slate-500">
                      Loading...
                    </p>
                  </td>

                </tr>

              ) : productionRecords.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="px-3 py-8 text-center"
                  >
                    <Factory className="mx-auto h-5 w-5 text-slate-300" />

                    <p className="mt-2 text-xs font-bold text-slate-600">
                      No production records yet
                    </p>
                  </td>

                </tr>

              ) : (

                productionRecords.map(
                  (
                    record,
                    index,
                  ) => (

                    <tr
                      key={
                        record._id ||
                        index
                      }
                      className="border-b border-slate-100 transition hover:bg-lime-50/40"
                    >

                      {/* NUMBER */}

                      <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">
                        {index + 1}
                      </td>

                      {/* MACHINE */}

                      <td className="px-3 py-2.5">

                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-black">
                          {
                            record.machineNumber ||
                            "-"
                          }
                        </span>

                      </td>

                      {/* ITEM */}

                      <td className="max-w-[180px] px-3 py-2.5">

                        <p className="truncate text-[11px] font-bold text-black">
                          {
                            record.itemName ||
                            "-"
                          }
                        </p>

                      </td>

                      {/* QUANTITY */}

                      <td className="px-3 py-2.5">

                        <span className="text-[11px] font-bold text-lime-700">
                          {
                            record.productionCount ??
                            record.quantity ??
                            "-"
                          }
                        </span>

                        <span className="ml-1 text-[10px] text-slate-400">
                          pcs
                        </span>

                      </td>

                      {/* WEIGHT */}

                      <td className="px-3 py-2.5">

                        <span className="text-[11px] font-bold text-black">
                          {
                            record.weight ??
                            "-"
                          }
                        </span>

                        {record.weight !==
                          undefined &&
                          record.weight !==
                            null &&
                          record.weight !==
                            "" && (
                            <span className="ml-1 text-[10px] text-slate-400">
                              Kg
                            </span>
                          )}

                      </td>

                      {/* DATE */}

                      <td className="whitespace-nowrap px-3 py-2.5">

                        <span className="text-[10px] font-medium text-slate-500">
                          {
                            formatDate(
                              record.createdAt,
                            )
                          }
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-3 py-2.5 text-center">

                        {record._id ? (

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                record._id,
                              )
                            }
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                        ) : (

                          <span className="text-xs text-slate-400">
                            -
                          </span>

                        )}

                      </td>

                    </tr>

                  ),
                )

              )}

            </tbody>

          </table>

        </div>

        {/* TABLE FOOTER */}

        <div className="border-t border-slate-100 px-4 py-2">

          <p className="text-[10px] font-medium text-slate-400">
            Total records:{" "}

            <span className="font-bold text-slate-600">
              {
                productionRecords.length
              }
            </span>

            {" "}• Scroll inside the table to view more
          </p>

        </div>

      </div>

    </div>
  );
}

export default FinalProduction;