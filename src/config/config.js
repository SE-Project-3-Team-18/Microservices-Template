require('dotenv')
  .config()

const PORT = process.env.PORT
const SERVICE_NAME = process.env.SERVICE_NAME
const SERVICE_HOST = process.env.SERVICE_HOST

const MONGODB_URI = process.env.ATLAS_URI

const SERVICE_REGISTRY_BASE_URI = 'http://localhost:3001'

module.exports = {
  PORT,
  SERVICE_NAME,
  SERVICE_HOST,
  MONGODB_URI,
  SERVICE_REGISTRY_BASE_URI,
}
