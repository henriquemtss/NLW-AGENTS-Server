import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection";
import { schema } from "../../db/schema";
import { z } from "zod/v4";
import { desc, eq } from "drizzle-orm";

export const getRoomsQuestions: FastifyPluginCallbackZod =  (app) => {
    app.get('/rooms/:roomId/questions', {
        schema: {
            params: z.object ({
                roomId: z.string(),
            })
        }
    }, 
    async (request) => {
        const { roomId} = request.params
        const result = await db
        .select({
            id: schema.questions.id,
            question: schema.questions.question,
            amswer: schema.questions.amswer,
            creayedAt: schema.questions.createdAt,
        })
        .from(schema.questions)
        .where(eq(schema.questions.roomId, roomId))
        .orderBy(desc(schema.questions.createdAt))
        
        return result
    })
}
