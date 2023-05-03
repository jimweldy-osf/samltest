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

passport.use(
    new samlStrategy(
      {
        entryPoint: "https://mocksaml.com/",
        issuer: "devicetable.com",
        callbackUrl: "https://samltest.devicetable.com/postResponse",
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
        return done(null, {
            upn: profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"],
        });
    }
    )
);

module.exports = passport;
