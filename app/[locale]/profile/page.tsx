"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
  const router = useRouter();
  const t = useTranslations("profile");
  const createOrUpdateStudent = useMutation(api.students.createOrUpdateStudent);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    educationLevel: "",
    currentGrade: "",
    mathScore: "",
    careerGoals: "",
    interests: "",
    workExperience: "",
    preferredLocation: "",
    studyMode: "",
    financialAid: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const studentId = await createOrUpdateStudent(form);
      router.push(`../recommendations?studentId=${studentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-600 mt-2">{t("subtitle")}</p>
        </div>

        {/* Guest notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <div className="text-2xl">👤</div>
          <div>
            <p className="text-sm text-blue-800 font-medium">{t("privacyNote")}</p>
            <p className="text-xs text-blue-600 mt-1">Sign in coming soon to save your profile.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">

          {/* Personal Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              {t("sections.personal")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.name")} *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t("placeholders.name")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. maria@email.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              {t("sections.education")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.educationLevel")} *
                </label>
                <select
                  id="educationLevel"
                  name="educationLevel"
                  required
                  value={form.educationLevel}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("options.educationLevel.select")}</option>
                  <option value="High School (Grade 12 or equivalent)">{t("options.educationLevel.highSchool")}</option>
                  <option value="Some College/University">{t("options.educationLevel.someCollege")}</option>
                  <option value="College Diploma">{t("options.educationLevel.diploma")}</option>
                  <option value="Bachelor's Degree">{t("options.educationLevel.bachelors")}</option>
                  <option value="Master's Degree or Higher">{t("options.educationLevel.masters")}</option>
                </select>
              </div>
              <div>
                <label htmlFor="currentGrade" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.currentGrade")}
                </label>
                <input
                  id="currentGrade"
                  name="currentGrade"
                  type="text"
                  value={form.currentGrade}
                  onChange={handleChange}
                  placeholder={t("placeholders.grade")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="mathScore" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.mathScore")}
                </label>
                <input
                  id="mathScore"
                  name="mathScore"
                  type="text"
                  value={form.mathScore}
                  onChange={handleChange}
                  placeholder={t("placeholders.mathScore")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.workExperience")}
                </label>
                <input
                  id="workExperience"
                  name="workExperience"
                  type="text"
                  value={form.workExperience}
                  onChange={handleChange}
                  placeholder={t("placeholders.workExperience")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Goals & Interests */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              {t("sections.careerInterests")}
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="careerGoals" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.careerGoals")} *
                </label>
                <textarea
                  id="careerGoals"
                  name="careerGoals"
                  required
                  value={form.careerGoals}
                  onChange={handleChange}
                  placeholder={t("placeholders.careerGoals")}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.interests")} *
                </label>
                <input
                  id="interests"
                  name="interests"
                  type="text"
                  required
                  value={form.interests}
                  onChange={handleChange}
                  placeholder={t("placeholders.interests")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              {t("sections.preferences")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="preferredLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.preferredLocation")}
                </label>
                <select
                  id="preferredLocation"
                  name="preferredLocation"
                  value={form.preferredLocation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("options.location.noPreference")}</option>
                  <option value="Calgary">{t("options.location.calgary")}</option>
                  <option value="Edmonton">{t("options.location.edmonton")}</option>
                  <option value="Lethbridge">{t("options.location.lethbridge")}</option>
                  <option value="Online">{t("options.location.online")}</option>
                </select>
              </div>
              <div>
                <label htmlFor="studyMode" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.studyMode")}
                </label>
                <select
                  id="studyMode"
                  name="studyMode"
                  value={form.studyMode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("options.studyMode.noPreference")}</option>
                  <option value="Full-time">{t("options.studyMode.fullTime")}</option>
                  <option value="Part-time">{t("options.studyMode.partTime")}</option>
                  <option value="Online">{t("options.studyMode.online")}</option>
                  <option value="Hybrid">{t("options.studyMode.hybrid")}</option>
                </select>
              </div>
              <div>
                <label htmlFor="financialAid" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.financialAid")}
                </label>
                <select
                  id="financialAid"
                  name="financialAid"
                  value={form.financialAid}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("options.financialAid.notSure")}</option>
                  <option value="Yes">{t("options.financialAid.yes")}</option>
                  <option value="Maybe">{t("options.financialAid.maybe")}</option>
                  <option value="No">{t("options.financialAid.no")}</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </button>

        </form>
      </div>
    </div>
  );
}