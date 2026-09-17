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

const API_URL = "http://localhost:5000/api";

function Dashboard() {
  const [inwardSupplies, setInwardSupplies] =
    useState([]);

  const [productions, setProductions] =
    useState([]);

  const [qualityInspections, setQualityInspections] =
    useState([]);

  const [dispatches, setDispatches] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem(
        "factoryflow_token"
      );

      if (!token) {
        setError(
          "Authentication token not found. Please login again."
        );

        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch all factory modules together
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

      // Convert all responses to JSON
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

      // Check for API errors
      if (!inwardResponse.ok) {
        throw new Error(
          inwardData.message ||
            "Failed to load inward data."
        );
      }

      if (!productionResponse.ok) {
        throw new Error(
          productionData.message ||
            "Failed to load production data."
        );
      }

      if (!qualityResponse.ok) {
        throw new Error(
          qualityData.message ||
            "Failed to load quality data."
        );
      }

      if (!dispatchResponse.ok) {
        throw new Error(
          dispatchData.message ||
            "Failed to load dispatch data."
        );
      }

      // Store data
      setInwardSupplies(
        inwardData.data || []
      );

      setProductions(
        productionData.data || []
      );

      setQualityInspections(
        qualityData.data || []
      );

      setDispatches(
        dispatchData.data || []
      );
    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      );

      setError(
        error.message ||
          "Unable to load dashboard data."
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
          item.materialWeight || 0
        ),
      0
    );
  }, [inwardSupplies]);

  const totalProductionPieces =
    useMemo(() => {
      return productions.reduce(
        (total, production) =>
          total +
          Number(
            production.numberOfPieces ||
              0
          ),
        0
      );
    }, [productions]);

  const totalDispatchWeight =
    useMemo(() => {
      return dispatches.reduce(
        (total, dispatch) =>
          total +
          Number(
            dispatch.weight || 0
          ),
        0
      );
    }, [dispatches]);

  const passedQuality =
    useMemo(() => {
      return qualityInspections.filter(
        (inspection) =>
          inspection.qualityResult ===
          "Passed"
      ).length;
    }, [qualityInspections]);

  const failedQuality =
    useMemo(() => {
      return qualityInspections.filter(
        (inspection) =>
          inspection.qualityResult ===
          "Failed"
      ).length;
    }, [qualityInspections]);

  const pendingQuality =
    useMemo(() => {
      return qualityInspections.filter(
        (inspection) =>
          inspection.qualityResult ===
          "Pending"
      ).length;
    }, [qualityInspections]);

  // =========================
  // RECENT ACTIVITY
  // =========================

  const recentActivity = useMemo(() => {
    const activities = [];

    // Inward activities
    inwardSupplies.forEach((item) => {
      activities.push({
        id: `inward-${item._id}`,
        title: "Material received",
        detail: `${item.materialItemName} • ${item.invoiceNumber}`,
        time: item.createdAt,
        type: "Inward",
      });
    });

    // Production activities
    productions.forEach((production) => {
      activities.push({
        id: `production-${production._id}`,
        title: "Production recorded",
        detail: `${production.itemName} • ${production.numberOfPieces} pieces`,
        time: production.createdAt,
        type: "Production",
      });
    });

    // Quality activities
    qualityInspections.forEach(
      (inspection) => {
        activities.push({
          id: `quality-${inspection._id}`,
          title: "Quality inspection",
          detail: `${inspection.inspectionReport} • ${inspection.qualityResult}`,
          time: inspection.createdAt,
          type: "Quality",
        });
      }
    );

    // Dispatch activities
    dispatches.forEach((dispatch) => {
      const itemNames =
        dispatch.items
          ?.map(
            (item) =>
              item.itemName
          )
          .join(", ") || "Items";

      activities.push({
        id: `dispatch-${dispatch._id}`,
        title: "Dispatch recorded",
        detail: `${itemNames} • ${dispatch.deliveryChallan}`,
        time: dispatch.createdAt,
        type: "Dispatch",
      });
    });

    // Sort newest first
    activities.sort(
      (a, b) =>
        new Date(b.time) -
        new Date(a.time)
    );

    return activities.slice(0, 6);
  }, [
    inwardSupplies,
    productions,
    qualityInspections,
    dispatches,
  ]);

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* =========================
          PAGE HEADER
      ========================= */}

      <PageHeader
        eyebrow="Factory overview"
        title="Operations Dashboard"
        description="Monitor material flow, production activity, quality inspections and dispatch operations from one workspace."
      />

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={
              fetchDashboardData
            }
            className="flex items-center gap-2 rounded-lg border border-red-300/10 px-3 py-2 text-xs hover:bg-red-300/5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* =========================
          STATS
      ========================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Inward Material"
          value={
            loading
              ? "..."
              : inwardSupplies.length
          }
          change="Live"
          description="records"
          icon={PackageCheck}
        />

        <StatCard
          title="Material Received"
          value={
            loading
              ? "..."
              : formatNumber(
                  totalInwardWeight
                )
          }
          change="Live"
          description="total weight"
          icon={Boxes}
        />

        <StatCard
          title="Production Output"
          value={
            loading
              ? "..."
              : formatNumber(
                  totalProductionPieces
                )
          }
          change="Live"
          description="pieces"
          icon={Activity}
        />

        <StatCard
          title="Dispatched"
          value={
            loading
              ? "..."
              : dispatches.length
          }
          change="Live"
          description="deliveries"
          icon={Truck}
        />
      </div>

      {/* =========================
          QUALITY SUMMARY
      ========================= */}

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
            loading
              ? "..."
              : passedQuality
          }
          icon={PackageCheck}
        />

        <MiniStat
          title="Failed Quality"
          value={
            loading
              ? "..."
              : failedQuality
          }
          icon={AlertCircle}
        />

        <MiniStat
          title="Pending Quality"
          value={
            loading
              ? "..."
              : pendingQuality
          }
          icon={RefreshCw}
        />
      </div>

      {/* =========================
          MAIN SECTION
      ========================= */}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* =========================
            FACTORY FLOW
        ========================= */}

        <div className="ff-card relative min-h-[420px] overflow-hidden rounded-2xl p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="ff-section-title">
                Factory Flow
              </p>

              <p className="mt-1 text-xs text-white/30">
                Live operational overview
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-lime-300/10 bg-lime-300/[0.04] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300 ff-pulse" />

              <span className="text-[10px] text-lime-200">
                {loading
                  ? "Loading"
                  : "Operational"}
              </span>
            </div>
          </div>

          <div className="ff-grid relative mt-6 flex min-h-[310px] items-center justify-center overflow-hidden rounded-2xl border border-white/[0.05] bg-[#07100d]/60">
            {/* Decorative floor */}

            <div className="absolute bottom-8 left-1/2 h-32 w-[75%] -translate-x-1/2 rounded-[50%] border border-lime-300/[0.08] bg-lime-300/[0.015] shadow-[0_0_80px_rgba(163,230,53,0.04)]" />

            {/* Flow Nodes */}

            <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 gap-3 px-5 md:grid-cols-4">
              <FactoryNode
                label="INWARD"
                value={
                  loading
                    ? "..."
                    : inwardSupplies.length
                }
                status={
                  inwardSupplies.length >
                  0
                    ? "Receiving"
                    : "No records"
                }
                active={
                  inwardSupplies.length >
                  0
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
                  productions.length >
                  0
                    ? `${formatNumber(
                        totalProductionPieces
                      )} pieces`
                    : "No records"
                }
                active={
                  productions.length >
                  0
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
                  qualityInspections.length >
                  0
                    ? `${passedQuality} passed`
                    : "No records"
                }
                active={
                  qualityInspections.length >
                  0
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
                  dispatches.length >
                  0
                    ? `${formatNumber(
                        totalDispatchWeight
                      )} weight`
                    : "No records"
                }
                active={
                  dispatches.length >
                  0
                }
              />
            </div>

            {/* Flow Lines */}

            <div className="pointer-events-none absolute left-[22%] top-1/2 hidden h-px w-[5%] bg-gradient-to-r from-lime-300/20 to-lime-300/40 md:block" />

            <div className="pointer-events-none absolute left-[47%] top-1/2 hidden h-px w-[5%] bg-gradient-to-r from-lime-300/20 to-lime-300/40 md:block" />

            <div className="pointer-events-none absolute right-[22%] top-1/2 hidden h-px w-[5%] bg-gradient-to-l from-lime-300/20 to-lime-300/40 md:block" />
          </div>
        </div>

        {/* =========================
            RECENT ACTIVITY
        ========================= */}

        <div className="ff-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="ff-section-title">
                Recent Activity
              </p>

              <p className="mt-1 text-xs text-white/30">
                Latest factory operations
              </p>
            </div>

            <button
              type="button"
              onClick={
                fetchDashboardData
              }
              disabled={loading}
              className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-lime-300 disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>
          </div>

          <div className="mt-5 divide-y divide-white/[0.05]">
            {loading ? (
              <div className="py-10 text-center text-xs text-white/30">
                Loading activity...
              </div>
            ) : recentActivity.length ===
              0 ? (
              <div className="py-10 text-center">
                <Activity className="mx-auto h-7 w-7 text-white/15" />

                <p className="mt-3 text-xs text-white/30">
                  No factory activity yet
                </p>

                <p className="mt-1 text-[10px] text-white/20">
                  Create records to see activity here.
                </p>
              </div>
            ) : (
              recentActivity.map(
                (activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.035]">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium text-white/75">
                          {
                            activity.title
                          }
                        </p>

                        <span className="shrink-0 text-[9px] text-white/25">
                          {formatTimeAgo(
                            activity.time
                          )}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-[10px] text-white/30">
                        {
                          activity.detail
                        }
                      </p>

                      <span className="mt-2 inline-block rounded-md bg-white/[0.035] px-2 py-1 text-[9px] text-white/35">
                        {
                          activity.type
                        }
                      </span>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>

      {/* =========================
          BOTTOM SUMMARY
      ========================= */}

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
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
                  totalProductionPieces
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
                  totalDispatchWeight
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
      className={`relative rounded-2xl border p-4 backdrop-blur-xl ${
        active
          ? "border-lime-300/20 bg-lime-300/[0.06] shadow-[0_0_35px_rgba(163,230,53,0.06)]"
          : "border-white/[0.07] bg-[#0b1711]/90"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold tracking-[0.14em] text-white/35">
          {label}
        </span>

        <span
          className={`h-1.5 w-1.5 ${
            active
              ? "bg-lime-300 ff-pulse"
              : "bg-white/20"
          }`}
        />
      </div>

      <p className="mt-5 text-xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-white/30">
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-white/30">
          {title}
        </p>

        <Icon className="h-4 w-4 text-white/25" />
      </div>

      <p className="mt-3 text-xl font-semibold text-white">
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
    <div className="ff-card ff-card-hover rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/35">
          {title}
        </p>

        <ArrowUpRight className="h-4 w-4 text-lime-300/60" />
      </div>

      <p className="mt-4 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-lime-300/70">
        {detail}
      </p>
    </div>
  );
}

// =========================
// FORMAT NUMBER
// =========================

function formatNumber(number) {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(number);
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
    now.getTime() -
    date.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  return `${days} day${
    days > 1 ? "s" : ""
  } ago`;
}

export default Dashboard;