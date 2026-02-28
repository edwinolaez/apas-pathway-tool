"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import VoiceInput from '../components/VoiceInput';

export default function ProfilePage() {
  const router = useRouter();
  const createStudent = useMutation(api.students.createStudent);

  const [name, setName] = useState("");
  const [currentEducation, setCurrentEducation] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [mathScore, setMathScore] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    "Law & Justice"
  ];

  const handleInterestToggle = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validation
      if (!name || !currentEducation || !careerGoal || interests.length === 0 || !mathScore) {
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

      // Create student profile
      const studentId = await createStudent({
        name,
        currentEducation,
        careerGoal,
        interests,
        mathScore: mathScoreNum,
      });

      // Redirect to recommendations page
      router.push(`/recommendations?studentId=${studentId}`);
    } catch (err) {
      console.error("Error creating profile:", err);
      setError("Failed to create profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">🎓</div>
            <h1 className="text-3xl font-bold text-gray-900">Create Your Profile</h1>
          </div>
          <p className="text-gray-600">
            Tell us about yourself to get personalized program recommendations
          </p>
          
          {/* Voice Feature Indicator */}
          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-3 flex items-center gap-2">
            <span className="text-2xl">🎤</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">Voice Input Available!</p>
              <p className="text-xs text-blue-700">Click the microphone buttons to speak your answers</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Name Field with Voice */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Full Name *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                placeholder="e.g., John Smith"
                required
              />
              <VoiceInput
                fieldName="Name"
                onTranscript={(text) => setName(text)}
              />
            </div>
          </div>

          {/* Current Education */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Current Education Level *
            </label>
            <select
              value={currentEducation}
              onChange={(e) => setCurrentEducation(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
              required
            >
              <option value="">Select your education level</option>
              <option value="High School">High School</option>
              <option value="High School Graduate">High School Graduate</option>
              <option value="Some College/University">Some College/University</option>
              <option value="College Diploma">College Diploma</option>
              <option value="University Degree">University Degree</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Career Goal with Voice */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Career Goal *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                placeholder="e.g., Software Developer, Nurse, Business Manager"
                required
              />
              <VoiceInput
                fieldName="Career Goal"
                onTranscript={(text) => setCareerGoal(text)}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              💡 Try using the microphone to speak your career goal!
            </p>
          </div>

          {/* Interests */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Areas of Interest * (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all text-sm ${
                    interests.includes(interest)
                      ? "bg-blue-500 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {interests.includes(interest) && "✓ "}
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {interests.length > 0 ? interests.join(", ") : "None"}
            </p>
          </div>

          {/* Math Score */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-2">
              Math Score (%) *
            </label>
            <input
              type="number"
              value={mathScore}
              onChange={(e) => setMathScore(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
              placeholder="e.g., 85"
              min="0"
              max="100"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter your most recent math grade (0-100)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Creating Profile...
                </span>
              ) : (
                <span>🚀 Get My Recommendations</span>
              )}
            </button>
            <a
              href="/"
              className="bg-gray-200 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-300 transition-all font-semibold text-center shadow-lg hover:shadow-xl"
            >
              ← Back to Home
            </a>
          </div>

          {/* Voice Feature Notice */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-green-900">Quick Tip!</p>
                <p className="text-xs text-green-700">
                  Click the blue microphone buttons (🎤) next to Name and Career Goal to use voice input. 
                  You can also use the floating globe button (🌍) at the bottom-right to get help in multiple languages!
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-bold text-gray-900 mb-1">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Claude AI analyzes your profile against 53 programs
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold text-gray-900 mb-1">Fast Results</h3>
            <p className="text-sm text-gray-600">
              Get personalized recommendations in seconds
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="text-3xl mb-2">🎤</div>
            <h3 className="font-bold text-gray-900 mb-1">Voice Enabled</h3>
            <p className="text-sm text-gray-600">
              Speak your answers in multiple languages
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}