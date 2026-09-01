CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('customer', 'staff', 'admin'))
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    discogs_release_id BIGINT,
    album_name VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    format VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL
        CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (stock_quantity >= 0)
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,

    customer_id INTEGER NOT NULL
        REFERENCES users(user_id),

    created_by INTEGER
        REFERENCES users(user_id),

    product_id INTEGER NOT NULL
        REFERENCES products(product_id),

    quantity INTEGER NOT NULL
        CHECK (quantity > 0),

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'processing',
                'completed',
                'cancelled'
            )
        ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    total_amount NUMERIC(10, 2) NOT NULL
        CHECK (total_amount >= 0)
);