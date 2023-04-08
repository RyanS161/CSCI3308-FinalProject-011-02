CREATE TABLE IF NOT EXISTS users (
   username VARCHAR(50) PRIMARY KEY,
   password CHAR(60) NOT NULL
);

INSERT INTO users (username, password) VALUES ('testuser', 'testpass');