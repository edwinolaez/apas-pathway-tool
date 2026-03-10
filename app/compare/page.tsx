"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type CompareProgram = {
  id: string;
  name: string;
  institution: string;
  credentials: string;
  duration: string;
  tuition: string;
  deliveryMode: string;
  description: string;
  prerequisites: string;
  careerPaths: string;
  averageSalary: string;
  startDates: string;
  applicationDeadline: string;
};

type RawProgram = {
  id: string;
  name: string;
  institution: string;
  credentials: string;
  duration: string;
  description?: string;
  careerPaths?: string[];
  deliveryModes?: string[];
  startTerms?: string[];
  tuition?: {
    domestic?: number | string | null;
  };
  prerequisites?: {
    domestic?: string[];
    highSchool?: string[];
    note?: string;
  };
  additionalInfo?: {
    deliveryMode?: string;
    startDates?: string[];
    averageStartingSalary?: string | number;
    applicationDeadline?: string;
  };
};

function formatProgramForCompare(program: RawProgram): CompareProgram {
  const domesticTuition =
    typeof program?.tuition?.domestic === "number"
      ? `$${program.tuition.domestic.toLocaleString()}`
      : typeof program?.tuition?.domestic === "string"
        ? program.tuition.domestic
        : "N/A";

  const deliveryMode =
    program?.additionalInfo?.deliveryMode ||
    (Array.isArray(program?.deliveryModes) && program.deliveryModes.length > 0
      ? program.deliveryModes.join(", ")
      : "Unknown");

  const prerequisiteSource = program?.prerequisites;
  let prerequisites = "N/A";
  if (Array.isArray(prerequisiteSource?.domestic) && prerequisiteSource.domestic.length > 0) {
    prerequisites = prerequisiteSource.domestic.join("; ");
  } else if (Array.isArray(prerequisiteSource?.highSchool) && prerequisiteSource.highSchool.length > 0) {
    prerequisites = prerequisiteSource.highSchool.join("; ");
  } else if (typeof prerequisiteSource?.note === "string" && prerequisiteSource.note.length > 0) {
    prerequisites = prerequisiteSource.note;
  }

  const careerPaths = Array.isArray(program?.careerPaths)
    ? program.careerPaths.join(", ")
    : "N/A";

  const startDates =
    Array.isArray(program?.additionalInfo?.startDates) &&
    program.additionalInfo.startDates.length > 0
      ? program.additionalInfo.startDates.join(", ")
      : Array.isArray(program?.startTerms) && program.startTerms.length > 0
        ? program.startTerms.join(", ")
        : "N/A";

  const averageSalary =
    program?.additionalInfo?.averageStartingSalary !== undefined
      ? String(program.additionalInfo.averageStartingSalary)
      : "N/A";

  return {
    id: program.id,
    name: program.name,
    institution: program.institution,
    credentials: program.credentials,
    duration: program.duration,
    tuition: domesticTuition,
    deliveryMode,
    description: program.description || "N/A",
    prerequisites,
    careerPaths,
    averageSalary,
    startDates,
    applicationDeadline: program?.additionalInfo?.applicationDeadline || "N/A",
  };
}

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const programIds = useMemo(() => {
    const raw = searchParams.get("programs") || "";
    return raw
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  }, [searchParams]);

  const fetchedPrograms = useQuery(
    api.queries.getProgramsByIds,
    programIds.length > 0 ? { programIds } : "skip"
  );

  const programs: CompareProgram[] = useMemo(() => {
    if (!fetchedPrograms) return [];
    return fetchedPrograms.map((p) => formatProgramForCompare(p));
  }, [fetchedPrograms]);

  useEffect(() => {
    if (programIds.length < 2) {
      router.replace("/chat");
    }
  }, [programIds.length, router]);

  if (programIds.length < 2) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
          <p className="text-muted-foreground">Redirecting to chat...</p>
        </div>
      </div>
    );
  }

  if (fetchedPrograms === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
          <p className="text-muted-foreground">Loading selected programs...</p>
        </div>
      </div>
    );
  }

  if (programs.length < 2) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card border border-border rounded-xl p-6 text-center shadow-lg">
          <h1 className="text-xl font-bold text-foreground mb-2">Could not compare these programs</h1>
          <p className="text-muted-foreground mb-4">
            Some selected programs were not found. Please go back and select at least two programs again.
          </p>
          <button
            onClick={() => router.push("/chat")}
            className="rounded-full border-primary border px-6 py-3 text-sm font-bold text-white bg-primary hover:bg-[#342158] transition-colors"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  const attributes: Array<{ label: string; key: keyof CompareProgram; icon: string }> = [
    { label: "Institution", key: "institution", icon: "Institution" },
    { label: "Credential", key: "credentials", icon: "Credential" },
    { label: "Duration", key: "duration", icon: "Duration" },
    { label: "Tuition", key: "tuition", icon: "Tuition" },
    { label: "Delivery Mode", key: "deliveryMode", icon: "Delivery" },
    { label: "Prerequisites", key: "prerequisites", icon: "Prerequisites" },
    { label: "Career Paths", key: "careerPaths", icon: "Career" },
    { label: "Average Salary", key: "averageSalary", icon: "Salary" },
    { label: "Start Dates", key: "startDates", icon: "Start Dates" },
    { label: "Application Deadline", key: "applicationDeadline", icon: "Deadline" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg p-6 mb-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Program Comparison</h1>
              <p className="text-muted-foreground">Compare {programs.length} programs side-by-side</p>
            </div>
            <button
              onClick={() => router.back()}
              className="rounded-full border-border border-2 px-6 py-3 text-sm font-bold text-foreground bg-card hover:bg-muted transition-colors shadow-lg hover:shadow-xl"
            >
              Back to Chat
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left bg-muted font-bold text-foreground sticky left-0 z-10">Attribute</th>
                {programs.map((program, index) => (
                  <th
                    key={program.id}
                    className={`p-4 text-left font-bold text-foreground min-w-75 ${
                      index === 0 ? "bg-primary/10" : index === 1 ? "bg-accent/10" : "bg-muted"
                    }`}
                  >
                    <div className="mb-2">
                      <h3 className="text-lg font-bold">{program.name}</h3>
                      <p className="text-sm text-muted-foreground font-normal">{program.institution}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-4 font-semibold text-foreground bg-muted sticky left-0 z-10">Description</td>
                {programs.map((program) => (
                  <td key={program.id} className="p-4 text-foreground">{program.description}</td>
                ))}
              </tr>

              {attributes.map((attr) => (
                <tr key={attr.key} className="border-b border-border hover:bg-muted/50">
                  <td className="p-4 font-semibold text-foreground bg-muted sticky left-0 z-10">
                    {attr.icon} {attr.label}
                  </td>
                  {programs.map((program) => (
                    <td key={program.id} className="p-4 text-foreground">
                      {program[attr.key] || "N/A"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
            <p className="text-muted-foreground">Loading comparison...</p>
          </div>
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
