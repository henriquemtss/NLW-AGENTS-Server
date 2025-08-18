import { pgTable, uuid, text, timestamp} from 'drizzle-orm/pg-core';
import { rooms } from './rooms';

export const questions = pgTable('questions', {
    id: uuid('id').primaryKey().defaultRandom(),
    roomId: uuid().references(() => rooms.id).notNull(),
    questions: text().notNull(),
    amswer: text(),
    createdAt: timestamp().defaultNow().notNull()
})