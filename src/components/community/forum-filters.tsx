import type { ForumBoard, ForumCategory, ForumSort } from "@/types";
import { CATEGORY_OPTIONS, SORT_OPTIONS } from "./forum-config";
import { cn } from "@/lib/utils";

interface ForumFiltersProps {
  board: ForumBoard;
  cityFilter: string;
  categoryFilter: "all" | ForumCategory;
  sort: ForumSort;
  cityOptions: Array<{ city: string; count: number }>;
  dense?: boolean;
  showSort?: boolean;
  onCityFilterChange: (city: string) => void;
  onCategoryFilterChange: (category: "all" | ForumCategory) => void;
  onSortChange: (sort: ForumSort) => void;
}

export function ForumFilters({
  board,
  cityFilter,
  categoryFilter,
  sort,
  cityOptions,
  dense = false,
  showSort = true,
  onCityFilterChange,
  onCategoryFilterChange,
  onSortChange,
}: ForumFiltersProps) {
  const categories = CATEGORY_OPTIONS[board];

  return (
    <section className={cn("rounded-3xl border border-border bg-card", dense ? "p-3" : "p-4")}>
      {showSort ? (
        <div className="flex items-center justify-between gap-3">
          <p className={cn("font-semibold text-foreground", dense ? "text-xs" : "text-sm")}>
            Filters
          </p>
          <label className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            Sort
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value as ForumSort)}
              className={cn(
                "rounded-xl border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong",
                dense ? "min-h-10 text-xs" : "min-h-11 text-sm"
              )}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <p className={cn("font-semibold text-foreground", dense ? "text-xs" : "text-sm")}>Filters</p>
      )}

      <div className="mt-3">
        <p className={cn("mb-2 font-medium text-muted-foreground", dense ? "text-xs" : "text-sm")}>City</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <CityChip
            label="All"
            selected={cityFilter === "all"}
            onClick={() => onCityFilterChange("all")}
            dense={dense}
          />
          <CityChip
            label="Nearby"
            selected={cityFilter === "nearby"}
            onClick={() => onCityFilterChange("nearby")}
            dense={dense}
          />
          {cityOptions.map((city) => (
            <CityChip
              key={city.city}
              label={`${city.city} (${city.count})`}
              selected={cityFilter.toLowerCase() === city.city.toLowerCase()}
              onClick={() => onCityFilterChange(city.city)}
              dense={dense}
            />
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className={cn("mb-2 font-medium text-muted-foreground", dense ? "text-xs" : "text-sm")}>Category</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <CityChip
            label="All"
            selected={categoryFilter === "all"}
            onClick={() => onCategoryFilterChange("all")}
            dense={dense}
          />
          {categories.map((category) => (
            <CityChip
              key={category.value}
              label={category.label}
              selected={categoryFilter === category.value}
              onClick={() => onCategoryFilterChange(category.value)}
              dense={dense}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CityChip({
  label,
  selected,
  dense = false,
  onClick,
}: {
  label: string;
  selected: boolean;
  dense?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border whitespace-nowrap transition-colors",
        dense ? "min-h-10 px-3 text-xs font-semibold" : "min-h-11 px-3 text-sm font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-chip-bg text-foreground active:bg-muted"
      )}
    >
      {label}
    </button>
  );
}
