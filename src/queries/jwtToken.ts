const createJwtToken = 'INSERT INTO jwt_tokens (user_id, token) VALUES ($1, $2)'

const getJwtTokenByUser = 'SELECT * FROM jwt_tokens WHERE user_id = $1 LIMIT 1'

const updateJwtTokenByUser = 'UPDATE jwt_tokens SET token = $1 WHERE user_id = $2'

export default {
  createJwtToken,
  getJwtTokenByUser,
  updateJwtTokenByUser
}
