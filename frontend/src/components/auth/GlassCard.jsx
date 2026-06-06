export default function GlassCard({ children, className = "" }) {
  return (
    <div className={`glass-card rounded-2xl p-7 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}
