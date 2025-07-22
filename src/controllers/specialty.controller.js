import { pool } from "../db.js";

export const getSpecialtyDentists = async (req, res) => {
  try{
    const response = await pool.query("select a.id,a.name as nombres,a.phone,a.email, b.name as especialidad from config.dentists a inner join config.specialties b on a.specialty_id=b.id");
    res.status(200).json(response.rows);
  }  catch (error) {
    return res.status(500).json({ error: error.message });
  }

};
