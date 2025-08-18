import {fastifyCors} from '@fastify/cors'
import { fastify } from 'fastify';
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { env } from './env'
import { getRoomsRoute } from './http/routes/get-room';
import { createRoomsRoute } from './http/routes/create-room';
import { getRoomsQuestions } from './http/routes/get-room-questions';
import { createQuestionRoute } from './http/routes/create-question';

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
    origin: 'http://localhost:5173',
})

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.get('/health', () =>{
    return { status: 'ok' }
})

app.register(getRoomsRoute)
app.register(createRoomsRoute)
app.register(getRoomsQuestions)
app.register(createQuestionRoute)

app.listen({ port: env.PORT })