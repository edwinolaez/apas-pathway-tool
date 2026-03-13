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

// Create or update student profile (for profile page)
export const createOrUpdateStudent = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    educationLevel: v.string(),
    currentGrade: v.string(),
    mathScore: v.string(),
    careerGoals: v.string(),
    interests: v.string(),
    workExperience: v.string(),
    preferredLocation: v.string(),
    studyMode: v.string(),
    financialAid: v.string(),
  },
  handler: async (ctx, args) => {
    // Parse interests from comma-separated string to array
    const interestsArray = args.interests
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);
    
    // Parse math score to number (default to 0 if not provided)
    const mathScoreNum = args.mathScore ? parseInt(args.mathScore.replace(/[^0-9]/g, '')) || 0 : 0;
    
    const studentId = await ctx.db.insert("students", {
      name: args.name,
      email: args.email,
      currentEducation: args.educationLevel,
      careerGoal: args.careerGoals,
      interests: interestsArray.length > 0 ? interestsArray : [args.interests],
      mathScore: mathScoreNum,
      currentGrade: args.currentGrade,
      workExperience: args.workExperience,
      preferredLocation: args.preferredLocation,
      studyMode: args.studyMode,
      financialAid: args.financialAid,
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