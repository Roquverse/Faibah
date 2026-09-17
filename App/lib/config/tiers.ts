/**
 * Faibah Tier Feature Config
 * Single source of truth — change here, the whole app follows.
 *
 * Tier Matrix:
 * | Feature       | Solo | Contractor | Agency |
 * |---------------|------|------------|--------|
 * | Overview      | ✓    | ✓          | ✓      |
 * | Projects      | ✓    | ✓          | ✓      |
 * | Clients       | ✓    | ✓          | ✓      |
 * | Proposals     | -    | ✓          | ✓      |
 * | Quotations    | -    | -          | ✓      |
 * | Invoices      | ✓    | ✓          | ✓      |
 * | Receipts      | ✓    | ✓          | ✓      |
 * | Payments      | ✓    | ✓          | ✓      |
 * | Subscriptions | ✓    | -          | -      |
 * | Tasks         | -    | -          | ✓      |
 * | Team          | -    | -          | ✓      |
 * | Channels      | -    | -          | ✓      |
 * | Schedule      | -    | -          | ✓      |
 */
export const ALL_FEATURES = [
  'overview',
  'projects',
  'clients',
  'proposals',
  'quotations',
  'invoices',
  'receipts',
  'payments',
  'subscriptions',
  'tasks',
  'team',
  'channels',
  'schedule',
  'settings',
] as const;

export const TIER_FEATURES = {
  solo: ALL_FEATURES,
  contractor: ALL_FEATURES,
  agency: ALL_FEATURES,
} as const;

export type Tier = keyof typeof TIER_FEATURES;
export type Feature = (typeof TIER_FEATURES)[Tier][number];

/** Routes that map to features — used by middleware + sidebar */
export const FEATURE_ROUTES: Record<string, Feature> = {
  '/':             'overview',
  '/projects':     'projects',
  '/clients':      'clients',
  '/proposals':    'proposals',
  '/quotations':   'quotations',
  '/invoices':     'invoices',
  '/receipts':     'receipts',
  '/payments':     'payments',
  '/subscriptions':'subscriptions',
  '/tasks':        'tasks',
  '/team':         'team',
  '/channels':     'channels',
  '/schedule':     'schedule',
  '/settings':     'settings',
};

/** Features that require Contractor or higher (all free now) */
export const CONTRACTOR_ONLY_FEATURES: Feature[] = [];

/** Features that require Agency tier (all free now) */
export const AGENCY_ONLY_FEATURES: Feature[] = [];

export function tierCanAccess(_tier: Tier, _feature: string): boolean {
  return true;
}

export function getUpgradeRequired(_feature: string): Tier | null {
  return null;
}
