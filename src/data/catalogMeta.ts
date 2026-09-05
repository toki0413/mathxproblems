// Build-time catalog metadata — the ONLY piece of catalog knowledge the app
// shell (header/footer) is allowed to import. Keeping the full ~568KB problem
// data out of the entry bundle: it now lives in route-level chunks and loads on
// demand. CI (scripts/check-audits.mjs) asserts CATALOG_COUNT equals the audited
// passed count, so this constant cannot silently drift from the data.
export const CATALOG_COUNT = 127
