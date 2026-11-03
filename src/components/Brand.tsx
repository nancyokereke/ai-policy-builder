interface BrandProps {
  onClick?: () => void;
  compact?: boolean;
}

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="35"
      height="38"
      viewBox="0 0 35 38"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 11.5 17.5 4 31 11.5 17.5 19 4 11.5Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="m4 19 13.5 7.5L31 19M4 26.5l13.5 7.5L31 26.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Brand({ onClick, compact = false }: BrandProps) {
  return (
    <button
      type="button"
      className={`brand ${compact ? "brand-compact" : ""}`}
      onClick={onClick}
      aria-label="AI Policy Builder home"
    >
      <BrandMark />
      <span>
        AI Policy Builder<span className="brand-period">.</span>
      </span>
    </button>
  );
}
