# Homepage Refactor Execution Plan

> **Goal**: Transform homepage from "donation platform" to "community-first social feed" while maintaining case visibility and fundraising capabilities.

---

## 📊 Current State vs Target State

| Aspect | Current | Target |
|--------|---------|--------|
| **Feel** | Donation platform | Social community |
| **Cases** | Fundraising cards | Instagram-style posts |
| **CTA** | "Donate Now" (transactional) | "Join 24 helpers" (social proof) |
| **Circles** | Top helpers (empty for now) | Recent updates/stories |
| **Filters** | Status pills (competing with circles) | Simplified or integrated |
| **Engagement** | View → Donate | View → Like → Comment → Share → Help |

---

## 🎯 Phased Approach

### Phase 1: MVP Simplification (Now)
- Remove hero circles temporarily
- Keep clean filter pills
- Improve case cards with social elements
- Softer donation CTA

### Phase 2: Social Enhancement (Soon)
- Add Instagram-style case posts
- User attribution on cases
- Like/comment/share actions
- "X people helping" social proof

### Phase 3: Community Features (Later)
- Story circles (recent updates/activity)
- Top helpers leaderboard
- Activity feed integration
- User profiles with contribution history

---

## 📱 Phase 1: MVP Layout

```
┌─────────────────────────────────────────────────────────┐
│  🐾 Pawtreon                              🔍  🔔  👤   │
├─────────────────────────────────────────────────────────┤
│  [All] [🔴 Critical] [🟠 Urgent] [💚 Recovering] [✨]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  • Urgent Cases (4)                        ○ Nearby    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │ Card 1  │ │ Card 2  │ │ Card 3  │ →                 │
│  └─────────┘ └─────────┘ └─────────┘                   │
│                                                         │
│  All Cases (12)                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Case Card (enhanced with social elements)       │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Case Card                                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Changes from current:**
- ❌ Remove hero circles (add back in Phase 3)
- ✅ Keep filter pills as primary navigation
- ✅ Enhance case cards with subtle social proof

---

## 📱 Phase 2: Instagram-Style Posts

```
┌─────────────────────────────────────────────────────────┐
│  🐾 Pawtreon                              🔍  🔔  👤   │
├─────────────────────────────────────────────────────────┤
│  [All] [🔴 Critical] [🟠 Urgent] [💚 Recovering] [✨]   │
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
│  │  Found injured cat near the park. She needs    │   │
│  │  surgery urgently... more                      │   │
│  │                                                 │   │
│  │  ░░░░░░░░░░░░░░░░░░░░ 24% • €120 of €500      │   │
│  │                                                 │   │
│  │  👥 24 people helping                          │   │
│  │                                                 │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │        🤝 Join them • Help Luna         │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  (Next post...)                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key differences from Phase 1:**
- User header with avatar, username, time, location
- Action bar (like, comment, share)
- Social proof ("24 people helping")
- Softer CTA ("Join them" vs "Donate Now")

---

## 📱 Phase 3: Story Circles

```
┌─────────────────────────────────────────────────────────┐
│  🐾 Pawtreon                              🔍  🔔  👤   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮           │
│  │ + │ │🐱│ │🐕│ │👤│ │🐱│ │👤│ │🐕│  →              │
│  │Add│ │Luna│ │Max│ │Ana│ │Mia│ │Tom│ │Rex│           │
│  ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯           │
│   New   Update Update Helped Update Helped Update      │
│                                                         │
│  [All] [🔴 Critical] [🟠 Urgent] [💚 Recovering] [✨]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  (Instagram-style posts from Phase 2)                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Circle types (mixed content):**
| Type | Example | Ring Color |
|------|---------|------------|
| Add Case | "+" | Dashed primary |
| Case Update | 🐱 Luna recovered! | Gradient (orange/pink) |
| User Activity | 👤 Ana helped 3 | Gradient (blue/purple) |
| Success Story | 🏠 Max adopted! | Green gradient |

---

## 🧩 Component Breakdown

### Phase 1 Components

| Component | Status | Changes |
|-----------|--------|---------|
| `HomeHeader` | ✅ Exists | Keep as-is |
| `HeroCircles` | ✅ Exists | **Remove temporarily** |
| `FilterPills` | ✅ Exists | Keep as-is |
| `CaseCard` | ✅ Exists | Enhance with social proof |
| `SearchOverlay` | ✅ Exists | Keep as-is |

### Phase 2 Components (New)

| Component | Purpose |
|-----------|---------|
| `InstagramCaseCard` | Full Instagram-style post layout |
| `CaseActions` | Like, comment, share buttons |
| `HelpersCount` | "24 people helping" with avatars |
| `SoftDonationCTA` | "Join them" button |

### Phase 3 Components (New)

| Component | Purpose |
|-----------|---------|
| `StoryCircles` | Horizontal scroll container |
| `StoryAvatar` | Case/user/update circle |
| `StoryViewer` | Full-screen story experience |

---

## 📝 Implementation Checklist

### Phase 1: MVP Simplification
- [ ] Remove `HeroCircles` from Index.tsx
- [ ] Update `CaseCard` with social proof element
  - [ ] Add "X people helped" text
  - [ ] Change "Donate" to "Help [Name]"
- [ ] Test clean layout
- [ ] Update design doc

### Phase 2: Instagram Posts
- [ ] Create `InstagramCaseCard` component
- [ ] Add user info to case query (author avatar, name)
- [ ] Add `CaseActions` (like, comment, share)
- [ ] Add like/comment backend mutations
- [ ] Update Index.tsx to use new card
- [ ] A/B test: compact cards vs full posts

### Phase 3: Stories
- [ ] Repurpose `HeroCircles` → `StoryCircles`
- [ ] Create story content types schema
- [ ] Create `StoryViewer` full-screen component
- [ ] Add recent activity query
- [ ] Add top helpers query (when there's data)

---

## 🎨 CTA Language Evolution

| Phase | Button Text | Emotion |
|-------|-------------|---------|
| Current | "💝 Donate Now" | Transactional |
| Phase 1 | "❤️ Help Luna" | Personal |
| Phase 2 | "🤝 Join 24 helpers" | Social proof |
| Phase 3 | "🌟 Be part of her story" | Narrative |

---

## 📊 Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time to first action | ? | < 10s |
| Case click-through | ? | +20% |
| Donation conversion | ? | +15% |
| Return visitors | ? | +30% |
| Social shares | ? | +50% |

---

## 🚀 Recommended Next Steps

1. **Now**: Execute Phase 1 (remove circles, enhance cards)
2. **This week**: Design Phase 2 Instagram cards in detail
3. **Next week**: Implement Phase 2
4. **When traction**: Implement Phase 3 stories

---

## ❓ Open Questions

1. Should filter pills become a dropdown on mobile to save space?
2. Do we keep "Urgent Cases" horizontal scroll or go full vertical feed?
3. Should likes be public (social) or anonymous?
4. How do we handle cases without user attribution (imported/seeded)?

---

## 📎 Related Files

- `src/pages/Index.tsx` - Homepage
- `src/components/CaseCard.tsx` - Current card
- `src/components/homepage/HeroCircles.tsx` - To be removed/repurposed
- `convex/cases.ts` - Case queries
- `docs/11-HOMEPAGE-INSTAGRAM-REDESIGN.md` - Previous planning
