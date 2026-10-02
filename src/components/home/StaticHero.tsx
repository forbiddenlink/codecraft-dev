// Server-rendered first paint: a CSS-only poster of the colony sky plus the title, so the
// Largest Contentful Paint never waits for React, Redux or three.js to load. The text fades
// out once the interactive app has mounted (see HomeClient); the poster stays behind the HUD
// until the 3D scene covers it.
export function StaticHero() {
  return (
    <div
      aria-hidden="true"
      className="static-hero pointer-events-none fixed inset-0 flex items-center justify-center bg-[#0f172a] px-6"
    >
      <div className="static-hero-text max-w-xl text-center transition-opacity duration-500">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
          Planet Codex-7
        </p>
        <p className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          CodeCraft: Galactic Developer
        </p>
        <p className="text-base leading-relaxed text-white/70">
          Build a galactic colony by writing real HTML, CSS, and JavaScript.
        </p>
      </div>
    </div>
  )
}
