import request from "supertest";
import app from "../src/app.js";
import pool from "../src/db.js";

describe("User API", () => {
  beforeEach(async () => {
    await pool.query(
      "TRUNCATE TABLE orders, products, users RESTART IDENTITY CASCADE"
    );

    await pool.query(`
      INSERT INTO users
        (name, email, phone, password_hash, role)
      VALUES
        ('John Customer', 'john@example.com', '0400000001', 'hash1', 'customer'),
        ('Sarah Staff', 'sarah@retrorecords.com', '0400000002', 'hash2', 'staff'),
        ('Alex Admin', 'alex@retrorecords.com', '0400000003', 'hash3', 'admin')
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  test("GET /api/users returns 200 and JSON array", async () => {
    const response = await request(app)
      .get("/api/users");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(3);
  });

  test("GET /api/users/1 returns one user with 200", async () => {
    const response = await request(app)
      .get("/api/users/1");

    expect(response.status).toBe(200);
    expect(response.body.user_id).toBe(1);
    expect(response.body.name).toBe("John Customer");
    expect(response.body.role).toBe("customer");

    expect(response.body.password_hash).toBeUndefined();
  });

  test("GET /api/users/999 returns 404", async () => {
    const response = await request(app)
      .get("/api/users/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "NotFound",
      message: "User not found"
    });
  });

  test("POST /api/users creates a user with 201", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        name: "Test Customer",
        email: "testcustomer@example.com",
        phone: "0400000099",
        password_hash: "temporary_hash",
        role: "customer"
      });

    expect(response.status).toBe(201);
    expect(response.body.user_id).toBeDefined();
    expect(response.body.name).toBe("Test Customer");
    expect(response.body.email).toBe("testcustomer@example.com");

    expect(response.body.password_hash).toBeUndefined();
  });

  test("POST /api/users with invalid email returns 400", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        name: "Bad User",
        email: "not-an-email",
        phone: "0400000088",
        password_hash: "temporary_hash",
        role: "customer"
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("ValidationError");
    expect(response.body.message).toBe("email must be valid");
  });

  test("PUT /api/users/1 replaces a user with 200", async () => {
    const response = await request(app)
      .put("/api/users/1")
      .send({
        name: "Updated Customer",
        email: "updated@example.com",
        phone: "0400000077",
        password_hash: "updated_hash",
        role: "customer"
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated Customer");
    expect(response.body.email).toBe("updated@example.com");
    expect(response.body.phone).toBe("0400000077");
    expect(response.body.password_hash).toBeUndefined();
  });

  test("PUT /api/users/999 returns 404", async () => {
    const response = await request(app)
      .put("/api/users/999")
      .send({
        name: "Unknown User",
        email: "unknown@example.com",
        phone: "0400000000",
        password_hash: "unknown_hash",
        role: "customer"
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("NotFound");
  });

  test("PATCH /api/users/1 partially updates a user with 200", async () => {
    const response = await request(app)
      .patch("/api/users/1")
      .send({
        phone: "0400000066"
      });

    expect(response.status).toBe(200);
    expect(response.body.phone).toBe("0400000066");

    // Other fields should stay unchanged
    expect(response.body.name).toBe("John Customer");
    expect(response.body.email).toBe("john@example.com");
    expect(response.body.role).toBe("customer");
  });

  test("PATCH /api/users/999 returns 404", async () => {
    const response = await request(app)
      .patch("/api/users/999")
      .send({
        phone: "0400000066"
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("NotFound");
  });

  test("DELETE /api/users/1 removes a user with 204", async () => {
    const response = await request(app)
      .delete("/api/users/1");

    expect(response.status).toBe(204);

    const check = await request(app)
      .get("/api/users/1");

    expect(check.status).toBe(404);
  });

  test("DELETE /api/users/999 returns 404", async () => {
    const response = await request(app)
      .delete("/api/users/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("NotFound");
  });
});