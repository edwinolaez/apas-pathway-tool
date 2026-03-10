import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper functions for program processing
function normalizeCredential(raw: string): string {
  const value = raw.toLowerCase();
  if (value.includes("certificate")) return "certificate";
  if (value.includes("diploma")) return "diploma";
  if (value.includes("bachelor")) return "bachelor";
  if (value.includes("master")) return "master";
  if (value.includes("doctoral") || value.includes("phd")) return "doctorate";
  return "other";
}

function parseDurationMonths(raw?: string): number {
  if (!raw) return 0;
  const yearsMatch = raw.match(/(\d+)\s*year/i);
  if (yearsMatch) return Number(yearsMatch[1]) * 12;
  const monthsMatch = raw.match(/(\d+)\s*month/i);
  if (monthsMatch) return Number(monthsMatch[1]);
  return 0;
}

function toDurationBucket(months: number): string {
  if (months <= 0) return "unknown";
  if (months <= 12) return "short";
  if (months <= 24) return "medium";
  if (months <= 48) return "long";
  return "extended";
}

function parseTuitionValue(raw: number | string | null | undefined): number | undefined {
  if (typeof raw === "number") return raw;
  if (typeof raw !== "string") return undefined;
  const numeric = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

function toTuitionBand(value?: number): string {
  if (!value) return "unknown";
  if (value < 8000) return "budget";
  if (value < 15000) return "mid";
  if (value < 25000) return "premium";
  return "high";
}

function parseDeliveryModes(raw?: string): string[] {
  if (!raw) return ["unknown"];
  return raw
    .toLowerCase()
    .split(/,|\/|or|and/)
    .map((s) => s.replace(/[()]/g, "").trim())
    .filter(Boolean)
    .map((s) => {
      if (s.includes("online")) return "online";
      if (s.includes("hybrid") || s.includes("blended")) return "hybrid";
      if (s.includes("campus")) return "on-campus";
      return s;
    });
}

function normalizeStartTerms(terms?: string[]): string[] {
  const toLowerArray = (values: string[] | undefined): string[] => {
    return (values ?? []).map((v) => v.trim().toLowerCase()).filter(Boolean);
  };
  
  return toLowerArray(terms).map((term) => {
    if (term.includes("sep") || term.includes("fall")) return "fall";
    if (term.includes("jan") || term.includes("winter")) return "winter";
    if (term.includes("may") || term.includes("spring") || term.includes("summer")) return "spring";
    return term;
  });
}

function projectProgramFilters(program: any) {
  const credentialNormalized = normalizeCredential(program.credentials ?? "other");
  const durationMonths = parseDurationMonths(program.duration);
  const durationBucket = toDurationBucket(durationMonths);
  const deliveryModes = parseDeliveryModes(program.additionalInfo?.deliveryMode);
  const startTerms = normalizeStartTerms(program.additionalInfo?.startDates);
  const domesticTuitionValue = parseTuitionValue(program.tuition?.domestic);
  const internationalTuitionValue = parseTuitionValue(program.tuition?.international);

  return {
    credentialNormalized,
    durationMonths,
    durationBucket,
    deliveryModes,
    startTerms,
    coopAvailable: program.additionalInfo?.coopAvailable,
    domesticTuitionValue,
    internationalTuitionValue,
    domesticTuitionBand: toTuitionBand(domesticTuitionValue),
    internationalTuitionBand: toTuitionBand(internationalTuitionValue),
    skills: (program.skills ?? []).map((v: string) => v.trim().toLowerCase()).filter(Boolean),
    careerPaths: (program.careerPaths ?? []).map((v: string) => v.trim().toLowerCase()).filter(Boolean),
    nocCodes: (program.nocCodes ?? []).map((n: string) => n.trim()).filter(Boolean),
  };
}

function buildProgramNamespaces(program: any) {
  const filters = projectProgramFilters(program);
  
  function deriveCareerClusters(skills: string[], careers: string[]): string[] {
    const bag = `${skills.join(" ")} ${careers.join(" ")}`.toLowerCase();
    const clusters: string[] = [];

    if (/software|web|developer|programming|it|data|cloud|cyber/.test(bag)) clusters.push("tech");
    if (/account|finance|business|commerce|tax|analyst/.test(bag)) clusters.push("business-finance");
    if (/engineering|mechanical|electrical|civil|design technologist/.test(bag)) clusters.push("engineering");
    if (/health|nursing|medical|clinical/.test(bag)) clusters.push("health");
    if (clusters.length === 0) clusters.push("general");

    return clusters;
  }

  const clusters = deriveCareerClusters(filters.skills, filters.careerPaths);
  const namespaces = new Set<string>();

  namespaces.add(`institution:${program.institutionId}`);
  namespaces.add(`credential:${filters.credentialNormalized}`);
  namespaces.add(`duration:${filters.durationBucket}`);

  for (const mode of filters.deliveryModes) namespaces.add(`delivery:${mode}`);
  for (const term of filters.startTerms) namespaces.add(`start:${term}`);
  for (const cluster of clusters) namespaces.add(`career:${cluster}`);

  if (filters.coopAvailable) namespaces.add("pathway:coop");
  if (program.additionalInfo?.transferCreditsAvailable) namespaces.add("pathway:transfer");
  if (program.additionalInfo?.pathwayPrograms) namespaces.add("pathway:ladder");

  namespaces.add(`tuition:${filters.domesticTuitionBand}`);

  for (const noc of filters.nocCodes) {
    if (noc.length >= 2) namespaces.add(`noc:${noc.slice(0, 2)}`);
  }

  return Array.from(namespaces);
}

export const uploadPrograms = mutation({
  args: {
    programs: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const program of args.programs) {
      const filters = projectProgramFilters(program);
      const namespaceTags = buildProgramNamespaces(program);

      const payload = {
        ...program,
        isIngested: false,
        updatedAt: now,
        credentialNormalized: filters.credentialNormalized,
        durationMonths: filters.durationMonths,
        durationBucket: filters.durationBucket,
        deliveryModes: filters.deliveryModes,
        startTerms: filters.startTerms,
        coopAvailable: filters.coopAvailable,
        domesticTuitionValue: filters.domesticTuitionValue,
        internationalTuitionValue: filters.internationalTuitionValue,
        domesticTuitionBand: filters.domesticTuitionBand,
        internationalTuitionBand: filters.internationalTuitionBand,
        namespaceTags,
      };

      const existing = await ctx.db
        .query("programs")
        .withIndex("by_programId", (q) => q.eq("id", program.id))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, payload);
      } else {
        await ctx.db.insert("programs", payload);
      }
    }
    console.log(`✅ Successfully uploaded ${args.programs.length} programs!`);
  },
});

export const markProgramIngested = mutation({
  args: {
    programId: v.string(),
    ingested: v.boolean(),
  },
  handler: async (ctx, args) => {
    const program = await ctx.db
      .query("programs")
      .withIndex("by_programId", (q) => q.eq("id", args.programId))
      .first();

    if (!program) return null;

    await ctx.db.patch(program._id, {
      isIngested: args.ingested,
      ingestedAt: args.ingested ? Date.now() : undefined,
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});
// ADD THIS: The 'read' function for your test page
export const getAllPrograms = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("programs").collect();
  },
});    