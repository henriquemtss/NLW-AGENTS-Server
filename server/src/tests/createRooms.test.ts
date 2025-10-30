import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'
import { RouteOptions } from 'fastify' // ✅ importa o tipo correto
import { createRoomsRoute } from '../http/routes/create-room'

// Cria o mock do módulo de conexão
vi.mock('../db/connection', () => {
  const mockReturning = vi.fn()
  const mockValues = vi.fn(() => ({ returning: mockReturning }))
  const mockInsert = vi.fn(() => ({ values: mockValues }))

  return {
    db: { insert: mockInsert },
    __mocks: { mockInsert, mockValues, mockReturning },
  }
})

vi.mock('../db/schema', () => ({
  schema: { rooms: 'rooms_table' },
}))

describe('createRoomsRoute', () => {
  let app: ReturnType<typeof Fastify>
  let mocks: any

  beforeEach(async () => {
    vi.clearAllMocks()
    // Importa o mock dinamicamente (com os mocks dentro dele)
    mocks = await vi.importMock('../db/connection')

    app = Fastify()
    // Desativa validação de schema no ambiente de teste
app.addHook('onRoute', (routeOptions: RouteOptions) => {
  if (routeOptions.schema) {
    delete routeOptions.schema
  }
})

await app.register(createRoomsRoute)

    await app.ready()
  })

  it('deve criar uma sala com sucesso', async () => {
    const { mockInsert, mockReturning } = mocks.__mocks
    const mockInsertedRoom = { id: '123', name: 'Sala A', description: 'Teste' }

    mockReturning.mockResolvedValueOnce([mockInsertedRoom])

    const response = await app.inject({
      method: 'POST',
      url: '/rooms',
      payload: { name: 'Sala A', description: 'Teste' },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({ roomId: '123' })
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('deve lançar erro se a inserção falhar', async () => {
    const { mockReturning } = mocks.__mocks
    mockReturning.mockResolvedValueOnce([])

    const response = await app.inject({
      method: 'POST',
      url: '/rooms',
      payload: { name: 'Falha' },
    })

    expect(response.statusCode).toBe(500)
    expect(response.body).toContain('Failed to create new room')
  })

  it('deve retornar erro 500 se o nome estiver vazio', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/rooms',
      payload: { name: '' },
    })

    expect(response.statusCode).toBe(500)
  })
})
