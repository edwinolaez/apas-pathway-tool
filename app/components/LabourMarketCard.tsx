// components/LabourMarketCard.tsx
import { getLabourMarketData } from './labourMarketData';

interface LabourMarketCardProps {
  programName: string;
  careerPaths?: string[];
}

export default function LabourMarketCard({ programName, careerPaths }: LabourMarketCardProps) {
  const data = getLabourMarketData(programName, careerPaths);

  const outlookColors = {
    "Excellent": { bg: "bg-green-50", border: "border-green-300", text: "text-green-900", badge: "bg-green-200" },
    "Good": { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-900", badge: "bg-blue-200" },
    "Fair": { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-900", badge: "bg-yellow-200" },
    "Limited": { bg: "bg-gray-50", border: "border-gray-300", text: "text-gray-900", badge: "bg-gray-200" }
  };

  const colors = outlookColors[data.employmentOutlook];

  return (
    <div className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4 mt-4`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-bold ${colors.text} flex items-center gap-2`}>
          <span>💼</span>
          Labour Market Outlook
        </h4>
        <span className={`${colors.badge} px-3 py-1 rounded-full text-xs font-bold ${colors.text}`}>
          {data.employmentOutlook}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <div className="bg-white bg-opacity-60 p-3 rounded-lg">
          <div className="text-xs text-gray-600 font-semibold mb-1">Starting Salary</div>
          <div className={`text-lg font-bold ${colors.text}`}>{data.averageStartingSalary}</div>
        </div>
        <div className="bg-white bg-opacity-60 p-3 rounded-lg">
          <div className="text-xs text-gray-600 font-semibold mb-1">Mid-Career Salary</div>
          <div className={`text-lg font-bold ${colors.text}`}>{data.averageMidCareerSalary}</div>
        </div>
      </div>

      <div className="bg-white bg-opacity-60 p-3 rounded-lg mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">📈</span>
          <span className="text-xs text-gray-600 font-semibold">Job Growth</span>
        </div>
        <div className="text-sm text-gray-800">{data.jobGrowthRate}</div>
        <div className="text-xs text-gray-600 mt-1">{data.outlookDescription}</div>
      </div>

      <div className="bg-white bg-opacity-60 p-3 rounded-lg mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">🏢</span>
          <span className="text-xs text-gray-600 font-semibold">Top Employers in Alberta</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.topEmployers.slice(0, 4).map((employer, i) => (
            <span key={i} className="text-xs bg-white px-2 py-1 rounded-full border border-gray-300">
              {employer}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white bg-opacity-60 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">⚡</span>
          <span className="text-xs text-gray-600 font-semibold">In-Demand Skills</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.inDemandSkills.map((skill, i) => (
            <span key={i} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full border border-indigo-300 font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}