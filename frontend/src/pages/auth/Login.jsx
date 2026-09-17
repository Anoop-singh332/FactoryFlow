import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Factory,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Activity,
  Boxes,
  Truck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");

  const result = await login(
    form.email,
    form.password
  );

  if (!result.success) {
    setError(result.message);
    return;
  }

  navigate("/dashboard");
};

  return (
    <div className="ff-grid relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-emerald-400/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a1510]/90 shadow-2xl shadow-black/40 lg:grid-cols-2">
          {/* =====================================================
              LEFT SIDE
          ====================================================== */}

          <div className="relative hidden min-h-[680px] overflow-hidden border-r border-white/10 p-10 lg:block xl:p-14">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/[0.07] via-transparent to-emerald-400/[0.04]" />

            <div className="relative z-10 flex h-full flex-col">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/10 shadow-lg shadow-lime-300/5">
                  <Factory className="h-5 w-5 text-lime-300" />
                </div>

                <div>
                  <p className="text-lg font-bold tracking-tight">
                    Factory<span className="text-lime-300">Flow</span>
                  </p>

                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                    Industrial Operations
                  </p>
                </div>
              </div>

              {/* Hero */}
              <div className="mt-auto">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-300/15 bg-lime-300/[0.06] px-3 py-1.5 text-xs text-lime-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime-300 ff-pulse" />
                  Factory operations platform
                </div>

                <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                  Manage your factory.
                  <br />
                  <span className="text-lime-300">
                    Move production forward.
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 text-white/45">
                  A unified workspace for inward material, production, quality
                  inspection and dispatch operations.
                </p>

                {/* Stats */}
                <div className="mt-10 grid grid-cols-3 gap-3">
                  <div className="ff-card ff-card-hover ff-float rounded-2xl p-4">
                    <Boxes className="h-5 w-5 text-lime-300" />

                    <p className="mt-5 text-xs text-white/40">Inward</p>

                    <p className="mt-1 text-xl font-semibold">248</p>
                  </div>

                  <div
                    className="ff-card ff-card-hover rounded-2xl p-4"
                    style={{ animationDelay: "0.8s" }}
                  >
                    <Activity className="h-5 w-5 text-lime-300" />

                    <p className="mt-5 text-xs text-white/40">Production</p>

                    <p className="mt-1 text-xl font-semibold">1.8K</p>
                  </div>

                  <div
                    className="ff-card ff-card-hover rounded-2xl p-4"
                    style={{ animationDelay: "1.4s" }}
                  >
                    <Truck className="h-5 w-5 text-lime-300" />

                    <p className="mt-5 text-xs text-white/40">Dispatch</p>

                    <p className="mt-1 text-xl font-semibold">126</p>
                  </div>
                </div>

                <div className="mt-7 flex items-center gap-2 text-xs text-white/30">
                  <ShieldCheck className="h-4 w-4 text-lime-300/70" />
                  Designed for controlled factory operations
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE
          ====================================================== */}

          <div className="flex min-h-[680px] items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              {/* Mobile Brand */}
              <div className="mb-10 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/10">
                  <Factory className="h-5 w-5 text-lime-300" />
                </div>

                <div>
                  <p className="text-lg font-bold">
                    Factory<span className="text-lime-300">Flow</span>
                  </p>

                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                    Industrial Operations
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div>
                <p className="text-sm font-medium text-lime-300">
                  Welcome back
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  Sign in to FactoryFlow
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  Access your factory operations dashboard.
                </p>
              </div>

              {/* =================================================
                  FORM
              ================================================== */}

              <form onSubmit={handleSubmit} className="mt-9 space-y-6">
                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {/* EMAIL */}
                <div>
                  <label htmlFor="email" className="ff-label">
                    Email address
                  </label>

                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@factoryflow.com"
                      autoComplete="email"
                      className="ff-input pl-12"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label htmlFor="password" className="ff-label">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="ff-input pl-12 pr-12"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/5 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* OPTIONS */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex cursor-pointer items-center gap-2 text-white/40">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-white/10 bg-white/5 accent-lime-300"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="text-lime-300 transition hover:text-lime-200"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 text-sm font-bold text-[#09110c] shadow-lg shadow-lime-300/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-200 hover:shadow-xl hover:shadow-lime-300/20 active:translate-y-0 active:scale-[0.99]"
                >
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </form>

              {/* Footer */}
              <p className="mt-8 text-center text-xs text-white/25">
                FactoryFlow Operations Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
