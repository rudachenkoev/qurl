import express from 'express'
import { registrationRequestVerification, sendRegistrationVerificationRequest } from '@controllers/auth/registrationRequest'
import { login } from '@controllers/auth'
import { passwordRecoveryRequestVerification, sendPasswordRecoveryRequest } from '@controllers/auth/passwordRecoveryRequest'

const router = express.Router()

router.post('/registration-requests/', sendRegistrationVerificationRequest)
router.post('/registration-requests/confirmation/', registrationRequestVerification)
router.post('/login/', login)
router.post('/password-recovery-requests/', sendPasswordRecoveryRequest)
router.post('/password-recovery-requests/confirmation/', passwordRecoveryRequestVerification)

export default router
