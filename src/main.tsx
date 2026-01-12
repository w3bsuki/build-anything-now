import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import App from "./App.tsx";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "./index.css";
import "./fonts.css";

// Initialize Convex client - only if URL is provided
const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

// Wrapper component that conditionally uses Convex
function AppWithProviders() {
    if (convex) {
        return (
            <ConvexProvider client={convex}>
                <App />
            </ConvexProvider>
        );
    }

    // Fallback: Run without Convex (uses mock data)
    console.warn("Running without Convex - using mock data. Set VITE_CONVEX_URL to enable backend.");
    return <App />;
}

createRoot(document.getElementById("root")!).render(<AppWithProviders />);

if (import.meta.env.DEV) {
    requestAnimationFrame(() => {
        const rootFontVar = getComputedStyle(document.documentElement)
            .getPropertyValue("--font-sans")
            .trim();
        const bodyFontFamily = getComputedStyle(document.body).fontFamily;
        // eslint-disable-next-line no-console
        console.log("[fonts] --font-sans =", rootFontVar);
        // eslint-disable-next-line no-console
        console.log("[fonts] body font-family =", bodyFontFamily);
    });
}
