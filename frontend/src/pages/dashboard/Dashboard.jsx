import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Boxes,
  ClipboardCheck,
  PackageCheck,
  RefreshCw,
  Truck,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Dashboard() {
  const [inwardSupplies, setInwardSupplies] = useState([]);
  const [productions, setProductions] = useState([]);
  const [qualityInspections, setQualityInspections] = useState([]);
  const [dispatches, setDispatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("factoryflow_token");

      if (!token) {
        setError(
          "Authentication token not found. Please login again.",
        );

        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        inwardResponse,
        productionResponse,
        qualityResponse,
        dispatchResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/inward`, {
          method: "GET",
          headers,
        }),

        fetch(`${API_URL}/production`, {
          method: "GET",
          headers,
        }),

        fetch(`${API_URL}/quality`, {
          method: "GET",
          headers,
        }),

        fetch(`${API_URL}/dispatch`, {
          method: "GET",
          headers,
        }),
      ]);

      const [
        inwardData,
        productionData,
        qualityData,
        dispatchData,
      ] = await Promise.all([
        inwardResponse.json(),
        productionResponse.json(),
        qualityResponse.json(),
        dispatchResponse.json(),
      ]);

      if (!inwardResponse.ok) {
        throw new Error(
          inwardData.message || "Failed to load inward data.",
        );
      }

      if (!productionResponse.ok) {
        throw new Error(
          productionData.message ||
            "Failed to load production data.",
        );
      }

      if (!qualityResponse.ok) {
        throw new Error(
          qualityData.message ||
            "Failed to load quality data.",
        );
      }

      if (!dispatchResponse.ok) {
        throw new Error(
          dispatchData.message ||
            "Failed to load dispatch data.",
        );
      }

      setInwardSupplies(inwardData.data || []);
      setProductions(productionData.data || []);
      setQualityInspections(qualityData.data || []);
      setDispatches(dispatchData.data || []);
    } catch (error) {
      console.error("Dashboard Error:", error);

      setError(
        error.message || "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =========================
  // CALCULATIONS
  // =========================

  const totalInwardWeight = useMemo(() => {
    return inwardSupplies.reduce(
      (total, item) =>
        total +
        Number(
          String(item.materialWeight || "")
            .replace(/kg/i, "")
            .trim() || 0,
        ),
      0,
    );
  }, [inwardSupplies]);

  const totalProductionPieces = useMemo(() => {
    return productions.reduce(
      (total, production) =>
        total +
        Number(
          production.numberOfPieces ||
            production.productionCount ||
            0,
        ),
      0,
    );
  }, [productions]);

  const totalDispatchWeight = useMemo(() => {
    return dispatches.reduce(
      (total, dispatch) =>
        total + Number(dispatch.weight || 0),
      0,
    );
  }, [dispatches]);

  const passedQuality = useMemo(() => {
    return qualityInspections.filter(
      (inspection) =>
        inspection.qualityResult === "Passed",
    ).length;
  }, [qualityInspections]);

  const failedQuality = useMemo(() => {
    return qualityInspections.filter(
      (inspection) =>
        inspection.qualityResult === "Failed",
    ).length;
  }, [qualityInspections]);

  const pendingQuality = useMemo(() => {
    return qualityInspections.filter(
      (inspection) =>
        inspection.qualityResult === "Pending",
    ).length;
  }, [qualityInspections]);

  // =========================
  // RECENT ACTIVITY
  // =========================

  const recentActivity = useMemo(() => {
    const activities = [];

    inwardSupplies.forEach((item) => {
      activities.push({
        id: `inward-${item._id}`,
        title: "Material received",
        detail: `${item.materialItemName || "Material"} • ${
          item.invoiceNumber || "No invoice"
        }`,
        time: item.createdAt,
        type: "Inward",
      });
    });

    productions.forEach((production) => {
      activities.push({
        id: `production-${production._id}`,
        title: "Production recorded",
        detail: `${
          production.itemName ||
          production.machineNumber ||
          "Production"
        } • ${
          production.numberOfPieces ??
          production.productionCount ??
          0
        } pieces`,
        time: production.createdAt,
        type: "Production",
      });
    });

    qualityInspections.forEach((inspection) => {
      activities.push({
        id: `quality-${inspection._id}`,
        title: "Quality inspection",
        detail: `${
          inspection.inspectionReport || "Inspection"
        } • ${
          inspection.qualityResult || "Pending"
        }`,
        time: inspection.createdAt,
        type: "Quality",
      });
    });

    dispatches.forEach((dispatch) => {
      const itemNames =
        dispatch.items
          ?.map((item) => item.itemName)
          .join(", ") || "Items";

      activities.push({
        id: `dispatch-${dispatch._id}`,
        title: "Dispatch recorded",
        detail: `${itemNames} • ${
          dispatch.deliveryChallan || "Dispatch"
        }`,
        time: dispatch.createdAt,
        type: "Dispatch",
      });
    });

    activities.sort(
      (a, b) =>
        new Date(b.time) - new Date(a.time),
    );

    return activities.slice(0, 5);
  }, [
    inwardSupplies,
    productions,
    qualityInspections,
    dispatches,
  ]);

  return (
    <div className="mx-auto flex h-[calc(100vh-85px)] min-h-0 max-w-[1600px] flex-col overflow-hidden px-4 py-1.5 text-black">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="shrink-0">
        <PageHeader
          eyebrow="Factory overview"
          title="Operations Dashboard"
          description="Monitor material flow, production activity, quality inspections and dispatch operations from one workspace."
        />
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="mb-2 flex shrink-0 items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">

          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5" />

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={fetchDashboardData}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-red-700 transition hover:bg-red-100"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* =========================
          DASHBOARD CONTENT
      ========================= */}

      <div className="min-h-0 flex-1 overflow-hidden">

        {/* =========================
            MAIN STATS
        ========================= */}

        <div className="grid grid-cols-4 gap-2.5">

          <CompactStatCard
            title="Inward Material"
            value={
              loading
                ? "..."
                : inwardSupplies.length
            }
            description="records"
            icon={PackageCheck}
          />

          <CompactStatCard
            title="Material Received"
            value={
              loading
                ? "..."
                : `${formatNumber(
                    totalInwardWeight,
                  )} Kg`
            }
            description="total weight"
            icon={Boxes}
          />

          <CompactStatCard
            title="Production Output"
            value={
              loading
                ? "..."
                : formatNumber(
                    totalProductionPieces,
                  )
            }
            description="pieces"
            icon={Activity}
          />

          <CompactStatCard
            title="Dispatched"
            value={
              loading
                ? "..."
                : dispatches.length
            }
            description="deliveries"
            icon={Truck}
          />
        </div>

        {/* =========================
            QUALITY SUMMARY
        ========================= */}

        <div className="mt-2 grid grid-cols-4 gap-2.5">

          <MiniStat
            title="Quality Inspections"
            value={
              loading
                ? "..."
                : qualityInspections.length
            }
            icon={ClipboardCheck}
          />

          <MiniStat
            title="Passed Quality"
            value={
              loading ? "..." : passedQuality
            }
            icon={PackageCheck}
          />

          <MiniStat
            title="Failed Quality"
            value={
              loading ? "..." : failedQuality
            }
            icon={AlertCircle}
          />

          <MiniStat
            title="Pending Quality"
            value={
              loading ? "..." : pendingQuality
            }
            icon={RefreshCw}
          />
        </div>

        {/* =========================
            MAIN SECTION
        ========================= */}

        <div className="mt-2.5 grid h-[calc(100%-170px)] min-h-0 grid-cols-[1.6fr_1fr] gap-2.5">

          {/* =========================
              FACTORY FLOW
          ========================= */}

          <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">

            <div className="flex shrink-0 items-center justify-between">

              <div>
                <p className="text-[15px] font-bold tracking-tight text-black">
                  Factory Flow
                </p>

                <p className="mt-0.5 text-[10px] font-medium text-black">
                  Live operational overview
                </p>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50 px-2 py-1">

                <span className="h-1.5 w-1.5 rounded-full bg-lime-500 ff-pulse" />

                <span className="text-[9px] font-semibold text-black">
                  {loading
                    ? "Loading"
                    : "Operational"}
                </span>

              </div>
            </div>

            {/* FLOW AREA */}

            <div className="ff-grid relative mt-2.5 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

              <div className="absolute bottom-5 left-1/2 h-24 w-[72%] -translate-x-1/2 rounded-[50%] border border-lime-200 bg-lime-50/40" />

              <div className="relative z-10 grid w-full grid-cols-4 gap-2 px-3">

                <FactoryNode
                  label="INWARD"
                  value={
                    loading
                      ? "..."
                      : inwardSupplies.length
                  }
                  status={
                    inwardSupplies.length > 0
                      ? "Receiving"
                      : "No records"
                  }
                  active={
                    inwardSupplies.length > 0
                  }
                />

                <FactoryNode
                  label="PRODUCTION"
                  value={
                    loading
                      ? "..."
                      : productions.length
                  }
                  status={
                    productions.length > 0
                      ? `${formatNumber(
                          totalProductionPieces,
                        )} pieces`
                      : "No records"
                  }
                  active={
                    productions.length > 0
                  }
                />

                <FactoryNode
                  label="QUALITY"
                  value={
                    loading
                      ? "..."
                      : qualityInspections.length
                  }
                  status={
                    qualityInspections.length > 0
                      ? `${passedQuality} passed`
                      : "No records"
                  }
                  active={
                    qualityInspections.length > 0
                  }
                />

                <FactoryNode
                  label="DISPATCH"
                  value={
                    loading
                      ? "..."
                      : dispatches.length
                  }
                  status={
                    dispatches.length > 0
                      ? `${formatNumber(
                          totalDispatchWeight,
                        )} weight`
                      : "No records"
                  }
                  active={
                    dispatches.length > 0
                  }
                />

              </div>

              {/* FLOW LINES */}

              <div className="pointer-events-none absolute left-[23%] top-1/2 hidden h-px w-[4%] bg-lime-400 md:block" />

              <div className="pointer-events-none absolute left-[48%] top-1/2 hidden h-px w-[4%] bg-lime-400 md:block" />

              <div className="pointer-events-none absolute right-[23%] top-1/2 hidden h-px w-[4%] bg-lime-400 md:block" />

            </div>
          </div>

          {/* =========================
              RECENT ACTIVITY
          ========================= */}

          <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">

            <div className="flex shrink-0 items-center justify-between">

              <div>
                <p className="text-[15px] font-bold tracking-tight text-black">
                  Recent Activity
                </p>

                <p className="mt-0.5 text-[10px] font-medium text-black">
                  Latest factory operations
                </p>
              </div>

              <button
                type="button"
                onClick={fetchDashboardData}
                disabled={loading}
                className="rounded-lg p-1.5 text-black transition hover:bg-lime-50 hover:text-lime-600"
                title="Refresh"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>

            <div className="mt-2.5 min-h-0 flex-1 overflow-y-auto">

              {loading ? (
                <div className="py-8 text-center text-[10px] font-medium text-black">
                  Loading activity...
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="py-8 text-center">

                  <Activity className="mx-auto h-6 w-6 text-black" />

                  <p className="mt-2 text-[10px] font-semibold text-black">
                    No factory activity yet
                  </p>

                  <p className="mt-1 text-[9px] text-black">
                    Create records to see activity here.
                  </p>

                </div>
              ) : (
                <div className="divide-y divide-slate-100">

                  {recentActivity.map(
                    (activity) => (
                      <div
                        key={activity.id}
                        className="flex gap-2 py-2.5 first:pt-0"
                      >

                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-lime-50">

                          <span className="h-1.5 w-1.5 rounded-full bg-lime-500" />

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center justify-between gap-2">

                            <p className="truncate text-[10px] font-bold text-black">
                              {activity.title}
                            </p>

                            <span className="shrink-0 text-[8px] font-medium text-black">
                              {formatTimeAgo(
                                activity.time,
                              )}
                            </span>

                          </div>

                          <p className="mt-0.5 truncate text-[9px] font-medium text-black">
                            {activity.detail}
                          </p>

                          <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-black">
                            {activity.type}
                          </span>

                        </div>
                      </div>
                    ),
                  )}

                </div>
              )}

            </div>
          </div>
        </div>

        {/* =========================
            BOTTOM SUMMARY
        ========================= */}

        <div className="mt-2.5 grid grid-cols-3 gap-2.5">

          <SummaryCard
            title="Production records"
            value={
              loading
                ? "..."
                : productions.length
            }
            detail={
              loading
                ? "Loading..."
                : `${formatNumber(
                    totalProductionPieces,
                  )} total pieces`
            }
          />

          <SummaryCard
            title="Dispatch records"
            value={
              loading
                ? "..."
                : dispatches.length
            }
            detail={
              loading
                ? "Loading..."
                : `${formatNumber(
                    totalDispatchWeight,
                  )} total weight`
            }
          />

          <SummaryCard
            title="Quality status"
            value={
              loading
                ? "..."
                : passedQuality
            }
            detail={
              loading
                ? "Loading..."
                : `${failedQuality} failed • ${pendingQuality} pending`
            }
          />

        </div>
      </div>
    </div>
  );
}

// =========================
// COMPACT STAT CARD
// =========================

function CompactStatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-lime-300 hover:shadow-md">

      <div className="flex items-center justify-between">

        <div className="flex min-w-0 items-center gap-2">

          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime-50">
            <Icon className="h-3.5 w-3.5 text-lime-600" />
          </div>

          <p className="truncate text-[10px] font-bold text-black">
            {title}
          </p>

        </div>

        <span className="ml-2 shrink-0 rounded-full bg-lime-50 px-1.5 py-0.5 text-[7px] font-bold text-black">
          LIVE
        </span>

      </div>

      <div className="mt-1.5 flex items-end justify-between">

        <p className="text-xl font-bold leading-none text-black">
          {value}
        </p>

        <span className="text-[8px] font-medium text-black">
          {description}
        </span>

      </div>
    </div>
  );
}

// =========================
// FACTORY NODE
// =========================

function FactoryNode({
  label,
  value,
  status,
  active,
}) {
  return (
    <div
      className={`rounded-xl border p-3 transition ${
        active
          ? "border-lime-300 bg-lime-50"
          : "border-slate-200 bg-white"
      }`}
    >

      <div className="flex items-center justify-between">

        <span className="text-[8px] font-bold tracking-[0.12em] text-black">
          {label}
        </span>

        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active
              ? "bg-lime-500 ff-pulse"
              : "bg-slate-300"
          }`}
        />

      </div>

      <p className="mt-3 text-lg font-bold leading-none text-black">
        {value}
      </p>

      <p className="mt-1 truncate text-[8px] font-medium text-black">
        {status}
      </p>

    </div>
  );
}

// =========================
// MINI STAT
// =========================

function MiniStat({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="truncate text-[8px] font-bold uppercase tracking-wide text-black">
          {title}
        </p>

        <Icon className="h-3.5 w-3.5 text-black" />

      </div>

      <p className="mt-1 text-lg font-bold leading-none text-black">
        {value}
      </p>

    </div>
  );
}

// =========================
// SUMMARY CARD
// =========================

function SummaryCard({
  title,
  value,
  detail,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-[9px] font-bold text-black">
          {title}
        </p>

        <ArrowUpRight className="h-3 w-3 text-lime-600" />

      </div>

      <div className="mt-1 flex items-end justify-between gap-2">

        <p className="text-xl font-bold leading-none text-black">
          {value}
        </p>

        <p className="truncate text-[8px] font-bold text-black">
          {detail}
        </p>

      </div>

    </div>
  );
}

// =========================
// FORMAT NUMBER
// =========================

function formatNumber(number) {
  return new Intl.NumberFormat("en-IN").format(
    Number(number) || 0,
  );
}

// =========================
// TIME AGO
// =========================

function formatTimeAgo(dateString) {
  if (!dateString) {
    return "Recently";
  }

  const date = new Date(dateString);
  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60),
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default Dashboard;