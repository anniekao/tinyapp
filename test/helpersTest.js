const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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