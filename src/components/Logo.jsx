/** Dấu triện "Dòng chảy lịch sử": một dòng sông chảy qua ấn son. */
export default function Logo({ size = 40, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="24" cy="24" r="23" fill="#8f1d1d" />
      <circle cx="24" cy="24" r="19.6" fill="none" stroke="#d4ad66" strokeWidth="0.9" opacity="0.75" />
      <path
        d="M8.5 29.5c5.5-8.5 10.5 3.5 16.5-4.5s10.5-4.5 14.5-9"
        fill="none"
        stroke="#f4ead8"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M11 35.5c5.5-5.5 10.5 2 15.5-2.5s9-3 11.5-6"
        fill="none"
        stroke="#d4ad66"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="25" cy="25" r="2.7" fill="#d4ad66" />
    </svg>
  );
}
