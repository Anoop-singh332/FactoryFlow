import {
  Bell,
  Menu,
  Search,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Header({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-[73px] items-center border-b border-slate-200 bg-white px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">

      {/* ================= MOBILE MENU ================= */}

      <button
        onClick={onMenuClick}
        className="mr-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-black transition hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* ================= SEARCH ================= */}

      <div className="hidden max-w-md flex-1 sm:block">
        <div className="relative">

          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />

          <input
            placeholder="Search operations..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-black outline-none placeholder:text-slate-500 transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
          />

        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}

      <div className="ml-auto flex items-center gap-2 sm:gap-4">

        {/* ================= NOTIFICATION ================= */}

        <button
          type="button"
          className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-black shadow-sm transition hover:bg-slate-50 hover:text-black"
        >
          <Bell className="h-4 w-4" />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-lime-500" />
        </button>

        {/* ================= DIVIDER ================= */}

        <div className="h-7 w-px bg-slate-200" />

        {/* ================= USER ================= */}

        <div className="flex items-center gap-3">

          {/* User Details */}

          <div className="hidden text-right sm:block">

            <p className="text-xs font-bold text-black">
              {user?.name || "Administrator"}
            </p>

            <p className="text-[10px] font-medium text-black">
              {user?.role || "Administrator"}
            </p>

          </div>

          {/* ================= AVATAR ================= */}

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-500 text-xs font-bold text-white shadow-sm">
            FF
          </div>

          {/* ================= LOGOUT ================= */}

          <button
            onClick={logout}
            title="Sign out"
            className="hidden rounded-lg p-1.5 text-black transition hover:bg-slate-100 sm:block"
          >
            <ChevronDown className="h-4 w-4" />
          </button>

        </div>
      </div>
    </header>
  );
}

export default Header;