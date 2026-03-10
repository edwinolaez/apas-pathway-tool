import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, components } from "./_generated/api";
import { Agent, createTool, saveMessage } from "@convex-dev/agent";
import { z } from "zod";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import type { Id } from "./_generated/dataModel";

type ProgramCard = {
  id: string;
  name: string;
  institution: string;
  credentials: string;
  duration: string;
  tuition: string;
  description: string;
  deliveryMode: string;
};

// Initialize RAG for semantic search
function initializeRAG() {
  return new RAG(components.rag, {
    textEmbeddingModel: openai.embedding("text-embedding-3-small"),
    embeddingDimension: 1536,
    filterNames: ["province", "credential", "field", "deliveryMode"],
  });
}

/**
 * Create the advisor agent with tools for program discovery
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createAdvisorAgent(): any {
  const rag = initializeRAG();

  const searchProgramsTool = createTool({
    description:
      "Search for post-secondary programs matching student needs and interests. Use this to find programs based on career goals, interests, field of study, or other criteria.",
    args: z.object({
      query: z.string().describe("What kind of programs is the student looking for?"),
      province: z
        .string()
        .optional()
        .describe("Filter by province (e.g., Alberta, Ontario)"),
      deliveryMode: z
        .enum(["online", "hybrid", "on-campus"])
        .optional()
        .describe("Preferred delivery mode"),
    }),
    handler: async (ctx, { query, province, deliveryMode }) => {
      const filterValues = [];
      if (province) filterValues.push({ name: "province", value: province });
      if (deliveryMode)
        filterValues.push({ name: "deliveryMode", value: deliveryMode });

      const results = await rag.search(ctx, {
        namespace: "global-programs",
        query,
        limit: 10,
        filters: filterValues.length > 0 ? filterValues : undefined,
      });

      if (!results.results || results.results.length === 0) {
        return "No programs found matching that criteria. Try a different search or remove filters.";
      }

      // Format results for readability
      const formattedResults = results.results
        .slice(0, 5)
        .map(
          (result) => {
            const firstContent = result.content[0];
            const text = firstContent?.text || "";
            return `- Program ID: ${result.entryId}: ${text.substring(0, 100)}...`;
          }
        )
        .join("\n");

      return `Found ${results.results.length} programs:\n${formattedResults}\n\nUse the checkEligibility tool to see which ones you might qualify for.`;
    },
  });

  const checkEligibilityTool = createTool({
    description:
      "Check if a student is eligible for specific programs based on their current education and background. Requires a student to have a profile in the system.",
    args: z.object({
      studentId: z.string().describe("The student's ID from their profile"),
    }),
    handler: async (ctx, { studentId }) => {
      try {
        const eligibility = await ctx.runQuery(
          api.prerequisiteChecker.getQualifiedPrograms,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { studentId: studentId as any }
        );

        const formatPrograms = (programs: Array<{ name: string; institution: string }>) => {
          return programs
            .slice(0, 3)
            .map((p) => `- ${p.name} (${p.institution})`)
            .join("\n");
        };

        let response = "";

        if (eligibility.qualified.length > 0) {
          response += `✅ Qualified Programs (${eligibility.qualified.length}):\n`;
          response += formatPrograms(eligibility.qualified);
          response += "\n\n";
        }

        if (eligibility.upgradeNeeded.length > 0) {
          response += `⚠️ Could Qualify With Upgrades (${eligibility.upgradeNeeded.length}):\n`;
          response += formatPrograms(eligibility.upgradeNeeded);
          response += "\n\n";
        }

        if (eligibility.notEligible.length > 0) {
          response += `❌ Not Currently Eligible (${eligibility.notEligible.length}) - consider other options`;
        }

        return (
          response ||
          "Unable to determine eligibility. Please ensure your student profile is complete."
        );
      } catch {
        return "Unable to check eligibility. Please provide a valid student ID or create a profile first.";
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getStudentProfileTool: any = createTool({
    description:
      "Get the current student's profile information including their career goals, interests, education level, and other preferences. Use this to understand the student's background before making recommendations.",
    args: z.object({
      studentId: z.string().describe("The student's ID from the conversation context"),
    }),
    handler: async (ctx, { studentId }): Promise<string> => {
      try {
        const student = await ctx.runQuery(api.students.getProfile, {
          studentId: studentId as Id<"students">,
        });

        if (!student) {
          return "No student profile found. The student may need to create a profile first.";
        }

        const profile: string = [
          `Name: ${student.name}`,
          `Career Goal: ${student.careerGoal}`,
          `Interests: ${student.interests.join(", ")}`,
          `Current Education: ${student.currentEducation}`,
          `Math Score: ${student.mathScore}`,
        ]
          .filter(Boolean)
          .join("\n");

        return `Student Profile:\n${profile}\n\nUse this information to provide personalized recommendations without asking the student to repeat details they've already provided.`;
      } catch {
        return "Unable to retrieve student profile. Please ensure the student ID is valid.";
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getProgramDetailsTool: any = createTool({
    description:
      "Get detailed information about a specific program including tuition, delivery modes, career outcomes, and more.",
    args: z.object({
      programId: z.string().describe("The ID of the program to get details for"),
    }),
    handler: async (ctx, { programId }): Promise<string> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const programs: any = await ctx.runQuery(api.queries.getProgramsByIds, {
          programIds: [programId],
        });

        if (!programs || programs.length === 0) {
          return `Program with ID ${programId} not found.`;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const program: any = programs[0];

        const details = [
          `**${program.name}**`,
          `Institution: ${program.institution}`,
          `Credential: ${program.credentials}`,
          `Duration: ${program.duration || "Not specified"}`,
          `Delivery Mode: ${program.additionalInfo?.deliveryMode || "Not specified"}`,
          `Tuition (Domestic): ${program.tuition?.domestic || "Not specified"}`,
          `Tuition (International): ${program.tuition?.international || "Not specified"}`,
          `Career Paths: ${(program.careerPaths || []).join(", ") || "Not specified"}`,
          `Key Skills: ${(program.skills || []).slice(0, 5).join(", ") || "Not specified"}`,
          program.additionalInfo?.graduateEmploymentRate
            ? `Employment Rate: ${program.additionalInfo.graduateEmploymentRate}%`
            : "",
          program.additionalInfo?.averageStartingSalary
            ? `Average Starting Salary: $${program.additionalInfo.averageStartingSalary}`
            : "",
          program.description
            ? `\nDescription:\n${program.description.substring(0, 300)}...`
            : "",
        ]
          .filter(Boolean)
          .join("\n");

        return details;
      } catch {
        return `Unable to retrieve details for program ${programId}.`;
      }
    },
  });

  return new Agent(components.agent, {
    name: "Post-Secondary Advisor",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    languageModel: openai.chat("gpt-4o-mini") as any,
    instructions: `You are an expert Canadian post-secondary education advisor specializing in helping students find programs that match their goals, interests, and qualifications. You have access to a comprehensive database of programs across Alberta and Canada.

Your role is to:
1. Help students explore post-secondary options based on their career goals and interests
2. Search for relevant programs using the searchPrograms tool
3. Assess eligibility for specific programs using checkEligibility
4. Provide detailed program information to help with decision-making
5. Give honest, personalized guidance based on the student's background and aspirations

CRITICAL: Each user message includes their Student ID in the format "[Student ID: xxx]". When you receive a message, extract this ID and IMMEDIATELY use the getStudentProfile tool with this ID to retrieve their profile information (career goals, interests, education level, etc.). This ensures you don't ask the student to repeat information they've already provided in their profile. Do this before responding to their question.

When making recommendations, consider:
- Career aspirations and long-term goals (from their profile)
- Field of interest or subject preferences (from their interests)
- Preferred location or delivery mode (if mentioned)
- Current education level and qualifications (from their profile)
- Budget constraints (if mentioned by the student)

IMPORTANT: When a student mentions constraints like budget, location, or preferences, ALWAYS acknowledge them in your response before suggesting next steps. For example:
- If they say "my budget is 8k", respond with: "I understand you're looking for programs within an $8,000 budget. Let me help you find affordable options..."
- If they mention other constraints, show that you've heard them and will factor them into your recommendations.

Remember: Every student has different strengths and paths. Be encouraging while being realistic about prerequisites and program requirements.`,
    tools: {
      getStudentProfile: getStudentProfileTool,
      searchPrograms: searchProgramsTool,
      checkEligibility: checkEligibilityTool,
      getProgramDetails: getProgramDetailsTool,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const advisorAgent: any = createAdvisorAgent();

/**
 * Get or create a thread for a student advisor conversation
 */
export const getOrCreateAdvisorThread = action({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, args): Promise<{ threadId: string; message: string }> => {
    const thread = await advisorAgent.createThread(ctx, {
      userId: args.studentId,
    });

    // Fetch student profile to provide context in welcome message
    const student = await ctx.runQuery(api.students.getProfile, {
      studentId: args.studentId as Id<"students">,
    });

    let welcomeMessage = "Hello! I'm your post-secondary education advisor.";
    
    if (student) {
      welcomeMessage = `Hello ${student.name}! I can see from your profile that you're interested in ${student.careerGoal} and have interests in ${student.interests.slice(0, 2).join(" and ")}. I'm here to help you find programs that match your goals. How can I assist you today?`;
    } else {
      welcomeMessage = "Hello! I'm your post-secondary education advisor. I'm here to help you find programs that match your goals and interests. What kind of programs are you interested in exploring?";
    }

    return {
      threadId: String((thread as { threadId?: string; id?: string }).threadId ?? (thread as { id?: string }).id),
      message: welcomeMessage,
    };
  },
});

/**
 * Send a message to the advisor agent and get a response
 */
export const sendAdvisorMessage = action({
  args: {
    threadId: v.string(),
    message: v.string(),
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    // Prepend student ID context to the message so the agent knows which profile to access
    const enrichedPrompt = `[Student ID: ${args.studentId}]\n${args.message}`;
    
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: args.threadId,
      prompt: enrichedPrompt,
    });

    // Use promptMessageId flow to continue a persisted thread safely.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await advisorAgent.generateText(ctx, { threadId: args.threadId }, { promptMessageId: messageId } as any);

    return {
      response: result.text,
      threadId: args.threadId,
    };
  },
});

/**
 * Retrieve structured program cards from the RAG namespace for chat UI rendering.
 */
export const searchProgramCards = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    maxTuition: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ cards: ProgramCard[]; totalMatches: number }> => {
    const rag = initializeRAG();
    const limit = args.limit ?? 6;

    const results = await rag.search(ctx, {
      namespace: "global-programs",
      query: args.query,
      limit,
    });

    const rawResults = results.results ?? [];

    const resolvedProgramIds = rawResults
      .map((r) => {
        const keyCandidate =
          typeof (r as { key?: unknown }).key === "string"
            ? ((r as { key?: string }).key ?? "").trim()
            : "";
        if (
          keyCandidate.length > 0 &&
          keyCandidate !== "undefined" &&
          keyCandidate !== "null"
        ) {
          return keyCandidate;
        }

        const entryCandidate = typeof r.entryId === "string" ? r.entryId.trim() : "";
        if (
          entryCandidate.length > 0 &&
          entryCandidate !== "undefined" &&
          entryCandidate !== "null"
        ) {
          return entryCandidate;
        }

        return "";
      })
      .filter((id) => id.length > 0);

    const programIds = Array.from(new Set(resolvedProgramIds));

    console.log(
      `[searchProgramCards] query='${args.query.slice(0, 80)}' ragResults=${rawResults.length} resolvedIds=${programIds.length}`
    );

    if (programIds.length === 0) {
      return { cards: [], totalMatches: 0 };
    }

    const programs = await ctx.runQuery(api.queries.getProgramsByIds, {
      programIds,
    });

    console.log(
      `[searchProgramCards] dbPrograms=${programs.length} requestedIds=${programIds.length}`
    );

    let resolvedPrograms = programs;
    if (resolvedPrograms.length === 0 && rawResults.length > 0) {
      // Fallback for legacy/mismatched RAG entries: resolve by program name found in chunk text.
      const extractedNames = rawResults
        .map((r) => {
          const combinedText = (r.content ?? [])
            .map((c) => {
              if (typeof c === "string") return c;
              if (c && typeof c === "object" && "text" in c) {
                const maybeText = (c as { text?: unknown }).text;
                return typeof maybeText === "string" ? maybeText : "";
              }
              return "";
            })
            .join("\n");
          const match = combinedText.match(/(?:^|\n)Program:\s*(.+?)(?:\n|$)/i);
          return match?.[1]?.trim() ?? "";
        })
        .filter((name) => name.length > 0);

      if (extractedNames.length > 0) {
        const allPrograms = await ctx.runQuery(api.queries.getAllPrograms);
        const nameSet = new Set(extractedNames.map((n) => n.toLowerCase()));
        resolvedPrograms = allPrograms.filter((p) => nameSet.has(p.name.toLowerCase()));

        console.log(
          `[searchProgramCards] fallbackByName extractedNames=${extractedNames.length} fallbackPrograms=${resolvedPrograms.length}`
        );
      }
    }

    if (resolvedPrograms.length === 0) {
      // Final fallback: token-match query terms against all programs.
      const allPrograms = await ctx.runQuery(api.queries.getAllPrograms);
      const queryTokens = args.query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(
          (t) =>
            t.length >= 3 &&
            ![
              "career",
              "goal",
              "interests",
              "education",
              "maximum",
              "tuition",
              "budget",
              "only",
              "with",
              "from",
              "your",
              "profile",
            ].includes(t)
        );

      const scored = allPrograms
        .map((p) => {
          const haystack = `${p.name} ${p.institution} ${p.credentials} ${p.description ?? ""}`.toLowerCase();
          let score = 0;
          for (const token of queryTokens) {
            if (haystack.includes(token)) score += 1;
          }
          return { program: p, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.program);

      resolvedPrograms = scored.length > 0 ? scored : allPrograms;
      console.log(
        `[searchProgramCards] fallbackByTokens queryTokens=${queryTokens.length} fallbackPrograms=${resolvedPrograms.length}`
      );
    }

    // Filter by budget if maxTuition is provided
    if (args.maxTuition !== undefined && args.maxTuition > 0) {
      const beforeFiltering = resolvedPrograms.length;
      resolvedPrograms = resolvedPrograms.filter((program) => {
        // Try domesticTuitionValue first (numeric field)
        if (program.domesticTuitionValue !== undefined) {
          return program.domesticTuitionValue <= args.maxTuition!;
        }
        
        // Try parsing tuition.domestic if it's a number or string
        if (typeof program.tuition?.domestic === "number") {
          return program.tuition.domestic <= args.maxTuition!;
        }
        
        if (typeof program.tuition?.domestic === "string") {
          // Try to extract numeric value from string like "$8,000" or "8000"
          const tuitionStr = program.tuition.domestic.replace(/[$,]/g, "");
          const tuitionNum = parseFloat(tuitionStr);
          if (!isNaN(tuitionNum)) {
            return tuitionNum <= args.maxTuition!;
          }
        }
        
        // If we can't determine tuition, include it
        return true;
      });
      
      console.log(
        `[searchProgramCards] budgetFilter maxTuition=${args.maxTuition} before=${beforeFiltering} after=${resolvedPrograms.length}`
      );
    }

    const byId = new Map(resolvedPrograms.map((p) => [p.id, p]));
    const cards: ProgramCard[] = [];

    for (const id of programIds) {
      const program = byId.get(id);
      if (!program) continue;

      cards.push({
        id: program.id,
        name: program.name,
        institution: program.institution,
        credentials: program.credentials,
        duration: program.duration,
        tuition: String(program.tuition?.domestic ?? "N/A"),
        description: (program.description ?? "").slice(0, 180),
        deliveryMode: program.additionalInfo?.deliveryMode ?? "unknown",
      });
    }

    if (cards.length === 0 && resolvedPrograms.length > 0) {
      for (const program of resolvedPrograms.slice(0, limit)) {
        cards.push({
          id: program.id,
          name: program.name,
          institution: program.institution,
          credentials: program.credentials,
          duration: program.duration,
          tuition: String(program.tuition?.domestic ?? "N/A"),
          description: (program.description ?? "").slice(0, 180),
          deliveryMode: program.additionalInfo?.deliveryMode ?? "unknown",
        });
      }
    }

    return {
      cards,
      totalMatches: rawResults.length || cards.length,
    };
  },
});
