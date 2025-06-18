export const requireRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    const userRoles = req.usuario?.roles || [];

    const tieneAcceso = userRoles.some(role => rolesPermitidos.includes(role));

    if (!tieneAcceso) {
      return res.status(403).json({ mensaje: 'Acceso denegado: rol no autorizado' });
    }

    next();
  };
};