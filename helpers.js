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