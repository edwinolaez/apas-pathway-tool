"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";
import VoiceInput from "../components/VoiceInput";

const interestOptions = [
  "Technology",
  "Healthcare",
  "Business",
  "Engineering",
  "Arts & Design",
  "Education",
  "Sciences",
  "Trades",
  "Social Services",
  "Law & Justice",
];

export default function ProfilePage() {
  const { userId } = useAuth();
  const existingProfile = useQuery(
    api.students.getStudentByClerkId,
    userId ? { clerkId: userId } : "skip",
  );

  if (!userId || existingProfile === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileForm
      key={existingProfile?._id ?? "new"}
      userId={userId}
      existingProfile={existingProfile ?? null}
    />
  );
}

function ProfileForm({
  userId,
  existingProfile,
}: {
  userId: string;
  existingProfile: Doc<"students"> | null;
}) {
  const router = useRouter();
  const upsertStudent = useMutation(api.students.upsertStudentByClerkId);

  const [name, setName] = useState(existingProfile?.name ?? "");
  const [currentEducation, setCurrentEducation] = useState(
    existingProfile?.currentEducation ?? "",
  );
  const [careerGoal, setCareerGoal] = useState(existingProfile?.careerGoal ?? "");
  const [interests, setInterests] = useState<string[]>(existingProfile?.interests ?? []);
  const [mathScore, setMathScore] = useState(
    existingProfile ? String(existingProfile.mathScore) : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInterestToggle = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validation
    if (
      !name ||
      !currentEducation ||
      !careerGoal ||
      interests.length === 0 ||
      !mathScore
    ) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    const mathScoreNum = parseInt(mathScore);
    if (isNaN(mathScoreNum) || mathScoreNum < 0 || mathScoreNum > 100) {
      setError("Math score must be between 0 and 100");
      setIsSubmitting(false);
      return;
    }

    try {
      const studentId = await upsertStudent({
        clerkId: userId,
        name,
        currentEducation,
        careerGoal,
        interests,
        mathScore: mathScoreNum,
      });
      localStorage.setItem("pathrStudentId", String(studentId));
      router.push(`/chat?studentId=${studentId}`);
    } catch (err) {
      console.error("Error creating profile:", err);
      setError("Failed to create profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-muted flex items-center justify-center overflow-hidden px-4 py-12">
      {/* Decorative SVGs */}
      <svg
        className="absolute -top-15 -left-15 w-72 h-72 text-primary/10"
        viewBox="0 0 200 200"
        fill="currentColor"
      >
        <circle cx="100" cy="100" r="100" />
      </svg>
      <svg
        className="absolute -bottom-10 -right-10 w-64 h-64 text-accent/15"
        viewBox="0 0 200 200"
        fill="currentColor"
      >
        <polygon points="100,0 200,200 0,200" />
      </svg>
      <svg
        className="absolute top-20 right-10 w-24 h-24 text-secondary/40"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <rect x="10" y="10" width="80" height="80" rx="16" />
      </svg>
      <svg
        className="absolute bottom-24 left-12 w-20 h-20 text-primary/8"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      >
        <circle cx="50" cy="50" r="40" />
        <line x1="50" y1="10" x2="50" y2="90" />
        <line x1="10" y1="50" x2="90" y2="50" />
      </svg>
      <svg
        className="absolute top-1/3 -left-5 w-16 h-16 text-accent/20"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <polygon points="50,5 95,97 5,97" />
      </svg>
      <svg
        className="absolute top-10 left-1/3 w-10 h-10 text-ring/15"
        viewBox="0 0 50 50"
        fill="currentColor"
      >
        <path d="M25 0 L31 19 L50 19 L35 31 L40 50 L25 38 L10 50 L15 31 L0 19 L19 19 Z" />
      </svg>

      {/* Form Card */}
      <div className="relative z-10 w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {existingProfile ? "Update Your Profile" : "Create Your Profile"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us about yourself for personalized recommendations
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2 text-sm text-destructive flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name with Voice */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Full Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Smith"
                className="flex-1 px-4 py-2 border border-border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                required
              />
              <VoiceInput
                fieldName="Name"
                onTranscript={(text) => setName(text)}
              />
            </div>
          </div>

          {/* Current Education */}
          <div className="relative">
            <label
              htmlFor="education"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Education Level
            </label>
            <div className="relative">
              <select
                id="education"
                value={currentEducation}
                onChange={(e) => setCurrentEducation(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 border border-border rounded-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors cursor-pointer"
                required
              >
                <option value="">Select your education level</option>
                <option value="High School">High School</option>
                <option value="High School Graduate">
                  High School Graduate
                </option>
                <option value="Some College/University">
                  Some College/University
                </option>
                <option value="College Diploma">College Diploma</option>
                <option value="University Degree">University Degree</option>
                <option value="Other">Other</option>
              </select>
              {/* Custom chevron */}
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Career Goal with Voice */}
          <div>
            <label
              htmlFor="goal"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Career Goal
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="goal"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g., Software Developer"
                className="flex-1 px-4 py-2 border border-border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                required
              />
              <VoiceInput
                fieldName="Career Goal"
                onTranscript={(text) => setCareerGoal(text)}
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Areas of Interest
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    interests.includes(interest)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {/* {interests.includes(interest) && "✓ "} */}
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Selected: {interests.length > 0 ? interests.join(", ") : "None"}
            </p>
          </div>

          {/* Math Score */}
          <div>
            <label
              htmlFor="math"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Math Score (%)
            </label>
            <input
              type="number"
              id="math"
              value={mathScore}
              onChange={(e) => setMathScore(e.target.value)}
              placeholder="e.g., 85"
              min={0}
              max={100}
              className="w-full px-4 py-2 border border-border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter your most recent math grade (0–100)
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-primary text-md font-bold text-primary-foreground px-6 py-3 border border-primary hover:bg-[#342158] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" className="opacity-75" />
                  </svg>
                  Creating Profile…
                </span>
              ) : (
                existingProfile ? "Save & Go to Chat" : "Get My Recommendations"
              )}
            </button>
            <Link href="/" className="w-full">
              <button
                type="button"
                className="w-full rounded-full bg-card text-foreground border border-border px-6 py-3 font-medium hover:bg-muted transition-colors"
              >
                ← Back to Home
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
