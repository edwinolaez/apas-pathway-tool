// convex/prerequisiteChecker.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

interface PrerequisiteCheck {
  programId: string;
  programName: string;
  qualifies: boolean;
  status: "qualified" | "upgrade_needed" | "not_eligible";
  missingRequirements: string[];
  recommendations: string[];
}

// Get all programs a student qualifies for
export const getQualifiedPrograms = query({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    const programs = await ctx.db.query("programs").collect();
    
    const qualified: any[] = [];
    const upgradeNeeded: any[] = [];
    const notEligible: any[] = [];

    for (const program of programs) {
      const result = analyzePrerequisitesConservative(student, program);
      
      const entry = {
        id: program.id,
        name: program.name,
        institution: program.institution,
        credentials: program.credentials,
        status: result.status,
        missing: result.missing,
        recommendations: result.recommendations,
      };

      if (result.status === "qualified") {
        qualified.push(entry);
      } else if (result.status === "upgrade_needed") {
        upgradeNeeded.push(entry);
      } else {
        notEligible.push(entry);
      }
    }

    return {
      qualified,
      upgradeNeeded,
      notEligible,
      summary: {
        totalPrograms: programs.length,
        qualifiedCount: qualified.length,
        upgradeNeededCount: upgradeNeeded.length,
        notEligibleCount: notEligible.length,
      },
    };
  },
});

// Conservative prerequisite analysis - assume student needs to meet HIGHEST standard
function analyzePrerequisitesConservative(
  student: any,
  program: any
): {
  status: "qualified" | "upgrade_needed" | "not_eligible";
  missing: string[];
  recommendations: string[];
} {
  const missing: string[] = [];
  const recommendations: string[] = [];

  // Check education level
  const educationLevelMap: Record<string, number> = {
    "High School": 1,
    "Certificate": 2,
    "Diploma": 3,
    "Bachelor Degree": 4,
    "Other": 1,
  };

  const requiredLevelMap: Record<string, number> = {
    "Certificate": 1,
    "Diploma": 1,
    "Bachelor of Technology (BTech)": 3,
    "Bachelor of Science": 1,
    "Bachelor of Business Administration (BBA)": 1,
    "Bachelor of Commerce": 1,
  };

  const studentLevel = educationLevelMap[student.currentEducation] || 1;
  const requiredLevel = requiredLevelMap[program.credentials] || 1;

  if (studentLevel < requiredLevel) {
    missing.push(`Need ${program.credentials.split(" ")[0]} credential first`);
    recommendations.push(`Complete a ${program.credentials.split(" ")[0]} program first`);
  }

  // CONSERVATIVE APPROACH: Check against highest possible requirement
  // This prevents false positives
  
  const prereqString = JSON.stringify(program.prerequisites).toLowerCase();
  
  // Check for competitive/minimum average requirements
  const avgMatches = prereqString.match(/(\d+)%/g);
  if (avgMatches) {
    const percentages = avgMatches.map(m => parseInt(m.replace('%', '')));
    const highestRequired = Math.max(...percentages);
    
    // If student's score is below the highest mentioned percentage, they likely don't qualify
    if (student.mathScore < highestRequired && highestRequired >= 50 && highestRequired <= 100) {
      missing.push(`Overall average: Need at least ${highestRequired}%, you have ${student.mathScore}%`);
      recommendations.push(`Improve your overall average to ${highestRequired}% or higher`);
    }
  }
  
  // Check for specific course requirements in prerequisites
  if (prereqString.includes('math 30-1') || prereqString.includes('math30-1')) {
    // Math 30-1 typically requires 60% minimum
    const math301Min = 60;
    const orMatch = prereqString.match(/math 30-1.*?(\d+)%.*?or.*?math 30-2.*?(\d+)%/i);
    
    if (orMatch) {
      // Has OR condition - student needs to meet at least ONE option
      const math301Req = parseInt(orMatch[1]);
      const math302Req = parseInt(orMatch[2]);
      const lowestOption = Math.min(math301Req, math302Req);
      
      if (student.mathScore < lowestOption) {
        missing.push(`Math: Need ${math301Req}% (Math 30-1) OR ${math302Req}% (Math 30-2), you have ${student.mathScore}%`);
        recommendations.push(`Option 1: Achieve ${math301Req}% in Math 30-1, OR Option 2: Achieve ${math302Req}% in Math 30-2`);
      }
    } else if (student.mathScore < math301Min) {
      missing.push(`Math 30-1: Need at least ${math301Min}%, you have ${student.mathScore}%`);
      recommendations.push(`Improve Math 30-1 grade to ${math301Min}% or take Math 30-1 if you currently have Math 30-2`);
    }
  } else if (prereqString.includes('math 30-2') || prereqString.includes('math30-2')) {
    // Math 30-2 typically requires 50% minimum
    const math302Min = 50;
    if (student.mathScore < math302Min) {
      missing.push(`Math 30-2: Need at least ${math302Min}%, you have ${student.mathScore}%`);
      recommendations.push(`Improve Math 30-2 grade to ${math302Min}%`);
    }
  }
  
  // Check for English requirements
  if (prereqString.includes('english 30-1') || prereqString.includes('english30-1')) {
    // Assume student needs similar grades across subjects
    if (student.mathScore < 60) {
      missing.push(`English 30-1: Likely need 60% or higher`);
      recommendations.push(`Ensure you have English 30-1 with at least 60%`);
    }
  }

  // Determine status
  let status: "qualified" | "upgrade_needed" | "not_eligible";
  
  if (missing.length === 0) {
    status = "qualified";
  } else if (missing.some(m => m.toLowerCase().includes("credential first"))) {
    status = "not_eligible";
  } else {
    status = "upgrade_needed";
  }

  return { status, missing, recommendations };
}