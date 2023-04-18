CREATE TABLE IF NOT EXISTS users (
   username VARCHAR(50) PRIMARY KEY,
   password CHAR(60) NOT NULL
);



CREATE TABLE IF NOT EXISTS singleplayergames (
   id SERIAL PRIMARY KEY,
   username VARCHAR(50) NOT NULL,
   score INT NOT NULL,
   date_entered TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (username) REFERENCES users(username)
);
