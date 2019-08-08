const { assert } = require('chai');

const { getUserByEmail, checkURL, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrls = {
  lksjflk: {
    shortURL: "ldkjfjs",
    userID: "user2RandomID"
  },
  kdksls: {
    shortURL: "dkkslf",
    userID: "userRandomID"
  },
  ldksjj: {
    shortURL: "kfjslk",
    userID: "user2RandomID"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";

    assert.equal(user.id, expectedOutput);
  });

  it('should return a user object when provided with an exisiting email in the database', () => {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = testUsers.userRandomID;

    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined when not provided with an email', () => {
    const user = getUserByEmail(testUsers, "");

    assert.equal(user, undefined);
  });

  it('should return undefined if passed an email that is not in the database', () => {
    const user = getUserByEmail(testUsers, 'joebob@hicksvilleUSA.com');

    assert.equal(user, undefined);
  });
});

describe("checkURL", () => {
  it('should return an URL beginning only with www with http:// appended to it', () => {
    const url = "www.google.com";
    const expectedOutput = "http://www.google.com";

    assert.equal(checkURL(url), expectedOutput);
  });

  it('should return the original URL if it already begins with http://', () => {
    const url = "http://www.google.com";
    
    assert.equal(checkURL(url), url);
  });
  
  it('should return undefined if no url is passed as an argument', () => {
    assert.equal(checkURL(""), undefined);
  });
});

describe("generateRandomString", () => {
  it('should return a string', () => {
    assert.equal(typeof generateRandomString(), 'string');
  });

  it('should have a length of 6', () => {
    assert.equal(generateRandomString().length, 6);
  });
});

describe("urlsForUser", () => {
  it('should return an object', () => {
    assert.equal(typeof urlsForUser(testUrls, 'user2RandomID'), 'object');
  });

  it('should return the correct number of corresponding objects', () => {
    const keys = Object.keys(urlsForUser(testUrls, "user2RandomID"));
    assert.equal(keys.length, 2);
  });

  it('should return an empty object if no userID is passed as an argument', () => {
    assert.deepEqual(urlsForUser(testUrls), {});
  });
});