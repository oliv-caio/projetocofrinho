CREATE DATABASE banco;

USE banco;

CREATE TABLE carteira (
  id INT NOT NULL AUTO_INCREMENT,
  saldo DECIMAL(9,2) NOT NULL,
  PRIMARY KEY (id)
);
