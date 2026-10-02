/**
 * Public origin of this deployment. Single source for metadata, robots, and sitemap so a
 * hard-coded host cannot drift from the real production domain.
 */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://codecraft-dev-one.vercel.app'
).replace(/\/+$/, '')
