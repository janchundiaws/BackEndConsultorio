import { pool } from "../db.js";
import { decodeToken } from './../helpers/jwt.js';

// Crear un paciente
export const createPatient = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
        }

  const {
    document_type_id,
    document_id,
    name,
    last_name,
    phone,
    address,
    email,
    birth_date,
    gender,
    marital_status_id,
    blood_type_id,
    occupation
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO office.patients (
        tenant_id, document_type_id, document_id, name, last_name, phone, address, email, birth_date,
        gender, marital_status_id, blood_type_id, occupation
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *`,
      [
        payload.tenant_id, document_type_id, document_id, name, last_name,
        phone, address, email, birth_date, gender,
        marital_status_id, blood_type_id, occupation
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando paciente:', error);
    res.status(500).json({ message: "Error al crear paciente, "+ error });
  }
};

// Obtener todos los pacientes del tenant
export const getPatients = async (req, res) => {
    //console.log(req.headers.authorization);
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
      }

  try {
    const result = await pool.query(
      'SELECT * FROM office.patients WHERE tenant_id = $1 and status = 1',
      [payload.tenant_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    res.status(500).json({ message: "Error al obtener pacientes" });
  }
};

// Obtener un paciente por ID
export const getPatientById = async (req, res) => {
  const { id } = req.params;
  const payload = decodeToken(req.headers.authorization);
  if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

  try {
    const result = await pool.query(
      'SELECT * FROM office.patients WHERE id = $1 AND tenant_id = $2 AND status = 1',
      [id, payload.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo paciente:', error);
    res.status(500).json({ message: "Error al obtener paciente" });
  }
};

// Actualizar un paciente
export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const payload = decodeToken(req.headers.authorization);
  if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

  const {
    document_type_id, document_id, name, last_name, phone,
    address, email, birth_date, gender, marital_status_id,
    blood_type_id, occupation
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE office.patients SET
        document_type_id = $1,
        document_id = $2,
        name = $3,
        last_name = $4,
        phone = $5,
        address = $6,
        email = $7,
        birth_date = $8,
        gender = $9,
        marital_status_id = $10,
        blood_type_id = $11,
        occupation = $12
      WHERE id = $13 AND tenant_id = $14 RETURNING *`,
      [
        document_type_id, document_id, name, last_name, phone,
        address, email, birth_date, gender,
        marital_status_id, blood_type_id, occupation,
        id, payload.tenant_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando paciente:', error);
    res.status(500).json({ message: "Error al actualizar paciente" });
  }
};

// Eliminar paciente (eliminación lógica)
export const deletePatient = async (req, res) => {
  const { id } = req.params;
  const payload = decodeToken(req.headers.authorization);
  if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

  try {
    const result = await pool.query(
      'UPDATE office.patients SET status = 0 WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, payload.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    res.json({ message: "Paciente eliminado correctamente." });
  } catch (error) {
    console.error('Error eliminando paciente:', error);
    res.status(500).json({ message: "Error al eliminar paciente" });
  }
};
