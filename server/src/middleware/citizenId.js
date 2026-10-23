/**
 * Single, canonical implementation of "which citizen does this request
 * belong to?" used by every controller.
 *
 * Precedence:
 *   1. req.user.verifiedCitizenId — set only after the citizen has
 *      passed identity verification in this session. This is the
 *      strictly-correct answer for flows that require verification.
 *   2. req.user.citizenId — set on login; correct for unverified but
 *      linked accounts (e.g. staff acting on their own citizen record,
 *      or citizens before identity verification is refreshed).
 *   3. null — no citizen is associated with the request.
 *
 * Before this helper existed, six controllers each implemented the
 * same logic differently. Three read req.user.verifiedCitizenId, which
 * authMiddleware never set — the field was always undefined.
 */

function citizenIdFrom(req) {
  if (!req || !req.user) return null;
  return req.user.verifiedCitizenId || req.user.citizenId || null;
}

module.exports = { citizenIdFrom };