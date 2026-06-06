import { getInitials } from "../../utils/profileCompletion";

const SOCIAL_LINKS = [
  { key: "linkedinUrl", label: "LinkedIn", icon: "in" },
  { key: "githubUrl", label: "GitHub", icon: "gh" },
  { key: "portfolioUrl", label: "Portfolio", icon: "pf" },
];

export default function ProfileHeader({ user, onEdit }) {
  const initials = getInitials(user?.name);

  return (
    <div className="dash-card relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand-500/10 to-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center sm:items-start">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="h-24 w-24 rounded-2xl object-cover shadow-xl ring-4 ring-white dark:ring-slate-800"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-2xl font-bold text-white shadow-xl shadow-brand-500/25 ring-4 ring-white dark:ring-slate-800">
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                {user?.name || "CareerPilot User"}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              {user?.targetRole && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10a1 1 0 110-2 1 1 0 010 2zm1-5a1 1 0 10-2 0v3a1 1 0 102 0V6z" />
                  </svg>
                  {user.targetRole}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            {user?.college && (
              <InfoChip icon="college" label={user.college} />
            )}
            {user?.degree && (
              <InfoChip icon="degree" label={user.degree} />
            )}
            {user?.graduationYear && (
              <InfoChip icon="year" label={`Class of ${user.graduationYear}`} />
            )}
            {user?.phone && (
              <InfoChip icon="phone" label={user.phone} />
            )}
          </div>

          {user?.skills?.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-center gap-2 sm:justify-start">
            {SOCIAL_LINKS.map(({ key, label }) => {
              const url = user?.[key];
              if (!url) return null;
              const href = url.startsWith("http") ? url : `https://${url}`;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
                >
                  {label}
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                    <path d="M4 12h8V4M12 4L4 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon, label }) {
  const icons = {
    college: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
      </svg>
    ),
    degree: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762z" />
      </svg>
    ),
    year: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
    phone: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
    ),
  };

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
      {icons[icon]}
      {label}
    </span>
  );
}
