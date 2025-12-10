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

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const response = await pool.query(
      "SELECT id, tenant_id, name, email, role, status, created_at FROM identity.users WHERE id = $1",
      [userId]
    );

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(response.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: "Name must be a non-empty string" });
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    // Check if email is already in use by another user
    const emailCheck = await pool.query(
      "SELECT id FROM identity.users WHERE email = $1 AND id != $2",
      [email.trim(), userId]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    const { rows } = await pool.query(
      "UPDATE identity.users SET name = $1, email = $2 WHERE id = $3 RETURNING id, tenant_id, name, email, role, status, created_at",
      [name.trim(), email.trim(), userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
