import axios from 'axios';
import { describe, it, expect, beforeAll } from 'vitest';

const baseUrl = 'http://localhost:3333';
let roomId: string;

describe('API Integration Tests', () => {

  it('Health Check', async () => {
    const response = await axios.get(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status', 'ok'); // depende do seu retorno
  });

  it('Cria Sala', async () => {
    const response = await axios.post(`${baseUrl}/rooms`, {
      name: 'Sala de Teste',
      description: 'Room Description'
    });
    expect(response.status).toBe(201); // ou 200 dependendo da API
    expect(response.data).toHaveProperty('roomId');
    roomId = response.data.roomId;
  });

  it('Verifica Sala', async () => {
    const response = await axios.get(`${baseUrl}/rooms`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('Cria Questao', async () => {
    if (!roomId) throw new Error('Room ID not set');
    const response = await axios.post(`${baseUrl}/rooms/${roomId}/questions`, {
      question: 'O que é Java?'
    });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('questionId');
  });

  it('Verifica Questoes na sala', async () => {
    if (!roomId) throw new Error('Room ID not set');
    const response = await axios.get(`${baseUrl}/rooms/${roomId}/questions`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

});
