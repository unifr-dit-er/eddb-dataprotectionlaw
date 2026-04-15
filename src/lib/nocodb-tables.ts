export const NOCODB_TABLES = {
  DECISIONS: 'merxbxhfvr09g66',
  KEYWORDS: 'mp7ev44j9pdsyxs',
  CATEGORIES: 'mpqb34djokcbpcy',
  // Junction table for the Decisions <-> Keywords many-to-many relationship.
  // Provides Keywords_id and Decisions_id columns for server-side filtering.
  DECISIONS_KEYWORDS: 'm4g9te8g00mpzkl',
} as const
