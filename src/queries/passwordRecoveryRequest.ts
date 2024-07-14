const getPasswordRecoveryRequestByEmail = 'SELECT * FROM password_recovery_requests WHERE email = $1 LIMIT 1'

const deletePasswordRecoveryRequestById = 'DELETE FROM password_recovery_requests WHERE id = $1'

const createPasswordRecoveryRequest = 'INSERT INTO password_recovery_requests (email, verification_code) VALUES ($1, $2)'

const truncatePasswordRecoveryRequest = 'TRUNCATE TABLE password_recovery_requests'

export default {
  getPasswordRecoveryRequestByEmail,
  deletePasswordRecoveryRequestById,
  createPasswordRecoveryRequest,
  truncatePasswordRecoveryRequest
}
