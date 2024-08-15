var mysql = require("mysql2");
const cors = require("cors");
var session = require("express-session");
const prompt = require("prompt-sync");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

var { faker } = require("@faker-js/faker");
var connection = require("./database");
const express = require("express");
const path = require("path");

const app = express();
app.use(cors());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "mkhulu",
    cookie: { maxAge: 3000000 },
    saveUninitialized: false,
    resave: false,
  })
);

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected");
});

app.listen(3000, () => {
  console.log("running on port 3000");
});

async function btc_rate() {
  const url = "https://api.coinbase.com/v2/exchange-rates?currency=BTC";

  const res = await fetch(url);
  const data = await res.json();

  let price = data.data.rates.ZAR;

  return price;
}

const btc_price = btc_rate();
console.log(btc_price);

app.get("/home", (req, res) => {
  connection.query(
    "SELECT COUNT(*) AS walletCount FROM wallets",
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Database query error");
        return;
      }

      const walletCount = results[0].walletCount;

      res.render("home", {
        walletCount: walletCount || 0,
      });
    }
  );
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  connection.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Internal Server Error");
      }

      if (result.length > 0) {
        const user = result[0].user_id;
        const user_name = result[0].first_name;
        req.session.user_id = user;

        res.render("./dashboard", {
          user_name,
        });
      } else {
        res.status(401).send("Invalid email or password.");
      }
    }
  );
});

app.get("/dashboard", (req, res) => {
  const current_user = req.user_id ? req.user_id.first_name : "Guest";

  console.log("dashboard session", req.session.user_id);
  res.render("current_user", { current_user });
});

app.post("/register", (req, res) => {
  const date = new Date().toISOString().split("T")[0];
  const { first_name, last_name, email, password } = req.body;
  const fk = req.session.user_id;

  connection.query(
    "insert into users set?",
    { first_name, last_name, email, password, date },
    (err, result, fld) => {
      if (err) throw err;
      res.send("successfully registered");
    }
  );
});

app.get("/transactions", (req, res) => {
  connection.query(
    "select*from transactions where user_id = ?",
    [req.session.user_id],

    (err, result, fld) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

app.get("/balance", (req, res) => {
  const current_user = req.session.user_id;
  console.log(current_user);

  connection.query(
    "select * from wallets where user_id = ?",
    current_user,
    (err, result, fld) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

app.post("/logout", (req, res) => {
  if (req.session.user_id) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("error");
      }
      res.redirect("/home");
    });
  } else {
    res.status(400).send("No user is logged in.");
  }
});

app.post("/deposit", (req, res, next) => {
  const amount = parseFloat(req.body.amount);
  let current_id = req.session.user_id;
  const date = new Date().toISOString().split("T")[0];
  console.log(date);

  let transaction_q = `INSERT INTO transactions (date, user_id, amount,type)VALUES ('${date}',${current_id} , ${amount}, 'deposit')`;

  if (amount > 0) {
    connection.query(
      "INSERT INTO wallets (zar_balance,user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE zar_balance = zar_balance + ?",
      [amount, req.session.user_id, amount],
      (err, result, fld) => {
        if (err) throw err;
        res.send("deposit successful");
      }
    ),
      connection.query(transaction_q, (err, resul) => {
        if (err) throw err;
      });
  } else {
    res.status(400).send("invalid amount please insert amount");
  }
});

app.post("/buy", (req, res) => {
  let amount = req.body.amount;
  let current_user = req.session.user_id;
  const date = new Date().toISOString().split("T")[0];
  let transaction_q = `INSERT INTO transactions (date, user_id, amount,type)VALUES ('${date}',${current_user} , -${amount}, 'Buy')`;
  let buy_mssg = `succesfully bought bitcoin worth R${amount}`;

  console.log(req.session.user_id);
  let q = `UPDATE wallets SET btc_balance = btc_balance + ${amount}, zar_balance = zar_balance - ${amount} WHERE user_id = ${current_user}`;
  connection.query(q, (err) => {
    res.send(buy_mssg);
  }),
    connection.query(transaction_q, (err, resul) => {
      if (err) throw err;
    });
  res.end;
});

app.post("/withdraw", (req, res) => {
  let amount = req.body.amount;
  let current_user = req.session.user_id;
  const date = new Date().toISOString().split("T")[0];
  let transaction_q = `INSERT INTO transactions (date, user_id, amount,type)VALUES ('${date}',${current_user} , -${amount}, 'Withdrawal')`;

  if (amount > 0) {
    connection.query(
      "UPDATE wallets SET zar_balance = zar_balance-? WHERE user_id = ?",
      [amount, current_user],
      (err) => {
        if (err) throw err;
        res.send("withdrawal successful");
      }
    ),
      connection.query(transaction_q, (err) => {
        if (err) throw err;
      });
  }
});
