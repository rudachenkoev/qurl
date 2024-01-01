import { connect } from 'mongoose'

const dbUrl = process.env.MONGO_DATABASE_URL

export const setupDatabaseConnection = () => connect(dbUrl).then(() => console.log('Connected to database'))
