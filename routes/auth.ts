import { login } from '@controllers/auth'
import { confirmAuthChannel, getAuthChannel } from '@controllers/auth/channel'
import {
  confirmPasswordRecoveryRequest,
  createPasswordRecoveryRequest
} from '@controllers/auth/passwordRecoveryRequest'
import { confirmRegistrationRequest, createRegistrationRequest } from '@controllers/auth/registrationRequest'
import express from 'express'

const router = express.Router()

router.post('/registration-requests/', createRegistrationRequest)
router.post('/registration-requests/confirmation/', confirmRegistrationRequest)
router.post('/login/', login)
router.post('/password-recovery-requests/', createPasswordRecoveryRequest)
router.post('/password-recovery-requests/confirmation/', confirmPasswordRecoveryRequest)
router.get('/channel/', getAuthChannel)
router.post('/channel/confirmation/', confirmAuthChannel)

export default router
