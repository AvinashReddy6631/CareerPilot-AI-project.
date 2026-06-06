import AuthLogo from "./AuthLogo";
import AuthIllustration from "./AuthIllustration";

const FEATURES = [
  "Build ATS-friendly resumes.",
  "Practice AI interviews.",
  "Follow personalized career roadmaps.",
  "Discover better opportunities.",
];

export default function AuthHero() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-slate-950 px-8 py-10 lg:px-12 lg:py-12">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <AuthLogo className="relative z-10" />

      <div className="relative z-10 my-8 hidden flex-1 flex-col justify-center lg:flex">
        <h1 className="max-w-md text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
          Land Your Dream Job Faster with{" "}
          <span className="bg-gradient-to-r from-brand-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
            AI
          </span>
        </h1>

        <ul className="mt-8 space-y-3.5">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-slate-300">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20">
                <svg viewBox="0 0 12 12" className="h-3 w-3 text-brand-300" fill="none">
                  <path
                    d="M2.5 6l2.5 2.5 4.5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[15px] leading-snug">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <AuthIllustration />
        </div>
      </div>

      <div className="relative z-10 hidden items-center gap-6 text-sm text-slate-500 lg:flex">
        <span>Trusted by 10,000+ job seekers</span>
        <span className="h-1 w-1 rounded-full bg-slate-600" />
        <span>4.9★ average rating</span>
      </div>

      <div className="relative z-10 lg:hidden">
        <p className="text-center text-sm font-medium text-slate-400">
          Land your dream job faster with AI
        </p>
      </div>
    </div>
  );
}
