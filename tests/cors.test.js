import request from "supertest";
import app from "../src/app.js";

describe("CORS", () => {
  test("GET request includes CORS header", async () => {
    const response = await request(app)
      .get("/route-that-does-not-exist")
      .set("Origin", "http://example.com");

    expect(response.status).toBe(404);
    expect(response.headers["access-control-allow-origin"]).toBe("*");
  });

  test("OPTIONS pre-flight request is supported", async () => {
    const response = await request(app)
      .options("/api/products")
      .set("Origin", "http://example.com")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("*");

    expect(
      response.headers["access-control-allow-methods"]
    ).toMatch(/GET/);

    expect(
      response.headers["access-control-allow-methods"]
    ).toMatch(/POST/);

    expect(
      response.headers["access-control-allow-methods"]
    ).toMatch(/PUT/);

    expect(
      response.headers["access-control-allow-methods"]
    ).toMatch(/PATCH/);

    expect(
      response.headers["access-control-allow-methods"]
    ).toMatch(/DELETE/);
  });
});