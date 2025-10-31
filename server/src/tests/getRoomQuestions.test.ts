import { describe, it, expect, beforeAll, vi } from "vitest";
import Fastify from "fastify";
import { getRoomsQuestions } from "../http/routes/get-room-questions";
import { db } from "../db/connection";
import { schema } from "../db/schema";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";


vi.mock("../db/connection", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([
      {
        id: "question-1",
        question: "O que é IA?",
        answer: "É inteligência artificial.",
        createdAt: new Date().toISOString(),
      },
    ]),
  },
}));

vi.mock("../db/schema", () => ({
  schema: {
    questions: {
      id: "id",
      question: "question",
      answer: "answer",
      createdAt: "createdAt",
      roomId: "roomId",
    },
  },
}));

describe("Rota GET /rooms/:roomId/questions", () => {
  const app = Fastify();

  beforeAll(async () => {
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(getRoomsQuestions);

    await app.ready();
  });

  it("deve retornar as perguntas da sala com sucesso", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/rooms/room-123/questions",
    });

    expect(response.statusCode).toBe(200);

    const data = response.json();
    expect(data).toBeInstanceOf(Array);
    expect(data[0]).toHaveProperty("id", "question-1");
    expect(data[0]).toHaveProperty("question", "O que é IA?");
  });

  it("deve retornar 404 se a rota não existir", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/roomsss/room-123/questions", 
    });

    expect(response.statusCode).toBe(404);
  });
});
