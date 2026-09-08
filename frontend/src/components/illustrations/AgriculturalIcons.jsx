export function OliveLogo({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <circle cx="40" cy="40" r="38" fill="#1C2414" stroke="#5F7B46" strokeWidth="2" />
      <ellipse cx="30" cy="34" rx="10" ry="14" fill="#5F7B46" transform="rotate(-20 30 34)" />
      <ellipse cx="50" cy="32" rx="9" ry="13" fill="#7E9D61" transform="rotate(18 50 32)" />
      <circle cx="40" cy="44" r="7" fill="#7E5132" />
      <circle cx="40" cy="44" r="3" fill="#D49312" />
      <path d="M40 51 C43 58 48 63 54 66" stroke="#E5A620" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function WeighScaleGraphic({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="28" y="8" width="8" height="36" rx="2" fill="#7E9D61" />
      <rect x="12" y="44" width="40" height="8" rx="2" fill="#4B6038" />
      <path d="M8 28 H56" stroke="#D49312" strokeWidth="3" />
      <rect x="6" y="28" width="16" height="10" rx="2" fill="#643F25" />
      <rect x="42" y="28" width="16" height="10" rx="2" fill="#643F25" />
    </svg>
  );
}

export function TractorIcon({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="8" y="28" width="28" height="14" rx="3" fill="#5F7B46" />
      <rect x="36" y="32" width="18" height="10" rx="2" fill="#7E5132" />
      <circle cx="18" cy="48" r="8" fill="#28341E" stroke="#D49312" strokeWidth="2" />
      <circle cx="48" cy="48" r="6" fill="#28341E" stroke="#D49312" strokeWidth="2" />
      <rect x="12" y="18" width="12" height="10" rx="2" fill="#7E9D61" />
    </svg>
  );
}

export function TruckIcon({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="6" y="24" width="32" height="18" rx="3" fill="#4B6038" />
      <path d="M38 30 H54 L58 40 V42 H38 Z" fill="#D49312" />
      <circle cx="18" cy="48" r="6" fill="#1C2414" stroke="#E5A620" strokeWidth="2" />
      <circle cx="48" cy="48" r="6" fill="#1C2414" stroke="#E5A620" strokeWidth="2" />
    </svg>
  );
}
