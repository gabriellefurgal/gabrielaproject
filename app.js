var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator =require('express-validator');
var expressSession =require('express-session');
var expressPartials = require('express-partials');
var passport = require('passport');
var compression = require('compression');
var helmet = require('helmet');
var debug = require('debug')('author');

var index = require('./routes/index');
var users = require('./routes/users');
var placeInfo = require('./routes/placeInfo');
var signIn= require('./routes/signIn');
var logIn= require('./routes/logIn');
var searchResult = require('./routes/searchResult');
var effTest = require('./routes/effTest');
var compression = require('compression');


var app = express();

app.use(helmet());
app.set(NODE_ENV="production");
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());

app.use(compression()); //Compress all routes
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({saveUninitialized: true,
    resave: true,
    secret: "This is a secret"}));
app.use('/', index);
app.use('/test', effTest);
app.use(placeInfo);
app.use(signIn);
app.use(logIn);
app.use(searchResult);
app.use(expressPartials);


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

// Display Author update form on GET
exports.author_update_get = function(req, res, next) {

    req.sanitize('id').escape().trim();
    Author.findById(req.params.id, function(err, author) {
        if (err) {
            debug('update error:' + err);
            return next(err);
        }
        //On success
        res.render('author_form', { title: 'Update Author', author: author });
    });

};
module.exports = app;
