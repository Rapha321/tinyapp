const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
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

// USERS DATABASE
const users = {
  "userRandomID": {
                    id: "userRandomID",
                    email: "user@example.com",
                    password: "purple-monkey-dinosaur"
                  },
 "user2RandomID": {
                    id: "user2RandomID",
                    email: "user2@example.com",
                    password: "dishwasher-funk"
                  }
}

// EMAIL LOOKUP FUNCTION
function emailLookUp(input) {
  for (let user in users) {
    if (input === users[user].email) {
      return true;
    }
  }
}

//PASSWORD LOOKUP FUNCTION
function passwordLookUp(input) {
  for (let user in users) {
    if (input === users[user].password) {
      return true;
    }
  }
}


// DISPLAY SHORT AND LONG URLs
app.get("/urls", (req, res) => {
  let templateVars = {
                        users: users,
                        user_id: req.cookies["user_id"],
                        urls: urlDatabase
                      };
  res.render("urls_index", templateVars);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// PASSING DATA TO URLS_NEW & RENDER PAGE TO CREATE NEW URL
app.get('/urls/new', (req, res) => {
  let templateVars = {
                      users: users,
                      user_id: req.cookies["user_id"],
                      urls: urlDatabase
                    };
  res.render('urls_new', templateVars);
});

// PASSING DATA TO /REGISTER & RENDER /REGISTER PAGE
app.get('/register', (req, res) => {
  let templateVars = {
                      users: users,
                      user_id: req.cookies["user_id"],
                      urls: urlDatabase
                    };
  res.render('register', templateVars)
})

// PASSING DATA TO /LOGIN & RENDER /LOGIN PAGE
app.get('/login', (req, res) => {
  let templateVars = {
                      users: users,
                      user_id: req.cookies["user_id"],
                      urls: urlDatabase
                    };
  res.render('login', templateVars);
})

// ADD NEW SHORT & LONG URL TO DATABASE
app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  res.redirect(`/urls/${newShortUrl}`);
});

// DISPLAY LONG & SHORT URL FOR SPECIFIC SHORT URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
                       users: users,
                       user_id: req.cookies["user_id"],
                       urls: urlDatabase,
                       shortURL: req.params.shortURL,
                       longURL: urlDatabase[req.params.shortURL]
                     }
  res.render("urls_show", templateVars);
});

// REDIRECT TO ACTUAL LONG URL WEBSITE
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls')
});

// EDIT URL
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls')
})

// EDGE CASE FOR REGISTERING NEW USER + SET COOKIE
app.post("/register", (req, res) => {
  let randomUser = `user${generateRandomString()}`;
  // send error message if user leave email and/or password fields blank
  if (req.body.email === "" || req.body.password === "") {
    res.send('Error - 400 Bad Request. Email or Password cannot be blank.')
  }
  // send error message if user register with an existing email,
  else if (emailLookUp(req.body.email) === true) {
    res.send('Error - 400 Bad Request. Email already exist.')
  }
  users[randomUser] = {
                        id: randomUser,
                        email: "user1@example.com",
                        password: "test"
                     }
  res.cookie('user_id', 'user_id');
  res.redirect('/urls');
});

// EDGE CASE WHEN EXISTING USER LOGIN + SET COOKIE
app.post("/login", (req, res) => {
  // send error message if user login with incorrect email
  if (!emailLookUp(req.body.email)) {
    res.send('Error - 403 Forbidden. Email does not match.')
  }
  // sent error message if user input incorrect password
  else if (!passwordLookUp(req.body.password)) {
    res.send('Error - 403 Forbidden. Password does not match.')
  }
  res.cookie('user_id', 'user_id');
  res.redirect("/urls");
});

// CLEAR COOKIE WHEN USER LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});