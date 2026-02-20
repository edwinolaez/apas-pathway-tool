"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function TestDataPage() {
  // We call our inventory checker here
  const programs = useQuery(api.programs.getAllPrograms);

  // 1. Loading State (The 'Please Wait' sign)
  if (programs === undefined) {
    return <div className="p-10 font-sans">Checking the database...</div>;
  }

  // 2. Empty State (The 'Out of Stock' sign)
  if (programs.length === 0) {
    return <div className="p-10 font-sans text-red-500">Database is empty. Check your upload!</div>;
  }

  // 3. Success State (The 'Open for Business' view)
  return (
    <main className="p-10 font-sans">
      <h1 className="text-2xl font-bold text-[#00AAD2] mb-6">APAS Data Verification</h1>
      <p className="mb-4 text-gray-600">Total Programs Found: <strong>{programs.length}</strong></p>
      
      <div className="grid gap-4">
        {programs.map((program) => (
          <div key={program._id} className="p-4 border rounded shadow-sm bg-white">
            <h2 className="font-bold text-[#5F6A72]">{program.name}</h2>
            <p className="text-sm text-gray-500">{program.institutionId}</p>
          </div>
        ))}
      </div>
    </main>
  );
}