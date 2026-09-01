import pool from "../db.js";

export async function getAllOrders() {
  const result = await pool.query(
    `SELECT *
     FROM orders
     ORDER BY order_id`
  );

  return result.rows;
}

export async function getOrderById(id) {
  const result = await pool.query(
    `SELECT *
     FROM orders
     WHERE order_id = $1`,
    [id]
  );

  return result.rows[0];
}

export async function createOrder(order) {
  const {
    customer_id,
    created_by,
    product_id,
    quantity,
    status,
    total_amount
  } = order;

  const result = await pool.query(
    `INSERT INTO orders
      (customer_id, created_by, product_id, quantity, status, total_amount)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      customer_id,
      created_by,
      product_id,
      quantity,
      status,
      total_amount
    ]
  );

  return result.rows[0];
}

export async function replaceOrderById(id, order) {
  const {
    customer_id,
    created_by,
    product_id,
    quantity,
    status,
    total_amount
  } = order;

  const result = await pool.query(
    `UPDATE orders
     SET customer_id = $1,
         created_by = $2,
         product_id = $3,
         quantity = $4,
         status = $5,
         total_amount = $6
     WHERE order_id = $7
     RETURNING *`,
    [
      customer_id,
      created_by,
      product_id,
      quantity,
      status,
      total_amount,
      id
    ]
  );

  return result.rows[0];
}

export async function updateOrderById(id, order) {
  const result = await pool.query(
    `UPDATE orders
     SET customer_id = COALESCE($1, customer_id),
         created_by = COALESCE($2, created_by),
         product_id = COALESCE($3, product_id),
         quantity = COALESCE($4, quantity),
         status = COALESCE($5, status),
         total_amount = COALESCE($6, total_amount)
     WHERE order_id = $7
     RETURNING *`,
    [
      order.customer_id,
      order.created_by,
      order.product_id,
      order.quantity,
      order.status,
      order.total_amount,
      id
    ]
  );

  return result.rows[0];
}

export async function deleteOrderById(id) {
  const result = await pool.query(
    `DELETE FROM orders
     WHERE order_id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
}