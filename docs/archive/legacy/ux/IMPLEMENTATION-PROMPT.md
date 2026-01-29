# 🐾 Pawtreon UI/UX Perfection - Implementation Prompt

> **Use this prompt in a new chat to implement all UI/UX fixes with full context.**

---

## PROMPT START

You are an expert UI/UX engineer specializing in mobile-first React applications. You're working on **Pawtreon**, a pet fundraising app built to help stray animals. The app uses:

- **Stack:** React + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
- **Theme:** "Sunset Horizon" - warm coral/orange primary (`oklch(0.74 0.16 34.57)`)
- **Backend:** Convex (real-time database)
- **Auth:** Clerk
- **Mobile:** Capacitor for iOS/Android

### YOUR MISSION

Implement the following UI/UX improvements to make this the cleanest, most polished pet fundraising app ever. Work systematically through each fix.

---

## 🔴 PRIORITY 1: Mobile Header Icons

**File:** `src/components/Navigation.tsx` (lines 60-100)

**Problem:** Bell and Profile icons in the mobile header look disconnected and lack visual polish.

**Current:**
```tsx
<NavLink to="/notifications" className="relative size-10 flex items-center justify-center rounded-xl">
  <Bell className="size-[22px] text-foreground/70" strokeWidth={1.75} />
</NavLink>
```

**Fix:**
- Add subtle background container (`bg-muted/50` on hover, `bg-primary/10` when active)
- Use `text-foreground/80` for better visibility
- Ensure consistent 44px touch targets
- Add smooth hover/active transitions

**Expected result:** Icons feel integrated with the Sunset Horizon theme, have clear tap areas.

---

## 🔴 PRIORITY 2: Instagram Card Redesign

**File:** `src/components/homepage/InstagramCaseCard.tsx`

**Problems:**
1. Cards are too tall (4:3 aspect ratio + lots of content)
2. "X helping" is shown twice (in body AND in CTA button)
3. CTA is single action only (no quick chat access)
4. CTA button is too tall (h-11)

**Fixes:**

### 2a. Change image aspect ratio
```tsx
// Change from:
<div className="relative aspect-[4/3] overflow-hidden bg-muted">

// To:
<div className="relative aspect-[3/2] overflow-hidden bg-muted">
```

### 2b. Remove redundant "X helping" row
Delete or simplify the social proof section that shows "X helping" since it's already in the CTA.

### 2c. Simplify CTA - Single Focused Button
Keep the CTA singular for maximum conversion. Comments are already in the action bar above.

```tsx
{/* Single, focused CTA - drives donations */}
<div className="px-4 pb-4">
  <Button
    asChild
    variant="default"
    className="w-full h-10 rounded-xl font-semibold text-sm bg-primary hover:bg-primary/90"
  >
    <Link to={`/case/${caseData.id}`}>
      <Heart className="w-4 h-4 mr-1.5 fill-current" />
      Help {animalName}
    </Link>
  </Button>
</div>
```

**Why single CTA?**
- Fundraising apps need ONE clear action (GoFundMe, Kickstarter all do this)
- Comments already accessible via 💬 in action bar
- Split buttons create decision paralysis → lower conversion
- Save multi-button for Case Detail page (user already committed)

**Expected result:** Cards are more compact, CTA is clear and converts better.

---

## 🔴 PRIORITY 3: Hero Circle Theme Alignment

**File:** `src/components/homepage/HeroCircles.tsx`

**Problem:** Story circle rings use hardcoded colors instead of theme tokens.

**Current:**
```tsx
className="bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500"
```

**Fix:**
```tsx
className="bg-gradient-to-tr from-primary via-primary/90 to-primary/70"
```

Apply to all story/avatar ring gradients in the file.

---

## 🔴 PRIORITY 4: Case Detail Triple Action Bar

**File:** `src/pages/AnimalProfile.tsx`

**Why multi-action HERE (but not on cards)?**
- User already committed to viewing this case
- They're in "explore" mode, not "browse" mode  
- Multiple actions make sense when user has context

**Current sticky bar:**
```tsx
<div className="...">
  <button>{/* Bookmark */}</button>
  <Button>Donate Now</Button>
</div>
```

**Fix:** Redesign as triple action bar:
```tsx
const [commentsOpen, setCommentsOpen] = useState(false);

{/* Sticky Action Bar */}
<div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
  <div className="mx-auto w-full max-w-md px-4 pb-2">
    <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/95 px-3 py-2.5 shadow-lg backdrop-blur-xl">
      {/* Bookmark */}
      <button className="size-10 flex items-center justify-center rounded-xl hover:bg-muted/60">
        <Bookmark className="w-5 h-5" />
      </button>
      
      {/* Chat - opens CommentsSheet */}
      <Button 
        variant="secondary" 
        className="h-10 px-4 rounded-xl"
        onClick={() => setCommentsOpen(true)}
      >
        <MessageCircle className="w-4 h-4 mr-1.5" />
        {commentCount || 0}
      </Button>
      
      {/* Donate - primary, takes remaining space */}
      <Button className="flex-1 h-10 rounded-xl font-semibold">
        <Heart className="w-4 h-4 mr-1.5 fill-current" />
        Donate Now
      </Button>
    </div>
  </div>
</div>

{/* Comments Drawer */}
<CommentsSheet
  isOpen={commentsOpen}
  onClose={() => setCommentsOpen(false)}
  caseId={caseId}
  caseTitle={caseData?.title || ''}
/>
```

Import `CommentsSheet` from `@/components/homepage/CommentsSheet` and add state management.

---

## 🟡 PRIORITY 5: Add Missing i18n Keys

**File:** `public/locales/en/translation.json`

Add these missing keys:
```json
{
  "common": {
    "of": "of",
    "loading": "Loading...",
    "backToAllCases": "Back to all cases"
  },
  "status": {
    "urgentOnly": "Urgent only",
    "nearMe": "Near me"
  }
}
```

Also add to Bulgarian (`bg/translation.json`) if it exists.

---

## 🟡 PRIORITY 6: Image Loading States

**Files:** `InstagramCaseCard.tsx`, `AnimalProfile.tsx`

**Problem:** Broken images show alt text instead of graceful fallback.

**Fix:** Add skeleton/placeholder:
```tsx
const [imageLoaded, setImageLoaded] = useState(false);
const [imageError, setImageError] = useState(false);

<div className="relative aspect-[3/2] bg-muted">
  {!imageLoaded && !imageError && (
    <div className="absolute inset-0 animate-pulse bg-muted" />
  )}
  {imageError ? (
    <div className="absolute inset-0 flex items-center justify-center bg-muted">
      <PawPrint className="w-12 h-12 text-muted-foreground/30" />
    </div>
  ) : (
    <img
      src={image}
      alt={alt}
      className={cn("w-full h-full object-cover", !imageLoaded && "opacity-0")}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageError(true)}
    />
  )}
</div>
```

---

## 🎨 THEME REFERENCE

Always use these theme tokens (defined in `src/index.css`):

```css
/* Primary */
--primary: oklch(0.74 0.16 34.57);  /* Sunset coral */

/* Status */
--urgent: oklch(0.65 0.20 25);      /* Warm red */
--critical: oklch(0.61 0.21 22.21); /* Deep red */
--recovering: oklch(0.70 0.15 175); /* Teal */
--adopted: oklch(0.65 0.18 145);    /* Green */

/* Surfaces */
--background: oklch(0.99 0.01 67.74); /* Warm white */
--card: oklch(1.00 0 0);              /* Pure white */
--muted: oklch(0.94 0.03 44.86);      /* Warm gray */

/* Text */
--foreground: oklch(0.34 0.01 7.89);
--muted-foreground: oklch(0.49 0.05 27.86);
```

**Usage in Tailwind:**
- `bg-primary`, `text-primary`, `border-primary`
- `bg-muted`, `text-muted-foreground`
- `bg-card`, `bg-background`

---

## 📐 SIZING RULES

- **Buttons:** `h-10` standard, `h-9` compact
- **Touch targets:** Minimum 44px (size-11)
- **Border radius:** `rounded-xl` for cards/buttons, `rounded-lg` for smaller elements
- **Icon sizes:** `w-4 h-4` in buttons, `w-5 h-5` standalone
- **Card padding:** `p-3` or `p-4`
- **Gaps:** `gap-2` between buttons, `gap-4` between sections

---

## ✅ DEFINITION OF DONE

After implementing all fixes:

1. [ ] Header icons have subtle containers and proper hover states
2. [ ] Case cards show ~2 per mobile viewport (not just 1)
3. [ ] Card CTA is single, focused, and h-10 (not split)
4. [ ] Hero circles use theme primary gradient
5. [ ] Case detail has Bookmark + Chat + Donate in sticky bar
6. [ ] CommentsSheet drawer works from case detail page
7. [ ] All i18n keys resolve (no "common.of" showing)
8. [ ] Images have loading/error states
9. [ ] All colors use theme tokens (no hardcoded amber/orange)
10. [ ] Touch targets are minimum 44px

**Key UX principle applied:** Single CTA on browse (cards), multi-action on detail (committed user)

---

## 🚀 START HERE

1. First, run `pnpm dev` to start the development server
2. Open browser to view current state
3. Start with Priority 1 (Header Icons) and work down
4. Test on mobile viewport (375px width) after each change
5. Commit after each priority is complete

**Key files to read first:**
- `src/index.css` (theme tokens)
- `src/components/homepage/InstagramCaseCard.tsx` (main card)
- `src/components/Navigation.tsx` (header)
- `src/pages/AnimalProfile.tsx` (case detail)
- `src/components/homepage/CommentsSheet.tsx` (drawer)

Good luck! Let's make this the best pet fundraising app ever! 🐾

---

## PROMPT END
