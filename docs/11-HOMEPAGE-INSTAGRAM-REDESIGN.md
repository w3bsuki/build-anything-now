# Homepage Instagram-Style Redesign

> **Goal**: Transform the homepage into an engaging, Instagram-inspired feed that showcases animal rescue cases and highlights top community members.

---

## 📱 Mobile Layout (Primary Focus)

```
┌─────────────────────────────────────────────────────────┐
│ ◀ Safe Area Top                                         │
├─────────────────────────────────────────────────────────┤
│  🐾 Pawtreon                            🔍  🔔  ≡      │
│                                         search bell menu│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮           │
│  │ + │ │👤│ │👤│ │👤│ │👤│ │👤│ │👤│  ──────►       │
│  │You│ │Ana│ │Tom│ │Eva│ │Max│ │Mia│ │...│  scroll    │
│  ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯           │
│   Add   🏆12  🏆9   🏆7   🏆5   🏆4   🏆3              │
│  Case   Top Heroes This Month                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [All] [🔴Critical] [🟠Urgent] [💚Recovering] [✨Adopted]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ╭──╮                                           │   │
│  │  │👤│ @w3bsuki • 2h • Sofia, Mladost           │   │
│  │  ╰──╯                                    • • • │   │
│  │                                                 │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │                                         │   │   │
│  │  │         📸 Case Image                   │   │   │
│  │  │         (swipeable gallery)             │   │   │
│  │  │                                         │   │   │
│  │  │   🔴 CRITICAL                           │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                 │   │
│  │  ❤️ 24    💬 8    📤 Share                     │   │
│  │                                                 │   │
│  │  Found injured cat near park...                │   │
│  │  more                                          │   │
│  │                                                 │   │
│  │  ████████████░░░░░░░░  €120 / €500            │   │
│  │                                                 │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │          💝 Donate Now                  │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  (Next case card...)                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  🏠     📢      🏥      🤝      👤                     │
│  Home  Campaigns Clinics Community Profile              │
└─────────────────────────────────────────────────────────┘
```

---

## 🖥️ Desktop Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│  🐾 Pawtreon    [Home] [Campaigns] [Clinics] [Community]    🔍   🔔   👤  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│    ┌──────────────────────────────────────────────────────────────────┐   │
│    │  ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮   │   │
│    │  │ + │ │👤│ │👤│ │👤│ │👤│ │👤│ │👤│ │👤│ │👤│ │👤│   │   │
│    │  │Add│ │Ana│ │Tom│ │Eva│ │Max│ │Mia│ │Leo│ │Sam│ │Zoe│ │...│   │   │
│    │  ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯   │   │
│    │   🏆 Top Animal Rescuers This Month                      See All│   │
│    └──────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│    [All] [🔴 Critical] [🟠 Urgent] [💚 Recovering] [✨ Adopted]           │
│                                                                            │
│    ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│    │ Case Card 1        │  │ Case Card 2        │  │ Case Card 3        │ │
│    │ (Instagram style)  │  │ (Instagram style)  │  │ (Instagram style)  │ │
│    └────────────────────┘  └────────────────────┘  └────────────────────┘ │
│                                                                            │
│    ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│    │ Case Card 4        │  │ Case Card 5        │  │ Case Card 6        │ │
│    └────────────────────┘  └────────────────────┘  └────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Search Overlay (Mobile)

When user taps search icon:

```
┌─────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────┐    ✕    │
│  │ 🔍 Search cases, users, locations...      │  close  │
│  └───────────────────────────────────────────┘         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Recent Searches                              Clear All │
│  ──────────────────────────────────────────────────────│
│  🕐 injured cat sofia                                   │
│  🕐 stray dogs plovdiv                                  │
│  🕐 @petlover99                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Trending                                               │
│  ──────────────────────────────────────────────────────│
│  🔥 winter shelter                                      │
│  🔥 critical surgery                                    │
│  🔥 varna beach strays                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Filter by Location                                     │
│  ──────────────────────────────────────────────────────│
│  📍 Near me (5km)                                       │
│  📍 Sofia                                               │
│  📍 Plovdiv                                             │
│  📍 Varna                                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Breakdown

### 1. Header (Slim)

```tsx
<header className="h-12 flex items-center justify-between px-4">
  <Logo />              {/* 🐾 Pawtreon */}
  <div className="flex items-center gap-2">
    <SearchButton />    {/* 🔍 opens overlay */}
    <NotificationBell />{/* 🔔 with badge */}
    <MenuButton />      {/* ≡ mobile only */}
  </div>
</header>
```

### 2. Hero Circles (Top Supporters)

```tsx
<HeroCircles>
  <AddCaseCircle />     {/* First circle: + icon to create case */}
  {topHeroes.map(user => (
    <HeroAvatar 
      user={user}
      badge={user.animalsHelped}  {/* 🏆12 */}
      hasGradientRing             {/* Instagram-style gradient border */}
    />
  ))}
</HeroCircles>
```

**Data source**: Query top users by `animalsHelped` this month

### 3. Filter Pills (Unchanged)

```tsx
<FilterPills 
  options={['all', 'critical', 'urgent', 'recovering', 'adopted']}
  selected={filter}
  onSelect={setFilter}
/>
```

### 4. Case Feed (Instagram-style cards)

```tsx
<CaseFeed>
  {cases.map(caseData => (
    <InstagramCaseCard 
      case={caseData}
      showUserHeader      {/* Avatar + username + timestamp + location */}
      showActions         {/* ❤️ 💬 📤 */}
      showFundingProgress {/* Progress bar + amounts */}
      showDonateButton    {/* Primary CTA */}
    />
  ))}
</CaseFeed>
```

### 5. Search Overlay

```tsx
<SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)}>
  <SearchInput autoFocus placeholder="Search cases, users, locations..." />
  <RecentSearches />
  <TrendingSearches />
  <LocationFilters />
</SearchOverlay>
```

---

## 📊 Data Requirements

### Top Heroes Query (New)

```ts
// convex/users.ts
export const getTopHeroes = query({
  args: { 
    limit: v.optional(v.number()),
    period: v.optional(v.union(v.literal("week"), v.literal("month"), v.literal("all")))
  },
  handler: async (ctx, args) => {
    // Get users with most cases created + donations received this month
    // Return: { user, animalsHelped, totalRaised, avatar }
  }
});
```

### Case with User Data Query (Enhanced)

```ts
// convex/cases.ts  
export const listFeedForLocale = query({
  args: { locale: v.string() },
  handler: async (ctx, args) => {
    // Return cases with:
    // - User info (avatar, name, username)
    // - Like count
    // - Comment count
    // - Formatted timestamp
  }
});
```

---

## 🎨 Styling Specifications

### Hero Avatar Circle

```css
/* Gradient ring like Instagram */
.hero-avatar-ring {
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  padding: 2px;
  border-radius: 50%;
}

.hero-avatar-inner {
  background: var(--background);
  padding: 2px;
  border-radius: 50%;
}
```

### Circle Sizes

| Element | Mobile | Desktop |
|---------|--------|---------|
| Avatar circle | 64px | 72px |
| Avatar image | 56px | 64px |
| Ring thickness | 2px | 3px |
| Gap between circles | 12px | 16px |

### Card Dimensions

| Element | Mobile | Desktop |
|---------|--------|---------|
| Card width | 100% | 400px max |
| Image aspect ratio | 4:5 | 4:5 |
| Card gap | 16px | 24px |

---

## 🔄 State Management

```tsx
// Homepage state
const [searchOpen, setSearchOpen] = useState(false);
const [filter, setFilter] = useState<CaseFilter>('all');
const [searchQuery, setSearchQuery] = useState('');

// Queries
const topHeroes = useQuery(api.users.getTopHeroes, { limit: 10, period: 'month' });
const cases = useQuery(api.cases.listFeedForLocale, { locale: i18n.language });
```

---

## 📁 New Components Needed

```
src/components/
├── homepage/
│   ├── HeroCircles.tsx        # Horizontal scroll container
│   ├── HeroAvatar.tsx         # Individual avatar with gradient ring
│   ├── AddCaseCircle.tsx      # First circle (+) for creating case
│   └── InstagramCaseCard.tsx  # Full Instagram-style case card
├── search/
│   ├── SearchOverlay.tsx      # Full-screen search overlay
│   ├── SearchInput.tsx        # Search input with icon
│   ├── RecentSearches.tsx     # Recent search history
│   └── TrendingSearches.tsx   # Trending/popular searches
```

---

## 🚀 Implementation Phases

### Phase 1: Core Layout (Priority)
- [ ] Slim header with search icon
- [ ] Search overlay component
- [ ] Hero circles container
- [ ] Hero avatar component with gradient ring

### Phase 2: Data Layer
- [ ] `getTopHeroes` query
- [ ] Enhanced case feed query with user data
- [ ] Search functionality backend

### Phase 3: Instagram Case Card
- [ ] User header (avatar, name, time, location)
- [ ] Image gallery with swipe
- [ ] Action buttons (like, comment, share)
- [ ] Funding progress
- [ ] Donate button

### Phase 4: Polish
- [ ] Animations (circle tap, overlay slide)
- [ ] Pull-to-refresh
- [ ] Infinite scroll
- [ ] Skeleton loaders

---

## 🎭 Interaction States

### Hero Avatar Tap
```
User taps avatar → Navigate to /profile/:userId
User taps "+" circle → Navigate to /create-case
Long press → Show mini preview card
```

### Search Flow
```
Tap 🔍 → Overlay slides up from bottom
Type query → Debounced search (300ms)
Tap result → Navigate to case/user/location
Tap outside → Close overlay
```

### Case Card Interactions
```
Tap image → Open fullscreen gallery
Tap ❤️ → Toggle like (with animation)
Tap 💬 → Navigate to case with comments focused
Tap 📤 → Native share sheet
Tap "Donate" → Navigate to donation flow
Tap user avatar → Navigate to user profile
```

---

## 📐 Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 640px | Single column, full-width cards |
| 640-1024px | 2-column grid |
| > 1024px | 3-column grid, max-width container |

---

## ✅ Success Metrics

- **Engagement**: Time on homepage, scroll depth
- **Conversion**: Case views → Donations
- **Social**: Shares per case, hero profile views
- **Creation**: Cases created via "+" circle

---

## 🔗 Related Docs

- [04-COMPONENT-STANDARDS-GUIDE.md](04-COMPONENT-STANDARDS-GUIDE.md)
- [06-TAILWIND-SHADCN-STYLING.md](06-TAILWIND-SHADCN-STYLING.md)
- [13-MOBILE-UX-IMPROVEMENTS.md](13-MOBILE-UX-IMPROVEMENTS.md)
