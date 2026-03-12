import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Helper: Filter programs by education level
function filterByEducationLevel(programs: any[], currentEducation: string) {
  const educationLower = currentEducation.toLowerCase();
  
  // High school students - show entry-level programs
  if (educationLower.includes('high school') || educationLower.includes('grade 12')) {
    return programs.filter(p => 
      p.credentials.toLowerCase().includes('diploma') ||
      p.credentials.toLowerCase().includes('certificate') ||
      p.credentials.toLowerCase().includes('associate')
    );
  }
  
  // College/Diploma students - show diploma and bachelor programs
  if (educationLower.includes('college') || 
      educationLower.includes('diploma') ||
      educationLower.includes('certificate')) {
    return programs.filter(p => 
      p.credentials.toLowerCase().includes('diploma') ||
      p.credentials.toLowerCase().includes('bachelor') ||
      p.credentials.toLowerCase().includes('degree')
    );
  }
  
  // University/Degree students - show bachelor and advanced programs
  if (educationLower.includes('bachelor') || 
      educationLower.includes('university') ||
      educationLower.includes('degree')) {
    return programs.filter(p => 
      p.credentials.toLowerCase().includes('bachelor') ||
      p.credentials.toLowerCase().includes('master') ||
      p.credentials.toLowerCase().includes('phd') ||
      p.credentials.toLowerCase().includes('doctor')
    );
  }
  
  // Default: return all if no match
  return programs;
}

// Internal query to get student
export const getStudent = internalQuery({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.studentId);
  },
});

// Internal query to get all programs
export const getAllPrograms = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("programs").collect();
  },
});

export const getRecommendations = action({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    console.log("=== STARTING RECOMMENDATIONS ===");

    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log("API Key exists:", !!apiKey);

    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    // Get student profile
    console.log("Fetching student profile...");
    const student = await ctx.runQuery(internal.recommendations.getStudent, {
      studentId: args.studentId,
    });

    if (!student) {
      throw new Error("Student not found");
    }

    console.log("Student:", student.name);

    // Get all programs
    console.log("Fetching ALL programs...");
    const allPrograms = await ctx.runQuery(internal.recommendations.getAllPrograms);
    console.log("Programs loaded:", allPrograms.length);

    // PRE-FILTER by education level for speed
    const filteredPrograms = filterByEducationLevel(allPrograms, student.currentEducation);
    console.log(`🚀 Speed Optimization: Filtered from ${allPrograms.length} to ${filteredPrograms.length} programs`);

    // Format filtered programs for Claude
    const programsText = filteredPrograms
      .map(
        (p, i) => `
${i + 1}. ${p.name} at ${p.institution}
   Program ID: ${p.id}
   Credentials: ${p.credentials}
   Duration: ${p.duration}
   Description: ${p.description}
   Prerequisites: ${JSON.stringify(p.prerequisites)}
   Career Paths: ${p.careerPaths.join(", ")}
   Skills: ${p.skills.join(", ")}
    `
      )
      .join("\n\n");

    // Create prompt
    const prompt = `You are an expert educational advisor for Alberta, Canada post-secondary programs.

Student Profile:
- Name: ${student.name}
- Current Education: ${student.currentEducation}
- Career Goal: ${student.careerGoal}
- Interests: ${Array.isArray(student.interests) ? student.interests.join(", ") : student.interests}
- Math Score: ${student.mathScore}%

Available Programs (pre-filtered by education level):
${programsText}

Task: Recommend the TOP 10 programs that best match this student's profile. Consider:
1. How well the program aligns with their career goal
2. Whether they meet the prerequisites (especially math requirements)
3. How the program matches their interests
4. Career outcomes and job prospects
5. The student's current education level (recommend appropriate next steps)

CRITICAL: You MUST use the exact "Program ID" values from the list above in your programId fields.

Provide your response in this EXACT JSON format (no markdown, no backticks, just pure JSON):
{
  "recommendations": [
    {
      "programId": "exact Program ID from the list above",
      "programName": "exact program name",
      "institution": "exact institution name",
      "matchScore": 95,
      "reasoning": "Detailed explanation of why this is a great match for this specific student",
      "careerAlignment": "How this program leads directly to their career goal of ${student.careerGoal}",
      "prerequisites": ["Specific prerequisite 1", "Specific prerequisite 2"],
      "prerequisiteMatch": "Assessment of whether student meets requirements based on their ${student.mathScore}% math score"
    }
  ],
  "summary": "Overall summary of recommendations and suggested next steps for ${student.name}"
}

Return ONLY valid JSON, nothing else. No markdown formatting, no code blocks, just the JSON object.`;

    console.log(`Calling Claude API with ${filteredPrograms.length} programs...`);

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Claude response received, parsing...");

    // Extract text content
    const responseText =
      data.content[0].type === "text" ? data.content[0].text : "";

    // Parse JSON response
    let recommendations;
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      recommendations = JSON.parse(cleanedText);
      console.log(
        "Successfully got",
        recommendations.recommendations.length,
        "recommendations"
      );
    } catch (parseError) {
      console.error("Failed to parse response:", responseText);
      throw new Error("Invalid JSON response from Claude");
    }

    return recommendations;
  },
});