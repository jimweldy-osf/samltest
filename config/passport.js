var fs = require("fs");
var passport = require('passport');
var passportSaml = require('passport-saml');
var samlStrategy = require('passport-saml').Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

console.log("loading passport.js config...");
passport.use(
    new samlStrategy(
      {
        entryPoint: "https://mocksaml.com/saml/login",
        issuer: "devicetable.com",
        callbackUrl: "http://osf-dev-env.eba-kdcjyk3f.us-east-1.elasticbeanstalk.com/callback",
        privateKey: fs.readFileSync("./certs/key.pem", "utf-8"),
        cert: fs.readFileSync("./certs/cert.pem", "utf-8"),
        authnContext: [
            "http://scheemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password",
        ],
        identifierFormat: null,
        signatureAlgorithm: "sha256",
        racComparison: "exact",
        audience: "https://adfs.blahblah.com/FederationMetadata/2007-06/FederationMetadata.xml",
      },
    function (profile, done) {
      console.log("assertions can KILLLLLLLLLLLLLLLL");
        return done(null, {
            upn: profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"],
        });
    }
    )
);

module.exports = passport;
