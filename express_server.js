const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcryptjs = require("bcryptjs");

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: "SHRAZ-0902",
  maxAge: 48 * 60 * 60 * 1000,
}));

/* OBJECTS */

const urlDatabase = {};

const userDatabase = {};

/* FUNCTIONS */

const { existingUser, generateRandomString } = require("./helpers");

/* ROUTES */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//LANDING PAGE
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});


//Retrieves URL index(response to /urls) for user
app.get("/urls", (req, res) => {
  let templateVars = {
    userUrls: urlDatabase,
    user: userDatabase[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

//Route to new URLs
app.get("/urls/new", (req, res) => {
  let templateVars = { user: userDatabase[req.session.user_id] };
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
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
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

//Retrieves short urls
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: userDatabase[req.session.user_id]
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
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(400).send("Can only be deleted by User.");
  }
});


app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

//LOGIN route
app.get("/login", (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!existingUser(email)) {
    res.status(403).send("User does not exist. Please try again.");
  } else {
    const userID = existingUser(email);
    if (!bcrypt.compareSync(password, userDatabase[userID].password)) {
      res.status(403).send("The email address or password entered is incorrect. Please try again.");
    } else {
      res.session.user_id =  userID;
      res.redirect("/urls");
    }
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//REGISTRATION
app.get("/registration", (req,res) => {
  let templateVars = { user: userDatabase[req.session.user_id] };
  res.render("urls_registration", templateVars);
});

app.post("/registration", (req, res) => {
  const regEmail = req.body.email;
  const regPassword = req.body.password;

  if (!regEmail || ! regPassword) {
    res.status(400).send("Please include valid email and/or password.");
  }

  if (existingUser(regEmail)) {
    res.status(400).send("Existing user. Please use a different email address.");
  } else {
    const newUserID = generateRandomString();
    userDatabase[newUserID] = {
      id: newUserID,
      email: regEmail,
      password: bcrypt.hashSync(regPassword, 10)
    };
    resq.sesion.user_id = newUserID;
    res.redirect("/urls");
  }
});

//Removes deleted URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session["user_id"] === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(400).send("Can only be deleted by User.");
  }
});