const AWS = require('aws-sdk');

// Configurar Rekognition
const rekognition = new AWS.Rekognition({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Análisis facial
exports.detectFace = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó imagen' });
    }

    const params = {
      Image: { Bytes: req.file.buffer },
      Attributes: ['ALL']
    };

    rekognition.detectFaces(params, (err, data) => {
      if (err) {
        console.error('Error en Rekognition:', err);
        return res.status(500).json({ error: 'Error al analizar la imagen' });
      }

      if (!data.FaceDetails.length) {
        return res.status(404).json({ mensaje: 'No se detectaron rostros' });
      }

      const face = data.FaceDetails[0];
      const resultado = {
        edad: `${face.AgeRange.Low} - ${face.AgeRange.High}`,
        genero: face.Gender?.Value,
        emociones: face.Emotions.map(e => ({
          tipo: e.Type,
          confianza: `${e.Confidence.toFixed(1)}%`
        })),
        sonriente: face.Smile?.Value,
        gafas: face.Eyeglasses?.Value,
        gafasSolares: face.Sunglasses?.Value
      };

      res.json(resultado);
    });
  } catch (error) {
    console.error('Excepción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
