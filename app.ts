import express from 'express'
import 'dotenv/config'
import http from 'http'
import cors from 'cors'
import { json } from 'body-parser'
import routes from './routes'
import { sequelize } from './models'

const app = express()

app.use(json())
app.use(cors())
app.use('/api/v1', routes)

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

  const port = process.env.PORT
  const server = http.createServer(app)
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`))
})()
