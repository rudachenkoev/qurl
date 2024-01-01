import { Schema, model } from 'mongoose'

interface IRegistrationRequest {
  email: string
}

const RegistrationRequestSchema = new Schema({
  email: {
    type: String,
    required: true
  }
}, { timestamps: true })

export const RegistrationRequestModel = model('RegistrationRequest', RegistrationRequestSchema)
export const createRegistrationRequest = (attr: IRegistrationRequest) => new RegistrationRequestModel(attr).save().then(item => item.toObject())
export const getRegistrationRequestByEmail = (email: string) => RegistrationRequestModel.findOne({ email })
export const getRegistrationRequestById = (id: string) => RegistrationRequestModel.findById(id)
export const deleteRegistrationRequestById = (id: string) => RegistrationRequestModel.findByIdAndDelete(id)
