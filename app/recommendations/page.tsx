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

  const getRecommendations = useAction(api.recommendations.getRecommendations);
  const student = useQuery(
    api.students.getProfile,
    studentId ? { studentId } : "skip"
  );

  const handleGetRecommendations = useCallback(async () => {
    if (!studentId) {
      setError("No student ID provided");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching recommendations for student:", studentId);
      const result = await getRecommendations({ studentId });
      console.log("Got recommendations:", result);
      setRecommendations(result);
    } catch (err) {
      console.error("Error getting recommendations:", err);
      setError(
        `Failed to get recommendations: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, [studentId, getRecommendations]);

  // Auto-trigger recommendations when page loads
  useEffect(() => {
    if (student && studentId && !hasAutoTriggered && !recommendations && !isLoading) {
      console.log("Auto-triggering recommendations...");
      setHasAutoTriggered(true);
      handleGetRecommendations();
    }
  }, [student, studentId, hasAutoTriggered, recommendations, isLoading, handleGetRecommendations]);

  if (!studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Student Profile Found</h1>
          <p className="text-gray-600 mb-4">
            Please create a student profile first.
          </p>
          <a
            href="/profile"
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Create Profile
          </a>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading student profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Program Recommendations for {student.name}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Education:</span>
              <p className="font-semibold">{student.currentEducation}</p>
            </div>
            <div>
              <span className="text-gray-600">Career Goal:</span>
              <p className="font-semibold">{student.careerGoal}</p>
            </div>
            <div>
              <span className="text-gray-600">Math Score:</span>
              <p className="font-semibold">{student.mathScore}%</p>
            </div>
            <div>
              <span className="text-gray-600">Interests:</span>
              <p className="font-semibold">{student.interests.join(", ")}</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-8">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
            <button
              onClick={handleGetRecommendations}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 p-8 rounded-lg text-center">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-lg font-semibold text-blue-900 mb-2">
                Claude AI is analyzing {student.name}'s profile...
              </p>
              <p className="text-sm text-blue-700">
                Reviewing all 53 programs • Matching career goals • Checking prerequisites
              </p>
              <div className="mt-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && !isLoading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                Top {recommendations.recommendations.length} Program Matches
              </h2>
              <button
                onClick={() => {
                  setRecommendations(null);
                  setHasAutoTriggered(false);
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Get New Recommendations
              </button>
            </div>

            {recommendations.recommendations.map(
              (rec: any, index: number) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-blue-600">
                          #{index + 1}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">
                          {rec.programName}
                        </h3>
                      </div>
                      <p className="text-gray-600">{rec.institution}</p>
                    </div>
                    <div className="bg-green-100 px-4 py-2 rounded-full">
                      <span className="text-green-800 font-bold">
                        {rec.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Why It's a Good Fit */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Why This Program?
                    </h4>
                    <p className="text-gray-700">{rec.reasoning}</p>
                  </div>

                  {/* Career Alignment */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Career Alignment
                    </h4>
                    <p className="text-gray-700">{rec.careerAlignment}</p>
                  </div>

                  {/* Prerequisites */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      What You'll Need
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {rec.prerequisites.map((prereq: string, i: number) => (
                        <li key={i} className="text-gray-700 text-sm">
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center mt-8">
              <a
                href="/profile"
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
              >
                Create New Profile
              </a>
              <a
                href="/"
                className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700"
              >
                Back to Home
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RecommendationsContent />
    </Suspense>
  );
}