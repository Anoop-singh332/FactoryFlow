import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07100d]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[260px]">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-73px)] px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;