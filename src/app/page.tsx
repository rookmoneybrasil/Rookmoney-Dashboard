// Landing page — serves app/[locale]/page.tsx content directly.
// Locale comes from NEXT_LOCALE cookie (set by middleware), read via getRequestConfig.
export { default } from './[locale]/page'
