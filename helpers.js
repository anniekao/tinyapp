const getUserByEmail = (usersDb, email) => {
  for (let user in usersDb) {
    if (usersDb[user].email === email) {
      return usersDb[user];
    }
  }
};

module.exports = { getUserByEmail };