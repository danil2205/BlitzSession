const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config');

const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then(() => {
  console.log('Connect correctly to the server');
}, (err) => { console.log(err); });

const indexRouter = require('./routes/index');
const accountRouter = require('./routes/accountRouter');
const usersRouter = require('./routes/users');
const sessionRouter = require('./routes/sessionRouter');

const app = express();

app.use(function(req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, Authorization");
  // res.header("Access-Control-Allow-Methods", "Content-Type, Authorization, X-Requested-With, GET, HEAD, OPTIONS, POST, PUT");
  // res.header("Access-Control-Allow-Credentials", "true");
  res.header("access-control-allow-origin", "*"),
  res.header('Access-Control-Allow-Headers', '*'),
  res.header('Access-Control-Allow-Methods', '*'),
  next();
});

app.all('*', (req, res, next) => {
  if (req.secure) next();
  else {
    res.redirect(307, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/accounts', accountRouter);
app.use('/session', sessionRouter);

app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
