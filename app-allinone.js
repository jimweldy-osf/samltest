const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const fs = require('fs');
const session = require('express-session');

//var port = normalizePort(process.env.PORT || '80');
//console.log("port is ", port);
const port = 8080;

// Define the SAML configuration options
const samlConfig = {
  entryPoint: 'https://mocksaml.com/saml/login',
  issuer: 'https://devicetable.com',
  callbackUrl: 'https://samltest.devicetable.com/callback',
  //cert: '-----BEGIN CERTIFICATE-----\n<certificate goes here>\n-----END CERTIFICATE-----',
  cert: fs.readFileSync("./certs/idp_key.pem", "utf-8")
};

// Define the Passport SAML strategy
passport.use(new SamlStrategy(
  samlConfig,
  (profile, done) => {
    return done(null, profile);
  }
));

// Create the Express app
const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Define the login route
app.get('/login', passport.authenticate('saml'));

// Define the callback route
app.post('/callback',
  passport.authenticate('saml', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Define the home route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    //res.send('Hello, ' + req.user.nameID);
    req.session.views = (req.session.views || 0) + 1;
    res.send(`Number of views: ${req.session.views}`);
    res.sendFile('saml.html', {root: __dirname + ''});
  } else {
    res.redirect('/login');
  }
});

// Start the server
app.listen(port, () => {
  console.log('Server started on port ', port);
});
