const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const lessMiddleware = require('less-middleware');

const logger = require('./logger');
const configLoader = require('./configLoader');
const dbLoader = require('./dbLoader');
const DataSource = require('./DataSource');
const seeds = require('./seeds');

const index = require('../routes/index');
const users = require('../routes/users');

module.exports = async (environment) => {
  const config = configLoader(environment);
  const db = await dbLoader(config.db.url);
  const dataSource = new DataSource(config, db);

  if (environment !== 'production' && dataSource.getUsers().length === 0) {
    seeds(dataSource);
  }

  const app = express();

  // view engine setup
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'pug');

  app.use(morgan('dev', { stream: logger.stream }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(lessMiddleware(path.join(__dirname, '..', 'public')));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use((req, res, next) => {
    req.config = config;
    req.dataSource = dataSource;

    next();
  });

  app.use('/', index);
  app.use('/users', users);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  app.listen(config.web.port, () => {
    logger.info(`Server started at http://localhost:${config.web.port}`);
  });
};
