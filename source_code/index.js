const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server.

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- API Routes -->
// *****************************************************

app.get('/', (req, res) => {
    res.render("pages/home", {user: req.session.user});
});

app.get('/login', (req, res) => {
    res.render("pages/login");
});

app.get('/register', (req, res) => {
    res.render("pages/register");
});

app.get('/leaderboards', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render("pages/leaderboards", {user: req.session.user});
});

app.get('/play', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    axios({
      url: `https://the-trivia-api.com/api/questions`,
      method: 'GET',
      dataType: 'json',
      headers: {
        'Accept-Encoding': 'application/json',
      },
      params: {
        limit: 1,
      },
    })
      .then(results => {
        console.log(results)
        res.render("pages/play", {user: req.session.user, questions: results.data});
      })
      .catch(error => {
        console.log(error);
        res.render("pages/play", {user: req.session.user, questions: [{"question": "Error loading questions"}]});
      });
});

app.post('/login', async (req, res) => {
    //hash the password using bcrypt library
    const query = 'SELECT username, password FROM users WHERE username = $1;';
    db.any(query, [req.body.username])
    .then(async function (data) {
      if (data.length === 0) {
        res.redirect("/register", {message : "User does not exist. Please register."});
      }
      const user = data[0];
      const match = await bcrypt.compare(req.body.password, user.password);
      if (match) {
        req.session.user = user;
        console.log(req.session.user);
        req.session.save();
        res.redirect('/leaderboards');
      } else {
        res.render("pages/login", {message : "Incorrect username or password"});
      }
    })
    .catch(function (err) {
      console.log(err);
      res.render("pages/login", {message : "Cannot find user in database"});
    });
});


app.post('/register', async (req, res) => {
    //hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);
    const query = 'INSERT INTO users(username, password) VALUES ($1, $2);';
    db.any(query, [req.body.username, hash])
    .then(function (data) {
      res.redirect('/login');
    })
    .catch(function (err) {
      res.redirect('/register', {message : "Could not register user"});
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


// *****************************************************
// <!-- Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');