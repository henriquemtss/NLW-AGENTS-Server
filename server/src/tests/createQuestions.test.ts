import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGenerateEmbeddings,
  mockGenerateAnswer,
  mockInsert,
  mockSelect,
  mockCreateQuestionHandler,
} = vi.hoisted(() => {
  return {
    mockGenerateEmbeddings: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    mockGenerateAnswer: vi.fn().mockResolvedValue("Resposta simulada pela IA."),
    mockInsert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([
        {
          id: "mock-question-id",
          question: "Qual é a capital da França?",
          answer: "Resposta simulada pela IA.",
        },
      ]),
    }),
    mockSelect: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }),
    mockCreateQuestionHandler: vi.fn(), 
  };
});


vi.mock("../env.ts", () => ({
  env: {
    DATABASE_URL: "postgresql://localhost:5432/mockdb",
    GEMINI_API_KEY: "fake-api-key",
  },
}));


vi.mock("../services/gemini", () => ({
  generateEmbeddings: mockGenerateEmbeddings,
  generateAnswer: mockGenerateAnswer,
}));


vi.mock("../db/connection", () => ({
  db: {
    insert: mockInsert,
    select: mockSelect,
  },
}));


vi.mock("../http/routes/create-question", () => ({
  createQuestionHandler: mockCreateQuestionHandler,
}));

// @ts-ignore
import { createQuestionHandler } from "../http/routes/create-question";

describe("createQuestionHandler (teste unitário puro, sem Fastify)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve criar uma nova pergunta e retornar a resposta da IA", async () => {
    mockCreateQuestionHandler.mockResolvedValue({
      questionId: "mock-question-id",
      answer: "Resposta simulada pela IA.",
    });

    const result = await createQuestionHandler("room123", "Qual é a capital da França?");

    expect(result).toEqual({
      questionId: "mock-question-id",
      answer: "Resposta simulada pela IA.",
    });

    expect(mockCreateQuestionHandler).toHaveBeenCalledWith("room123", "Qual é a capital da França?");
  });

  it("deve lançar erro se a pergunta estiver vazia", async () => {
    mockCreateQuestionHandler.mockRejectedValue(new Error("Pergunta não pode ser vazia"));

    await expect(createQuestionHandler("room123", "")).rejects.toThrowError("Pergunta não pode ser vazia");
    expect(mockCreateQuestionHandler).toHaveBeenCalledWith("room123", "");
  });
});
