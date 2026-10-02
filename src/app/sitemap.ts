import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/siteUrl'

const ROUTES = ['/', '/playground', '/privacy', '/terms'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: route === '/' ? SITE_URL : `${SITE_URL}${route}`,
  }))
}
