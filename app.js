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


// TAKING THIS FROM THE "ALLINONE" CHATGPT :)
// Define the login route
app.get('/login', passport.authenticate('saml'));

app.post('/callbacktest', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ message: "Authentication succeeded" });
    });
  })(req, res, next);
});


// Define the callback route
app.post('/callback',
  passport.authenticate('saml', (err, user, info) => {
    if (err) {
      console.log("checkpoint alpha");
      return next(err);
    }
    if (!user) {
      console.log("checkpoint bravo");
      return res.status(401).json({ message: "Authentication failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.log("checkpoint charlie");
        return next(err);
      }
      console.log("checkpoint delta");
      return res.status(200).json({ message: "Authentication succeeded" });
    });
  }),
  midlog,
  (req, res) => {
    console.log("in callback and redirecting to secure ");
    res.redirect('/secure');
  }
);

// Define the callback route
app.post('/callbackog',
  passport.authenticate('saml', { failureRedirect: '/lose' }),
  midlog,
  (req, res) => {
    console.log("in callback and redirecting to secure ");
    res.redirect('/secure');
  }
);

function midlog(req, res, next) {
  console.log("made it to my own midlogger and REQ IS ", req.body);
  next();
}

// Define the home route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    console.log("in slash and AUTHENTICATION WORKED!!!!!");
    res.send('Hello, ' + req.user.nameID);
  } else {
    console.log("in slash but not authenticated");
    res.redirect('/login');
  }
});

app.get('/lose', (req, res) => {
  console.log("about to send saml.html ...");
  res.sendFile('saml.html', {root: __dirname + ''}); 
});

app.get('/secure', (req, res) => {
  console.log("finally made it to secure!");
  res.sendFile('sec.html', {root: __dirname + ''}); 
});

/*
app.get('/login',
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
      console.log("in /login now...");
      res.redirect('https://google.com');
    }
);

app.post('/adfs/postResponse',
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
      console.log("in /adfs/postresponse now...");
      //res.redirect('https://yahoo.com');
    }
);

app.get('/', (req, res) => {
  console.log("about to send saml.html ...");
  res.sendFile('saml.html', {root: __dirname + ''}); 
});

app.get('/secure', validUser, (req, res) => {
  console.log("finally made it to secure!");
  res.sendFile('sec.html', {root: __dirname + ''}); 
});


function validUser(req, res, next) {
    if (!req.user) {
      console.log("valid user not found - redirecting to login");
      res.redirect('https://mocksaml.com/saml/login');
    }
    next();
}
*/

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
