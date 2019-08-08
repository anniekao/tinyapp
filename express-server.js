// express setup
const express = require('express');
const app = express();
const PORT = 8000; // defaul port is usually 8080

// dependencies
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const Keygrip = require('keygrip');
const moment = require('moment');

// imported modules
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const usersDatabase = require('./databases/usersDatabase');
const urlsDatabase = require('./databases/urlsDatabase');


const gripKeys = new Keygrip(["MUMBAI528", "LIGHT029"], "sha256", "hex");

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({keys: gripKeys}));

app.set("view engine", "ejs");

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    let templateVars = {
      urls: urlsForUser(urlsDatabase, userId),
      user: usersDatabase[userId]
    };
    res.render("pages/urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
  
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      user: usersDatabase[req.session.user_id]
    };
    res.render("pages/urls_new", templateVars);
  } else {
    res.redirect("/login");
  } 
});

app.get("/urls/err", (req, res) => {
  let templateVars = {
    user: usersDatabase[req.session.user_id]
  };
  res.render("pages/urls_err", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const urls = urlsForUser(urlsDatabase, userId);
  if (userId) {
    if (urlsDatabase[req.params.shortURL] && Object.keys(urls).includes(req.params.shortURL)) {
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlsDatabase[req.params.shortURL].longURL,
        user: usersDatabase[req.session.user_id],
        date: urlsDatabase[req.params.shortURL].date
      };
      res.render("pages/urls_show", templateVars);
    } else if (urlsDatabase[req.params.shortURL] && Object.keys(urls).includes(req.params.shortURL) === false) {
      res.status(400).send("Sorry. This TinyURL doen't belong to you");
    }
  } else {
    res.redirect('/login');
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlsDatabase[req.params.id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.redirect("urls/urls_err");
  }
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: usersDatabase[req.session.user_id]
  };
  res.render('pages/urls_registration', templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: usersDatabase[req.session.user_id]
  };

  res.render("pages/login", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlsDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    date: moment().format('MMMM Do YYYY')};
  res.redirect(303, `/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const urls = urlsForUser(urlsDatabase, userId);

  if (Object.keys(urls).includes(req.params.shortURL)) {
    delete urlsDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("Sorry. This TinyURL doesn't belong to you.");
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const userId = req.session.user_id;
  const urls = urlsForUser(urlsDatabase, userId);

  if (Object.keys(urls).includes(req.params.shortURL)) {
    urlsDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(400).send("Sorry. This TinyURL doesn't belong to you.");
  }
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(usersDatabase, req.body.email);

  if (getUserByEmail(usersDatabase, req.body.email) === undefined) {
    res.status(400).send("Sorry you're not registered");
  } else if (bcrypt.compareSync(req.body.password, user.password) === false) {
    res.status(400).send("Wrong password!");
  }

  req.session.user_id = user.user_id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let id = generateRandomString();
  if (getUserByEmail(usersDatabase, req.body.email)) {
    res.status(400).send("You've already registered");
  } else if (req.body.email === undefined || req.body.password === undefined) {
    res.status(400).send("Please fill out the password/email fields");
  }

  usersDatabase[id] = {};
  usersDatabase[id].user_id = id;
  usersDatabase[id].email = req.body.email;
  usersDatabase[id].password = bcrypt.hashSync(req.body.password, 10);

  req.session.user_id = id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});