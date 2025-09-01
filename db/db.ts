import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// A variável de ambiente DATABASE_URL é verificada na função do handler
// para fornecer uma mensagem de erro mais clara para o frontend.
// O '!' é usado para afirmar que a variável existirá, pois o handler irá
// interceptar a requisição antes se ela não estiver definida.
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
