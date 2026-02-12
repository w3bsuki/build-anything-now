import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedCase, seedUser } from "./testHelpers";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("cases verification automation", () => {
  it("requires downgrade reason and writes revocation audit log", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t, { clerkId: "verification_owner" });
    const { clerkId: adminClerkId } = await seedUser(t, { clerkId: "verification_admin", role: "admin" });
    const caseId = await seedCase(t, ownerId, { verificationStatus: "clinic" });
    const asAdmin = t.withIdentity(buildIdentity(adminClerkId));

    await expect(
      asAdmin.mutation(api.cases.setVerificationStatus, {
        caseId,
        verificationStatus: "community",
      }),
    ).rejects.toThrow("Revocation reason is required");

    const result = await asAdmin.mutation(api.cases.setVerificationStatus, {
      caseId,
      verificationStatus: "community",
      notes: "Clinic evidence expired",
    });

    expect(result).toMatchObject({ ok: true, status: "community", revoked: true });

    const updatedCase = await t.query(api.cases.get, { id: caseId });
    expect(updatedCase?.verificationStatus ?? "unverified").toBe("community");

    const auditLogs = await t.run(async (ctx) => {
      return ctx.db
        .query("auditLogs")
        .withIndex("by_entity", (q) => q.eq("entityType", "case").eq("entityId", String(caseId)))
        .collect();
    });
    const revocationLog = auditLogs.find((log) => log.action === "case.verification_revoked");
    expect(revocationLog).toBeTruthy();
    expect(revocationLog?.details).toBe("clinic -> community");
    expect(revocationLog?.metadataJson).toContain("Clinic evidence expired");
  });

  it("enforces a per-user daily endorsement limit", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t, { clerkId: "endorsement_owner" });
    const trusted = await seedUser(t, {
      clerkId: "endorsement_trusted",
      verificationLevel: "community",
      createdAt: Date.now() - 2 * DAY_MS,
    });
    const asTrusted = t.withIdentity(buildIdentity(trusted.clerkId));

    const caseIds = await Promise.all(
      Array.from({ length: 11 }).map((_, index) =>
        seedCase(t, ownerId, { verificationStatus: "unverified", title: `Limit case ${index + 1}` }),
      ),
    );

    for (const caseId of caseIds.slice(0, 10)) {
      const result = await asTrusted.mutation(api.cases.endorseCase, { caseId });
      expect(result.ok).toBe(true);
      expect(result.alreadyEndorsed).toBe(false);
    }

    await expect(
      asTrusted.mutation(api.cases.endorseCase, { caseId: caseIds[10] }),
    ).rejects.toThrow("Daily endorsement limit reached");
  });

  it("flags suspected endorsement brigading and blocks auto-promotion", async () => {
    const t = createTestClient();
    const { userId: ownerId } = await seedUser(t, { clerkId: "brigade_owner" });
    const caseId = await seedCase(t, ownerId, { verificationStatus: "unverified", riskLevel: "low" });

    const endorsers = await Promise.all(
      Array.from({ length: 6 }).map((_, index) =>
        seedUser(t, {
          clerkId: `brigade_trusted_${index}`,
          verificationLevel: "community",
        }),
      ),
    );

    let lastResult:
      | {
          ok: boolean;
          alreadyEndorsed: boolean;
          endorsedCount: number;
          qualifiedEndorsedCount: number;
          brigadeDetected?: boolean;
          promotedToCommunity: boolean;
        }
      | undefined;

    for (const endorser of endorsers) {
      lastResult = await t
        .withIdentity(buildIdentity(endorser.clerkId))
        .mutation(api.cases.endorseCase, { caseId });
    }

    expect(lastResult?.brigadeDetected).toBe(true);
    expect(lastResult?.promotedToCommunity).toBe(false);
    expect(lastResult?.qualifiedEndorsedCount).toBe(0);

    const updatedCase = await t.query(api.cases.get, { id: caseId });
    expect(updatedCase?.riskLevel).toBe("high");
    expect(updatedCase?.riskFlags ?? []).toContain("endorsement_brigading_suspected");
    expect(updatedCase?.verificationStatus ?? "unverified").toBe("unverified");

    const reports = await t.run(async (ctx) => {
      return ctx.db
        .query("reports")
        .withIndex("by_case", (q) => q.eq("caseId", caseId))
        .collect();
    });
    const brigadeReport = reports.find(
      (report) => report.reason === "suspected_scam" && report.details?.includes("endorsement_brigade"),
    );
    expect(brigadeReport).toBeTruthy();

    const auditLogs = await t.run(async (ctx) => {
      return ctx.db
        .query("auditLogs")
        .withIndex("by_entity", (q) => q.eq("entityType", "case").eq("entityId", String(caseId)))
        .collect();
    });
    expect(auditLogs.some((log) => log.action === "case.endorsement_brigade_flagged")).toBe(true);
  });
});
