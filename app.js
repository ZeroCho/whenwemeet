var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var adaro = require('adaro');
var Pgb = require('pg-bluebird');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('dust', adaro.dust());
app.set('view engine', 'dust');
process.env['DATABASE_URL'] = 'postgres://thxcqbbpfrgolx:92MMhUKaB1bD_0Ga0gwZ6LC2cs@ec2-54-83-51-0.compute-1.amazonaws.com:5432/d4fgfofmnomujs';

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'wwmsec', saveUninitialized: true, resave: true}));
app.use(express.static(path.join(__dirname, 'public')));
var pgb = new Pgb().connect(process.env.DATABASE_URL);
pgb.catch(function(err) {
  console.log('app.js::pgb ' + err);
});
var passport = require('./passport')(app, pgb);
var routes = require('./routes/index')(passport, pgb);

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
