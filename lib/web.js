const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
const babelify = require('express-babelify-middleware');
const session = require('express-session');
const moment = require('moment');

const authentication = require('./authentication');
const logger = require('./logger');
const DataSource = require('./DataSource');
const routes = require('../routes');

module.exports = async (environment, context) => {
  const config = context.config;
  const db = context.db;
  const dataSource = new DataSource(config, db);

  const app = express();

  app.locals.moment = moment;

  // view engine setup
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'pug');

  app.use(morgan('dev', { stream: logger.stream }));
  app.use(sassMiddleware({
    src: path.join(__dirname, '..', 'public', 'stylesheets'),
    dest: path.join(__dirname, '..', 'public', 'stylesheets'),
    includePaths: [path.join(__dirname, '..', 'node_modules')],
    prefix: '/stylesheets',
    // outputStyle: 'compressed',
  }));
  app.use('/javascripts/app.js', babelify('public/javascripts/app.js'));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
  }));

  app.use((req, res, next) => {
    req.config = config;
    req.dataSource = dataSource;
    req.context = context;

    next();
  });

  authentication.configure(app, dataSource);

  routes.apply(app);

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
    logger.info(`Web server started at http://localhost:${config.web.port}`);
  });
};
