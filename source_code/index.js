const express = require('express'); // To build an application server or API
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server.
const multiplayerManager = require('./multi_play.js'); // To import the multiplayer manager object




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
app.use(express.static('public'))

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

app.use(express.static('resources'));

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
    // Query to get high scores from database
    let query = 'SELECT username, MAX(score) AS high_score, SUM(score) AS total_score FROM singleplayergames GROUP BY username ORDER BY high_score DESC LIMIT 50;'
    db.any(query)
    .then(async function (data) {
      if (data.length == 0) {
        res.render("pages/leaderboards", {user: req.session.user, message : "No scores found"});
        return;
      }
      console.log(data);
      res.render("pages/leaderboards", {user: req.session.user, leaderboards: data});
    })
    .catch(function (err) {
      console.log(err);
      res.render("pages/leaderboards", {message : "Something went wrong"});
    });
});

app.get('/totalLeaderboards', (req, res) => {
  if (!req.session.user) {
      return res.redirect('/login');
  }
  // Query to get total user score from database
  let query = 'SELECT username, SUM(score) AS sum_score FROM singleplayergames GROUP BY username ORDER BY sum_score DESC LIMIT 50;';
  db.any(query)
  .then(async function (data) {
    if (data.length == 0) {
      res.render("pages/totalLeaderboards", {user: req.session.user, message : "No scores found"});
      return;
    }
    console.log(data);
    res.render("pages/totalLeaderboards", {user: req.session.user, totalLeaderboards: data});
  })
  .catch(function (err) {
    console.log(err);
    res.render("pages/totalLeaderboards", {message : "Something went wrong"});
  });

});

app.get('/play', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render("pages/play", {user: req.session.user});
});

app.get('/how_to_play', (req, res) => {
  res.render("pages/how_to_play");
});

app.get('/about', (req, res) => {
  res.render("pages/about");
});

app.get('/play/single', (req, res) => {
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
      limit: 10,

    },
  })
    .then(results => {
      res.render("pages/play_single", {user: req.session.user, questions: results.data});
    })
    .catch(error => {
      console.log(error);
      res.render("pages/play_single", {user: req.session.user, questions: [{"question": "Error loading questions"}]});
    });
});

app.post('/play/single/submit_score', async (req, res) => {
  console.log("Score received from client: " + req.body.score + " for user " + req.session.user.username);
  // TODO: Insert score into database
  let query = 'INSERT INTO singleplayergames (username, score) VALUES ($1, $2);';
  db.any(query, [req.session.user.username, req.body.score])
  .then(async function (data) {
    res.json({success: true});
  })
  .catch(function (err) {
    console.log(err);
    res.json({success: false});
  });
});

app.post('/login', async (req, res) => {
    //hash the password using bcrypt library
    let query = 'SELECT username, password FROM users WHERE username = $1;';
    db.any(query, [req.body.username])
    .then(async function (data) {
      if (data.length != 1) {
        res.render("pages/login", {message : "Cannot find user in database"});
        return;
      }
      const user = data[0];
      const match = await bcrypt.compare(req.body.password, user.password);
      if (match) {
        req.session.user = user;
        console.log(req.session.user);
        req.session.save();
        res.redirect('/play');
      } else {
        res.render("pages/login", {message : "Incorrect password"});
      }
    })
    .catch(function (err) {
      console.log(err);
      res.render("pages/login", {message : "Something went wrong"});
    });
});


app.post('/register', async (req, res) => {
    //hash the password using bcrypt library
    if (req.body.password.length < 8) {
      res.render("pages/register", {message : "Password must be 8 or more characters"});
    }
    const hash = await bcrypt.hash(req.body.password, 10);
    const query = 'INSERT INTO users(username, password) VALUES ($1, $2);';
    db.any(query, [req.body.username, hash])
    .then(function (data) {
      res.redirect('/login');
    })
    .catch(function (err) {
      res.render("pages/register", {message : "Could not register user"});
    });
});

app.post('/play', (req, res) =>{
  const difficulty = req.body.difficulty;
  const categoriesArr = req.body.categories;
  const playerCount = req.body.playerCount;
  var categories;

  console.log(difficulty);

  if (Array.isArray(categoriesArr)){
    categories = categoriesArr.join(",");
  }
  else{
    categories = categoriesArr;
  }


  console.log(categories);

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
      limit: 10,
      difficulties: difficulty,
      categories: categories
    },
  })
    .then(results => {
      if (playerCount == "1"){
        res.render("pages/play_single", {user: req.session.user, questions: results.data});
      }
      else if (playerCount == "2"){
        let game = multiplayerManager.addNewGame(results.data);
        let gameCode = game.gameCode;
        res.redirect(`play/multi/${gameCode}`);
      }
    })
    // .catch(error => {
    //   // console.log(error);
    //   res.render("pages/play_single", {user: req.session.user, questions: [{"question": "Error loading questions"}]});
    // });
});

app.get('/play/multi/:code', (req, res) =>{
  if (!req.session.user) {
    return res.redirect('/login');
  }
  let gameCode = req.params.code;
  let game = multiplayerManager.findGame(gameCode);
  res.render("pages/play_multi", {user: req.session.user, gameCode: gameCode});
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


//ADD TEST USER
// Username = testuser
// Password = testpass
let testusers = ['testuser', 'testuser0', 'testuser1', 'testuser2', 'testuser3'];
for (let i = 0; i < testusers.length; i++) {
  (async () => db.any('INSERT INTO users(username, password) VALUES ($1, $2);', [testusers[i], await bcrypt.hash("testpass", 10)])
  .catch((err) => console.log(err)))();
}


// *****************************************************
// <!-- Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests

io.on('connection', (socket) => {
  socket.on('joined_multiplayer_game', (msg) => {
    if (multiplayerManager.findGame(msg.gameCode).addPlayer(socket, msg.username)) {
      socket.join(msg.gameCode);
      let playerList = multiplayerManager.findGame(msg.gameCode).players.map((player) => player.name);
      console.log(playerList)
      io.to(msg.gameCode).emit('new_players_joined', {players : playerList, ownerName : multiplayerManager.findGame(msg.gameCode).owner.name});
    }
  });

  socket.on('start_multiplayer_game', (msg) => {
    let game = multiplayerManager.findGame(msg.gameCode);
    if (game.owner.name == msg.username){
      game.startGame();
      io.to(msg.gameCode).emit('game_starting', {question : game.getCurrentQuestion(), leaderboard : game.leaderboard()});
    }
  });

  socket.on('update_player_score', (msg) => {
    let game = multiplayerManager.findGame(msg.gameCode);
    game.updatePlayerScore(msg.username, msg.score);
    if (game.readyToAdvance()) {
      if (game.nextQuestion()) {
        io.to(msg.gameCode).emit('question_advancing', {question : game.getCurrentQuestion(), leaderboard : game.leaderboard()});
      } else {
        io.to(msg.gameCode).emit('game_ending', {leaderboard : game.leaderboard()});
      }
      
    }
  });

});

module.exports = server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
