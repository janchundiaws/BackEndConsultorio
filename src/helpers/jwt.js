import jwt from 'jsonwebtoken';

const SECRET = 'janchundia'; // usa dotenv en producción

export const generarToken = (usuario) => {
  return jwt.sign({ id: usuario.id, correo: usuario.correo }, SECRET, {
    expiresIn: '2h',
  });
};

export const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded; // lo puedes usar en tus controladores
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};
