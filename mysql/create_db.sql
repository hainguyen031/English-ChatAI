CREATE DATABASE IF NOT EXISTS db_nmcnpm;

USE db_nmcnpm;
CREATE TABLE  IF NOT EXISTS users (
  id char(36),
  username varchar(30) NOT NULL,
  password varchar(50) NOT NULL,
  created_at timestamp NOT NULL,
  updated_at timestamp,
  deleted_at timestamp,
  PRIMARY KEY(id)
  );

CREATE TABLE  IF NOT EXISTS historys (
  id char(36),
  created_at timestamp NOT NULL,
  updated_at timestamp,
  deleted_at timestamp,
  user_id char(36),
  PRIMARY KEY(id),
  CONSTRAINT fk_users_historys_from_user FOREIGN KEY (user_id) REFERENCES users(id)
  );
  
CREATE TABLE  IF NOT EXISTS logs (
  id char(36),
  number_sentence int,
  sentences text,
  history_id char(36),
  created_at timestamp NOT NULL,
  updated_at timestamp,
  deleted_at timestamp,
  item_role char(36),
  PRIMARY KEY(id),
  CONSTRAINT fk_historys_logs_from_history FOREIGN KEY (history_id) REFERENCES historys(id)
  );
  
CREATE TABLE IF NOT EXISTS saved_words (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  word VARCHAR(255) NOT NULL,
  meaning TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
