const express = require('express')
const { confirmRegistrationRequest, createRegistrationRequest } = require('../controllers/auth/registrationRequest')
const { confirmPasswordRecoveryRequest, createPasswordRecoveryRequest } = require('../controllers/auth/passwordRecoveryRequest')
const { login } = require('../controllers/auth')

const router = express.Router()

router.post('/registration-requests/', createRegistrationRequest)
router.post('/registration-requests/confirmation/', confirmRegistrationRequest)
router.post('/login/', login)
router.post('/password-recovery-requests/', createPasswordRecoveryRequest)
router.post('/password-recovery-requests/confirmation/', confirmPasswordRecoveryRequest)

module.exports = router
