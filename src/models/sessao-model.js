
const users = [];


function registerUser(username, password) {
  users.push({ username, password });
}

function loginUser(username, password) {
  return users.find((user) => user.username === username && user.password === password);
}

module.exports = {
  registerUser,
  loginUser,
};