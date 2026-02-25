"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function PrerequisiteChecker() {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  // Get all student profiles (for demo - in production you'd use auth)
  const allProfiles = useQuery(api.students.getAllProfiles);

  const eligibility = useQuery(
    api.prerequisiteChecker.getQualifiedPrograms,
    selectedProfile ? { studentId: selectedProfile._id } : "skip"
  );

  // Auto-select most recent profile if none selected
  if (!selectedProfile && allProfiles && allProfiles.length > 0) {
    setSelectedProfile(allProfiles[allProfiles.length - 1]);
  }

  if (!allProfiles) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (allProfiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white rounded-lg shadow-xl p-8">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold mb-4">No Student Profiles Yet</h1>
          <p className="text-gray-600 mb-6">
            Create a student profile first to check program eligibility.
          </p>
          <a
            href="/profile"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Create Profile
          </a>
        </div>
      </div>
    );
  }

  const student = selectedProfile;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        {/* Header with Profile Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Prerequisite Checker</h1>
            
            {/* Profile Selector (if multiple profiles) */}
            {allProfiles.length > 1 && (
              <select
                value={selectedProfile?._id}
                onChange={(e) => {
                  const profile = allProfiles.find(p => p._id === e.target.value);
                  setSelectedProfile(profile);
                }}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 font-semibold"
              >
                {allProfiles.map((profile) => (
                  <option key={profile._id} value={profile._id}>
                    {profile.name} - {profile.careerGoal}
                  </option>
                ))}
              </select>
            )}
          </div>

          {student && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <span className="text-blue-600 font-medium">Name</span>
                <p className="font-semibold">{student.name}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <span className="text-green-600 font-medium">Education</span>
                <p className="font-semibold">{student.currentEducation}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <span className="text-purple-600 font-medium">Math Score</span>
                <p className="font-semibold">{student.mathScore}%</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <span className="text-orange-600 font-medium">Career Goal</span>
                <p className="font-semibold text-xs">{student.careerGoal}</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {eligibility && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-100 border-2 border-green-300 rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-3xl font-bold text-green-900 mb-1">
                  {eligibility.summary.qualifiedCount}
                </div>
                <div className="text-green-700 font-medium">
                  Programs You Qualify For
                </div>
              </div>

              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-2">📚</div>
                <div className="text-3xl font-bold text-yellow-900 mb-1">
                  {eligibility.summary.upgradeNeededCount}
                </div>
                <div className="text-yellow-700 font-medium">Upgrade Needed</div>
              </div>

              <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-2">🔒</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {eligibility.summary.notEligibleCount}
                </div>
                <div className="text-gray-700 font-medium">Not Yet Eligible</div>
              </div>
            </div>

            {/* Qualified Programs */}
            {eligibility.qualified.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>✅</span> Programs You Qualify For ({eligibility.qualified.length})
                </h2>
                <div className="space-y-4">
                  {eligibility.qualified.map((program: any) => (
                    <div
                      key={program.id}
                      className="bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {program.name}
                          </h3>
                          <p className="text-gray-600">
                            {program.institution} • {program.credentials}
                          </p>
                        </div>
                        <div className="bg-green-200 px-4 py-2 rounded-full">
                          <span className="text-green-900 font-bold">✓ Qualified</span>
                        </div>
                      </div>
                      <div className="mt-3 bg-green-100 p-3 rounded-lg">
                        <p className="text-green-800 font-semibold">
                          🎉 You meet all requirements! You can apply now.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade Needed */}
            {eligibility.upgradeNeeded.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>📚</span> Upgrade Needed ({eligibility.upgradeNeeded.length})
                </h2>
                <div className="space-y-4">
                  {eligibility.upgradeNeeded.map((program: any) => (
                    <div
                      key={program.id}
                      className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {program.name}
                          </h3>
                          <p className="text-gray-600">
                            {program.institution} • {program.credentials}
                          </p>
                        </div>
                        <div className="bg-yellow-200 px-4 py-2 rounded-full">
                          <span className="text-yellow-900 font-bold">⚠️ Upgrade</span>
                        </div>
                      </div>

                      <div className="bg-yellow-100 p-4 rounded-lg mb-3">
                        <h4 className="font-semibold text-yellow-900 mb-2">
                          What's Missing:
                        </h4>
                        <ul className="space-y-1">
                          {program.missing.map((req: string, i: number) => (
                            <li
                              key={i}
                              className="text-yellow-800 text-sm flex items-start gap-2"
                            >
                              <span>❌</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {program.recommendations.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">
                            How to Qualify:
                          </h4>
                          <ul className="space-y-1">
                            {program.recommendations.map((rec: string, i: number) => (
                              <li
                                key={i}
                                className="text-blue-800 text-sm flex items-start gap-2"
                              >
                                <span>💡</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not Eligible */}
            {eligibility.notEligible.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>🔒</span> Not Yet Eligible ({eligibility.notEligible.length})
                </h2>
                <div className="space-y-4">
                  {eligibility.notEligible.map((program: any) => (
                    <div
                      key={program.id}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {program.name}
                          </h3>
                          <p className="text-gray-600">
                            {program.institution} • {program.credentials}
                          </p>
                        </div>
                        <div className="bg-gray-200 px-4 py-2 rounded-full">
                          <span className="text-gray-900 font-bold">🔒 Not Eligible</span>
                        </div>
                      </div>

                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Requirements:
                        </h4>
                        <ul className="space-y-1">
                          {program.recommendations.map((rec: string, i: number) => (
                            <li
                              key={i}
                              className="text-gray-700 text-sm flex items-start gap-2"
                            >
                              <span>ℹ️</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/profile"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-semibold"
          >
            Create New Profile
          </a>
          <a
            href="/"
            className="bg-gray-600 text-white px-8 py-3 rounded-xl hover:bg-gray-700 font-semibold"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}