// Below code serves as an example , not for use in the project

const config = require('./config/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const CustomLogger = require('./utils/logger')
const { errorHandler, CustomError } = require('./utils/error')
const ServiceRegistryClient = require('./utils/serviceRegistry')

const mongoUrl = config.MONGODB_URI
const connection = mongoose.connection
mongoose.set('strictQuery', false)
mongoose.connect(mongoUrl, { useNewurlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.error('error connecting to MongoDB:', error.message)
  })

connection.once('open', () => {
  console.log('MongoDB Database connection Established Successfull')
})

// Initialise instance of CustomLogger singleton service.
CustomLogger.getInstance()

app.use('/', (req, res, next) => {
  CustomLogger
    .getInstance()
    .logHttpRequest(req, res);
  next();
})

app.use(cors())
app.use(express.json())

app.get('/api', async (req, res, next) => {
  try {
    // throw new CustomError('this endpoint shouldnt be accessed', 403)
    const uri = await ServiceRegistryClient
      .getInstance()
      .getUrl('template')
    console.log(uri)
    res
      .json({
        success: true,
        message: 'Hello',
      })
  } catch (e) {
    next(e)
  }
})

app.use('/api', errorHandler)

module.exports = app
