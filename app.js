require('newrelic');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var adaro = require('adaro');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://zero:Wpfhsms0!@ds031873.mongolab.com:31873/heroku_lhdjlrwx';
var app = express();
var options = {
  helpers: ['dustjs-helpers'],
  whitespace: true
};
MongoClient.connect(url).then(function (database) {
	console.log("app:Connected correctly to server");
	app.set('db', database);
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('dust', adaro.dust(options));
app.set('view engine', 'dust');
app.use(favicon(path.join(__dirname, 'www', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'www')));

var routes = require('./routes/index')(app.get('db'));
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
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
