// Labour Market Data - Enhanced program cards with employment info
// This adds realistic salary ranges and job outlook data to recommendations

export interface LabourMarketData {
  occupation: string;
  averageStartingSalary: string;
  averageMidCareerSalary: string;
  employmentOutlook: "Excellent" | "Good" | "Fair" | "Limited";
  outlookDescription: string;
  topEmployers: string[];
  inDemandSkills: string[];
  jobGrowthRate: string;
}

// Alberta labour market data mapping (based on common career paths)
export const LABOUR_MARKET_DATABASE: Record<string, LabourMarketData> = {
  // Technology & Software
  "software": {
    occupation: "Software Developers and Programmers",
    averageStartingSalary: "$65,000 - $75,000",
    averageMidCareerSalary: "$95,000 - $120,000",
    employmentOutlook: "Excellent",
    outlookDescription: "Strong demand across Alberta, particularly in Calgary and Edmonton tech hubs",
    topEmployers: ["Benevity", "Jobber", "Infosys", "IBM Canada", "Mphasis"],
    inDemandSkills: ["Cloud Computing", "Full-Stack Development", "AI/ML", "Cybersecurity"],
    jobGrowthRate: "+15% over next 5 years"
  },
  
  "computer": {
    occupation: "Computer and Information Systems Professionals",
    averageStartingSalary: "$60,000 - $72,000",
    averageMidCareerSalary: "$90,000 - $115,000",
    employmentOutlook: "Excellent",
    outlookDescription: "Consistent growth in IT sector with increasing digitalization",
    topEmployers: ["Suncor", "TC Energy", "ATB Financial", "Shaw Communications"],
    inDemandSkills: ["Cloud Infrastructure", "Data Analytics", "IT Security", "Network Administration"],
    jobGrowthRate: "+12% over next 5 years"
  },

  // Business & Management
  "business administration": {
    occupation: "Business Administrators and Managers",
    averageStartingSalary: "$55,000 - $65,000",
    averageMidCareerSalary: "$85,000 - $110,000",
    employmentOutlook: "Good",
    outlookDescription: "Steady demand across all industries in Alberta",
    topEmployers: ["Enbridge", "ATCO", "Canadian Pacific Railway", "WestJet"],
    inDemandSkills: ["Strategic Planning", "Financial Management", "Team Leadership", "Project Management"],
    jobGrowthRate: "+8% over next 5 years"
  },

  "accounting": {
    occupation: "Accountants and Financial Analysts",
    averageStartingSalary: "$52,000 - $62,000",
    averageMidCareerSalary: "$80,000 - $95,000",
    employmentOutlook: "Good",
    outlookDescription: "Consistent demand, especially for CPAs and financial analysts",
    topEmployers: ["Deloitte", "PwC", "KPMG", "EY", "MNP"],
    inDemandSkills: ["Financial Reporting", "Tax Planning", "Audit", "Data Analytics"],
    jobGrowthRate: "+7% over next 5 years"
  },

  "human resource": {
    occupation: "Human Resources Professionals",
    averageStartingSalary: "$50,000 - $60,000",
    averageMidCareerSalary: "$75,000 - $90,000",
    employmentOutlook: "Good",
    outlookDescription: "Growing demand for HR specialists and talent acquisition",
    topEmployers: ["AHS", "City of Calgary", "City of Edmonton", "Universities"],
    inDemandSkills: ["Talent Management", "Employee Relations", "Compensation & Benefits", "HRIS"],
    jobGrowthRate: "+9% over next 5 years"
  },

  // Engineering & Technology
  "engineering": {
    occupation: "Professional Engineers",
    averageStartingSalary: "$70,000 - $80,000",
    averageMidCareerSalary: "$100,000 - $130,000",
    employmentOutlook: "Excellent",
    outlookDescription: "Strong demand in energy, infrastructure, and technology sectors",
    topEmployers: ["Suncor", "Imperial Oil", "Stantec", "AECOM", "WSP"],
    inDemandSkills: ["AutoCAD", "Project Management", "Sustainability Design", "Data Analysis"],
    jobGrowthRate: "+11% over next 5 years"
  },

  "civil": {
    occupation: "Civil Engineers",
    averageStartingSalary: "$68,000 - $78,000",
    averageMidCareerSalary: "$95,000 - $120,000",
    employmentOutlook: "Excellent",
    outlookDescription: "Infrastructure projects and urban development driving demand",
    topEmployers: ["City of Calgary", "City of Edmonton", "Stantec", "ISL Engineering"],
    inDemandSkills: ["Structural Design", "Transportation Planning", "Environmental Engineering", "BIM"],
    jobGrowthRate: "+10% over next 5 years"
  },

  "electrical": {
    occupation: "Electrical and Electronics Engineers",
    averageStartingSalary: "$72,000 - $82,000",
    averageMidCareerSalary: "$100,000 - $125,000",
    employmentOutlook: "Excellent",
    outlookDescription: "Renewable energy transition creating new opportunities",
    topEmployers: ["EPCOR", "AltaLink", "ATCO Electric", "SaskPower"],
    inDemandSkills: ["Power Systems", "Renewable Energy", "Automation", "Control Systems"],
    jobGrowthRate: "+13% over next 5 years"
  },

  // Healthcare
  "nursing": {
    occupation: "Registered Nurses",
    averageStartingSalary: "$68,000 - $75,000",
    averageMidCareerSalary: "$85,000 - $100,000",
    employmentOutlook: "Excellent",
    outlookDescription: "Critical shortage of nurses across Alberta healthcare system",
    topEmployers: ["Alberta Health Services", "Covenant Health", "Private Clinics"],
    inDemandSkills: ["Critical Care", "Emergency Medicine", "Mental Health", "Geriatrics"],
    jobGrowthRate: "+14% over next 5 years"
  },

  // Trades & Technology
  "construction": {
    occupation: "Construction Managers and Supervisors",
    averageStartingSalary: "$58,000 - $68,000",
    averageMidCareerSalary: "$85,000 - $105,000",
    employmentOutlook: "Good",
    outlookDescription: "Residential and commercial construction projects ongoing",
    topEmployers: ["PCL Construction", "Stuart Olson", "Graham Construction", "Bird Construction"],
    inDemandSkills: ["Project Scheduling", "Cost Estimation", "Safety Management", "Building Codes"],
    jobGrowthRate: "+8% over next 5 years"
  },

  // Default for other programs
  "general": {
    occupation: "Various Career Paths",
    averageStartingSalary: "$45,000 - $55,000",
    averageMidCareerSalary: "$65,000 - $85,000",
    employmentOutlook: "Good",
    outlookDescription: "Multiple career opportunities across Alberta",
    topEmployers: ["Various public and private sector employers"],
    inDemandSkills: ["Communication", "Problem Solving", "Teamwork", "Digital Literacy"],
    jobGrowthRate: "+6% over next 5 years"
  }
};

// Helper function to get labour market data for a program
export function getLabourMarketData(programName: string, careerPaths?: string[]): LabourMarketData {
  const name = programName.toLowerCase();
  
  // Match based on program name
  if (name.includes('software') || name.includes('computing')) {
    return LABOUR_MARKET_DATABASE['software'];
  }
  if (name.includes('computer') || name.includes('information systems') || name.includes('information technology')) {
    return LABOUR_MARKET_DATABASE['computer'];
  }
  if (name.includes('business administration')) {
    return LABOUR_MARKET_DATABASE['business administration'];
  }
  if (name.includes('accounting')) {
    return LABOUR_MARKET_DATABASE['accounting'];
  }
  if (name.includes('human resource')) {
    return LABOUR_MARKET_DATABASE['human resource'];
  }
  if (name.includes('civil engineering') || name.includes('civil')) {
    return LABOUR_MARKET_DATABASE['civil'];
  }
  if (name.includes('electrical engineering') || name.includes('electrical')) {
    return LABOUR_MARKET_DATABASE['electrical'];
  }
  if (name.includes('engineering')) {
    return LABOUR_MARKET_DATABASE['engineering'];
  }
  if (name.includes('nursing') || name.includes('nurse')) {
    return LABOUR_MARKET_DATABASE['nursing'];
  }
  if (name.includes('construction')) {
    return LABOUR_MARKET_DATABASE['construction'];
  }

  // Match based on career paths if provided
  if (careerPaths && careerPaths.length > 0) {
    const careerText = careerPaths.join(' ').toLowerCase();
    
    if (careerText.includes('software') || careerText.includes('developer')) {
      return LABOUR_MARKET_DATABASE['software'];
    }
    if (careerText.includes('accountant')) {
      return LABOUR_MARKET_DATABASE['accounting'];
    }
    if (careerText.includes('engineer')) {
      return LABOUR_MARKET_DATABASE['engineering'];
    }
    if (careerText.includes('nurse')) {
      return LABOUR_MARKET_DATABASE['nursing'];
    }
  }

  // Default
  return LABOUR_MARKET_DATABASE['general'];
}