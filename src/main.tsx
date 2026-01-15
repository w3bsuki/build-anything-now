import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import App from "./App.tsx";
import "./i18n";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "./index.css";
import "./fonts.css";

// Environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

if (!clerkPubKey) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

// Initialize Convex client - only if URL is provided
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

// Wrapper component that conditionally uses Convex
function AppWithProviders() {
    if (convex) {
        return (
            <ClerkProvider publishableKey={clerkPubKey}>
                <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                    <App />
                </ConvexProviderWithClerk>
            </ClerkProvider>
        );
    }

    console.warn("Running without Convex - using mock data. Set VITE_CONVEX_URL to enable backend.");
    return (
        <ClerkProvider publishableKey={clerkPubKey}>
            <App />
        </ClerkProvider>
    );
}

createRoot(document.getElementById("root")!).render(<AppWithProviders />);
