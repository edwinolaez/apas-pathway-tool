// convex/queries.ts
// Basic queries to verify your data is working

import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all programs (returns full list for AI recommendations)
export const getAllPrograms = query({
  handler: async (ctx) => {
    const programs = await ctx.db.query("programs").collect();
    return programs; // Return all programs directly
  },
});

// Get programs summary (for testing/stats)
export const getProgramsSummary = query({
  handler: async (ctx) => {
    const programs = await ctx.db.query("programs").collect();
    return {
      total: programs.length,
      institutions: [...new Set(programs.map(p => p.institution))],
      credentials: [...new Set(programs.map(p => p.credentials))],
      samplePrograms: programs.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        institution: p.institution,
        credentials: p.credentials,
        duration: p.duration,
      })),
    };
  },
});

// Get programs by institution
export const getProgramsByInstitution = query({
  args: { institutionId: v.string() },
  handler: async (ctx, args) => {
    const programs = await ctx.db
      .query("programs")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();
    
    return programs;
  },
});

// Get programs by credential type
export const getProgramsByCredential = query({
  args: { credential: v.string() },
  handler: async (ctx, args) => {
    const programs = await ctx.db
      .query("programs")
      .withIndex("by_credentials", (q) => q.eq("credentials", args.credential))
      .collect();
    
    return programs;
  },
});

// Search programs by name
export const searchProgramsByName = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allPrograms = await ctx.db.query("programs").collect();
    
    // Simple text search (we'll improve this with vector search later)
    const results = allPrograms.filter(p => 
      p.name.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(args.searchTerm.toLowerCase())
    );
    
    return results.slice(0, 10); // Return top 10 matches
  },
});

// Get program by ID
export const getProgramById = query({
  args: { programId: v.string() },
  handler: async (ctx, args) => {
    const programs = await ctx.db.query("programs").collect();
    return programs.find(p => p.id === args.programId);
  },
});

// Get statistics
export const getStatistics = query({
  handler: async (ctx) => {
    const programs = await ctx.db.query("programs").collect();
    
    // Count by institution
    const byInstitution: Record<string, number> = {};
    programs.forEach(p => {
      byInstitution[p.institution] = (byInstitution[p.institution] || 0) + 1;
    });
    
    // Count by credential
    const byCredential: Record<string, number> = {};
    programs.forEach(p => {
      byCredential[p.credentials] = (byCredential[p.credentials] || 0) + 1;
    });
    
    return {
      totalPrograms: programs.length,
      byInstitution,
      byCredential,
      averageTuitionDomestic: programs
        .filter(p => typeof p.tuition.domestic === 'number')
        .reduce((sum, p) => sum + (p.tuition.domestic as number), 0) / 
        programs.filter(p => typeof p.tuition.domestic === 'number').length,
    };
  },
});