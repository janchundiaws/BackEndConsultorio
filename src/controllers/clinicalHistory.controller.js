import { pool } from "../db.js";
import { decodeToken } from './../helpers/jwt.js';

// Crear un historial clínico
export const createClinicalHistory = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const {
        patient_id,
        observation
    } = req.body;

    try {
        // Verificar que el paciente existe y pertenece al tenant
        const patientCheck = await pool.query(
            'SELECT id FROM office.patients WHERE id = $1 AND tenant_id = $2 AND status = 1',
            [patient_id, payload.tenant_id]
        );

        if (patientCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        const result = await pool.query(
            `INSERT INTO office.clinical_history (
                tenant_id, patient_id, observation
            ) VALUES (
                $1, $2, $3
            ) RETURNING *`,
            [payload.tenant_id, patient_id, observation]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando historial clínico:', error);
        res.status(500).json({ message: "Error al crear historial clínico: " + error.message });
    }
};

// Obtener todos los historiales clínicos del tenant
export const getClinicalHistories = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    try {
        const result = await pool.query(
            `SELECT ch.*, p.name as patient_name, p.last_name as patient_last_name 
             FROM office.clinical_history ch
             INNER JOIN office.patients p ON ch.patient_id = p.id
             WHERE ch.tenant_id = $1
             ORDER BY ch.created_at DESC`,
            [payload.tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo historiales clínicos:', error);
        res.status(500).json({ message: "Error al obtener historiales clínicos" });
    }
};

// Obtener historiales clínicos por paciente
export const getClinicalHistoriesByPatient = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { patient_id } = req.params;

    try {
        // Verificar que el paciente existe y pertenece al tenant
        const patientCheck = await pool.query(
            'SELECT id, name, last_name FROM office.patients WHERE id = $1 AND tenant_id = $2 AND status = 1',
            [patient_id, payload.tenant_id]
        );

        if (patientCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        const result = await pool.query(
            `SELECT ch.*, p.name as patient_name, p.last_name as patient_last_name 
             FROM office.clinical_history ch
             INNER JOIN office.patients p ON ch.patient_id = p.id
             WHERE ch.tenant_id = $1 AND ch.patient_id = $2
             ORDER BY ch.created_at DESC`,
            [payload.tenant_id, patient_id]
        );

        res.json({
            patient: patientCheck.rows[0],
            clinical_histories: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo historiales clínicos del paciente:', error);
        res.status(500).json({ message: "Error al obtener historiales clínicos del paciente" });
    }
};

// Obtener un historial clínico por ID
export const getClinicalHistoryById = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT ch.*, p.name as patient_name, p.last_name as patient_last_name 
             FROM office.clinical_history ch
             INNER JOIN office.patients p ON ch.patient_id = p.id
             WHERE ch.id = $1 AND ch.tenant_id = $2`,
            [id, payload.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Historial clínico no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo historial clínico:', error);
        res.status(500).json({ message: "Error al obtener historial clínico" });
    }
};

// Actualizar un historial clínico
export const updateClinicalHistory = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;
    const { observation } = req.body;

    try {
        // Verificar que el historial existe y pertenece al tenant
        const historyCheck = await pool.query(
            'SELECT id FROM office.clinical_history WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (historyCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Historial clínico no encontrado' });
        }

        const result = await pool.query(
            `UPDATE office.clinical_history 
             SET observation = $1
             WHERE id = $2 AND tenant_id = $3
             RETURNING *`,
            [observation, id, payload.tenant_id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando historial clínico:', error);
        res.status(500).json({ message: "Error al actualizar historial clínico: " + error.message });
    }
};

// Eliminar un historial clínico
export const deleteClinicalHistory = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        // Verificar que el historial existe y pertenece al tenant
        const historyCheck = await pool.query(
            'SELECT id FROM office.clinical_history WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (historyCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Historial clínico no encontrado' });
        }

        // Eliminar el historial clínico
        await pool.query(
            'DELETE FROM office.clinical_history WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        res.json({ message: 'Historial clínico eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando historial clínico:', error);
        res.status(500).json({ message: "Error al eliminar historial clínico: " + error.message });
    }
}; 