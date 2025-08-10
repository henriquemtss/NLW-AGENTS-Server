import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection";
import { schema } from "../../db/schema";

export const getRoomsRoute: FastifyPluginCallbackZod =  (app) => {
    app.get('/rooms', async () => {
        const results = await db
        .select({
            id: schema.rooms.id,
            name: schema.rooms.name
        })
        .from(schema.rooms)
        .orderBy(schema.rooms.creayedAt)

        return results
    })
}
