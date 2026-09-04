/**
 * AFERIX DARK PREMIUM V12 — CANONICAL DESIGN TOKENS
 * 
 * Source of Truth: HomePage.tsx + PRODUCT_HOME_HEADER_CONSTITUTION.md
 * Strict Mandate: Professional industrial Dark Premium. Zero gaming/cyberpunk aesthetics.
 */

export const AferixV12Tokens = {
  // 1. Base Canvas & Surface Backgrounds
  canvas: {
    gradient: "bg-gradient-to-b from-[#2C2C2E] to-[#262628]",
    solid: "bg-[#2C2C2E]",
    dark: "bg-[#262628]",
  },
  surface: {
    hero: "bg-[#3A3A3C]",
    card: "bg-[#363638]",
    input: "bg-[#3A3A3C]",
    modal: "bg-[#2C2C2E]",
    dock: "bg-[#2C2C2E]/90 backdrop-blur-xl",
  },

  // 2. Borders & Outlines
  border: {
    subtle: "border border-white/5",
    standard: "border border-white/10",
    focus: "focus:border-white/20",
    divider: "border-b border-white/5",
  },

  // 3. Typography & Text Hierarchy
  text: {
    primary: "text-white",
    secondary: "text-[#C7C7CC]",
    muted: "text-[#8E8E93]",
    faint: "text-white/40",
  },

  // 4. Semantics & Accents
  semantic: {
    success: {
      text: "text-[#30D158]",
      bg: "bg-[#30D158]",
      badge: "text-[#30D158] bg-[#30D158]/10",
      border: "border-[#30D158]/30",
    },
    attention: {
      text: "text-[#FFD60A]",
      bg: "bg-[#FFD60A]",
      badge: "text-[#FFD60A] bg-[#FFD60A]/10",
      border: "border-[#FFD60A]/30",
    },
    critical: {
      text: "text-[#FF453A]",
      bg: "bg-[#FF453A]",
      badge: "text-[#FF453A] bg-[#FF453A]/10",
      border: "border-[#FF453A]/30",
    },
    info: {
      text: "text-[#0A84FF]",
      bg: "bg-[#0A84FF]",
      badge: "text-[#0A84FF] bg-[#0A84FF]/10",
      border: "border-[#0A84FF]/30",
    },
  },

  // 5. Radii
  radius: {
    hero: "rounded-[24px]",
    card: "rounded-[20px]",
    cardCompact: "rounded-[18px]",
    input: "rounded-[14px]",
    badge: "rounded-full",
    pill: "rounded-full",
    modal: "rounded-t-[28px]",
  },

  // 6. Shadows
  shadow: {
    hero: "shadow-[0_8px_24px_rgba(0,0,0,0.16)]",
    card: "shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
    dock: "shadow-[0_-4px_20px_rgba(0,0,0,0.25)]",
    modal: "shadow-[0_-12px_40px_rgba(0,0,0,0.5)]",
  },

  // 7. Interactive & Buttons
  button: {
    primary: "min-h-[52px] h-14 w-full rounded-full bg-white text-[#2C2C2E] font-bold text-[14px] uppercase tracking-[0.15em] active:scale-[0.975] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer select-none",
    secondary: "h-12 px-4 rounded-[14px] bg-[#3A3A3C] text-white text-[13px] font-semibold border border-white/5 hover:border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer",
    settle: "h-14 w-full rounded-2xl bg-[#30D158] text-[#050505] font-black text-[14px] uppercase tracking-wider active:scale-[0.975] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer select-none",
  },

  // 8. Mobile Layout & Safe-Area
  layout: {
    pageContainer: "pb-36 bg-gradient-to-b from-[#2C2C2E] to-[#262628] text-white min-h-screen",
    contentWrapper: "px-5 pt-4 flex flex-col gap-5 max-w-md mx-auto w-full",
    bottomPadding: "pb-36",
  },
} as const;

export type AferixV12TokensType = typeof AferixV12Tokens;
