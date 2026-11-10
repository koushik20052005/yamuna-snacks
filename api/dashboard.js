import { sql, json, checkToken, num } from './_db.js';

// GET -> dashboard totals. PIN token required.
// Returns total sales, total costs, profit/loss (sales minus costs),
// today / week / month sales, daily series (last 14 days), weekly series
// (last 8 weeks), and cash vs online split.
export default async function handler(req, res) {
  try {
    if (!checkToken(req)) return json(res, 401, { error: 'Billing token required' });
    const db = sql();
    const sales = await db`SELECT COALESCE(SUM(total), 0) AS s, COUNT(*) AS c FROM orders`;
    const costs = await db`SELECT COALESCE(SUM(amount), 0) AS s FROM material_costs`;
    const today = await db`SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE created_at >= CURRENT_DATE`;
    const week = await db`SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`;
    const month = await db`SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)`;
    const daily = await db`
      SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS day, COALESCE(SUM(total), 0) AS sales
      FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '13 days'
      GROUP BY DATE(created_at) ORDER BY day`;
    const weekly = await db`
      SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD') AS week, COALESCE(SUM(total), 0) AS sales
      FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '56 days'
      GROUP BY DATE_TRUNC('week', created_at) ORDER BY week`;
    const split = await db`SELECT payment, COALESCE(SUM(total), 0) AS sales, COUNT(*) AS orders FROM orders GROUP BY payment`;
    const top = await db`
      SELECT name, SUM(qty) AS qty, SUM(price * qty) AS sales
      FROM order_items GROUP BY name ORDER BY sales DESC LIMIT 5`;
    const totalSales = num(sales[0].s);
    const totalCosts = num(costs[0].s);
    return json(res, 200, {
      totalSales,
      totalCosts,
      profit: totalSales - totalCosts,
      orderCount: Number(sales[0].c || 0),
      today: num(today[0].s),
      week: num(week[0].s),
      month: num(month[0].s),
      daily: daily.map((r) => ({ day: r.day, sales: num(r.sales) })),
      weekly: weekly.map((r) => ({ week: r.week, sales: num(r.sales) })),
      paymentSplit: split.map((r) => ({ payment: r.payment, sales: num(r.sales), orders: Number(r.orders) })),
      topItems: top.map((r) => ({ name: r.name, qty: Number(r.qty), sales: num(r.sales) })),
    });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}
