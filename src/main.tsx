import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import "./i18n";
import App from "./App.tsx";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/rubik/600.css";
import "@fontsource/rubik/700.css";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

// Environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST as string | undefined;

if (!clerkPubKey) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

if (!convexUrl) {
    throw new Error("Missing VITE_CONVEX_URL");
}

// TODO: Gate analytics initialization behind explicit cookie consent before EU launch.
initAnalytics({ key: posthogKey, host: posthogHost });

const convex = new ConvexReactClient(convexUrl);

function AppWithProviders() {
    return (
        <ClerkProvider publishableKey={clerkPubKey}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <App />
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}

createRoot(document.getElementById("root")!).render(<AppWithProviders />);
