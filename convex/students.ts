// convex/students.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new student profile
export const createStudent = mutation({
  args: {
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
      name: args.name,
      currentEducation: args.currentEducation,
      careerGoal: args.careerGoal,
      interests: args.interests,
      mathScore: args.mathScore,
    });
    
    return studentId;
  },
});

// Get a student profile by ID
export const getProfile = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.studentId);
  },
});

// Get all student profiles (for testing)
export const getAllProfiles = query({
  handler: async (ctx) => {
    return await ctx.db.query("students").collect();
  },
});