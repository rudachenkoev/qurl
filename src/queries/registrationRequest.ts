const getRegistrationRequestByEmail = 'SELECT * FROM registration_requests WHERE email = $1 LIMIT 1'

const deleteRegistrationRequestById = 'DELETE FROM registration_requests WHERE id = $1'

const createRegistrationRequest = 'INSERT INTO registration_requests (email, verification_code) VALUES ($1, $2)'

const truncateRegistrationRequest = 'TRUNCATE TABLE registration_requests'

export default {
  getRegistrationRequestByEmail,
  createRegistrationRequest,
  truncateRegistrationRequest,
  deleteRegistrationRequestById
}
