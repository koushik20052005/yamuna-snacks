import { sql, json, readBody, checkToken, num } from './_db.js';

// GET  -> public menu list, ordered by id.
// PUT  -> { id, price } or { name, price } to update a price. PIN token required.
export default async function handler(req, res) {
  try {
    const db = sql();
    if (req.method === 'GET') {
      const rows = await db`SELECT id, name, price, unit FROM menu_items ORDER BY id`;
      return json(res, 200, { items: rows });
    }
    if (req.method === 'PUT') {
      if (!checkToken(req)) return json(res, 401, { error: 'Billing token required' });
      const { id, name, price } = await readBody(req);
      const p = num(price);
      if (p < 0) return json(res, 400, { error: 'Price must be 0 or more' });
      let rows;
      if (id) {
        rows = await db`UPDATE menu_items SET price = ${p} WHERE id = ${Number(id)} RETURNING id, name, price, unit`;
      } else if (name) {
        rows = await db`UPDATE menu_items SET price = ${p} WHERE name = ${name} RETURNING id, name, price, unit`;
      } else {
        return json(res, 400, { error: 'Provide id or name' });
      }
      if (!rows.length) return json(res, 404, { error: 'Menu item not found' });
      return json(res, 200, { item: rows[0] });
    }
    return json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}
