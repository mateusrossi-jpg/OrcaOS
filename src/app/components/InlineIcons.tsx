import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

type IconName =
  | 'badgeInfo'
  | 'bolt'
  | 'briefcase'
  | 'cable'
  | 'calculator'
  | 'clipboardCheck'
  | 'clipboardList'
  | 'clipboardPen'
  | 'cog'
  | 'factory'
  | 'fileSearch'
  | 'fileText'
  | 'gem'
  | 'history'
  | 'house'
  | 'lightbulb'
  | 'packageSearch'
  | 'plugZap'
  | 'receiptText'
  | 'rotateCcw'
  | 'settings'
  | 'shoppingBag'
  | 'snowflake'
  | 'sparkles'
  | 'users'
  | 'wrench';

function Icon({ name, size = 22, strokeWidth = 2.2, ...props }: IconProps & { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {name === 'badgeInfo' && <><circle cx="12" cy="12" r="9" /><path d="M12 10v6" /><path d="M12 7.5h.01" /></>}
      {name === 'bolt' && <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />}
      {name === 'briefcase' && <><path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" /><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 12h18" /><path d="M10 12v2h4v-2" /></>}
      {name === 'cable' && <><path d="M7 7 5 5" /><path d="m17 17 2 2" /><path d="M8 8a5 5 0 0 0 0 7l1 1a5 5 0 0 0 7 0" /><path d="m14 6 4 4" /><path d="m10 10 4 4" /><path d="M15 5 5 15" /></>}
      {name === 'calculator' && <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8" /><path d="M8 11h.01" /><path d="M12 11h.01" /><path d="M16 11h.01" /><path d="M8 15h.01" /><path d="M12 15h.01" /><path d="M16 15h.01" /></>}
      {name === 'clipboardCheck' && <><path d="M9 4h6" /><path d="M9 4a3 3 0 0 1 6 0" /><rect x="5" y="5" width="14" height="16" rx="2" /><path d="m9 14 2 2 4-5" /></>}
      {name === 'clipboardList' && <><path d="M9 4h6" /><path d="M9 4a3 3 0 0 1 6 0" /><rect x="5" y="5" width="14" height="16" rx="2" /><path d="M9 12h6" /><path d="M9 16h6" /></>}
      {name === 'clipboardPen' && <><path d="M9 4h6" /><path d="M9 4a3 3 0 0 1 6 0" /><path d="M10 21H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" /><path d="M14 20l5-5 2 2-5 5h-2v-2Z" /></>}
      {name === 'cog' && <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5h.1a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z" /></>}
      {name === 'factory' && <><path d="M3 21h18" /><path d="M4 21V9l5 3V9l5 3V5h6v16" /><path d="M8 17h.01" /><path d="M12 17h.01" /><path d="M16 17h.01" /></>}
      {name === 'fileSearch' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6" /><path d="M14 2v6h6" /><path d="M20 8v4" /><circle cx="16" cy="17" r="3" /><path d="m21 22-2.2-2.2" /></>}
      {name === 'fileText' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h6" /></>}
      {name === 'gem' && <><path d="M6 3h12l4 6-10 12L2 9l4-6Z" /><path d="M2 9h20" /><path d="m8 9 4 12 4-12" /></>}
      {name === 'history' && <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 7v5l3 2" /></>}
      {name === 'house' && <><path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>}
      {name === 'lightbulb' && <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12c.7.6 1 1.4 1 2h6c0-.6.3-1.4 1-2a7 7 0 0 0-4-12Z" /></>}
      {name === 'packageSearch' && <><path d="m21 16-4.5-2.6" /><path d="M3.3 7 12 12l8.7-5" /><path d="M12 22V12" /><path d="M21 12V7l-9-5-9 5v10l9 5 2.5-1.4" /><circle cx="18" cy="18" r="3" /><path d="m22 22-1.8-1.8" /></>}
      {name === 'plugZap' && <><path d="M13 2 8 12h6l-3 10 7-12h-6l1-8Z" /><path d="M5 8v4" /><path d="M8 8H4a2 2 0 0 0-2 2v2" /><path d="M6 16v2" /></>}
      {name === 'receiptText' && <><path d="M5 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M8 7h8" /><path d="M8 11h8" /><path d="M8 15h5" /></>}
      {name === 'rotateCcw' && <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></>}
      {name === 'settings' && <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5h.1a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z" /></>}
      {name === 'shoppingBag' && <><path d="M6 8h12l-1 13H7L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>}
      {name === 'snowflake' && <><path d="M12 2v20" /><path d="m17 4-5 5-5-5" /><path d="m17 20-5-5-5 5" /><path d="M2 12h20" /><path d="m4 7 5 5-5 5" /><path d="m20 7-5 5 5 5" /></>}
      {name === 'sparkles' && <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /><path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" /></>}
      {name === 'users' && <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></>}
      {name === 'wrench' && <><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5L15 12l-3-3 2.7-2.7Z" /></>}
    </svg>
  );
}

export function BadgeInfo(props: IconProps) { return <Icon name="badgeInfo" {...props} />; }
export function Bolt(props: IconProps) { return <Icon name="bolt" {...props} />; }
export function BriefcaseBusiness(props: IconProps) { return <Icon name="briefcase" {...props} />; }
export function Cable(props: IconProps) { return <Icon name="cable" {...props} />; }
export function Calculator(props: IconProps) { return <Icon name="calculator" {...props} />; }
export function ClipboardCheck(props: IconProps) { return <Icon name="clipboardCheck" {...props} />; }
export function ClipboardList(props: IconProps) { return <Icon name="clipboardList" {...props} />; }
export function ClipboardPenLine(props: IconProps) { return <Icon name="clipboardPen" {...props} />; }
export function Cog(props: IconProps) { return <Icon name="cog" {...props} />; }
export function Factory(props: IconProps) { return <Icon name="factory" {...props} />; }
export function FileSearch(props: IconProps) { return <Icon name="fileSearch" {...props} />; }
export function FileText(props: IconProps) { return <Icon name="fileText" {...props} />; }
export function Gem(props: IconProps) { return <Icon name="gem" {...props} />; }
export function History(props: IconProps) { return <Icon name="history" {...props} />; }
export function House(props: IconProps) { return <Icon name="house" {...props} />; }
export function Lightbulb(props: IconProps) { return <Icon name="lightbulb" {...props} />; }
export function PackageSearch(props: IconProps) { return <Icon name="packageSearch" {...props} />; }
export function PlugZap(props: IconProps) { return <Icon name="plugZap" {...props} />; }
export function ReceiptText(props: IconProps) { return <Icon name="receiptText" {...props} />; }
export function RotateCcw(props: IconProps) { return <Icon name="rotateCcw" {...props} />; }
export function Settings(props: IconProps) { return <Icon name="settings" {...props} />; }
export function ShoppingBag(props: IconProps) { return <Icon name="shoppingBag" {...props} />; }
export function Snowflake(props: IconProps) { return <Icon name="snowflake" {...props} />; }
export function Sparkles(props: IconProps) { return <Icon name="sparkles" {...props} />; }
export function UsersRound(props: IconProps) { return <Icon name="users" {...props} />; }
export function Wrench(props: IconProps) { return <Icon name="wrench" {...props} />; }
