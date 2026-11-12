import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
    const { user, logout, logoutAll } = useAuth();
    const navigate = useNavigate();
    const [busy, setBusy] = useState(false);

    async function handleLogout(allDevices = false) {
        setBusy(true);
        try {
            if (allDevices) {
                await logoutAll();
            } else {
                await logout();
            }
            navigate("/login");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="min-h-screen bg-paper text-ink">
            <header className="border-b border-border bg-surface">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
                    <span className="font-serif text-2xl font-semibold tracking-tight text-forest">
                        Folio
                    </span>

                    <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-ink-muted sm:inline">
                            Signed in as <strong className="text-ink">{user?.username}</strong>
                        </span>

                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleLogout(false)}
                            className="min-h-11 rounded-control border border-border bg-surface px-4 text-sm font-medium text-ink transition hover:bg-surface-raised disabled:opacity-60"
                        >
                            Logout
                        </button>

                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleLogout(true)}
                            className="min-h-11 rounded-control bg-forest px-4 text-sm font-medium text-white transition hover:bg-forest-hover disabled:opacity-60"
                        >
                            Logout all devices
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
                <section className="rounded-card border border-border bg-surface p-6 sm:p-8 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-forest">
                        Authenticated Session
                    </p>
                    <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">
                        Welcome back, {user?.username}
                    </h1>
                    <p className="mt-2 text-sm text-ink-muted">
                        Your session is active using an in-memory access token and an HttpOnly
                        refresh cookie. Refresh the browser to watch AuthContext restore it automatically!
                    </p>

                    <dl className="mt-6 grid gap-4 rounded-control bg-surface-raised p-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs text-ink-muted">Username</dt>
                            <dd className="mt-0.5 text-sm font-medium text-ink">{user?.username}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-ink-muted">Email</dt>
                            <dd className="mt-0.5 text-sm font-medium text-ink">{user?.email}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-ink-muted">User ID</dt>
                            <dd className="mt-0.5 truncate text-sm font-mono text-ink">{user?.id}</dd>
                        </div>
                    </dl>
                </section>

                <section className="rounded-card border border-dashed border-border bg-surface/60 p-8 text-center">
                    <h2 className="font-serif text-xl font-semibold text-ink">
                        Your Reading Shelf
                    </h2>
                    <p className="mt-2 text-sm text-ink-muted">
                        Iteration 2 (Book Upload &amp; EPUB Processing) will live right here.
                    </p>
                </section>
            </main>
        </div>
    );
}