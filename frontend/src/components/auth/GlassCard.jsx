export default function GlassCard({ children, className = "" }) {
  return (
    <div className={`glass-card auth-glass-card rounded-3xl p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}
