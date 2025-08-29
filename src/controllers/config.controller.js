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

export const getMaritalStatus= async (req, res) => {
  try{
    const response = await pool.query("SELECT * FROM config.marital_status ORDER BY id ASC");
    res.status(200).json(response.rows);
  }  catch (error) {
    return res.status(500).json({ error: error.message });
  }

};

export const getEstadisticas = async (req, res) => {
  try{
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    let query = `
    select sum(cantidadPatient) cantidadPatient,sum(cantidadCitas) cantidadCitas, sum(cantidadStock) cantidadStock, sum(cantidadProveedores) cantidadProveedores
    from  (
      select count(id) cantidadPatient, 0 cantidadCitas, 0 cantidadStock, 0 cantidadProveedores 
      from office.patients
      where status=1
      and tenant_id=$1
      union
      select 0 cantidadPatient, count(id) cantidadCitas, 0 cantidadStock, 0 cantidadProveedores 
      from office.appointments
      where appointment_time::date=CURRENT_DATE
      and tenant_id=$1
      union
      select 0 cantidadPatient, 0 cantidadCitas, count(stock_id) cantidadStock, 0 cantidadProveedores
      from inventory.current_stock_view
      where tenant_id=$1
      union
      select 0 cantidadPatient, 0 cantidadCitas, 0 cantidadStock, count(supplier_id) cantidadProveedores
      from inventory.suppliers
      where status=true
      and tenant_id=$1
    ) estadisticas`;

    const response = await pool.query(query, [payload.tenant_id]);

    res.status(200).json(response.rows);
  }  catch (error) {
    return res.status(500).json({ error: error.message });
  }

};