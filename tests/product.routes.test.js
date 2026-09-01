import request from "supertest";
import app from "../src/app.js";
import pool from "../src/db.js";
import { createTestToken } from "./helpers/auth.js";

describe("Product API", () => {
  let staffToken;

  beforeEach(async () => {
    staffToken = createTestToken("staff");

    await pool.query(
      "TRUNCATE TABLE orders, products, users RESTART IDENTITY CASCADE"
    );

    await pool.query(`
      INSERT INTO products
        (discogs_release_id, album_name, artist, format, price, stock_quantity)
      VALUES
        (249504, 'Rumours', 'Fleetwood Mac', 'Vinyl', 50.00, 10),
        (367084, 'Nevermind', 'Nirvana', 'CD', 25.00, 8)
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  test("GET /api/products returns 200 and JSON array", async () => {
    const response = await request(app)
      .get("/api/products");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
  });

  test("GET /api/products/1 returns one product with 200", async () => {
    const response = await request(app)
      .get("/api/products/1");

    expect(response.status).toBe(200);
    expect(response.body.product_id).toBe(1);
    expect(response.body.album_name).toBe("Rumours");
  });

  test("GET /api/products/999 returns 404", async () => {
    const response = await request(app)
      .get("/api/products/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "NotFound",
      message: "Product not found"
    });
  });

  test("POST /api/products creates a product with staff token and returns 201", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        discogs_release_id: 999001,
        album_name: "Back in Black",
        artist: "AC/DC",
        format: "Vinyl",
        price: 49.00,
        stock_quantity: 6
      });

    expect(response.status).toBe(201);
    expect(response.body.album_name).toBe("Back in Black");
    expect(response.body.product_id).toBeDefined();
  });

  test("POST /api/products without token returns 401", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({
        discogs_release_id: 999001,
        album_name: "Unauthorized Album",
        artist: "Test Artist",
        format: "Vinyl",
        price: 30,
        stock_quantity: 5
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Unauthorized");
  });

  test("POST /api/products with customer token returns 403", async () => {
    const customerToken = createTestToken("customer");

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        discogs_release_id: 999002,
        album_name: "Forbidden Album",
        artist: "Test Artist",
        format: "Vinyl",
        price: 30,
        stock_quantity: 5
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Forbidden");
  });

  test("POST /api/products with invalid data returns 400", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        album_name: "Bad Product",
        artist: "Test Artist",
        format: "Vinyl",
        price: -10,
        stock_quantity: 5
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("ValidationError");
  });

  test("PUT /api/products/1 replaces a product with 200", async () => {
    const response = await request(app)
      .put("/api/products/1")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        discogs_release_id: 249504,
        album_name: "Rumours - Remastered",
        artist: "Fleetwood Mac",
        format: "Vinyl",
        price: 60.00,
        stock_quantity: 4
      });

    expect(response.status).toBe(200);
    expect(response.body.album_name).toBe("Rumours - Remastered");
    expect(response.body.price).toBe("60.00");
    expect(response.body.stock_quantity).toBe(4);
  });

  test("PUT /api/products/999 returns 404", async () => {
    const response = await request(app)
      .put("/api/products/999")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        discogs_release_id: 999999,
        album_name: "Unknown Album",
        artist: "Unknown Artist",
        format: "Vinyl",
        price: 20.00,
        stock_quantity: 1
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("NotFound");
  });

  test("PATCH /api/products/1 partially updates a product with 200", async () => {
    const response = await request(app)
      .patch("/api/products/1")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        price: 65.00
      });

    expect(response.status).toBe(200);
    expect(response.body.price).toBe("65.00");
    expect(response.body.album_name).toBe("Rumours");
    expect(response.body.artist).toBe("Fleetwood Mac");
  });

  test("PATCH /api/products/999 returns 404", async () => {
    const response = await request(app)
      .patch("/api/products/999")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        price: 40.00
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("NotFound");
  });

  test("DELETE /api/products/1 removes a product with 204", async () => {
    const response = await request(app)
      .delete("/api/products/1")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(204);

    const check = await request(app)
      .get("/api/products/1");

    expect(check.status).toBe(404);
  });

  test("DELETE /api/products/999 returns 404", async () => {
    const response = await request(app)
      .delete("/api/products/999")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("NotFound");
  });
});