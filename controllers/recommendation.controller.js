const axios = require('axios');
const qs = require('querystring');

//h

const jwt = require('jsonwebtoken');
require('dotenv').config();
const Recommendation     = require('../database/models/Recommendation');
const RecommendationSong = require('../database/models/RecommendationSong');

//fh

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;
let tokenExpiresAt = 0;

const emotionToGenres = {
  HAPPY: ["pop", "dance", "synth-pop"],
  SAD: ["acoustic", "piano", "ambient"],
  ANGRY: ["metal", "hard-rock", "industrial"],
  CONFUSED: ["indie", "alternative", "rock"],
  DISGUSTED: ["punk", "grunge", "garage"],
  SURPRISED: ["edm", "indie-pop", "electro"],
  CALM: ["chill", "study", "jazz"],
  FEAR: ["ambient", "minimal-techno", "soundtracks"],
  UNKNOWN: ["electronic", "world-music", "blues"]
};

const getAccessToken = async () => {
  const now = Date.now();
  if (accessToken && now < tokenExpiresAt) return accessToken;

  const tokenResponse = await axios.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify({ grant_type: 'client_credentials' }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
      },
    }
  );

  accessToken = tokenResponse.data.access_token;
  tokenExpiresAt = now + tokenResponse.data.expires_in * 1000;

  return accessToken;
};

const getTopTracksByGenre = async (genre, token) => {
  try {
    const searchArtist = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: `genre:${genre}`,
        type: 'artist',
        limit: 1,
      }
    });

    const artist = searchArtist.data.artists.items[0];
    if (!artist) return [];

    const topTracks = await axios.get(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { market: 'US' },
    });

    return topTracks.data.tracks.slice(0, 2).map(track => ({
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      url: track.external_urls.spotify,
      genre: genre
    }));

  } catch (error) {
    console.error(`Error al obtener canciones para género ${genre}:`, error.response?.data || error.message);
    return [];
  }
};

const getRecommendationsByEmotion = async (req, res) => {

    // --- 1) Validar y decodificar JWT aquí mismo ---
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No se envió token de autorización' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
  const userId = decoded.id;  // asume que firmaste con payload { id, username }




  const emotion = (req.body.emotion || 'UNKNOWN').toUpperCase();

  const genres = emotionToGenres[emotion];
  if (!genres) return res.status(400).json({ error: 'Emoción no válida' });

  try {
    const token = await getAccessToken();
    const finalTracks = [];

    for (const genre of genres) {
      const tracks = await getTopTracksByGenre(genre, token);
      finalTracks.push(...tracks.slice(0, 2));
    }

        // --- 3) Persistir en base de datos ---
    const reco = await Recommendation.create({ userId, emotion });
    const details = finalTracks.map(t => ({
      recommendationId: reco.id,
      title:            t.name,
      artist:           t.artist,
      url:              t.url,
      genre:            t.genre
    }));
    await RecommendationSong.bulkCreate(details);

    res.json(finalTracks);

  } catch (error) {
    console.error('Error general en recomendaciones:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al obtener recomendaciones por emoción' });
  }
};

module.exports = { getRecommendationsByEmotion };
