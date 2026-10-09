/**
 * Policy Constants
 *
 * Policy records are loaded from the backend API.
 *
 * This file intentionally does not contain mock policy records.
 * Keeping policy data in one source (the API) prevents the
 * employee and admin screens from becoming inconsistent.
 */

/**
 * Default number of policies displayed per page.
 */
export const POLICY_PAGE_SIZE = 5;

/**
 * Default policy status filter.
 *
 * Supported values are controlled by the UI/API contract.
 */
export const DEFAULT_POLICY_STATUS = 'all';

/**
 * Default policy sorting option.
 */
export const DEFAULT_POLICY_SORT = 'recent';