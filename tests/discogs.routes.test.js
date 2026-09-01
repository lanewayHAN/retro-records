import { jest } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

const originalFetch = global.fetch;

describe("Discogs API", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test("GET /api/discogs/search with valid query returns 200", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            id: 7445961,
            title: "Nirvana - Nirvana",
            year: 2015,
            country: "Europe",
            format: ["Vinyl"],
            genre: ["Rock"],
            style: ["Grunge"],
            cover_image: "https://example.com/nirvana.jpg",
            resource_url: "https://api.discogs.com/releases/7445961"
          }
        ]
      })
    });

    const response = await request(app)
      .get("/api/discogs/search?q=nirvana");

    expect(response.status).toBe(200);
    expect(response.body.source).toBe("discogs");
    expect(response.body.fallback).toBe(false);
    expect(Array.isArray(response.body.results)).toBe(true);
  });

  test("GET /api/discogs/search without query returns 400", async () => {
    const response = await request(app)
      .get("/api/discogs/search");

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "ValidationError",
      message: "Search query is required"
    });
  });

  test("Discogs search result is mapped into Retro Records format", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            id: 12345,
            title: "Fleetwood Mac - Rumours",
            year: 1977,
            country: "US",
            format: ["Vinyl"],
            genre: ["Rock"],
            style: ["Pop Rock"],
            cover_image: "https://example.com/rumours.jpg",
            resource_url: "https://api.discogs.com/releases/12345"
          }
        ]
      })
    });

    const response = await request(app)
      .get("/api/discogs/search?q=rumours");

    expect(response.status).toBe(200);

    expect(response.body.results[0]).toEqual({
      discogs_release_id: 12345,
      title: "Fleetwood Mac - Rumours",
      year: 1977,
      country: "US",
      format: ["Vinyl"],
      genre: ["Rock"],
      style: ["Pop Rock"],
      cover_image: "https://example.com/rumours.jpg",
      resource_url: "https://api.discogs.com/releases/12345"
    });
  });

  test("Discogs failure returns fallback response", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    global.fetch.mockRejectedValue(
      new Error("Discogs network failure")
    );

    const response = await request(app)
      .get("/api/discogs/search?q=nirvana");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      source: "fallback",
      fallback: true,
      message: "Discogs is temporarily unavailable",
      results: []
    });

    consoleSpy.mockRestore();
  });
});