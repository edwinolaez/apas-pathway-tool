"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pa", name: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "tl", name: "Tagalog", flag: "🇵🇭" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "yue", name: "粵語", flag: "🇭🇰" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
];

export default function Header() {
  const [showLanguages, setShowLanguages] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  // Extract locale from pathname
  const currentLocale = pathname.split("/")[1] || "en";

  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0];

  // Get the path without the locale prefix
  const getPathWithoutLocale = () => {
    const pathParts = pathname.split("/");
    if (pathParts.length > 2) {
      return pathParts.slice(2).join("/");
    }
    return "";
  };

  // Preserve path AND query string (e.g. ?studentId=xxx) when switching language
  const switchLanguage = (newLocale: string) => {
    const pathWithoutLocale = getPathWithoutLocale();
    const search = window.location.search;
    const newPath = `/${newLocale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ""}${search}`;
    window.location.href = newPath;
    setShowLanguages(false);
  };

  const navLinks = [
    { href: `/${currentLocale}`, label: t("home") },
    { href: `/${currentLocale}/profile`, label: t("profile") },
    { href: `/${currentLocale}/compare`, label: t("compare") },
    { href: `/${currentLocale}/recommendations`, label: t("recommendations") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={`/${currentLocale}`} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">APAS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== `/${currentLocale}` &&
                  pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Language Switcher + CTA */}
          <div className="flex items-center gap-4">

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLanguages(!showLanguages)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <span className="text-lg">{currentLanguage.flag}</span>
                <span className="hidden sm:inline">{currentLanguage.name}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showLanguages ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Language Dropdown */}
              {showLanguages && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLanguages(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          currentLocale === lang.code
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                        {currentLocale === lang.code && (
                          <svg
                            className="w-4 h-4 ml-auto text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Get Started CTA (Desktop) */}
            <Link
              href={`/${currentLocale}/profile`}
              className="hidden md:inline-flex items-center px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              {t("getStarted")}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== `/${currentLocale}` &&
                    pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href={`/${currentLocale}/profile`}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                {t("getStarted")}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}