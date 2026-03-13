import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Generate embedding for a single program
export const generateProgramEmbedding = action({
  args: { programId: v.id("programs") },
  handler: async (ctx, args): Promise<any> => {
    const program: any = await ctx.runQuery(internal.embeddings.getProgram, {
      programId: args.programId,
    });

    if (!program) {
      throw new Error("Program not found");
    }

    // Create rich text representation for embedding
    const text = `
Program: ${program.name}
Institution: ${program.institution}
Credentials: ${program.credentials}
Description: ${program.description}
Duration: ${program.duration}
Skills: ${program.skills.join(", ")}
Career Paths: ${program.careerPaths.join(", ")}
    `.trim();

    // Call OpenAI API
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not set in environment variables");
    }

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;

    // Store embedding
    await ctx.runMutation(internal.embeddings.updateProgramEmbedding, {
      programId: args.programId,
      embedding,
    });

    return { success: true, programName: program.name };
  },
}) as any;

// Internal query to get program
export const getProgram = internalQuery({
  args: { programId: v.id("programs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.programId);
  },
});

// Internal mutation to update embedding
export const updateProgramEmbedding = internalMutation({
  args: {
    programId: v.id("programs"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.programId, {
      embedding: args.embedding,
    });
  },
});

// Generate embeddings for ALL programs (run once)
export const generateAllEmbeddings = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    const programs: any = await ctx.runQuery(internal.embeddings.getAllPrograms);
    
    console.log(`Generating embeddings for ${programs.length} programs...`);
    
    let success = 0;
    let failed = 0;

    for (const programItem of programs) {
      try {
        // Get full program details
        const programData: any = await ctx.runQuery(internal.embeddings.getProgram, {
          programId: programItem._id,
        });

        if (!programData) {
          throw new Error("Program not found");
        }

        // Create rich text representation for embedding
        const text = `
Program: ${programData.name}
Institution: ${programData.institution}
Credentials: ${programData.credentials}
Description: ${programData.description}
Duration: ${programData.duration}
Skills: ${programData.skills.join(", ")}
Career Paths: ${programData.careerPaths.join(", ")}
        `.trim();

        // Call OpenAI API
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error("OPENAI_API_KEY not set in environment variables");
        }

        const response = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "text-embedding-ada-002",
            input: text,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const embedding = data.data[0].embedding;

        // Store embedding
        await ctx.runMutation(internal.embeddings.updateProgramEmbedding, {
          programId: programItem._id,
          embedding,
        });

        success++;
        console.log(`✓ [${success}/${programs.length}] ${programData.name}`);
        
        // Rate limiting: wait 2 seconds between requests (for free tier)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        failed++;
        console.error(`✗ Failed: ${programItem.name}`, error);
      }
    }

    return {
      total: programs.length,
      success,
      failed,
    };
  },
}) as any;

// Internal query to get all programs
export const getAllPrograms = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("programs").collect();
  },
});