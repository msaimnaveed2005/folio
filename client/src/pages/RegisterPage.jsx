import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        const cleanEmail = email.trim();

        try {
            const data = await register({
                username: username.trim(),
                email: cleanEmail,
                password,
            });

            navigate("/verify-email", {
                state: {
                    email: cleanEmail,
                    notice: data.message || "Account created! Check your OTP to verify.",
                },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start building your personal reading shelf"
        >
            {error && (
                <div className="mb-4 rounded-control border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="username"
                        className="mb-1.5 block text-sm font-medium text-ink"
                    >
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="saim"
                        className="w-full min-h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
                    />
                </div>

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
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full min-h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full min-h-11 rounded-control bg-forest px-4 text-sm font-medium text-white transition hover:bg-forest-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Creating account..." : "Create account"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-muted">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-forest hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}