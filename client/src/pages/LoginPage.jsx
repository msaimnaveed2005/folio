import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const notice = location.state?.notice || "";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login({ email: email.trim(), password });
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to open your reading library"
        >
            {notice && (
                <div className="mb-4 rounded-control border border-forest/30 bg-forest/10 px-3.5 py-2.5 text-sm text-forest">
                    {notice}
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-control border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="mb-1.5 block text-sm font-medium text-ink"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full min-h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-1.5 block text-sm font-medium text-ink"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full min-h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full min-h-11 rounded-control bg-forest px-4 text-sm font-medium text-white transition hover:bg-forest-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm text-ink-muted">
                <p>
                    New to Folio?{" "}
                    <Link to="/register" className="font-medium text-forest hover:underline">
                        Create an account
                    </Link>
                </p>
                <p>
                    Need to verify an email?{" "}
                    <Link
                        to="/verify-email"
                        className="font-medium text-forest hover:underline"
                    >
                        Enter OTP
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}