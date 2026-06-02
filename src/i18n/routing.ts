import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales:       ['pt', 'en', 'es'],
  defaultLocale: 'pt',
  // Default locale (pt) has no prefix — existing Brazilian users keep their URLs
  localePrefix:  'as-needed',
})
