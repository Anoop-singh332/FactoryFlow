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
    <header className="sticky top-0 z-30 flex h-[73px] items-center border-b border-white/[0.07] bg-[#07100d]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        onClick={onMenuClick}
        className="mr-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 text-white/60 lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="hidden max-w-md flex-1 sm:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

          <input
            placeholder="Search operations..."
            className="h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-lime-300/30"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button className="relative rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 text-white/45 transition hover:bg-white/[0.05] hover:text-white">
          <Bell className="h-4 w-4" />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-lime-300" />
        </button>

        <div className="h-7 w-px bg-white/[0.07]" />

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-white/75">
              {user?.name || "Administrator"}
            </p>

            <p className="text-[10px] text-white/30">
              {user?.role || "Administrator"}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-lime-300/15 bg-lime-300/10 text-xs font-bold text-lime-300">
            FF
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="hidden rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white sm:block"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;