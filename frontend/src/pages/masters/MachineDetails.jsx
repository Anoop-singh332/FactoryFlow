import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  Cpu,
  Gauge,
  Zap,
  Package,
  User,
  Clock,
} from "lucide-react";

function MachineDetails() {
  const { machineId } = useParams();
  const navigate = useNavigate();

  const [machine, setMachine] = useState(null);

  useEffect(() => {
    const savedMachines = JSON.parse(
      localStorage.getItem("factoryflow_machines") || "[]"
    );

    const foundMachine = savedMachines.find(
      (item) => String(item.id) === String(machineId)
    );

    setMachine(foundMachine || null);
  }, [machineId]);

  if (!machine) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#F8FAF9] p-6">
        <button
          type="button"
          onClick={() => navigate("/machines")}
          className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Machines
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-lg font-bold text-black">
            Machine not found
          </p>

          <p className="mt-2 text-sm text-slate-500">
            This machine may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  const status = machine.status || "AVAILABLE";

  const statusConfig = {
    AVAILABLE: {
      label: "Available",
      className:
        "border-lime-200 bg-lime-50 text-lime-700",
      dot: "bg-lime-500",
    },

    BOOKED: {
      label: "Booked",
      className:
        "border-yellow-200 bg-yellow-50 text-yellow-700",
      dot: "bg-yellow-500",
    },

    RUNNING: {
      label: "Running",
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    },

    MAINTENANCE: {
      label: "Maintenance",
      className:
        "border-orange-200 bg-orange-50 text-orange-700",
      dot: "bg-orange-500",
    },

    OFFLINE: {
      label: "Offline",
      className:
        "border-red-200 bg-red-50 text-red-700",
      dot: "bg-red-500",
    },
  };

  const currentStatus =
    statusConfig[status] || statusConfig.AVAILABLE;

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#F8FAF9]">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() => navigate("/machines")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-black shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-600">
              Machine Details
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-black">
              {machine.machineName}
            </h1>
          </div>

        </div>


        {/* STATUS */}

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${currentStatus.className}`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${currentStatus.dot}`}
          />

          {currentStatus.label}
        </div>

      </div>


      {/* =================================================
          MACHINE OVERVIEW
      ================================================= */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* Power */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Power Consumption
              </p>

              <p className="mt-2 text-2xl font-bold text-black">
                {machine.powerConsumption ?? "-"}
                <span className="ml-1 text-sm font-medium text-slate-500">
                  {machine.powerUnit || "kW"}
                </span>
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50">
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>

          </div>

        </div>


        {/* Capacity */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Capacity
              </p>

              <p className="mt-2 text-2xl font-bold text-black">
                {machine.capacity ?? "-"}
                <span className="ml-1 text-sm font-medium text-slate-500">
                  {machine.capacityUnit || "units"}
                </span>
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-50">
              <Gauge className="h-5 w-5 text-lime-600" />
            </div>

          </div>

        </div>


        {/* Daily Production */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Daily Production
              </p>

              <p className="mt-2 text-2xl font-bold text-black">
                {machine.dailyProductionAverage ?? "-"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Package className="h-5 w-5 text-blue-600" />
            </div>

          </div>

        </div>


        {/* Current Status */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Current Status
              </p>

              <p className="mt-2 text-xl font-bold text-black">
                {currentStatus.label}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <Activity className="h-5 w-5 text-slate-700" />
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          LIVE MACHINE AREA
      ================================================= */}

      <div className="mt-5 grid gap-5 lg:grid-cols-3">

        {/* LIVE STATUS */}

        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-black">
                Live Machine Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current operating information
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-lime-200 bg-lime-50 px-3 py-1.5 text-xs font-semibold text-lime-700">
              <span className="h-2 w-2 rounded-full bg-lime-500" />
              Live
            </div>

          </div>


          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-slate-200 bg-[#F8FAF9] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                  <Cpu className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Current Operation
                  </p>

                  <p className="mt-1 font-semibold text-black">
                    {machine.currentOperation || "No active operation"}
                  </p>
                </div>

              </div>

            </div>


            <div className="rounded-xl border border-slate-200 bg-[#F8FAF9] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                  <Package className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Current Item
                  </p>

                  <p className="mt-1 font-semibold text-black">
                    {machine.currentItem || "No item running"}
                  </p>
                </div>

              </div>

            </div>


            <div className="rounded-xl border border-slate-200 bg-[#F8FAF9] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                  <User className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Operator
                  </p>

                  <p className="mt-1 font-semibold text-black">
                    {machine.currentOperator || "No operator assigned"}
                  </p>
                </div>

              </div>

            </div>


            <div className="rounded-xl border border-slate-200 bg-[#F8FAF9] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                  <Clock className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Last Updated
                  </p>

                  <p className="mt-1 font-semibold text-black">
                    {machine.updatedAt
                      ? new Date(machine.updatedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* MACHINE INFORMATION */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-black">
            Machine Information
          </h2>

          <div className="mt-5 space-y-4">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Machine Name / Number
              </p>

              <p className="mt-1 font-semibold text-black">
                {machine.machineName}
              </p>
            </div>


            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Power Consumption
              </p>

              <p className="mt-1 font-semibold text-black">
                {machine.powerConsumption ?? "-"}{" "}
                {machine.powerUnit || "kW"}
              </p>
            </div>


            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Capacity
              </p>

              <p className="mt-1 font-semibold text-black">
                {machine.capacity ?? "-"}{" "}
                {machine.capacityUnit || "units"}
              </p>
            </div>


            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Daily Production Average
              </p>

              <p className="mt-1 font-semibold text-black">
                {machine.dailyProductionAverage ?? "-"}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default MachineDetails;