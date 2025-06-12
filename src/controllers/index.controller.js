import { pool } from "../db.js";

export const getUsers = async (req, res) => {
  try{
    const response = await pool.query("SELECT * FROM identity.users ORDER BY id ASC");
    res.status(200).json(response.rows);
  }  catch (error) {
    return res.status(500).json({ error: error.message });
  }

};

export const getUserById = async (req, res) => {
  const id = parseInt(req.params.id);
  const response = await pool.query("SELECT * FROM identity.users WHERE id = $1", [id]);
  res.json(response.rows);
};

export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    const { rows } = await pool.query(
      "INSERT INTO identity.users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;

  const { rows } = await pool.query(
    "UPDATE identity.users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
    [name, email, id]
  );

  return res.json(rows[0]);
};

export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { rowCount } = await pool.query("DELETE FROM identity.users where id = $1", [
    id,
  ]);

  if (rowCount === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.sendStatus(204);
};
