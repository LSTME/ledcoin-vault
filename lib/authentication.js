const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports = {
  configure(app, dataSource) {
    app.use(passport.initialize());
    app.use(passport.session());

    // passport config
    passport.use(new LocalStrategy((username, password, done) => {
      dataSource.authUser(username, password).then((user) => {
        if (user) {
          done(null, user.toJSON());
          return;
        }
        done(null, null);
      });
    }));

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
      dataSource.getUser(id)
        .then((user) => {
          if (user) {
            done(null, user);
            return;
          }
          done(null, null);
        });
    });

    // routes for login / logout
    app.get('/login', (req, res) => {
      if (req.user) {
        res.redirect('/me');
      } else {
        res.render('auth/login');
      }
    });

    app.post('/login', (req, res, next) => {
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.render('auth/login', { error: (info ? info.message : 'Invalid credentials') });
        }
        return req.logIn(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          return res.redirect('/me');
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
      '/dashboard',
    ];
    const nonAdminRoutes = [
      '/',
      '/me',
    ];
    app.use((req, res, next) => {
      const currentUser = req.user;
      res.locals.currentUser = currentUser;

      // Skip all authentication if path is in skipAuth
      if (skipAuth.includes(req.path)) {
        next();
        return;
      }

      // For all other routes, user have to be authenticated
      if (currentUser) {
        // For anything other then nonAdminRoutes, user have to be admin
        if (currentUser.admin || nonAdminRoutes.includes(req.path)) {
          next();
        } else {
          res.status(404)
            .render('error', { message: 'Page not found', error: { status: 'Error' } });
        }
      } else {
        // Redirect to login if current user does not exist
        console.log(`Unauthorized request: ${req.path}`);
        res.redirect('/login');
      }
    });
  },
};
