const getUserByEmail = 'SELECT * FROM users WHERE email = $1 LIMIT 1'

const getUserByEmailAndPassword = 'SELECT * FROM users WHERE email = $1 AND password = $2 LIMIT 1'

const createUser = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *'

const updateUserByEmail = 'UPDATE users SET password = $1 WHERE email = $2 RETURNING *'

export default {
  getUserByEmail,
  getUserByEmailAndPassword,
  updateUserByEmail,
  createUser
}
