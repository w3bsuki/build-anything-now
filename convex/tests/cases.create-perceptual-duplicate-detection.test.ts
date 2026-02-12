import { describe, expect, it } from "vitest";
import type { Id } from "../_generated/dataModel";
import { api } from "../_generated/api";
import { buildIdentity, createTestClient, seedUser, type TestClient } from "./testHelpers";

type CreateCaseInput = {
  imageId: Id<"_storage">;
  title: string;
  foundAt: number;
  pHash?: string;
  dHash?: string;
};

async function storeImage(t: TestClient, contents: string) {
  return t.run(async (ctx) => {
    return ctx.storage.store(new Blob([contents], { type: "image/jpeg" }));
  });
}

function buildCreateCaseArgs(input: CreateCaseInput) {
  const perceptualHashes =
    input.pHash || input.dHash
      ? [
          {
            storageId: input.imageId,
            pHash: input.pHash,
            dHash: input.dHash,
          },
        ]
      : undefined;

  return {
    type: "urgent" as const,
    category: "medical" as const,
    language: "en",
    title: input.title,
    description: `${input.title} description`,
    story: `${input.title} story`,
    images: [input.imageId],
    location: {
      city: "Sofia",
      neighborhood: "Center",
    },
    foundAt: input.foundAt,
    fundraisingGoal: 500,
    currency: "EUR",
    ...(perceptualHashes ? { perceptualHashes } : {}),
  };
}

async function listFingerprintsForCase(t: TestClient, caseId: Id<"cases">) {
  return t.run(async (ctx) => {
    return ctx.db
      .query("imageFingerprints")
      .withIndex("by_case", (q) => q.eq("caseId", caseId))
      .collect();
  });
}

async function listReportsForCase(t: TestClient, caseId: Id<"cases">) {
  return t.run(async (ctx) => {
    return ctx.db
      .query("reports")
      .withIndex("by_case", (q) => q.eq("caseId", caseId))
      .collect();
  });
}

describe("cases.create perceptual duplicate detection", () => {
  it("flags new case and files duplicate report when perceptual hashes match", async () => {
    const t = createTestClient();
    const sourceUser = await seedUser(t, { clerkId: "phash_source_user" });
    const incomingUser = await seedUser(t, { clerkId: "phash_incoming_user" });

    const sourceImageId = await storeImage(t, "source-image-bytes");
    const incomingImageId = await storeImage(t, "incoming-image-bytes");
    const matchingPHash = "aaaaaaaaaaaa0000";
    const matchingDHash = "bbbbbbbbbbbb0000";

    const sourceCaseId = await t.withIdentity(buildIdentity(sourceUser.clerkId)).mutation(
      api.cases.create,
      buildCreateCaseArgs({
        imageId: sourceImageId,
        title: "Perceptual source case",
        foundAt: 1700000000000,
        pHash: matchingPHash,
        dHash: matchingDHash,
      }),
    );

    const incomingCaseId = await t.withIdentity(buildIdentity(incomingUser.clerkId)).mutation(
      api.cases.create,
      buildCreateCaseArgs({
        imageId: incomingImageId,
        title: "Perceptual incoming case",
        foundAt: 1700000001000,
        pHash: matchingPHash,
        dHash: matchingDHash,
      }),
    );

    const [sourceFingerprint] = await listFingerprintsForCase(t, sourceCaseId);
    const [incomingFingerprint] = await listFingerprintsForCase(t, incomingCaseId);
    expect(sourceFingerprint?.sha256).toBeDefined();
    expect(incomingFingerprint?.sha256).toBeDefined();
    expect(sourceFingerprint?.sha256).not.toBe(incomingFingerprint?.sha256);

    const incomingCase = await t.query(api.cases.get, { id: incomingCaseId });
    expect(incomingCase?.riskLevel).toBe("high");
    expect(incomingCase?.riskFlags ?? []).toContain("possible_duplicate_images");

    const reports = await listReportsForCase(t, incomingCaseId);
    expect(reports).toHaveLength(1);
    expect(reports[0]?.reason).toBe("duplicate_case");

    const details = JSON.parse(reports[0]?.details ?? "{}") as {
      matchedCaseIds?: string[];
      perceptual?: {
        matches?: Array<{
          matchedCaseId: string;
          sourceStorageId: string;
          matchedStorageId: string;
          pHashDistance?: number;
          dHashDistance?: number;
        }>;
      };
    };
    expect(details.matchedCaseIds).toContain(String(sourceCaseId));
    expect(details.perceptual?.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          matchedCaseId: String(sourceCaseId),
          sourceStorageId: String(incomingImageId),
          matchedStorageId: String(sourceImageId),
          pHashDistance: 0,
          dHashDistance: 0,
        }),
      ]),
    );
  });

  it("does not auto-flag when perceptual hashes do not match", async () => {
    const t = createTestClient();
    const sourceUser = await seedUser(t, { clerkId: "phash_mismatch_source_user" });
    const incomingUser = await seedUser(t, { clerkId: "phash_mismatch_incoming_user" });

    const sourceImageId = await storeImage(t, "mismatch-source-image");
    const incomingImageId = await storeImage(t, "mismatch-incoming-image");
    const sourcePHash = "cccccccccccc0000";
    const incomingPHash = "ccccccccccccffff";

    await t.withIdentity(buildIdentity(sourceUser.clerkId)).mutation(
      api.cases.create,
      buildCreateCaseArgs({
        imageId: sourceImageId,
        title: "Perceptual mismatch source",
        foundAt: 1700000002000,
        pHash: sourcePHash,
      }),
    );

    const incomingCaseId = await t.withIdentity(buildIdentity(incomingUser.clerkId)).mutation(
      api.cases.create,
      buildCreateCaseArgs({
        imageId: incomingImageId,
        title: "Perceptual mismatch incoming",
        foundAt: 1700000003000,
        pHash: incomingPHash,
      }),
    );

    const incomingCase = await t.query(api.cases.get, { id: incomingCaseId });
    expect(incomingCase?.riskLevel).toBe("low");
    expect(incomingCase?.riskFlags).toBeUndefined();

    const reports = await listReportsForCase(t, incomingCaseId);
    expect(reports).toHaveLength(0);
  });
});
