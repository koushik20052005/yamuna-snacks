import { json, readBody, tokenForPin } from './_db.js';

// POST { pin } -> { ok, token } when the pin matches BILLING_PIN.
// The PIN itself is never hardcoded here; it comes from the environment.
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const { pin } = await readBody(req);
    const expected = process.env.BILLING_PIN;
    if (!expected) return json(res, 500, { error: 'BILLING_PIN is not set' });
    if (String(pin || '') !== String(expected)) {
      return json(res, 401, { error: 'Wrong code. Try again.' });
    }
    return json(res, 200, { ok: true, token: tokenForPin() });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}
