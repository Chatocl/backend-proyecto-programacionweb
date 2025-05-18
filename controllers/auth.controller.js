// controllers/auth.controller.js

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
require("dotenv").config();

const User   = require("../database/models/User");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1) Verificar correo
    const existeEmail = await User.findOne({ where: { email } });
    if (existeEmail) {
      return res.status(400).json({ msg: "Ese correo ya está en uso" });
    }

    // 2) Verificar username
    const existeUser = await User.findOne({ where: { username } });
    if (existeUser) {
      return res.status(400).json({ msg: "Ese nombre de usuario ya está en uso" });
    }

    // 3) Hashear contraseña
    const salt     = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    // 4) Crear usuario
    const user = await User.create({
      username,
      email,
      password: hashPass
    });

    return res.status(201).json({
      id:       user.id,
      username: user.username,
      email:    user.email
    });
  } catch (error) {
    console.error("Error en register:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

exports.login = async (req, res) => {
  const { login, password } = req.body; // puede ser email o username

  try {
    // 1) Buscar por email
    let user = await User.findOne({ where: { email: login } });

    // 2) Si no, buscar por username
    if (!user) {
      user = await User.findOne({ where: { username: login } });
    }

    if (!user) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    // 3) Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    // 4) Generar JWT
    const payload = { id: user.id, username: user.username };
    const token   = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h"
    });

    return res.json({ token });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};