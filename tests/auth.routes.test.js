import request from "supertest";
import app from "../src/app.js";
import pool from "../src/db.js";

describe("Authentication API", () => {
  beforeEach(async () => {
    await pool.query(
      "TRUNCATE TABLE orders, products, users RESTART IDENTITY CASCADE"
    );

    await pool.query(`
      INSERT INTO users
        (name, email, phone, password_hash, role)
      VALUES
        (
          'John Customer',
          'john@example.com',
          '0400000001',
          '$2b$10$e7y5Ci0jusyWuk5VT4L0d.d0PgSdU.38vEnoNjpP91k7ionrzwGGe',
          'customer'
        )
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  test("POST /api/auth/login returns 200 and JWT for valid login", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "john@example.com",
        password: "password123"
      });

    expect(response.status).toBe(200);

    expect(response.body.token).toBeDefined();

    expect(response.body.user).toEqual({
      user_id: 1,
      name: "John Customer",
      email: "john@example.com",
      role: "customer"
    });
  });

  test("POST /api/auth/login with wrong password returns 401", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "john@example.com",
        password: "wrongpassword"
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      error: "Unauthorized",
      message: "Invalid email or password"
    });
  });

  test("POST /api/auth/login with unknown email returns 401", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "unknown@example.com",
        password: "password123"
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      error: "Unauthorized",
      message: "Invalid email or password"
    });
  });
});