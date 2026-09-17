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
    <div className="ff-grid relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-emerald-400/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a1510]/90 shadow-2xl shadow-black/40 lg:grid-cols-2">
          <div className="relative hidden min-h-[680px] overflow-hidden border-r border-white/10 p-10 lg:block xl:p-14">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/[0.07] via-transparent to-emerald-400/[0.04]" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/10">
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

              <div className="mt-auto">
                <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-300/15 bg-lime-300/[0.06] px-3 py-1.5 text-xs text-lime-200">
                  Create your account
                </p>

                <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                  Join FactoryFlow.
                  <br />
                  <span className="text-lime-300">
                    Manage operations better.
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 text-white/45">
                  Manage inward material, production, quality inspection and
                  dispatch operations from one platform.
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[680px] items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/10">
                  <Factory className="h-5 w-5 text-lime-300" />
                </div>

                <p className="text-lg font-bold">
                  Factory<span className="text-lime-300">Flow</span>
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-lime-300">Get started</p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  Create your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  Create an account to access FactoryFlow.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {error && (
                  <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <div>
                  <label className="ff-label">Full name</label>

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="ff-input pl-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="ff-label">Email address</label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@factoryflow.com"
                      className="ff-input pl-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="ff-label">Password</label>

                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="ff-input pl-12 pr-12"
                      minLength={6}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/30 hover:bg-white/5 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="ff-label">Role</label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="ff-input"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 text-sm font-bold text-[#09110c] shadow-lg shadow-lime-300/10 transition-all hover:bg-lime-200 disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create account"}

                  {!loading && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-white/40">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-lime-300 hover:text-lime-200"
                >
                  Sign in
                </button>
              </p>

              <p className="mt-6 text-center text-xs text-white/25">
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
