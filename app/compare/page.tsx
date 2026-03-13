"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Institution {
  id: string;
  name: string;
  location: string;
  type: string;
  logo: string;
  programs: number;
  tuition: string;
  campusSize: string;
  studentPopulation: string;
  acceptanceRate: string;
  averageClassSize: string;
  onlinePrograms: boolean;
  coopPrograms: boolean;
  internationalStudents: boolean;
  housingAvailable: boolean;
  website: string;
  highlights: string[];
}

const institutions: Institution[] = [
  {
    id: "ualberta",
    name: "University of Alberta",
    location: "Edmonton",
    type: "University",
    logo: "/logos/ualberta.jpg",
    programs: 200,
    tuition: "$6,000 - $8,000/year",
    campusSize: "50+ buildings",
    studentPopulation: "40,000+",
    acceptanceRate: "58%",
    averageClassSize: "25-30 students",
    onlinePrograms: true,
    coopPrograms: true,
    internationalStudents: true,
    housingAvailable: true,
    website: "https://www.ualberta.ca",
    highlights: [
      "Top research university in Alberta",
      "Extensive co-op programs",
      "World-class facilities",
      "Strong industry connections"
    ]
  },
  {
    id: "ucalgary",
    name: "University of Calgary",
    location: "Calgary",
    type: "University",
    logo: "/logos/ucalgary.jpg",
    programs: 180,
    tuition: "$5,800 - $7,500/year",
    campusSize: "40+ buildings",
    studentPopulation: "35,000+",
    acceptanceRate: "60%",
    averageClassSize: "20-25 students",
    onlinePrograms: true,
    coopPrograms: true,
    internationalStudents: true,
    housingAvailable: true,
    website: "https://www.ucalgary.ca",
    highlights: [
      "Strong engineering programs",
      "Located in Calgary's innovation district",
      "Excellent business school",
      "Research-intensive programs"
    ]
  },
  {
    id: "sait",
    name: "SAIT",
    location: "Calgary",
    type: "Polytechnic",
    logo: "/logos/sait.png",
    programs: 100,
    tuition: "$4,500 - $6,000/year",
    campusSize: "20+ buildings",
    studentPopulation: "14,000+",
    acceptanceRate: "70%",
    averageClassSize: "15-20 students",
    onlinePrograms: true,
    coopPrograms: true,
    internationalStudents: true,
    housingAvailable: true,
    website: "https://www.sait.ca",
    highlights: [
      "Hands-on technical training",
      "Industry-focused programs",
      "High employment rate",
      "State-of-the-art labs"
    ]
  },
  {
    id: "nait",
    name: "NAIT",
    location: "Edmonton",
    type: "Polytechnic",
    logo: "/logos/nait.png",
    programs: 120,
    tuition: "$4,800 - $6,200/year",
    campusSize: "25+ buildings",
    studentPopulation: "15,000+",
    acceptanceRate: "68%",
    averageClassSize: "18-22 students",
    onlinePrograms: true,
    coopPrograms: true,
    internationalStudents: true,
    housingAvailable: true,
    website: "https://www.nait.ca",
    highlights: [
      "Applied learning focus",
      "Industry partnerships",
      "Skilled trades excellence",
      "Modern facilities"
    ]
  },
  {
    id: "mru",
    name: "Mount Royal University",
    location: "Calgary",
    type: "University",
    logo: "/logos/mru.png",
    programs: 90,
    tuition: "$5,500 - $7,000/year",
    campusSize: "15+ buildings",
    studentPopulation: "15,000+",
    acceptanceRate: "65%",
    averageClassSize: "20-25 students",
    onlinePrograms: true,
    coopPrograms: true,
    internationalStudents: true,
    housingAvailable: true,
    website: "https://www.mtroyal.ca",
    highlights: [
      "Small class sizes",
      "Teaching-focused faculty",
      "Strong community connections",
      "Undergraduate specialization"
    ]
  },
  {
    id: "ulethbridge",
    name: "University of Lethbridge",
    location: "Lethbridge",
    type: "University",
    logo: "/logos/ulethbridge.jpg",
    programs: 150,
    tuition: "$5,200 - $6,800/year",
    campusSize: "30+ buildings",
    studentPopulation: "8,500+",
    acceptanceRate: "75%",
    averageClassSize: "15-20 students",
    onlinePrograms: true,
    coopPrograms: true,
    internationalStudents: true,
    housingAvailable: true,
    website: "https://www.ulethbridge.ca",
    highlights: [
      "Liberal arts focus",
      "Research opportunities",
      "Small community feel",
      "Personalized education"
    ]
  },
  {
    id: "athabascau",
    name: "Athabasca University",
    location: "Online",
    type: "University (Online)",
    logo: "/logos/athabascau.png",
    programs: 90,
    tuition: "$4,000 - $5,500/year",
    campusSize: "Fully Online",
    studentPopulation: "40,000+",
    acceptanceRate: "Open admission",
    averageClassSize: "Online",
    onlinePrograms: true,
    coopPrograms: false,
    internationalStudents: true,
    housingAvailable: false,
    website: "https://www.athabascau.ca",
    highlights: [
      "100% online learning",
      "Flexible scheduling",
      "Self-paced programs",
      "Open admission policy"
    ]
  },
  {
    id: "lethpoly",
    name: "Lethbridge Polytechnic",
    location: "Lethbridge",
    type: "Polytechnic",
    logo: "/logos/lethpoly.jpg",
    programs: 50,
    tuition: "$4,200 - $5,800/year",
    campusSize: "10+ buildings",
    studentPopulation: "3,500+",
    acceptanceRate: "72%",
    averageClassSize: "12-18 students",
    onlinePrograms: true,
    coopPrograms: true,
    internationalStudents: true,
    housingAvailable: false,
    website: "https://lethpolytech.ca",
    highlights: [
      "Career-focused programs",
      "Industry connections",
      "Small class sizes",
      "Applied learning"
    ]
  },
  {
    id: "bowvalley",
    name: "Bow Valley College",
    location: "Calgary",
    type: "College",
    logo: "/logos/bowvalley.jpg",
    programs: 70,
    tuition: "$4,000 - $5,500/year",
    campusSize: "Downtown Campus",
    studentPopulation: "14,000+",
    acceptanceRate: "Open admission",
    averageClassSize: "15-20 students",
    onlinePrograms: true,
    coopPrograms: true,
    internationalStudents: true,
    housingAvailable: false,
    website: "https://www.bowvalleycollege.ca",
    highlights: [
      "Career training focus",
      "Flexible schedules",
      "Downtown location",
      "Diverse student body"
    ]
  },
  {
    id: "norquest",
    name: "NorQuest College",
    location: "Edmonton",
    type: "College",
    logo: "/logos/norquest.png",
    programs: 60,
    tuition: "$4,100 - $5,600/year",
    campusSize: "Multiple Campuses",
    studentPopulation: "12,000+",
    acceptanceRate: "Open admission",
    averageClassSize: "15-20 students",
    onlinePrograms: true,
    coopPrograms: true,
    internationalStudents: true,
    housingAvailable: false,
    website: "https://www.norquest.ca",
    highlights: [
      "Accessible education",
      "Health sciences focus",
      "English language training",
      "Community oriented"
    ]
  }
];

export default function ComparePage() {
  const [selectedInstitutions, setSelectedInstitutions] = useState<Institution[]>([]);
  const [availableInstitutions, setAvailableInstitutions] = useState<Institution[]>(institutions);

  const addInstitution = (institution: Institution) => {
    if (selectedInstitutions.length < 4) {
      setSelectedInstitutions([...selectedInstitutions, institution]);
      setAvailableInstitutions(availableInstitutions.filter(i => i.id !== institution.id));
    }
  };

  const removeInstitution = (institutionId: string) => {
    const removed = selectedInstitutions.find(i => i.id === institutionId);
    if (removed) {
      setSelectedInstitutions(selectedInstitutions.filter(i => i.id !== institutionId));
      setAvailableInstitutions([...availableInstitutions, removed].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Compare Institutions</h1>
          <p className="text-lg text-gray-600">Select up to 4 institutions to compare side-by-side</p>
        </div>

        {selectedInstitutions.length < 4 && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Institution ({selectedInstitutions.length}/4)</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {availableInstitutions.map((institution) => (
                <button key={institution.id} onClick={() => addInstitution(institution)} className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center group">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <Image src={institution.logo} alt={institution.name} width={64} height={64} className="object-contain" />
                  </div>
                  <div className="text-xs font-medium text-gray-800 group-hover:text-blue-600">{institution.name}</div>
                  <div className="text-xs text-gray-500">{institution.location}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedInstitutions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-48">Category</th>
                    {selectedInstitutions.map((institution) => (
                      <th key={institution.id} className="px-6 py-4 text-center border-l border-gray-200">
                        <div className="flex flex-col items-center">
                          <div className="relative w-20 h-20 mb-3">
                            <Image src={institution.logo} alt={institution.name} width={80} height={80} className="object-contain" />
                          </div>
                          <div className="text-sm font-semibold text-gray-900 mb-1">{institution.name}</div>
                          <div className="text-xs text-gray-500 mb-2">{institution.location}</div>
                          <button onClick={() => removeInstitution(institution.id)} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Institution Type</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center text-sm text-gray-700 border-l border-gray-200">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{institution.type}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Number of Programs</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center text-sm text-gray-700 border-l border-gray-200">{institution.programs}+ programs</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Tuition Range</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center text-sm text-gray-700 border-l border-gray-200">{institution.tuition}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Student Population</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center text-sm text-gray-700 border-l border-gray-200">{institution.studentPopulation}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Acceptance Rate</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center text-sm text-gray-700 border-l border-gray-200">{institution.acceptanceRate}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Average Class Size</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center text-sm text-gray-700 border-l border-gray-200">{institution.averageClassSize}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Campus Size</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center text-sm text-gray-700 border-l border-gray-200">{institution.campusSize}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Online Programs</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center border-l border-gray-200">
                        {institution.onlinePrograms ? <span className="text-green-600">✓</span> : <span className="text-gray-400">—</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Co-op Programs</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center border-l border-gray-200">
                        {institution.coopPrograms ? <span className="text-green-600">✓</span> : <span className="text-gray-400">—</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">International Students</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center border-l border-gray-200">
                        {institution.internationalStudents ? <span className="text-green-600">✓</span> : <span className="text-gray-400">—</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">On-Campus Housing</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center border-l border-gray-200">
                        {institution.housingAvailable ? <span className="text-green-600">✓</span> : <span className="text-gray-400">—</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Key Highlights</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-left text-sm text-gray-700 border-l border-gray-200">
                        <ul className="space-y-1">
                          {institution.highlights.map((highlight, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-blue-600 mr-2">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Website</td>
                    {selectedInstitutions.map((institution) => (
                      <td key={institution.id} className="px-6 py-4 text-center border-l border-gray-200">
                        <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Visit Website
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Institutions Selected</h3>
            <p className="text-gray-600">Select institutions above to start comparing</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}