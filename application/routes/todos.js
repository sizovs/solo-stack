import { db } from "../modules/database/connect.js";
import { Layout } from "../views/Layout.js";
import { TodoError, Todos } from "../views/Todos.js";

/**
 * @param {{ app: import("fastify").FastifyInstance }}
 */
export const initTodos = async ({ app }) => {
  app.get("/todos", async (request, reply) => {
    return todos();
  });

  app.post("/todos/:id/delete", async (request, reply) => {
    db.sql`delete from todos where id = ${request.params.id}`.run();
    return todos();
  });

  app.post("/todos", async (request, reply) => {
    const description = request.body.description?.trim();
    if (!description) {
      return TodoError({ error: "Task description is required" }).render();
    }

    db.sql`insert into todos (description) values (${description})`.run();
    return todos();
  });

  const todos = async () => {
    const todos = db.sql`select * from todos`.all();
    return Layout(Todos({ todos })).render();
  };
};
