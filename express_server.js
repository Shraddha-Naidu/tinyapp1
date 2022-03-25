const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require("bcrypt");

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/* MIDDLEWARE */
app.use(morgan("combined"))

/* OBJECTS */

const urlDatabase = {
  "b2xVn2": { longURL:"http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"}
};

const userDatabase = { 
  /* "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher"
  } */
}

/* FUNCTIONS */

//Checks for existing user
const existingUser = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
  return false;
};

//Creates a random string, used to create short URLs/userIDs
const generateRandomString = function() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz"
  let randomString = "";
  while (randomString.length < 6) {
    randomString = chars[Math.floor(Math.random() * chars.length)]
  }
  return randomString;
};


/* ROUTES */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

//HTML test code
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Retrieves URL index(response to /urls)
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});

//Route to new URLs
app.get("/urls/new", (req, res) => {
  let templateVars = { user: userDatabase[req.cookies["user_id"]] };
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls/new", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

//Retrieves urls
app.get("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/${shortURL}");
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];
  const shortURL = generatedRandomString();
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

//Retrieves short urls
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (req.cookies["user_id"] === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send(400, "Can only be deleted by User.")
  }
});

//Route to new URLs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/new", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

//LOGIN route
app.get("/login", (req, res) => {
  let templateVars = {
    user: userDatabase[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

    if (!existingUser(email)) {
    res.send(403, "User does not exist. Please try again.")
  } else {
    const userID = existingUser(email);
    if (!bcrypt.compareSync(password, userDatabase[userID].password)) {
      res.send(403, "The email address or password entered is incorrect. Please try again.")
    } else {
      res.cookie("user_id", userID);
      res.redirect("/urls")
    }
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//REGISTRATION
app.get("/registration", (req,res) => {
  let templateVars = { user: userDatabase[req.cookies["user_id"]] };
  res.render("urls_registration", templateVars);
});

app.post("/registration", (req, res) => {
  const regEmail = req.body.email;
  const regPassword = req.body.password;

  if (!regEmail || ! regPassword) {
    res.send(400, "Please include valid email and/or password.")
  }

  if (existingUser(regEmail)) {
    res.send(400, "Existing user. Please use a different email address.")
  } else {
    const newUserID = generateRandomString();
    userDatabase[newUserID] = {
      id: newUserID,
      email: regEmail,
      password: bcrypt.hashSync(regPassword, 10)
    }
    res.cookie('user_id', newUserID);
    res.redirect("/urls");
  }
});

//Removes deleted URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies["user_id"] === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send(400, "Can only be deleted by User.")
  }
});