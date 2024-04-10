const app = require('./src/app') // the actual Express application
const http = require('http')
const config = require('./src/config/config')
const ServiceRegistryClient = require('./src/utils/serviceRegistry')
const server = http.createServer(app)

const serviceRegistryClientInstance = new ServiceRegistryClient()
serviceRegistryClientInstance.initialise()

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})
