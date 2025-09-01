import type { Handler } from "@netlify/functions";
import { db } from "../../db/db";
import { customers } from "../../db/schema";
import { eq, desc, sql } from "drizzle-orm";

// Função para garantir que a tabela de clientes exista no banco de dados.
// Isso evita erros na primeira execução ou em um banco de dados vazio.
const ensureTableExists = async () => {
  try {
    // Usamos SQL bruto porque o Drizzle ORM não tem um "CREATE TABLE IF NOT EXISTS" nativo.
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "customers" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "phone" text NOT NULL
      );
    `);
  } catch (error) {
    console.error("Erro ao tentar criar ou verificar a tabela 'customers':", error);
    // Propaga o erro original para que a mensagem de erro detalhada seja enviada ao frontend.
    throw error;
  }
};


export const handler: Handler = async (event) => {
  // Validação da variável de ambiente do banco de dados.
  // Isso garante que o frontend receba um erro claro se a conexão não for configurada.
  if (!process.env.DATABASE_URL) {
    const errorMessage = "A variável de ambiente DATABASE_URL não está configurada.";
    console.error(errorMessage);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: errorMessage }),
    };
  }
  
  const { httpMethod, body } = event;

  try {
    // Garante que a tabela existe antes de qualquer operação.
    await ensureTableExists();
    
    switch (httpMethod) {
      case "GET": {
        const allCustomers = await db.query.customers.findMany({
            orderBy: [desc(customers.id)],
        });
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allCustomers),
        };
      }

      case "POST": {
        if (!body) {
          return { statusCode: 400, body: JSON.stringify({ error: "Corpo da requisição ausente." }) };
        }
        const { name, phone } = JSON.parse(body);
        if (!name || !phone) {
          return { statusCode: 400, body: JSON.stringify({ error: "Nome e telefone são obrigatórios." }) };
        }
        const [newCustomer] = await db.insert(customers).values({ name, phone }).returning();
        return {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCustomer),
        };
      }

      case "DELETE": {
         if (!body) {
          return { statusCode: 400, body: JSON.stringify({ error: "Corpo da requisição ausente." }) };
        }
        const { id } = JSON.parse(body);
        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: "ID do cliente é obrigatório." }) };
        }
        const [deletedCustomer] = await db.delete(customers).where(eq(customers.id, id)).returning();
         if (!deletedCustomer) {
           return { statusCode: 404, body: JSON.stringify({ error: "Cliente não encontrado." }) };
         }
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: "Cliente removido com sucesso.", id }),
        };
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: "Método não permitido." }),
        };
    }
  } catch (error: any) {
    console.error("Erro no handler:", error);
    // Retorna uma mensagem de erro mais detalhada para o frontend.
    const errorMessage = error.message || "Erro interno do servidor.";
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};