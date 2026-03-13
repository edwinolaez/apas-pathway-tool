import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Perform semantic search for programs based on student profile
export const semanticProgramSearch = action({
  args: {
    currentEducation: v.string(),
    careerGoal: v.string(),
    interests: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any[]> => {
    // Create search query from student profile
    const searchQuery = `
Education: ${args.currentEducation}
Career Goal: ${args.careerGoal}
Interests: ${args.interests}
    `.trim();

    // Generate embedding for search query
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not set");
    }

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: searchQuery,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const queryEmbedding = data.data[0].embedding;

    // Perform vector search
    const results = await ctx.vectorSearch("programs", "by_embedding", {
      vector: queryEmbedding,
      limit: args.limit || 20,
    });

    // Get full program details
    const programs = await Promise.all(
      results.map(async (result): Promise<any> => {
        const program = await ctx.runMutation(internal.search.getProgramInternal, {
          programId: result._id,
        });
        return {
          ...program,
          score: result._score,
        };
      })
    );

    return programs;
  },
});

// Internal mutation to fetch program
export const getProgramInternal = internalMutation({
  args: { programId: v.id("programs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.programId);
  },
});