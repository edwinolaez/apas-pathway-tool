// convex/students.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new student profile (legacy, kept for compatibility)
export const createStudent = mutation({
  args: {
    clerkId: v.optional(v.string()),
    name: v.string(),
    currentEducation: v.string(),
    careerGoal: v.string(),
    interests: v.array(v.string()),
    mathScore: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate that all required fields are present
    if (!args.name || !args.currentEducation || !args.careerGoal || args.interests.length === 0) {
      throw new Error("Missing required fields");
    }

    const studentId = await ctx.db.insert("students", {
      clerkId: args.clerkId,
      name: args.name,
      currentEducation: args.currentEducation,
      careerGoal: args.careerGoal,
      interests: args.interests,
      mathScore: args.mathScore,
    });
    
    return studentId;
  },
});

// Upsert profile for a signed-in Clerk user (one profile per user)
export const upsertStudentByClerkId = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    currentEducation: v.string(),
    careerGoal: v.string(),
    interests: v.array(v.string()),
    mathScore: v.number(),
  },
  handler: async (ctx, args) => {
    if (!args.name || !args.currentEducation || !args.careerGoal || args.interests.length === 0) {
      throw new Error("Missing required fields");
    }

    const existing = await ctx.db
      .query("students")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const payload = {
      clerkId: args.clerkId,
      name: args.name,
      currentEducation: args.currentEducation,
      careerGoal: args.careerGoal,
      interests: args.interests,
      mathScore: args.mathScore,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("students", payload);
  },
});

// Get a student profile by ID
export const getProfile = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.studentId);
  },
});

// Get current user's student profile by Clerk ID
export const getStudentByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("students")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Get all student profiles (for testing)
export const getAllProfiles = query({
  handler: async (ctx) => {
    return await ctx.db.query("students").collect();
  },
});