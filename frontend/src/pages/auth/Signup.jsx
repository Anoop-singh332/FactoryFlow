import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Factory,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
  });

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Signup failed");
        return;
      }

      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (error) {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
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

              {/* Content */}
              <div className="mt-auto">
                <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-200 bg-lime-50 px-3 py-1.5 text-xs font-medium text-lime-700">
                  Create your account
                </p>

                <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight text-black xl:text-5xl">
                  Join FactoryFlow.
                  <br />

                  <span className="text-lime-600">
                    Manage operations better.
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">
                  Manage inward material, production, quality inspection and
                  dispatch operations from one platform.
                </p>

                {/* Small feature boxes */}
                <div className="mt-8 grid max-w-lg grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-lg font-bold text-black">01</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Material Flow
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-lg font-bold text-black">02</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Production
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-lg font-bold text-black">03</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Quality Control
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-lg font-bold text-black">04</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Dispatch
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex min-h-[680px] items-center justify-center bg-white p-6 sm:p-10">
            <div className="w-full max-w-md">

              {/* Mobile Logo */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-200 bg-lime-50">
                  <Factory className="h-5 w-5 text-lime-600" />
                </div>

                <p className="text-lg font-bold text-black">
                  Factory
                  <span className="text-lime-600">Flow</span>
                </p>
              </div>

              {/* Heading */}
              <div>
                <p className="text-sm font-semibold text-lime-600">
                  Get started
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-black">
                  Create your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Create an account to access FactoryFlow.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Full name
                  </label>

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-100"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@factoryflow.com"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-100"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-100"
                      minLength={6}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Role
                  </label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-100"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-lime-500 px-5 text-sm font-bold text-white shadow-lg shadow-lime-500/15 transition-all hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create account"}

                  {!loading && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              {/* Login */}
              <p className="mt-6 text-center text-xs text-slate-500">
                Already have an account?{" "}

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold text-lime-600 transition hover:text-lime-700"
                >
                  Sign in
                </button>
              </p>

              <p className="mt-6 text-center text-xs text-slate-400">
                FactoryFlow Operations Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;