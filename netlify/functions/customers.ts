import type { Handler } from "@netlify/functions";
import { db } from "../../db/db";
import { customers } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

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
  } catch (error) {
    console.error("Erro no banco de dados:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno do servidor." }),
    };
  }
};
