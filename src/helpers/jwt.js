import jwt from 'jsonwebtoken';
import { estaEnBlacklist } from './tokenBlacklist.js';

const SECRET = 'janchundia'; // usa dotenv en producción

export const generarToken = (usuario) => {
  return jwt.sign({ id: usuario.id, 
                    correo: usuario.correo ,
                    roles: usuario.role,//['admin', 'asistente'],//usuario.rol, // 👈 importante
                    tenant_id: usuario.tenant_id//'admin'
    }, SECRET, {
    expiresIn: '2h',
  });
};

export const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  if (estaEnBlacklist(token)) {
    return res.status(401).json({ mensaje: 'Token inválido (logout)' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded; // lo puedes usar en tus controladores
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

export const decodeToken = (token_request) => {
  try {
    const token = token_request.split(' ')[1]; // "Bearer xxx" → "xxx"
    const decoded = jwt.verify(token, SECRET);
    return decoded; // aquí te devuelve todo el payload
  } catch (err) {
    console.error('Token inválido:', err.message);
    return null;
  }
}