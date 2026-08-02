import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
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
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-slate-950 px-8 py-9 lg:px-12 lg:py-12">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <AuthLogo className="relative z-10" />

      <div className="relative z-10 my-8 hidden flex-1 flex-col justify-center lg:flex">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-brand-100 backdrop-blur"><Sparkles className="h-3.5 w-3.5" /> YOUR AI CAREER COMMAND CENTER</div>
        <h1 className="mt-5 max-w-lg text-3xl font-bold leading-tight tracking-tight text-white xl:text-[2.65rem]">Turn every application into your best opportunity with <span className="bg-gradient-to-r from-brand-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">AI</span>.</h1>
        <ul className="mt-8 space-y-3.5">{FEATURES.map((feature) => <li key={feature} className="flex items-start gap-3 text-slate-300"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" /><span className="text-[15px] leading-snug">{feature}</span></li>)}</ul>
        <motion.div className="mt-12" animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}><AuthIllustration /></motion.div>
      </div>

      <div className="relative z-10 hidden items-center gap-6 text-sm text-slate-500 lg:flex"><span>Trusted by 10,000+ job seekers</span><span className="h-1 w-1 rounded-full bg-slate-600" /><span>4.9★ average rating</span></div>
      <div className="relative z-10 lg:hidden"><p className="text-center text-sm font-medium text-slate-400">Land your dream job faster with AI</p></div>
    </div>
  );
}
