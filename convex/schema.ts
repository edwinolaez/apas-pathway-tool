import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Institutions table
  institutions: defineTable({
    name: v.string(),
    slug: v.string(),
    type: v.string(), // "university", "polytechnic", "college"
    location: v.string(),
    website: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  // Programs table
  programs: defineTable({
    // Required Basic Info
    id: v.string(),
    name: v.string(),
    institution: v.string(),
    institutionId: v.string(),
    description: v.string(),
    credentials: v.string(),
    duration: v.string(),
    isIngested: v.optional(v.boolean()),
    ingestedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    contentHash: v.optional(v.string()),

    // Normalized metadata for semantic filters
    credentialNormalized: v.optional(v.string()),
    durationMonths: v.optional(v.number()),
    durationBucket: v.optional(v.string()),
    deliveryModes: v.optional(v.array(v.string())),
    startTerms: v.optional(v.array(v.string())),
    coopAvailable: v.optional(v.boolean()),
    domesticTuitionValue: v.optional(v.number()),
    internationalTuitionValue: v.optional(v.number()),
    domesticTuitionBand: v.optional(v.string()),
    internationalTuitionBand: v.optional(v.string()),
    namespaceTags: v.optional(v.array(v.string())),
    
    // Tuition (can have 2 or 3 fields)
    tuition: v.object({
      domestic: v.union(v.number(), v.string(), v.null()),
      international: v.union(v.number(), v.string(), v.null()),
      note: v.optional(v.string()),
    }),
    
    // Prerequisites (VERY flexible - different institutions have different formats)
    prerequisites: v.union(
      v.object({
        // Standard format (most common)
        domestic: v.optional(v.array(v.string())),
        international: v.optional(v.array(v.string())),
        note: v.optional(v.string()),
        
        // Alternative pathways (SAIT/NAIT style)
        alternativePathways: v.optional(v.array(v.string())),
        
        // Competitive admission (Lethbridge style - note the typo in your data!)
        competetiveAverage: v.optional(v.string()), // Your data has this typo
        competitiveAverage: v.optional(v.string()),  // Correct spelling
        countryEquivalents: v.optional(v.array(v.any())),
        
        // U of A engineering style
        directEntry: v.optional(v.any()),
        qualifyingYear: v.optional(v.any()),
        transferStudents: v.optional(v.any()),
        
        // U of C style (different structure)
        highSchool: v.optional(v.array(v.string())),
        postSecondary: v.optional(v.array(v.string())),
      }),
      // Fallback for any other structure
      v.any()
    ),
    
    // URLs and Career Info
    url: v.string(),
    careerPaths: v.array(v.string()),
    skills: v.array(v.string()),
    nocCodes: v.optional(v.array(v.string())),
    
    // Optional fields (specific to certain institutions)
    route: v.optional(v.string()), // U of C entry routes
    admissionLogic: v.optional(v.string()), // U of C lottery system
    
    // Additional Info (very flexible structure)
    additionalInfo: v.optional(v.object({
      // Common fields
      startDates: v.optional(v.array(v.string())),
      deliveryMode: v.optional(v.string()),
      applicationDeadline: v.optional(v.string()),
      coopAvailable: v.optional(v.boolean()),
      
      // Employment/Salary data
      graduateEmploymentRate: v.optional(v.union(v.string(), v.number())),
      averageStartingSalary: v.optional(v.union(v.number(), v.string())),
      
      // Program details
      programCredits: v.optional(v.string()),
      specialNotes: v.optional(v.string()),
      
      // Certifications and accreditation
      internshipRequired: v.optional(v.boolean()),
      professionalDesignation: v.optional(v.string()),
      professionalDesignations: v.optional(v.union(v.array(v.string()), v.string())),
      professionalCredit: v.optional(v.string()),
      accreditation: v.optional(v.string()),
      cpaCertification: v.optional(v.string()),
      industryCertifications: v.optional(v.array(v.string())),
      
      // Program structure
      minorsAvailable: v.optional(v.array(v.string())),
      specializations: v.optional(v.array(v.string())),
      
      // Flexibility
      flexibleScheduling: v.optional(v.boolean()),
      flexibleCompletion: v.optional(v.string()),
      
      // Duration and pathways
      totalProgramLength: v.optional(v.string()),
      pathwayPrograms: v.optional(v.string()),
      
      // Practical experience
      practicum: v.optional(v.string()),
      coopNote: v.optional(v.string()),
      examPreparation: v.optional(v.string()),
      
      // Transfer credits
      transferCreditsAvailable: v.optional(v.boolean()),
      transferNote: v.optional(v.string()),
      
      // Other
      techRequirement: v.optional(v.string()),
    })),
  })
    .index("by_programId", ["id"])
    .index("by_institution", ["institutionId"])
    .index("by_credentials", ["credentials"])
    .index("by_ingested", ["isIngested"])
    .index("by_credential_normalized", ["credentialNormalized"])
    .index("by_duration_bucket", ["durationBucket"])
    .searchIndex("search_programs", {
      searchField: "name",
      filterFields: ["institutionId", "credentials"],
    }),

  // Occupations table (for NOC data integration)
  occupations: defineTable({
    nocCode: v.string(),
    title: v.string(),
    medianSalary: v.optional(v.number()),
    salaryRange: v.optional(v.object({
      low: v.number(),
      high: v.number(),
    })),
    outlook: v.optional(v.string()),
    demandTrend: v.optional(v.string()),
    province: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
  }).index("by_noc", ["nocCode"]),

  students: defineTable({
    clerkId: v.optional(v.string()),
    name: v.string(),
    currentEducation: v.string(),
    careerGoal: v.string(),
    interests: v.array(v.string()), // This can hold "Emerging Tech", "Anime", etc.
    mathScore: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  // Users table (synced from Clerk)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastSeen: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
});