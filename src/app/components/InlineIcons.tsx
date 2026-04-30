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

const iconPaths: Record<IconName, string[]> = {
  badgeInfo: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 10v6', 'M12 7.5h.01'],
  bolt: ['M13 2 4 14h7l-1 8 9-12h-7l1-8Z'],
  briefcase: ['M10 6V5a2 2 0 0 1 4 0v1', 'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z', 'M3 12h18', 'M10 12v2h4v-2'],
  cable: ['M7 7 5 5', 'm17 17 2 2', 'M8 8a5 5 0 0 0 0 7l1 1a5 5 0 0 0 7 0', 'm14 6 4 4', 'm10 10 4 4', 'M15 5 5 15'],
  calculator: ['M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M8 7h8', 'M8 11h.01', 'M12 11h.01', 'M16 11h.01', 'M8 15h.01', 'M12 15h.01', 'M16 15h.01'],
  clipboardCheck: ['M9 4h6', 'M9 4a3 3 0 0 1 6 0', 'M7 5h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z', 'm9 14 2 2 4-5'],
  clipboardList: ['M9 4h6', 'M9 4a3 3 0 0 1 6 0', 'M7 5h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z', 'M9 12h6', 'M9 16h6'],
  clipboardPen: ['M9 4h6', 'M9 4a3 3 0 0 1 6 0', 'M10 21H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4', 'M14 20l5-5 2 2-5 5h-2v-2Z'],
  cog: ['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5h.1a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z'],
  factory: ['M3 21h18', 'M4 21V9l5 3V9l5 3V5h6v16', 'M8 17h.01', 'M12 17h.01', 'M16 17h.01'],
  fileSearch: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6', 'M14 2v6h6', 'M20 8v4', 'M16 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'm21 22-2.2-2.2'],
  fileText: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z', 'M14 2v6h6', 'M8 13h8', 'M8 17h6'],
  gem: ['M6 3h12l4 6-10 12L2 9l4-6Z', 'M2 9h20', 'm8 9 4 12 4-12'],
  history: ['M3 12a9 9 0 1 0 3-6.7', 'M3 4v5h5', 'M12 7v5l3 2'],
  house: ['M3 11 12 3l9 8', 'M5 10v10h14V10', 'M9 20v-6h6v6'],
  lightbulb: ['M9 18h6', 'M10 22h4', 'M12 2a7 7 0 0 0-4 12c.7.6 1 1.4 1 2h6c0-.6.3-1.4 1-2a7 7 0 0 0-4-12Z'],
  packageSearch: ['M3.3 7 12 12l8.7-5', 'M12 22V12', 'M21 12V7l-9-5-9 5v10l9 5 2.5-1.4', 'M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'm22 22-1.8-1.8'],
  plugZap: ['M13 2 8 12h6l-3 10 7-12h-6l1-8Z', 'M5 8v4', 'M8 8H4a2 2 0 0 0-2 2v2', 'M6 16v2'],
  receiptText: ['M5 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z', 'M8 7h8', 'M8 11h8', 'M8 15h5'],
  rotateCcw: ['M3 12a9 9 0 1 0 3-6.7', 'M3 4v5h5'],
  settings: ['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5h.1a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z'],
  shoppingBag: ['M6 8h12l-1 13H7L6 8Z', 'M9 8a3 3 0 0 1 6 0'],
  snowflake: ['M12 2v20', 'm17 4-5 5-5-5', 'm17 20-5-5-5 5', 'M2 12h20', 'm4 7 5 5-5 5', 'm20 7-5 5 5 5'],
  sparkles: ['M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z', 'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z', 'M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2', 'M9.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M22 21v-2a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8'],
  wrench: ['M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5L15 12l-3-3 2.7-2.7Z'],
};

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
      {iconPaths[name].map((pathData) => (
        <path d={pathData} key={pathData} />
      ))}
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
