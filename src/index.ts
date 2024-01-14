import express from 'express'
import 'dotenv/config'
import http from 'http'
import cors from 'cors'
import { json } from 'body-parser'
import routes from './routes'
import { setupDatabaseConnection } from '@config/db'

const app = express()

app.use(json())
app.use(cors())
app.use('/api/v1', routes)

setupDatabaseConnection()

const port = process.env.PORT
const server = http.createServer(app)
server.listen(port, () => console.log(`Server running on http://localhost:${port}/`))
