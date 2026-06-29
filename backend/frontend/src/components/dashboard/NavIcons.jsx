const iconClass = "h-[18px] w-[18px] shrink-0";

export function IconDashboard({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" />
    </svg>
  );
}

export function IconResume({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 3.5h7l3.5 3.5V16.5H5V3.5z" strokeLinejoin="round" />
      <path d="M12 3.5V7h3.5" strokeLinejoin="round" />
      <path d="M7.5 10h5M7.5 13h5" strokeLinecap="round" />
    </svg>
  );
}

export function IconATS({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 16l4-6 3 3 3-5 4 8H3z" strokeLinejoin="round" />
      <circle cx="14" cy="6" r="2.5" />
    </svg>
  );
}

export function IconInterview({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="14" height="10" rx="2" />
      <path d="M7 9h6M7 12h4" strokeLinecap="round" />
    </svg>
  );
}

export function IconMock({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="8" r="3" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <circle cx="15" cy="5" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconRoadmap({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4v12M4 4h8l-2 3 2 3H4" strokeLinejoin="round" />
      <circle cx="15" cy="10" r="2" />
    </svg>
  );
}

export function IconJobs({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="7" width="14" height="10" rx="2" />
      <path d="M7 7V5.5a2 2 0 012-2h2a2 2 0 012 2V7" />
      <path d="M3 11h14" />
    </svg>
  );
}

export function IconApplications({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h12v12H4V4z" strokeLinejoin="round" />
      <path d="M7 8h6M7 11h6M7 14h4" strokeLinecap="round" />
    </svg>
  );
}

export function IconProfile({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
    </svg>
  );
}

export function IconSearch({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="9" r="5" />
      <path d="M13.5 13.5L17 17" strokeLinecap="round" />
    </svg>
  );
}

export function IconBell({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 3a4 4 0 00-4 4v2.5L4 12.5h12l-2-3V7a4 4 0 00-4-4z" strokeLinejoin="round" />
      <path d="M8 14.5a2 2 0 004 0" strokeLinecap="round" />
    </svg>
  );
}

export function IconSun({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconMoon({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15.5 11.5a5.5 5.5 0 01-7-7 5.5 5.5 0 107 7z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMenu({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
    </svg>
  );
}

export function IconChevron({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
