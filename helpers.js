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
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
  let randomString = "";
  while (randomString.length < 6) {
    randomString = chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
};

//Checks existing user with corresponding cookie
const existingUserCookie = function(cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      return userDatabase[user].id;
    }
  }
  return false;
}

//Returns shortURLs specific to user
const userURL = function(ID, urlDatabase) {
  const assignedURLS = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === ID) {
      assignedURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  return assignedURLS;
};

module.exports = {
  generateRandomString,
  existingUser,
  existingUserCookie,
  userURL
};

