const fs = require('fs');
const path = require('path');
const pg = require('pg');
const Sequelize = require('sequelize');

const logger = require('../lib/logger');
const configLoader = require('../lib/configLoader');

const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const config = configLoader(env);
const db = {};

pg.defaults.parseInt8 = true;

const sequelize = new Sequelize(config.db.url, {
  logging: logger.db.log,
  pool: config.db.pool,
  timezone: config.db.timezone,
});

fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  const model = db[modelName];
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
