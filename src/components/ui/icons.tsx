import * as React from 'react';

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

function createIcon(
  displayName: string,
  paths: React.ReactNode
): React.FC<IconProps> {
  const Component: React.FC<IconProps> = ({
    size,
    width = 24,
    height = 24,
    className,
    children,
    ...props
  }) => {
    const finalWidth = size ?? width;
    const finalHeight = size ?? height;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={finalWidth}
        height={finalHeight}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {paths}
        {children}
      </svg>
    );
  };

  Component.displayName = displayName;
  return Component;
}

// 1. Gift
export const Gift = createIcon(
  'Gift',
  <>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </>
);

// 2. Sparkles
export const Sparkles = createIcon(
  'Sparkles',
  <>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </>
);

// 3. Users
export const Users = createIcon(
  'Users',
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

// 4. ShieldCheck
export const ShieldCheck = createIcon(
  'ShieldCheck',
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </>
);

// 5. Plus
export const Plus = createIcon(
  'Plus',
  <>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </>
);

// 6. Trash2
export const Trash2 = createIcon(
  'Trash2',
  <>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </>
);

// 7. RefreshCw
export const RefreshCw = createIcon(
  'RefreshCw',
  <>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </>
);

// 8. Eye
export const Eye = createIcon(
  'Eye',
  <>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

// 9. EyeOff
export const EyeOff = createIcon(
  'EyeOff',
  <>
    <path d="m15 9-6 6" />
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </>
);

// 10. CheckCircle2
export const CheckCircle2 = createIcon(
  'CheckCircle2',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </>
);

// 11. AlertTriangle
export const AlertTriangle = createIcon(
  'AlertTriangle',
  <>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </>
);

// 12. AlertCircle
export const AlertCircle = createIcon(
  'AlertCircle',
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </>
);

// 13. Calendar
export const Calendar = createIcon(
  'Calendar',
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </>
);

// 14. Mail
export const Mail = createIcon(
  'Mail',
  <>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </>
);

// 15. ArrowRight
export const ArrowRight = createIcon(
  'ArrowRight',
  <>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </>
);

// 16. ArrowLeft
export const ArrowLeft = createIcon(
  'ArrowLeft',
  <>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </>
);

// 17. Check
export const Check = createIcon(
  'Check',
  <polyline points="20 6 9 17 4 12" />
);

// 18. Menu
export const Menu = createIcon(
  'Menu',
  <>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </>
);

// 19. X
export const X = createIcon(
  'X',
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>
);

// 20. ChevronDown
export const ChevronDown = createIcon(
  'ChevronDown',
  <path d="m6 9 6 6 6-6" />
);

// 21. HelpCircle
export const HelpCircle = createIcon(
  'HelpCircle',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </>
);

// 22. Send
export const Send = createIcon(
  'Send',
  <>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </>
);

// 23. DollarSign
export const DollarSign = createIcon(
  'DollarSign',
  <>
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </>
);

// 24. MapPin
export const MapPin = createIcon(
  'MapPin',
  <>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </>
);

// 25. Heart
export const Heart = createIcon(
  'Heart',
  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
);

// 26. Copy
export const Copy = createIcon(
  'Copy',
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>
);

// 27. ExternalLink
export const ExternalLink = createIcon(
  'ExternalLink',
  <>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </>
);

// 28. Loader2
export const Loader2 = createIcon(
  'Loader2',
  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
);

// 29. Cpu
export const Cpu = createIcon(
  'Cpu',
  <>
    <rect width="16" height="16" x="4" y="4" rx="2" />
    <rect width="6" height="6" x="9" y="9" rx="1" />
    <path d="M15 2v2" />
    <path d="M15 20v2" />
    <path d="M2 15h2" />
    <path d="M2 9h2" />
    <path d="M20 15h2" />
    <path d="M20 9h2" />
    <path d="M9 2v2" />
    <path d="M9 20v2" />
  </>
);

// 30. Smartphone
export const Smartphone = createIcon(
  'Smartphone',
  <>
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </>
);

// 31. Star
export const Star = createIcon(
  'Star',
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
);
