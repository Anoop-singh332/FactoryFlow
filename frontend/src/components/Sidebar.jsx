import {
  Boxes,
  ClipboardList,
  Factory,
  FileBarChart,
  LayoutDashboard,
  PackageCheck,
  Settings,
  Truck,
  Users,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const processLinks = [
  {
    name: "Inward Supply",
    path: "/process/inward",
    icon: PackageCheck,
  },
  {
    name: "Inward Supply List",
    path: "/process/inward/list",
    icon: ClipboardList,
  },

  
  {
    name: "Final Production",
    path: "/process/final-production",
    icon: Factory,
  },
  {
    name: "Dispatch",
    path: "/process/dispatch",
    icon: Truck,
  },
];

function Sidebar({ open, onClose }) {
  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-lime-50 text-black shadow-sm"
        : "text-black hover:bg-slate-50 hover:text-black"
    }`;

  return (
    <>
      {/* ================= MOBILE OVERLAY ================= */}

      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white shadow-[4px_0_20px_rgba(15,23,42,0.04)] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ================= HEADER ================= */}

        <div className="flex h-[73px] items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-lime-200 bg-lime-50">
              <Factory className="h-4.5 w-4.5 text-lime-600" />
            </div>

            <div>
              <p className="font-bold tracking-tight text-black">
                Factory
                <span className="text-lime-600">Flow</span>
              </p>

              <p className="text-[9px] uppercase tracking-[0.2em] text-black">
                Operations
              </p>
            </div>
          </div>

          {/* Mobile close */}

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-black transition hover:bg-slate-100 hover:text-black lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ================= NAVIGATION ================= */}

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {/* ================= WORKSPACE ================= */}

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
            Workspace
          </p>

          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={linkClass}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>

          {/* ================= PROCESS MANAGEMENT ================= */}

          <div className="mt-6">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
              Process Management
            </p>

            <div className="space-y-1">
              {/* Vendors */}

              <NavLink
                to="/vendors"
                onClick={onClose}
                className={linkClass}
              >
                <Users className="h-4 w-4" />
                Vendors
              </NavLink>

              {/* Process Links */}

              {processLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={linkClass}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* ================= MANAGEMENT ================= */}

          <div className="mt-6">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
              Management
            </p>

            <div className="space-y-1">
              {/* Items */}

              <NavLink
                to="/items"
                onClick={onClose}
                className={linkClass}
              >
                <Boxes className="h-4 w-4" />
                Items
              </NavLink>
            </div>
          </div>

          {/* ================= SYSTEM ================= */}

          <div className="mt-6">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
              System
            </p>

            <div className="space-y-1">
              {/* Reports */}

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-black transition hover:bg-slate-50 hover:text-black"
              >
                <FileBarChart className="h-4 w-4" />
                Reports
              </button>

              {/* Settings */}

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-black transition hover:bg-slate-50 hover:text-black"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}

        <div className="border-t border-slate-200 bg-white p-4">
          <div className="rounded-2xl border border-lime-200 bg-lime-50/60 p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-lime-500 ff-pulse" />

              <span className="text-xs font-semibold text-black">
                System Online
              </span>
            </div>

            <p className="mt-2 text-[10px] text-black">
              FactoryFlow v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;