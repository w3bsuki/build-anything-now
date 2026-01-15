# 🔐 PawsSafe Authentication Guide
## Clerk + Convex Integration Plan

**Last Updated:** January 15, 2026  
**Stack:** Vite + React + Convex + Clerk  
**Estimated Setup Time:** 1-2 hours

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Clerk Dashboard Setup](#step-1-clerk-dashboard-setup)
4. [Step 2: Install Dependencies](#step-2-install-dependencies)
5. [Step 3: Environment Variables](#step-3-environment-variables)
6. [Step 4: Configure Convex Auth](#step-4-configure-convex-auth)
7. [Step 5: Update React App](#step-5-update-react-app)
8. [Step 6: Protected Routes](#step-6-protected-routes)
9. [Step 7: Webhook Setup](#step-7-webhook-setup)
10. [Step 8: User Sync Logic](#step-8-user-sync-logic)
11. [Step 9: UI Components](#step-9-ui-components)
12. [Testing Checklist](#testing-checklist)
13. [Troubleshooting](#troubleshooting)

---

## Overview

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   React App     │────▶│     Clerk       │────▶│    Convex       │
│   (Frontend)    │     │   (Auth)        │     │   (Backend)     │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │    JWT Token          │    Webhook            │
        │    (Auth State)       │    (User Sync)        │
        ▼                       ▼                       ▼
   User Actions          Sign In/Out              Data Storage
```

### What We're Building

- ✅ Social login (Google, Facebook, Apple)
- ✅ Email/password authentication
- ✅ Phone number authentication (for Bulgaria/EU)
- ✅ User profile sync to Convex
- ✅ Protected routes for authenticated features
- ✅ Role-based access (user, volunteer, clinic, admin)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Convex project deployed (`npx convex dev` works)
- [ ] Node.js 18+ installed
- [ ] Access to create a Clerk account

---

## Step 1: Clerk Dashboard Setup

### 1.1 Create Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign up
2. Click **"Create Application"**
3. Name it: `PawsSafe` (or `PawsSafe Development` for dev)
4. Select authentication methods:
   - ✅ Email
   - ✅ Google
   - ✅ Facebook (optional)
   - ✅ Apple (optional - requires Apple Developer account)
   - ✅ Phone number (recommended for Bulgaria market)

### 1.2 Configure Social Providers

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI from Clerk dashboard
4. Copy Client ID and Secret to Clerk

#### Facebook OAuth Setup (Optional):
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Enable Facebook Login
4. Copy App ID and Secret to Clerk

### 1.3 Get Your Keys

From Clerk Dashboard → API Keys, copy:
- `CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
- `CLERK_SECRET_KEY` (starts with `sk_`)
- JWT Issuer URL (for Convex)

---

## Step 2: Install Dependencies

```bash
# Install Clerk packages
pnpm add @clerk/clerk-react

# For webhooks (if using Convex HTTP actions)
pnpm add svix
```

**Package versions (tested working):**
```json
{
  "@clerk/clerk-react": "^5.x.x",
  "svix": "^1.x.x"
}
```

---

## Step 3: Environment Variables

### 3.1 Create/Update `.env.local`

```env
# Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Convex
VITE_CONVEX_URL=https://your-project.convex.cloud
```

### 3.2 Create/Update `.env` (for Convex backend)

```env
# Clerk (for server-side verification)
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3.3 Set Convex Environment Variables

```bash
# Set Clerk issuer domain for JWT verification
npx convex env set CLERK_ISSUER_URL https://your-clerk-instance.clerk.accounts.dev

# Set webhook secret (after creating webhook in Clerk)
npx convex env set CLERK_WEBHOOK_SECRET whsec_xxxxxxxxxx
```

---

## Step 4: Configure Convex Auth

### 4.1 Create `convex/auth.config.ts`

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL,
      applicationID: "convex",
    },
  ],
};
```

### 4.2 Update `convex/convex.config.ts` (if exists)

If you don't have this file, Convex will auto-detect. Otherwise:

```typescript
// convex/convex.config.ts
import { defineConfig } from "convex/server";

export default defineConfig({
  // Auth is automatically configured from auth.config.ts
});
```

### 4.3 Verify Your Schema (Already Done ✅)

Your `convex/schema.ts` already has the correct user structure:

```typescript
users: defineTable({
    clerkId: v.string(),        // ✅ Links to Clerk
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("volunteer"), v.literal("clinic"), v.literal("admin")),
    createdAt: v.number(),
}).index("by_clerk_id", ["clerkId"]),  // ✅ Index for fast lookup
```

---

## Step 5: Update React App

### 5.1 Update `src/main.tsx`

```tsx
// src/main.tsx
import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
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

// Validate required env vars
if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

// Initialize Convex client
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function AppWithProviders() {
  // If no Convex URL, run in mock mode (development without backend)
  if (!convex) {
    console.warn("Running without Convex - using mock data. Set VITE_CONVEX_URL to enable backend.");
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        <App />
      </ClerkProvider>
    );
  }

  // Full production setup with Clerk + Convex
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")!).render(<AppWithProviders />);
```

### 5.2 Install Convex-Clerk Integration

```bash
pnpm add convex@latest
# The ConvexProviderWithClerk is included in convex package
```

---

## Step 6: Protected Routes

### 6.1 Create Auth Guard Component

```tsx
// src/components/auth/AuthGuard.tsx
import { useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  // Still loading auth state
  if (!isLoaded) {
    return fallback || <LoadingSpinner />;
  }

  // Not authenticated - redirect to sign in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
```

### 6.2 Create Role Guard Component

```tsx
// src/components/auth/RoleGuard.tsx
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate } from "react-router-dom";

type UserRole = "user" | "volunteer" | "clinic" | "admin";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = "/" 
}: RoleGuardProps) {
  const user = useQuery(api.users.me);

  // Still loading
  if (user === undefined) {
    return <LoadingSpinner />;
  }

  // User not found in database
  if (user === null) {
    return <Navigate to="/" replace />;
  }

  // Check role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
```

### 6.3 Update Router with Protected Routes

```tsx
// In your router setup (e.g., App.tsx or routes.tsx)
import { AuthGuard } from "./components/auth/AuthGuard";
import { RoleGuard } from "./components/auth/RoleGuard";

// Example route configuration
const routes = [
  // Public routes
  { path: "/", element: <HomePage /> },
  { path: "/campaigns", element: <CampaignsPage /> },
  { path: "/clinics", element: <ClinicsPage /> },
  { path: "/case/:id", element: <CaseDetailPage /> },
  
  // Auth routes
  { path: "/sign-in", element: <SignInPage /> },
  { path: "/sign-up", element: <SignUpPage /> },
  
  // Protected routes (require authentication)
  { 
    path: "/profile", 
    element: (
      <AuthGuard>
        <ProfilePage />
      </AuthGuard>
    )
  },
  { 
    path: "/donations", 
    element: (
      <AuthGuard>
        <DonationsPage />
      </AuthGuard>
    )
  },
  { 
    path: "/create-case", 
    element: (
      <AuthGuard>
        <CreateCasePage />
      </AuthGuard>
    )
  },
  
  // Admin-only routes
  { 
    path: "/admin/*", 
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["admin"]}>
          <AdminDashboard />
        </RoleGuard>
      </AuthGuard>
    )
  },
  
  // Clinic routes
  { 
    path: "/clinic-dashboard", 
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["clinic", "admin"]}>
          <ClinicDashboard />
        </RoleGuard>
      </AuthGuard>
    )
  },
];
```

---

## Step 7: Webhook Setup

Webhooks sync Clerk user events to your Convex database.

### 7.1 Create HTTP Action for Webhook

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

// Clerk webhook endpoint
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Get the webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET");
      return new Response("Server configuration error", { status: 500 });
    }

    // Get headers for verification
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    // Get the body
    const payload = await request.text();

    // Verify the webhook
    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Handle the event
    const eventType = evt.type;

    switch (eventType) {
      case "user.created":
      case "user.updated":
        // Sync user to Convex database
        await ctx.runMutation(internal.users.upsert, {
          clerkId: evt.data.id,
          name: `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim() || "User",
          email: evt.data.email_addresses?.[0]?.email_address || "",
          avatar: evt.data.image_url,
        });
        break;

      case "user.deleted":
        // Optionally handle user deletion
        // await ctx.runMutation(internal.users.markDeleted, { clerkId: evt.data.id });
        console.log("User deleted:", evt.data.id);
        break;

      default:
        console.log("Unhandled webhook event:", eventType);
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

### 7.2 Configure Webhook in Clerk Dashboard

1. Go to Clerk Dashboard → **Webhooks**
2. Click **Add Endpoint**
3. Enter your Convex HTTP URL:
   ```
   https://your-project.convex.site/clerk-webhook
   ```
4. Select events to subscribe:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Copy the **Signing Secret** (`whsec_...`)
6. Set it in Convex:
   ```bash
   npx convex env set CLERK_WEBHOOK_SECRET whsec_xxxxx
   ```

---

## Step 8: User Sync Logic

### 8.1 Update User Mutations (Already Done ✅)

Your `convex/users.ts` already has the correct structure. Here's the enhanced version:

```typescript
// convex/users.ts
import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Get current user by Clerk ID (public query)
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Get current authenticated user (uses JWT from Clerk)
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

// Create or update user (internal - called from webhook)
export const upsert = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        avatar: args.avatar,
      });
      return existing._id;
    }

    // Create new user with default settings
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      avatar: args.avatar,
      role: "user",
      createdAt: Date.now(),
    });

    // Create default user settings
    await ctx.db.insert("userSettings", {
      userId,
      emailNotifications: true,
      pushNotifications: true,
      donationReminders: true,
      marketingEmails: false,
      language: "en",
      currency: "EUR",
    });

    return userId;
  },
});

// Update user role (admin only)
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("volunteer"), v.literal("clinic"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Verify caller is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || caller.role !== "admin") {
      throw new Error("Only admins can change user roles");
    }

    await ctx.db.patch(args.userId, { role: args.role });
  },
});
```

### 8.2 Create User Hook for Easy Access

```tsx
// src/hooks/useUser.ts
import { useAuth, useUser as useClerkUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUser() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useClerkUser();
  const convexUser = useQuery(api.users.me);

  return {
    // Auth state
    isSignedIn,
    isLoaded: authLoaded && userLoaded,
    
    // Clerk user (for display name, avatar from Clerk)
    clerkUser,
    
    // Convex user (for role, app-specific data)
    user: convexUser,
    
    // Convenience getters
    isAdmin: convexUser?.role === "admin",
    isClinic: convexUser?.role === "clinic",
    isVolunteer: convexUser?.role === "volunteer",
    
    // User ID for database operations
    userId: convexUser?._id,
  };
}
```

---

## Step 9: UI Components

### 9.1 Create Sign In Page

```tsx
// src/pages/SignInPage.tsx
import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export function SignInPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/paw-logo.svg" 
            alt="PawsSafe" 
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to continue helping animals in need
          </p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-lg rounded-2xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "rounded-xl",
              formButtonPrimary: "bg-primary hover:bg-primary/90 rounded-xl",
              footerActionLink: "text-primary hover:text-primary/90",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
        />
      </div>
    </div>
  );
}
```

### 9.2 Create Sign Up Page

```tsx
// src/pages/SignUpPage.tsx
import { SignUp } from "@clerk/clerk-react";

export function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/paw-logo.svg" 
            alt="PawsSafe" 
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">Join PawsSafe</h1>
          <p className="text-muted-foreground mt-2">
            Create an account to start making a difference
          </p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-lg rounded-2xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "rounded-xl",
              formButtonPrimary: "bg-primary hover:bg-primary/90 rounded-xl",
              footerActionLink: "text-primary hover:text-primary/90",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/"
        />
      </div>
    </div>
  );
}
```

### 9.3 Update Profile Button Component

```tsx
// src/components/UserButton.tsx
import { UserButton as ClerkUserButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

export function UserButton() {
  return (
    <>
      <SignedIn>
        <ClerkUserButton 
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
              userButtonPopoverCard: "rounded-xl shadow-lg",
              userButtonPopoverActionButton: "rounded-lg",
            },
          }}
          afterSignOutUrl="/"
        />
      </SignedIn>
      
      <SignedOut>
        <Link 
          to="/sign-in"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <User className="w-5 h-5 text-muted-foreground" />
        </Link>
      </SignedOut>
    </>
  );
}
```

### 9.4 Conditional UI Based on Auth State

```tsx
// Example: Donate button that requires auth
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

function DonateButton({ caseId }: { caseId: string }) {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const handleDonate = () => {
    if (!isSignedIn) {
      // Redirect to sign in, then back to donation
      navigate(`/sign-in?redirect_url=/case/${caseId}/donate`);
      return;
    }
    
    // Open donation modal or navigate to donation page
    navigate(`/case/${caseId}/donate`);
  };

  return (
    <button
      onClick={handleDonate}
      className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-medium"
    >
      {isSignedIn ? "Donate Now" : "Sign in to Donate"}
    </button>
  );
}
```

---

## Testing Checklist

### Manual Testing

```
[ ] Sign up with email works
[ ] Sign up with Google works
[ ] Sign in with existing account works
[ ] Sign out works
[ ] User appears in Convex database after sign up
[ ] Protected routes redirect to sign in
[ ] Role-based access works (test with admin account)
[ ] User profile displays correctly
[ ] Donation flow works for authenticated users
[ ] JWT token refreshes properly (stay signed in)
```

### Webhook Testing

```
[ ] Create user in Clerk → user appears in Convex
[ ] Update user in Clerk → user updates in Convex
[ ] Delete user in Clerk → handled appropriately
[ ] Invalid webhook signature is rejected
[ ] Missing headers return 400
```

### Edge Cases

```
[ ] Sign in on mobile works
[ ] Sign in after session expires works
[ ] Multiple tabs stay in sync
[ ] Offline behavior is graceful
[ ] Rate limiting doesn't break UX
```

---

## Troubleshooting

### Common Issues

#### 1. "Missing publishable key" error
```
Solution: Check VITE_CLERK_PUBLISHABLE_KEY is set in .env.local
Restart dev server after changing env vars
```

#### 2. "Unauthorized" when calling Convex
```
Solution: 
1. Verify auth.config.ts has correct CLERK_ISSUER_URL
2. Check JWT template in Clerk matches Convex expectations
3. Run: npx convex env set CLERK_ISSUER_URL https://your-clerk.clerk.accounts.dev
```

#### 3. Webhook not triggering
```
Solution:
1. Check webhook URL is correct (https://your-project.convex.site/clerk-webhook)
2. Verify CLERK_WEBHOOK_SECRET is set in Convex env
3. Check Clerk dashboard for failed webhook attempts
4. Test with Clerk's "Send test webhook" feature
```

#### 4. User not syncing to Convex
```
Solution:
1. Check webhook is firing (Clerk dashboard → Webhooks → Logs)
2. Verify internal mutation is correctly defined
3. Check Convex logs for errors
```

#### 5. Social login not working
```
Solution:
1. Verify OAuth credentials are correct in Clerk
2. Check redirect URIs match exactly
3. Enable social provider in Clerk dashboard
```

---

## Quick Reference

### Key Files
```
src/main.tsx                 # ClerkProvider + ConvexProviderWithClerk
src/components/auth/         # AuthGuard, RoleGuard components
src/pages/SignInPage.tsx     # Sign in page
src/pages/SignUpPage.tsx     # Sign up page
src/hooks/useUser.ts         # Custom user hook
convex/auth.config.ts        # Convex auth configuration
convex/users.ts              # User queries and mutations
convex/http.ts               # Webhook handler
```

### Environment Variables
```
# Frontend (.env.local)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_CONVEX_URL=https://xxx.convex.cloud

# Backend (Convex env)
CLERK_ISSUER_URL=https://xxx.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_xxx
```

### Useful Commands
```bash
# Set Convex env var
npx convex env set KEY value

# View Convex env vars
npx convex env list

# Run Convex dev server
npx convex dev

# Deploy Convex
npx convex deploy
```

---

## Next Steps After Auth Setup

1. ✅ Complete auth integration
2. ⬜ Add payment integration (Stripe)
3. ⬜ Implement donation flow
4. ⬜ Add real-time notifications
5. ⬜ Set up email notifications (Clerk + Resend/SendGrid)
6. ⬜ Implement admin dashboard

---

**Questions?** Check the official docs:
- [Clerk Docs](https://clerk.com/docs)
- [Convex + Clerk Integration](https://docs.convex.dev/auth/clerk)
- [Convex Authentication](https://docs.convex.dev/auth)
