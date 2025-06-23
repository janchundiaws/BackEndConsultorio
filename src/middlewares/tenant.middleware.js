export function tenantMiddleware(req, res, next) {
    const tenantId = req.headers['x-tenant-id']; // o sacarlo del JWT
    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID requerido" });
    }
    req.tenantId = tenantId;
    next();
  }