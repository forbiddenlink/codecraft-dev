import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import { SITE_URL } from '@/lib/siteUrl'

describe('site URL metadata', () => {
  it('never points at the unrelated codecraft-dev.vercel.app host', () => {
    expect(SITE_URL).not.toContain('//codecraft-dev.vercel.app')
    expect(SITE_URL.endsWith('/')).toBe(false)
  })

  it('robots points at the sitemap on the same origin', () => {
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`)
  })

  it('sitemap lists the public routes on the same origin', () => {
    const urls = sitemap().map((e) => e.url)
    expect(urls).toEqual([
      SITE_URL,
      `${SITE_URL}/playground`,
      `${SITE_URL}/privacy`,
      `${SITE_URL}/terms`,
    ])
  })
})
