import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailPage() {
    const { verifyEmail } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const notice = location.state?.notice || "";

    const [email, setEmail] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const data = await verifyEmail({
                email: email.trim(),
                otp: otp.trim(),
            });

            navigate("/login", {
                state: {
                    notice: data.message || "Email verified! You can sign in now.",
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
            title="Verify your email"
            subtitle="Enter the 6-digit OTP to activate your account"
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
                        htmlFor="otp"
                        className="mb-1.5 block text-sm font-medium text-ink"
                    >
                        6-Digit OTP
                    </label>
                    <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full min-h-11 rounded-control border border-border bg-surface px-3.5 text-center text-base tracking-[0.25em] text-ink focus:outline-none focus:ring-2 focus:ring-focus"
                    />
                    <p className="mt-1.5 text-xs text-ink-muted">
                        Running locally? Check your Express server terminal for the OTP.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full min-h-11 rounded-control bg-forest px-4 text-sm font-medium text-white transition hover:bg-forest-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Verifying..." : "Verify email"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-muted">
                Already verified?{" "}
                <Link to="/login" className="font-medium text-forest hover:underline">
                    Back to sign in
                </Link>
            </p>
        </AuthLayout>
    );
}