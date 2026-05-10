{{--
    Custom CSS injected into the Filament admin panel via a render hook.
    We don't have a Vite-compiled theme on this host (no npm), so render-hook
    injection is the path that doesn't require a build step. Keep selectors
    minimal and Filament-stable to avoid breakage on package updates.
--}}
<style>
    /* Subtle brand-tinted gradient on the login / simple layout */
    .fi-simple-layout {
        background:
            radial-gradient(circle at 0% 0%, rgb(50 73 143 / 0.07) 0%, transparent 45%),
            radial-gradient(circle at 100% 100%, rgb(50 73 143 / 0.05) 0%, transparent 50%),
            #f9fafb;
    }
    .dark .fi-simple-layout {
        background:
            radial-gradient(circle at 0% 0%, rgb(50 73 143 / 0.18) 0%, transparent 45%),
            radial-gradient(circle at 100% 100%, rgb(50 73 143 / 0.12) 0%, transparent 50%),
            rgb(15 23 42);
    }

    /* Slightly tighter, more deliberate sidebar item radius */
    .fi-sidebar-nav-item-button {
        border-radius: 0.625rem;
    }

    /* Sharper section labels in the sidebar */
    .fi-sidebar-group-label {
        font-weight: 600;
        letter-spacing: 0.06em;
        font-size: 0.7rem;
        text-transform: uppercase;
        opacity: 0.75;
    }

    /* Topbar gets a hairline shadow instead of a hard border for depth */
    .fi-topbar {
        box-shadow: 0 1px 0 0 rgb(0 0 0 / 0.04);
    }
    .dark .fi-topbar {
        box-shadow: 0 1px 0 0 rgb(255 255 255 / 0.06);
    }

    /* Card-like widgets get slightly softer corners */
    .fi-section,
    .fi-wi-stats-overview-stat {
        border-radius: 0.75rem;
    }
</style>
