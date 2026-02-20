import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            APAS Program Matcher
          </h1>
          <p className="text-xl text-gray-600">
            Find Your Perfect Alberta Post-Secondary Program
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
              <p className="text-gray-600">AI-Powered Recommendations Ready</p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
              ✓ Online
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Student Profile Card */}
          <Link href="/profile">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                Create Your Profile
              </h3>
              <p className="text-gray-600 mb-4">
                Tell us about your academic background, interests, and career goals
              </p>
              <div className="flex items-center text-blue-600 font-semibold">
                Get Started →
              </div>
            </div>
          </Link>

          {/* View Programs Card */}
          <Link href="/test">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                Browse Programs
              </h3>
              <p className="text-gray-600 mb-4">
                Explore 53 programs from 5 Alberta institutions
              </p>
              <div className="flex items-center text-blue-600 font-semibold">
                View All Programs →
              </div>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Available Data</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">53</div>
              <div className="text-sm text-gray-600">Programs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">5</div>
              <div className="text-sm text-gray-600">Institutions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">AI</div>
              <div className="text-sm text-gray-600">Powered</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Alberta Post-Secondary Pathway System v1.0</p>
          <p className="mt-1">Powered by Claude AI</p>
        </div>
      </div>
    </main>
  );
}