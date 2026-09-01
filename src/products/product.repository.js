import pool from "../db.js";

export async function getAllProducts() {
  const result = await pool.query(
    "SELECT * FROM products ORDER BY product_id"
  );

  return result.rows;
}

export async function getProductById(id) {
  const result = await pool.query(
    "SELECT * FROM products WHERE product_id = $1",
    [id]
  );

  return result.rows[0];
}

export async function createProduct(product) {
  const {
    discogs_release_id,
    album_name,
    artist,
    format,
    price,
    stock_quantity
  } = product;

  const result = await pool.query(
    `INSERT INTO products
      (discogs_release_id, album_name, artist, format, price, stock_quantity)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      discogs_release_id,
      album_name,
      artist,
      format,
      price,
      stock_quantity
    ]
  );

  return result.rows[0];
}

export async function replaceProductById(id, product) {
  const {
    discogs_release_id,
    album_name,
    artist,
    format,
    price,
    stock_quantity
  } = product;

  const result = await pool.query(
    `UPDATE products
     SET discogs_release_id = $1,
         album_name = $2,
         artist = $3,
         format = $4,
         price = $5,
         stock_quantity = $6
     WHERE product_id = $7
     RETURNING *`,
    [
      discogs_release_id,
      album_name,
      artist,
      format,
      price,
      stock_quantity,
      id
    ]
  );

  return result.rows[0];
}

export async function updateProductById(id, product) {
  const result = await pool.query(
    `UPDATE products
     SET discogs_release_id = COALESCE($1, discogs_release_id),
         album_name = COALESCE($2, album_name),
         artist = COALESCE($3, artist),
         format = COALESCE($4, format),
         price = COALESCE($5, price),
         stock_quantity = COALESCE($6, stock_quantity)
     WHERE product_id = $7
     RETURNING *`,
    [
      product.discogs_release_id,
      product.album_name,
      product.artist,
      product.format,
      product.price,
      product.stock_quantity,
      id
    ]
  );

  return result.rows[0];
}

export async function deleteProductById(id) {
  const result = await pool.query(
    `DELETE FROM products
     WHERE product_id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
}