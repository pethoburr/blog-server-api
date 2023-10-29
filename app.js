/* eslint-disable no-unused-vars */
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
var indexRouter = require('./routes/index');
const mongoose = require('mongoose');
const { mainModule } = require('process');
require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const session = require('express-session');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
// const MongoDBStore = require('connect-mongodb-session')(session);

var app = express();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
}

main().catch((err) => console.log(err));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
      // passwords do not match!
      return done(null, false, { message: "Incorrect password" })
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET
}, async function (jwtPayload, done) {
  try {
    const user = await User.findById(jwtPayload.id);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}))

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
// try {
//   const user = await User.findById(id);
//   done(null, user);
// } catch(err) {
//   done(err);
// };
// });

// const store = new MongoDBStore({
//   uri: process.env.MONGODB_URI, collection: 'mySessions'
// })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cors());
app.use(cookieParser());
//app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
// app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

// app.use((req, res, next) => {
//   res.locals.currentUser = req.user;
//   next();
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;