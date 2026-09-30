import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ClipboardList,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import {
  showSuccess,
  confirmDelete,
} from "../utils/sweetAlert";


const OPERATION_STORAGE_KEY =
  "factoryflow_operations";


const emptyForm = {
  operationName: "",
  machineType: "",
  operationTime: "",
  consumables: "",
  revenue: "",
  numberOfParameters: "",
};


function Operations() {

  const [view, setView] = useState("main");

  const [formData, setFormData] =
    useState(emptyForm);

  const [parameters, setParameters] =
    useState([]);

  const [operations, setOperations] =
    useState([]);


  /* =====================================================
     LOAD OPERATIONS
  ===================================================== */

  useEffect(() => {

    try {

      const savedOperations =
        JSON.parse(
          localStorage.getItem(
            OPERATION_STORAGE_KEY
          ) || "[]"
        );

      if (Array.isArray(savedOperations)) {
        setOperations(savedOperations);
      } else {
        setOperations([]);
      }

    } catch (error) {

      console.error(
        "Failed to load operations:",
        error
      );

      setOperations([]);

    }

  }, []);


  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));


    /* =================================================
       CREATE PARAMETER FIELDS
    ================================================= */

    if (name === "numberOfParameters") {

      const count = Number(value);


      setParameters(
        Array.from(
          {
            length: count,
          },
          (_, index) => ({
            id: index + 1,
            name: "",
          })
        )
      );

    }

  };


  /* =====================================================
     PARAMETER CHANGE
  ===================================================== */

  const handleParameterChange = (
    index,
    value
  ) => {

    setParameters((previous) =>
      previous.map(
        (
          parameter,
          parameterIndex
        ) =>
          parameterIndex === index
            ? {
                ...parameter,
                name: value,
              }
            : parameter
      )
    );

  };


  /* =====================================================
     SAVE OPERATION

     NO FIELD IS REQUIRED
  ===================================================== */

  const handleSave = () => {

    const newOperation = {

      id:
        `operation-${Date.now()}`,

      operationName:
        formData.operationName.trim(),

      machineType:
        formData.machineType.trim(),

      operationTime:
        formData.operationTime.trim(),

      consumables:
        formData.consumables.trim(),

      revenue:
        formData.revenue === ""
          ? ""
          : Number(formData.revenue),

      parameters:
        parameters
          .map(
            (parameter) =>
              parameter.name.trim()
          )
          .filter(
            (parameter) =>
              parameter !== ""
          ),

      createdAt:
        new Date().toISOString(),

    };


    const updatedOperations = [
      ...operations,
      newOperation,
    ];


    localStorage.setItem(
      OPERATION_STORAGE_KEY,
      JSON.stringify(
        updatedOperations
      )
    );


    setOperations(
      updatedOperations
    );


    showSuccess(
      "Operation Added",
      "Operation added successfully."
    );


    setFormData(
      emptyForm
    );

    setParameters([]);

    setView("main");

  };


  /* =====================================================
     DELETE OPERATION
  ===================================================== */

  const handleDelete = async (
    operationId
  ) => {

    const confirmed =
      await confirmDelete(
        "Delete Operation?",
        "Are you sure you want to delete this operation?"
      );


    if (!confirmed) {
      return;
    }


    const updatedOperations =
      operations.filter(
        (operation) =>
          operation.id !==
          operationId
      );


    localStorage.setItem(
      OPERATION_STORAGE_KEY,
      JSON.stringify(
        updatedOperations
      )
    );


    setOperations(
      updatedOperations
    );


    showSuccess(
      "Deleted",
      "Operation deleted successfully."
    );

  };


  /* =====================================================
     BACK
  ===================================================== */

  const handleBack = () => {

    setView("main");

    setFormData(
      emptyForm
    );

    setParameters([]);

  };


  /* =====================================================
     MAIN SCREEN
  ===================================================== */

  if (view === "main") {

    return (

      <div className="space-y-5">

        <div>

          <div className="mb-1 flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-50">

              <ClipboardList className="h-4 w-4 text-lime-600" />

            </div>


            <span className="text-xs font-bold uppercase tracking-[0.16em] text-lime-600">
              Master
            </span>

          </div>


          <h1 className="text-2xl font-bold tracking-tight text-black">
            Operations
          </h1>


          <p className="mt-1 text-sm text-slate-500">
            Manage your operations.
          </p>

        </div>


        <div className="min-h-[calc(100vh-190px)] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-wrap items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setView("form")
              }
              className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >

              <Plus className="h-4 w-4" />

              Add Operations

            </button>


            <button
              type="button"
              onClick={() =>
                setView("list")
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-slate-50"
            >

              <ClipboardList className="h-4 w-4" />

              List of Operations

            </button>

          </div>

        </div>

      </div>

    );

  }


  /* =====================================================
     ADD OPERATION FORM
  ===================================================== */

  if (view === "form") {

    return (

      <div className="space-y-5">

        <div>

          <div className="mb-1 flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-50">

              <ClipboardList className="h-4 w-4 text-lime-600" />

            </div>


            <span className="text-xs font-bold uppercase tracking-[0.16em] text-lime-600">
              Master
            </span>

          </div>


          <h1 className="text-2xl font-bold tracking-tight text-black">
            Operations
          </h1>

        </div>


        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-600">
                Operation Master
              </p>


              <h2 className="mt-1 text-lg font-bold text-black">
                Add Operation
              </h2>

            </div>


            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-slate-50"
            >

              <ArrowLeft className="h-4 w-4" />

              Back

            </button>

          </div>


          {/* =================================================
              FORM BODY
          ================================================= */}

          <div className="p-5">

            <div className="grid gap-4 md:grid-cols-2">

              {/* OPERATION NAME */}

              <div>

                <label className="mb-1.5 block text-xs font-bold text-black">
                  Operation Name
                </label>


                <input
                  type="text"
                  name="operationName"
                  value={
                    formData.operationName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter operation name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                />

              </div>


              {/* MACHINE TYPE */}

              <div>

                <label className="mb-1.5 block text-xs font-bold text-black">
                  Machine Type
                </label>


                <input
                  type="text"
                  name="machineType"
                  value={
                    formData.machineType
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter machine type"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                />

              </div>


              {/* OPERATION TIME */}

              <div>

                <label className="mb-1.5 block text-xs font-bold text-black">
                  Operation Time
                </label>


                <input
                  type="text"
                  name="operationTime"
                  value={
                    formData.operationTime
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: 30 minutes"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                />

              </div>


              {/* CONSUMABLES */}

              <div>

                <label className="mb-1.5 block text-xs font-bold text-black">
                  Consumables
                </label>


                <input
                  type="text"
                  name="consumables"
                  value={
                    formData.consumables
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter consumables"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                />

              </div>


              {/* REVENUE */}

              <div>

                <label className="mb-1.5 block text-xs font-bold text-black">
                  Revenue
                </label>


                <input
                  type="number"
                  name="revenue"
                  value={
                    formData.revenue
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter revenue"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                />

              </div>


              {/* REQUIRED PARAMETERS */}

              <div>

                <label className="mb-1.5 block text-xs font-bold text-black">
                  Required Parameters
                </label>


                <select
                  name="numberOfParameters"
                  value={
                    formData.numberOfParameters
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                >

                  <option value="">
                    Select number
                  </option>

                  <option value="1">
                    1
                  </option>

                  <option value="2">
                    2
                  </option>

                  <option value="3">
                    3
                  </option>

                  <option value="4">
                    4
                  </option>

                  <option value="5">
                    5
                  </option>

                </select>

              </div>

            </div>


            {/* =================================================
                DYNAMIC PARAMETERS
            ================================================= */}

            {parameters.length > 0 && (

              <div className="mt-5 rounded-xl border border-lime-200 bg-lime-50/50 p-4">

                <div className="mb-3">

                  <h3 className="text-sm font-bold text-black">
                    Parameter Requirements
                  </h3>


                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Add the parameter names required for this operation.
                  </p>

                </div>


                <div className="space-y-3">

                  {parameters.map(
                    (
                      parameter,
                      index
                    ) => (

                      <div
                        key={
                          parameter.id
                        }
                      >

                        <label className="mb-1.5 block text-xs font-bold text-black">

                          Parameter{" "}
                          {index + 1}

                        </label>


                        <input
                          type="text"
                          value={
                            parameter.name
                          }
                          onChange={(event) =>
                            handleParameterChange(
                              index,
                              event.target.value
                            )
                          }
                          placeholder={`Enter parameter ${index + 1}`}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                        />

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">

            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-100"
            >

              <ArrowLeft className="h-4 w-4" />

              Back

            </button>


            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >

              <Save className="h-4 w-4" />

              Save Operation

            </button>

          </div>

        </div>

      </div>

    );

  }


  /* =====================================================
     OPERATIONS LIST
  ===================================================== */

  if (view === "list") {

    return (

      <div className="space-y-3">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex items-center justify-between">

          <div>

            <div className="mb-1 flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-50">

                <ClipboardList className="h-3.5 w-3.5 text-lime-600" />

              </div>


              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-600">
                Master
              </span>

            </div>


            <h1 className="text-xl font-bold tracking-tight text-black">
              List of Operations
            </h1>


            <p className="mt-0.5 text-[11px] text-slate-500">
              View and manage added operations.
            </p>

          </div>


          {/* BACK */}

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-slate-50"
          >

            <ArrowLeft className="h-3.5 w-3.5" />

            Back

          </button>

        </div>


        {/* =================================================
            TABLE CARD
        ================================================= */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">


          {operations.length === 0 ? (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">

                <ClipboardList className="h-4 w-4 text-slate-400" />

              </div>


              <h3 className="mt-3 text-xs font-bold text-black">
                No operations added
              </h3>


              <p className="mt-1 text-[10px] text-slate-500">
                Add an operation first to see it here.
              </p>

            </div>

          ) : (

            /* =================================================
               SCROLLABLE TABLE

               VERTICAL + HORIZONTAL SCROLL
            ================================================= */

            <div className="max-h-[430px] overflow-x-auto overflow-y-auto">

              <table className="w-full min-w-[950px] table-auto text-left">

                {/* =================================================
                    TABLE HEADER
                ================================================= */}

                <thead className="sticky top-0 z-10 bg-slate-50">

                  <tr className="border-b border-slate-200">

                    <th className="w-[50px] whitespace-nowrap px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      #
                    </th>


                    <th className="min-w-[180px] whitespace-nowrap px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Operation Name
                    </th>


                    <th className="min-w-[150px] whitespace-nowrap px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Machine Type
                    </th>


                    <th className="min-w-[150px] whitespace-nowrap px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Operation Time
                    </th>


                    <th className="min-w-[180px] whitespace-nowrap px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Consumables
                    </th>


                    <th className="min-w-[120px] whitespace-nowrap px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Revenue
                    </th>


                    <th className="w-[100px] whitespace-nowrap px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>


                {/* =================================================
                    TABLE BODY
                ================================================= */}

                <tbody>

                  {operations.map(
                    (
                      operation,
                      index
                    ) => (

                      <tr
                        key={
                          operation.id
                        }
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >

                        {/* NUMBER */}

                        <td className="whitespace-nowrap px-3 py-2 text-[11px] font-semibold text-slate-500">

                          {index + 1}

                        </td>


                        {/* OPERATION NAME */}

                        <td className="whitespace-nowrap px-3 py-2">

                          <span className="text-[11px] font-semibold text-black">

                            {
                              operation.operationName ||
                              "-"
                            }

                          </span>

                        </td>


                        {/* MACHINE TYPE */}

                        <td className="whitespace-nowrap px-3 py-2 text-[11px] text-slate-600">

                          {
                            operation.machineType ||
                            "-"
                          }

                        </td>


                        {/* OPERATION TIME */}

                        <td className="whitespace-nowrap px-3 py-2 text-[11px] text-slate-600">

                          {
                            operation.operationTime ||
                            "-"
                          }

                        </td>


                        {/* CONSUMABLES */}

                        <td className="whitespace-nowrap px-3 py-2 text-[11px] text-slate-600">

                          {
                            operation.consumables ||
                            "-"
                          }

                        </td>


                        {/* REVENUE */}

                        <td className="whitespace-nowrap px-3 py-2 text-[11px] font-semibold text-black">

                          {
                            operation.revenue === "" ||
                            operation.revenue === null ||
                            operation.revenue === undefined

                              ? "-"

                              : Number(
                                  operation.revenue
                                ).toLocaleString()
                          }

                        </td>


                        {/* DELETE */}

                        <td className="whitespace-nowrap px-3 py-2 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                operation.id
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-100"
                          >

                            <Trash2 className="h-3 w-3" />

                            Delete

                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    );

  }


  return null;

}


export default Operations;