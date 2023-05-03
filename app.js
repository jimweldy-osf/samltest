var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
const passport = require("passport");
const saml = require("passport-saml");
require("./config/passport.js");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

app.use(passport.initialize());
//app.use(passport.session());

app.get('/metadata', (req, res) => {
  res.type("application/xml");
  decrypcert = fs.readFileSync('certs/cert.pem','utf8');
  console.log("checkpoint charlie ", decrypcert);
  res.status(200);
  //decrypcert = fs.readFileSync('certs/cert.pem','utf8');
  //console.log("checkpoint charlie ", decrypcert);
  res.send(
  samlStrategy.generateServiceProviderMetadata(
      fs.readFileSync("certs/cert.pem", "utf8")
  )
  );
  
});

app.get('/login',
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
      res.redirect('https://acme_tools.com');
    }
);

app.post('/adfs/postResponse',
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
      res.redirect('https://acme_tools.com');
    }
);

app.get('/', (req, res) => {
  res.sendFile('saml.html', {root: __dirname + ''}); 
});

app.get('/secure', validUser, (req, res) => {
  res.sendFile('sec.html', {root: __dirname + ''}); 
});

function validUser(req, res, next) {
    if (!req.user) {
      res.redirect('https://mocksaml.com/saml/login');
    }
    next();
}

//var server = http.createServer(app);

/*
app.get('/jim', (req, res) => {
  // retrieve list of users from database
  console.log("jim says hi!");
  const users = ['John', 'Mary', 'Bob'];
  res.send(users);
});

app.get('/james', (req, res) => {
  //res.type('application/xml');
  console.log("james says hi!");
  decrypcert = fs.readFileSync('certs/cert.pem','utf8');
  console.log("checkpoint charlie ", decrypcert);
  const users = ['John', 'Mary', 'Bob'];
  res.send(decrypcert);
});
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

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
