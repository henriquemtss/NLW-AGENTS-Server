import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockTranscribeAudio,
  mockGenerateEmbeddings,
  mockInsert,
  mockFile,
  mockReply,
} = vi.hoisted(() => {
  return {
    mockTranscribeAudio: vi.fn().mockResolvedValue("Transcrição simulada."),
    mockGenerateEmbeddings: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    mockInsert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([
        { id: "mock-chunk-id", transcription: "Transcrição simulada.", embeddings: [0.1, 0.2, 0.3] },
      ]),
    }),
    mockFile: vi.fn(),
    mockReply: {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    },
  };
});


vi.mock("../env.ts", () => ({
  env: {
    DATABASE_URL: "postgresql://localhost:5432/mockdb",
    GEMINI_API_KEY: "fake-api-key",
  },
}));


vi.mock("../services/gemini.ts", () => ({
  transcribeAudio: mockTranscribeAudio,
  generateEmbeddings: mockGenerateEmbeddings,
}));


vi.mock("../db/connection.ts", () => ({
  db: {
    insert: mockInsert,
  },
}));

vi.mock("../db/schema/index.ts", () => ({
  schema: {
    audioChunks: "audio_chunks_mock",
  },
}));


import { uploadAudioRoute } from "../http/routes/upload-audio";

// @ts-ignore
function getHandlerFromRoute(routeModule) {

  let handler: any;
  const mockApp = {
    post: (_path: string, _opts: any, fn: any) => {
      handler = fn;
    },
  };
  routeModule(mockApp as any);
  return handler;
}

describe("uploadAudioRoute (teste unitário puro, sem Fastify)", () => {
  let handler: any;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = getHandlerFromRoute(uploadAudioRoute);
  });

  it("deve transcrever o áudio, gerar embeddings e salvar no banco", async () => {
   
    const fakeBuffer = Buffer.from("fake-audio");
    mockFile.mockResolvedValue({
      toBuffer: vi.fn().mockResolvedValue(fakeBuffer),
      mimetype: "audio/mp3",
    });

    const mockRequest = {
      params: { roomId: "room123" },
      file: mockFile,
    };

    const mockReplyObj = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };


    await handler(mockRequest as any, mockReplyObj as any);


    expect(mockFile).toHaveBeenCalledOnce();
    expect(mockTranscribeAudio).toHaveBeenCalledWith(fakeBuffer.toString("base64"), "audio/mp3");
    expect(mockGenerateEmbeddings).toHaveBeenCalledWith("Transcrição simulada.");
    expect(mockInsert).toHaveBeenCalled();
    expect(mockReplyObj.status).toHaveBeenCalledWith(201);
    expect(mockReplyObj.send).toHaveBeenCalledWith({ chunkId: "mock-chunk-id" });
  });

  it("deve lançar erro se nenhum áudio for enviado", async () => {
    const mockRequest = {
      params: { roomId: "room123" },
      file: vi.fn().mockResolvedValue(null),
    };

    await expect(handler(mockRequest as any, mockReply as any)).rejects.toThrow("Audio is required.");
  });

  it("deve lançar erro se não conseguir salvar o chunk no banco", async () => {
    mockFile.mockResolvedValue({
      toBuffer: vi.fn().mockResolvedValue(Buffer.from("fake")),
      mimetype: "audio/mp3",
    });


    mockInsert.mockReturnValueOnce({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]), 
    });

    const mockRequest = {
      params: { roomId: "room123" },
      file: mockFile,
    };

    await expect(handler(mockRequest as any, mockReply as any)).rejects.toThrow("Erro ao salvar chunk de áudio");
  });
});
