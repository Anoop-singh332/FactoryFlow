import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import InwardSupply from "../pages/inward/InwardSupply";
import ProductionRecord from "../pages/production/ProductionRecord";
import QualityInspection from "../pages/quality/QualityInspection";
import Dispatch from "../pages/dispatch/Dispatch";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/process/inward" element={<InwardSupply />} />

        <Route path="/process/production" element={<ProductionRecord />} />

        <Route path="/process/quality" element={<QualityInspection />} />

        <Route path="/process/dispatch" element={<Dispatch />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;