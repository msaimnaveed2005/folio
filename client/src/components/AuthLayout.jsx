export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-paper px-4 py-12 flex items-center justify-center">
            <div className="w-full max-w-md bg-surface border border-border rounded-card p-8 shadow-sm">
                <div className="mb-6 text-center">
                    <p className="font-serif text-3xl font-semibold tracking-tight text-forest">
                        Folio
                    </p>
                    <h1 className="mt-3 text-xl font-semibold text-ink">{title}</h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
                    )}
                </div>

                {children}
            </div>
        </div>
    );
}