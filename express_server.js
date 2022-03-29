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

const { existingUser, generateRandomString, existingUserCookie, userURL } = require("./helpers");

/* ROUTES */

//LANDING PAGE
app.get("/", (req, res) => {
  if (existingUserCookie(req.session.user_id)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});

//Retrieves URL index(response to /urls) for user
app.get("/urls", (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id],
    urls: userURL(req.session.user_id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("Please create account or login to access.");
  }
});

//Route to new URLs
app.get("/urls/new", (req, res) => {
  if (!existingUserCookie(req.session.user_id, userDatabase)){
    res.redirect("/login");
  } else {
    let templateVars = { user: userDatabase[req.session.user_id] };
  }
    res.render("urls_new", templateVars);
  });

//Retrieves short url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_show", templateVars);
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

//Provides access to actual link
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

//LOGIN route
app.get("/login", (req, res) => {
  if (existingUserCookie(req.session.user_id, userDatabase)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: userDatabase[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!existingUser(email)) {
    res.status(403).send("User does not exist. Please try again.");
  } else {
    const userID = existingUser(email);
    if (!bcryptjs.compareSync(password, userDatabase[userID].password)) {
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
  if (existingUserCookie(req.session.user_id, userDatabase)) {
  res.redirect("/urls");
  } else {
  let templateVars = { user: userDatabase[req.session.user_id]};
    res.render("urls_registration", templateVars);
  }
});

app.post("/registration", (req, res) => {
  const regEmail = req.body.email;
  const regPassword = req.body.password;

  if (!regEmail || !regPassword) {
    res.status(400).send("Please include valid email and/or password.");
  } else if (existingUser(regEmail, userDatabase)) {
    res.status(400).send("Existing user. Please use a different email address.");
  } else {
    const newUserID = generateRandomString();
    userDatabase[newUserID] = {
      id: newUserID,
      email: regEmail,
      password: bcryptjs.hashSync(regPassword, 10)
    };
    req.session.user_id = newUserID;
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
