var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator =require('express-validator');
var expressSession =require('express-session');
var expressPartials = require('express-partials');
var passport = require('passport');

var index = require('./routes/index');
var users = require('./routes/users');
var placeInfo = require('./routes/placeInfo');
var signIn= require('./routes/signIn');
var logIn= require('./routes/logIn');
var indexSignIn= require('./routes/indexSignUp');
var indexLogIn= require('./routes/indexLogIn');

var app = express();

app.set(NODE_ENV="development");
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({saveUninitialized: true,
    resave: true,
    secret: "This is a secret"}));
app.use('/', index);
app.use('/users', users);
app.use(placeInfo);
app.use(signIn);
app.use(logIn);
app.use(expressPartials);

// // Passport Config
// require('./config/passport')(passport);
// Passport Middleware
// app.use(passport.initialize());
// app.use(passport.session());
//
// app.get('*', function(req, res, next){
//   res.locals.users = req.user || null;
//   next();
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
