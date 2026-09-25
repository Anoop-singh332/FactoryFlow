import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Boxes,
  Eye,
  EyeOff,
  Factory,
  LockKeyhole,
  Mail,
  ShieldCheck,
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
      form.password,
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-black">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-emerald-400/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-2">

          {/* LEFT PANEL */}
          <div className="relative hidden min-h-[680px] overflow-hidden border-r border-slate-200 bg-[#F8FAF9] p-10 lg:block xl:p-14">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/[0.08] via-transparent to-emerald-400/[0.04]" />

            <div className="relative z-10 flex h-full flex-col">

              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-200 bg-lime-50">
                  <Factory className="h-5 w-5 text-lime-600" />
                </div>

                <div>
                  <p className="text-lg font-bold tracking-tight text-black">
                    Factory
                    <span className="text-lime-600">Flow</span>
                  </p>

                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                    Industrial Operations
                  </p>
                </div>
              </div>

              {/* Main content */}
              <div className="mt-auto">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-200 bg-lime-50 px-3 py-1.5 text-xs font-medium text-lime-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime-500 ff-pulse" />
                  Factory operations platform
                </div>

                <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight text-black xl:text-5xl">
                  Manage your factory.
                  <br />

                  <span className="text-lime-600">
                    Move production forward.
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">
                  A unified workspace for inward material, production,
                  quality inspection and dispatch operations.
                </p>

                {/* Stats */}
                <div className="mt-10 grid grid-cols-3 gap-3">

                  {/* Inward */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <Boxes className="h-5 w-5 text-lime-600" />

                    <p className="mt-5 text-xs text-slate-400">
                      Inward
                    </p>

                    <p className="mt-1 text-xl font-semibold text-black">
                      248
                    </p>
                  </div>

                  {/* Production */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <Activity className="h-5 w-5 text-lime-600" />

                    <p className="mt-5 text-xs text-slate-400">
                      Production
                    </p>

                    <p className="mt-1 text-xl font-semibold text-black">
                      1.8K
                    </p>
                  </div>

                  {/* Dispatch */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <Truck className="h-5 w-5 text-lime-600" />

                    <p className="mt-5 text-xs text-slate-400">
                      Dispatch
                    </p>

                    <p className="mt-1 text-xl font-semibold text-black">
                      126
                    </p>
                  </div>

                </div>

                <div className="mt-7 flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-lime-600" />
                  Designed for controlled factory operations
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex min-h-[680px] items-center justify-center bg-white p-6 sm:p-10">
            <div className="w-full max-w-md">

              {/* Mobile Logo */}
              <div className="mb-10 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-200 bg-lime-50">
                  <Factory className="h-5 w-5 text-lime-600" />
                </div>

                <div>
                  <p className="text-lg font-bold text-black">
                    Factory
                    <span className="text-lime-600">Flow</span>
                  </p>

                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                    Industrial Operations
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div>
                <p className="text-sm font-semibold text-lime-600">
                  Welcome back
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-black">
                  Sign in to FactoryFlow
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Access your factory operations dashboard.
                </p>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="mt-9 space-y-6"
              >

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@factoryflow.com"
                      autoComplete="email"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-100"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-100"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between text-xs">

                  <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-500">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300 accent-lime-500"
                    />

                    Remember me
                  </label>

                  <button
                    type="button"
                    className="font-medium text-lime-600 transition hover:text-lime-700"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-lime-500 px-5 text-sm font-bold text-white shadow-lg shadow-lime-500/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-600 hover:shadow-xl hover:shadow-lime-500/20 active:translate-y-0 active:scale-[0.99]"
                >
                  Sign in

                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>

                {/* Signup */}
                <p className="mt-6 text-center text-xs text-slate-500">
                  Don't have an account?{" "}

                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="font-semibold text-lime-600 transition hover:text-lime-700"
                  >
                    Create account
                  </button>
                </p>
              </form>

              <p className="mt-8 text-center text-xs text-slate-400">
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