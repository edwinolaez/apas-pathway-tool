import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, components } from "./_generated/api";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";

/**
 * Ingest all programs into the RAG system for semantic search
 * Run this action once to populate the RAG with all programs from the database
 */
export const ingestProgramsToRAG = action({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    totalPrograms: number;
    ingested: number;
    error?: string;
  }> => {
    const batchSize = args.batchSize ?? 10;

    // Initialize RAG with OpenAI embeddings
    const rag = new RAG(components.rag, {
      textEmbeddingModel: openai.embedding("text-embedding-3-small"),
      embeddingDimension: 1536,
      filterNames: ["province", "credential", "field", "deliveryMode"],
    });

    try {
      // Fetch all programs from database
      const programs = await ctx.runQuery(api.queries.getAllPrograms);

      console.log(`Starting ingestion of ${programs.length} programs...`);

      let ingested = 0;

      // Process programs in batches
      for (let i = 0; i < programs.length; i += batchSize) {
        const batch = programs.slice(i, i + batchSize);

        for (const program of batch) {
          try {
            // Build text content for RAG
            const programText = buildProgramText(program);

            // Add to RAG with metadata filters
            await rag.add(ctx, {
              namespace: "global-programs",
              text: programText,
              key: program.id, // Gracefully update if program is re-ingested
              filterValues: [
                {
                  name: "province",
                  value: extractProvince(program.institution),
                },
                {
                  name: "credential",
                  value: program.credentialNormalized || "other",
                },
                {
                  name: "field",
                  value: deriveField(program),
                },
                {
                  name: "deliveryMode",
                  value:
                    program.additionalInfo?.deliveryMode || "unknown",
                },
              ],
            });

            ingested += 1;
          } catch (err) {
            console.error(`Error ingesting program ${program.id}:`, err);
            // Continue with next program
          }
        }

        console.log(`Progress: ${i + batchSize}/${programs.length}`);
      }

      return {
        totalPrograms: programs.length,
        ingested,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error during ingestion";
      console.error("Ingestion error:", errorMessage);
      return {
        totalPrograms: 0,
        ingested: 0,
        error: errorMessage,
      };
    }
  },
});

/**
 * Build searchable text content from program data
 */
function buildProgramText(program: { name: string; institution: string; credentials: string; duration: string; description?: string; careerPaths?: string[]; skills?: string[]; additionalInfo?: { deliveryMode?: string }; prerequisites?: unknown; tuition?: { domestic?: number | string | null; international?: number | string | null } }): string {
  const lines = [
    `Program: ${program.name}`,
    `Institution: ${program.institution}`,
    `Credential: ${program.credentials}`,
    `Duration: ${program.duration}`,
    `Description: ${program.description || ""}`,
    `Career Paths: ${(program.careerPaths || []).join(", ")}`,
    `Skills: ${(program.skills || []).join(", ")}`,
    `Delivery Mode: ${program.additionalInfo?.deliveryMode || ""}`,
    `Prerequisites: ${JSON.stringify(program.prerequisites || "")}`,
    `Tuition (Domestic): ${program.tuition?.domestic || ""}`,
    `Tuition (International): ${program.tuition?.international || ""}`,
  ];

  return lines.filter((line) => line.split(": ")[1]).join("\n");
}

/**
 * Extract province from institution name (simple heuristic)
 */
function extractProvince(institution: string): string {
  const albertaInstitutions = [
    "university of alberta",
    "southern alberta institute of technology",
    "university of calgary",
    "athabasca university",
    "medicine hat college",
    "red deer college",
  ];

  const lowerInstitution = institution.toLowerCase();

  if (albertaInstitutions.some((inst) => lowerInstitution.includes(inst))) {
    return "Alberta";
  }

  // Check for other province keywords
  if (lowerInstitution.includes("british columbia")) return "British Columbia";
  if (lowerInstitution.includes("ontario")) return "Ontario";
  if (lowerInstitution.includes("quebec")) return "Quebec";
  if (lowerInstitution.includes("manitoba")) return "Manitoba";
  if (lowerInstitution.includes("saskatchewan")) return "Saskatchewan";

  return "Canada"; // Default
}

/**
 * Derive career field from program data
 */
function deriveField(program: { skills?: string[]; careerPaths?: string[] }): string {
  const skills = ((program.skills || []) as string[])
    .join(" ")
    .toLowerCase();
  const careerPaths = ((program.careerPaths || []) as string[])
    .join(" ")
    .toLowerCase();
  const content = `${skills} ${careerPaths}`;

  if (
    /software|web|developer|programming|it|data|cloud|cyber|computer/.test(
      content
    )
  )
    return "Technology";
  if (/account|finance|business|commerce|tax|analyst/.test(content))
    return "Business & Finance";
  if (
    /engineering|mechanical|electrical|civil|design technologist/.test(
      content
    )
  )
    return "Engineering";
  if (/health|nursing|medical|clinical/.test(content)) return "Health Sciences";
  if (/art|design|creative|music|media/.test(content)) return "Arts & Design";
  if (/education|teaching|instructor/.test(content)) return "Education";
  if (/trade|construction|plumbing|electrical|hvac/.test(content))
    return "Trades";

  return "General";
}
