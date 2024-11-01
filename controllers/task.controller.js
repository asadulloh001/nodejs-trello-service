import pool from "../db/db.js";

function getParams(body) {
  const keys = Object.keys(body)
  let res = ['', '']
  let i = 1
  for(i; i < keys.length; i++) {
    res[0] += `${keys[i-1]}, `
    res[1] += `$${i}, `
  }
  res[0] += `${keys[i-1]}`
  res[1] += `$${i}`

  return res
}

export async function createTask(req, res, next) {
  try {
    const { title, orders} = req.body;
    if (!title || !orders)
      return res.status(400).send("Please enter all fields!");

    const essentials = getParams(req.body)

    const newData = await pool.query(
      `INSERT INTO tasks (${essentials[0]}) VALUES (${essentials[1]}) RETURNING *`,
      Object.values(req.body)
    );

    if (newData.rows.length !== 1)
      return res.status(500).send("Some error on server!");

    res.status(200).send({
      message: "Created",
      task: newData.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllTasks(req, res, next) {
  try {
    const getData = await pool.query("SELECT * FROM tasks");
    
    res.status(200).send({
      status: "Success",
      data: getData.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function searchTask(req, res, next) {
  try {
    const key = Object.keys(req.query)[0]
    const value = Object.values(req.query)[0]
    
    const searchData = await pool.query(
      `SELECT * FROM tasks WHERE ${key} ILIKE '%${value}%'`
    );
    res.status(200).send({
      status: "Success",
      data: searchData.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req, res, next) {
  try {
    const id = req.params.id;
    const data = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
    res.status(200).send({
      status: "Found",
      data: data.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const id = req.params.id;
    const { title, orders, description, user_id, board_id, column_id } = req.body;

    const data = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
    if (!data.rows.length) {
      return res.status(404).send("Task was not found!");
    }
    const oldTask = data.rows[0]

    const editData = await pool.query(
      "UPDATE tasks SET title=$1, orders=$2, description=$3, user_id=$4, board_id=$5, column_id=$6, updatedAt=$7 WHERE id=$8 RETURNING *",
      [
        title || oldTask.title,
        orders || oldTask.orders,
        description || oldTask.description,
        user_id || oldTask.user_id,
        board_id || oldTask.board_id,
        column_id || oldTask.column_id,
        new Date(),
        id,
      ]
    );

    if (editData.rows.length !== 1)
      return res.status(500).send("Some error on server!");

    res.status(200).send({
      message: "Updated",
      data: editData.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function removeTask(req, res, next) {
  try {
    const id = req.params.id;
    const oldData = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);

    if (!oldData.rows.length) {
      return res.status(404).send("task was not found!");
    }

    const data = await pool.query(
      "DELETE FROM tasks WHERE id=$1 RETURNING *", [id]
    );

    res.status(200).send({
      status: "Deleted",
      user_id: data.rows[0],
    });
  } catch (error) {
    next(error);
  }
}