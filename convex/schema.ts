import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  students: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    currentEducation: v.string(),
    currentGrade: v.optional(v.string()),
    mathScore: v.optional(v.union(v.string(), v.number())),
    careerGoal: v.string(),
    interests: v.union(v.string(), v.array(v.string())),
    workExperience: v.optional(v.string()),
    preferredLocation: v.optional(v.string()),
    studyMode: v.optional(v.string()),
    financialAid: v.optional(v.string()),
  }),

  programs: defineTable({
    id: v.string(),
    name: v.string(),
    institution: v.string(),
    institutionId: v.string(),
    description: v.string(),
    credentials: v.string(),
    duration: v.string(),
    url: v.string(),
    tuition: v.any(),
    tuitionNote: v.optional(v.string()),
    prerequisites: v.any(),
    careerPaths: v.array(v.string()),
    skills: v.array(v.string()),
    nocCodes: v.array(v.string()),
    additionalInfo: v.any(),
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_institution", ["institutionId"])
    .index("by_program_id", ["id"])
    .index("by_credentials", ["credentials"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["institutionId"],
    }),

  institutions: defineTable({
    id: v.optional(v.string()),
    slug: v.optional(v.string()),
    name: v.string(),
    fullName: v.optional(v.string()),
    type: v.string(),
    location: v.string(),
    website: v.string(),
    description: v.optional(v.string()),
  })
    .index("by_institution_id", ["id"])
    .index("by_slug", ["slug"]),

  recommendations: defineTable({
    studentId: v.id("students"),
    programIds: v.array(v.string()),
    reasoning: v.string(),
    createdAt: v.number(),
  }),

  occupations: defineTable({
    title: v.string(),
    nocCode: v.string(),
    description: v.string(),
    outlook: v.string(),
    medianSalary: v.optional(v.string()),
    requiredEducation: v.string(),
  }),
});