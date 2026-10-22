import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const HOME_BY_ROLE = { admin: "/dashboard", developer: "/developer", user: "/user" };

const ROLES = [
  { key: "developer", label: "Developer", desc: "Fix & resolve issues", color: "bg-accent text-[#1a0f00]" },
  { key: "user", label: "User", desc: "Report issues", color: "bg-signal-blue/30 text-signal-blue" },
];

export default function Register() {
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const data = await api.post("/auth/register", { name, email, password, role });
      login(data);
      navigate(HOME_BY_ROLE[data.user.role] || "/");
    } catch (err) {
      setError(err.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3eb] flex flex-col">

      {/* Header */}
      <header className="w-full px-6 md:px-12 lg:px-20 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 border border-black/40 rounded-lg flex items-center justify-center font-medium">
              ／
            </div>
            <span className="text-lg font-semibold text-black">
              FeatureForge
            </span>
          </Link>

          <Link
            to="/login"
            className="text-sm text-black/60 hover:text-black transition"
          >
            Already have an account?
          </Link>

        </div>
      </header>

      {/* Register section */}
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 border border-black/10 bg-white/40 rounded-full px-3 py-1.5 mb-6">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
              <span className="text-sm text-black/60">Join FeatureForge</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-black">
              Create account.
            </h1>

            <p className="mt-4 text-black/55 text-base leading-relaxed">
              Choose your role and get started
            </p>
          </div>

          {/* Role selector */}
          <div className="flex gap-2 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
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

            <form onSubmit={handleRegister} className="space-y-4">

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-white border border-black/15 rounded-xl px-4 py-3 text-black placeholder:text-black/30 outline-none focus:border-black/50 focus:ring-2 focus:ring-black/5 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${role}@example.com`}
                  required
                  className="w-full bg-white border border-black/15 rounded-xl px-4 py-3 text-black placeholder:text-black/30 outline-none focus:border-black/50 focus:ring-2 focus:ring-black/5 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-white border border-black/15 rounded-xl px-4 py-3 text-black placeholder:text-black/30 outline-none focus:border-black/50 focus:ring-2 focus:ring-black/5 transition"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-black mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full bg-white border border-black/15 rounded-xl px-4 py-3 text-black placeholder:text-black/30 outline-none focus:border-black/50 focus:ring-2 focus:ring-black/5 transition"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Register */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white rounded-xl py-3.5 font-medium hover:bg-black/85 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {loading ? "Creating account..." : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} account →`}
              </button>

            </form>
          </div>

          <p className="text-center text-xs text-black/40 mt-6">
            By signing up, you agree to FeatureForge's terms of service.
          </p>

        </div>
      </main>
    </div>
  );
}
