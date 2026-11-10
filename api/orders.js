import { sql, json, readBody, checkToken, num } from './_db.js';

// POST -> create an order. Body: { customer_name?, phone?, whatsapp?, payment: 'online'|'cash',
//   items: [{ menu_item_id?, name, price, qty }] }  Item is required, name/phone are optional.
// GET  -> list recent orders with their items. PIN token required for both.
export default async function handler(req, res) {
  try {
    if (!checkToken(req)) return json(res, 401, { error: 'Billing token required' });
    const db = sql();
    if (req.method === 'POST') {
      const body = await readBody(req);
      const items = Array.isArray(body.items) ? body.items : [];
      if (!items.length) return json(res, 400, { error: 'Add at least one item' });
      if (body.payment !== 'online' && body.payment !== 'cash') {
        return json(res, 400, { error: 'Payment must be online or cash' });
      }
      const clean = items
        .map((it) => ({ menu_item_id: it.menu_item_id || null, name: String(it.name || ''), price: num(it.price), qty: Math.max(1, Math.floor(num(it.qty) || 1)) }))
        .filter((it) => it.name && it.price >= 0);
      if (!clean.length) return json(res, 400, { error: 'Add at least one valid item' });
      const total = clean.reduce((s, it) => s + it.price * it.qty, 0);
      const order = await db`
        INSERT INTO orders (customer_name, phone, whatsapp, payment, total)
        VALUES (${body.customer_name || null}, ${body.phone || null}, ${body.whatsapp || null}, ${body.payment}, ${total})
        RETURNING id, customer_name, phone, whatsapp, payment, total, created_at`;
      const orderId = order[0].id;
      for (const it of clean) {
        await db`INSERT INTO order_items (order_id, menu_item_id, name, price, qty)
          VALUES (${orderId}, ${it.menu_item_id}, ${it.name}, ${it.price}, ${it.qty})`;
      }
      return json(res, 200, { order: order[0], items: clean });
    }
    if (req.method === 'GET') {
      const orders = await db`SELECT id, customer_name, phone, whatsapp, payment, total, created_at FROM orders ORDER BY created_at DESC LIMIT 100`;
      for (const o of orders) {
        o.items = await db`SELECT name, price, qty FROM order_items WHERE order_id = ${o.id}`;
      }
      return json(res, 200, { orders });
    }
    return json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}
