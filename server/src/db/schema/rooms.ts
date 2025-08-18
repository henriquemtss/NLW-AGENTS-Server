import { pgTable, uuid, text, timestamp} from 'drizzle-orm/pg-core';

export const rooms = pgTable('rooms', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text().notNull(),
    description: text(),
    createdAt: timestamp().defaultNow().notNull()
})