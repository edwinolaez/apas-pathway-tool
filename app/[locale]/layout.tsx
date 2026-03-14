import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import ConvexClientProvider from "../ConvexClientProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";

const locales = ["en", "fr", "pa", "tl", "zh", "es", "ar", "yue", "de", "vi"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params in Next.js 16
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className="antialiased">
        <ConvexClientProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </NextIntlClientProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}