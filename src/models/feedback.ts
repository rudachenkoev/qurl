import { Schema, model } from 'mongoose'
enum FeedbackCategories  {
  Error = 'error',
  Appeal = 'appeal',
  PromotionsAndOffers = 'promotions_and_offers'
}
interface IFeedback {
  category: FeedbackCategories,
  text?: string,
  email?: string
}

const FeedbackSchema = new Schema({
  category: {
    type: String,
    enum: ['error', 'appeal', 'promotions_and_offers'],
    required: true
  },
  text: {
    type: String,
    default: '',
    required: function() {
      return ['error', 'appeal'].includes(this.category)
    }
  },
  email: {
    type: String,
    default: '',
    required: function() {
      return this.category === 'promotions_and_offers'
    }
  }
}, { timestamps: true })

export const FeedbackModel = model('Feedback', FeedbackSchema)
export const getFeedbacks = () => FeedbackModel.find()
export const getFeedbackById = (id: string) => FeedbackModel.findById(id)
export const createFeedback = (attr: IFeedback) => new FeedbackModel(attr).save().then(item => item.toObject())
