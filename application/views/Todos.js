import { html } from "../modules/html.js";

export const Todos = ({ todos }) => html`
  <main id="main">
    <style>
      me {
        margin: 0 auto;
        max-width: var(--width-xs);
        margin-top: var(--size-8);
      }
      me h1 {
        font-size: var(--scale-6);
        margin-bottom: var(--size-4);
        letter-spacing: var(--letter-xs);
      }
    </style>
    <h1 data-testid="todo-count">
      ${todos.length} todo${todos.length === 1 ? "" : "s"}
    </h1>
    ${todos.map((todo) => Todo(todo))}
    <fetch-it>
      <form action="/todos" method="post">
        <input
          type="text"
          data-testid="todo-input"
          placeholder="Type description and hit enter..."
          autofocus
          name="description"
        />
      </form>
    </fetch-it>
    ${TodoError()}
  </main>
`;

export const Todo = (todo) => html`
  <label data-testid="todo-item">
    <style>
      me {
        margin-bottom: var(--size-3);
      }
    </style>
    <fetch-it>
      <form action="/todos/${todo.id}/delete" method="post">
        <input
          type="checkbox"
          onChange="this.form.querySelector('[type=submit]').click()"
        />
        <button type="submit" hidden></button>
      </form> </fetch-it
    >${todo.description}
  </label>
`;

export const TodoError = ({ error = "" } = {}) => html`
  <small data-testid="todo-error" id="todo-error"
    >${error}
    <style>
      me {
        color: var(--color-red-600);
      }
    </style>
  </small>
`;
