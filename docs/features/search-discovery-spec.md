# Search & Discovery Spec

> **Owner:** Product
> **Status:** draft
> **Last updated:** 2026-02-08
> **PRD Ref:** HOME FEED

## Purpose

Enable users to find rescue cases, clinics, campaigns, community posts, and adoption listings through search and filtering. Discovery is the top of every user funnel — a donor who can't find urgent cases nearby won't donate, a volunteer who can't find cases in their city won't help. Search must be fast, server-driven, and rescue-first (no dead ends — always guide toward meaningful action).

## User Stories

- As a **donor**, I want to search for urgent cases near me so I can donate where it matters most.
- As a **rescuer**, I want to find clinics in my city that are open 24h so I can get emergency care.
- As a **user**, I want to filter the home feed by urgency, city, and case type so I see relevant content.
- As a **volunteer**, I want to find cases in my city that need transport help.
- As a **user**, I want my recent searches saved so I can quickly re-run common queries.
- As a **user**, I want to see trending/popular searches so I can discover what's happening in the community.

## Functional Requirements

1. **Search overlay** — Full-screen overlay triggered by search icon on home feed. Contains: text input, recent searches, trending searches, quick location filters.
2. **Filter rail** — Horizontal scrollable pill bar on home feed. **Max 4 controls on mobile** (per ui-patterns-spec.md): `Urgent`, `Near me`, `[City]`, `More`. "More" expands a sheet with additional filters.
3. **Search targets** — Search operates across multiple entity types:
   - **Cases**: title, description, city, animal type, urgency, status
   - **Clinics**: name, city, specialization, 24h availability
   - **Campaigns**: title, description
   - **Community posts**: title, content, category, city tag
   - **Adoption listings**: animal name, type, city
4. **Server-driven filtering** — All filtering happens via Convex query arguments. **No client-side "fetch all then filter"** (per DESIGN.md). Each entity type has its own filtered query.
5. **Sort options** — Newest, Most Urgent (cases), Most Funded (campaigns), Nearest (requires location).
6. **Location-based discovery** — City filter dropdown populated from known cities (Sofia, Varna, Plovdiv for Bulgaria launch). "Near me" uses browser Geolocation API → resolve to nearest known city. No GPS coordinates stored or transmitted.
7. **Recent searches** — Stored client-side in localStorage. Max 6 entries. User can clear history.
8. **Trending searches** — Curated list of popular/timely search terms. Hardcoded for launch, server-driven in future.
9. **Empty states** — When search returns no results: rescue-first CTA — "No results found. Try adjusting your filters, or create a case to help an animal."  No dead ends (RULES.md).
10. **Debounced input** — Search input fires query after 300ms debounce to prevent excessive queries.

## Non-Functional Requirements

- **Performance**: Search results must return in <300ms for queries matching up to 1000 entities. Filter changes on home feed are instant (no loading spinner for simple filter toggles).
- **Privacy**: No user PII in search results. Case locations show city only. Clinic addresses are public by nature (business listings).
- **Accessibility**: Search overlay is keyboard-dismissible (Escape). Filter pills are keyboard-navigable with visible focus rings. Results have ARIA labels.
- **i18n**: Filter labels, sort options, empty states, and placeholder text use i18n keys. Search queries operate on original-language content (no cross-language search in v1).
- **Mobile-first**: Filter rail is touch-scrollable. Search overlay takes full viewport. Touch targets ≥ 44×44px for all filter pills and result cards.

## Data Model

No dedicated search tables. Search operates over existing tables via Convex indexes.

### Key indexes used for search/filtering

| Table | Index | Used For |
|-------|-------|----------|
| `cases` | `by_status`, `by_lifecycle_stage`, `by_verification_status` | Case status/stage filtering |
| `clinics` | `by_city`, `by_verified`, `by_featured` | Clinic directory filtering |
| `campaigns` | (by status — needs index) | Campaign filtering |
| `communityPosts` | `by_board_created`, `by_board_category`, `by_board_city` | Community post filtering |
| `adoptions` | `by_status` | Adoption listing filtering |

### Missing indexes (needed for search)

| Table | Index | Purpose |
|-------|-------|---------|
| `cases` | `by_city` or city field + index | Filter cases by city (currently no city index — cases use a `location` object) |
| `cases` | `by_urgency` or urgency field + index | Filter by urgency level |
| `campaigns` | `by_status` | Filter active/completed campaigns |
| `adoptions` | `by_animal_type`, `by_city` | Filter by type and location |

## API Surface

### Existing

No dedicated search API exists. Current entity-listing queries serve as implicit search:

| Function | File | Description |
|----------|------|-------------|
| `cases.listUiForLocale` | convex/cases.ts | List cases with locale-aware translation. Returns all active cases. |
| `clinics.list` | convex/clinics.ts | List clinics (possibly with city filter). |
| `community.listPosts` | convex/community.ts | List community posts with board/category filters. |
| `campaigns.list` | convex/campaigns.ts | List campaigns. |

### Needed

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `cases.search` | query | No | Search cases by: text query (title/description match), city, urgency, status, animalType. Sort: newest, most_urgent, most_funded. Cursor-based pagination. |
| `clinics.search` | query | No | Search clinics by: text query (name match), city, specialization, is24h. Sort: alphabetical, rating, featured. |
| `campaigns.search` | query | No | Search campaigns by: text query (title/description match), status (active/completed). Sort: newest, most_funded. |
| `communityPosts.search` | query | No | Search posts by: text query (title/content match), board, category, cityTag. Sort: newest, most_active. |
| `adoptions.search` | query | No | Search adoption listings by: animalType, city, status. Sort: newest. |
| `search.trending` | query | No | Return trending search terms (hardcoded initially, data-driven in future). |

### Architecture note: Text search

Convex does not have built-in full-text search / trigram search. Options for text matching:

| Approach | Pros | Cons |
|----------|------|------|
| **Convex search indexes** (if available) | Native, no external dependency | Limited functionality, may not exist yet |
| **Client-side prefix matching** | Simple | Doesn't scale, leaks data |
| **Filter with `.filter()` after index scan** | Works today | Scans potentially many documents, slow for large datasets |
| **External search service** (Algolia, Typesense) | Full-text, relevance ranking, fast | Additional dependency, cost, sync complexity |

**Recommendation for MVP**: Use Convex `.filter()` with reasonable index narrowing (filter by status, city first, then text match on the reduced set). This works for <10K cases. Revisit when scale demands it.

## UI Surfaces

### Existing

- **SearchOverlay** (`src/components/search/SearchOverlay.tsx`) — Full-screen overlay with: search input (with clear button), recent searches section (localStorage, max 6, removable), trending searches section (hardcoded: "winter shelter", "critical surgery", "varna beach strays"), quick location filters (hardcoded: "Near me", "Sofia", "Plovdiv", "Varna"). Search submit calls `onSearch` callback which passes string to parent — **no server-side search integration**. Escape key dismisses overlay.
- **FilterPills** (`src/components/FilterPills.tsx`) — Referenced by homepage for filter rail.

### Needed

- **Wire SearchOverlay** — Connect `onSearch` callback to actual search queries. When user submits search: (1) add to recent searches, (2) navigate to search results, (3) fire appropriate entity search query.
- **Search Results page** — Route: `/search?q=...&type=...`. Tabbed results by entity type (All / Cases / Clinics / Campaigns / Community / Adoptions). Default tab: All (interleaved results, cases prioritized). Each result rendered as its appropriate card type. "No results" empty state per tab.
- **Enhanced Filter Rail** — Wire filter pills to query arguments: `Urgent` → cases with urgency "critical"/"urgent", `Near me` → resolve city from Geolocation API (with fallback to no filter), `[City]` → city picker dropdown, `More` → bottom sheet with: animal type, case status, date range.
- **"Near me" location flow** — Request browser/Capacitor geolocation → map to nearest known city → apply city filter. Fallback if denied: show city picker dropdown instead. Never transmit or store GPS coordinates.

## Edge Cases & Abuse

| Scenario | Handling |
|----------|----------|
| Zero search results | Rescue-first CTA: "No results. Adjust filters or create a case." Never show a blank page. |
| Very long search query | Truncate at 200 characters. Server ignores queries >200 chars. |
| Special characters / injection | Queries are treated as plain text for string matching. No SQL/NoSQL injection risk with Convex. |
| "Near me" geolocation denied | Fall back to city picker. Do not re-prompt more than once per session. |
| Geolocation unsupported (desktop) | Hide "Near me" pill on browsers without Geolocation API. Show city picker only. |
| High-volume search queries | Debounce 300ms. No real-time "search as you type" for server queries (only for recent/trending client-side filtering). |
| Stale trending searches | Trending list hardcoded for launch. Mark as "updated periodically" — not a real-time hot query. |

## Acceptance Criteria

- [ ] Search returns results in <500ms for up to 1000 entities.
- [ ] Home feed loads without client-side filtering — all filtering is server-driven via Convex queries.
- [ ] Empty search results show a meaningful empty state with suggested actions ("Try a different city" / "Browse urgent cases").
- [ ] Filter state is preserved across navigation (back button returns to filtered results).
- [ ] City filter narrows results to cases with matching `location.city`.
- [ ] "Urgent" filter returns only cases with `urgencyLevel: urgent` or `priority: critical`.
- [ ] Pagination loads next page without re-fetching previous pages (cursor-based).
- [ ] Search query matches against case title, case description, and clinic name.
- [ ] No dead ends — every empty state includes at least one CTA to discover other content.

## Open Questions

1. **Full-text search approach** — Convex doesn't natively support full-text/fuzzy search. For MVP, `.filter()` on narrowed index scans works for small datasets. At scale (>10K cases), need to decide: Convex search indexes (if they ship), Algolia, Typesense, or Meilisearch? **→ Revisit at 5K cases. DECISIONS.md entry when chosen.**

2. **Cross-entity search ranking** — When showing "All" results containing cases, clinics, and campaigns, how are they ranked/interleaved? Options: (a) entity-type sections (cases first, then clinics, then campaigns), (b) relevance-ranked interleave (needs a scoring algorithm), (c) chronological across all types. **→ Recommendation: entity-type sections for v1.**

3. **Search analytics** — Should we track search queries for product insights (popular terms, zero-result queries, conversion)? This requires an analytics pipeline. See analytics-spec.md (Phase 5). **→ Post-MVP.**

4. **Geolocation precision** — "Near me" maps to the nearest known city. For Bulgaria launch this is Sofia, Varna, Plovdiv. Should we support finer granularity (neighborhoods) or keep city-level? **→ City-level for launch, revisit for EU expansion.**

5. **Saved searches / alerts** — Should users be able to save a search and get notified when new matching results appear? E.g., "Alert me when a new critical case appears in Sofia." **→ Post-MVP enhancement.**
