// src/routes/history.js
const express               = require('express');
const jwt                   = require('jsonwebtoken');
require('dotenv').config();

const Recommendation        = require('../database/models/Recommendation');
const RecommendationSong    = require('../database/models/RecommendationSong');

const router = express.Router();

router.get('/', async (req, res) => {
  // 1) ¿Llega la cabecera?
  console.log('→ /api/history headers:', req.headers.authorization);

  // 2) Extrae y verifica el JWT
  const authHeader = req.headers.authorization || '';
  const token      = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    console.warn('   No token recibido');
    return res.status(401).json({ error: 'No se envió token' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('   Error al verificar JWT:', err.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
  console.log('   decoded JWT payload:', decoded);

  const userId = decoded.id;
  console.log('   buscando historial para userId=', userId);

  // 3) Lee la BD
  try {
    const recos = await Recommendation.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [{ model: RecommendationSong }]
    });
    console.log(`   Encontradas ${recos.length} recomendaciones`);

    const result = recos.map(r => ({
      id:        r.id,
      emotion:   r.emotion,
      createdAt: r.createdAt,
      songs:     r.RecommendationSongs.map(s => ({
        title:  s.title,
        artist: s.artist,
        url:    s.url,
        genre:  s.genre
      }))
    }));
    return res.json(result);

  } catch (err) {
    console.error('   Error al leer historial en BD:', err);
    return res.status(500).json({ error: 'Error interno al obtener historial' });
  }
});

module.exports = router;