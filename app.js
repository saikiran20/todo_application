const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'todoApplication.db')

const app = express()

app.use(express.json())

let db = null

const initializeDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`Db Error:${error.message}`)
    process.exit(1)
  }
}

initializeDbandServer()

const hasPriorityAndStatusProperties = (requestQuery) => {
return (
  requestQuery.priority !== undefined && requestQuery.status !== undefined
 );
};
const hasPriorityProperty = (requestQuery) => {
return requestQuery.priority !== undefined;
};
const hasStatusProperty = (requestQuery) => {
return requestQuery.status !== undefined;
};

//API 1 /todos/

app.get("/todos/",async (request, response) => {
let data = null;
let getTodosQuery = "";
const { search_q = "", priority, status } = request.query;
switch (true) {
case hasPriorityAndStatusProperties(request.query)://if this is true then below query is taken in the code
   getTodosQuery = `
   SELECT
    *
   FROM
    todo
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
break;
case hasPriorityProperty(request.query):
   getTodosQuery = `
   SELECT
    *
   FROM
    todo
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
break;
case hasStatusProperty(request.query):
   getTodosQuery = `
   SELECT
    *
   FROM
    todo
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
break;
default:
   getTodosQuery = `
   SELECT
    *
   FROM
    todo
   WHERE
    todo LIKE '%${search_q}%';`;
 }
 data =await database.all(getTodosQuery);
 response.send(data);
});

//API 3 /todos/

app.post("/todos/", async (request, response) => {
    const { id, todo, priority, status } = request.body; //Destructuring id column
    const insertTodo = `
        INSERT INTO todo (id, todo, priority, status)
        VALUES (${id},'${todo}','${priority}','${status}');`; //Updated the id column inside the SQL Query
    await db.run(insertTodo);
    response.send("Todo Successfully Added");
});

//API 4 /todos/:todoId/
app.put('/todos/:todoId/', async (request, response) => {
  const {id} = request.params
  const {todo, status, priority} = request.body
  let upadteTodoQuery = ''
  let responseMSg = ''
  switch (true) {
    case status !== undefined:
      upadteTodoQuery = `UPDATE todo SET 
        status=${status} WHERE id=${id};`
      responseMSg = 'Status Updated'
      break
    case priority !== undefined:
      upadteTodoQuery = `UPDATE todo SET 
        priority=${priority} WHERE id=${id};`
      await db.run(upadteTodoQuery)
      responseMSg = 'Priority Updated'
      break
    case todo !== undefined:
      upadteTodoQuery = `UPDATE todo SET 
        todo=${todo} WHERE id=${id};`
      await db.run(upadteTodoQuery)
      responseMSg = 'Todo Updated'
      break
  }
  await db.run(upadteTodoQuery)
  response.send(responseMSg)
})

//API 5 /todos/:todoId/
app.delete('/todos/:todoId/', async (request, response) => {
  const {id} = request.params
  const deleteTodoQuery = `DELETE FROM todo WHERE id=${id};`
  await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
