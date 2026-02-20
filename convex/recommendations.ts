// convex/recommendations.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

interface StudentProfile {
  name: string;
  currentEducation: string;
  careerGoal: string;
  interests: string[];
  mathScore: number;
}

interface Recommendation {
  programId: string;
  programName: string;
  institution: string;
  matchScore: number;
  reasoning: string;
  prerequisites: string[];
  careerAlignment: string;
}

interface RecommendationResponse {
  recommendations: Recommendation[];
}

// AI-powered program recommendations
export const getRecommendations = action({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args): Promise<{
    student: StudentProfile;
    recommendations: Recommendation[];
    timestamp: number;
  }> => {
    console.log("=== STARTING RECOMMENDATIONS ===");
    
    // Check API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log("API Key exists:", !!apiKey);
    
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set in Convex environment variables");
    }

    // 1. Get student profile
    console.log("Fetching student profile...");
    const student = await ctx.runQuery(api.students.getProfile, {
      studentId: args.studentId,
    });

    if (!student) {
      throw new Error("Student not found");
    }

    console.log("Student:", student.name);

    // 2. Get ALL programs (not just samples!)
    console.log("Fetching ALL programs...");
    const allPrograms: Doc<"programs">[] = await ctx.runQuery(api.queries.getAllPrograms);
    console.log("Programs loaded:", allPrograms.length);

    // Format programs for AI - include key details
    const programsForAI = allPrograms.map((p: Doc<"programs">) => ({
      id: p.id,
      name: p.name,
      institution: p.institution,
      credentials: p.credentials,
      duration: p.duration,
      description: p.description,
      careerPaths: p.careerPaths,
      skills: p.skills,
      tuitionDomestic: typeof p.tuition.domestic === 'number' 
        ? `$${p.tuition.domestic}` 
        : p.tuition.domestic,
      prerequisites: p.prerequisites,
      employmentRate: p.additionalInfo?.graduateEmploymentRate || null,
      startingSalary: p.additionalInfo?.averageStartingSalary || null,
      deliveryMode: p.additionalInfo?.deliveryMode || null,
    }));

    // 3. Call Claude API
    console.log("Calling Claude API with", programsForAI.length, "programs...");
    
    const requestBody = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `You are an expert Alberta post-secondary education advisor. Analyze this student profile and recommend the top 10 best-fit programs from ALL ${programsForAI.length} available options.

STUDENT PROFILE:
- Name: ${student.name}
- Current Education: ${student.currentEducation}
- Career Goal: ${student.careerGoal}
- Interests: ${student.interests.join(", ")}
- Math Score: ${student.mathScore}%

AVAILABLE PROGRAMS (${programsForAI.length} total):
${JSON.stringify(programsForAI, null, 2)}

ANALYSIS CRITERIA:
1. Career Goal Alignment - Does this program lead to their stated career goal?
2. Interest Match - Do the program's focus areas align with their interests?
3. Prerequisites Feasibility - Can they realistically meet the requirements based on their current education and math score?
4. Employment Outcomes - What are the job prospects and starting salaries?
5. Program Quality - Consider delivery mode, institution reputation, and program structure

RESPONSE FORMAT (JSON only, no other text):
{
  "recommendations": [
    {
      "programId": "exact-program-id-from-list",
      "programName": "Exact Program Name",
      "institution": "Institution Name",
      "matchScore": 95,
      "reasoning": "2-3 sentences explaining why this is an excellent fit. Be specific about career alignment and interest match.",
      "prerequisites": ["Specific prerequisite 1", "Specific prerequisite 2", "Specific prerequisite 3"],
      "careerAlignment": "1-2 sentences explaining how this program directly leads to their career goal. Include job titles and salary info if available."
    }
  ]
}

IMPORTANT:
- Return exactly 10 recommendations
- Sort by match score (highest first)
- Be specific and detailed in reasoning
- Use actual data from the programs (tuition, employment rates, salaries)
- Match based on ALL criteria, not just keywords
- Return ONLY valid JSON, no markdown formatting`,
        },
      ],
    };

    let response;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Failed to fetch from Anthropic API: ${fetchError}`);
    }

    console.log("Response status:", response.status);

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`API request failed (${response.status}): ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      throw new Error(`Failed to parse API response: ${parseError}`);
    }

    // Check if response has expected structure
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error("Invalid response structure. Full data:", data);
      throw new Error(`Invalid API response structure. Got: ${JSON.stringify(data)}`);
    }

    // Parse Claude's response
    const content = data.content[0].text;
    
    if (!content) {
      throw new Error("No content in API response");
    }

    console.log("Claude response received, parsing...");
    
    // Extract JSON from response (Claude might include ```json wrapper)
    let jsonStr = content;
    if (content.includes("```json")) {
      jsonStr = content.split("```json")[1].split("```")[0].trim();
    } else if (content.includes("```")) {
      jsonStr = content.split("```")[1].split("```")[0].trim();
    }

    let recommendations: RecommendationResponse;
    try {
      recommendations = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      console.error("Content was:", jsonStr);
      throw new Error(`Failed to parse recommendations JSON: ${parseError}`);
    }

    if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
      throw new Error(`Invalid recommendations structure. Got: ${JSON.stringify(recommendations)}`);
    }

    console.log("Successfully got", recommendations.recommendations.length, "recommendations");

    return {
      student: {
        name: student.name,
        currentEducation: student.currentEducation,
        careerGoal: student.careerGoal,
        interests: student.interests,
        mathScore: student.mathScore,
      },
      recommendations: recommendations.recommendations,
      timestamp: Date.now(),
    };
  },
});