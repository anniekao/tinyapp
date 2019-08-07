const express = require('express');
const app = express();
const PORT = 8000; // defaul port is usually 8080

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use((cookieParser()));

app.set("view engine", "ejs");

const generateRandomString = () => {
  const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += ALPHA[Math.floor(Math.random() * ALPHA.length)];
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouse.ca", userID: 0 },
  "9sm5xK": { longURL: "http://www.google.com", userID: 1 }
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
  let result = [];
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result.push(urlDatabase[url].longURL);
    }
  }
};

const users = {};

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("pages/urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("pages/urls_new", templateVars);
});

app.get("/urls/err", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("pages/urls_err.ejs", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.cookies["user_id"]]
    };
    res.render('pages/urls_show', templateVars);
  } else {
    res.redirect('urls/urls_err');
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
    user: users[req.cookies["user_id"]]
  };
  res.render('pages/urls_registration', templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id]
  };

  res.render('pages/login', templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies.user_id};
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const user = findEmail(req.body.email);

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please fill out the email and/or password fields");
  } else if (findEmail(req.body.email) === false) {
    res.status(400).send("Sorry you're not registered");
  } else if (user.password !== req.body.password) {
    res.status(400).send("Wrong password!");
  }

  res.cookie("user_id", user.user_id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('name');
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  let len = Object.keys(users).length;
  if (findEmail(req.body.email) !== false) {
    res.status(400).send("You've already registered");
  }

  users[len] = {};
  users[len]["user_id"] = len;
  users[len]["email"] = req.body.email;
  users[len]["password"] = req.body.password;

  res.cookie("user_id", len);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});