var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var saml = require('passport-saml');
//var samlStrategy = require('passport-saml').Strategy;
var fs = require('fs');
var session = require('express-session');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

//var port = normalizePort(process.env.PORT || '80');
//console.log("port is ", port);
const port = 8080;

// Define the SAML configuration options
const samlConfig = {
  entryPoint: 'https://samltest.id/idp/profile/SAML2/Redirect/SSO',
  //entryPoint: 'https://mocksaml.com/saml/login',
  issuer: 'https://devicetable.com',
  callbackUrl: 'https://samltest.devicetable.com/callback',
  cert: fs.readFileSync("./certs/samltest-id-public.key", "utf-8"),
  decryptionPvk: fs.readFileSync('./certs/key.pem', 'utf8'),
  privateCert: fs.readFileSync('./certs/cert.pem', 'utf8'),
  identifierFormat: null,
  validateInResponseTo: false,
  disableRequestedAuthnContext: true
};

var samlStrategy = new saml.Strategy(
    samlConfig,
    function(profile, done) {
      return done(null, profile); 
    });
    
passport.use(samlStrategy);


// Define the Passport SAML strategy
/*
passport.use(new saml.Strategy(
  samlConfig,
  (profile, done) => {
    return done(null, profile);
  }
));
*/

/*
var samlStrategy = new saml.Strategy({
  // URL that goes from the Identity Provider -> Service Provider
  callbackUrl: '/login/callback',   //process.env.CALLBACK_URL,
  // URL that goes from the Service Provider -> Identity Provider
  entryPoint: 'https://mocksaml.com/saml/login', //process.env.ENTRY_POINT',
  // Usually specified as `/shibboleth` from site root
  issuer: 'whatever', //process.env.ISSUER,
  identifierFormat: null,
  // Service Provider private key
  decryptionPvk: fs.readFileSync('./certs/key.pem', 'utf8'),
  // Service Provider Certificate
  privateCert: fs.readFileSync(__dirname + '/certs/key.pem', 'utf8'),
// Identity Provider's public key
  cert: fs.readFileSync(__dirname + '/certs/idp_key.pem', 'utf8'),
  validateInResponseTo: false,
  disableRequestedAuthnContext: true
}, function(profile, done) {
  return done(null, profile); 
});
*/

passport.use(samlStrategy);

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
  midlog,
  passport.authenticate('saml', { failureRedirect: '/lose' }),
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
    res.sendFile('sec.html', {root: __dirname + ''});
  } else {
    res.redirect('/login');
  }
});

// Start the server
app.listen(port, () => {
  console.log('Server started on port ', port);
});

function midlog(req, res, next) {
  console.log("made it to my own midlogger");
  next();
}

app.get('/lose', (req, res) => {
  console.log("about to send saml.html ...");
  res.sendFile('saml.html', {root: __dirname + ''}); 
});

/*
app.get('/metadata', (req, res) => {
  res.type("application/xml");
  decrypcert = fs.readFileSync('certs/cert.pem','utf8');
  console.log("checkpoint charlie ", decrypcert);
  res.status(200);
  //decrypcert = fs.readFileSync('certs/cert.pem','utf8');
  //console.log("checkpoint charlie ", decrypcert);
  res.send(
    //SamlStrategy.generateServiceProviderMetadata(
    samlStrategy.generateServiceProviderMetadata());
        // fs.readFileSync("certs/cert.pem", "utf8") ) );  
});
*/

app.get('/Metadata', 
  function(req, res) {
    res.type('application/xml');
    res.status(200).send(samlStrategy.generateServiceProviderMetadata(fs.readFileSync('./certs/cert.pem', 'utf8')));
  }
);
