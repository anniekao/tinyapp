const express = require('express');
const app = express();
const PORT = 8000; // defaul port is usually 8080

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouse.ca",
  "9sm5xK": "http:www.google.com"
};

app.get('/', (req,res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("pages/urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("pages/urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('pages/urls_show', templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("OK");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

