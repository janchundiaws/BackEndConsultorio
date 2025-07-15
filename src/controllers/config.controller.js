import { pool } from "../db.js";

export const getBloodTypes = async (req, res) => {
  try{
    const response = await pool.query("SELECT * FROM config.blood_type ORDER BY id ASC");
    res.status(200).json(response.rows);
  }  catch (error) {
    return res.status(500).json({ error: error.message });
  }

};
