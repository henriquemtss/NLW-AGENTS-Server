import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import Fastify from "fastify";
import { getRoomsRoute } from "../http/routes/get-room";
import { db } from "../db/connection";

let mockRooms: any[] = [];

vi.mock("../db/connection", () => {
  const chain = {
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((resolve: any) => resolve(mockRooms)), 
  };

  return {
    db: {
      select: vi.fn(() => chain),
    },
  };
});

describe("GET /rooms", () => {
  const app = Fastify();

  beforeAll(async () => {
    app.register(getRoomsRoute);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("deve retornar a lista de salas com sucesso", async () => {
    const fixedDate = new Date().toISOString();

    mockRooms = [
      {
        id: "1",
        name: "Sala Teste",
        createdAt: fixedDate, 
        questionsCount: 2,
      },
    ];

    const response = await app.inject({
      method: "GET",
      url: "/rooms",
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockRooms);
  });
});
