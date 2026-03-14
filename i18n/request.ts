import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'fr', 'pa', 'tl', 'zh', 'es', 'ar', 'yue', 'de', 'vi'] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // v4 syntax: requestLocale is a Promise
  const locale = await requestLocale;

  // Validate locale
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale: locale as string,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});