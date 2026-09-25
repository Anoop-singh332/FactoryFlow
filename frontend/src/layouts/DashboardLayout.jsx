import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-black">

      {/* ================= SIDEBAR ================= */}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ================= MAIN AREA ================= */}

      <div className="lg:pl-[260px]">

        {/* ================= HEADER ================= */}

        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* ================= PAGE CONTENT ================= */}

        <main className="min-h-[calc(100vh-73px)] bg-[#F8FAF9] px-4 py-5 text-black sm:px-6 lg:px-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;