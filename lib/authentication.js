const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports = {
  configure(app, dataSource) {
    app.use(passport.initialize());
    app.use(passport.session());

    // passport config
    passport.use(new LocalStrategy((username, password, done) => {
      const user = dataSource.authUser(username, password);
      done(null, user);
    }));

    passport.serializeUser((user, done) => {
      done(null, user.$loki);
    });

    passport.deserializeUser((id, done) => {
      const user = dataSource.getUser(id);
      done(null, user);
    });

    // routes for login / logout
    app.get('/login', (req, res) => {
      res.render('home/index');
    });

    app.post('/login', (req, res, next) => {
      passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
          return res.render('home/index', { error: (info ? info.message : 'Invalid credentials') });
        }
        return req.logIn(user, (loginErr) => {
          if (loginErr) { return next(loginErr); }
          return res.redirect(`/users/${user.$loki}`);
        });
      })(req, res, next);
    });

    app.get('/logout', (req, res) => {
      req.logout();
      res.redirect('/login');
    });

    // System for access control
    // For every request other then whitelisted
    const skipAuth = [
      '/login',
    ];
    app.use((req, res, next) => {
      if (!req.user && !skipAuth.includes(req.path)) {
        console.log(`Unauthorized request: ${req.path}`);
        res.redirect('/login');
      } else {
        res.locals.user = req.user;
        next();
      }
    });
  },
};