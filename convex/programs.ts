import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const uploadPrograms = mutation({
  args: {
    programs: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    for (const program of args.programs) {
      await ctx.db.insert("programs", program);
    }
    console.log(`✅ Successfully uploaded ${args.programs.length} programs!`);
  },
});
// ADD THIS: The 'read' function for your test page
export const getAllPrograms = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("programs").collect();
  },
});    