const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const secrets = require('../config/secrets.js');

// middleware
// module.exports = function restricted(req, res, next) {
//   const { username, password } = req.headers;

//   if (req.session && req.session.user) {
//     // Users.findBy({ username })
//     //   .first()
//     //   .then(user => {
//     //     if (user && bcrypt.compareSync(password, user.password)) {
//     //       next();
//     //     } else {
//     //       res.status(401).json({ message: 'Invalid Credentials' });
//     //     }
//     //   })
//     //   .catch(error => {
//     //     res.status(500).json(error);
//     //   });
//     next();
//   } else {
//     res.status(400).json({ message: 'Please provide valid credentials' });
//   }
// };


module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, secrets.jwtSecret, (err, decodeToken) => {
      if (err) {
        // invalid token
        res.status(401).json({ message: 'Invalid Credentials' });
      } else {
        // valid token
        req.user = { roles: decodeToken.roles, username: decodeToken.username };
        next();
      }
    });
  } else {
    res.status(400).json({ message: 'No token provided' });
  }
};
