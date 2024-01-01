import { Schema, model } from 'mongoose'

interface IPasswordRecoveryRequest {
  email: string
}

const PasswordRecoveryRequestSchema = new Schema({
  email: {
    type: String,
    required: true
  }
}, { timestamps: true })

export const PasswordRecoveryRequestModel = model('PasswordRecoveryRequest', PasswordRecoveryRequestSchema)
export const createPasswordRecoveryRequest = (attr: IPasswordRecoveryRequest) => new PasswordRecoveryRequestModel(attr).save().then(item => item.toObject())
export const getPasswordRecoveryRequestByEmail = (email: string) => PasswordRecoveryRequestModel.findOne({ email })
export const getPasswordRecoveryRequestById = (id: string) => PasswordRecoveryRequestModel.findById(id)
export const deletePasswordRecoveryRequestById = (id: string) => PasswordRecoveryRequestModel.findByIdAndDelete(id)
