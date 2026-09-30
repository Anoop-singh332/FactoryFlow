import {
  Boxes,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Factory,
  FileText,
  LayoutDashboard,
  PackageCheck,
  Settings2,
  Truck,
  Users,
  Wrench,
  X,
} from "lucide-react";

import { useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar({ open, onClose }) {
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-lime-50 text-black shadow-sm"
        : "text-black hover:bg-slate-50 hover:text-black"
    }`;

  const staticLinkClass =
    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-black transition hover:bg-slate-50 hover:text-black";

  const invoiceSubLinkClass =
    "ml-7 flex w-[calc(100%-1.75rem)] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-black";

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
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Main Menu
          </p>

          <div className="space-y-1">
            {/* ================= 1. DASHBOARD ================= */}

            <NavLink to="/dashboard" onClick={onClose} className={linkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>

            {/* ================= 2. VENDOR ================= */}

            <NavLink to="/vendors" onClick={onClose} className={linkClass}>
              <Users className="h-4 w-4" />
              Vendor
            </NavLink>

            {/* ================= 3. INWARD SUPPLY ================= */}

            <NavLink
              to="/process/inward"
              onClick={onClose}
              className={linkClass}
            >
              <PackageCheck className="h-4 w-4" />
              Inward Supply
            </NavLink>

            {/* ================= 4. INWARD SUPPLY LIST ================= */}

            <NavLink
              to="/process/inward/list"
              onClick={onClose}
              className={linkClass}
            >
              <ClipboardList className="h-4 w-4" />
              Inward Supply List
            </NavLink>

            {/* ================= 5. ITEMS ================= */}

            <NavLink to="/items" onClick={onClose} className={linkClass}>
              <Boxes className="h-4 w-4" />
              Items
            </NavLink>

           <NavLink
  to="/machines"
  onClick={onClose}
  className={linkClass}
>
  <Wrench className="h-4 w-4" />
  Machines
</NavLink>

            {/* ================= 7. OPERATIONS ================= */}

            <NavLink to="/operations" onClick={onClose} className={linkClass}>
              <ClipboardList className="h-4 w-4" />
              Operations
            </NavLink>

            {/* ================= 8. DISPATCH ================= */}

            <NavLink
              to="/process/dispatch"
              onClick={onClose}
              className={linkClass}
            >
              <Truck className="h-4 w-4" />
              Dispatch
            </NavLink>

            {/* ================= 9. INVOICE ================= */}

            <div>
              <button
                type="button"
                onClick={() => setInvoiceOpen((prev) => !prev)}
                className={staticLinkClass}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />

                  <span>Invoice</span>
                </div>

                {invoiceOpen ? (
                  <ChevronDown className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </button>

              {/* ================= INVOICE SUBTABS ================= */}

              {invoiceOpen && (
                <div className="mt-1 space-y-1">
                  {/* Books */}

                  <button type="button" className={invoiceSubLinkClass}>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Books
                  </button>

                  {/* Inventory */}

                  <button type="button" className={invoiceSubLinkClass}>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Inventory
                  </button>

                  {/* Consumables */}

                  <button type="button" className={invoiceSubLinkClass}>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Consumables
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================= SYSTEM ================= */}

          <div className="mt-8">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              System
            </p>

            <button type="button" className={staticLinkClass}>
              <Settings2 className="h-4 w-4" />
              Settings
            </button>
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

            <p className="mt-2 text-[10px] text-black">FactoryFlow v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
