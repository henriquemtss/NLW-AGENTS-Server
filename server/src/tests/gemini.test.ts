import { vi, describe, it, expect, beforeEach } from 'vitest'

// Usamos vi.hoisted para garantir que nossas variáveis de mock
// sejam criadas ANTES de qualquer importação ou execução de mocks.
// Isso resolve o "ReferenceError" de inicialização de uma vez por todas.
const { mockGenerateContent, mockEmbedContent } = vi.hoisted(() => {
  return {
    mockGenerateContent: vi.fn(),
    mockEmbedContent: vi.fn(),
  }
})

// --- Mock do Módulo de Ambiente ---
vi.mock('../env.ts', () => ({
  env: {
    GEMINI_API_KEY: 'fake-api-key-para-o-teste',
  },
}))

// --- Mock da biblioteca @google/genai ---
// Agora este mock pode usar as variáveis criadas e "içadas" pelo vi.hoisted sem erros.
vi.mock('@google/genai', () => {
  const GoogleGenAI = vi.fn().mockImplementation(() => {
    return {
      models: {
        generateContent: mockGenerateContent,
        embedContent: mockEmbedContent,
      },
    }
  })
  return { GoogleGenAI }
})

// Agora que todos os mocks estão configurados corretamente, importamos o módulo a ser testado.
import { transcribeAudio, generateEmbeddings, generateAnswer } from '../services/gemini'

describe('Serviço do Gemini', () => {
  // O beforeEach limpa o ESTADO dos mocks, não a sua existência.
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('transcribeAudio', () => {
    it('deve transcrever o áudio com sucesso e retornar o texto', async () => {
      const audioAsBase64 = 'dados-falsos-de-audio'
      const mimeType = 'audio/mp3'
      const transcricaoEsperada = 'Olá, mundo.'

      mockGenerateContent.mockResolvedValue({
        text: transcricaoEsperada,
      })

      const resultado = await transcribeAudio(audioAsBase64, mimeType)

      expect(resultado).toBe(transcricaoEsperada)
      expect(mockGenerateContent).toHaveBeenCalledOnce()
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: expect.arrayContaining([
            expect.objectContaining({ text: expect.stringContaining('Transcreva o áudio') }),
            expect.objectContaining({
              inlineData: { mimeType, data: audioAsBase64 },
            }),
          ]),
        })
      )
    })

    it('deve lançar um erro se a transcrição falhar', async () => {
      mockGenerateContent.mockResolvedValue({ text: null })

      await expect(transcribeAudio('audio', 'type')).rejects.toThrow('Não foi possível converter o áudio')
    })
  })

  describe('generateEmbeddings', () => {
    it('deve gerar os embeddings com sucesso e retornar os valores', async () => {
      const texto = 'Este é um texto de teste.'
      const embeddingsEsperados = [0.1, 0.2, 0.3, 0.4]

      mockEmbedContent.mockResolvedValue({
        embeddings: [{ values: embeddingsEsperados }],
      })

      const resultado = await generateEmbeddings(texto)

      expect(resultado).toEqual(embeddingsEsperados)
      expect(mockEmbedContent).toHaveBeenCalledOnce()
      expect(mockEmbedContent).toHaveBeenCalledWith({
        model: 'text-embedding-004',
        contents: [{ text: texto }],
        config: { taskType: 'RETRIEVAL_DOCUMENT' }
      })
    })

    it('deve lançar um erro se a geração de embeddings falhar', async () => {
      // 1. Arrange: Simula uma resposta da API sem a propriedade "embeddings"
      // Desta forma, a verificação com optional chaining (?) funcionará como esperado.
      mockEmbedContent.mockResolvedValue({})

      // 2. Act & 3. Assert
    await expect(generateEmbeddings('texto')).rejects.toThrow('Não foi possível gerar os embeddings.')
})
  })

  describe('generateAnswer', () => {
    it('deve gerar uma resposta com sucesso com base no contexto', async () => {
      // 1. Arrange
      const pergunta = 'O que é Drizzle?'
      const transcricoes = ['Drizzle é um ORM.', 'Ele é muito bom para TypeScript.']
      const respostaEsperada = 'Com base no conteúdo da aula, Drizzle é um ORM muito bom para TypeScript.'

      mockGenerateContent.mockResolvedValue({
        text: respostaEsperada,
      })
      
      // 2. Act
      const resultado = await generateAnswer(pergunta, transcricoes)

      // 3. Assert
      expect(resultado).toBe(respostaEsperada)
      expect(mockGenerateContent).toHaveBeenCalledOnce()

      const argsDaChamada = mockGenerateContent.mock.calls[0][0]
      const textoDoPrompt = argsDaChamada.contents[0].text
      
      // CORREÇÃO FINAL: Usamos trechos da string que incluem a indentação correta
      // ou que não são afetados por ela.
      const contextoEsperado = `CONTEXTO:\n    Drizzle é um ORM.\n\nEle é muito bom para TypeScript.`
      const perguntaEsperada = `PERGUNTA:\n    O que é Drizzle?`

      // Verificamos se os trechos essenciais estão no prompt gerado
      expect(textoDoPrompt).toContain('Com base no texto fornecido abaixo como contexto')
      expect(textoDoPrompt).toContain(transcricoes.join('\n\n')) // Verifica se o contexto foi inserido
      expect(textoDoPrompt).toContain(pergunta) // Verifica se a pergunta foi inserida
    })

  it('deve lançar um erro se a geração da resposta falhar', async () => {
    mockGenerateContent.mockResolvedValue({ text: null })

      await expect(generateAnswer('pergunta', ['contexto'])).rejects.toThrow('Falha ao gerar resposta pelo Gemini')
    })
  })
})