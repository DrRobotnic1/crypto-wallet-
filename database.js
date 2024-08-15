var mysql = require("mysql2");
const dotenv = require("dotenv");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "crypto_wallet",
  password: "",
});

module.exports = connection;
