// convex/uploadInstitutions.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upload institutions data
export const seedInstitutions = mutation({
  args: {
    institutions: v.array(v.object({
      name: v.string(),
      slug: v.string(),
      type: v.string(),
      location: v.string(),
      website: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Clear existing institutions (optional - only for fresh start)
    const existing = await ctx.db.query("institutions").collect();
    for (const institution of existing) {
      await ctx.db.delete(institution._id);
    }

    // Insert new institutions
    const inserted = [];
    for (const institution of args.institutions) {
      const id = await ctx.db.insert("institutions", institution);
      inserted.push({ id, ...institution });
    }

    return { 
      count: inserted.length,
      institutions: inserted 
    };
  },
});

// Get all institutions
export const getAllInstitutions = query({
  handler: async (ctx) => {
    return await ctx.db.query("institutions").collect();
  },
});

// Get institution by slug
export const getInstitutionBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("institutions")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});