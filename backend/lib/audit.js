const AuditLog = require('../models/AuditLog');

/**
 * Append one immutable audit entry. The audit log is append-only: callers
 * record what changed (before/after diff) but never update or delete entries.
 *
 * @param {object} entry
 * @param {'config_change'|'approval'|'ops_toggle'|'break_glass'|'auto_rollback'} entry.action
 * @param {string} entry.actor   email or 'system'
 * @param {string} entry.flag    human-readable flag name
 * @param {string} entry.key     flag key
 * @param {string} [entry.env]   defaults to 'prod'
 * @param {string} [entry.summary]
 * @param {Array<{field:string,before:string,after:string}>} [entry.diff]
 * @param {boolean} [entry.system]
 * @param {string} [entry.note]
 */
// Derive the next sequential number from the highest existing id rather than the
// document count, so a deleted row can't cause a duplicate-key collision.
async function nextSeq(Model, prefix) {
  const rows = await Model.find({}, 'id').lean();
  let max = 0;
  for (const r of rows) {
    const m = r.id?.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

async function writeAudit({ action, actor, flag, key, env = 'prod', summary = '', diff = [], system = false, note = '' }) {
  const seq = await nextSeq(AuditLog, 'AUD');
  return AuditLog.create({
    id: `AUD-${String(seq).padStart(4, '0')}`,
    action,
    actor,
    system,
    flag,
    key,
    env,
    summary,
    diff,
    note,
  });
}

module.exports = { writeAudit, nextSeq };
