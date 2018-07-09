var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var notp = require('notp');

require('./models/Posts');
require('./models/Comments');
require('./models/Users');
require('./models/Units');
require('./models/Chats');
require('./models/Methods');
require('./models/MethodsGallo');
require('./models/Campo');
require('./models/Messages');
require('./models/Roya');
require('./models/Gallo');
require('./models/Widget');
require('./models/Variety');
require('./models/Vulnerability');
require('./models/Encuesta');

require('./config/passport'); mongoose.connect('mongodb://cafenube:Sec03lP1nt0@coffeecloud.centroclima.org/dummyDB', {
  server: {
    socketOptions: {
      socketTimeoutMS: 0,
      connectionTimeout: 0
    }
  }
});

//XR7vwshDKmKW
//{
//      user: "admin",
//      pwd: "Sec03lP1nt0",
//      user: "cafenube",
//       pwd: "Sec03lP1nt0",
//    }

var passport = require('passport');



var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var instituto = require('./routes/instituto');

var app = express();
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());




app.use('/', routes);
app.use('/users', users);
app.use('/admin/', admin);
app.use('/instituto/', instituto);



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
