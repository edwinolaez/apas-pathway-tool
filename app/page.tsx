"use client";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const stats = [
    { number: "106", label: "Programs Available" },
    { number: "10", label: "Partner Institutions" },
    { number: "10", label: "Personalized Matches" },
    { number: "AI", label: "Powered" },
  ];

  const partners = [
    { name: "University of Alberta", location: "Edmonton", logo: "/logos/ualberta.jpg" },
    { name: "University of Calgary", location: "Calgary", logo: "/logos/ucalgary.jpg" },
    { name: "University of Lethbridge", location: "Lethbridge", logo: "/logos/ulethbridge.jpg" },
    { name: "Mount Royal University", location: "Calgary", logo: "/logos/mru.png" },
    { name: "Athabasca University", location: "Online", logo: "/logos/athabascau.png" },
    { name: "SAIT", location: "Calgary", logo: "/logos/sait.png" },
    { name: "NAIT", location: "Edmonton", logo: "/logos/nait.png" },
    { name: "Lethbridge Polytechnic", location: "Lethbridge", logo: "/logos/lethpoly.jpg" },
    { name: "Bow Valley College", location: "Calgary", logo: "/logos/bowvalley.jpg" },
    { name: "NorQuest College", location: "Edmonton", logo: "/logos/norquest.png" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">Find Your Perfect Alberta Post-Secondary Program</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">AI-powered recommendations to match you with the right program at the right institution</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-700 bg-white rounded-lg hover:bg-blue-50 transition-all shadow-lg">Get Started</Link>
              <a href="#partners" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-800 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all border-2 border-white border-opacity-30">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Partner Institutions</h2>
            <p className="text-xl text-gray-600">10 trusted Alberta post-secondary institutions</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {partners.map((partner, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
                    <Image src={partner.logo} alt={partner.name} width={96} height={96} className="object-contain" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">{partner.name}</div>
                  <div className="text-xs text-gray-500">{partner.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Program?</h2>
          <p className="text-xl mb-8 text-blue-100">Start your journey today with AI-powered recommendations</p>
          <Link href="/profile" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-700 bg-white rounded-lg hover:bg-blue-50 transition-all shadow-lg">Create Your Profile</Link>
        </div>
      </section>
    </div>
  );
}