import {reset, seed} from 'drizzle-seed'
import { db } from './connection'
import { schema } from './schema/index.ts'


  await reset(db, schema);
  await seed(db, schema).refine((f) => ({
    rooms: {
      count: 10,
      columns: {
        name: f.companyName(),
        description: f.loremIpsum()
      }
    }
  }))
    
