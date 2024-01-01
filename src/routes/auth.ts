import express from 'express'
import { registrationRequestVerification, sendRegistrationVerificationRequest } from '@controllers/registrationRequest'
import { login } from '@controllers/auth'

const router = express.Router()

router.post('/registration-requests/', sendRegistrationVerificationRequest)
router.post('/registration-requests/confirmation/', registrationRequestVerification)
router.post('/login/', login)

export default router
