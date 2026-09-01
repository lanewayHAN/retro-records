import { jest } from "@jest/globals";
import request from "supertest";

const mockPoolQuery = jest.fn();
const mockCheckRabbitMQ = jest.fn();

jest.unstable_mockModule(
  "../src/db.js",
  () => ({
    default: {
      query: mockPoolQuery
    }
  })
);

jest.unstable_mockModule(
  "../src/messaging/rabbitmq.js",
  () => ({
    connectRabbitMQ: jest.fn(),
    publishMessage: jest.fn(),
    checkRabbitMQ: mockCheckRabbitMQ,
    closeRabbitMQ: jest.fn()
  })
);

const { default: app } = await import("../src/app.js");

describe("Health API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /health returns 200 when PostgreSQL and RabbitMQ are up", async () => {
    mockPoolQuery.mockResolvedValue({
      rows: [{ "?column?": 1 }]
    });

    mockCheckRabbitMQ.mockResolvedValue(true);

    const response = await request(app)
      .get("/health");

    expect(response.status).toBe(200);

    expect(response.body.status).toBe("healthy");
    expect(response.body.service).toBe("retro-records-api");

    expect(response.body.dependencies).toEqual({
      postgresql: "up",
      rabbitmq: "up"
    });

    expect(response.body.timestamp).toBeDefined();
  });

  test("GET /health returns 503 when PostgreSQL is down", async () => {
    mockPoolQuery.mockRejectedValue(
      new Error("PostgreSQL unavailable")
    );

    mockCheckRabbitMQ.mockResolvedValue(true);

    const response = await request(app)
      .get("/health");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("degraded");

    expect(response.body.dependencies).toEqual({
      postgresql: "down",
      rabbitmq: "up"
    });
  });

  test("GET /health returns 503 when RabbitMQ is down", async () => {
    mockPoolQuery.mockResolvedValue({
      rows: [{ "?column?": 1 }]
    });

    mockCheckRabbitMQ.mockResolvedValue(false);

    const response = await request(app)
      .get("/health");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("degraded");

    expect(response.body.dependencies).toEqual({
      postgresql: "up",
      rabbitmq: "down"
    });
  });
});