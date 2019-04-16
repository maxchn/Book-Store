const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
const db = require(path.resolve(path.normalize('.'), 'db'));
const md5 = require('md5');

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

var indexRouter = require('./routes/index');
var authorRouter = require('./routes/author');
var publisherRouter = require('./routes/publisher');
var categoryRouter = require('./routes/category');
var bookRouter = require('./routes/book');
var accountRouter = require('./routes/account');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'has87d6as8hd6d8ha6sda87',
  key: 'store.sid'
}));
app.use(fileUpload({
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  useTempFiles: true,
  tempFileDir: path.resolve(path.normalize('.'), 'tmp')
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    let user = await db.query('SELECT * FROM `user` WHERE `id`=?', [id]);

    if (user && user[0]) {
      done(null, user[0]);
    } else {
      done(Error('User Not Found!!!'), false);
    }
  } catch (err) {
    done(Error('User Not Found!!!'), false);
  }
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    let user = await db.query('SELECT * FROM `user` WHERE `username`=? AND `password`=?', [username, md5(password)]);

    if (user && user[0]) {
      return done(null, user[0]);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(null, false);
  }
}));

app.use('/', indexRouter);
app.use('/author', authorRouter);
app.use('/publisher', publisherRouter);
app.use('/category', categoryRouter);
app.use('/book', bookRouter);
app.use('/account', accountRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).render('404', {
    title: "404 - Page Not Found"
  });
  //next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;