const Sequelize = require('sequelize');
require('sequelize-hierarchy')(Sequelize);

module.exports = (config, Logger) => {
  const instance = new Sequelize(config.name, config.user, config.password, {
    host: config.host,
    dialect: 'mysql',
    operatorsAliases: 0,
    // logging: Logger.sql,
    logging: console.log,
    logging: function (str) {
      // do your own logging
    }
  });

  instance
    .authenticate()
    .then(() => Logger.info('Connected to database'))
    .catch((err) => Logger.error(err));

  return {
    instance,
    Sequelize,
  };
};
