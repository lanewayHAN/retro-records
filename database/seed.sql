-- =========================================================
-- Retro Records - Demo Seed Data
-- Demo password for seeded users: password123
-- =========================================================

-- USERS
INSERT INTO users
  (user_id, name, email, phone, password_hash, role)
VALUES
  (
    1,
    'John Customer',
    'john@example.com',
    '0400000001',
    '$2b$10$e7y5Ci0jusyWuk5VT4L0d.d0PgSdU.38vEnoNjpP91k7ionrzwGGe',
    'customer'
  ),
  (
    2,
    'Sarah Staff',
    'sarah@example.com',
    '0400000002',
    '$2b$10$e7y5Ci0jusyWuk5VT4L0d.d0PgSdU.38vEnoNjpP91k7ionrzwGGe',
    'staff'
  ),
  (
    3,
    'Alex Admin',
    'alex@example.com',
    '0400000003',
    '$2b$10$e7y5Ci0jusyWuk5VT4L0d.d0PgSdU.38vEnoNjpP91k7ionrzwGGe',
    'admin'
  )
ON CONFLICT DO NOTHING;


-- PRODUCTS
INSERT INTO products
  (
    product_id,
    discogs_release_id,
    album_name,
    artist,
    format,
    price,
    stock_quantity
  )
VALUES
  (
    1,
    249504,
    'Rumours',
    'Fleetwood Mac',
    'Vinyl',
    49.95,
    8
  ),
  (
    2,
    367084,
    'Nevermind',
    'Nirvana',
    'Vinyl',
    54.95,
    6
  ),
  (
    3,
    457025,
    'Abbey Road',
    'The Beatles',
    'Vinyl',
    59.95,
    5
  ),
  (
    4,
    609339,
    'Thriller',
    'Michael Jackson',
    'CD',
    24.95,
    10
  ),
  (
    5,
    123456,
    'Back in Black',
    'AC/DC',
    'Cassette',
    19.95,
    4
  )
ON CONFLICT DO NOTHING;


-- ORDERS
INSERT INTO orders
  (
    order_id,
    customer_id,
    created_by,
    product_id,
    quantity,
    status,
    total_amount
  )
VALUES
  (
    1,
    1,
    2,
    1,
    1,
    'completed',
    49.95
  ),
  (
    2,
    1,
    2,
    2,
    1,
    'pending',
    54.95
  )
ON CONFLICT DO NOTHING;


-- Reset SERIAL sequences so future INSERTS receive the next correct ID
SELECT setval(
  pg_get_serial_sequence('users', 'user_id'),
  COALESCE((SELECT MAX(user_id) FROM users), 1)
);

SELECT setval(
  pg_get_serial_sequence('products', 'product_id'),
  COALESCE((SELECT MAX(product_id) FROM products), 1)
);

SELECT setval(
  pg_get_serial_sequence('orders', 'order_id'),
  COALESCE((SELECT MAX(order_id) FROM orders), 1)
);