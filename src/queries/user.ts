const getUserByEmail = 'SELECT * FROM users WHERE email = $1 LIMIT 1'

const createUser = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *'

export default {
  getUserByEmail,
  createUser
}
