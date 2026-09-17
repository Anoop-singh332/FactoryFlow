import {
  Activity,
  Boxes,
  ClipboardCheck,
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
    name: "Quality Check",
    path: "/process/quality",
    icon: ClipboardCheck,
  },
  {
    name: "Production Record",
    path: "/process/production",
    icon: Activity,
  },
{
    name: "Dispatch",
    path: "/process/dispatch",
    icon: Truck,
  },
];

function Sidebar({ open, onClose }) {
  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
      isActive
        ? "bg-lime-300/10 text-lime-300"
        : "text-white/45 hover:bg-white/[0.04] hover:text-white"
    }`;

  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.07] bg-[#09130f]/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[73px] items-center justify-between border-b border-white/[0.07] px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-lime-300/20 bg-lime-300/10">
              <Factory className="h-4.5 w-4.5 text-lime-300" />
            </div>

            <div>
              <p className="font-bold tracking-tight">
                Factory<span className="text-lime-300">Flow</span>
              </p>

              <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                Operations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
            Workspace
          </p>

          <NavLink to="/dashboard" onClick={onClose} className={linkClass}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>

          <div className="mt-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
              Process Management
            </p>

            <div className="space-y-1">
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

          <div className="mt-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
              Management
            </p>

            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/35">
                <Boxes className="h-4 w-4" />
                Items
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[9px]">
                  Soon
                </span>
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/35">
                <Users className="h-4 w-4" />
                Vendors
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[9px]">
                  Soon
                </span>
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/35">
                <ClipboardList className="h-4 w-4" />
                Employees
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[9px]">
                  Soon
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
              System
            </p>

            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/35">
                <FileBarChart className="h-4 w-4" />
                Reports
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/35">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.07] p-4">
          <div className="rounded-2xl border border-lime-300/10 bg-lime-300/[0.035] p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-lime-300 ff-pulse" />

              <span className="text-xs font-medium text-white/60">
                System Online
              </span>
            </div>

            <p className="mt-2 text-[10px] text-white/25">FactoryFlow v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
