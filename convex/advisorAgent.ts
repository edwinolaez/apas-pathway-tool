import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, components } from "./_generated/api";
import { Agent, createTool } from "@convex-dev/agent";
import { z } from "zod";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";

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
export const createAdvisorAgent = (): any => {
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
    languageModel: openai.chat("gpt-4o") as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    textEmbeddingModel: openai.embedding("text-embedding-3-small") as any,
    instructions: `You are an expert Canadian post-secondary education advisor specializing in helping students find programs that match their goals, interests, and qualifications. You have access to a comprehensive database of programs across Alberta and Canada.

Your role is to:
1. Help students explore post-secondary options based on their career goals and interests
2. Search for relevant programs using the searchPrograms tool
3. Assess eligibility for specific programs using checkEligibility
4. Provide detailed program information to help with decision-making
5. Give honest, personalized guidance based on the student's background and aspirations

Always provide context and explanation for your recommendations. When searching for programs, try to understand the student's:
- Career aspirations and long-term goals
- Field of interest or subject preferences
- Preferred location or delivery mode (online, hybrid, on-campus)
- Current education level and qualifications
- Budget constraints (if mentioned)

Remember: Every student has different strengths and paths. Be encouraging while being realistic about prerequisites and program requirements.`,
    tools: {
      searchPrograms: searchProgramsTool,
      checkEligibility: checkEligibilityTool,
      getProgramDetails: getProgramDetailsTool,
    },
  });
};

/**
 * Get or create a thread for a student advisor conversation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getOrCreateAdvisorThread: any = action({
  args: {
    studentId: v.string(),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx, args): Promise<{ threadId: any; message: string }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agent: any = createAdvisorAgent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thread: any = await agent.createThread(ctx, {
      userId: args.studentId,
    });

    return {
      threadId: thread.id,
      message:
        "Hello! I'm your post-secondary education advisor. I'm here to help you find programs that match your goals and interests. What kind of programs are you interested in exploring?",
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
    const agent = createAdvisorAgent();

    // Get existing thread
    const thread = await agent.getThread(ctx, { id: args.threadId });

    if (!thread) {
      throw new Error("Thread not found");
    }

    // Generate response with streaming
    const result = await thread.generateText(ctx, {
      prompt: args.message,
      streaming: false, // For server-side actions, we collect the full response
    });

    return {
      response: result.text,
      threadId: args.threadId,
    };
  },
});
