import { Schema, model } from 'mongoose'
import { authentication } from '@helpers/auth'
enum Languages {
  English = 'en',
  German = 'de',
  French = 'fr',
  Spanish = 'es',
  Italian = 'it'
}

export interface IUser {
  email: string,
  lastName?: string,
  firstName?: string,
  language?: Languages,
  isActive?: boolean,
  isActivePromotionsAndOffers?: boolean,
  authentication: {
    password: string,
    sessionToken?: string
  }
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  lastName: { type: String, default: '' },
  firstName: { type: String, default: '' },
  language: { type: String, default: 'en', enum: ['en', 'de', 'fr', 'es', 'it'] },
  isActive: { type: Boolean, default: true },
  isActivePromotionsAndOffers: { type: Boolean, default: true },
  authentication: {
    password: { type: String, required: true, select: false },
    sessionToken: { type: String, default: '', select: false }
  }
}, { timestamps: true })

export const UserModel = model('User', UserSchema)
export const getUserByEmail = (email: string) => UserModel.findOne({ email })
export const getUserByCredits = ({ email, password }: { email: string, password: string }) =>
  UserModel.findOne({ email, 'authentication.password': authentication(password) })
export const createUser = (attr: IUser) => new UserModel(attr).save().then(item => item.toObject())
