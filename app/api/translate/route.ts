import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export async function POST(req: Request) {
  try {
    const profileData = await req.json();

    // Get all programs
    const allPrograms = await fetchQuery(api.queries.getAllPrograms);

    // PRE-FILTER by education level for speed
    const filteredPrograms = filterByEducationLevel(
      allPrograms,
      profileData.currentEducation
    );

    console.log(`🚀 Speed Optimization: Filtered from ${allPrograms.length} to ${filteredPrograms.length} programs`);

    // Format programs for Claude
    const programsText = filteredPrograms
      .map(
        (p, i) => `
${i + 1}. ${p.name} at ${p.institution}
   Credentials: ${p.credentials}
   Duration: ${p.duration}
   Description: ${p.description}
   Prerequisites: ${JSON.stringify(p.prerequisites)}
   Career Paths: ${p.careerPaths.join(", ")}
   Skills: ${p.skills.join(", ")}
   URL: ${p.url}
    `
      )
      .join("\n\n");

    // Create prompt for Claude
    const prompt = `You are an expert educational advisor for Alberta, Canada post-secondary programs.

Student Profile:
- Name: ${profileData.name}
- Current Education: ${profileData.currentEducation}
- Career Goal: ${profileData.careerGoal}
- Interests: ${profileData.interests}
${profileData.mathScore ? `- Math Score: ${profileData.mathScore}%` : ""}

Available Programs (pre-filtered by education level):
${programsText}

Task: Recommend the TOP 10 programs that best match this student's profile. Consider:
1. How well the program aligns with their career goal
2. Whether they meet the prerequisites (especially math requirements)
3. How the program matches their interests
4. Career outcomes and job prospects

Provide your response in this EXACT JSON format (no markdown, no backticks):
{
  "recommendations": [
    {
      "programId": "exact program ID from database",
      "programName": "exact program name",
      "institution": "exact institution name",
      "matchScore": 95,
      "reasoning": "Detailed explanation of why this is a great match",
      "careerAlignment": "How this leads to their career goal",
      "prerequisiteMatch": "Whether they meet requirements"
    }
  ],
  "summary": "Overall summary of recommendations and next steps"
}

Return ONLY the JSON, nothing else.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response
    let recommendations;
    try {
      recommendations = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText);
      throw new Error("Invalid response format from AI");
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}