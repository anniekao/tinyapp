const express = require('express');
const app = express();
const PORT = 8000; // defaul port is usually 8080

const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const Keygrip = require('keygrip');

const gripKeys = new Keygrip(["MUMBAI528", "LIGHT029"], "sha256", "hex");

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({keys: gripKeys}));

app.set("view engine", "ejs");

const generateRandomString = () => {
  const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += ALPHA[Math.floor(Math.random() * ALPHA.length)];
  }
  return result;
};

const findEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const urlsForUser = (id) => {
  const result = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url];
    }
  }
  return result;
};

const users = {};
const urlDatabase = {};

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    let templateVars = {
      urls: urlsForUser(userId),
      user: users[userId]
    };
    res.render("pages/urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
  
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("pages/urls_new", templateVars);
  } else {
    res.redirect("/login");
  } 
});

app.get("/urls/err", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("pages/urls_err", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const urls = urlsForUser(userId);
  if (userId) {
    if (urlDatabase[req.params.shortURL] && Object.keys(urls).includes(req.params.shortURL)) {
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user: users[req.session.user_id]
      };
      res.render("pages/urls_show", templateVars);
    } else if (urlDatabase[req.params.shortURL] && Object.keys(urls).includes(req.params.shortURL) === false) {
      res.status(400).send("Sorry. This TinyURL doen't belong to you");
    }
  } else {
    res.redirect('/login');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!longURL) {
    res.redirect('urls/urls_err');
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('pages/urls_registration', templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };

  res.render('pages/login', templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(303, `/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const urls = urlsForUser(userId);

  if (Object.keys(urls).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("Sorry. This TinyURL doesn't belong to you.");
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const userId = req.session.user_id;
  const urls = urlsForUser(userId);

  if (Object.keys(urls).includes(req.params.shortURL)) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(400).send("Sorry. This TinyURL doesn't belong to you.");
  }
});

app.post("/login", (req, res) => {
  const user = findEmail(req.body.email);

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please fill out the email and/or password fields");
  } else if (findEmail(req.body.email) === false) {
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
  if (findEmail(req.body.email) !== false) {
    res.status(400).send("You've already registered");
  } else if (req.body.email === undefined || req.body.password === undefined) {
    res.status(400).send("Please fill out the password/email fields");
  }

  users[id] = {};
  users[id].user_id = id;
  users[id].email = req.body.email;
  users[id].password = bcrypt.hashSync(req.body.password, 10);

  req.session.user_id = id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});