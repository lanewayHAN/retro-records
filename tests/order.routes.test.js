import request from "supertest";
import app from "../src/app.js";
import pool from "../src/db.js";
import { closeRabbitMQ } from "../src/messaging/rabbitmq.js";

describe("Order API", () => {
  beforeEach(async () => {
    await pool.query(
      "TRUNCATE TABLE orders, products, users RESTART IDENTITY CASCADE"
    );

    await pool.query(`
      INSERT INTO users
        (name, email, phone, password_hash, role)
      VALUES
        ('John Customer', 'john@example.com', '0400000001', 'hash1', 'customer'),
        ('Sarah Staff', 'sarah@retrorecords.com', '0400000002', 'hash2', 'staff')
    `);

    await pool.query(`
      INSERT INTO products
        (discogs_release_id, album_name, artist, format, price, stock_quantity)
      VALUES
        (249504, 'Rumours', 'Fleetwood Mac', 'Vinyl', 50.00, 10),
        (1873013, 'Dark Side of the Moon', 'Pink Floyd', 'Vinyl', 55.00, 5)
    `);

    await pool.query(`
      INSERT INTO orders
        (customer_id, created_by, product_id, quantity, status, total_amount)
      VALUES
        (1, 2, 1, 1, 'completed', 50.00),
        (1, 2, 2, 1, 'pending', 55.00)
    `);
  });

  afterAll(async () => {
  await closeRabbitMQ();
  await pool.end();
});

  test("GET /api/orders returns 200 and JSON array", async () => {
    const response = await request(app)
      .get("/api/orders");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
  });

  test("GET /api/orders/1 returns one order with 200", async () => {
    const response = await request(app)
      .get("/api/orders/1");

    expect(response.status).toBe(200);
    expect(response.body.order_id).toBe(1);
    expect(response.body.customer_id).toBe(1);
    expect(response.body.product_id).toBe(1);
    expect(response.body.status).toBe("completed");
  });

  test("GET /api/orders/999 returns 404", async () => {
    const response = await request(app)
      .get("/api/orders/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "NotFound",
      message: "Order not found"
    });
  });

  test("POST /api/orders creates an order with 201", async () => {
    const response = await request(app)
      .post("/api/orders")
      .send({
        customer_id: 1,
        created_by: 2,
        product_id: 2,
        quantity: 2,
        status: "pending",
        total_amount: 110
      });

    expect(response.status).toBe(201);
    expect(response.body.order_id).toBeDefined();
    expect(response.body.quantity).toBe(2);
    expect(response.body.status).toBe("pending");
    expect(response.body.total_amount).toBe("110.00");
  });

  test("POST /api/orders with invalid quantity returns 400", async () => {
    const response = await request(app)
      .post("/api/orders")
      .send({
        customer_id: 1,
        created_by: 2,
        product_id: 2,
        quantity: 0,
        status: "pending",
        total_amount: 55
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("ValidationError");
    expect(response.body.message).toBe(
      "quantity must be greater than 0"
    );
  });

  test("PUT /api/orders/1 replaces an order with 200", async () => {
    const response = await request(app)
      .put("/api/orders/1")
      .send({
        customer_id: 1,
        created_by: 2,
        product_id: 2,
        quantity: 2,
        status: "processing",
        total_amount: 110
      });

    expect(response.status).toBe(200);
    expect(response.body.product_id).toBe(2);
    expect(response.body.quantity).toBe(2);
    expect(response.body.status).toBe("processing");
    expect(response.body.total_amount).toBe("110.00");
  });

  test("PUT /api/orders/999 returns 404", async () => {
    const response = await request(app)
      .put("/api/orders/999")
      .send({
        customer_id: 1,
        created_by: 2,
        product_id: 1,
        quantity: 1,
        status: "pending",
        total_amount: 50
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("NotFound");
  });

  test("PATCH /api/orders/1 partially updates an order with 200", async () => {
    const response = await request(app)
      .patch("/api/orders/1")
      .send({
        status: "processing"
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("processing");

    expect(response.body.customer_id).toBe(1);
    expect(response.body.product_id).toBe(1);
    expect(response.body.quantity).toBe(1);
    expect(response.body.total_amount).toBe("50.00");
  });

  test("PATCH /api/orders/999 returns 404", async () => {
    const response = await request(app)
      .patch("/api/orders/999")
      .send({
        status: "completed"
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("NotFound");
  });

  test("DELETE /api/orders/1 removes an order with 204", async () => {
    const response = await request(app)
      .delete("/api/orders/1");

    expect(response.status).toBe(204);

    const check = await request(app)
      .get("/api/orders/1");

    expect(check.status).toBe(404);
  });

  test("DELETE /api/orders/999 returns 404", async () => {
    const response = await request(app)
      .delete("/api/orders/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("NotFound");
  });
});