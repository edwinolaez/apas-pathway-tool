"use client";

import { Suspense, useEffect, useCallback } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import LabourMarketCard from '../../components/LabourMarketCard';
import ExportPDFButton from '../../components/ExportPDFButton';
import { useTranslations } from "next-intl";

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId") as Id<"students"> | null;
  const t = useTranslations("recommendations");

  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const getRecommendations = useAction(api.recommendations.getRecommendations);
  const student = useQuery(api.students.getProfile, studentId ? { studentId } : "skip");
  const eligibility = useQuery(api.prerequisiteChecker.getQualifiedPrograms, studentId ? { studentId } : "skip");

  // On mount: load cached recommendations from sessionStorage if available
  useEffect(() => {
    if (studentId) {
      const cached = sessionStorage.getItem(`recommendations_${studentId}`);
      if (cached) {
        setRecommendations(JSON.parse(cached));
        setHasAutoTriggered(true);
      }
    }
  }, [studentId]);

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
        sessionStorage.setItem(`recommendations_${studentId}`, JSON.stringify(result));
        setRecommendations(result);
        setIsLoading(false);
      }, 300);
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Error getting recommendations:", err);
      setError(`Failed to get recommendations: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsLoading(false);
    }
  }, [studentId, getRecommendations]);

  useEffect(() => {
    if (student && studentId && !hasAutoTriggered && !recommendations && !isLoading) {
      setHasAutoTriggered(true);
      handleGetRecommendations();
    }
  }, [student, studentId, hasAutoTriggered, recommendations, isLoading, handleGetRecommendations]);

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

  const toggleProgramSelection = (index: number) => {
    setSelectedPrograms(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else if (prev.length < 4) {
        return [...prev, index];
      }
      return prev;
    });
  };

  const clearSelection = () => {
    setSelectedPrograms([]);
    setShowComparison(false);
  };

  const handleNewAnalysis = () => {
    if (studentId) {
      sessionStorage.removeItem(`recommendations_${studentId}`);
    }
    setRecommendations(null);
    setHasAutoTriggered(false);
    setLoadingProgress(0);
    clearSelection();
  };

  if (!studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="text-center bg-white rounded-lg shadow-xl p-8">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900">{t("noProfile")}</h1>
          <p className="text-gray-600 mb-6">{t("noProfileText")}</p>
          <a href="../profile" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold">{t("createProfile")}</a>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-lg text-gray-700">{t("loadingProfile")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">

        {/* Student summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🎓</div>
            <h1 className="text-3xl font-bold text-gray-900">{t("title")} {student.name}</h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <span className="text-blue-600 font-medium">{t("education")}</span>
              <p className="font-semibold text-gray-900">{student.currentEducation}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <span className="text-green-600 font-medium">{t("careerGoal")}</span>
              <p className="font-semibold text-gray-900">{student.careerGoal}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <span className="text-purple-600 font-medium">{t("mathScore")}</span>
              <p className="font-semibold text-gray-900">{student.mathScore}%</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
              <span className="text-orange-600 font-medium">{t("interests")}</span>
              <p className="font-semibold text-gray-900 text-xs">
                {Array.isArray(student.interests) ? student.interests.join(", ") : student.interests}
              </p>
            </div>
          </div>
        </div>

        {/* Eligibility summary */}
        {eligibility && !isLoading && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="text-3xl">✅</div>
                <div>
                  <div className="text-2xl font-bold text-green-900">{eligibility.summary.qualifiedCount}</div>
                  <div className="text-green-700 text-sm font-medium">{t("qualifyFor")}</div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="text-3xl">📚</div>
                <div>
                  <div className="text-2xl font-bold text-yellow-900">{eligibility.summary.upgradeNeededCount}</div>
                  <div className="text-yellow-700 text-sm font-medium">{t("upgradeNeeded")}</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="text-3xl">🔒</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{eligibility.summary.notEligibleCount}</div>
                  <div className="text-gray-700 text-sm font-medium">{t("notYetEligible")}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <p className="font-bold text-red-900 text-lg mb-2">{t("errorTitle")}</p>
                <p className="text-red-700 mb-4">{error}</p>
                <button onClick={handleGetRecommendations} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all font-semibold">{t("tryAgain")}</button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="bg-white border border-blue-200 rounded-lg p-8 shadow-sm">
            <div className="text-center">
              <div className="text-7xl mb-6 animate-bounce">🤖</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">{t("analyzing")}</h2>
              <p className="text-blue-700 mb-6">{t("analyzingSubtitle")}</p>
              <div className="w-full bg-blue-100 rounded-full h-4 mb-4 overflow-hidden">
                <div className="bg-blue-600 h-4 rounded-full transition-all duration-500" style={{ width: `${loadingProgress}%` }}></div>
              </div>
              <p className="text-sm text-blue-600 font-semibold mb-6">{loadingProgress}% {t("complete")}</p>
              <div className="mt-8">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {recommendations && !isLoading && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 flex-wrap justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">✨</div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-900">{t("found")} {recommendations.recommendations.length} {t("foundMatches")}</h2>
                    <p className="text-green-700">{t("foundMatchesSubtitle")}</p>
                  </div>
                </div>
                <button onClick={handleNewAnalysis} className="text-green-600 hover:text-green-800 font-semibold text-sm border border-green-300 px-4 py-2 rounded-lg hover:bg-green-100 transition-all">🔄 {t("newAnalysis")}</button>
              </div>
            </div>

            {selectedPrograms.length >= 2 && (
              <div className="sticky top-20 z-40 bg-blue-600 text-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{selectedPrograms.length} {t("programsSelected")}</p>
                    <p className="text-sm text-blue-100">{t("compareReady")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowComparison(true)} className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all">{t("comparePrograms")}</button>
                    <button onClick={clearSelection} className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all">{t("clear")}</button>
                  </div>
                </div>
              </div>
            )}

            {recommendations.recommendations.map((rec: any, index: number) => {
              const eligibilityStatus = getEligibilityStatus(rec.programId);
              const isSelected = selectedPrograms.includes(index);
              return (
                <div key={index} className={`bg-white rounded-lg shadow-sm p-6 transition-all border-2 ${isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleProgramSelection(index)} disabled={!isSelected && selectedPrograms.length >= 4} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:opacity-50" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white text-xl font-bold">{index + 1}</span>
                          <h3 className="text-xl font-bold text-gray-900">{rec.programName}</h3>
                        </div>
                        <p className="text-gray-600 font-medium">{rec.institution}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                      <span className="text-green-800 font-bold">{rec.matchScore}% {t("matchScore")}</span>
                    </div>
                  </div>

                  {eligibilityStatus && (
                    <div className={`mb-4 p-4 rounded-lg border ${eligibilityStatus.status === "qualified" ? "bg-green-50 border-green-200" : eligibilityStatus.status === "upgrade" ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {eligibilityStatus.status === "qualified" && (<><span className="text-2xl">✅</span><h4 className="font-bold text-green-900">{t("youQualify")}</h4></>)}
                        {eligibilityStatus.status === "upgrade" && (<><span className="text-2xl">📚</span><h4 className="font-bold text-yellow-900">{t("upgradeNeeded")}</h4></>)}
                        {eligibilityStatus.status === "not_eligible" && (<><span className="text-2xl">🔒</span><h4 className="font-bold text-gray-900">{t("notYetEligible")}</h4></>)}
                      </div>
                      {eligibilityStatus.status === "qualified" && (<p className="text-green-800 text-sm">{t("youQualifyText")}</p>)}
                      {eligibilityStatus.status === "upgrade" && eligibilityStatus.data.missing && (
                        <div>
                          <p className="text-yellow-800 text-sm font-semibold mb-1">{t("whyMissing")}</p>
                          {eligibilityStatus.data.missing.slice(0, 2).map((req: string, i: number) => (<p key={i} className="text-yellow-700 text-xs">• {req}</p>))}
                        </div>
                      )}
                      {eligibilityStatus.status === "not_eligible" && eligibilityStatus.data.recommendations && (<p className="text-gray-700 text-sm">{eligibilityStatus.data.recommendations[0]}</p>)}
                    </div>
                  )}

                  <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><span>💡</span> {t("whyProgram")}</h4>
                    <p className="text-gray-700 text-sm">{rec.reasoning}</p>
                  </div>

                  <div className="mb-4 bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2"><span>🎯</span> {t("careerAlignment")}</h4>
                    <p className="text-gray-700 text-sm">{rec.careerAlignment}</p>
                  </div>

                  <div className="mb-4 bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2"><span>📋</span> {t("whatYouNeed")}</h4>
                    <ul className="space-y-1">
                      {rec.prerequisites.map((prereq: string, i: number) => (
                        <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="text-purple-600 font-bold">•</span>
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <LabourMarketCard programName={rec.programName} />
                </div>
              );
            })}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pb-8">
              <ExportPDFButton student={student as any} recommendations={recommendations.recommendations} />
              <a href="../profile" className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all font-semibold text-center">📝 {t("createNewProfile")}</a>
              <a href="../" className="bg-gray-700 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-all font-semibold text-center">🏠 {t("backToHome")}</a>
            </div>
          </div>
        )}

        {/* Comparison Modal */}
        {showComparison && selectedPrograms.length >= 2 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t("compareTitle")} ({selectedPrograms.length})</h2>
                <button onClick={() => setShowComparison(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-40">{t("category")}</th>
                        {selectedPrograms.map((programIndex) => {
                          const rec = recommendations.recommendations[programIndex];
                          return (
                            <th key={programIndex} className="px-4 py-3 text-center border-l border-gray-200">
                              <div className="text-sm font-semibold text-gray-900 mb-1">{rec.programName}</div>
                              <div className="text-xs text-gray-500">{rec.institution}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">{t("matchScore")}</td>
                        {selectedPrograms.map((programIndex) => {
                          const rec = recommendations.recommendations[programIndex];
                          return (
                            <td key={programIndex} className="px-4 py-3 text-center border-l border-gray-200">
                              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">{rec.matchScore}%</span>
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">{t("eligibility")}</td>
                        {selectedPrograms.map((programIndex) => {
                          const rec = recommendations.recommendations[programIndex];
                          const status = getEligibilityStatus(rec.programId);
                          return (
                            <td key={programIndex} className="px-4 py-3 text-center text-sm border-l border-gray-200">
                              {status?.status === "qualified" && <span className="text-green-600 font-semibold">✅ {t("qualified")}</span>}
                              {status?.status === "upgrade" && <span className="text-yellow-600 font-semibold">📚 {t("upgradeNeeded")}</span>}
                              {status?.status === "not_eligible" && <span className="text-gray-600 font-semibold">🔒 {t("notYetEligible")}</span>}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">{t("whyProgram")}</td>
                        {selectedPrograms.map((programIndex) => {
                          const rec = recommendations.recommendations[programIndex];
                          return (<td key={programIndex} className="px-4 py-3 text-left text-sm text-gray-700 border-l border-gray-200">{rec.reasoning}</td>);
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">{t("careerAlignment")}</td>
                        {selectedPrograms.map((programIndex) => {
                          const rec = recommendations.recommendations[programIndex];
                          return (<td key={programIndex} className="px-4 py-3 text-left text-sm text-gray-700 border-l border-gray-200">{rec.careerAlignment}</td>);
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">{t("prerequisites")}</td>
                        {selectedPrograms.map((programIndex) => {
                          const rec = recommendations.recommendations[programIndex];
                          return (
                            <td key={programIndex} className="px-4 py-3 text-left text-sm text-gray-700 border-l border-gray-200">
                              <ul className="space-y-1">
                                {rec.prerequisites.slice(0, 3).map((prereq: string, i: number) => (<li key={i} className="text-xs">• {prereq}</li>))}
                              </ul>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-between">
                <button onClick={clearSelection} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">{t("clearSelection")}</button>
                <button onClick={() => setShowComparison(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">{t("closeComparison")}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div><p className="text-lg text-gray-700">Loading...</p></div></div>}>
      <RecommendationsContent />
    </Suspense>
  );
}