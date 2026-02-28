"use client";

import { useState } from "react";

interface ExportPDFButtonProps {
  student: {
    name: string;
    currentEducation: string;
    careerGoal: string;
    mathScore: number;
    interests: string[];
  };
  recommendations: any[];
}

export default function ExportPDFButton({ student, recommendations }: ExportPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);

    // Create a new window with the content to print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      setIsGenerating(false);
      return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${student.name} - Program Recommendations</title>
  <style>
    @media print {
      @page { margin: 0.5in; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #1f2937;
    }
    .header {
      background: linear-gradient(to right, #3b82f6, #6366f1);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    h1 { margin: 0 0 10px 0; font-size: 28px; }
    .subtitle { opacity: 0.9; font-size: 14px; }
    .student-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .info-card {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .info-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
    .program {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .program-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
    }
    .program-rank {
      background: #3b82f6;
      color: white;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      flex-shrink: 0;
      margin-right: 15px;
    }
    .program-title {
      flex: 1;
    }
    .program-name {
      font-size: 20px;
      font-weight: bold;
      margin: 0 0 5px 0;
      color: #1f2937;
    }
    .program-institution {
      color: #6b7280;
      font-size: 14px;
    }
    .match-score {
      background: #d1fae5;
      color: #065f46;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 16px;
    }
    .section {
      margin-bottom: 15px;
    }
    .section-title {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .section-content {
      color: #4b5563;
      line-height: 1.6;
      font-size: 13px;
    }
    .prereq-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .prereq-list li {
      padding: 5px 0 5px 20px;
      position: relative;
      font-size: 13px;
      color: #4b5563;
    }
    .prereq-list li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #7c3aed;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    .generated-date {
      margin-top: 10px;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Program Recommendations</h1>
    <div class="subtitle">Personalized education pathway for ${student.name}</div>
  </div>

  <div class="student-info">
    <div class="info-card">
      <div class="info-label">Current Education</div>
      <div class="info-value">${student.currentEducation}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Career Goal</div>
      <div class="info-value">${student.careerGoal}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Math Score</div>
      <div class="info-value">${student.mathScore}%</div>
    </div>
    <div class="info-card">
      <div class="info-label">Interests</div>
      <div class="info-value">${student.interests.join(', ')}</div>
    </div>
  </div>

  <h2 style="margin-top: 30px; margin-bottom: 20px; color: #1f2937;">
    Top ${recommendations.length} Program Matches
  </h2>

  ${recommendations.map((rec, index) => `
    <div class="program">
      <div class="program-header">
        <div style="display: flex; align-items: start;">
          <div class="program-rank">${index + 1}</div>
          <div class="program-title">
            <h3 class="program-name">${rec.programName}</h3>
            <div class="program-institution">${rec.institution}</div>
          </div>
        </div>
        <div class="match-score">${rec.matchScore}% Match</div>
      </div>

      <div class="section">
        <div class="section-title">💡 Why This Program?</div>
        <div class="section-content">${rec.reasoning}</div>
      </div>

      <div class="section">
        <div class="section-title">🎯 Career Alignment</div>
        <div class="section-content">${rec.careerAlignment}</div>
      </div>

      <div class="section">
        <div class="section-title">📋 Prerequisites</div>
        <ul class="prereq-list">
          ${rec.prerequisites.map((p: string) => `<li>${p}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('')}

  <div class="footer">
    <div>Generated by APAS - Alberta Post-Secondary Advisory System</div>
    <div class="generated-date">Generated on ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</div>
  </div>
</body>
</html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
      setIsGenerating(false);
    }, 500);
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold text-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isGenerating ? (
        <>
          <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
          <span>Generating...</span>
        </>
      ) : (
        <>
          <span>📄</span>
          <span>Export to PDF</span>
        </>
      )}
    </button>
  );
}