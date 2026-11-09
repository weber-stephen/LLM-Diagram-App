/**
 * Typography System for LLM Diagram
 * 
 * Consistent typography scale and utility classes for the application.
 * Based on a clear visual hierarchy that guides user attention.
 */

export const typography = {
  // Display & Hero Text
  hero: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight",
  display: "text-3xl sm:text-4xl font-bold tracking-tight",
  
  // Headings
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-semibold",
  h3: "text-xl font-semibold",
  h4: "text-lg font-semibold",
  h5: "text-base font-semibold",
  
  // Body Text
  lead: "text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed",
  body: "text-base text-gray-700 dark:text-gray-300",
  bodySmall: "text-sm text-gray-600 dark:text-gray-400",
  caption: "text-xs text-gray-500 dark:text-gray-500",
  
  // Special Purpose
  code: "font-mono text-sm",
  label: "text-sm font-medium text-gray-900 dark:text-gray-100",
  labelLarge: "text-base font-semibold text-gray-900 dark:text-gray-100",
  
  // Interactive Elements
  buttonText: "font-semibold",
  linkText: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline",
  
  // Brand
  brandGradient: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent",
  
  // Utility
  truncate: "truncate",
  ellipsis: "line-clamp-2",
} as const;

/**
 * Spacing System
 * Based on 4px base unit (Tailwind default)
 */
export const spacing = {
  // Vertical Rhythm
  section: "space-y-8",      // 32px - Between major sections
  group: "space-y-6",        // 24px - Between related groups
  item: "space-y-4",         // 16px - Between individual items
  compact: "space-y-3",      // 12px - Compact spacing
  tight: "space-y-2",        // 8px - Very tight spacing
  minimal: "space-y-1",      // 4px - Minimal spacing
  
  // Horizontal Rhythm (Flex/Grid gaps)
  gapSection: "gap-8",       // 32px
  gapGroup: "gap-6",         // 24px
  gapItem: "gap-4",          // 16px
  gapCompact: "gap-3",       // 12px
  gapInline: "gap-2",        // 8px - Icon + text
  gapTight: "gap-1",         // 4px
  
  // Padding
  cardPadding: "p-8",
  cardPaddingSmall: "p-6",
  sectionPadding: "px-4 py-8 sm:px-8 sm:py-12",
  
  // Container Widths
  narrow: "max-w-md",        // 448px - Forms, inputs
  medium: "max-w-2xl",       // 672px - Content, prompts
  wide: "max-w-4xl",         // 896px - Main layouts
  full: "max-w-6xl",         // 1152px - Page container
  ultraWide: "max-w-7xl",    // 1280px - Special layouts
} as const;

/**
 * Shadow System
 * Consistent elevation throughout the app
 */
export const shadows = {
  // Standard shadows
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  
  // Interactive shadows (with hover states)
  interactive: "shadow-md hover:shadow-lg transition-shadow",
  subtle: "shadow-sm hover:shadow-md transition-shadow",
  
  // Special effects
  ring: "ring-4 ring-blue-100 dark:ring-blue-900/30",
  ringGreen: "ring-4 ring-green-100 dark:ring-green-900/30",
  ringPurple: "ring-4 ring-purple-100 dark:ring-purple-900/30",
} as const;

/**
 * Color Utilities
 * Semantic color patterns
 */
export const colors = {
  // Status
  success: {
    bg: "bg-green-50 dark:bg-green-900/10",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-900 dark:text-green-100",
    icon: "text-green-600 dark:text-green-400",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/10",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-900 dark:text-yellow-100",
    icon: "text-yellow-600 dark:text-yellow-400",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-900 dark:text-red-100",
    icon: "text-red-600 dark:text-red-400",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/10",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-900 dark:text-blue-100",
    icon: "text-blue-600 dark:text-blue-400",
  },
  
  // Diagram Types
  flowchart: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-800 dark:text-blue-200",
    gradient: "from-blue-500 to-cyan-500",
  },
  sequence: {
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-800 dark:text-green-200",
    gradient: "from-green-500 to-emerald-500",
  },
  architecture: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-800 dark:text-purple-200",
    gradient: "from-purple-500 to-pink-500",
  },
} as const;

/**
 * Border Radius System
 */
export const borderRadius = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  full: "rounded-full",
} as const;

/**
 * Transition Utilities
 */
export const transitions = {
  default: "transition-all duration-200",
  fast: "transition-all duration-150",
  slow: "transition-all duration-300",
  colors: "transition-colors duration-200",
  shadow: "transition-shadow duration-200",
  transform: "transition-transform duration-200",
} as const;

/**
 * Helper function to combine classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}


