import { sql, json, readBody, checkToken, num } from './_db.js';

// POST -> add a daily material cost. Body: { cost_date?, category?, amount, note? }
// GET  -> list recent material costs. PIN token required for both.
export default async function handler(req, res) {
  try {
    if (!checkToken(req)) return json(res, 401, { error: 'Billing token required' });
    const db = sql();
    if (req.method === 'POST') {
      const body = await readBody(req);
      const amount = num(body.amount);
      if (amount < 0) return json(res, 400, { error: 'Amount must be 0 or more' });
      const rows = await db`
        INSERT INTO material_costs (cost_date, category, amount, note)
        VALUES (${body.cost_date || new Date().toISOString().slice(0, 10)}, ${body.category || 'Materials'}, ${amount}, ${body.note || null})
        RETURNING id, cost_date, category, amount, note`;
      return json(res, 200, { cost: rows[0] });
    }
    if (req.method === 'GET') {
      const rows = await db`SELECT id, cost_date, category, amount, note FROM material_costs ORDER BY cost_date DESC, id DESC LIMIT 100`;
      return json(res, 200, { costs: rows });
    }
    return json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}
