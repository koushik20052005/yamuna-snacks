-- Yamuna Snacks menu. Run once in Neon after db/schema.sql.
INSERT INTO menu_items (name, price, unit) VALUES
  ('Bread Omelette (double egg)', 45, 'plate'),
  ('Sarva Pindi', 40, 'plate'),
  ('Muntha Masala', 40, 'plate'),
  ('Ponganalu', 40, 'plate'),
  ('Egg Pouch (2 eggs)', 35, 'plate')
ON CONFLICT (name) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit;
