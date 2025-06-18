// src/routes/auth.routes.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { generarToken } from '../helpers/jwt.js';
import { pool } from "../db.js";

const router = Router();


/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticación de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Retorna el token JWT
 */
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;

  //obtener los usuarios de la base de datos para comparacion y logeo
  const response = await pool.query("SELECT * FROM identity.users WHERE email = $1", [correo]);
  //res.json(response.rows);
  console.log(response);
  const usuario = response.rows.find(u => u.email === correo && u.email === password);
  if (!usuario ) {//|| !bcrypt.compareSync(password, usuario.email)
    return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
  }

  const token = generarToken(usuario);
  res.json({ token });
});

export default router;
