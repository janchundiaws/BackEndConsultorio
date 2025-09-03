import { pool } from "../db.js";
import { decodeToken } from './../helpers/jwt.js';

// =====================================================
// APPOINTMENTS MANAGEMENT
// =====================================================

// Create a new appointment
export const createAppointment = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const {
        patient_id,
        dentist_id,
        office_id,
        appointment_time,
        reason
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

        // Verificar que el dentista existe y pertenece al tenant
        const dentistCheck = await pool.query(
            'SELECT id FROM config.dentists WHERE id = $1 AND tenant_id = $2',
            [dentist_id, payload.tenant_id]
        );

        if (dentistCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Dentista no encontrado' });
        }

        // Verificar que la oficina existe y pertenece al tenant
        const officeCheck = await pool.query(
            'SELECT id FROM config.offices WHERE id = $1 AND tenant_id = $2',
            [office_id, payload.tenant_id]
        );

        if (officeCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Oficina no encontrada' });
        }

        // Verificar que no hay conflicto de horario para el dentista
        const conflictCheck = await pool.query(
            `SELECT id FROM office.appointments 
             WHERE dentist_id = $1 AND appointment_time = $2 AND status = 'pending' AND tenant_id = $3`,
            [dentist_id, appointment_time, payload.tenant_id]
        );

        if (conflictCheck.rows.length > 0) {
            return res.status(409).json({ message: 'El dentista ya tiene una cita programada en ese horario' });
        }

        const result = await pool.query(
            `INSERT INTO office.appointments (
                tenant_id, patient_id, dentist_id, office_id, appointment_time, reason
            ) VALUES (
                $1, $2, $3, $4, $5, $6
            ) RETURNING *`,
            [payload.tenant_id, patient_id, dentist_id, office_id, appointment_time, reason]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando appointment:', error);
        res.status(500).json({ message: "Error al crear appointment: " + error.message });
    }
};

// Get all appointments for tenant with filters
export const getAppointments = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { 
        patient_id, 
        dentist_id, 
        office_id, 
        status, 
        date_from, 
        date_to,
        page = 1,
        limit = 50
    } = req.query;

    try {
        let query = `
            SELECT a.*, 
                   p.name as patient_name, 
                   p.last_name as patient_last_name,
                   p.phone as patient_phone,
                   d.name as dentist_name,
                   o.name as office_name
            FROM office.appointments a
            INNER JOIN office.patients p ON a.patient_id = p.id
            INNER JOIN config.dentists d ON a.dentist_id = d.id
            INNER JOIN config.offices o ON a.office_id = o.id
            WHERE a.tenant_id = $1
        `;
        
        const queryParams = [payload.tenant_id];
        let paramIndex = 2;

        // Add filters
        if (patient_id) {
            query += ` AND a.patient_id = $${paramIndex}`;
            queryParams.push(patient_id);
            paramIndex++;
        }

        if (dentist_id) {
            query += ` AND a.dentist_id = $${paramIndex}`;
            queryParams.push(dentist_id);
            paramIndex++;
        }

        if (office_id) {
            query += ` AND a.office_id = $${paramIndex}`;
            queryParams.push(office_id);
            paramIndex++;
        }

        if (status) {
            query += ` AND a.status = $${paramIndex}`;
            queryParams.push(status);
            paramIndex++;
        }

        if (date_from) {
            query += ` AND a.appointment_time >= $${paramIndex}`;
            queryParams.push(date_from);
            paramIndex++;
        }

        if (date_to) {
            query += ` AND a.appointment_time <= $${paramIndex}`;
            queryParams.push(date_to);
            paramIndex++;
        }

        // Add ordering and pagination
        query += ` ORDER BY a.appointment_time DESC`;
        
        const offset = (page - 1) * limit;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        const result = await pool.query(query, queryParams);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM office.appointments a
            WHERE a.tenant_id = $1
        `;
        
        const countParams = [payload.tenant_id];
        let countParamIndex = 2;

        if (patient_id) {
            countQuery += ` AND a.patient_id = $${countParamIndex}`;
            countParams.push(patient_id);
            countParamIndex++;
        }

        if (dentist_id) {
            countQuery += ` AND a.dentist_id = $${countParamIndex}`;
            countParams.push(dentist_id);
            countParamIndex++;
        }

        if (office_id) {
            countQuery += ` AND a.office_id = $${countParamIndex}`;
            countParams.push(office_id);
            countParamIndex++;
        }

        if (status) {
            countQuery += ` AND a.status = $${countParamIndex}`;
            countParams.push(status);
            countParamIndex++;
        }

        if (date_from) {
            countQuery += ` AND a.appointment_time >= $${countParamIndex}`;
            countParams.push(date_from);
            countParamIndex++;
        }

        if (date_to) {
            countQuery += ` AND a.appointment_time <= $${countParamIndex}`;
            countParams.push(date_to);
            countParamIndex++;
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            appointments: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error obteniendo appointments:', error);
        res.status(500).json({ message: "Error al obtener appointments" });
    }
};

// Get appointments by patient
export const getAppointmentsByPatient = async (req, res) => {
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
            `SELECT a.*, 
                    d.name as dentist_name,
                    o.name as office_name
             FROM office.appointments a
             INNER JOIN config.dentists d ON a.dentist_id = d.id
             INNER JOIN config.offices o ON a.office_id = o.id
             WHERE a.tenant_id = $1 AND a.patient_id = $2
             ORDER BY a.appointment_time DESC`,
            [payload.tenant_id, patient_id]
        );

        res.json({
            patient: patientCheck.rows[0],
            appointments: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo appointments del paciente:', error);
        res.status(500).json({ message: "Error al obtener appointments del paciente" });
    }
};

// Get appointments by dentist
export const getAppointmentsByDentist = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { dentist_id } = req.params;
    const { date_from, date_to } = req.query;

    try {
        // Verificar que el dentista existe y pertenece al tenant
        const dentistCheck = await pool.query(
            'SELECT id, name FROM config.dentists WHERE id = $1 AND tenant_id = $2',
            [dentist_id, payload.tenant_id]
        );

        if (dentistCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Dentista no encontrado' });
        }

        let query = `
            SELECT a.*, 
                   p.name as patient_name, 
                   p.last_name as patient_last_name,
                   p.phone as patient_phone,
                   o.name as office_name
            FROM office.appointments a
            INNER JOIN office.patients p ON a.patient_id = p.id
            INNER JOIN config.offices o ON a.office_id = o.id
            WHERE a.tenant_id = $1 AND a.dentist_id = $2
        `;
        
        const queryParams = [payload.tenant_id, dentist_id];
        let paramIndex = 3;

        if (date_from) {
            query += ` AND a.appointment_time >= $${paramIndex}`;
            queryParams.push(date_from);
            paramIndex++;
        }

        if (date_to) {
            query += ` AND a.appointment_time <= $${paramIndex}`;
            queryParams.push(date_to);
            paramIndex++;
        }

        query += ` ORDER BY a.appointment_time ASC`;

        const result = await pool.query(query, queryParams);

        res.json({
            dentist: dentistCheck.rows[0],
            appointments: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo appointments del dentista:', error);
        res.status(500).json({ message: "Error al obtener appointments del dentista" });
    }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT a.*, 
                    p.name as patient_name, 
                    p.last_name as patient_last_name,
                    p.phone as patient_phone,
                    p.email as patient_email,
                    d.name as dentist_name,
                    o.name as office_name
             FROM office.appointments a
             INNER JOIN office.patients p ON a.patient_id = p.id
             INNER JOIN config.dentists d ON a.dentist_id = d.id
             INNER JOIN config.offices o ON a.office_id = o.id
             WHERE a.id = $1 AND a.tenant_id = $2`,
            [id, payload.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo appointment:', error);
        res.status(500).json({ message: "Error al obtener appointment" });
    }
};

// Update appointment
export const updateAppointment = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;
    const { 
        patient_id, 
        dentist_id, 
        office_id, 
        appointment_time, 
        status, 
        reason 
    } = req.body;

    try {
        // Verificar que el appointment existe y pertenece al tenant
        const appointmentCheck = await pool.query(
            'SELECT id FROM office.appointments WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (appointmentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment no encontrado' });
        }

        // Si se está cambiando el dentista o la fecha, verificar conflictos
        if (dentist_id || appointment_time) {
            const currentAppointment = await pool.query(
                'SELECT dentist_id, appointment_time FROM office.appointments WHERE id = $1 AND tenant_id = $2',
                [id, payload.tenant_id]
            );

            const checkDentistId = dentist_id || currentAppointment.rows[0].dentist_id;
            const checkAppointmentTime = appointment_time || currentAppointment.rows[0].appointment_time;

            const conflictCheck = await pool.query(
                `SELECT id FROM office.appointments 
                 WHERE dentist_id = $1 AND appointment_time = $2 AND status = 'pending' 
                 AND tenant_id = $3 AND id != $4`,
                [checkDentistId, checkAppointmentTime, payload.tenant_id, id]
            );

            if (conflictCheck.rows.length > 0) {
                return res.status(409).json({ message: 'El dentista ya tiene una cita programada en ese horario' });
            }
        }

        // Verificar que los IDs referenciados existen y pertenecen al tenant
        if (patient_id) {
            const patientCheck = await pool.query(
                'SELECT id FROM office.patients WHERE id = $1 AND tenant_id = $2 AND status = 1',
                [patient_id, payload.tenant_id]
            );
            if (patientCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Paciente no encontrado' });
            }
        }

        if (dentist_id) {
            const dentistCheck = await pool.query(
                'SELECT id FROM config.dentists WHERE id = $1 AND tenant_id = $2',
                [dentist_id, payload.tenant_id]
            );
            if (dentistCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Dentista no encontrado' });
            }
        }

        if (office_id) {
            const officeCheck = await pool.query(
                'SELECT id FROM config.offices WHERE id = $1 AND tenant_id = $2',
                [office_id, payload.tenant_id]
            );
            if (officeCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Oficina no encontrada' });
            }
        }

        // Construir la query de actualización dinámicamente
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (patient_id !== undefined) {
            updateFields.push(`patient_id = $${paramIndex}`);
            updateValues.push(patient_id);
            paramIndex++;
        }

        if (dentist_id !== undefined) {
            updateFields.push(`dentist_id = $${paramIndex}`);
            updateValues.push(dentist_id);
            paramIndex++;
        }

        if (office_id !== undefined) {
            updateFields.push(`office_id = $${paramIndex}`);
            updateValues.push(office_id);
            paramIndex++;
        }

        if (appointment_time !== undefined) {
            updateFields.push(`appointment_time = $${paramIndex}`);
            updateValues.push(appointment_time);
            paramIndex++;
        }

        if (status !== undefined) {
            updateFields.push(`status = $${paramIndex}`);
            updateValues.push(status);
            paramIndex++;
        }

        if (reason !== undefined) {
            updateFields.push(`reason = $${paramIndex}`);
            updateValues.push(reason);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No hay campos para actualizar' });
        }

        updateValues.push(payload.tenant_id, id);

        const result = await pool.query(
            `UPDATE office.appointments 
             SET ${updateFields.join(', ')}
             WHERE tenant_id = $${paramIndex} AND id = $${paramIndex + 1}
             RETURNING *`,
            updateValues
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando appointment:', error);
        res.status(500).json({ message: "Error al actualizar appointment: " + error.message });
    }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        // Verificar que el appointment existe y pertenece al tenant
        const appointmentCheck = await pool.query(
            'SELECT id, status FROM office.appointments WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (appointmentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment no encontrado' });
        }

        // Verificar si el appointment ya está completado
        if (appointmentCheck.rows[0].status === 'completed') {
            return res.status(400).json({ message: 'No se puede eliminar un appointment completado' });
        }

        // Eliminar el appointment
        await pool.query(
            'DELETE FROM office.appointments WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        res.json({ message: 'Appointment eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando appointment:', error);
        res.status(500).json({ message: "Error al eliminar appointment: " + error.message });
    }
};

// Get appointment statistics
export const getAppointmentStats = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { date_from, date_to } = req.query;

    try {
        let whereClause = 'WHERE a.tenant_id = $1';
        const queryParams = [payload.tenant_id];
        let paramIndex = 2;

        if (date_from) {
            whereClause += ` AND a.appointment_time >= $${paramIndex}`;
            queryParams.push(date_from);
            paramIndex++;
        }

        if (date_to) {
            whereClause += ` AND a.appointment_time <= $${paramIndex}`;
            queryParams.push(date_to);
            paramIndex++;
        }

        const statsQuery = `
            SELECT 
                COUNT(*) as total_appointments,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_appointments,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
                COUNT(CASE WHEN appointment_time::date = CURRENT_DATE THEN 1 END) as today_appointments,
                COUNT(CASE WHEN appointment_time::date = CURRENT_DATE + INTERVAL '1 day' THEN 1 END) as tomorrow_appointments
            FROM office.appointments a
            ${whereClause}
        `;

        const result = await pool.query(statsQuery, queryParams);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo estadísticas de appointments:', error);
        res.status(500).json({ message: "Error al obtener estadísticas de appointments" });
    }
};