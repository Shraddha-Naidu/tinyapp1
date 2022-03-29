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
  console.log("generating");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  console.log(`Random Strong: ${randomString}`);
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

