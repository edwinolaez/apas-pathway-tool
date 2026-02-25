"use client";

import { Suspense, useEffect, useCallback } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId") as Id<"students"> | null;

  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const getRecommendations = useAction(api.recommendations.getRecommendations);
  const student = useQuery(
    api.students.getProfile,
    studentId ? { studentId } : "skip"
  );

  // Get eligibility for recommended programs
  const eligibility = useQuery(
    api.prerequisiteChecker.getQualifiedPrograms,
    studentId ? { studentId } : "skip"
  );

  const handleGetRecommendations = useCallback(async () => {
    if (!studentId) {
      setError("No student ID provided");
      return;
    }

    setIsLoading(true);
    setError("");
    setLoadingProgress(0);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 500);

    try {
      const result = await getRecommendations({ studentId });
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      setTimeout(() => {
        setRecommendations(result);
        setIsLoading(false);
      }, 300);
      
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Error getting recommendations:", err);
      setError(
        `Failed to get recommendations: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setIsLoading(false);
    }
  }, [studentId, getRecommendations]);

  useEffect(() => {
    if (student && studentId && !hasAutoTriggered && !recommendations && !isLoading) {
      setHasAutoTriggered(true);
      handleGetRecommendations();
    }
  }, [student, studentId, hasAutoTriggered, recommendations, isLoading, handleGetRecommendations]);

  // Helper to get eligibility status for a program
  const getEligibilityStatus = (programId: string) => {
    if (!eligibility) return null;
    
    const qualified = eligibility.qualified.find((p: any) => p.id === programId);
    if (qualified) return { status: "qualified", data: qualified };
    
    const upgrade = eligibility.upgradeNeeded.find((p: any) => p.id === programId);
    if (upgrade) return { status: "upgrade", data: upgrade };
    
    const notEligible = eligibility.notEligible.find((p: any) => p.id === programId);
    if (notEligible) return { status: "not_eligible", data: notEligible };
    
    return null;
  };

  if (!studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white rounded-lg shadow-xl p-8">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900">No Student Profile Found</h1>
          <p className="text-gray-600 mb-6">
            Please create a student profile first to get personalized recommendations.
          </p>
          <a
            href="/profile"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold"
          >
            Create Profile
          </a>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-lg text-gray-700">Loading student profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🎓</div>
            <h1 className="text-3xl font-bold text-gray-900">
              Program Recommendations for {student.name}
            </h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="text-blue-600 font-medium">Education</span>
              <p className="font-semibold text-gray-900">{student.currentEducation}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <span className="text-green-600 font-medium">Career Goal</span>
              <p className="font-semibold text-gray-900">{student.careerGoal}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <span className="text-purple-600 font-medium">Math Score</span>
              <p className="font-semibold text-gray-900">{student.mathScore}%</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <span className="text-orange-600 font-medium">Interests</span>
              <p className="font-semibold text-gray-900 text-xs">{student.interests.join(", ")}</p>
            </div>
          </div>
        </div>

        {/* Eligibility Summary */}
        {eligibility && !isLoading && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="text-3xl">✅</div>
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {eligibility.summary.qualifiedCount}
                  </div>
                  <div className="text-green-700 text-sm font-medium">
                    You Qualify For
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="text-3xl">📚</div>
                <div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {eligibility.summary.upgradeNeededCount}
                  </div>
                  <div className="text-yellow-700 text-sm font-medium">
                    Upgrade Needed
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="text-3xl">🔒</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {eligibility.summary.notEligibleCount}
                  </div>
                  <div className="text-gray-700 text-sm font-medium">
                    Not Yet Eligible
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <p className="font-bold text-red-900 text-lg mb-2">Error Occurred</p>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={handleGetRecommendations}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="bg-white border-2 border-blue-200 rounded-xl p-8 shadow-xl">
            <div className="text-center">
              <div className="text-7xl mb-6 animate-bounce">🤖</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">
                Claude AI is Analyzing Your Profile
              </h2>
              <p className="text-blue-700 mb-6">
                Reviewing 53 programs across 5 Alberta institutions
              </p>
              <div className="w-full bg-blue-100 rounded-full h-4 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-sm text-blue-600 font-semibold mb-6">{loadingProgress}% Complete</p>
              <div className="mt-8">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && !isLoading && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="text-4xl">✨</div>
                <div>
                  <h2 className="text-2xl font-bold text-green-900">
                    Found {recommendations.recommendations.length} Perfect Matches!
                  </h2>
                  <p className="text-green-700">Based on your goals, interests, and qualifications</p>
                </div>
                <button
                  onClick={() => {
                    setRecommendations(null);
                    setHasAutoTriggered(false);
                    setLoadingProgress(0);
                  }}
                  className="ml-auto text-green-600 hover:text-green-800 font-semibold text-sm border-2 border-green-300 px-4 py-2 rounded-lg hover:bg-green-100 transition-all"
                >
                  🔄 New Analysis
                </button>
              </div>
            </div>

            {/* Recommendation Cards */}
            {recommendations.recommendations.map(
              (rec: any, index: number) => {
                const eligibilityStatus = getEligibilityStatus(rec.programId);
                
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-blue-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold">
                            {index + 1}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900">
                            {rec.programName}
                          </h3>
                        </div>
                        <p className="text-gray-600 font-medium">{rec.institution}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 px-6 py-3 rounded-full border-2 border-green-300">
                        <span className="text-green-800 font-bold text-lg">
                          {rec.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    {/* Eligibility Status */}
                    {eligibilityStatus && (
                      <div className={`mb-4 p-4 rounded-lg border-2 ${
                        eligibilityStatus.status === "qualified" 
                          ? "bg-green-50 border-green-300" 
                          : eligibilityStatus.status === "upgrade"
                          ? "bg-yellow-50 border-yellow-300"
                          : "bg-gray-50 border-gray-300"
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {eligibilityStatus.status === "qualified" && (
                            <>
                              <span className="text-2xl">✅</span>
                              <h4 className="font-bold text-green-900">You Qualify!</h4>
                            </>
                          )}
                          {eligibilityStatus.status === "upgrade" && (
                            <>
                              <span className="text-2xl">📚</span>
                              <h4 className="font-bold text-yellow-900">Upgrade Needed</h4>
                            </>
                          )}
                          {eligibilityStatus.status === "not_eligible" && (
                            <>
                              <span className="text-2xl">🔒</span>
                              <h4 className="font-bold text-gray-900">Not Yet Eligible</h4>
                            </>
                          )}
                        </div>
                        
                        {eligibilityStatus.status === "qualified" && (
                          <p className="text-green-800 text-sm">
                            🎉 You meet all requirements! You can apply now.
                          </p>
                        )}
                        
                        {eligibilityStatus.status === "upgrade" && eligibilityStatus.data.missing && (
                          <div>
                            <p className="text-yellow-800 text-sm font-semibold mb-1">What's missing:</p>
                            {eligibilityStatus.data.missing.slice(0, 2).map((req: string, i: number) => (
                              <p key={i} className="text-yellow-700 text-xs">• {req}</p>
                            ))}
                          </div>
                        )}
                        
                        {eligibilityStatus.status === "not_eligible" && eligibilityStatus.data.recommendations && (
                          <p className="text-gray-700 text-sm">
                            {eligibilityStatus.data.recommendations[0]}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Why It's a Good Fit */}
                    <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <span>💡</span> Why This Program?
                      </h4>
                      <p className="text-gray-700">{rec.reasoning}</p>
                    </div>

                    {/* Career Alignment */}
                    <div className="mb-4 bg-green-50 p-4 rounded-lg border border-green-100">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <span>🎯</span> Career Alignment
                      </h4>
                      <p className="text-gray-700">{rec.careerAlignment}</p>
                    </div>

                    {/* Prerequisites */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                        <span>📋</span> What You'll Need
                      </h4>
                      <ul className="space-y-1">
                        {rec.prerequisites.map((prereq: string, i: number) => (
                          <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                            <span className="text-purple-600 font-bold">•</span>
                            <span>{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              }
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pb-8">
              <a
                href="/profile"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold text-center shadow-lg hover:shadow-xl"
              >
                📝 Create New Profile
              </a>
              <a
                href="/"
                className="bg-gray-700 text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all font-semibold text-center shadow-lg hover:shadow-xl"
              >
                🏠 Back to Home
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    }>
      <RecommendationsContent />
    </Suspense>
  );
}