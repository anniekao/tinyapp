<!--HELPER FUNCTIONS --> 

const checkURL = (url) => {
  let splitURL = url.split("//");

  // Returns undefined if url is empty, other appends http:// to the url
  if (url === "") {
    return undefined;
  } else if (splitURL.length === 1) {
    return "http://" + splitURL[0];
  } else {
    return url;
  }
};


// Returns a user object according to the associated object found in the database
const getUserByEmail = (usersDb, email) => {
  for (let user in usersDb) {
    if (usersDb[user].email === email) {
      return usersDb[user];
    }
  }
};

const generateRandomString = () => {
  const ALPHA = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(
    ""
  );
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += ALPHA[Math.floor(Math.random() * ALPHA.length)];
  }
  return result;
};

const urlsForUser = (urlsDatabase, id) => {
  const result = {};
  for (let url in urlsDatabase) {
    if (urlsDatabase[url].userID === id) {
      result[url] = urlsDatabase[url];
    }
  }
  return result;
};


module.exports = { getUserByEmail, generateRandomString, urlsForUser, checkURL };