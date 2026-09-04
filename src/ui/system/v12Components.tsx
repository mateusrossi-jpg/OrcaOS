import React, { memo, type ReactNode } from 'react';
import { Search, ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/ui';

/**
 * 1. SlimSearchInput
 * iOS ChatGPT style slim tactical search input with clear button and keyboard handling.
 */
export interface SlimSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export const SlimSearchInput = memo(function SlimSearchInput({
  value,
  onChange,
  placeholder = "Buscar cliente, serviço, orçamento...",
  onSubmit,
  onClear,
  className,
  autoFocus = false,
}: SlimSearchInputProps) {
  return (
    <div className={cn(
      "bg-[#3A3A3C] border border-white/5 h-12 rounded-[14px] px-4 text-white w-full flex items-center gap-3 shadow-sm focus-within:border-white/20 transition-all",
      className
    )}>
      <Search size={17} className="text-[#8E8E93] shrink-0" />
      <input
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit) {
            onSubmit();
          }
        }}
        placeholder={placeholder}
        className="w-full bg-transparent text-[14px] outline-none border-none p-0 m-0 placeholder:text-[#8E8E93] text-white"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="text-[11px] text-[#8E8E93] hover:text-white p-1 cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center rounded-full active:bg-white/10"
          aria-label="Limpar busca"
        >
          ✕
        </button>
      )}
    </div>
  );
});

/**
 * 2. V12HeroCard (and HeroCard alias)
 * Authoritative strategic command card. Matches Home Hero Card.
 */
export interface V12HeroCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const V12HeroCard = memo(function V12HeroCard({
  children,
  className,
  ...props
}: V12HeroCardProps) {
  return (
    <div
      className={cn(
        "bg-[#3A3A3C] border border-white/10 rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.16)] flex flex-col gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

/**
 * 3. GroupedSection / ListCard
 * Secondary standard container for section lists and item groups.
 */
export interface GroupedSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  headerTitle?: string;
  headerIcon?: ReactNode;
  headerAction?: ReactNode;
  className?: string;
}

export const GroupedSection = memo(function GroupedSection({
  children,
  headerTitle,
  headerIcon,
  headerAction,
  className,
  ...props
}: GroupedSectionProps) {
  return (
    <div
      className={cn(
        "bg-[#363638] border border-white/5 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col",
        className
      )}
      {...props}
    >
      {(headerTitle || headerAction) && (
        <div className="p-4 px-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            {headerIcon}
            {headerTitle && (
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8E8E93]">
                {headerTitle}
              </span>
            )}
          </div>
          {headerAction}
        </div>
      )}
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  );
});

export const ListCard = GroupedSection;

/**
 * 4. PrimaryPillButton
 * Universal 56px high-contrast conversion CTA.
 */
export interface PrimaryPillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: LucideIcon | ReactNode;
  loading?: boolean;
}

export const PrimaryPillButton = memo(function PrimaryPillButton({
  children,
  icon: Icon,
  loading = false,
  disabled = false,
  className,
  ...props
}: PrimaryPillButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "w-full min-h-[52px] h-14 py-3.5 px-4 bg-white text-[#2C2C2E] font-bold text-[14px] rounded-full active:scale-[0.975] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer select-none uppercase tracking-[0.05em] disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-[#2C2C2E]/20 border-t-[#2C2C2E] rounded-full animate-spin" />
      ) : (
        <>
          {Icon && (
            typeof Icon === 'function' ? <Icon size={18} strokeWidth={2.5} className="shrink-0" /> : Icon
          )}
          <span className="text-center tracking-tight truncate">{children}</span>
        </>
      )}
    </button>
  );
});

/**
 * 5. SecondaryActionButton
 * 48px Secondary operational and filter button.
 */
export interface SecondaryActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: LucideIcon | ReactNode;
  active?: boolean;
}

export const SecondaryActionButton = memo(function SecondaryActionButton({
  children,
  icon: Icon,
  active = false,
  disabled = false,
  className,
  ...props
}: SecondaryActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "h-12 px-4 rounded-[14px] text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none",
        active 
          ? "bg-white text-[#2C2C2E] font-bold shadow-md"
          : "bg-[#3A3A3C] text-white/90 border border-white/5 hover:border-white/10",
        className
      )}
      {...props}
    >
      {Icon && (
        typeof Icon === 'function' ? <Icon size={15} className="shrink-0" /> : Icon
      )}
      <span className="truncate">{children}</span>
    </button>
  );
});

/**
 * 6. V12StatusBadge
 * High-legibility semantic status indicator badge.
 */
export interface V12StatusBadgeProps {
  label: string;
  tone?: 'success' | 'attention' | 'critical' | 'info' | 'neutral';
  className?: string;
}

export const V12StatusBadge = memo(function V12StatusBadge({
  label,
  tone = 'neutral',
  className,
}: V12StatusBadgeProps) {
  const toneClasses = {
    success: "text-[#30D158] bg-[#30D158]/10 border border-[#30D158]/20",
    attention: "text-[#FFD60A] bg-[#FFD60A]/10 border border-[#FFD60A]/20",
    critical: "text-[#FF453A] bg-[#FF453A]/10 border border-[#FF453A]/20",
    info: "text-[#0A84FF] bg-[#0A84FF]/10 border border-[#0A84FF]/20",
    neutral: "text-[#8E8E93] bg-white/5 border border-white/5",
  };

  return (
    <span className={cn(
      "text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center justify-center select-none",
      toneClasses[tone],
      className
    )}>
      {label}
    </span>
  );
});

/**
 * 7. BottomSheet
 * Standardized slide-up sheet with gesture grip and safe-area padding.
 */
export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export const BottomSheet = memo(function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-[#2C2C2E] border-t border-white/10 rounded-t-[28px] p-6 pb-12 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] max-w-md mx-auto w-full flex flex-col gap-4 animate-in slide-in-from-bottom duration-300",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grip Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-2 mb-1" />

        {title && (
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-[16px] font-bold text-white tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="text-[#8E8E93] hover:text-white p-1 text-sm font-bold cursor-pointer"
              aria-label="Fechar modal"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
      </div>
    </div>
  );
});

/**
 * 8. EmptyState
 * Clean, centered empty state aligned with Dark Premium V12 standards.
 */
export interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon | ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = memo(function EmptyState({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("p-8 text-center flex flex-col items-center justify-center gap-3 w-full", className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93]">
          {typeof Icon === 'function' ? <Icon size={22} /> : Icon}
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-xs">
        <span className="text-[14px] font-bold text-white">{title}</span>
        {subtitle && (
          <span className="text-[12px] text-[#8E8E93] leading-relaxed">{subtitle}</span>
        )}
      </div>
      {action && (
        <div className="mt-2 w-full max-w-xs">
          {action}
        </div>
      )}
    </div>
  );
});
