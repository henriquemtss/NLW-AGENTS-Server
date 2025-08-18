import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection";
import { schema } from "../../db/schema";
import { eq, count } from "drizzle-orm";
import { questions } from "../../db/schema/questions";


export const getRoomsRoute: FastifyPluginCallbackZod =  (app) => {
    app.get('/rooms', async () => {
        const results = await db
        .select({
            id: schema.rooms.id,
            name: schema.rooms.name,
            createdAt: schema.rooms.createdAt,
            questionsCount: count(schema.questions.id),
        })
        .from(schema.rooms)
        .leftJoin(schema.questions, eq(schema.rooms.id, schema.questions.roomId))
        .groupBy(schema.rooms.id)
        .orderBy(schema.rooms.createdAt)

        return results
    })
}
