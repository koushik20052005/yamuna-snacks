# Yamuna Snacks

Yamuna Snacks is a small family evening street-food stall in Hyderabad, run by grandma and uncle. This repo is its public website and its PIN-protected billing system, backed by Neon Postgres.

## The shop

- **Store:** Yamuna Snacks — "Hot & Crispy Evening Treats"
- **Location:** Nagole Main Road, near bus stand, Pillar No. 6, Hyderabad
- **Timings:** 5 PM to 10 PM daily. Delivery available.
- **Order number:** 8886372883
- **Service areas:** Hitech City, Kondapur, Madhapur, Gachibowli, Jubilee Hills, Banjara Hills, Ameerpet, SR Nagar, Panjagutta

## Menu

| Item | Price |
| --- | --- |
| Bread Omelette (double egg) | Rs 45 |
| Sarva Pindi | Rs 40 per plate |
| Muntha Masala | Rs 40 |
| Ponganalu | Rs 40 per plate |
| Egg Pouch (2 eggs) | Rs 35 |

## What is in this repo

- `public/index.html` — public shop site. Shop-banner hero with a cartoon grandma illustration (cartoon only, no real person photo), menu with photos and prices, order builder with + / - that sends the order on WhatsApp to 8886372883, location, timings, service areas, Our Story, FAQ, and a Billing button in the footer linking to `/billing.html`. Mobile-first, with animations.
- `public/images/muntha-masala.webp` — the real Muntha Masala photo (puffed rice mix in a newspaper cone in a black bowl).
- `public/images/grandma-cartoon.webp` — generated cartoon illustration of grandma at the stall.
- `public/billing.html` — billing app. PIN gate first, then dashboard, Add Order, recent orders, daily material costs, and price editing. Mobile-first.
- `api/menu.js` — GET the menu (public), PUT update a price (PIN token required).
- `api/verify-pin.js` — POST a billing code, compare it with `BILLING_PIN`, return a token. No PIN is hardcoded anywhere.
- `api/orders.js` — POST create an order (item required, name and phone optional, payment online or cash, optional WhatsApp number), GET list orders. PIN token required.
- `api/dashboard.js` — GET totals: total sales, total costs, profit/loss (sales minus costs), today / week / month sales, daily series (last 14 days), weekly series (last 8 weeks), cash vs online split, and best-selling items. PIN token required.
- `api/costs.js` — POST / GET daily material costs. PIN token required.
- `api/_db.js` — shared Neon database helper and PIN-token helper.
- `db/schema.sql` — tables: `menu_items`, `orders`, `order_items`, `material_costs`.
- `db/seed.sql` — the 5 menu items with the exact prices above.

## Run locally

```bash
npm install
cp .env.example .env
# Edit .env and set DATABASE_URL and BILLING_PIN (see below)
npx vercel dev
```

Open the local URL Vercel prints. The shop site is at `/` and billing is at `/billing.html`.

## Deploy on Vercel

1. Push this repo to GitHub and import it in Vercel (Add New Project, import the repo).
2. In Vercel, go to Project Settings > Environment Variables and set:
   - `DATABASE_URL` — your Neon Postgres connection string
   - `BILLING_PIN` — your chosen billing code
3. In Neon (SQL Editor), run `db/schema.sql` once, then run `db/seed.sql` once. This creates the billing tables and the 5 menu items.
4. Deploy. The site is at the Vercel URL, billing is at `<your-vercel-url>/billing.html`.

## Security

No real secret is stored in this repo. Do not commit a `.env` file, a Neon connection string, a database password, or a billing code. The only environment variable names are `DATABASE_URL` and `BILLING_PIN`, and `.env.example` contains placeholders only.
