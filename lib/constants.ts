/**
 * Predefined category tags for opportunities
 * These are the only allowed tags that can be used across the platform
 */
export const PREDEFINED_TAGS = [
  "Bootcamp",
  "Grant",
  "Student Benefit",
  "AI",
  "Accelerator",
  "Startup Benefits",
  "Other",
] as const

export type PredefinedTag = (typeof PREDEFINED_TAGS)[number]

/**
 * Check if a tag is valid (from predefined list)
 */
export function isValidTag(tag: string): tag is PredefinedTag {
  return PREDEFINED_TAGS.includes(tag as PredefinedTag)
}

/**
 * Normalize tags - filter out invalid tags and ensure uniqueness
 */
export function normalizeTags(tags: string[]): PredefinedTag[] {
  return Array.from(new Set(tags.filter(isValidTag)))
}

