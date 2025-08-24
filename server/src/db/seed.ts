import {reset, seed} from 'drizzle-seed'
import { db, sql } from './connection'
import { schema } from './schema/index.ts'
import { questions } from './schema/questions.ts';


  await reset(db, schema);
  await seed(db, schema).refine((f) => ({
    rooms: {
      count: 5,
      columns: {
        name: f.companyName(),
        description: f.loremIpsum()
      },
    },
    questions: {
      count: 10,
    },
  }))
    

  await sql.end()

  console.log('Database seeded successfully');
  
