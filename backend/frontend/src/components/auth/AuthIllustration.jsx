export default function AuthIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-lg" aria-hidden="true">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-500/20 to-violet-500/10 blur-2xl" />

      <svg
        viewBox="0 0 480 400"
        fill="none"
        className="relative w-full drop-shadow-2xl"
      >
        <rect
          x="40"
          y="60"
          width="400"
          height="280"
          rx="20"
          fill="url(#panelGrad)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />

        <rect x="60" y="85" width="120" height="14" rx="7" fill="rgba(255,255,255,0.9)" />
        <rect x="60" y="110" width="80" height="8" rx="4" fill="rgba(255,255,255,0.35)" />
        <rect x="60" y="130" width="160" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
        <rect x="60" y="148" width="140" height="6" rx="3" fill="rgba(255,255,255,0.2)" />

        <rect x="60" y="180" width="100" height="28" rx="8" fill="url(#btnGrad)" />
        <rect x="60" y="225" width="70" height="6" rx="3" fill="rgba(255,255,255,0.25)" />
        <rect x="60" y="240" width="90" height="6" rx="3" fill="rgba(255,255,255,0.2)" />

        <g transform="translate(250, 80)">
          <circle cx="90" cy="90" r="70" fill="rgba(99,102,241,0.15)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx="90" cy="90" r="50" fill="none" stroke="url(#ringGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray="220 80" />
          <text x="90" y="98" textAnchor="middle" fill="white" fontSize="28" fontWeight="700" fontFamily="Inter, sans-serif">
            92%
          </text>
          <text x="90" y="118" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Inter, sans-serif">
            ATS Score
          </text>
        </g>

        <g transform="translate(280, 250)">
          <rect x="0" y="0" width="140" height="70" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" />
          <circle cx="24" cy="24" r="10" fill="url(#avatarGrad)" />
          <rect x="44" y="16" width="70" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
          <rect x="44" y="28" width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.25)" />
          <rect x="12" y="44" width="116" height="5" rx="2.5" fill="rgba(255,255,255,0.15)" />
          <rect x="12" y="56" width="90" height="5" rx="2.5" fill="rgba(255,255,255,0.1)" />
        </g>

        <g transform="translate(55, 290)">
          <rect x="0" y="0" width="36" height="36" rx="10" fill="rgba(139,92,246,0.3)" stroke="rgba(255,255,255,0.15)" />
          <path d="M10 22l6-8 5 6 8-10 6 12H4z" fill="rgba(255,255,255,0.7)" />
        </g>

        <g transform="translate(200, 30)">
          <rect x="0" y="0" width="160" height="44" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
          <circle cx="22" cy="22" r="8" fill="#22c55e" opacity="0.9" />
          <rect x="38" y="14" width="90" height="6" rx="3" fill="rgba(255,255,255,0.6)" />
          <rect x="38" y="26" width="60" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" />
        </g>

        <circle cx="420" cy="50" r="6" fill="#818cf8" opacity="0.6" />
        <circle cx="30" cy="180" r="4" fill="#a78bfa" opacity="0.5" />
        <circle cx="450" cy="300" r="5" fill="#6366f1" opacity="0.4" />

        <defs>
          <linearGradient id="panelGrad" x1="40" y1="60" x2="440" y2="340">
            <stop stopColor="rgba(30,27,75,0.9)" />
            <stop offset="1" stopColor="rgba(49,46,129,0.85)" />
          </linearGradient>
          <linearGradient id="btnGrad" x1="60" y1="180" x2="160" y2="208">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="180" y2="180">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="avatarGrad" x1="14" y1="14" x2="34" y2="34">
            <stop stopColor="#818cf8" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
