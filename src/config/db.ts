import mongoose from 'mongoose'

const dbUrl = process.env.MONGO_DATABASE_URL

export const setupDatabaseConnection = () => mongoose.connect(dbUrl).then(() => console.log('Connected to database'))

export const dropCollection = (collectionName: string) => mongoose.connection.db.dropCollection(collectionName)
