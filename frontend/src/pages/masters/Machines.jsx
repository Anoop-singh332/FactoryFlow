import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Cpu,
  Gauge,
  Link,
  LoaderCircle,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  Timer,
  Unlink,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MACHINE_STORAGE_KEY = "factoryflow_machines";
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const emptyForm = {
  machineName: "",
  mqttMachineId: "",
  powerConsumption: "",
  capacity: "",
  dailyProductionAverage: "",
};

function Machines() {
  const navigate = useNavigate();

  const [machines, setMachines] = useState([]);
  const [addMachineOpen, setAddMachineOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState(emptyForm);

  // MQTT machine-control state
  const [machineControls, setMachineControls] = useState({});
  const [mqttError, setMqttError] = useState({});

  const getMqttMachineId = (machine, index = 0) =>
    machine?.mqttMachineId ||
    `M${String(index + 1).padStart(3, "0")}`;

  const getControl = (machineId) =>
    machineControls[machineId] || {
      permission: false,
      enabled: false,
      testing: false,
      connected: false,
      timeoutSeconds: 10,
      elapsed: 0,
      lastMessage: null,
      messageCount: 0,
      lastSeenAt: null,
    };

  const updateControl = (machineId, updates) => {
    setMachineControls((previous) => ({
      ...previous,
      [machineId]: {
        ...getControl(machineId),
        ...updates,
      },
    }));
  };

  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem("factoryflow_token");

    if (!token) {
      throw new Error("You are not logged in. Please login again.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Machine API request failed.");
    }

    return data;
  };

  /* ================= LOAD MACHINES ================= */

  const loadMachines = () => {
    try {
      const savedMachines = JSON.parse(
        localStorage.getItem(MACHINE_STORAGE_KEY) || "[]",
      );

      const loadedMachines = Array.isArray(savedMachines) ? savedMachines : [];

      // A browser refresh starts a fresh machine-control session.
      // Do not leave an old RUNNING UI state from the previous page session.
      const resetMachines = loadedMachines.map((machine) => ({
        ...machine,
        status: machine.status === "RUNNING" ? "AVAILABLE" : machine.status,
      }));

      localStorage.setItem(
        MACHINE_STORAGE_KEY,
        JSON.stringify(resetMachines),
      );

      setMachines(resetMachines);
    } catch (error) {
      console.error("Failed to load machines:", error);
      setMachines([]);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  /* ================= FILTER ================= */

  const filteredMachines = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return machines;
    }

    return machines.filter((machine) =>
      String(machine.machineName || "")
        .toLowerCase()
        .includes(value),
    );
  }, [machines, search]);

  /* ================= FORM CHANGE ================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= ADD MACHINE ================= */

  const handleAddMachine = (event) => {
    event.preventDefault();

    const machineName = formData.machineName.trim();

    if (!machineName) {
      alert("Please enter machine name");
      return;
    }

    if (!formData.powerConsumption) {
      alert("Please enter power consumption.");
      return;
    }

    if (!formData.capacity) {
      alert("Please enter machine capacity.");
      return;
    }

    if (!formData.dailyProductionAverage) {
      alert("Please enter daily production average.");
      return;
    }

    /* Prevent duplicate machine names */

    const duplicate = machines.some(
      (machine) =>
        String(machine.machineName).trim().toLowerCase() ===
        machineName.toLowerCase(),
    );

    if (duplicate) {
      alert("A machine with this name / number already exists.");
      return;
    }

    const newMachine = {
      id: `machine-${Date.now()}`,

      machineName,
      mqttMachineId:
        formData.mqttMachineId.trim() ||
        `M${String(machines.length + 1).padStart(3, "0")}`,

      powerConsumption: Number(formData.powerConsumption),

      powerUnit: "kW",

      capacity: Number(formData.capacity),

      capacityUnit: "units",

      dailyProductionAverage: Number(formData.dailyProductionAverage),

      status: "AVAILABLE",

      currentOperation: null,
      currentItem: null,
      currentOperator: null,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedMachines = [...machines, newMachine];

    localStorage.setItem(MACHINE_STORAGE_KEY, JSON.stringify(updatedMachines));

    setMachines(updatedMachines);

    setFormData(emptyForm);
    setAddMachineOpen(false);

    alert("Machine added successfully.");
  };


  /* ================= MQTT MACHINE CONTROL ================= */

  const updateSavedMachineStatus = (machineId, status) => {
    setMachines((previous) => {
      const updated = previous.map((item) => {
        const itemMqttId =
          item.mqttMachineId ||
          `M${String(
            previous.findIndex((machine) => machine.id === item.id) + 1,
          ).padStart(3, "0")}`;

        if (itemMqttId !== machineId) {
          return item;
        }

        return {
          ...item,
          status,
          updatedAt: new Date().toISOString(),
        };
      });

      localStorage.setItem(
        MACHINE_STORAGE_KEY,
        JSON.stringify(updated),
      );

      return updated;
    });
  };

  const handlePermissionToggle = async (machine, machineIndex) => {
    const machineId = getMqttMachineId(machine, machineIndex);
    const current = getControl(machineId);

    if (!current.permission) {
      updateControl(machineId, {
        permission: true,
        enabled: false,
        testing: false,
        connected: false,
        elapsed: 0,
        lastMessage: null,
        lastSeenAt: null,
      });
      setMqttError((previous) => ({
        ...previous,
        [machineId]: "",
      }));
      return;
    }

    // Turning permission off also stops the app-side control state.
    try {
      await apiRequest("/machines/control", {
        method: "POST",
        body: JSON.stringify({
          machineId,
          command: "STOP",
        }),
      });
    } catch (error) {
      // Permission can still be revoked locally, but show the API error.
      console.error("Stop command error:", error);
      setMqttError((previous) => ({
        ...previous,
        [machineId]: error.message,
      }));
    }

    updateControl(machineId, {
      permission: false,
      enabled: false,
      testing: false,
      connected: false,
      elapsed: 0,
      lastMessage: null,
      lastSeenAt: null,
    });

    updateSavedMachineStatus(machineId, "AVAILABLE");
  };

  const handleMachineToggle = async (machine, machineIndex) => {
    const machineId = getMqttMachineId(machine, machineIndex);
    const current = getControl(machineId);

    if (!current.permission) {
      setMqttError((previous) => ({
        ...previous,
        [machineId]: "Give permission before activating the machine.",
      }));
      return;
    }

    const command = current.enabled ? "STOP" : "START";

    try {
      if (command === "STOP") {
        updateControl(machineId, {
          testing: true,
          connected: false,
          elapsed: 0,
        });

        await apiRequest("/machines/control", {
          method: "POST",
          body: JSON.stringify({
            machineId,
            command: "STOP",
          }),
        });

        updateControl(machineId, {
          permission: false,
          enabled: false,
          testing: false,
          connected: false,
          elapsed: 0,
          lastMessage: null,
          lastSeenAt: null,
        });

        updateSavedMachineStatus(machineId, "AVAILABLE");
        setMqttError((previous) => ({
          ...previous,
          [machineId]: "",
        }));
        return;
      }

      // IMPORTANT: remember the current message count BEFORE START.
      // We only consider the machine connected when a NEW MQTT status arrives.
      const beforeStart = await apiRequest(
        `/machines/status/${encodeURIComponent(machineId)}`,
      );

      const previousMessageCount =
        Number(beforeStart?.data?.messageCount) || 0;

      updateControl(machineId, {
        testing: true,
        connected: false,
        elapsed: 0,
        messageCount: previousMessageCount,
        lastMessage: beforeStart?.data?.data || null,
        lastSeenAt: beforeStart?.data?.receivedAt || null,
      });

      await apiRequest("/machines/control", {
        method: "POST",
        body: JSON.stringify({
          machineId,
          command: "START",
        }),
      });

      const timeoutSeconds = Math.max(
        1,
        Math.min(60, Number(current.timeoutSeconds) || 10),
      );

      let connected = false;
      let latestStatus = null;

      for (let second = 1; second <= timeoutSeconds; second += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        latestStatus = await apiRequest(
          `/machines/status/${encodeURIComponent(machineId)}`,
        );

        const newMessageCount =
          Number(latestStatus?.data?.messageCount) || 0;

        const elapsed = second;

        updateControl(machineId, {
          elapsed,
          lastMessage: latestStatus?.data?.data || null,
          messageCount: newMessageCount,
          lastSeenAt: latestStatus?.data?.receivedAt || null,
        });

        console.log(
          `[MQTT] ${machineId} START check: previous=${previousMessageCount}, current=${newMessageCount}`,
        );

        if (newMessageCount > previousMessageCount) {
          connected = true;
          break;
        }
      }

      if (connected) {
        updateControl(machineId, {
          enabled: true,
          testing: false,
          connected: true,
          elapsed: 0,
          lastMessage: latestStatus?.data?.data || null,
          messageCount: latestStatus?.data?.messageCount || 0,
          lastSeenAt: latestStatus?.data?.receivedAt || null,
        });

        updateSavedMachineStatus(machineId, "RUNNING");

        setMqttError((previous) => ({
          ...previous,
          [machineId]: "",
        }));
      } else {
        updateControl(machineId, {
          permission: false,
          enabled: false,
          testing: false,
          connected: false,
        });

        updateSavedMachineStatus(machineId, "OFFLINE");

        setMqttError((previous) => ({
          ...previous,
          [machineId]: `No MQTT response received within ${timeoutSeconds} seconds. Give permission again after the machine is available.`,
        }));
      }
    } catch (error) {
      console.error("Machine MQTT control error:", error);

      updateControl(machineId, {
        testing: false,
        connected: false,
      });

      setMqttError((previous) => ({
        ...previous,
        [machineId]: error.message || "Unable to communicate with machine.",
      }));
    }
  };

  /* ================= CONTINUOUS MQTT CONNECTION MONITOR ================= */

  useEffect(() => {
    const activeMachines = Object.entries(machineControls).filter(
      ([, control]) => control.permission && control.enabled,
    );

    if (activeMachines.length === 0) return undefined;

    const checkConnections = async () => {
      for (const [machineId, controlAtStart] of activeMachines) {
        try {
          const statusData = await apiRequest(
            `/machines/status/${encodeURIComponent(machineId)}`,
          );

          const receivedAt = statusData?.data?.receivedAt
            ? new Date(statusData.data.receivedAt).getTime()
            : 0;

          const messageCount =
            Number(statusData?.data?.messageCount) || 0;

          const lastMessage = statusData?.data?.data || null;
          const timeoutSeconds = Math.max(
            1,
            Math.min(60, Number(controlAtStart.timeoutSeconds) || 10),
          );

          updateControl(machineId, {
            lastMessage,
            messageCount,
            lastSeenAt: statusData?.data?.receivedAt || null,
          });

          if (!receivedAt) continue;

          const ageSeconds = (Date.now() - receivedAt) / 1000;

          if (ageSeconds > timeoutSeconds) {
            console.warn(
              `[MQTT] ${machineId} disconnected. Last message was ${Math.round(ageSeconds)} seconds ago.`,
            );

            updateControl(machineId, {
              permission: false,
              enabled: false,
              testing: false,
              connected: false,
              elapsed: 0,
            });

            updateSavedMachineStatus(machineId, "OFFLINE");

            const message = `Machine ${machineId} disconnected. No MQTT response received for ${timeoutSeconds} seconds.`;

            setMqttError((previous) => ({
              ...previous,
              [machineId]: message,
            }));

            window.alert(
              `Machine Disconnected\n\n${message}\n\nPlease give permission again after the machine is available.`,
            );
          }
        } catch (error) {
          console.error(
            `[MQTT] Connection check failed for ${machineId}:`,
            error,
          );
        }
      }
    };

    const intervalId = window.setInterval(checkConnections, 1000);

    return () => window.clearInterval(intervalId);
  }, [machineControls]);

  const handleTimeoutChange = (machineId, value) => {
    const seconds = Math.max(1, Math.min(60, Number(value) || 1));

    updateControl(machineId, {
      timeoutSeconds: seconds,
    });
  };

  /* ================= MACHINE STATUS ================= */

  const getStatusClass = (status) => {
    switch (status) {
      case "RUNNING":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "BOOKED":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "MAINTENANCE":
        return "bg-red-50 text-red-700 border-red-200";

      case "OFFLINE":
        return "bg-slate-100 text-slate-600 border-slate-200";

      default:
        return "bg-lime-50 text-lime-700 border-lime-200";
    }
  };

  return (
    <div className="space-y-5">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-50">
              <Cpu className="h-4 w-4 text-lime-600" />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.16em] text-lime-600">
              Production Equipment
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-black">
            Machines
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage production machines and monitor their current status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddMachineOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Machine
        </button>
      </div>

      {/* ================= SUMMARY ================= */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Machines"
          value={machines.length}
          icon={<Cpu className="h-4 w-4" />}
        />

        <SummaryCard
          label="Available"
          value={
            machines.filter((machine) => machine.status === "AVAILABLE").length
          }
          icon={<Activity className="h-4 w-4" />}
        />

        <SummaryCard
          label="Booked"
          value={
            machines.filter((machine) => machine.status === "BOOKED").length
          }
          icon={<Gauge className="h-4 w-4" />}
        />

        <SummaryCard
          label="Running"
          value={
            machines.filter((machine) => machine.status === "RUNNING").length
          }
          icon={<Zap className="h-4 w-4" />}
        />
      </div>

      {/* ================= SEARCH ================= */}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search machine..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500"
          />
        </div>

        <button
          type="button"
          onClick={loadMachines}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* ================= MACHINE LIST ================= */}

      {filteredMachines.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-50">
            <Cpu className="h-6 w-6 text-lime-600" />
          </div>

          <h2 className="mt-4 text-base font-bold text-black">
            No machines found
          </h2>

          <p className="mt-1 max-w-md text-sm text-slate-500">
            Add your first production machine to start assigning machines to
            Operations.
          </p>

          <button
            type="button"
            onClick={() => setAddMachineOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add Machine
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMachines.map((machine) => (
            <div
              key={machine.id}
              className="group h-full text-left"
            >
              <div
                onClick={() => navigate(`/machines/${machine.id}`)}
                className="h-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-lime-300 hover:shadow-md"
              >
                {/* Machine Header */}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-50">
                      <Cpu className="h-5 w-5 text-lime-600" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-black">
                        {machine.machineName}
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Production Machine
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                      machine.status,
                    )}`}
                  >
                    {machine.status}
                  </span>
                </div>

                {/* Current Operation */}

                {machine.status === "RUNNING" && machine.currentOperation && (
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Currently Running
                    </p>

                    <p className="mt-1 text-sm font-semibold text-black">
                      {machine.currentOperation}
                    </p>

                    {machine.currentItem && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {machine.currentItem}
                      </p>
                    )}
                  </div>
                )}

                {/* Machine Stats */}

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <MachineStat
                    label="Power"
                    value={`${machine.powerConsumption} kW`}
                  />

                  <MachineStat
                    label="Capacity"
                    value={`${machine.capacity} units`}
                  />

                  <MachineStat
                    label="Daily Avg"
                    value={`${machine.dailyProductionAverage}`}
                  />
                </div>

                {/* MQTT CONTROL */}

                {(() => {
                  const machineIndex = machines.findIndex(
                    (item) => item.id === machine.id,
                  );
                  const mqttMachineId = getMqttMachineId(
                    machine,
                    machineIndex,
                  );
                  const control = getControl(mqttMachineId);
                  const controlError = mqttError[mqttMachineId];

                  return (
                    <div
                      className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Machine Control
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            MQTT ID: {mqttMachineId}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${
                            control.connected
                              ? "border-lime-200 bg-lime-50 text-lime-700"
                              : "border-slate-200 bg-white text-slate-500"
                          }`}
                        >
                          <Wifi className="h-3 w-3" />
                          {control.connected ? "CONNECTED" : "NOT CONNECTED"}
                        </span>
                      </div>

                      {controlError && !control.testing && !control.permission && (
                        <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-2 text-[10px] font-semibold text-amber-700">
                          Permission expired. Turn permission ON again, then activate the machine.
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Permission
                          </p>
                          <p
                            className={`mt-1 text-xs font-bold ${
                              control.permission
                                ? "text-lime-600"
                                : "text-slate-500"
                            }`}
                          >
                            {control.permission ? "GRANTED" : "NOT GRANTED"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handlePermissionToggle(machine, machineIndex)
                          }
                          className={`relative h-7 w-12 rounded-full transition ${
                            control.permission
                              ? "bg-lime-500"
                              : "bg-slate-300"
                          }`}
                          title={
                            control.permission
                              ? "Revoke machine permission"
                              : "Give machine permission"
                          }
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                              control.permission
                                ? "left-6"
                                : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                        <div>
                          <label className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <Timer className="h-3 w-3" />
                            Response Timeout
                          </label>

                          <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={control.timeoutSeconds}
                              onChange={(event) =>
                                handleTimeoutChange(
                                  mqttMachineId,
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-lg px-2.5 py-2 text-xs font-semibold text-black outline-none"
                            />
                            <span className="pr-2 text-[10px] font-semibold text-slate-400">
                              sec
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={
                            control.testing || !control.permission
                          }
                          onClick={() =>
                            handleMachineToggle(machine, machineIndex)
                          }
                          className={`mt-5 inline-flex min-w-[108px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition ${
                            control.testing
                              ? "cursor-wait bg-slate-400"
                              : control.enabled
                                ? "bg-red-600 hover:bg-red-700"
                                : control.permission
                                  ? "bg-black hover:bg-slate-800"
                                  : "cursor-not-allowed bg-slate-300"
                          }`}
                        >
                          {control.testing ? (
                            <>
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              CONNECTING
                            </>
                          ) : control.enabled ? (
                            <>
                              <Power className="h-3.5 w-3.5" />
                              STOP
                            </>
                          ) : (
                            <>
                              <Power className="h-3.5 w-3.5" />
                              ACTIVATE
                            </>
                          )}
                        </button>
                      </div>

                      {control.testing && (
                        <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                          <span>
                            Waiting for machine response...
                          </span>
                          <span>
                            {control.elapsed}/{control.timeoutSeconds}s
                          </span>
                        </div>
                      )}

                      {control.lastMessage && (
                        <div className="mt-3 rounded-lg border border-lime-100 bg-lime-50/70 p-2.5">
                          <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-lime-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Latest MQTT Response
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <MachineStat
                              label="Status"
                              value={
                                control.lastMessage.status || "-"
                              }
                            />
                            <MachineStat
                              label="Temp"
                              value={
                                control.lastMessage.temperature != null
                                  ? `${control.lastMessage.temperature} °C`
                                  : "-"
                              }
                            />
                            <MachineStat
                              label="Speed"
                              value={
                                control.lastMessage.speed != null
                                  ? `${control.lastMessage.speed} RPM`
                                  : "-"
                              }
                            />
                          </div>
                        </div>
                      )}

                      {controlError && (
                        <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-2 text-[10px] font-semibold text-red-600">
                          <CircleAlert className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>{controlError}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Footer */}

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-500">
                    View machine details
                  </span>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/machines/${machine.id}`);
                    }}
                    className="text-xs font-bold text-lime-600 transition hover:translate-x-1"
                  >
                    View →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= ADD MACHINE MODAL ================= */}

      {addMachineOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-600">
                  Machine Management
                </p>

                <h2 className="mt-1 text-lg font-bold text-black">
                  Add Machine
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Add a production machine to FactoryFlow.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddMachineOpen(false);
                  setFormData(emptyForm);
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}

            <form onSubmit={handleAddMachine} className="p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Machine Name */}

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-black">
                    Machine Name / Number *
                  </label>

                  <input
                    type="text"
                    name="machineName"
                    value={formData.machineName}
                    onChange={handleChange}
                    placeholder="Example: CNC-01, Machine-A1"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500"
                  />

                  <p className="mt-1 text-[11px] text-slate-400">
                    Letters, numbers, spaces and hyphens are allowed.
                  </p>
                </div>

                {/* MQTT Machine ID */}

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-black">
                    MQTT Machine ID
                  </label>

                  <input
                    type="text"
                    name="mqttMachineId"
                    value={formData.mqttMachineId}
                    onChange={handleChange}
                    placeholder="Example: M001"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500"
                  />

                  <p className="mt-1 text-[11px] text-slate-400">
                    This must match the machine ID used by MQTT.
                  </p>
                </div>

                {/* Power */}

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black">
                    Power Consumption *
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="powerConsumption"
                      value={formData.powerConsumption}
                      onChange={handleChange}
                      placeholder="15"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-12 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      kW
                    </span>
                  </div>
                </div>

                {/* Capacity */}

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black">
                    Capacity / Size *
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="500"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-16 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      units
                    </span>
                  </div>
                </div>

                {/* Daily Production */}

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-black">
                    Daily Production Average *
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      name="dailyProductionAverage"
                      value={formData.dailyProductionAverage}
                      onChange={handleChange}
                      placeholder="420"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-24 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-500"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      units / day
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAddMachineOpen(false);
                    setFormData(emptyForm);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SUMMARY CARD ================= */

function SummaryCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-50 text-lime-600">
          {icon}
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold text-black">{value}</p>
    </div>
  );
}

/* ================= MACHINE STAT ================= */

function MachineStat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-black">{value}</p>
    </div>
  );
}

export default Machines;
