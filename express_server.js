const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// GENERATE RANDOM SHORT URL
function generateRandomString() {
  let possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVQXYZ1234567890";
  let result = "";
  for (let i = 0; result.length < 6; i++) {
    result += possible[Math.floor(Math.random() * possible.length)]
  }
  return result;
}

// URL DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// DISPLAY SHORT AND LONG URLs
app.get("/urls", (req, res) => {
  let templateVars = {
                        urls: urlDatabase,
                      };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// RENDER PAGE TO CREATE NEW URL
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// ADD NEW SHORT & LONG URL TO DATABASE
app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  res.redirect(`/urls/${newShortUrl}`);
});

// DISPLAY LONG & SHORT URL FOR SPECIFIC SHORT URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
                       urls: urlDatabase,
                       shortURL: req.params.shortURL,
                       longURL: urlDatabase[req.params.shortURL]
                     }
  res.render("urls_show", templateVars)
});

// REDIRECT TO ACTUAL LONG URL WEBSITE
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls')
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});