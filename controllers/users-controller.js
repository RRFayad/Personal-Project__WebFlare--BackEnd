const { users } = require('../util/DUMMY_DATA');

const getUserById = (req, res, next) => {
  const userId = req.params.uid;
  const user = users.find(item => userId === item.id);

  if (!user) {
    const error = new Error('Could not find user');
    error.status = 404;
    return next(error);
  }
  return res.json(user);
};

const updateUserById = (req, res, next) => {
  const userId = req.params.uid;
  const { country, description, email, imageUrl, linkedinUrl, name } = req.body;
  const userIndex = users.findIndex(item => userId === item.id);

  if (userIndex === -1) {
    const error = new Error('Could not find user');
    error.status = 404;
    return next(error);
  }

  const newUserData = {
    ...users[userIndex],
    country,
    description,
    email,
    imageUrl,
    linkedinUrl,
    name,
  };

  users.splice(userIndex, 1, { ...newUserData });
  delete newUserData.password;
  return res.json(newUserData);
};

const updatePasswordById = (req, res, next) => {
  const userId = req.params.uid;
  const { password } = req.body;
  const userIndex = users.findIndex(item => userId === item.id);

  if (userIndex === -1) {
    const error = new Error('Could not find user');
    error.status = 404;
    return next(error);
  }

  const newUserData = {
    ...users[userIndex],
    password,
  };

  users.splice(userIndex, 1, { ...newUserData });
  delete newUserData.password;
  return res.json(newUserData);
};

exports.getUserById = getUserById;
exports.updateUserById = updateUserById;
exports.updatePasswordById = updatePasswordById;
