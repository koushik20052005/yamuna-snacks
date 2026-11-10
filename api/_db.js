import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';

export function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function tokenForPin() {
  return crypto.createHash('sha256')
    .update(String(process.env.BILLING_PIN || '') + ':yamuna-billing')
    .digest('hex');
}

export function checkToken(req) {
  const pin = process.env.BILLING_PIN;
  if (!pin) return false;
  const token = req.headers['x-billing-token'] || '';
  return token === tokenForPin();
}

export async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

export function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
