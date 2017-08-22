const _ = require('lodash');
const dotenv = require('dotenv');

class ConfigExtractor {
  constructor(source) {
    this.source = source;
    this.missingKeys = [];
  }

  fetchRequired(keyPath) {
    if (_.has(this.source, keyPath)) {
      return _.get(this.source, keyPath);
    }
    this.missingKeys = _.concat(this.missingKeys, keyPath);
    return null;
  }

  fetch(keyPath, defaultValue) {
    if (_.has(this.source, keyPath)) {
      return _.get(this.source, keyPath);
    }
    return defaultValue;
  }

  isValid() {
    return _.isEmpty(this.missingKeys);
  }
}

module.exports = (environment) => {
  if (environment !== 'production') {
    dotenv.load();
  }

  const extractor = new ConfigExtractor(process.env);

  const config = ({
    web: {
      port: extractor.fetch('PORT', 3000),
    },
    tcp: {
      port: extractor.fetch('TCP_PORT', 8124),
    },
    db: {
      url: extractor.fetchRequired('DATABASE_URL'),
    },
    session: {
      secret: extractor.fetchRequired('SESSION_SECRET'),
      path: extractor.fetchRequired('SESSION_PATH'),
      passwordSalt: extractor.fetchRequired('PASSWORD_SALT'),
    },
  });

  if (extractor.isValid()) {
    return config;
  }

  const missingVariables = _.join(extractor.missingKeys, ', ');
  throw new Error(`Config is not valid. Required variables are missing: ${missingVariables}`);
};
