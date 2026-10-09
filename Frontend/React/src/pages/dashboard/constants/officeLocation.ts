/**
 * ============================================================
 * OFFICE LOCATION CONFIGURATION
 * ============================================================
 *
 * This is the temporary frontend configuration.
 *
 * Future:
 * Replace this with:
 *
 * GET /api/office/location
 *
 * The employee's real GPS coordinates are NEVER replaced.
 * Only the resolved office/address label is overridden when
 * the employee is inside the configured geofence.
 */

export const OFFICE_LOCATION = {
  /**
   * Centrum Business Square
   * Plot D1, Road No. 16
   * Near Lotus IT Park
   * Wagle Industrial Estate
   * Thane, Maharashtra - 400604
   */
  latitude: 19.195077293236,
  longitude: 72.95517675980268,

  /**
   * Employee will be considered to be at the office
   * when the GPS location is within this radius.
   */
  radiusMeters: 0,

  /**
   * Display name used by attendance records.
   */
  name: "Centrum Business Square",

  /**
   * Display address used when employee is inside
   * the configured office radius.
   */
  address:
    "Centrum Business Square, Plot D1, Road No. 16, Near Lotus IT Park, Wagle Industrial Estate, Thane, Maharashtra 400604",
} as const;

export type OfficeLocation = typeof OFFICE_LOCATION;