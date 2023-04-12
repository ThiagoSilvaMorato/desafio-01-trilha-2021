const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todosObject = {
    id: uuidv4(),
    title,
    deadline,
    done: false,
    created_at: new Date(),
  };

  user.todos.push(todosObject);

  return response.status(201).send(todosObject);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todoId = request.params.id;
  let todoIndex = -1;

  user.todos.map((doc, index) => {
    if (doc.id === todoId) {
      todoIndex = index;
      user.todos[index].title = title;
      user.todos[index].deadline = deadline
        ? deadline
        : user.todos[index].deadline;
    }
  });

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  return response.status(201).send(user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const todoId = request.params.id;
  let todoIndex = -1;

  user.todos.map((doc, index) => {
    if (doc.id === todoId) {
      todoIndex = index;
      user.todos[index].done = true;
    }
  });

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  return response.status(201).send(user.todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const todoId = request.params.id;
  let todoIndex = -1;

  user.todos.map((doc, index) => {
    if (doc.id === todoId) {
      todoIndex = index;
      user.todos.splice(index, 1);
    }
  });

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  return response.status(204).send(user.todos);
});

module.exports = app;
