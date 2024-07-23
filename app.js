require('dotenv').config()
require('module-alias/register')

const express = require('express')
const http = require('http')
const cors = require('cors')
const { json }  = require('body-parser')
const router = require('./routes')
const { sequelize } = require('./models')

const app = express()

app.use(json())
app.use(cors())
app.use((req, res, next) => {
  // Middleware for language recording
  req.language = req.get('Accept-Language') || 'en'
  next()
});
app.use('/api/v1', router)

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')
    // await sequelize.sync({ force: true })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}
(async () => {
  await connectToDatabase()

  const port = process.env.PORT || 3000
  const server = http.createServer(app)
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`))
})()
