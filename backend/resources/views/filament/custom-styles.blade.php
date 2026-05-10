{{--
    Custom CSS injected into the Filament admin panel via a render hook.
    We don't have a Vite-compiled theme on this host (no npm), so render-hook
    injection is the path that doesn't require a build step. Keep selectors
    minimal and Filament-stable to avoid breakage on package updates.
--}}
<style>
    /* ---------- Login / simple layout ---------- */
    /* Light mode: brand-tinted gradient corners on a soft gray base. */
    .fi-simple-layout {
        background:
            radial-gradient(ellipse at top left, rgb(50 73 143 / 0.18) 0%, transparent 55%),
            radial-gradient(ellipse at bottom right, rgb(50 73 143 / 0.12) 0%, transparent 55%),
            #f8fafc !important;
        min-height: 100vh;
    }
    /* Dark mode: brand-tinted gradient corners on slate-900. The previous
       version used 0.18 alpha and barely registered visually — bumping to
       0.45/0.30 makes the brand presence obvious without overpowering. */
    .dark .fi-simple-layout {
        background:
            radial-gradient(ellipse 60% 50% at top left, rgb(50 73 143 / 0.45) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at bottom right, rgb(50 73 143 / 0.30) 0%, transparent 60%),
            rgb(15 23 42) !important;
        min-height: 100vh;
    }
    /* The login card itself: subtle backdrop blur and a hairline border so
       it floats over the gradient instead of looking glued to it. */
    .fi-simple-main {
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        background-color: rgb(255 255 255 / 0.85) !important;
        border: 1px solid rgb(0 0 0 / 0.05);
    }
    .dark .fi-simple-main {
        background-color: rgb(30 41 59 / 0.85) !important;
        border-color: rgb(255 255 255 / 0.06);
    }

    /* ---------- Sidebar polish ---------- */
    .fi-sidebar-nav-item-button {
        border-radius: 0.625rem;
    }
    .fi-sidebar-group-label {
        font-weight: 600;
        letter-spacing: 0.06em;
        font-size: 0.7rem;
        text-transform: uppercase;
        opacity: 0.75;
    }

    /* ---------- Topbar depth ---------- */
    .fi-topbar {
        box-shadow: 0 1px 0 0 rgb(0 0 0 / 0.04);
    }
    .dark .fi-topbar {
        box-shadow: 0 1px 0 0 rgb(255 255 255 / 0.06);
    }

    /* ---------- Card / widget radii ---------- */
    .fi-section,
    .fi-wi-stats-overview-stat {
        border-radius: 0.75rem;
    }
</style>
