import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'CodeCraft: Galactic Developer — build a space colony by writing real code'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 72,
        background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)',
        color: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 4, color: '#a5b4fc', marginBottom: 16 }}>
        CODECRAFT
      </div>
      <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
        Galactic Developer
      </div>
      <div style={{ fontSize: 28, color: '#cbd5e1', marginTop: 24, maxWidth: 800 }}>
        Build a space colony by writing real HTML, CSS, and JavaScript.
      </div>
    </div>,
    { ...size }
  )
}
