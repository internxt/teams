const nconf = require('nconf');

/**
 * Represents a configuration
 * @constructor
 */
const Config = function () {
  if (!(this instanceof Config)) {
    return new Config();
  }

  // Load environment variables in order below
  //   1. Command-line arguments
  //   2. Environment variables
  //   3. A file located at 'path/to/config.json'
  // Throw if required config is missing
  // eslint-disable-next-line global-require
  require('dotenv').config();
  nconf.argv();
  nconf.env();
  nconf.required(['NODE_ENV']);
  nconf.use('conf', {
    type: 'literal',
    // eslint-disable-next-line global-require
    store: require(`./environments/${nconf.get('NODE_ENV')}.js`).data,
  });
  nconf.required(['server:port']);

  this.nconf = nconf;

  return this;
};

/**
 * Wrapper for nconf get method
 * Returns config value for provided key
 * @param {String} key
 * @returns {String} value
 */
Config.prototype.get = function (key) {
  // return this._nconf.get(key)
  return this.nconf.get(key);
};

module.exports = Config;
