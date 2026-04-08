/**
 * Versioning for the Japi Express Bulk Shipment Excel template.
 *
 * ── How it works ────────────────────────────────────────────────────────────
 *
 * The version number is embedded in a "_meta" hidden sheet (cell A1) every
 * time the template is generated. The parser reads it before processing rows.
 *
 * ── When to bump CURRENT_TEMPLATE_VERSION ───────────────────────────────────
 *
 *   • Adding, removing, or reordering columns in the "Envíos" sheet.
 *   • Changing required fields or their positions.
 *   • Any structural change that makes old files incompatible.
 *
 * ── Backward compatibility ───────────────────────────────────────────────────
 *
 *   CURRENT_TEMPLATE_VERSION  → version written into newly generated files.
 *   MIN_COMPATIBLE_VERSION    → oldest version the parser will accept.
 *
 *   Example scenarios:
 *   ┌──────────────────────────────────────────────────────────────────────┐
 *   │ Scenario                          │ CURRENT │ MIN_COMPATIBLE         │
 *   ├──────────────────────────────────────────────────────────────────────│
 *   │ First release                     │    2    │    2                   │
 *   │ New version, reject old templates │    3    │    3                   │
 *   │ New version, still accept v2      │    3    │    2                   │
 *   └──────────────────────────────────────────────────────────────────────┘
 */

/** Version embedded in every newly generated template file. */
export const CURRENT_TEMPLATE_VERSION = 2;

/** Oldest template version accepted by the parser (inclusive). */
export const MIN_COMPATIBLE_VERSION = 2;

/** Human-readable label used in UI messages and the filename. */
export const TEMPLATE_VERSION_LABEL = `v${CURRENT_TEMPLATE_VERSION}`;
