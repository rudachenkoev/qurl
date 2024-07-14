const createJwtToken = 'INSERT INTO jwt_tokens (user_id, token) VALUES ($1, $2)'

export default {
  createJwtToken
}
