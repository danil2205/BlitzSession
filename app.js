'use strict';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config');

const url = config.mongoUrl;
const connect = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.then(() => {
  console.log('Connect correctly to the server');
}, (err) => { console.log(err); });

const indexRouter = require('./routes/index');
const accountRouter = require('./routes/accountRouter');
const usersRouter = require('./routes/users');
const sessionRouter = require('./routes/sessionRouter');
const contactRouter = require('./routes/contactRouter');
const settingsRouter = require('./routes/settings');
const tanksRouter = require('./routes/tanksRouter');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
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
app.use('/contact', contactRouter);
app.use('/settings', settingsRouter);
app.use('/tanks', tanksRouter)

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
