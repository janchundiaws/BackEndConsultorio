import { pool } from "../db.js";

export const getBloodTypes = async (req, res) => {
  try{
    const response = await pool.query("SELECT * FROM config.blood_type ORDER BY id ASC");
    res.status(200).json(response.rows);
  }  catch (error) {
    return res.status(500).json({ error: error.message });
  }

};

export const getDocumentTypes = async (req, res) => {
  try{
    const response = await pool.query("SELECT * FROM config.document_type where status = 1 ORDER BY id ASC");
    res.status(200).json(response.rows);
  }  catch (error) {
    return res.status(500).json({ error: error.message });
  }

};

export const getDentists = async (req, res) => {
  try{
    const response = await pool.query("SELECT * FROM config.dentists ORDER BY id ASC");
    res.status(200).json(response.rows);
  }  catch (error) {
    return res.status(500).json({ error: error.message });
  }

};

export const getOffices = async (req, res) => {
  try{
    const response = await pool.query("SELECT * FROM config.offices ORDER BY id ASC");
    res.status(200).json(response.rows);
  }  catch (error) {
    return res.status(500).json({ error: error.message });
  }

};


export const getAppointments = async (req, res) => {
  try{
    const response = await pool.query("SELECT * FROM office.appointments ORDER BY id ASC");
    res.status(200).json(response.rows);
  }  catch (error) {
    return res.status(500).json({ error: error.message });
  }

};