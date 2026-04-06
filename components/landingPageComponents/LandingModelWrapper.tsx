export default function LandingModelWrapper() {
    return (
        <div className="relative w-full aspect-square max-w-lg mx-auto">
            {/* Glow ring de fondo */}
            <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-3xl" />

            {/* Contenedor principal */}
            <div className="relative w-full h-full rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden flex items-center justify-center">

                {/* Grid de tiles decorativo */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            "linear-gradient(var(--color-border, hsl(var(--border))) 1px, transparent 1px), linear-gradient(90deg, var(--color-border, hsl(var(--border))) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* Tiles animadas (decorativas) */}
                <div className="absolute top-8 left-8 w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 animate-pulse" style={{ animationDelay: "0ms" }} />
                <div className="absolute top-8 right-12 w-8 h-8 rounded-md bg-primary/15 border border-primary/20 animate-pulse" style={{ animationDelay: "300ms" }} />
                <div className="absolute bottom-16 left-16 w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 animate-pulse" style={{ animationDelay: "600ms" }} />
                <div className="absolute bottom-8 right-8 w-14 h-14 rounded-xl bg-primary/15 border border-primary/20 animate-pulse" style={{ animationDelay: "900ms" }} />
                <div className="absolute top-1/3 right-6 w-6 h-6 rounded bg-accent/20 border border-accent/30 animate-pulse" style={{ animationDelay: "150ms" }} />
                <div className="absolute bottom-1/3 left-6 w-8 h-8 rounded-md bg-accent/15 border border-accent/25 animate-pulse" style={{ animationDelay: "450ms" }} />

                {/* Centro: icono + texto */}
                <div className="relative flex flex-col items-center gap-4 text-center px-6">
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-9 h-9 text-primary/60"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Modelo 3D próximamente</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">React Three Fiber · Three.js</p>
                    </div>
                </div>
            </div>
        </div>
    );
}