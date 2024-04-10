const axios = require('axios');
const config = require('../config/config');
const { CustomError } = require('./error');

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

      ServiceRegistryClient.instance = this;
    }
    return ServiceRegistryClient.instance;
  }

  async initialise() {
    await this.#registerService(config.SERVICE_NAME, config.SERVICE_HOST, config.PORT)
    this.#startHeartbeat()
  }

  async #registerService(serviceName, host, port, metadata = {}) {
    try {
      const body = {
        serviceName,
        host,
        port,
        metadata,
      }
      const response = await axios.post(`${this._baseUrl}/register`, body);
      return response.data;
    } catch (error) {
      throw new Error(`Error registering service: ${error.message}`);
    }
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
      const response = await axios.post(`${this._baseUrl}/heartbeat/${config.SERVICE_NAME}`);
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
