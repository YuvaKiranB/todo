const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const startDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

startDB();

const hasPriorityStatus = (priority, status) => {
  return priority !== "" && status !== "";
};

const hasPriority = (priority, status, todo = "") => {
  return priority !== "";
};

const hasStatus = (priority, status, todo = "") => {
  return status !== "";
};

const hasTodo = (priority, status, todo) => {
  return todo !== "";
};

app.get("/todos/", async (request, response) => {
  const { priority = "", status = "", search_q = "" } = request.query;
  let getTodos = "";
  switch (true) {
    case hasPriorityStatus(priority, status):
      getTodos = `
      SELECT *
      FROM todo
      WHERE
      todo LIKE "%${search_q}%"
      AND status = "${status}" AND priority = "${priority}";`;
      break;

    case hasPriority(priority, status):
      getTodos = `
      SELECT *
      FROM todo
      WHERE
      todo LIKE "%${search_q}%"
      AND priority = "${priority}";`;
      break;

    case hasStatus(priority, status):
      getTodos = `
      SELECT *
      FROM todo
      WHERE
      todo LIKE "%${search_q}%"
      AND status = "${status}" ;`;
      break;

    default:
      getTodos = `
      SELECT *
      FROM todo
      WHERE
      todo LIKE "%${search_q}%";`;
  }

  const todos = await db.all(getTodos);
  response.send(todos);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `
  SELECT *
  FROM todo
  WHERE id = ${todoId}`;
  const todo = await db.get(getTodo);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const writeTodo = `
  INSERT INTO todo(id, todo, priority, status)
  VALUES(${id}, "${todo}", "${priority}", "${status}")`;
  await db.run(writeTodo);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todo = "", priority = "", status = "" } = request.body;
  const { todoId } = request.params;
  let writeTodo = "";
  switch (true) {
    case hasPriority(priority, status, todo):
      writeTodo = `
    UPDATE todo
    SET
    priority = "${priority}"
    WHERE id = ${todoId};`;
      await db.run(writeTodo);
      response.send("Priority Updated");
      break;

    case hasStatus(priority, status, todo):
      writeTodo = `
    UPDATE todo
    SET
    status = "${status}"
    WHERE id = ${todoId};`;
      await db.run(writeTodo);
      response.send("Status Updated");
      break;

    case hasTodo(priority, status, todo):
      writeTodo = `
    UPDATE todo
    SET
    todo = "${todo}"
    WHERE id = ${todoId};`;
      await db.run(writeTodo);
      response.send("Todo Updated");
      break;

    default:
      console.log("No update");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
  DELETE FROM todo
  WHERE id = ${todoId}`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
