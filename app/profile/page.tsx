"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function StudentProfile() {
  const router = useRouter();
  const saveProfile = useMutation(api.students.createProfile);
  
  const [name, setName] = useState("");
  const [currentEducation, setCurrentEducation] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [mathScore, setMathScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    console.log("=== FORM SUBMIT DEBUG ===");
    console.log("Name:", name);
    console.log("Education:", currentEducation);
    console.log("Career Goal:", careerGoal);
    console.log("Interests:", interests);
    console.log("Math Score:", mathScore);

    try {
      // Validate form
      if (!name || !currentEducation || !careerGoal || interests.length === 0 || mathScore === 0) {
        setError("Please fill in all fields");
        setIsSubmitting(false);
        return;
      }

      console.log("Saving profile...");

      // Save profile
      const studentId = await saveProfile({
        name,
        currentEducation,
        careerGoal,
        interests,
        mathScore,
      });

      console.log("Profile saved! Student ID:", studentId);
      console.log("Redirecting to recommendations...");

      // Redirect to recommendations page
      router.push(`/recommendations?studentId=${studentId}`);
      
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const interestOptions = [
    "Technology",
    "Software",
    "Healthcare",
    "Business",
    "Engineering",
    "Finance",
    "Accounting",
    "Construction",
    "Education",
    "Emerging Tech",
    "Anime",
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-black">Student Intake</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="block mb-1 font-medium text-black">Name *</label>
          <input
            className="border p-2 rounded text-black w-full"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Current Education */}
        <div>
          <label className="block mb-1 font-medium text-black">Current Education *</label>
          <select
            className="border p-2 rounded text-black w-full"
            value={currentEducation}
            onChange={(e) => setCurrentEducation(e.target.value)}
            required
          >
            <option value="">Select Current Education</option>
            <option value="High School">High School</option>
            <option value="Diploma">Diploma</option>
            <option value="Certificate">Certificate</option>
            <option value="Bachelor Degree">Bachelor Degree</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Career Goal */}
        <div>
          <label className="block mb-1 font-medium text-black">Career Goal *</label>
          <input
            className="border p-2 rounded text-black w-full"
            placeholder="e.g., Software Developer"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            required
          />
        </div>

        {/* Interests */}
        <div>
          <label className="block mb-2 font-medium text-black">Interests * (select at least one)</label>
          <div className="grid grid-cols-3 gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={`p-2 rounded border ${
                  interests.includes(interest)
                    ? "bg-blue-600 text-white"
                    : "bg-white text-black"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Selected: {interests.length > 0 ? interests.join(", ") : "None"}
          </p>
        </div>

        {/* Math Score */}
        <div>
          <label className="block mb-2 font-medium text-black">
            Math Score: {mathScore}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={mathScore}
            onChange={(e) => setMathScore(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold text-lg"
        >
          {isSubmitting ? "Saving & Analyzing..." : "Get AI Recommendations →"}
        </button>

        {/* Debug Info */}
        <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700">
          <p className="font-bold mb-1">Ready to submit?</p>
          <p>✓ Name: {name || "❌ Missing"}</p>
          <p>✓ Education: {currentEducation || "❌ Missing"}</p>
          <p>✓ Career Goal: {careerGoal || "❌ Missing"}</p>
          <p>✓ Interests: {interests.length > 0 ? `${interests.length} selected` : "❌ None selected"}</p>
          <p>✓ Math Score: {mathScore > 0 ? `${mathScore}%` : "❌ Set to 0"}</p>
        </div>
      </form>
    </div>
  );
}