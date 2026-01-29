# 🔒 Security Remediation Plan - PawsSafe

> **Priority:** CRITICAL  
> **Timeline:** Complete before launch  
> **Last Updated:** January 13, 2026

---

## 🚨 Executive Summary

The security audit identified **16 vulnerabilities** that must be fixed before production launch. This document provides step-by-step remediation instructions.

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 7 | Not Fixed |
| 🟠 High | 5 | Not Fixed |
| 🟡 Medium | 4 | Not Fixed |
| **Total** | **16** | **0% Complete** |

---

## 🔴 Critical Vulnerabilities

### CVE-001: Authorization Bypass in Notifications

**File:** `convex/notifications.ts`  
**Risk:** Any authenticated user can mark/delete ANY user's notifications  
**Impact:** Privacy violation, data manipulation

#### Current Vulnerable Code (Lines 41-43, 66-69)
```typescript
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    // ❌ NO OWNERSHIP CHECK
    await ctx.db.patch(args.id, { read: true });
  },
});

export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    // ❌ NO OWNERSHIP CHECK
    await ctx.db.delete(args.id);
  },
});
```

#### Remediation

```typescript
// ✅ FIXED: notifications.ts

import { requireAuth } from "./lib/auth";

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new Error("Notification not found");
    }
    if (notification.userId !== user._id) {
      throw new Error("Not authorized");
    }
    
    await ctx.db.patch(args.id, { read: true });
  },
});

export const markAllAsRead = mutation({
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
    
    await Promise.all(
      notifications.map((n) => ctx.db.patch(n._id, { read: true }))
    );
    
    return { updated: notifications.length };
  },
});

export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new Error("Notification not found");
    }
    if (notification.userId !== user._id) {
      throw new Error("Not authorized");
    }
    
    await ctx.db.delete(args.id);
  },
});
```

---

### CVE-002: Authorization Bypass in Payment Methods

**File:** `convex/paymentMethods.ts`  
**Risk:** Any authenticated user can delete ANY user's payment methods  
**Impact:** Financial data manipulation, denial of service

#### Current Vulnerable Code (Lines 61-70)
```typescript
export const remove = mutation({
  args: { id: v.id("paymentMethods") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const method = await ctx.db.get(args.id);
    // ❌ CHECKS IF METHOD EXISTS BUT NOT IF IT BELONGS TO USER
    await ctx.db.delete(args.id);
  },
});
```

#### Remediation

```typescript
// ✅ FIXED: paymentMethods.ts

import { requireAuth } from "./lib/auth";

export const remove = mutation({
  args: { id: v.id("paymentMethods") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const method = await ctx.db.get(args.id);
    if (!method) {
      throw new Error("Payment method not found");
    }
    if (method.userId !== user._id) {
      throw new Error("Not authorized to delete this payment method");
    }
    
    // Additional: If using Stripe, delete from Stripe first
    // await stripe.paymentMethods.detach(method.stripePaymentMethodId);
    
    await ctx.db.delete(args.id);
    
    return { success: true };
  },
});

// Also fix setDefault to include ownership check
export const setDefault = mutation({
  args: { id: v.id("paymentMethods") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const method = await ctx.db.get(args.id);
    if (!method || method.userId !== user._id) {
      throw new Error("Payment method not found");
    }
    
    // Unset all other defaults for this user
    const allMethods = await ctx.db
      .query("paymentMethods")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    await Promise.all(
      allMethods.map((m) => 
        ctx.db.patch(m._id, { isDefault: m._id === args.id })
      )
    );
  },
});
```

---

### CVE-003: Authorization Bypass in Case Updates

**File:** `convex/cases.ts`  
**Risk:** Any authenticated user can add updates to ANY case  
**Impact:** Data integrity violation, misinformation

#### Current Vulnerable Code (Lines 93-110)
```typescript
export const addUpdate = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    // ❌ NO CHECK IF USER OWNS THE CASE
    // ... adds update
  },
});
```

#### Remediation

```typescript
// ✅ FIXED: cases.ts

export const addUpdate = mutation({
  args: {
    caseId: v.id("cases"),
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("medical"),
      v.literal("milestone"),
      v.literal("update"),
      v.literal("success")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    const caseData = await ctx.db.get(args.caseId);
    if (!caseData) {
      throw new Error("Case not found");
    }
    
    // Only case creator, assigned clinic, or admin can add updates
    const isOwner = caseData.createdBy === user._id;
    const isClinic = caseData.clinicId && user.role === 'clinic';
    const isAdmin = user.role === 'admin';
    
    if (!isOwner && !isClinic && !isAdmin) {
      throw new Error("Not authorized to update this case");
    }
    
    // Validate string lengths
    if (args.title.length > 200) {
      throw new Error("Title too long");
    }
    if (args.description.length > 5000) {
      throw new Error("Description too long");
    }
    
    const updates = caseData.updates || [];
    updates.push({
      id: crypto.randomUUID(),
      ...args,
      createdAt: Date.now(),
      createdBy: user._id,
    });
    
    await ctx.db.patch(args.caseId, { 
      updates,
      updatedAt: Date.now(),
    });
    
    // Notify donors about the update
    await notifyDonors(ctx, args.caseId, args.title);
  },
});
```

---

### CVE-004: Public Admin Function

**File:** `convex/clinics.ts`  
**Risk:** Any user can seed/overwrite ALL clinic data  
**Impact:** Complete database corruption

#### Current Vulnerable Code (Lines 28-40)
```typescript
// Comment says "admin only" but has NO check
export const seed = mutation({
  handler: async (ctx) => {
    // ❌ NO AUTHORIZATION CHECK
    // Seeds clinic data...
  },
});
```

#### Remediation

```typescript
// ✅ FIXED: clinics.ts

// Option 1: Make it internal (preferred for seeding)
import { internalMutation } from "./_generated/server";

export const seed = internalMutation({
  handler: async (ctx) => {
    // Only callable from other Convex functions or dashboard
    const clinicsData = [/* ... */];
    
    for (const clinic of clinicsData) {
      await ctx.db.insert("clinics", {
        ...clinic,
        createdAt: Date.now(),
      });
    }
  },
});

// Option 2: If needs to be callable from frontend, require admin
export const seedFromAdmin = mutation({
  args: {
    clinics: v.array(v.object({
      name: v.string(),
      address: v.string(),
      city: v.string(),
      phone: v.string(),
      specializations: v.array(v.string()),
      verified: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    
    // Log admin action
    console.log(`Admin ${user._id} seeding ${args.clinics.length} clinics`);
    
    const results = [];
    for (const clinic of args.clinics) {
      const id = await ctx.db.insert("clinics", {
        ...clinic,
        createdAt: Date.now(),
      });
      results.push(id);
    }
    
    return { inserted: results.length };
  },
});
```

---

### CVE-005: Public Notification Creation

**File:** `convex/notifications.ts`  
**Risk:** Any user can create fake notifications for ANY user  
**Impact:** Phishing, social engineering, spam

#### Current Vulnerable Code (Lines 71-90)
```typescript
export const create = mutation({
  args: {
    userId: v.id("users"), // ❌ Can target ANY user
    title: v.string(),
    message: v.string(),
    // ...
  },
  handler: async (ctx, args) => {
    // ❌ Any authenticated user can call this
    return await ctx.db.insert("notifications", { ... });
  },
});
```

#### Remediation

```typescript
// ✅ FIXED: notifications.ts

// Make internal - only server functions can create notifications
import { internalMutation } from "./_generated/server";

export const create = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    relatedId: v.optional(v.string()),
    relatedType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate required fields
    if (!args.title || args.title.length > 200) {
      throw new Error("Invalid title");
    }
    if (!args.message || args.message.length > 1000) {
      throw new Error("Invalid message");
    }
    
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});

// Helper function to send notifications from other mutations
export async function sendNotification(
  ctx: MutationCtx,
  userId: Id<"users">,
  title: string,
  message: string,
  type: string,
  relatedId?: string
) {
  return await ctx.db.insert("notifications", {
    userId,
    title,
    message,
    type,
    relatedId,
    read: false,
    createdAt: Date.now(),
  });
}
```

---

### CVE-006: HTTP Geolocation over Insecure Connection

**File:** `src/components/LanguageDetectionBanner.tsx`  
**Risk:** Mixed content error, potential MITM attacks  
**Impact:** Feature failure, data interception

#### Current Vulnerable Code
```typescript
const response = await fetch('http://ip-api.com/json/?fields=country,countryCode');
// ❌ HTTP on HTTPS site causes mixed content blocking
```

#### Remediation

```typescript
// ✅ FIXED: LanguageDetectionBanner.tsx

// Option 1: Use HTTPS endpoint
const response = await fetch('https://ipapi.co/json/');

// Option 2: Use browser language as primary (recommended)
export function LanguageDetectionBanner() {
  const { i18n, t } = useTranslation();
  const [suggestedLanguage, setSuggestedLanguage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already set a language preference
    const storedLanguage = localStorage.getItem('i18nextLng');
    if (storedLanguage) return;
    
    // Use browser language as primary detection method
    const browserLanguage = navigator.language.split('-')[0];
    
    const supportedLanguages = ['en', 'bg', 'uk', 'ru', 'de'];
    if (supportedLanguages.includes(browserLanguage) && browserLanguage !== i18n.language) {
      setSuggestedLanguage(browserLanguage);
    }
  }, [i18n.language]);
  
  // ... rest of component
}
```

---

### CVE-007: Public User Creation/Modification (users.upsert)

**File:** `convex/users.ts`  
**Risk:** Any caller can create/overwrite user records without authentication/identity checks  
**Impact:** Account takeover, privilege escalation

#### Remediation (preferred)

```typescript
// Make upsert server-only (webhook/internal)
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const upsert = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify trusted caller (webhook) in the action layer,
    // then upsert the user record here.
  },
});
```

#### Remediation (if client-callable is required)
- Require `ctx.auth.getUserIdentity()`
- Enforce `identity.subject === args.clerkId` to block cross-user writes

---

## 🟠 High Severity Issues

### SEC-007: Missing Input Validation

**Files:** Multiple  
**Risk:** SQL injection (Convex is safe), XSS via stored data, data corruption

#### Remediation: Create Validation Library

```typescript
// ✅ NEW FILE: convex/lib/validators.ts

import { v } from "convex/values";

// Validation helper functions
export function validateStringLength(
  value: string, 
  fieldName: string, 
  min: number, 
  max: number
) {
  if (value.length < min) {
    throw new Error(`${fieldName} must be at least ${min} characters`);
  }
  if (value.length > max) {
    throw new Error(`${fieldName} must be less than ${max} characters`);
  }
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }
}

export function validatePhone(phone: string) {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error("Invalid phone format");
  }
}

export function validateAmount(amount: number, currency: string) {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }
  if (amount > 100000) {
    throw new Error("Amount exceeds maximum");
  }
  // Add currency-specific validation
}

export function validateUrl(url: string) {
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }
}

// Sanitize HTML to prevent XSS when rendering user content
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

// Common validation schemas
export const LIMITS = {
  TITLE_MIN: 5,
  TITLE_MAX: 200,
  DESCRIPTION_MIN: 20,
  DESCRIPTION_MAX: 5000,
  MESSAGE_MAX: 1000,
  NAME_MAX: 100,
  EMAIL_MAX: 255,
  PHONE_MAX: 20,
  URL_MAX: 500,
  IMAGES_MAX: 10,
} as const;
```

#### Apply to cases.ts

```typescript
// ✅ FIXED: cases.ts create mutation

import { validateStringLength, validateAmount, LIMITS } from "./lib/validators";

export const create = mutation({
  args: {
    type: v.union(/* ... */),
    title: v.string(),
    description: v.string(),
    city: v.string(),
    country: v.string(),
    images: v.array(v.id("_storage")),
    targetAmount: v.number(),
    currency: v.union(v.literal("BGN"), v.literal("EUR"), v.literal("USD")),
    clinicId: v.optional(v.id("clinics")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Validate all inputs
    validateStringLength(args.title, "Title", LIMITS.TITLE_MIN, LIMITS.TITLE_MAX);
    validateStringLength(args.description, "Description", LIMITS.DESCRIPTION_MIN, LIMITS.DESCRIPTION_MAX);
    validateStringLength(args.city, "City", 2, LIMITS.NAME_MAX);
    validateStringLength(args.country, "Country", 2, LIMITS.NAME_MAX);
    validateAmount(args.targetAmount, args.currency);
    
    if (args.images.length === 0) {
      throw new Error("At least one image is required");
    }
    if (args.images.length > LIMITS.IMAGES_MAX) {
      throw new Error(`Maximum ${LIMITS.IMAGES_MAX} images allowed`);
    }
    
    // Verify clinic exists if provided
    if (args.clinicId) {
      const clinic = await ctx.db.get(args.clinicId);
      if (!clinic) {
        throw new Error("Invalid clinic");
      }
    }
    
    return await ctx.db.insert("cases", {
      ...args,
      createdBy: user._id,
      status: "active",
      currentAmount: 0,
      donorCount: 0,
      viewCount: 0,
      updates: [],
      createdAt: Date.now(),
    });
  },
});
```

---

### SEC-008: Missing Rate Limiting

**Risk:** Brute force attacks, DoS, spam

#### Remediation: Implement Rate Limiting

```typescript
// ✅ NEW FILE: convex/lib/rateLimit.ts

import { MutationCtx } from "../_generated/server";

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  ctx: MutationCtx,
  key: string,
  maxRequests: number,
  windowMs: number
) {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || record.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
  
  record.count++;
  return true;
}

// Usage in mutations
export const donate = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Rate limit: 10 donations per minute per user
    await checkRateLimit(ctx, `donate:${user._id}`, 10, 60 * 1000);
    
    // ... rest of donation logic
  },
});
```

---

### SEC-009: Payment Method Data Exposure

**File:** `convex/schema.ts`  
**Risk:** Storing sensitive payment data directly

#### Remediation

```typescript
// ✅ FIXED: schema.ts - paymentMethods table

// DON'T store actual card data - only references
paymentMethods: defineTable({
  userId: v.id("users"),
  // Store ONLY Stripe payment method ID
  stripePaymentMethodId: v.string(),
  // Metadata from Stripe (safe to store)
  type: v.union(v.literal("card"), v.literal("paypal"), v.literal("bank")),
  brand: v.optional(v.string()), // "visa", "mastercard", etc.
  lastFour: v.string(), // Last 4 digits only
  expiryMonth: v.optional(v.number()),
  expiryYear: v.optional(v.number()),
  isDefault: v.boolean(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_stripe_id", ["stripePaymentMethodId"]),
```

---

### SEC-010: Missing Security Headers

**File:** `index.html` / Server config  
**Risk:** XSS, clickjacking, MIME sniffing

#### Remediation

For Vercel, create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(self)"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.convex.cloud https://api.stripe.com wss://*.convex.cloud; frame-src https://js.stripe.com;"
        }
      ]
    }
  ]
}
```

---

### SEC-011: Missing Error Handling with ConvexError

**Files:** All `convex/*.ts`  
**Risk:** Information disclosure through error messages

#### Remediation

```typescript
// ✅ Use ConvexError for proper error handling
import { ConvexError } from "convex/values";

export const get = query({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    const caseData = await ctx.db.get(args.id);
    
    if (!caseData) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Case not found",
      });
    }
    
    return caseData;
  },
});

// Handle on frontend
try {
  const result = await query(api.cases.get, { id });
} catch (error) {
  if (error instanceof ConvexError) {
    if (error.data.code === "NOT_FOUND") {
      // Handle not found
    }
  }
}
```

---

## 🟡 Medium Severity Issues

### SEC-012: Add Audit Logging

```typescript
// ✅ NEW FILE: convex/lib/audit.ts

import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function logAuditEvent(
  ctx: MutationCtx,
  event: {
    action: string;
    entityType: string;
    entityId: string;
    userId: Id<"users">;
    metadata?: Record<string, any>;
  }
) {
  await ctx.db.insert("auditLogs", {
    ...event,
    timestamp: Date.now(),
    ip: "unknown", // Would need HTTP action for real IP
  });
}

// Add auditLogs to schema
auditLogs: defineTable({
  action: v.string(),
  entityType: v.string(),
  entityId: v.string(),
  userId: v.id("users"),
  metadata: v.optional(v.any()),
  timestamp: v.number(),
  ip: v.optional(v.string()),
})
  .index("by_user", ["userId"])
  .index("by_entity", ["entityType", "entityId"])
  .index("by_timestamp", ["timestamp"]),
```

---

### SEC-013: Add Soft Delete

```typescript
// ✅ Instead of hard delete, use soft delete

export const remove = mutation({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const caseData = await ctx.db.get(args.id);
    
    if (!caseData || caseData.createdBy !== user._id) {
      throw new Error("Not authorized");
    }
    
    // Soft delete instead of hard delete
    await ctx.db.patch(args.id, { 
      deletedAt: Date.now(),
      deletedBy: user._id,
    });
    
    // Log the action
    await logAuditEvent(ctx, {
      action: "DELETE",
      entityType: "case",
      entityId: args.id,
      userId: user._id,
    });
  },
});

// Filter out soft-deleted in queries
export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("cases")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
  },
});
```

---

### SEC-014: Implement CSRF Protection for Forms

```typescript
// For Vite/React SPA with Convex, CSRF is handled by:
// 1. Convex auth tokens (not cookies)
// 2. SameSite cookies if using sessions

// Add to forms for extra security:
import { useId } from 'react';

function SecureForm() {
  const formId = useId();
  
  return (
    <form data-form-id={formId}>
      {/* Form fields */}
    </form>
  );
}
```

---

### SEC-015: Environment Variable Validation

```typescript
// ✅ NEW FILE: src/lib/env.ts

const requiredEnvVars = [
  'VITE_CONVEX_URL',
  'VITE_CLERK_PUBLISHABLE_KEY',
] as const;

export function validateEnv() {
  const missing: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Call in main.tsx before rendering
validateEnv();
```

---

## ✅ Security Checklist

### Authentication & Authorization
- [ ] All mutations require authentication
- [ ] All mutations verify resource ownership
- [ ] Admin operations require admin role
- [ ] Sensitive operations are internal-only
- [ ] Tokens are properly validated

### Input Validation
- [ ] All string lengths are limited
- [ ] All numbers are range-checked
- [ ] Email/phone formats validated
- [ ] URLs validated
- [ ] File uploads size-limited

### Data Protection
- [ ] Payment data stored securely (tokenized)
- [ ] PII properly protected
- [ ] Soft delete implemented
- [ ] Audit logging enabled

### Transport Security
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CSP implemented
- [ ] CORS properly configured

### Error Handling
- [ ] No sensitive data in error messages
- [ ] ConvexError used consistently
- [ ] Client-side error boundaries

---

## 📅 Remediation Timeline

| Priority | Issue | ETA | Owner |
|----------|-------|-----|-------|
| 🔴 | CVE-001: Notifications auth | Day 1 | Backend |
| 🔴 | CVE-002: Payment methods auth | Day 1 | Backend |
| 🔴 | CVE-003: Cases auth | Day 1 | Backend |
| 🔴 | CVE-004: Admin function | Day 1 | Backend |
| 🔴 | CVE-005: Notifications creation | Day 1 | Backend |
| 🔴 | CVE-006: HTTP geolocation | Day 1 | Frontend |
| 🔴 | CVE-007: Users upsert | Day 1 | Backend |
| 🟠 | SEC-007: Input validation | Day 2 | Backend |
| 🟠 | SEC-008: Rate limiting | Day 2 | Backend |
| 🟠 | SEC-009: Payment data | Day 2 | Backend |
| 🟠 | SEC-010: Security headers | Day 2 | DevOps |
| 🟠 | SEC-011: Error handling | Day 3 | Backend |
| 🟡 | SEC-012: Audit logging | Day 3 | Backend |
| 🟡 | SEC-013: Soft delete | Day 4 | Backend |
| 🟡 | SEC-014: CSRF | Day 4 | Full Stack |
| 🟡 | SEC-015: Env validation | Day 4 | Frontend |

---

## 🔄 Post-Remediation Verification

After fixing all issues:

1. [ ] Run security scan (OWASP ZAP)
2. [ ] Penetration testing
3. [ ] Code review by security team
4. [ ] Verify all authorization with test cases
5. [ ] Test rate limiting under load
6. [ ] Verify CSP doesn't break functionality
7. [ ] Test error messages don't leak data

---

*Document Version: 1.0*  
*Last Updated: January 13, 2026*
