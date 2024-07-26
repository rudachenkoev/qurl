import 'dotenv/config'
import 'module-alias/register'
import express from 'express'
import http from 'http'
import cors from 'cors'
import {json} from 'body-parser'
import router from './routes'

const app = express()

app.use(json())
app.use(cors())
app.use('/api/v1', router)

const port = process.env.PORT || 3000
const server = http.createServer(app)
server.listen(port, () => console.log(`Server running on http://localhost:${port}/`))
