import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";

import InwardSupply from "../pages/inward/InwardSupply";
import InwardSupplyList from "../pages/inward/InwardSupplyList";

import Vendors from "../pages/vendor/Vendors";

import ProductionRecord from "../pages/production/ProductionRecord";
import FinalProduction from "../pages/production/FinalProduction";

import QualityInspection from "../pages/quality/QualityInspection";
import Dispatch from "../pages/dispatch/Dispatch";

import Items from "../pages/masters/Items";

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
      {/* =========================
          AUTHENTICATION ROUTES
      ========================= */}

      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />
      </Route>

      {/* =========================
          PROTECTED DASHBOARD ROUTES
      ========================= */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* =========================
            MASTERS
        ========================= */}

        <Route
          path="/items"
          element={<Items />}
        />

        {/* =========================
            VENDOR MANAGEMENT
        ========================= */}

        <Route
          path="/vendors"
          element={<Vendors />}
        />

        {/* =========================
            INWARD SUPPLY
        ========================= */}

        <Route
          path="/process/inward"
          element={<InwardSupply />}
        />

        <Route
          path="/process/inward/list"
          element={<InwardSupplyList />}
        />

        {/* =========================
            PRODUCTION
        ========================= */}

        <Route
          path="/process/production"
          element={<ProductionRecord />}
        />

        <Route
          path="/process/final-production"
          element={<FinalProduction />}
        />

        {/* =========================
            QUALITY INSPECTION
        ========================= */}

        <Route
          path="/process/quality"
          element={<QualityInspection />}
        />

        {/* =========================
            DISPATCH
        ========================= */}

        <Route
          path="/process/dispatch"
          element={<Dispatch />}
        />
      </Route>

      {/* =========================
          UNKNOWN ROUTE
      ========================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;