const express = require('express');
const server = express();

// server.use(logger);
const bcrypt=require('bcrypt');
const Users=require('./data/user-model.js');
const restricted = require('./data/restricted.js')
const session = require('express-session');
const helmet = require('helmet')
const jwt = require('jsonwebtoken')

const secrets = require('./config/secrets')



const sessionConfig={
  name: 'monkey',
  secret: 'keep it secret, keep it safe!',
  cookie: {
    maxAge: 1000*60*60*24,
    secure: false, //true in production
    httpOnly: true //cookie can't be
  },
  resave: false, // do we want to recreate session
  saveUninitialized: false, // 
}

server.use(helmet())
server.use(express.json()); // built-in mw
server.use(session(sessionConfig))




server.get('/', (req, res) => {
    res.send(`<h2>Let's do this authy business!</h2>`)
  });


  server.post('/api/register', async (req, res) => {
    try {
        const userInfo = await req.body
        console.log(userInfo)
        userInfo.password = await bcrypt.hashSync(userInfo.password, 10)
        const user = await Users.addUser(userInfo)
        res.status(201).json(user);
    }

    catch (error){
        console.log(error);
        res.status(500).json({
          message: 'Error creating a new user suckas',
        });
  
    }
  });

  server.post('/api/login', async (req, res) => {

    let {username, password, department} = req.body;
    try {
        const user = await Users.findBy( { username })
        if (user && bcrypt.compareSync(password, user[0].password)){
          const token = generateToken(user);
          res.status(200).json({message:`Welcome user!`,
        token, 
        });

        }
        else {
            res.status(401).json({message: 'Invalid Credentials'})
        }
    }
    catch (error){
        console.log(error);
        res.status(500).json({
          message: 'Error creating a new login suckas',
        });

    }
});

function generateToken(user){
  const payload = {
    subject: user.id,
    username: user.username,
    department: user.department,

    //... other data like what websites someone has visited
  }
  const secret = secrets.jwtSecret
  const options = {
  expiresIn: '8h',
}
  return jwt.sign(payload, secret, options)
}


server.get('/api/users', restricted, async (req, res) => {
    try {
      
     const users= await Users.findUsers()
     const userdisplay = {id: users[0].id, username:users[0].username};
    
      res.status(200).json(userdisplay);
    } catch (error) {
      
      res.status(500).json({
        message: 'Error retrieving the dang users',
      });
    }
  });


//   //routing and API:
  
// //   const cohortRouter = require('./data/cohortRouter.js');
// //   const studentRouter = require('./data/studentRouter.js');
// //   server.use('/api/cohorts', cohortRouter);
// //   server.use('/api/students', studentRouter);
  
module.exports = server;
