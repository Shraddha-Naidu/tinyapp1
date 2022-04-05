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
  keys: ["SHRAZ-0902", "Dinosaur"]
  //maxAge: 48 * 60 * 60 * 1000,
}));

/* OBJECTS */

const urlDatabase = {};

const userDatabase = {};

/* FUNCTIONS */

const { existingUser, generateRandomString, existingUserCookie, userURL } = require("./helpers");

/* ROUTES */

//LANDING PAGE --> redirects to urls if logged in, otherwise to login page
app.get("/", (req, res) => {
  if (!userDatabase[req.session.user_id]) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

//Retrieves URL index(response to /urls) for user
app.get("/urls", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id],
    urls: userURL(req.session.user_id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

//Adds new URL to database and redirects to shortURLs
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

//Route to new URLs for logged in users
app.get("/urls/new", (req, res) => {
  if (!existingUserCookie(req.session.user_id, userDatabase)) {
    res.redirect("/login");
  } else {
    let templateVars = { user: userDatabase[req.session.user_id] };
    res.render("urls_new", templateVars);
  }
});

//Retrieves short URLs for logged in user
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: userDatabase[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("The short URL trying to be accessed does not correspond with a long URL.");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(400).send("Can only be deleted by User.");
  }
});

//Provides access to actual link (long URL)
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL trying to be accessed does not correspond with a long URL.");
  }
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = userURL(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("URLs cannot be edited unless logged in.");
  }
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
  const userID = existingUser(email, userDatabase);

  if (!userID) {
    res.status(403).send("User does not exist. Please try again.");
  } else if (!bcryptjs.compareSync(password, userDatabase[userID].password)) {
    res.status(403).send("The email address or password entered is incorrect. Please try again.");
  } else {
      res.session.user_id = userID;
      res.redirect("/urls");
    }
  });

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//REGISTRATION
app.get("/registration", (req,res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id]
  };

  if (templateVars.user) {
    res.redirect("/urls");
  } else {
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
    const newUser = generateRandomString();
    userDatabase[newUser] = {
      id: newUser,
      email: regEmail,
      password: bcryptjs.hashSync(regPassword, 10)
    };
    req.session.user_id = newUser;
    res.redirect("/urls");
  }
});


app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.params.longURL;

  if (!userDatabase[req.session.user_id]) {
    res.status(400).send("Please login to access URLs.");
  } else if (userDatabase[req.session.user_id].id !== urlDatabase[shortURL].userID) {
    res.status(400).send("No access to given URL.");
  } else {
    // edits the longURL for the given ID
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  }
});


//Removes deleted URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = userURL(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("URLs cannot be deleted unless logged in.");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
