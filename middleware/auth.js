const jwt = require('jsonwebtoken')

const isAuthenticated = (req, res, next) => {
  const authHeader = req.get('Authorization')
  const token = authHeader?.split(' ')[1]

  if (!token) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403)
    req.userId = decoded.id
    next()
  })
}

module.exports = {
  isAuthenticated
}
