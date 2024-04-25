const axios = require('axios');
const config = require('../config/config');
const { CustomError } = require('./error');
const { v4: uuidv4 } = require('uuid');

/**
 * A class to abstract away interactions with the service registry.
 * When initialising,
 *  - first create new Object Instance
 *  - then use .initialise()
 * Note: Initialisation must be done only once.
 *
 * This class must be singleton. so initialise it only once,
 * and when you want to use it later, use .getInstance() to
 * fetch the same initialised instance.
 *
 * Initialisation is done in index.js
 *
 * usable functions:
 * - getUrl: get the url of a service, given the service name.
 */
class ServiceRegistryClient {
  static instance = null;

  static getInstance() {
    if (!ServiceRegistryClient.instance) {
      throw new Error('ServiceRegistryClient used before initialization')
    }
    return ServiceRegistryClient.instance;
  }

  constructor() {
    if (!ServiceRegistryClient.instance) {
      this._baseUrl = config.SERVICE_REGISTRY_BASE_URI;
      this._heartbeatInterval = 5000; // 5 seconds (adjust as needed)
      this._heartbeatTimer = null;
      this._instanceId = null;

      ServiceRegistryClient.instance = this;
    }
    return ServiceRegistryClient.instance;
  }

  async initialise() {
    this._instanceId = uuidv4()
    this.#startHeartbeat()
  }

  async getUrl(serviceName) {
    try {
      const response = await axios.get(`${this._baseUrl}/discover/${serviceName}`);
      const url = `http://${response.data.host}:${response.data.port}`
      return url;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new CustomError(`Service ${serviceName} not found`, 500, true)
      }
      throw new Error(`Error discovering service: ${error.message}`);
    }
  }

  async #sendHeartbeat() {
    try {
      const body = {
        instanceId: this._instanceId,
        serviceName: config.SERVICE_NAME,
        host: config.SERVICE_HOST,
        port: config.PORT,
        metadata: {},
      }
      const response = await axios.post(`${this._baseUrl}/register`, body);
      return response.data;
    } catch (error) {
      throw new Error(`Error sending heartbeat: ${error.message}`);
    }
  }

  #startHeartbeat() {
    if (!this._heartbeatTimer) {
      this._heartbeatTimer = setInterval(async () => {
        try {
          await this.#sendHeartbeat();
        } catch (error) {
          console.error('Error sending heartbeat:', error.message);
        }
      }, this._heartbeatInterval);
    }
  }

  stopHeartbeat() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }
}

module.exports = ServiceRegistryClient;
