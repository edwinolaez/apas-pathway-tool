import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const partners = [
    { name: "University of Alberta", logo: "/logos/ualberta.jpg" },
    { name: "University of Calgary", logo: "/logos/ucalgary.jpg" },
    { name: "SAIT", logo: "/logos/sait.png" },
    { name: "NAIT", logo: "/logos/nait.png" },
    { name: "Mount Royal University", logo: "/logos/mru.png" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Partner Logos Section */}
      <div className="border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600 mb-4">Partnering with Alberta's leading institutions</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {partners.map((partner, i) => (
              <div key={i} className="relative w-16 h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">About APAS</h3>
            <p className="text-sm text-gray-600">
              AI-powered program recommendations to help Alberta students find their perfect post-secondary path.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Get Recommendations
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.alberta.ca" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Alberta.ca
                </a>
              </li>
              <li>
                <a href="https://applyalberta.ca" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  ApplyAlberta
                </a>
              </li>
              <li>
                <a href="https://studentaid.alberta.ca" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Student Aid Alberta
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Capstone Project 2026</li>
              <li>Demo: April 17, 2026</li>
              <li className="text-xs text-gray-500 mt-4">
                Powered by Claude AI & Convex
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
            <p>&copy; 2026 APAS - Alberta Post-Secondary Advisory System. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <span className="text-gray-400">•</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}