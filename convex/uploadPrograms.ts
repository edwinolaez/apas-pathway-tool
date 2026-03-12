// convex/uploadPrograms.ts
// Mutation to upload programs one by one

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addProgram = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    institution: v.string(),
    institutionId: v.string(),
    description: v.string(),
    credentials: v.string(),
    duration: v.string(),
    url: v.string(),
    tuition: v.any(),
    tuitionNote: v.optional(v.string()), // ✅ ADDED - for UofL programs
    prerequisites: v.any(),
    careerPaths: v.array(v.string()),
    skills: v.array(v.string()),
    nocCodes: v.array(v.string()),
    additionalInfo: v.any(),
  },
  handler: async (ctx, args) => {
    // Check if exists
    const existing = await ctx.db
      .query("programs")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (existing) {
      return { success: false, message: "exists" };
    }

    await ctx.db.insert("programs", args);
    return { success: true };
  },
});