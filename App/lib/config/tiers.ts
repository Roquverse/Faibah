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
export const TIER_FEATURES = {
  solo: [
    'overview',
    'projects',
    'clients',
    'invoices',
    'receipts',
    'payments',
    'subscriptions',
    'settings',
  ],
  contractor: [
    'overview',
    'projects',
    'clients',
    'proposals',
    'invoices',
    'receipts',
    'payments',
    'settings',
  ],
  agency: [
    'overview',
    'projects',
    'clients',
    'proposals',
    'quotations',
    'invoices',
    'receipts',
    'payments',
    'tasks',
    'team',
    'channels',
    'schedule',
    'settings',
  ],
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

/** Features that require Contractor or higher */
export const CONTRACTOR_ONLY_FEATURES: Feature[] = ['proposals'];

/** Features that require Agency tier */
export const AGENCY_ONLY_FEATURES: Feature[] = [
  'quotations', 'tasks', 'team', 'channels', 'schedule',
];

export function tierCanAccess(tier: Tier, feature: string): boolean {
  return (TIER_FEATURES[tier] as readonly string[]).includes(feature);
}

export function getUpgradeRequired(feature: string): Tier | null {
  if ((TIER_FEATURES.solo as readonly string[]).includes(feature)) return null;
  if ((TIER_FEATURES.contractor as readonly string[]).includes(feature)) return 'contractor';
  return 'agency';
}
