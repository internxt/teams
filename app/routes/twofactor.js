const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const passport = require('~middleware/passport');

const { passportAuth } = passport;

module.exports = (Router, Service, Logger, App) => {
  /**
   * Gets a new 2FA code
   * Only auth. users can generate a new code.
   * Prevent 2FA users from getting a new code.
   */
  Router.get('/tfa', passportAuth, function (req, res) {
    const userData = req.user;
    if (!userData) {
      res.status(500).send({ error: 'User does not exists' });
    } else if (userData.secret_2FA) {
      res.status(500).send({ error: 'User has already 2FA' });
    } else {
      const secret = speakeasy.generateSecret({ length: 10 });
      const url = speakeasy.otpauthURL({
        secret: secret.ascii,
        label: 'Internxt',
      });
      qrcode
        .toDataURL(url)
        .then((bidi) => {
          res.status(200).send({
            code: secret.base32,
            qr: bidi,
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send({ error: 'Server error' });
        });
    }
  });

  Router.put('/tfa', passportAuth, function (req, res) {
    const user = req.user.email;

    Service.User.FindUserByEmail(user)
      .then((userData) => {
        if (userData.secret_2FA) {
          res.status(500).send({ error: 'User already has 2FA' });
        } else {
          // Check 2FA
          const isValid = speakeasy.totp.verifyDelta({
            secret: req.body.key,
            token: req.body.code,
            encoding: 'base32',
            window: 2,
          });

          if (isValid) {
            Service.User.Store2FA(user, req.body.key)
              .then((result) => {
                res.status(200).send({ message: 'ok' });
              })
              .catch((err) => {
                res.status(500).send({ error: 'Error storing configuration' });
              });
          } else {
            res.status(500).send({ error: 'Code is not valid' });
          }
        }
      })
      .catch((err) => {
        res.status(500).send({ error: 'Internal server error' });
      });
  });

  Router.delete('/tfa', passportAuth, function (req, res) {
    const user = req.user.email;

    Service.User.FindUserByEmail(user)
      .then((userData) => {
        if (!userData.secret_2FA) {
          res
            .status(500)
            .send({ error: 'Your account does not have 2FA activated.' });
        } else {
          // Check 2FA confirmation is valid
          const isValid = speakeasy.totp.verifyDelta({
            secret: userData.secret_2FA,
            token: req.body.code,
            encoding: 'base32',
            window: 2,
          });

          // Check user password is valid
          const decryptedPass = App.services.Crypt.decryptText(req.body.pass);

          if (userData.password.toString() !== decryptedPass) {
            res.status(500).send({ error: 'Invalid password' });
          } else if (!isValid) {
            res.status(500).send({
              error: 'Invalid 2FA code. Please, use an updated code.',
            });
          } else {
            Service.User.Delete2FA(user)
              .then((result) => {
                res.status(200).send({ message: 'ok' });
              })
              .catch((err) => {
                res.status(500).send({
                  error: 'Server error deactivating user 2FA. Try again later.',
                });
              });
          }
        }
      })
      .catch((err) => {
        res.status(500).send();
      });
  });
};
