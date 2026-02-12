/* @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { CaseVerificationStatus } from "@/types";
import { VerificationBadge } from "./VerificationBadge";

function renderBadge(status: CaseVerificationStatus, showExplainer = false) {
  return render(
    <TooltipProvider>
      <VerificationBadge status={status} showExplainer={showExplainer} />
    </TooltipProvider>,
  );
}

describe("VerificationBadge", () => {
  it.each([
    { status: "unverified" as const, label: "Unverified" },
    { status: "community" as const, label: "Community ✓" },
    { status: "clinic" as const, label: "Clinic ✓" },
  ])("renders $status label", ({ status, label }) => {
    renderBadge(status);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("renders an explainer trigger button when enabled", () => {
    renderBadge("unverified", true);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
