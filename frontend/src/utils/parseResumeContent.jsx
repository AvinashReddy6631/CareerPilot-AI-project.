export function parseLines(content) {
  if (!content?.trim()) return [];
  return content.split("\n").map((l) => l.trim()).filter(Boolean);
}

export function isBulletLine(line) {
  return /^[•\-*]\s/.test(line);
}

export function isHeaderLine(line) {
  return (
    !isBulletLine(line) &&
    (line.includes("—") || line.includes("|") || /\(\d{4}/.test(line) || /–/.test(line))
  );
}

export function BulletList({ lines, className = "" }) {
  const bullets = lines.filter((l) => isBulletLine(l) || (!isHeaderLine(l) && l.length > 0));

  if (bullets.length === 0) return null;

  return (
    <ul className={`space-y-1 ${className}`}>
      {bullets.map((line, i) => {
        const text = line.replace(/^[•\-*]\s*/, "");
        return (
          <li key={i} className="flex gap-2 text-[11px] leading-relaxed text-slate-700">
            <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
            <span>{text}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function ContentBlock({ content, bulletClass = "" }) {
  if (!content?.trim()) return null;

  const lines = parseLines(content);
  const groups = [];
  let current = { header: null, bullets: [], prose: [] };

  lines.forEach((line) => {
    if (isHeaderLine(line)) {
      if (current.header || current.bullets.length || current.prose.length) {
        groups.push(current);
      }
      current = { header: line, bullets: [], prose: [] };
    } else if (isBulletLine(line)) {
      current.bullets.push(line);
    } else {
      current.prose.push(line);
    }
  });
  groups.push(current);

  return (
    <div className="space-y-3">
      {groups.map((g, i) => (
        <div key={i}>
          {g.header && (
            <p className="text-[11px] font-semibold text-slate-900">{g.header}</p>
          )}
          {g.prose.map((p, j) => (
            <p key={j} className="text-[11px] leading-relaxed text-slate-700">
              {p}
            </p>
          ))}
          <BulletList lines={g.bullets} className={bulletClass} />
        </div>
      ))}
    </div>
  );
}

export function PreviewSection({ title, content, variant = "default", children }) {
  if (!content?.trim() && !children) return null;

  const titleStyles = {
    default:
      "mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-800",
    professional:
      "mb-2.5 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-brand-800 font-serif",
    modern:
      "mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-violet-600",
    minimal:
      "mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500",
    executive:
      "mb-2 border-l-2 border-amber-500 pl-2 text-[10px] font-bold uppercase tracking-widest text-slate-900",
  };

  return (
    <section className="mb-5 last:mb-0">
      <h3 className={titleStyles[variant]}>
        {variant === "default" && (
          <span className="h-px flex-1 bg-slate-200" />
        )}
        <span>{title}</span>
        {variant === "default" && (
          <span className="h-px flex-1 bg-slate-200" />
        )}
      </h3>
      {children || <ContentBlock content={content} />}
    </section>
  );
}
