import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { key: "admin", label: "Admin", desc: "Manage everything", color: "bg-ink text-surface" },
  { key: "developer", label: "Developer", desc: "Fix issues", color: "bg-accent text-[#1a0f00]" },
  { key: "user", label: "User", desc: "Report issues", color: "bg-signal-blue/30 text-signal-blue" },
];

const HOME_BY_ROLE = { admin: "/dashboard", developer: "/developer", user: "/user" };

const DEMO_ACCOUNTS = {
  admin: { email: "admin@gmail.com", password: "password123" },
  developer: { email: "dana@example.com", password: "password123" },
  user: { email: "riya@example.com", password: "password123" },
};

export default function Login() {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.post("/auth/login", { email, password });
      login(data);
      navigate(HOME_BY_ROLE[data.user.role] || "/");
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3eb] flex flex-col">

      {/* Header */}
      <header className="w-full px-6 md:px-12 lg:px-20 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 border border-black/40 rounded-lg flex items-center justify-center font-medium">
              ／
            </div>

            <span className="text-lg font-semibold text-black">
              FeatureForge
            </span>
          </Link>

          <Link
            to="/"
            className="text-sm text-black/60 hover:text-black transition"
          >
            Back to home
          </Link>

        </div>
      </header>

      {/* Login section */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">

        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 border border-black/10 bg-white/40 rounded-full px-3 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>

              <span className="text-sm text-black/60">
                Secure workspace access
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-black">
              Welcome back.
            </h1>

            <p className="mt-4 text-black/55 text-base leading-relaxed">
              Sign in to your workspace portal.
            </p>
          </div>

          {/* Role selector */}
          <div className="flex gap-2 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => {
                  setRole(r.key);
                  setEmail(DEMO_ACCOUNTS[r.key].email);
                  setPassword(DEMO_ACCOUNTS[r.key].password);
                }}
                className={`flex-1 rounded-xl px-3 py-3 text-center transition-all border ${
                  role === r.key
                    ? `${r.color} border-transparent shadow-sm scale-[1.02]`
                    : "bg-white/50 border-black/10 text-black/50 hover:bg-white/80"
                }`}
              >
                <p className="text-sm font-semibold">{r.label}</p>
                <p className={`text-[0.65rem] mt-0.5 ${role === r.key ? "opacity-80" : "opacity-50"}`}>
                  {r.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white/70 border border-black/10 rounded-2xl p-7 shadow-sm">

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${role}@example.com`}
                  required
                  className="
                    w-full
                    bg-white
                    border border-black/15
                    rounded-xl
                    px-4 py-3
                    text-black
                    placeholder:text-black/30
                    outline-none
                    focus:border-black/50
                    focus:ring-2
                    focus:ring-black/5
                    transition
                  "
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="
                    w-full
                    bg-white
                    border border-black/15
                    rounded-xl
                    px-4 py-3
                    text-black
                    placeholder:text-black/30
                    outline-none
                    focus:border-black/50
                    focus:ring-2
                    focus:ring-black/5
                    transition
                  "
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  bg-black
                  text-white
                  rounded-xl
                  py-3.5
                  font-medium
                  hover:bg-black/85
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  transition
                  cursor-pointer
                "
              >
                {loading ? "Signing in..." : "Sign in →"}
              </button>

            </form>

          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-black/40">
              Protected by FeatureForge authentication
            </p>
            <Link
              to="/register"
              className="text-xs font-medium text-black/60 hover:text-black transition underline underline-offset-2"
            >
              Create account
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}