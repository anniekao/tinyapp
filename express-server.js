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
const methodOverride = require("method-override");

// imported modules
const { getUserByEmail, generateRandomString, urlsForUser, checkURL } = require('./helpers');
const usersDatabase = require('./databases/usersDatabase');
const urlsDatabase = require('./databases/urlsDatabase');

const gripKeys = new Keygrip(["MUMBAI528", "LIGHT029"], "sha256", "hex");

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({keys: gripKeys}));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");


// GET routes
app.get("/", (req, res) => {
  let templateVars = {
    user: usersDatabase[req.session.userId]
  };
  res.render("pages/logout", templateVars);
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;

  // Checks if user is logged in, otherwise directs to error page
  if (userId) {
    let templateVars = {
      urls: urlsForUser(urlsDatabase, userId),
      user: usersDatabase[userId]
    };
    res.render("pages/urls_index", templateVars);
  } else if (!userId) {
    const user = usersDatabase[req.session.userId];
    res.status(403);
    res.render("pages/urls_err", { user, title: "403: Forbidden" });
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.userId) {
    let templateVars = {
      user: usersDatabase[req.session.userId]
    };
    res.render("pages/urls_new", templateVars);
  } else {
    res.redirect("/");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.userId;
  const urls = urlsForUser(urlsDatabase, userId);

  // Checks to see if the urls variable holds any url elements and if the current shortURL is one of them
  if (Object.keys(urls).includes(req.params.shortURL)) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlsDatabase[req.params.shortURL].longURL,
      user: usersDatabase[req.session.userId],
      date: urlsDatabase[req.params.shortURL].date,
      clicks: urlsDatabase[req.params.shortURL].clicks
    };
    res.render("pages/urls_show", templateVars);
    // checks if the shortURL exists at all and if it does, then returns an error since it does not belong to current user
  } else if (urlsDatabase[req.params.shortURL]) {
    const user = usersDatabase[req.session.userId];
    res.status(403);
    res.render("pages/urls_err", { user, title: "403: Forbidden" });
  } else {
    // if all else fails, then the url does not exist and an error page is rendered
    const user = usersDatabase[req.session.userId];
    res.status(404);
    res.render("pages/urls_err", { user, title: "404: Not Found" });
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlsDatabase[req.params.id] === undefined ? undefined :  urlsDatabase[req.params.id].longURL;
  
  if (longURL) {
    urlsDatabase[req.params.id].clicks++;
    res.redirect(longURL);
  } else {
    const user = usersDatabase[req.session.userId];
    res.status(404);
    res.render("pages/urls_err", { user, title: "404: Not Found" });
  }
});

app.get("/register", (req, res) => {
  res.redirect('/');
});

app.get("/login", (req, res) => {
  res.redirect("/");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();

  urlsDatabase[shortURL] = {
    longURL: checkURL(req.body.longURL),
    userID: req.session.userId,
    date: moment().format('MMMM Do YYYY'),
    clicks: 0
  };
  res.redirect(303, `/urls/${shortURL}`);
});

// POST routes
app.post("/login", (req, res) => {
  const userExists = getUserByEmail(usersDatabase, req.body.email);
  const passwordIsCorrect = bcrypt.compareSync(req.body.password, user.password);

  if (userExists && passwordIsCorrect) {
    req.session.userId = user.userId;
    res.redirect("/urls");
  } else {
    const user = usersDatabase[req.session.userId];
    res.status(400);
    res.render("pages/urls_err", { user, title: "400: Bad Request" });
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.post("/register", (req, res) => {
  let id = generateRandomString();

  if (getUserByEmail(usersDatabase, req.body.email)) {
    const user = usersDatabase[req.session.userId];
    res.status(400);
    res.render("pages/urls_err", { user, title: "400: Bad Request" });
  }

  // Creates a new user in the database
  usersDatabase[id] = {};
  usersDatabase[id].userId = id;
  usersDatabase[id].email = req.body.email;
  usersDatabase[id].password = bcrypt.hashSync(req.body.password, 10);

  req.session.userId = id;
  res.redirect('/urls');
});

<!-- --> 
app.put("/urls/:shortURL/", (req, res) => {
  const userId = req.session.userId;
  const urls = urlsForUser(urlsDatabase, userId);

  if (Object.keys(urls).includes(req.params.shortURL)) {
    urlsDatabase[req.params.shortURL].longURL = checkURL(req.body.longURL);
    res.redirect("/urls");
  } else {
    const user = usersDatabase[req.session.userId];
    res.status(403);
    res.render("pages/urls_err", { user, title: "403: Forbidden" });
  }
});

app.delete("/urls/:shortURL/", (req, res) => {
  const userId = req.session.userId;
  const urls = urlsForUser(urlsDatabase, userId);

  if (userId && Object.keys(urls).includes(req.params.shortURL)) {
    delete urlsDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    const user = usersDatabase[req.session.userId];
    res.status(403);
    res.render("pages/urls_err", { user, title: "403: Forbidden" });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});