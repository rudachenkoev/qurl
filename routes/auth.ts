import express from 'express'
import { confirmRegistrationRequest, createRegistrationRequest } from '@controllers/auth/registrationRequest'
import { login } from '@controllers/auth'
import { confirmPasswordRecoveryRequest, createPasswordRecoveryRequest } from '@controllers/auth/passwordRecoveryRequest'

const router = express.Router()

router.post('/registration-requests/', createRegistrationRequest)
router.post('/registration-requests/confirmation/', confirmRegistrationRequest)
router.post('/login/', login)
router.post('/password-recovery-requests/', createPasswordRecoveryRequest)
router.post('/password-recovery-requests/confirmation/', confirmPasswordRecoveryRequest)

export default router
