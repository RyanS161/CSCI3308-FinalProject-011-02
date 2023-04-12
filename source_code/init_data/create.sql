CREATE TABLE IF NOT EXISTS users (
   username VARCHAR(50) PRIMARY KEY,
   password CHAR(60) NOT NULL
);


-- User with username testuser and password testpassword
INSERT INTO users(username, password) VALUES ('testuser', '$2b$10$PrEzSxCob2FRtjKKH290O.yFtmc9Zru.IPBijTUwBZBu8j6Dk3RcC');