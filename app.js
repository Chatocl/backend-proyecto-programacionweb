var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var cors = require('cors');
require('dotenv').config();

//nuevo historial
require('./database/models/Recommendation');
require('./database/models/RecommendationSong');

//fin historial

const sequelize    = require('./database/config');
const authRoutes   = require('./routes/auth');
const recommendationRoutes = require('./routes/recommendation');
const rekognitionRoutes = require('./routes/rekognition');
var app = express();

// ✅ Habilita CORS correctamente
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Habilita las respuestas a preflight
app.options('*', cors());



//h
const historyRoutes = require('./routes/history');
// … justo antes de sequelize.sync():


//fh

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//history
app.use('/api/history', historyRoutes);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);










// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/rekognition', rekognitionRoutes);
// Sincronizar modelos y arrancar servidor
sequelize.sync()
  .then(() => {
    console.log('Base de datos conectada y sincronizada');
    /*app.listen(process.env.PORT, () => {
      console.log(`Servidor en http://localhost:${process.env.PORT}`);
    });*/
  })
  .catch(err => console.error('Error al conectar DB:', err));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
