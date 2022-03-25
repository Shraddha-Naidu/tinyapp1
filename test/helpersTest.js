const { assert } = require('chai');

const { existingUser, generateRandomString } = require('../helpers.js');

const testUserDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher"
  }
};

const testUrlDatabase = {
   "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher"
  }
};

describe('existingUser', function() {
  it('should return a user with valid email if true', function() {
    const user = existingUser("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID)
  });

  it('should not return a user with valid email if false', function() {
    const user = existingUser("user@example.com", testUsers)
    const expectedUserID = false;
    assert.equal(user, expectedUserID)
  });
});

describe('generateRandomString', function() {
  it('should return a six character string', function() {
    const stringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(stringLength, expectedOutput)
  });

  it('should not return the same string when called multiple times', function() {
    const firstString = generateRandomString();
    const secondString = generateRandomString();
    assert.notEqual(firstString, secondString);
  });
});