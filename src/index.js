const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (user) {
    request.username = username;
    return next();
  }

  return response.status(404).json({
    error: `Username ${username} not exists.`
  })
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const alreadyExists = users.find(user => user.username === username)

  if (alreadyExists) {
    return response.status(400).json({
      error: `User name ${name} (${username}) already exists.`
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const user = users.find(user => user.username === username)
  const todos = user.todos;

  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const user = users.find(user => user.username === username);

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const user = users.find(user => user.username === username);
  const todos = user.todos;
  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: `Todo ${id} not found.`
    })
  }

  Object.assign(todo, {
    title,
    deadline: new Date(deadline)
  })

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find(user => user.username === username);
  const todos = user.todos;
  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: `Todo ${id} not found.`
    })
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find(user => user.username === username);

  const todos = user.todos;
  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: `Todo ${id} not found.`
    })
  }

  user.todos = todos.filter(todo => todo.id !== id);

  return response.status(204).send();
});

module.exports = app;