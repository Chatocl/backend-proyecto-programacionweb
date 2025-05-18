const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Config AWS
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const rekognition = new AWS.Rekognition({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

exports.analyzeFromUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No se subió imagen' });

    const key = `uploads/${uuidv4()}_${file.originalname}`;

    // Subir a S3
    await s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();

    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // Preparar análisis con Rekognition
    const s3params = {
      Image: {
        S3Object: {
          Bucket: process.env.AWS_S3_BUCKET,
          Name: key,
        },
      },
      Attributes: ['ALL']
    };

    rekognition.detectFaces(s3params, (err, data) => {
      if (err) {
        console.error("Error en Rekognition:", err);
        return res.status(500).json({ error: 'Error al analizar imagen' });
      }

      if (!data.FaceDetails.length) {
        return res.status(404).json({ message: 'No se detectaron rostros' });
      }

      const emocion = data.FaceDetails[0].Emotions?.[0]?.Type || 'UNKNOWN';
      res.json({ emocion });
    });

  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: 'Error interno' });
  }
};
